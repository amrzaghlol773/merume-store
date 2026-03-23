import type { Metadata } from "next";

import CheckoutPageClient from "@/components/checkout-page-client";

export const metadata: Metadata = {
  title: "Checkout",
  description: "Complete your Merume order and confirm via WhatsApp.",
  robots: {
    index: false,
    follow: false,
  },
  alternates: {
    canonical: "/checkout",
  },
};

export default function CheckoutPage() {
  return <CheckoutPageClient />;
}
