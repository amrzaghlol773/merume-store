"use client";

import Link from "next/link";
import { useEffect, useMemo, useState } from "react";

import { clearCart, readCart, type CartItem } from "@/lib/client/cart";

type Product = {
  id: number;
  name: string;
  variants: Array<{ label: string; price: number; isDefault: boolean }>;
};

const governorates = [
  { value: "Cairo", label: "Cairo" },
  { value: "Giza", label: "Giza" },
  { value: "Sixth_of_October", label: "6th of October" },
  { value: "Sheikh_Zayed", label: "Sheikh Zayed" },
  { value: "Rehab", label: "Rehab" },
  { value: "Madinaty", label: "Madinaty" },
  { value: "Obour", label: "Obour" },
  { value: "Shorouk", label: "Shorouk" },
  { value: "Alexandria", label: "Alexandria" },
  { value: "Ayyat", label: "Ayyat" },
  { value: "Oseem", label: "Oseem" },
  { value: "Khanka", label: "Khanka" },
  { value: "Qalyubia_Outskirts", label: "Qalyubia Outskirts" },
  { value: "Port_Said", label: "Port Said" },
  { value: "Ismailia", label: "Ismailia" },
  { value: "Suez", label: "Suez" },
  { value: "Dakahlia", label: "Dakahlia" },
  { value: "Sharqia", label: "Sharqia" },
  { value: "Gharbia", label: "Gharbia" },
  { value: "Monufia", label: "Monufia" },
  { value: "Damietta", label: "Damietta" },
  { value: "Kafr_El_Sheikh", label: "Kafr El Sheikh" },
  { value: "Asyut", label: "Asyut" },
  { value: "Beni_Suef", label: "Beni Suef" },
  { value: "Fayoum", label: "Fayoum" },
  { value: "Minya", label: "Minya" },
  { value: "Sohag", label: "Sohag" },
  { value: "Matrouh", label: "Matrouh" },
  { value: "Qena", label: "Qena" },
  { value: "Luxor", label: "Luxor" },
  { value: "Aswan", label: "Aswan" },
  { value: "Hurghada", label: "Hurghada" },
  { value: "Safaga", label: "Safaga" },
  { value: "Sharm_El_Sheikh", label: "Sharm El Sheikh" },
  { value: "Dahab", label: "Dahab" },
  { value: "Arish", label: "Arish" },
];

function formatPrice(price: number) {
  return `${price.toLocaleString("en-EG")} EGP`;
}

function normalizeEgyptPhone(rawPhone: string) {
  const digits = String(rawPhone || "").replace(/\D/g, "");

  if (/^01\d{9}$/.test(digits)) {
    return `+2${digits}`;
  }

  if (/^201\d{9}$/.test(digits)) {
    return `+${digits}`;
  }

  if (/^\+201\d{9}$/.test(String(rawPhone || "").trim())) {
    return String(rawPhone).trim();
  }

  return "";
}

function isValidEmail(email: string) {
  if (!email.trim()) {
    return true;
  }

  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.trim());
}

function getVariantByLabel(product: Product, label: string) {
  return product.variants.find((variant) => variant.label === label) || product.variants.find((variant) => variant.isDefault) || product.variants[0];
}

