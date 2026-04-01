import { NextResponse } from "next/server";

import { createOrder, type CheckoutInput } from "@/lib/server/storefront";

export async function POST(request: Request) {
  try {
    const payload = (await request.json()) as CheckoutInput;

    if (!payload?.fullName || !payload?.phone || !payload?.streetAddress || !payload?.governorate) {
      return NextResponse.json({ error: "Missing required shipping fields" }, { status: 400 });
    }

    if (!Array.isArray(payload.items) || payload.items.length === 0) {
      return NextResponse.json({ error: "Cart is empty" }, { status: 400 });
    }

    // if (!/^\+201\d{9}$/.test(String(payload.phone || "").trim())) {
    //   return NextResponse.json({ error: "Invalid phone format" }, { status: 400 });
    // }

    if (payload.email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(payload.email.trim())) {
      return NextResponse.json({ error: "Invalid email format" }, { status: 400 });
    }

    const result = await createOrder(payload);

    return NextResponse.json({
      orderId: result.order.id,
      status: result.order.status,
      total: result.order.total,
      whatsappUrl: result.whatsappUrl,
    });
  } catch (error) {
    console.error("POST /api/orders failed", error);
    const message = error instanceof Error ? error.message : "Failed to create order";
    return NextResponse.json({ error: message }, { status: 400 });
  }
}
