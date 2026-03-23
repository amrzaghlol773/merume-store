"use client";

import Link from "next/link";
import { FormEvent, useEffect, useMemo, useState } from "react";

type Category = {
  id: number;
  name: string;
};

type ProductVariant = {
  id?: number;
  label: string;
  price: number;
  isDefault?: boolean;
};

type ProductImage = {
  id?: number;
  url: string;
  isPrimary: boolean;
};

type AdminProduct = {
  id: number;
  name: string;
  slug: string;
  description: string;
  categoryId: number;
  category: { name: string };
  variants: ProductVariant[];
  images: ProductImage[];
};

type Toast = {
  type: "success" | "error";
  message: string;
};

type ProductForm = {
  name: string;
  slug: string;
  description: string;
  categoryId: string;
  primaryImage: string;
  galleryImagesText: string;
  variants: ProductVariant[];
};

type ThemeMode = "dark" | "light";

const EMPTY_FORM: ProductForm = {
  name: "",
  slug: "",
  description: "",
  categoryId: "",
  primaryImage: "",
  galleryImagesText: "",
  variants: [
    { label: "50ml", price: 0, isDefault: true },
    { label: "100ml", price: 0, isDefault: false },
  ],
};

const ADMIN_THEME_STORAGE_KEY = "merume-admin-theme";

function formatPrice(price: number) {
  return `${price.toLocaleString("en-EG")} EGP`;
}