export default function CheckoutPageClient() {
  const [cart, setCart] = useState<CartItem[]>([]);
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState("");

  const [customerName, setCustomerName] = useState("");
  const [customerPhone, setCustomerPhone] = useState("");
  const [customerEmail, setCustomerEmail] = useState("");
  const [customerAddress, setCustomerAddress] = useState("");
  const [deliveryNotes, setDeliveryNotes] = useState("");
  const [selectedGovernorateKey, setSelectedGovernorateKey] = useState("");

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

  const submit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    if (!cart.length) {
      setError("Your cart is empty.");
      return;
    }

    if (!selectedGovernorateKey || !customerName.trim() || !customerPhone.trim() || !customerAddress.trim()) {
      setError("Please complete all required checkout fields.");
      return;
    }

    if (!isValidEmail(customerEmail)) {
      setError("Please enter a valid email address.");
      return;
    }

    const normalizedPhone = normalizeEgyptPhone(customerPhone);
    if (!normalizedPhone) {
      setError("Please enter a valid Egyptian phone number (e.g. 010xxxxxxxx).");
      return;
    }

    setSubmitting(true);
    setError("");

    try {
      const response = await fetch("/api/orders", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          fullName: customerName,
          phone: normalizedPhone,
          email: customerEmail,
          streetAddress: customerAddress,
          governorate: selectedGovernorateKey,
          deliveryNotes,
          items: cart.map((item) => ({
            productId: item.productId,
            variantLabel: item.variantLabel,
            quantity: item.qty,
          })),
        }),
      });

      const json = (await response.json()) as { orderId?: number; total?: number; whatsappUrl?: string; error?: string };
      if (!response.ok || !json.whatsappUrl) {
        throw new Error(json.error || "Failed to create order");
      }

      clearCart();
      setCart([]);
     // window.open(json.whatsappUrl, "_blank", "noopener");
      const orderId = Number(json.orderId || 0);
      const total = Number(json.total || 0);
      const nextUrl = `/order-success?orderId=${orderId}&total=${total}&wa=${encodeURIComponent(json.whatsappUrl)}`;
      window.location.href = nextUrl;
    } catch (submitError) {
      setError(submitError instanceof Error ? submitError.message : "Failed to create order");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <main className="min-h-screen bg-[#0f100d] px-4 py-10 text-[#ece9df] sm:px-6 lg:px-8">
      <div className="mx-auto max-w-7xl">
        <nav className="mb-4 text-xs uppercase tracking-[0.16em] text-[#9ea091]">
          <Link href="/" className="hover:text-[#d4af37]">Home</Link>
          <span className="mx-2">/</span>
          <Link href="/cart" className="hover:text-[#d4af37]">Cart</Link>
          <span className="mx-2">/</span>
          <span className="text-[#d4af37]">Checkout</span>
        </nav>

        <header className="mb-8 flex flex-wrap items-center justify-between gap-3">
          <div>
            <p className="text-xs uppercase tracking-[0.2em] text-[#d4af37]">Merume</p>
            <h1 className="mt-2 text-4xl font-semibold">Checkout</h1>
          </div>
          <Link href="/cart" className="rounded-lg border border-white/20 px-4 py-2 text-sm font-semibold hover:bg-white hover:text-[#11120e]">
            Back to Cart
          </Link>
        </header>

        {loading ? <p className="rounded-xl border border-white/10 bg-[#161711] p-4">Loading checkout...</p> : null}

        <div className="grid gap-6 lg:grid-cols-[1.6fr_0.9fr]">
          <form onSubmit={submit} className="space-y-4 rounded-xl border border-[#d4af37]/20 bg-[#161711] p-5">
            <h2 className="text-xl font-semibold">Shipping Information</h2>

            <div className="grid gap-4 sm:grid-cols-2">
              <label className="block">
                <span className="mb-1 block text-xs font-semibold uppercase tracking-[0.12em] text-[#b2b4a6]">Full Name</span>
                <input required value={customerName} onChange={(event) => setCustomerName(event.target.value)} className="w-full rounded-lg border border-white/20 bg-[#10110d] px-4 py-3 outline-none" />
              </label>
              <label className="block">
                <span className="mb-1 block text-xs font-semibold uppercase tracking-[0.12em] text-[#b2b4a6]">Email</span>
                <input type="email" value={customerEmail} onChange={(event) => setCustomerEmail(event.target.value)} className="w-full rounded-lg border border-white/20 bg-[#10110d] px-4 py-3 outline-none" />
              </label>
              <label className="block">
                <span className="mb-1 block text-xs font-semibold uppercase tracking-[0.12em] text-[#b2b4a6]">Phone</span>
                <input required value={customerPhone} onChange={(event) => setCustomerPhone(event.target.value)} className="w-full rounded-lg border border-white/20 bg-[#10110d] px-4 py-3 outline-none" />
              </label>
              <label className="block">
                <span className="mb-1 block text-xs font-semibold uppercase tracking-[0.12em] text-[#b2b4a6]">Governorate</span>
                <select required value={selectedGovernorateKey} onChange={(event) => setSelectedGovernorateKey(event.target.value)} className="w-full rounded-lg border border-white/20 bg-[#10110d] px-4 py-3 outline-none">
                  <option value="">Select Governorate</option>
                  {governorates.map((governorate) => (
                    <option key={governorate.value} value={governorate.value}>{governorate.label}</option>
                  ))}
                </select>
              </label>
            </div>

            <label className="block">
              <span className="mb-1 block text-xs font-semibold uppercase tracking-[0.12em] text-[#b2b4a6]">Street Address</span>
              <textarea required rows={2} value={customerAddress} onChange={(event) => setCustomerAddress(event.target.value)} className="w-full rounded-lg border border-white/20 bg-[#10110d] px-4 py-3 outline-none" />
            </label>

            <label className="block">
              <span className="mb-1 block text-xs font-semibold uppercase tracking-[0.12em] text-[#b2b4a6]">Delivery Notes (optional)</span>
              <textarea rows={2} value={deliveryNotes} onChange={(event) => setDeliveryNotes(event.target.value)} className="w-full rounded-lg border border-white/20 bg-[#10110d] px-4 py-3 outline-none" />
            </label>

            {error ? <p className="text-sm font-semibold text-red-300">{error}</p> : null}

            <button type="submit" disabled={submitting || !cart.length} className="w-full rounded-lg bg-[#d4af37] px-4 py-3 text-sm font-semibold uppercase tracking-[0.12em] text-[#11120e] disabled:cursor-not-allowed disabled:opacity-60">
              {submitting ? "Creating Order..." : "Confirm Order via WhatsApp"}
            </button>
          </form>

          <aside className="self-start rounded-xl border border-[#d4af37]/20 bg-[#161711] p-5">
            <h3 className="text-xl font-semibold">Order Summary</h3>
            <div className="mt-4 space-y-2 text-sm text-[#c5c7bb]">
              {!cart.length ? <p>Your cart is empty.</p> : null}
              {cart.map((cartItem) => {
                const product = productMap.get(cartItem.productId);
                if (!product) {
                  return null;
                }

                const variant = getVariantByLabel(product, cartItem.variantLabel);
                return (
                  <div key={`${cartItem.productId}-${cartItem.variantLabel}`} className="flex items-center justify-between gap-3">
                    <span>{product.name}{variant?.label ? ` ${variant.label}` : ""} x{cartItem.qty}</span>
                    <span className="font-semibold text-price">{formatPrice((variant?.price || 0) * cartItem.qty)}</span>
                  </div>
                );
              })}
            </div>
            <div className="mt-4 space-y-2 text-sm">
              <div className="flex items-center justify-between text-[#b8baad]"><span>Subtotal</span><span>{formatPrice(subtotal)}</span></div>
              <div className="flex items-center justify-between text-[#b8baad]"><span>Shipping</span><span>Calculated by governorate</span></div>
              <div className="h-px bg-white/15" />
              <div className="flex items-center justify-between text-base font-semibold"><span>Total</span><span>{formatPrice(subtotal)}</span></div>
            </div>
          </aside>
        </div>
      </div>
    </main>
  );
}
