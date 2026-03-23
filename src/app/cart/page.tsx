import type { Metadata } from "next";

import CartPageClient from "@/components/cart-page-client";

export const metadata: Metadata = {
  title: "Cart",
  description: "Review your cart before checkout.",
  robots: {
    index: false,
    follow: false,
  },
  alternates: {
    canonical: "/cart",
  },
};

export default function CartPage() {
  return <CartPageClient />;
}
