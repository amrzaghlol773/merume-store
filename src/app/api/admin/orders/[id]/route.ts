import { OrderStatus } from "@prisma/client";
import { NextResponse } from "next/server";

import { prisma } from "@/lib/prisma";

const ALLOWED_STATUSES = new Set(Object.values(OrderStatus));

export async function PATCH(
  request: Request,
  context: { params: Promise<{ id: string }> },
) {
  try {
    const { id } = await context.params;
    const orderId = Number(id);

    if (!Number.isFinite(orderId) || orderId <= 0) {
      return NextResponse.json({ error: "Invalid order id" }, { status: 400 });
    }

    const body = (await request.json()) as { status?: OrderStatus };
    if (!body.status || !ALLOWED_STATUSES.has(body.status)) {
      return NextResponse.json({ error: "Invalid order status" }, { status: 400 });
    }

    const order = await prisma.order.update({
      where: { id: orderId },
      data: { status: body.status },
    });

    return NextResponse.json({ order });
  } catch (error) {
    console.error("PATCH /api/admin/orders/[id] failed", error);
    return NextResponse.json({ error: "Failed to update order status" }, { status: 500 });
  }
}
