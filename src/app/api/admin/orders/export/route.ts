import { NextResponse } from "next/server";
import { OrderStatus, Prisma } from "@prisma/client";

import { prisma } from "@/lib/prisma";

const ALLOWED_STATUSES = new Set(Object.values(OrderStatus));

function escapeCsv(value: string | number | null | undefined) {
  const raw = value == null ? "" : String(value);
  if (/[",\n]/.test(raw)) {
    return `"${raw.replace(/"/g, '""')}"`;
  }
  return raw;
}

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);

    const q = searchParams.get("q")?.trim() || "";
    const statusParam = searchParams.get("status")?.trim() || "ALL";
    const fromParam = searchParams.get("from")?.trim() || "";
    const toParam = searchParams.get("to")?.trim() || "";
    const sortParam = searchParams.get("sort")?.trim() === "oldest" ? "oldest" : "newest";

    const where: Prisma.OrderWhereInput = {};

    if (statusParam !== "ALL" && ALLOWED_STATUSES.has(statusParam as OrderStatus)) {
      where.status = statusParam as OrderStatus;
    }

    if (q) {
      const qAsId = Number(q);
      where.OR = [
        { customer: { fullName: { contains: q, mode: "insensitive" } } },
        { customer: { phone: { contains: q, mode: "insensitive" } } },
        { governorate: { contains: q, mode: "insensitive" } },
        ...(Number.isFinite(qAsId) ? [{ id: qAsId }] : []),
      ];
    }

    if (fromParam || toParam) {
      const createdAt: Prisma.DateTimeFilter = {};
      if (fromParam) {
        const fromDate = new Date(fromParam);
        if (!Number.isNaN(fromDate.getTime())) {
          createdAt.gte = fromDate;
        }
      }

      if (toParam) {
        const toDate = new Date(toParam);
        if (!Number.isNaN(toDate.getTime())) {
          toDate.setHours(23, 59, 59, 999);
          createdAt.lte = toDate;
        }
      }

      if (Object.keys(createdAt).length > 0) {
        where.createdAt = createdAt;
      }
    }

    const orders = await prisma.order.findMany({
      where,
      include: {
        customer: true,
        items: {
          include: {
            product: true,
          },
        },
      },
      orderBy: {
        createdAt: sortParam === "oldest" ? "asc" : "desc",
      },
    });

    const headers = [
      "order_id",
      "created_at",
      "status",
      "customer_name",
      "customer_phone",
      "governorate",
      "street_address",
      "items",
      "subtotal",
      "shipping_fee",
      "total",
    ];

    const rows = orders.map((order) => {
      const itemsText = order.items
        .map((item) => `${item.product.name}${item.variantLabel ? ` ${item.variantLabel}` : ""} x${item.quantity}`)
        .join(" | ");

      return [
        order.id,
        new Date(order.createdAt).toISOString(),
        order.status,
        order.customer.fullName,
        order.customer.phone,
        order.governorate,
        order.streetAddress,
        itemsText,
        order.subtotal,
        order.shippingFee,
        order.total,
      ];
    });

    const csvContent = [headers, ...rows]
      .map((row) => row.map((cell) => escapeCsv(cell)).join(","))
      .join("\n");

    return new NextResponse(csvContent, {
      status: 200,
      headers: {
        "Content-Type": "text/csv; charset=utf-8",
        "Content-Disposition": `attachment; filename=orders-${new Date().toISOString().slice(0, 10)}.csv`,
      },
    });
  } catch (error) {
    console.error("GET /api/admin/orders/export failed", error);
    return NextResponse.json({ error: "Failed to export orders" }, { status: 500 });
  }
}
