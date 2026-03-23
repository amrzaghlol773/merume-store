import { NextResponse } from "next/server";
import { Prisma, ReviewStatus } from "@prisma/client";

import { prisma } from "@/lib/prisma";

const ALLOWED_REVIEW_STATUSES = new Set(Object.values(ReviewStatus));

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);

    const statusParam = (searchParams.get("status") || "ALL").trim();
    const q = (searchParams.get("q") || "").trim();

    const where: Prisma.ReviewWhereInput = {};

    if (statusParam !== "ALL" && ALLOWED_REVIEW_STATUSES.has(statusParam as ReviewStatus)) {
      where.status = statusParam as ReviewStatus;
    }

    if (q) {
      const qOrderId = Number(q);
      where.OR = [
        { product: { name: { contains: q, mode: "insensitive" } } },
        { customerName: { contains: q, mode: "insensitive" } },
        { customerPhone: { contains: q, mode: "insensitive" } },
        ...(Number.isFinite(qOrderId) ? [{ orderId: qOrderId }] : []),
      ];
    }

    const reviews = await prisma.review.findMany({
      where,
      include: {
        product: {
          select: {
            id: true,
            name: true,
            slug: true,
          },
        },
        order: {
          select: {
            id: true,
            status: true,
            customer: {
              select: {
                fullName: true,
                phone: true,
              },
            },
          },
        },
        images: {
          orderBy: {
            sortOrder: "asc",
          },
        },
      },
      orderBy: [
        { status: "asc" },
        { createdAt: "desc" },
      ],
      take: 250,
    });

    return NextResponse.json({ reviews });
  } catch (error) {
    console.error("GET /api/admin/reviews failed", error);
    return NextResponse.json({ error: "Failed to load reviews" }, { status: 500 });
  }
}