export default function AdminProductsPage() {
  const [theme, setTheme] = useState<ThemeMode>("dark");
  const [isThemeReady, setIsThemeReady] = useState(false);
  const [products, setProducts] = useState<AdminProduct[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [deleteLoadingId, setDeleteLoadingId] = useState<number | null>(null);
  const [bulkDeleting, setBulkDeleting] = useState(false);
  const [editingId, setEditingId] = useState<number | null>(null);
  const [selectedProductIds, setSelectedProductIds] = useState<number[]>([]);
  const [form, setForm] = useState<ProductForm>(EMPTY_FORM);
  const [toast, setToast] = useState<Toast | null>(null);

  const editingProduct = useMemo(
    () => products.find((product) => product.id === editingId) || null,
    [products, editingId],
  );

  const loadData = async () => {
    setLoading(true);
    try {
      const response = await fetch("/api/admin/products", {
        cache: "no-store",
        credentials: "include",
      });

      if (response.status === 401) {
        window.location.href = "/admin/login?next=/admin/products";
        return;
      }

      const json = (await response.json()) as {
        products?: AdminProduct[];
        categories?: Category[];
        error?: string;
      };

      if (!response.ok) {
        throw new Error(json.error || "Failed to load products");
      }

      setProducts(json.products || []);
      setCategories(json.categories || []);
      setSelectedProductIds([]);
    } catch (error) {
      setToast({
        type: "error",
        message: error instanceof Error ? error.message : "Failed to load products",
      });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    void loadData();
  }, []);

  useEffect(() => {
    if (!toast) {
      return;
    }

    const timer = window.setTimeout(() => setToast(null), 2500);
    return () => window.clearTimeout(timer);
  }, [toast]);

  useEffect(() => {
    const savedTheme = window.localStorage.getItem(ADMIN_THEME_STORAGE_KEY);
    const nextTheme =
      savedTheme === "dark" || savedTheme === "light"
        ? savedTheme
        : window.matchMedia("(prefers-color-scheme: dark)").matches
          ? "dark"
          : "light";

    setTheme(nextTheme);
    setIsThemeReady(true);
  }, []);

  useEffect(() => {
    if (!isThemeReady) {
      return;
    }

    window.localStorage.setItem(ADMIN_THEME_STORAGE_KEY, theme);
  }, [theme, isThemeReady]);

  const resetForm = () => {
    setForm(EMPTY_FORM);
    setEditingId(null);
  };

  const startEdit = (product: AdminProduct) => {
    const primary = product.images.find((image) => image.isPrimary)?.url || product.images[0]?.url || "";
    const gallery = product.images.filter((image) => !image.isPrimary).map((image) => image.url).join("\n");

    setEditingId(product.id);
    setForm({
      name: product.name,
      slug: product.slug,
      description: product.description,
      categoryId: String(product.categoryId),
      primaryImage: primary,
      galleryImagesText: gallery,
      variants: product.variants.map((variant) => ({
        label: variant.label,
        price: variant.price,
        isDefault: variant.isDefault,
      })),
    });
  };

  const onSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setSaving(true);

    try {
      const payload = {
        name: form.name,
        slug: form.slug,
        description: form.description,
        categoryId: Number(form.categoryId),
        primaryImage: form.primaryImage,
        galleryImages: form.galleryImagesText
          .split("\n")
          .map((url) => url.trim())
          .filter(Boolean),
        variants: form.variants.map((variant, index) => ({
          label: variant.label,
          price: Number(variant.price),
          isDefault: Boolean(variant.isDefault) || index === 0,
        })),
      };

      const isEdit = Boolean(editingId);
      const response = await fetch(
        isEdit ? `/api/admin/products/${editingId}` : "/api/admin/products",
        {
          method: isEdit ? "PATCH" : "POST",
          credentials: "include",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify(payload),
        },
      );

      const json = (await response.json()) as { error?: string };
      if (!response.ok) {
        throw new Error(json.error || "Failed to save product");
      }

      setToast({ type: "success", message: isEdit ? "Product updated" : "Product created" });
      resetForm();
      await loadData();
    } catch (error) {
      setToast({
        type: "error",
        message: error instanceof Error ? error.message : "Failed to save product",
      });
    } finally {
      setSaving(false);
    }
  };

  const onDelete = async (productId: number) => {
    const confirmed = window.confirm("Delete this product?");
    if (!confirmed) {
      return;
    }

    setDeleteLoadingId(productId);
    try {
      const response = await fetch(`/api/admin/products/${productId}`, {
        method: "DELETE",
        credentials: "include",
      });

      const json = (await response.json()) as { error?: string };
      if (!response.ok) {
        throw new Error(json.error || "Failed to delete product");
      }

      setToast({ type: "success", message: "Product deleted" });
      if (editingId === productId) {
        resetForm();
      }
      await loadData();
    } catch (error) {
      setToast({
        type: "error",
        message: error instanceof Error ? error.message : "Failed to delete product",
      });
    } finally {
      setDeleteLoadingId(null);
    }
  };

  const onDeleteSelected = async () => {
    if (!selectedProductIds.length) {
      return;
    }

    const confirmed = window.confirm(`Delete ${selectedProductIds.length} selected product(s)?`);
    if (!confirmed) {
      return;
    }

    setBulkDeleting(true);
    try {
      const responses = await Promise.all(
        selectedProductIds.map((productId) =>
          fetch(`/api/admin/products/${productId}`, {
            method: "DELETE",
            credentials: "include",
          }),
        ),
      );

      const failed = responses.filter((response) => !response.ok).length;
      if (failed) {
        throw new Error(`Deleted ${selectedProductIds.length - failed} item(s), ${failed} failed.`);
      }

      setToast({ type: "success", message: `${selectedProductIds.length} product(s) deleted` });
      await loadData();
    } catch (error) {
      setToast({
        type: "error",
        message: error instanceof Error ? error.message : "Failed to delete selected products",
      });
    } finally {
      setBulkDeleting(false);
    }
  };

  if (!isThemeReady) {
    return <main className="admin-shell theme-dark min-h-screen bg-[#0f1115]" aria-hidden="true" />;
  }

  return (
    <main
      className={`admin-shell ${theme === "dark" ? "theme-dark" : "theme-light"} admin-products min-h-screen bg-[#f7f3ec] p-4 text-[#1f2328] sm:p-8`}
    >
      <div className="mx-auto max-w-7xl space-y-6">
        {toast ? (
          <div
            className={`rounded-xl border px-4 py-3 text-sm font-semibold ${
              toast.type === "success"
                ? "border-green-300 bg-green-50 text-green-700"
                : "border-red-300 bg-red-50 text-red-700"
            }`}
          >
            {toast.message}
          </div>
        ) : null}

        <header className="rounded-2xl border border-black/10 bg-white p-5 shadow-sm">
          <div className="flex flex-wrap items-center justify-between gap-3">
            <div>
              <p className="text-xs uppercase tracking-[0.2em] text-black/50">Essence Admin</p>
              <h1 className="mt-2 text-3xl font-semibold">Products Management</h1>
              <p className="mt-2 text-sm text-black/60">Add, update, and delete products, variants, and images.</p>
            </div>
            <div className="flex items-center gap-2">
              <Link
                href="/admin/reviews"
                className="rounded-lg border border-black/20 px-4 py-2 text-sm font-semibold transition hover:bg-black hover:text-white"
              >
                Moderate Reviews
              </Link>
              <button
                type="button"
                onClick={() => setTheme((previous) => (previous === "dark" ? "light" : "dark"))}
                className="admin-theme-toggle rounded-lg border px-4 py-2 text-sm font-semibold"
                aria-label={theme === "dark" ? "Switch to light mode" : "Switch to dark mode"}
                title={theme === "dark" ? "Switch to light mode" : "Switch to dark mode"}
              >
                {theme === "dark" ? "Light" : "Dark"}
              </button>
              <Link
                href="/admin"
                className="rounded-lg border border-black/20 px-4 py-2 text-sm font-semibold transition hover:bg-black hover:text-white"
              >
                Back to Dashboard
              </Link>
              <button
                type="button"
                onClick={() => void loadData()}
                className="rounded-lg border border-black/20 px-4 py-2 text-sm font-semibold transition hover:bg-black hover:text-white"
              >
                Refresh
              </button>
            </div>
          </div>
        </header>

        <section className="rounded-2xl border border-black/10 bg-white p-5 shadow-sm">
          <h2 className="text-xl font-semibold">{editingProduct ? `Edit: ${editingProduct.name}` : "Add New Product"}</h2>

          <form onSubmit={onSubmit} className="mt-4 space-y-4">
            <div className="grid gap-4 sm:grid-cols-2">
              <label className="block">
                <span className="mb-1 block text-xs font-semibold uppercase tracking-[0.12em] text-black/60">Name</span>
                <input
                  required
                  value={form.name}
                  onChange={(event) => setForm((previous) => ({ ...previous, name: event.target.value }))}
                  className="w-full rounded-lg border border-black/20 px-4 py-3 text-sm outline-none focus:border-black"
                />
              </label>

              <label className="block">
                <span className="mb-1 block text-xs font-semibold uppercase tracking-[0.12em] text-black/60">Slug (optional)</span>
                <input
                  value={form.slug}
                  onChange={(event) => setForm((previous) => ({ ...previous, slug: event.target.value }))}
                  className="w-full rounded-lg border border-black/20 px-4 py-3 text-sm outline-none focus:border-black"
                />
              </label>
            </div>

            <label className="block">
              <span className="mb-1 block text-xs font-semibold uppercase tracking-[0.12em] text-black/60">Description</span>
              <textarea
                required
                rows={3}
                value={form.description}
                onChange={(event) => setForm((previous) => ({ ...previous, description: event.target.value }))}
                className="w-full rounded-lg border border-black/20 px-4 py-3 text-sm outline-none focus:border-black"
              />
            </label>

            <div className="grid gap-4 sm:grid-cols-3">
              <label className="block">
                <span className="mb-1 block text-xs font-semibold uppercase tracking-[0.12em] text-black/60">Category</span>
                <select
                  required
                  value={form.categoryId}
                  onChange={(event) => setForm((previous) => ({ ...previous, categoryId: event.target.value }))}
                  className="w-full rounded-lg border border-black/20 px-4 py-3 text-sm outline-none focus:border-black"
                >
                  <option value="">Select category</option>
                  {categories.map((category) => (
                    <option key={category.id} value={category.id}>
                      {category.name}
                    </option>
                  ))}
                </select>
              </label>

              <label className="block sm:col-span-2">
                <span className="mb-1 block text-xs font-semibold uppercase tracking-[0.12em] text-black/60">Primary Image URL</span>
                <input
                  required
                  value={form.primaryImage}
                  onChange={(event) => setForm((previous) => ({ ...previous, primaryImage: event.target.value }))}
                  className="w-full rounded-lg border border-black/20 px-4 py-3 text-sm outline-none focus:border-black"
                />
                <p className="mt-1 text-xs text-black/50">Use `/image.jpg` for local images in `public/` or full `https://...` links. Avoid Windows paths like `D:\...`.</p>
              </label>
            </div>

            <label className="block">
              <span className="mb-1 block text-xs font-semibold uppercase tracking-[0.12em] text-black/60">Additional Image URLs (one per line)</span>
              <textarea
                rows={3}
                value={form.galleryImagesText}
                onChange={(event) => setForm((previous) => ({ ...previous, galleryImagesText: event.target.value }))}
                className="w-full rounded-lg border border-black/20 px-4 py-3 text-sm outline-none focus:border-black"
              />
            </label>

            <div>
              <div className="mb-2 flex items-center justify-between">
                <p className="text-xs font-semibold uppercase tracking-[0.12em] text-black/60">Variants</p>
                <button
                  type="button"
                  onClick={() =>
                    setForm((previous) => ({
                      ...previous,
                      variants: [...previous.variants, { label: "", price: 0, isDefault: false }],
                    }))
                  }
                  className="rounded-lg border border-black/20 px-3 py-1 text-xs font-semibold transition hover:bg-black hover:text-white"
                >
                  Add Variant
                </button>
              </div>

              <div className="space-y-2">
                {form.variants.map((variant, index) => (
                  <div key={`${variant.label}-${index}`} className="grid gap-2 sm:grid-cols-[1.2fr_1fr_auto_auto]">
                    <input
                      placeholder="Label (e.g. 50ml)"
                      value={variant.label}
                      onChange={(event) =>
                        setForm((previous) => {
                          const next = [...previous.variants];
                          next[index] = { ...next[index], label: event.target.value };
                          return { ...previous, variants: next };
                        })
                      }
                      className="rounded-lg border border-black/20 px-4 py-3 text-sm outline-none focus:border-black"
                    />
                    <input
                      type="number"
                      min={1}
                      placeholder="Price"
                      value={variant.price || ""}
                      onChange={(event) =>
                        setForm((previous) => {
                          const next = [...previous.variants];
                          next[index] = { ...next[index], price: Number(event.target.value || 0) };
                          return { ...previous, variants: next };
                        })
                      }
                      className="rounded-lg border border-black/20 px-4 py-3 text-sm outline-none focus:border-black"
                    />
                    <label className="inline-flex items-center gap-2 rounded-lg border border-black/20 px-3 py-3 text-sm">
                      <input
                        type="radio"
                        name="defaultVariant"
                        checked={Boolean(variant.isDefault)}
                        onChange={() =>
                          setForm((previous) => ({
                            ...previous,
                            variants: previous.variants.map((entry, entryIndex) => ({
                              ...entry,
                              isDefault: entryIndex === index,
                            })),
                          }))
                        }
                      />
                      Default
                    </label>
                    <button
                      type="button"
                      onClick={() =>
                        setForm((previous) => ({
                          ...previous,
                          variants: previous.variants.filter((_, entryIndex) => entryIndex !== index),
                        }))
                      }
                      disabled={form.variants.length <= 1}
                      className="rounded-lg border border-red-300 px-3 py-3 text-sm font-semibold text-red-600 transition hover:bg-red-50 disabled:cursor-not-allowed disabled:opacity-40"
                    >
                      Remove
                    </button>
                  </div>
                ))}
              </div>
            </div>

            <div className="flex flex-wrap items-center gap-2">
              <button
                type="submit"
                disabled={saving}
                className="rounded-lg bg-black px-5 py-3 text-sm font-semibold uppercase tracking-[0.12em] text-white transition hover:opacity-90 disabled:cursor-not-allowed disabled:opacity-60"
              >
                {saving ? "Saving..." : editingId ? "Update Product" : "Create Product"}
              </button>
              {editingId ? (
                <button
                  type="button"
                  onClick={resetForm}
                  className="rounded-lg border border-black/20 px-5 py-3 text-sm font-semibold uppercase tracking-[0.12em] transition hover:bg-black hover:text-white"
                >
                  Cancel Edit
                </button>
              ) : null}
            </div>
          </form>
        </section>

        <section className="rounded-2xl border border-black/10 bg-white p-5 shadow-sm">
          <div className="flex flex-wrap items-center justify-between gap-3">
            <h2 className="text-2xl font-semibold">Products</h2>
            <button
              type="button"
              onClick={() => void onDeleteSelected()}
              disabled={!selectedProductIds.length || bulkDeleting}
              className="rounded-lg border border-red-300 px-4 py-2 text-xs font-semibold uppercase tracking-[0.1em] text-red-600 transition hover:bg-red-50 disabled:cursor-not-allowed disabled:opacity-50"
            >
              {bulkDeleting ? "Deleting Selected..." : `Delete Selected (${selectedProductIds.length})`}
            </button>
          </div>
          {loading ? <p className="mt-3 text-sm text-black/60">Loading products...</p> : null}

          <div className="mt-4 overflow-x-auto">
            <table className="w-full min-w-[780px] border-collapse text-left text-sm">
              <thead>
                <tr className="border-b border-black/10 text-black/60">
                  <th className="px-2 py-2">
                    <input
                      type="checkbox"
                      aria-label="Select all products"
                      checked={products.length > 0 && selectedProductIds.length === products.length}
                      onChange={(event) =>
                        setSelectedProductIds(event.target.checked ? products.map((product) => product.id) : [])
                      }
                    />
                  </th>
                  <th className="px-2 py-2">Product</th>
                  <th className="px-2 py-2">Category</th>
                  <th className="px-2 py-2">Variants</th>
                  <th className="px-2 py-2">Actions</th>
                </tr>
              </thead>
              <tbody>
                {products.map((product) => (
                  <tr key={product.id} className="border-b border-black/5">
                    <td className="px-2 py-2 align-top">
                      <input
                        type="checkbox"
                        aria-label={`Select ${product.name}`}
                        checked={selectedProductIds.includes(product.id)}
                        onChange={(event) =>
                          setSelectedProductIds((previous) =>
                            event.target.checked
                              ? [...previous, product.id]
                              : previous.filter((id) => id !== product.id),
                          )
                        }
                      />
                    </td>
                    <td className="px-2 py-2 align-top">
                      <p className="font-semibold">{product.name}</p>
                      <p className="text-xs text-black/50">/{product.slug}</p>
                    </td>
                    <td className="px-2 py-2 align-top">{product.category.name}</td>
                    <td className="px-2 py-2 align-top">
                      {product.variants.map((variant) => `${variant.label}: ${formatPrice(variant.price)}`).join(" | ")}
                    </td>
                    <td className="px-2 py-2 align-top">
                      <div className="flex items-center gap-2">
                        <button
                          type="button"
                          onClick={() => startEdit(product)}
                          className="rounded-lg border border-black/20 px-3 py-2 text-xs font-semibold uppercase tracking-[0.1em] transition hover:bg-black hover:text-white"
                        >
                          Edit
                        </button>
                        <button
                          type="button"
                          onClick={() => void onDelete(product.id)}
                          disabled={deleteLoadingId === product.id}
                          className="rounded-lg border border-red-300 px-3 py-2 text-xs font-semibold uppercase tracking-[0.1em] text-red-600 transition hover:bg-red-50 disabled:cursor-not-allowed disabled:opacity-60"
                        >
                          {deleteLoadingId === product.id ? "Deleting..." : "Delete"}
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </section>
      </div>
    </main>
  );
}
