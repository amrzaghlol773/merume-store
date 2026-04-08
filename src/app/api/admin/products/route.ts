import { NextResponse } from "next/server";
import { Prisma } from "@prisma/client";

import { prisma } from "@/lib/prisma";
import {
  deleteCloudinaryImagesByUrls,
  isBase64Image,
  uploadImageToCloudinary,
} from "@/lib/server/cloudinary";

type ProductPayload = {
  name?: string;
  slug?: string;
  description?: string;
  categoryId?: number;
  primaryImage?: string;
  galleryImages?: string[];
  variants?: Array<{ label: string; price: number; isDefault?: boolean }>;
};

function normalizeImageUrl(rawUrl: string) {
  const value = String(rawUrl || "").trim().replace(/\\/g, "/");
  if (!value) {
    return "";
  }

  if (/^https?:\/\//i.test(value)) {
    return value;
  }

  return "";
}

async function resolveImageInput(rawUrl: string, uploadedInRequest: string[]) {
  const value = String(rawUrl || "").trim();
  if (!value) {
    return "";
  }

  if (isBase64Image(value)) {
    const uploadedUrl = await uploadImageToCloudinary(value, "merume/products");
    uploadedInRequest.push(uploadedUrl);
    return uploadedUrl;
  }

  return normalizeImageUrl(value);
}

function toSlug(value: string) {
  return value
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9\s-]/g, "")
    .replace(/\s+/g, "-")
    .replace(/-+/g, "-");
}

async function resolveUniqueSlug(baseSlug: string, ignoreProductId?: number) {
  const base = toSlug(baseSlug) || `product-${Date.now()}`;
  let candidate = base;
  let index = 1;

  // Rare operation, simple loop is fine for admin CRUD.
  while (true) {
    const existing = await prisma.product.findUnique({ where: { slug: candidate } });
    if (!existing || existing.id === ignoreProductId) {
      return candidate;
    }
    candidate = `${base}-${index}`;
    index += 1;
  }
}

export async function GET() {
  try {
    const [products, categories] = await Promise.all([
      prisma.product.findMany({
        include: {
          category: true,
          variants: {
            orderBy: { id: "asc" },
          },
          images: {
            orderBy: { sortOrder: "asc" },
          },
        },
        orderBy: {
          id: "asc",
        },
      }),
      prisma.category.findMany({
        orderBy: { name: "asc" },
      }),
    ]);

    return NextResponse.json({ products, categories });
  } catch (error) {
    console.error("GET /api/admin/products failed", error);
    return NextResponse.json({ error: "Failed to load products" }, { status: 500 });
  }
}

export async function POST(request: Request) {
  const uploadedInRequest: string[] = [];

  try {
    const body = (await request.json()) as ProductPayload;

    const name = body.name?.trim() || "";
    const description = body.description?.trim() || "";
    const categoryId = Number(body.categoryId);
    const rawPrimaryImage = String(body.primaryImage || "").trim();
    const rawGalleryImages = (body.galleryImages || []).map((url) => String(url || "").trim()).filter(Boolean);
    const variants = (body.variants || [])
      .map((variant) => ({
        label: variant.label?.trim(),
        price: Number(variant.price),
        isDefault: Boolean(variant.isDefault),
      }))
      .filter((variant) => variant.label && Number.isFinite(variant.price) && variant.price > 0) as Array<{
      label: string;
      price: number;
      isDefault: boolean;
    }>;

    if (!name || !description || !rawPrimaryImage || !Number.isFinite(categoryId) || !variants.length) {
      return NextResponse.json({ error: "Missing required product fields" }, { status: 400 });
    }

    const category = await prisma.category.findUnique({ where: { id: categoryId } });
    if (!category) {
      return NextResponse.json({ error: "Invalid category" }, { status: 400 });
    }

    const uniqueSlug = await resolveUniqueSlug(body.slug?.trim() || name);

    const hasDefault = variants.some((variant) => variant.isDefault);
    const normalizedVariants = variants.map((variant, index) => ({
      ...variant,
      isDefault: hasDefault ? variant.isDefault : index === 0,
    }));

    const primaryImage = await resolveImageInput(rawPrimaryImage, uploadedInRequest);
    const galleryImages = (
      await Promise.all(rawGalleryImages.map((url) => resolveImageInput(url, uploadedInRequest)))
    ).filter(Boolean);

    if (!primaryImage) {
      return NextResponse.json({ error: "Primary image is required" }, { status: 400 });
    }

    const images = [primaryImage, ...galleryImages];

    const product = await prisma.product.create({
      data: {
        name,
        slug: uniqueSlug,
        description,
        categoryId,
        variants: {
          create: normalizedVariants,
        },
        images: {
          create: images.map((url, index) => ({
            url,
            alt: `${name} image ${index + 1}`,
            isPrimary: index === 0,
            sortOrder: index,
          })),
        },
      },
      include: {
        category: true,
        variants: true,
        images: true,
      },
    });

    return NextResponse.json({ product }, { status: 201 });
  } catch (error) {
    await deleteCloudinaryImagesByUrls(uploadedInRequest);
    console.error("POST /api/admin/products failed", error);

    if (error instanceof Prisma.PrismaClientKnownRequestError && error.code === "P2002") {
      return NextResponse.json({ error: "Product slug must be unique" }, { status: 400 });
    }

    return NextResponse.json({ error: "Failed to create product" }, { status: 500 });
  }
}
