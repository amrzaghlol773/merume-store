
import { NextResponse } from "next/server";
import { ReviewStatus } from "@prisma/client";

import { prisma } from "@/lib/prisma";

const ALLOWED_REVIEW_STATUSES = new Set(Object.values(ReviewStatus));

export async function PATCH(
  request: Request,
  context: { params: Promise<{ id: string }> },
) {
  try {
    const { id } = await context.params;
    const reviewId = Number(id);

    if (!Number.isFinite(reviewId) || reviewId <= 0) {
      return NextResponse.json({ error: "Invalid review id" }, { status: 400 });
    }

    const body = (await request.json()) as { status?: ReviewStatus };
    if (!body.status || !ALLOWED_REVIEW_STATUSES.has(body.status)) {
      return NextResponse.json({ error: "Invalid review status" }, { status: 400 });
    }

    const review = await prisma.review.update({
      where: { id: reviewId },
      data: { status: body.status },
    });

    return NextResponse.json({ review });
  } catch (error) {
    console.error("PATCH /api/admin/reviews/[id] failed", error);
    return NextResponse.json({ error: "Failed to update review status" }, { status: 500 });
  }
}
