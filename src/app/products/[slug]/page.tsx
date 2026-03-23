import type { Metadata } from "next";
import { notFound } from "next/navigation";

import ProductDetailsClient from "@/components/product-details-client";
import { getPublicProducts } from "@/lib/server/storefront";

type ProductPageProps = {
  params: Promise<{ slug: string }>;
};

export async function generateMetadata({ params }: ProductPageProps): Promise<Metadata> {
  const resolved = await params;
  const products = await getPublicProducts();
  const product = products.find((entry) => entry.slug === resolved.slug);

  if (!product) {
    return {
      title: "Product Not Found",
    };
  }

  return {
    title: product.name,
    description: product.description,
    alternates: {
      canonical: `/products/${product.slug}`,
    },
  };
}

export default async function ProductPage({ params }: ProductPageProps) {
  const resolved = await params;
  const products = await getPublicProducts();
  const product = products.find((entry) => entry.slug === resolved.slug);

  if (!product) {
    notFound();
  }

  return <ProductDetailsClient product={product} />;
}
