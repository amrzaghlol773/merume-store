import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";

import ProductDetailsClient from "@/components/product-details-client";
import { getPublicProducts } from "@/lib/server/storefront";

type ProductPageProps = {
  params: Promise<{ slug: string }>;
};

async function getProductBySlug(slug: string) {
  try {
    const products = await getPublicProducts();
    return {
      product: products.find((entry) => entry.slug === slug) || null,
      failed: false,
    };
  } catch (error) {
    console.error(`Failed to load product data for slug "${slug}"`, error);
    return {
      product: null,
      failed: true,
    };
  }
}

export async function generateMetadata({ params }: ProductPageProps): Promise<Metadata> {
  const resolved = await params;
  const { product } = await getProductBySlug(resolved.slug);

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
  const { product, failed } = await getProductBySlug(resolved.slug);

  if (failed) {
    return (
      <main className="min-h-screen bg-[#0f100d] px-4 py-14 text-[#ece9df] sm:px-6 lg:px-8">
        <div className="mx-auto max-w-3xl rounded-3xl border border-[#d4af37]/25 bg-[#161711] p-8 text-center">
          <p className="text-xs uppercase tracking-[0.2em] text-[#d4af37]">Merume Store</p>
          <h1 className="mt-3 text-3xl font-semibold">Product page is temporarily unavailable</h1>
          <p className="mt-3 text-sm text-[#c5c7bb]">
            We could not load this product right now. Please try again in a minute.
          </p>
          <div className="mt-6 flex flex-wrap items-center justify-center gap-3">
            <Link
              href="/collections"
              className="rounded-lg border border-[#d4af37]/40 px-5 py-3 text-sm font-semibold uppercase tracking-[0.1em] hover:bg-[#d4af37] hover:text-[#11120e]"
            >
              Back to Collections
            </Link>
            <Link
              href="/"
              className="rounded-lg border border-white/20 px-5 py-3 text-sm font-semibold uppercase tracking-[0.1em] hover:bg-white hover:text-[#11120e]"
            >
              Go Home
            </Link>
          </div>
        </div>
      </main>
    );
  }

  if (!product) {
    notFound();
  }

  return <ProductDetailsClient product={product} />;
}
