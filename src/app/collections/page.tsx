import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";

import { getPublicProducts } from "@/lib/server/storefront";

export const metadata: Metadata = {
  title: "Collections",
  description: "Browse Merume perfume and candle collections.",
  alternates: {
    canonical: "/collections",
  },
};

function formatPrice(price: number) {
  return `${price.toLocaleString("en-EG")} EGP`;
}

function getLowestPrice(variants: Array<{ price: number }>) {
  if (!variants.length) {
    return 0;
  }

  return Math.min(...variants.map((variant) => variant.price || 0));
}

function normalizeImageUrl(rawUrl: string) {
  const value = String(rawUrl || "").trim().replace(/\\/g, "/");
  if (!value) {
    return "";
  }

  if (/^https?:\/\//i.test(value)) {
    return value;
  }

  if (value.startsWith("/")) {
    return value;
  }

  if (/^[a-zA-Z]:\//.test(value)) {
    return "";
  }

  return `/${value.replace(/^\.?\//, "")}`;
}

function getPrimaryImage(images: Array<{ url: string; isPrimary: boolean }>) {
  const primary = images.find((image) => image.isPrimary)?.url || images[0]?.url || "";
  return normalizeImageUrl(primary);
}

export default async function CollectionsPage() {
  const products = await getPublicProducts();

  return (
    <main className="min-h-screen bg-[#0f100d] px-4 py-10 text-[#ece9df] sm:px-6 lg:px-8">
      <div className="mx-auto max-w-7xl">
        <nav className="mb-4 text-xs uppercase tracking-[0.16em] text-[#9ea091]">
          <Link href="/" className="hover:text-[#d4af37]">Home</Link>
          <span className="mx-2">/</span>
          <span className="text-[#d4af37]">Collections</span>
        </nav>

        <header className="mb-8 flex flex-wrap items-center justify-between gap-4">
          <div>
            <p className="text-xs uppercase tracking-[0.2em] text-[#d4af37]">Merume</p>
            <h1 className="mt-2 text-4xl font-semibold">Collections</h1>
            <p className="mt-2 text-sm text-[#b4b6a8]">Explore all products in a dedicated shopping catalog.</p>
          </div>
          <div className="flex items-center gap-2">
            <Link href="/" className="rounded-lg border border-[#d4af37]/40 px-4 py-2 text-sm font-semibold hover:bg-[#d4af37] hover:text-[#11120e]">
              Home
            </Link>
            <Link href="/classic" className="rounded-lg border border-white/20 px-4 py-2 text-sm font-semibold hover:bg-white hover:text-[#11120e]">
              Classic
            </Link>
          </div>
        </header>

        <section className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-4">
          {products.map((product) => {
            const image = getPrimaryImage(product.images);
            return (
              <article key={product.id} className="overflow-hidden rounded-2xl border border-[#d4af37]/20 bg-[#161711]">
                <Link href={`/products/${product.slug}`} className="block">
                  <div className="relative h-64 w-full bg-[#232419]">
                    {image ? (
                      <Image
                        src={image}
                        alt={product.name}
                        fill
                        sizes="(max-width: 1024px) 50vw, 25vw"
                        className="object-cover"
                      />
                    ) : null}
                  </div>
                </Link>
                <div className="p-4">
                  <p className="text-xs uppercase tracking-[0.14em] text-[#a4a697]">{product.category}</p>
                  <h2 className="mt-1 text-xl font-semibold">{product.name}</h2>
                  <p className="mt-1 text-sm text-[#b5b7a8]">{product.reviewSummary.averageRating.toFixed(1)} / 5 ({product.reviewSummary.totalReviews})</p>
                  <p className="mt-3 text-sm font-semibold text-[#d4af37]">From {formatPrice(getLowestPrice(product.variants))}</p>
                  <Link href={`/products/${product.slug}`} className="mt-4 inline-block rounded-lg border border-[#d4af37]/40 px-4 py-2 text-sm font-semibold hover:bg-[#d4af37] hover:text-[#11120e]">
                    View Product
                  </Link>
                </div>
              </article>
            );
          })}
        </section>
      </div>
    </main>
  );
}
