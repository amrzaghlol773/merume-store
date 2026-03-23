import { NextResponse } from "next/server";

import { getPublicProducts } from "@/lib/server/storefront";

export async function GET() {
  try {
    const products = await getPublicProducts();
    return NextResponse.json({ products });
  } catch (error) {
    console.error("GET /api/products failed", error);
    return NextResponse.json({ error: "Failed to load products" }, { status: 500 });
  }
}
