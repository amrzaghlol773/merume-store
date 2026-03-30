"use client";

import Image from "next/image";
import Link from "next/link";
import { useMemo, useState } from "react";

import { addToCart as addCartItem } from "@/lib/client/cart";

type Product = {
  id: number;
  name: string;
  slug: string;
  category: string;
  description: string;
  images: Array<{ url: string; alt: string; isPrimary: boolean }>;
  variants: Array<{ label: string; price: number; isDefault: boolean }>;
  reviewSummary: { averageRating: number; totalReviews: number };
  reviews: Array<{
    id: number;
    rating: number;
    comment: string;
    customerName: string;
    createdAt: string;
    images: string[];
  }>;
};

type ProductDetailsClientProps = {
  product: Product;
};

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

function formatPrice(price: number) {
  return `${price.toLocaleString("en-EG")} EGP`;
}

function getDefaultVariantLabel(product: Product) {
  return product.variants.find((variant) => variant.isDefault)?.label || product.variants[0]?.label || "";
}

export default function ProductDetailsClient({ product }: ProductDetailsClientProps) {
  const gallery = useMemo(
    () => product.images.map((image) => normalizeImageUrl(image.url)).filter((url) => Boolean(url)),
    [product.images],
  );

	const [selectedImage, setSelectedImage] = useState(gallery[0] || "");
	const [selectedVariant, setSelectedVariant] = useState(getDefaultVariantLabel(product));
	const [qty, setQty] = useState(1);
	const [showToast, setShowToast] = useState(false);

	// Toast trigger function
	const triggerToast = () => {
		setShowToast(true);
		setTimeout(() => setShowToast(false), 3000);
	};

  const currentPrice = useMemo(() => {
    return product.variants.find((variant) => variant.label === selectedVariant)?.price || product.variants[0]?.price || 0;
  }, [product.variants, selectedVariant]);



  const handleAddToCart = () => {
    const payload = {
      productId: product.id,
      variantLabel: selectedVariant,
      qty,
    };
    try {
      addCartItem(payload);
      triggerToast();
    } catch {
      // handle error if needed
    }
  };

 

  return (
    <>
      {/* Toast Notification */}
      <div
        className={`fixed top-6 right-6 z-50 transition-all duration-500 ${showToast ? 'opacity-100 translate-y-0 pointer-events-auto' : 'opacity-0 -translate-y-4 pointer-events-none'} bg-black border border-[#d4af37] text-white px-6 py-3 rounded-xl shadow-lg flex items-center gap-2`}
        style={{ minWidth: 220 }}
        aria-live="polite"
      >
        <svg className="w-5 h-5 text-[#d4af37]" fill="none" stroke="currentColor" strokeWidth="2.2" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" /></svg>
        <span>Item added to cart!</span>
      </div>

      <main className="min-h-screen bg-[#0f100d] px-4 py-10 text-[#ece9df] sm:px-6 lg:px-8">
        <div className="mx-auto max-w-7xl">
          <nav className="mb-4 text-xs uppercase tracking-[0.16em] text-[#9ea091]">
            <Link href="/" className="hover:text-[#d4af37]">Home</Link>
            <span className="mx-2">/</span>
            <Link href="/collections" className="hover:text-[#d4af37]">Collections</Link>
            <span className="mx-2">/</span>
            <span className="text-[#d4af37]">{product.name}</span>
          </nav>

          <div className="mb-8 flex flex-wrap items-center justify-between gap-3">
            <Link href="/collections" className="rounded-lg border border-white/20 px-4 py-2 text-sm font-semibold hover:bg-white hover:text-[#11120e]">
              Back to Collections
            </Link>
            <Link href="/?openCart=1" className="rounded-lg border border-[#d4af37]/40 px-4 py-2 text-sm font-semibold hover:bg-[#d4af37] hover:text-[#11120e]">
              Open Cart
            </Link>
          </div>

          <section className="grid gap-8 rounded-3xl border border-[#d4af37]/25 bg-[#161711] p-5 md:grid-cols-[1.1fr_1fr] md:p-8">
            <div>
              <div className="relative h-[360px] w-full overflow-hidden rounded-xl bg-[#232419] sm:h-[520px]">
                {selectedImage ? (
                  <Image src={selectedImage} alt={product.name} fill sizes="(max-width: 1024px) 100vw, 50vw" className="object-cover" />
                ) : null}
              </div>
              <div className="mt-3 flex gap-2 overflow-x-auto pb-1">
                {gallery.map((image) => (
                  <button
                    key={image}
                    type="button"
                    onClick={() => setSelectedImage(image)}
                    className={`relative h-16 w-16 flex-none overflow-hidden rounded-md border ${selectedImage === image ? "border-[#d4af37]" : "border-white/20"}`}
                  >
                    <Image src={image} alt="Product" fill sizes="64px" className="object-cover" />
                  </button>
                ))}
              </div>
            </div>

            <div>
              <p className="text-xs uppercase tracking-[0.2em] text-[#d4af37]">{product.category}</p>
              <h1 className="mt-2 text-4xl font-semibold leading-tight sm:text-5xl">{product.name}</h1>
              <p className="mt-4 text-sm text-[#b4b6a8]">{product.reviewSummary.averageRating.toFixed(1)} / 5 ({product.reviewSummary.totalReviews} reviews)</p>
              <p className="mt-5 text-base leading-relaxed text-[#d0d2c6]">{product.description}</p>

              <div className="mt-6 flex flex-wrap gap-2">
                {product.variants.map((variant) => (
                  <button
                    key={variant.label}
                    type="button"
                    onClick={() => setSelectedVariant(variant.label)}
                    className={`rounded-lg border px-4 py-2 text-sm font-semibold ${selectedVariant === variant.label ? "border-[#d4af37] bg-[#d4af37] text-[#11120e]" : "border-white/20 bg-[#1c1d16] text-[#ece9df]"}`}
                  >
                    {variant.label}
                  </button>
                ))}
              </div>

              <div className="mt-6 flex items-center gap-3">
                <button type="button" className="h-10 w-10 rounded-lg border border-white/20" onClick={() => setQty((previous) => Math.max(1, previous - 1))}>-</button>
                <span className="min-w-8 text-center text-lg font-semibold">{qty}</span>
                <button type="button" className="h-10 w-10 rounded-lg border border-white/20" onClick={() => setQty((previous) => Math.min(20, previous + 1))}>+</button>
              </div>

              <p className="mt-6 text-3xl font-semibold text-price">{formatPrice(currentPrice)}</p>

              <div className="mt-6 flex flex-wrap gap-3">
                <button type="button" onClick={handleAddToCart} className="rounded-lg bg-[#d4af37] px-6 py-3 text-sm font-semibold uppercase tracking-[0.12em] text-[#11120e]">
                  Add to Cart
                </button>
              </div>
              {/* feedback removed, toast handles notification */}
            </div>
          </section>

          <section className="mt-8 rounded-3xl border border-[#d4af37]/20 bg-[#151611] p-6">
            <h2 className="text-2xl font-semibold">Customer Reviews</h2>
            <div className="mt-4 space-y-3">
              {product.reviews.length ? (
                product.reviews.slice(0, 4).map((review) => (
                  <article key={review.id} className="rounded-xl border border-white/10 bg-[#1c1d16] p-4">
                    <p className="text-sm text-[#d4af37]">{"★".repeat(review.rating)}</p>
                    <p className="mt-2 text-sm leading-7 text-[#d0d2c6]">{review.comment}</p>
                    <p className="mt-3 text-xs uppercase tracking-[0.14em] text-[#a8aa9d]">{review.customerName}</p>
                  </article>
                ))
              ) : (
                <p className="text-sm text-[#a8aa9d]">No reviews yet.</p>
              )}
            </div>
          </section>
        </div>
      </main>
    </>
  );
}
