import type { Metadata } from "next";
import { Suspense } from "react";

import OrderSuccessClient from "@/components/order-success-client";

export const metadata: Metadata = {
  title: "Order Success",
  description: "Your Merume order has been created successfully.",
  robots: {
    index: false,
    follow: false,
  },
  alternates: {
    canonical: "/order-success",
  },
};

export default function OrderSuccessPage() {
  return (
    <Suspense fallback={null}>
      <OrderSuccessClient />
    </Suspense>
  );
}
