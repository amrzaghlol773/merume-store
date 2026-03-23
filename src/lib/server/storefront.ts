import { OrderStatus, Prisma } from "@prisma/client";
import { readFile } from "node:fs/promises";
import path from "node:path";

import { prisma } from "@/lib/prisma";
import { SHIPPING_RATES } from "@/lib/server/shipping";

export type PublicProduct = {
  id: number;
  name: string;
  slug: string;
  category: string;
  description: string;
  images: Array<{ url: string; alt: string; isPrimary: boolean }>;
  variants: Array<{ label: string; price: number; isDefault: boolean }>;
  reviewSummary: { averageRating: number; totalReviews: number };
  reviews: Array<{
    id: number;
    rating: number;
    comment: string;
    customerName: string;
    createdAt: string;
    images: string[];
  }>;
};

export type CheckoutInput = {
  fullName: string;
  phone: string;
  email?: string;
  streetAddress: string;
  governorate: string;
  deliveryNotes?: string;
  items: Array<{
    productId: number;
    variantLabel?: string;
    quantity: number;
  }>;
};

const WHATSAPP_NUMBER = "201098208357";

const publicProductInclude = {
  category: true,
  images: true,
  variants: true,
  reviews: {
    where: {
      status: "APPROVED",
    },
    include: {
      images: true,
    },
    orderBy: {
      createdAt: "desc",
    },
    take: 8,
  },
} as const;

type ProductWithPublicData = Prisma.ProductGetPayload<{
  include: typeof publicProductInclude;
}>;

type FallbackTemplateProduct = {
  category: string;
  name: string;
  slug: string;
  description: string;
  primaryImage: string;
  galleryImages?: string[];
  variants?: Array<{ label: string; price: number; isDefault?: boolean }>;
};

export function normalizeGovernorateKey(rawValue: string) {
  return String(rawValue || "")
    .trim()
    .replace(/[\s/-]+/g, "_")
    .replace(/_+/g, "_");
}

function productToPublic(product: ProductWithPublicData): PublicProduct {
  const totalReviews = product.reviews.length;
  const averageRating = totalReviews
    ? product.reviews.reduce((sum, review) => sum + review.rating, 0) / totalReviews
    : 0;

  return {
    id: product.id,
    name: product.name,
    slug: product.slug,
    category: product.category.name,
    description: product.description,
    images: product.images
      .sort((a, b) => a.sortOrder - b.sortOrder)
      .map((image) => ({ url: image.url, alt: image.alt, isPrimary: image.isPrimary })),
    variants: product.variants.map((variant) => ({
      label: variant.label,
      price: variant.price,
      isDefault: variant.isDefault,
    })),
    reviewSummary: {
      averageRating: Number(averageRating.toFixed(1)),
      totalReviews,
    },
    reviews: product.reviews.map((review) => ({
      id: review.id,
      rating: review.rating,
      comment: review.comment,
      customerName: review.customerName,
      createdAt: review.createdAt.toISOString(),
      images: review.images.sort((a, b) => a.sortOrder - b.sortOrder).map((image) => image.url),
    })),
  };
}

function wait(ms: number) {
  return new Promise<void>((resolve) => {
    setTimeout(resolve, ms);
  });
}

async function loadFallbackProductsFromTemplate(): Promise<PublicProduct[]> {
  const templatePath = path.join(process.cwd(), "data", "products.template.json");
  const fileContent = await readFile(templatePath, "utf8");
  const rows = JSON.parse(fileContent) as FallbackTemplateProduct[];

  return rows.map((row, index) => {
    const galleryImages = (row.galleryImages || []).filter(Boolean);
    const images = [row.primaryImage, ...galleryImages].filter(Boolean);
    const variants = (row.variants || []).filter((variant) => Number.isFinite(Number(variant.price)));
    const hasDefault = variants.some((variant) => Boolean(variant.isDefault));

    return {
      id: -(index + 1),
      name: row.name,
      slug: row.slug,
      category: row.category,
      description: row.description,
      images: images.map((url, imageIndex) => ({
        url,
        alt: `${row.name} image ${imageIndex + 1}`,
        isPrimary: imageIndex === 0,
      })),
      variants: variants.map((variant, variantIndex) => ({
        label: variant.label,
        price: Number(variant.price),
        isDefault: hasDefault ? Boolean(variant.isDefault) : variantIndex === 0,
      })),
      reviewSummary: {
        averageRating: 0,
        totalReviews: 0,
      },
      reviews: [],
    };
  });
}

