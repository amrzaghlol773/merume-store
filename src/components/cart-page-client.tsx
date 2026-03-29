"use client";

import Image from "next/image";
import Link from "next/link";
import { useEffect, useMemo, useState } from "react";

import { readCart, removeCartItem, updateCartItemQty, type CartItem } from "@/lib/client/cart";

type Product = {
  id: number;
  name: string;
  slug: string;
  category: string;
  description: string;
  images: Array<{ url: string; alt: string; isPrimary: boolean }>;
  variants: Array<{ label: string; price: number; isDefault: boolean }>;
};

function formatPrice(price: number) {
  return `${price.toLocaleString("en-EG")} EGP`;
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

function getPrimaryImage(product: Product) {
  const primary = product.images.find((image) => image.isPrimary)?.url || product.images[0]?.url || "";
  return normalizeImageUrl(primary);
}

function getVariantByLabel(product: Product, label: string) {
  return product.variants.find((variant) => variant.label === label) || product.variants.find((variant) => variant.isDefault) || product.variants[0];
}

function itemKey(item: CartItem) {
  return `${item.productId}::${item.variantLabel}`;
}

export default function CartPageClient() {
  const [cart, setCart] = useState<CartItem[]>([]);
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    setCart(readCart());
  }, []);

  useEffect(() => {
    const loadProducts = async () => {
      setLoading(true);
      setError("");
      try {
        const response = await fetch("/api/products", { cache: "no-store" });
        const json = (await response.json()) as { products?: Product[]; error?: string };
        if (!response.ok || !json.products) {
          throw new Error(json.error || "Failed to load products");
        }
        setProducts(json.products);
      } catch (loadError) {
        setError(loadError instanceof Error ? loadError.message : "Failed to load products");
      } finally {
        setLoading(false);
      }
    };

    void loadProducts();
  }, []);

  const productMap = useMemo(() => new Map(products.map((product) => [product.id, product])), [products]);

  const subtotal = useMemo(
    () =>
      cart.reduce((sum, cartItem) => {
        const product = productMap.get(cartItem.productId);
        if (!product) {
          return sum;
        }

        const variant = getVariantByLabel(product, cartItem.variantLabel);
        return sum + (variant?.price || 0) * cartItem.qty;
      }, 0),
    [cart, productMap],
  );

  // const quickOrderViaWhatsApp = () => {
  //   if (!cart.length) {
  //     return;
  //   }

  //   const lines = cart
  //     .map((cartItem, index) => {
  //       const product = productMap.get(cartItem.productId);
  //       if (!product) {
  //         return `${index + 1}) Product unavailable x${cartItem.qty}`;
  //       }

  //       const variant = getVariantByLabel(product, cartItem.variantLabel);
  //       const variantText = variant?.label ? ` (${variant.label})` : "";
  //       const lineTotal = (variant?.price || 0) * cartItem.qty;
  //       return `${index + 1}) ${product.name}${variantText} x${cartItem.qty} - ${lineTotal.toLocaleString("en-EG")} EGP`;
  //     })
  //     .join("\n");

  //   // const message = `Hello Merume, I want to place a quick WhatsApp order:\n\n${lines}\n\nSubtotal: ${subtotal.toLocaleString("en-EG")} EGP`;
  //   // window.open(`https://wa.me/201131104759?text=${encodeURIComponent(message)}`, "_blank", "noopener");
  // };

  return (
    <main className="min-h-screen bg-[#0f100d] px-4 py-10 text-[#ece9df] sm:px-6 lg:px-8">
      <div className="mx-auto max-w-7xl">
        <nav className="mb-4 text-xs uppercase tracking-[0.16em] text-[#9ea091]">
          <Link href="/" className="hover:text-[#d4af37]">Home</Link>
          <span className="mx-2">/</span>
          <span className="text-[#d4af37]">Cart</span>
        </nav>

        <header className="mb-8 flex flex-wrap items-center justify-between gap-3">
          <div>
            <p className="text-xs uppercase tracking-[0.2em] text-[#d4af37]">Merume</p>
            <h1 className="mt-2 text-4xl font-semibold">Your Cart</h1>
          </div>
          <Link href="/collections" className="rounded-lg border border-white/20 px-4 py-2 text-sm font-semibold hover:bg-white hover:text-[#11120e]">
            Continue Shopping
          </Link>
        </header>

        {loading ? <p className="rounded-xl border border-white/10 bg-[#161711] p-4">Loading cart...</p> : null}
        {error ? <p className="rounded-xl border border-red-400/40 bg-red-900/20 p-4 text-red-200">{error}</p> : null}

        <div className="grid gap-6 lg:grid-cols-[1.7fr_0.9fr]">
          <section className="space-y-3">
            {!cart.length ? (
              <div className="rounded-xl border border-white/10 bg-[#161711] p-5">
                <p className="text-sm text-[#b7b9ab]">Your cart is empty.</p>
              </div>
            ) : null}

            {cart.map((cartItem) => {
              const product = productMap.get(cartItem.productId);
              if (!product) {
                return null;
              }

              const variant = getVariantByLabel(product, cartItem.variantLabel);
              const image = getPrimaryImage(product);

              return (
                <article key={itemKey(cartItem)} className="grid grid-cols-[86px_1fr_auto] gap-3 rounded-xl border border-[#d4af37]/20 bg-[#161711] p-3">
                  <div className="relative h-[86px] w-[86px] overflow-hidden rounded-lg bg-[#212318]">
                    {image ? <Image src={image} alt={product.name} fill sizes="86px" className="object-cover" /> : null}
                  </div>
                  <div>
                    <h2 className="text-lg font-semibold">{product.name}</h2>
                    <p className="text-xs uppercase tracking-[0.12em] text-[#b2b4a6]">{variant?.label || "Default"}</p>
                    <p className="mt-1 text-sm text-price">{formatPrice(variant?.price || 0)} each</p>
                    <div className="mt-2 flex items-center gap-2">
                      <button
                        type="button"
                        className="h-8 w-8 rounded border border-white/20"
                        onClick={() => setCart(updateCartItemQty(cartItem.productId, cartItem.variantLabel, cartItem.qty - 1))}
                        aria-label="Decrease quantity"
                      >
                        -
                      </button>
                      <span className="min-w-6 text-center text-sm font-semibold">{cartItem.qty}</span>
                      <button
                        type="button"
                        className="h-8 w-8 rounded border border-white/20"
                        onClick={() => setCart(updateCartItemQty(cartItem.productId, cartItem.variantLabel, cartItem.qty + 1))}
                        aria-label="Increase quantity"
                      >
                        +
                      </button>
                      <button
                        type="button"
                        className="ml-2 rounded border border-white/20 px-2 py-1 text-xs"
                        onClick={() => setCart(removeCartItem(cartItem.productId, cartItem.variantLabel))}
                      >
                        Remove
                      </button>
                    </div>
                  </div>
                  <p className="whitespace-nowrap text-sm font-semibold text-price">{formatPrice((variant?.price || 0) * cartItem.qty)}</p>
                </article>
              );
            })}
          </section>

          <aside className="self-start rounded-xl border border-[#d4af37]/20 bg-[#161711] p-5">
            <h3 className="text-xl font-semibold">Order Summary</h3>
            <div className="mt-4 space-y-2 text-sm">
              <div className="flex items-center justify-between text-[#b8baad]"><span>Subtotal</span><span>{formatPrice(subtotal)}</span></div>
              <div className="flex items-center justify-between text-[#b8baad]"><span>Shipping</span><span>Calculated at checkout</span></div>
              <div className="h-px bg-white/15" />
              <div className="flex items-center justify-between text-base font-semibold"><span>Total</span><span>{formatPrice(subtotal)}</span></div>
            </div>

            <Link
              href="/checkout"
              className={`mt-5 block rounded-lg px-4 py-3 text-center text-sm font-semibold uppercase tracking-[0.12em] ${
                cart.length ? "bg-[#d4af37] text-[#11120e]" : "cursor-not-allowed bg-[#2a2c20] text-[#6c6f60]"
              }`}
            >
              Proceed to Checkout
            </Link>

            {/* <button
              type="button"
              onClick={quickOrderViaWhatsApp}
              disabled={!cart.length}
              className="mt-3 w-full rounded-lg border border-[#d4af37]/35 bg-[#1b1c15] px-4 py-3 text-sm font-semibold uppercase tracking-[0.12em] text-[#ece9df] disabled:cursor-not-allowed disabled:opacity-50"
            >
              Quick Order via WhatsApp
            </button> */}
          </aside>
        </div>
      </div>
    </main>
  );
}
