import type { Metadata } from "next";
import LuxePreview from "@/components/luxe-preview";

export const metadata: Metadata = {
  title: "Design Preview",
  description: "Preview of the Luxe Aura inspired storefront design.",
  alternates: {
    canonical: "/design-preview",
  },
};

export default function DesignPreviewPage() {
  return <LuxePreview />;
}