export async function getPublicProducts() {
  const attempts = 3;
  let lastError: unknown;

  for (let attempt = 1; attempt <= attempts; attempt += 1) {
    try {
      const products = await prisma.product.findMany({
        include: publicProductInclude,
        orderBy: {
          id: "asc",
        },
      });

      return products.map(productToPublic);
    } catch (error) {
      lastError = error;
      if (attempt < attempts) {
        await wait(250 * attempt);
      }
    }
  }

  console.error("getPublicProducts failed after retries, using template fallback", lastError);
  return loadFallbackProductsFromTemplate();
}

export async function createOrder(input: CheckoutInput) {
  if (!input.items?.length) {
    throw new Error("Cart is empty");
  }

  const governorateKey = normalizeGovernorateKey(input.governorate);
  const shippingFee = SHIPPING_RATES[governorateKey] ?? 0;

  const products = await prisma.product.findMany({
    where: {
      id: {
        in: input.items.map((item) => item.productId),
      },
    },
    include: {
      variants: true,
    },
  });

  const productMap = new Map(products.map((product) => [product.id, product]));

  const computedItems = input.items.map((item) => {
    const product = productMap.get(item.productId);
    if (!product) {
      throw new Error(`Product ${item.productId} not found`);
    }

    const quantity = Math.max(1, Number(item.quantity) || 1);
    const normalizedLabel = item.variantLabel?.trim();
    const variant = normalizedLabel
      ? product.variants.find((entry) => entry.label === normalizedLabel)
      : product.variants.find((entry) => entry.isDefault) || product.variants[0];

    const unitPrice = variant?.price ?? 0;
    const lineTotal = unitPrice * quantity;

    return {
      product,
      variantLabel: variant?.label,
      unitPrice,
      quantity,
      lineTotal,
    };
  });

  const subtotal = computedItems.reduce((sum, item) => sum + item.lineTotal, 0);
  const total = subtotal + shippingFee;

  const customer = await prisma.customer.upsert({
    where: {
      phone_fullName: {
        phone: input.phone.trim(),
        fullName: input.fullName.trim(),
      },
    },
    create: {
      fullName: input.fullName.trim(),
      phone: input.phone.trim(),
      email: input.email?.trim() || null,
    },
    update: {
      email: input.email?.trim() || null,
    },
  });

  const whatsappMessage = [
    "Hello Merume, I want to place an order:",
    "",
    "Items:",
    ...computedItems.map((item) => {
      const sizeLabel = item.variantLabel ? ` ${item.variantLabel}` : "";
      return `- ${item.product.name}${sizeLabel} x${item.quantity} = ${item.lineTotal} EGP`;
    }),
    "",
    `Governorate: ${input.governorate}`,
    `Shipping Fee: ${shippingFee} EGP`,
    `Subtotal: ${subtotal} EGP`,
    `Final Total: ${total} EGP`,
    "",
    "Customer Details:",
    `Full Name: ${input.fullName.trim()}`,
    `Phone Number: ${input.phone.trim()}`,
    `Delivery Address: ${input.streetAddress.trim()}`,
    ...(input.deliveryNotes?.trim() ? [`Delivery Notes: ${input.deliveryNotes.trim()}`] : []),
  ].join("\n");

  const order = await prisma.order.create({
    data: {
      customerId: customer.id,
      status: OrderStatus.NEW,
      governorate: input.governorate,
      streetAddress: input.streetAddress.trim(),
      subtotal,
      shippingFee,
      total,
      whatsappMessage,
      items: {
        create: computedItems.map((item) => ({
          productId: item.product.id,
          variantLabel: item.variantLabel,
          unitPrice: item.unitPrice,
          quantity: item.quantity,
          lineTotal: item.lineTotal,
        })),
      },
    },
    include: {
      items: {
        include: {
          product: true,
        },
      },
      customer: true,
    },
  });

  const whatsappUrl = `https://wa.me/${WHATSAPP_NUMBER}?text=${encodeURIComponent(whatsappMessage)}`;

  return {
    order,
    whatsappUrl,
  };
}
