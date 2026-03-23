import { NextResponse } from "next/server";
import { Prisma, ReviewStatus, OrderStatus } from "@prisma/client";

import { prisma } from "@/lib/prisma";

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

  if (/^[a-zA-Z]:\//.test(value)) {
    return "";
  }

  return `/${value.replace(/^\.?\//, "")}`;
}

function sanitizeName(raw: string) {
  const value = String(raw || "").trim();
  return value.slice(0, 80);
}

function sanitizePhone(raw: string) {
  return String(raw || "").replace(/\D/g, "");
}

function sanitizeComment(raw: string) {
  return String(raw || "").trim().slice(0, 1200);
}

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const productId = Number(searchParams.get("productId") || "0");

    if (!Number.isFinite(productId) || productId <= 0) {
      return NextResponse.json({ error: "Invalid product id" }, { status: 400 });
    }

    const reviews = await prisma.review.findMany({
      where: {
        productId,
        status: ReviewStatus.APPROVED,
      },
      include: {
        images: {
          orderBy: {
            sortOrder: "asc",
          },
        },
      },
      orderBy: {
        createdAt: "desc",
      },
      take: 30,
    });

    const totalReviews = reviews.length;
    const averageRating = totalReviews
      ? Number((reviews.reduce((sum, review) => sum + review.rating, 0) / totalReviews).toFixed(1))
      : 0;

    return NextResponse.json({
      reviewSummary: {
        averageRating,
        totalReviews,
      },
      reviews: reviews.map((review) => ({
        id: review.id,
        rating: review.rating,
        comment: review.comment,
        customerName: review.customerName,
        createdAt: review.createdAt.toISOString(),
        images: review.images.map((image) => image.url),
      })),
    });
  } catch (error) {
    console.error("GET /api/reviews failed", error);
    return NextResponse.json({ error: "Failed to load reviews" }, { status: 500 });
  }
}

type CreateReviewPayload = {
  productId?: number;
  orderId?: number;
  customerName?: string;
  phone?: string;
  rating?: number;
  comment?: string;
  imageUrls?: string[];
};

export async function POST(request: Request) {
  try {
    const body = (await request.json()) as CreateReviewPayload;

    const productId = Number(body.productId);
    const orderId = Number(body.orderId);
    const customerName = sanitizeName(body.customerName || "");
    const phone = sanitizePhone(body.phone || "");
    const rating = Number(body.rating || 0);
    const comment = sanitizeComment(body.comment || "");
    const imageUrls = (body.imageUrls || []).map((url) => normalizeImageUrl(url)).filter(Boolean).slice(0, 3);

    if (!Number.isFinite(productId) || productId <= 0) {
      return NextResponse.json({ error: "Invalid product id" }, { status: 400 });
    }

    if (!Number.isFinite(orderId) || orderId <= 0) {
      return NextResponse.json({ error: "Invalid order id" }, { status: 400 });
    }

    if (!customerName || customerName.length < 2) {
      return NextResponse.json({ error: "Please enter your name" }, { status: 400 });
    }

    if (!/^01\d{9}$/.test(phone) && !/^201\d{9}$/.test(phone)) {
      return NextResponse.json({ error: "Please enter a valid Egyptian phone" }, { status: 400 });
    }

    if (!Number.isInteger(rating) || rating < 1 || rating > 5) {
      return NextResponse.json({ error: "Rating must be between 1 and 5" }, { status: 400 });
    }

    if (comment.length < 10) {
      return NextResponse.json({ error: "Review comment is too short" }, { status: 400 });
    }

    const order = await prisma.order.findUnique({
      where: { id: orderId },
      include: {
        customer: true,
        items: true,
      },
    });

    if (!order) {
      return NextResponse.json({ error: "Order not found" }, { status: 404 });
    }

    if (order.status !== OrderStatus.DELIVERED) {
      return NextResponse.json({ error: "Reviews are allowed after order delivery" }, { status: 400 });
    }

    const normalizedOrderPhone = sanitizePhone(order.customer.phone);
    if (normalizedOrderPhone !== phone) {
      return NextResponse.json({ error: "Phone number does not match this order" }, { status: 403 });
    }

    const purchasedProduct = order.items.some((item) => item.productId === productId);
    if (!purchasedProduct) {
      return NextResponse.json({ error: "This product is not part of this order" }, { status: 400 });
    }

    const review = await prisma.review.create({
      data: {
        productId,
        orderId,
        customerName,
        customerPhone: phone,
        rating,
        comment,
        status: ReviewStatus.PENDING,
        images: {
          create: imageUrls.map((url, index) => ({
            url,
            sortOrder: index,
          })),
        },
      },
      include: {
        images: true,
      },
    });

    return NextResponse.json({
      review: {
        id: review.id,
        status: review.status,
      },
      message: "Review submitted and waiting for approval",
    }, { status: 201 });
  } catch (error) {
    console.error("POST /api/reviews failed", error);

    if (error instanceof Prisma.PrismaClientKnownRequestError && error.code === "P2002") {
      return NextResponse.json(
        { error: "You already submitted a review for this product in the same order" },
        { status: 400 },
      );
    }

    const message = error instanceof Error ? error.message : "Failed to submit review";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
