import { NextResponse } from "next/server";
import { OrderStatus, Prisma } from "@prisma/client";

import { prisma } from "@/lib/prisma";

const ALLOWED_STATUSES = new Set(Object.values(OrderStatus));

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);

    const q = searchParams.get("q")?.trim() || "";
    const statusParam = searchParams.get("status")?.trim() || "ALL";
    const fromParam = searchParams.get("from")?.trim() || "";
    const toParam = searchParams.get("to")?.trim() || "";
    const sortParam = searchParams.get("sort")?.trim() === "oldest" ? "oldest" : "newest";
    const pageParam = Number(searchParams.get("page") || "1");
    const pageSizeParam = Number(searchParams.get("pageSize") || "10");

    const page = Number.isFinite(pageParam) && pageParam > 0 ? pageParam : 1;
    const pageSize = Number.isFinite(pageSizeParam) && pageSizeParam > 0 ? Math.min(pageSizeParam, 50) : 10;

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

    const total = await prisma.order.count({ where });
    const totalPages = Math.max(1, Math.ceil(total / pageSize));
    const safePage = Math.min(page, totalPages);

    const revenueAgg = await prisma.order.aggregate({
      where,
      _sum: {
        total: true,
      },
    });

    const pendingCount = await prisma.order.count({
      where: {
        AND: [where, { status: { in: [OrderStatus.NEW, OrderStatus.CONFIRMED] } }],
      },
    });

    const startOfToday = new Date();
    startOfToday.setHours(0, 0, 0, 0);
    const endOfToday = new Date();
    endOfToday.setHours(23, 59, 59, 999);

    const todayCount = await prisma.order.count({
      where: {
        AND: [
          where,
          {
            createdAt: {
              gte: startOfToday,
              lte: endOfToday,
            },
          },
        ],
      },
    });

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
      skip: (safePage - 1) * pageSize,
      take: pageSize,
    });

    return NextResponse.json({
      orders,
      pagination: {
        page: safePage,
        pageSize,
        total,
        totalPages,
      },
      stats: {
        filteredRevenue: revenueAgg._sum.total ?? 0,
        pendingOrders: pendingCount,
        todayOrders: todayCount,
      },
    });
  } catch (error) {
    console.error("GET /api/admin/orders failed", error);
    return NextResponse.json({ error: "Failed to load orders" }, { status: 500 });
  }
}
