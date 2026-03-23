import { NextResponse } from "next/server";
import { Prisma } from "@prisma/client";

import { prisma } from "@/lib/prisma";

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

  if (value.startsWith("/")) {
    return value;
  }

  // Reject local absolute file-system paths from Windows.
  if (/^[a-zA-Z]:\//.test(value)) {
    return "";
  }

  return `/${value.replace(/^\.?\//, "")}`;
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

  while (true) {
    const existing = await prisma.product.findUnique({ where: { slug: candidate } });
    if (!existing || existing.id === ignoreProductId) {
      return candidate;
    }
    candidate = `${base}-${index}`;
    index += 1;
  }
}

export async function PATCH(request: Request, context: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await context.params;
    const productId = Number(id);

    if (!Number.isFinite(productId) || productId <= 0) {
      return NextResponse.json({ error: "Invalid product id" }, { status: 400 });
    }

    const body = (await request.json()) as ProductPayload;

    const name = body.name?.trim() || "";
    const description = body.description?.trim() || "";
    const categoryId = Number(body.categoryId);
    const primaryImage = normalizeImageUrl(body.primaryImage || "");
    const galleryImages = (body.galleryImages || []).map((url) => normalizeImageUrl(url)).filter(Boolean);
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

    if (!name || !description || !primaryImage || !Number.isFinite(categoryId) || !variants.length) {
      return NextResponse.json({ error: "Missing required product fields" }, { status: 400 });
    }

    const existingProduct = await prisma.product.findUnique({ where: { id: productId } });
    if (!existingProduct) {
      return NextResponse.json({ error: "Product not found" }, { status: 404 });
    }

    const category = await prisma.category.findUnique({ where: { id: categoryId } });
    if (!category) {
      return NextResponse.json({ error: "Invalid category" }, { status: 400 });
    }

    const uniqueSlug = await resolveUniqueSlug(body.slug?.trim() || name, productId);

    const hasDefault = variants.some((variant) => variant.isDefault);
    const normalizedVariants = variants.map((variant, index) => ({
      ...variant,
      isDefault: hasDefault ? variant.isDefault : index === 0,
    }));

    const images = [primaryImage, ...galleryImages];

    const product = await prisma.$transaction(async (tx) => {
      await tx.productVariant.deleteMany({ where: { productId } });
      await tx.productImage.deleteMany({ where: { productId } });

      return tx.product.update({
        where: { id: productId },
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
    });

    return NextResponse.json({ product });
  } catch (error) {
    console.error("PATCH /api/admin/products/[id] failed", error);

    if (error instanceof Prisma.PrismaClientKnownRequestError && error.code === "P2002") {
      return NextResponse.json({ error: "Product slug must be unique" }, { status: 400 });
    }

    return NextResponse.json({ error: "Failed to update product" }, { status: 500 });
  }
}

export async function DELETE(_request: Request, context: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await context.params;
    const productId = Number(id);

    if (!Number.isFinite(productId) || productId <= 0) {
      return NextResponse.json({ error: "Invalid product id" }, { status: 400 });
    }

    await prisma.product.delete({ where: { id: productId } });
    return NextResponse.json({ ok: true });
  } catch (error) {
    console.error("DELETE /api/admin/products/[id] failed", error);

    if (error instanceof Prisma.PrismaClientKnownRequestError && error.code === "P2003") {
      return NextResponse.json(
        { error: "Cannot delete product because it is used in existing orders" },
        { status: 400 },
      );
    }

    return NextResponse.json({ error: "Failed to delete product" }, { status: 500 });
  }
}
