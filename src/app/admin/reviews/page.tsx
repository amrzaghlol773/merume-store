"use client";

import Link from "next/link";
import Image from "next/image";
import { ReviewStatus } from "@prisma/client";
import { useEffect, useState } from "react";

type AdminReview = {
  id: number;
  rating: number;
  comment: string;
  customerName: string;
  customerPhone: string;
  status: ReviewStatus;
  createdAt: string;
  product: {
    id: number;
    name: string;
    slug: string;
  };
  order: {
    id: number;
    status: string;
    customer: {
      fullName: string;
      phone: string;
    };
  };
  images: Array<{ id: number; url: string }>;
};

type ToastState = {
  type: "success" | "error";
  message: string;
};

type ThemeMode = "dark" | "light";

const ADMIN_THEME_STORAGE_KEY = "merume-admin-theme";
const STATUS_OPTIONS: Array<"ALL" | ReviewStatus> = ["ALL", "PENDING", "APPROVED", "REJECTED"];

function formatDate(value: string) {
  return new Date(value).toLocaleString("en-EG");
}

function stars(rating: number) {
  return "★".repeat(Math.max(1, Math.min(5, rating)));
}

export default function AdminReviewsPage() {
  const [theme, setTheme] = useState<ThemeMode>("dark");
  const [isThemeReady, setIsThemeReady] = useState(false);

  const [reviews, setReviews] = useState<AdminReview[]>([]);
  const [loading, setLoading] = useState(true);
  const [statusFilter, setStatusFilter] = useState<"ALL" | ReviewStatus>("ALL");
  const [query, setQuery] = useState("");
  const [statusUpdatingId, setStatusUpdatingId] = useState<number | null>(null);
  const [toast, setToast] = useState<ToastState | null>(null);

  const loadReviews = async (status = statusFilter, q = query) => {
    setLoading(true);
    try {
      const params = new URLSearchParams();
      if (status !== "ALL") {
        params.set("status", status);
      }

      if (q.trim()) {
        params.set("q", q.trim());
      }

      const response = await fetch(`/api/admin/reviews?${params.toString()}`, { cache: "no-store" });
      const json = (await response.json()) as { reviews?: AdminReview[]; error?: string };

      if (!response.ok) {
        throw new Error(json.error || "Failed to load reviews");
      }

      setReviews(json.reviews || []);
    } catch (error) {
      setToast({
        type: "error",
        message: error instanceof Error ? error.message : "Failed to load reviews",
      });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    void loadReviews();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    const timer = window.setTimeout(() => {
      void loadReviews(statusFilter, query);
    }, 250);

    return () => window.clearTimeout(timer);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [statusFilter, query]);

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

  useEffect(() => {
    if (!toast) {
      return;
    }

    const timer = window.setTimeout(() => setToast(null), 2500);
    return () => window.clearTimeout(timer);
  }, [toast]);

  const onStatusChange = async (reviewId: number, status: ReviewStatus) => {
    setStatusUpdatingId(reviewId);
    try {
      const response = await fetch(`/api/admin/reviews/${reviewId}`, {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ status }),
      });

      const json = (await response.json()) as { error?: string };
      if (!response.ok) {
        throw new Error(json.error || "Failed to update review");
      }

      setReviews((previous) => previous.map((review) => (review.id === reviewId ? { ...review, status } : review)));
      setToast({ type: "success", message: `Review #${reviewId} updated to ${status}` });
    } catch (error) {
      setToast({
        type: "error",
        message: error instanceof Error ? error.message : "Failed to update review",
      });
    } finally {
      setStatusUpdatingId(null);
    }
  };

  if (!isThemeReady) {
    return <main className="admin-shell theme-dark min-h-screen bg-[#0f1115]" aria-hidden="true" />;
  }

  return (
    <main
      className={`admin-shell ${theme === "dark" ? "theme-dark" : "theme-light"} min-h-screen bg-[#f7f3ec] p-4 text-[#1f2328] sm:p-8`}
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
              <h1 className="mt-2 text-3xl font-semibold">Reviews Moderation</h1>
              <p className="mt-2 text-sm text-black/60">Approve or reject customer reviews with uploaded photos.</p>
            </div>
            <div className="flex items-center gap-2">
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
                onClick={() => void loadReviews()}
                className="rounded-lg border border-black/20 px-4 py-2 text-sm font-semibold transition hover:bg-black hover:text-white"
              >
                Refresh
              </button>
            </div>
          </div>
        </header>

        <section className="rounded-2xl border border-black/10 bg-white p-5 shadow-sm">
          <div className="grid gap-3 sm:grid-cols-[1.1fr_0.9fr]">
            <label className="block">
              <span className="mb-1 block text-xs font-semibold uppercase tracking-[0.12em] text-black/60">Search</span>
              <input
                type="text"
                placeholder="Customer, product, phone, or order ID"
                value={query}
                onChange={(event) => setQuery(event.target.value)}
                className="w-full rounded-lg border border-black/20 px-4 py-3 text-sm outline-none focus:border-black"
              />
            </label>
            <label className="block">
              <span className="mb-1 block text-xs font-semibold uppercase tracking-[0.12em] text-black/60">Status</span>
              <select
                value={statusFilter}
                onChange={(event) => setStatusFilter(event.target.value as "ALL" | ReviewStatus)}
                className="w-full rounded-lg border border-black/20 px-4 py-3 text-sm outline-none focus:border-black"
              >
                {STATUS_OPTIONS.map((status) => (
                  <option key={status} value={status}>
                    {status}
                  </option>
                ))}
              </select>
            </label>
          </div>

          <div className="mt-5 space-y-4">
            {loading ? <p className="text-black/60">Loading reviews...</p> : null}
            {!loading && !reviews.length ? <p className="text-black/60">No reviews found.</p> : null}

            {!loading
              ? reviews.map((review) => (
                  <article key={review.id} className="rounded-xl border border-black/10 p-4">
                    <div className="flex flex-wrap items-start justify-between gap-4">
                      <div>
                        <p className="text-xs uppercase tracking-[0.12em] text-black/50">Review #{review.id}</p>
                        <h3 className="mt-1 text-xl font-semibold">{review.product.name}</h3>
                        <p className="mt-1 text-sm text-black/65">Order #{review.order.id} • {formatDate(review.createdAt)}</p>
                        <p className="mt-1 text-sm text-black/65">{review.customerName} • {review.customerPhone}</p>
                        <p className="mt-2 text-sm font-semibold text-luxuryGold">{stars(review.rating)} ({review.rating}/5)</p>
                      </div>
                      <select
                        className="rounded-lg border border-black/20 px-3 py-2 text-sm"
                        value={review.status}
                        disabled={statusUpdatingId === review.id}
                        onChange={(event) => void onStatusChange(review.id, event.target.value as ReviewStatus)}
                      >
                        <option value="PENDING">PENDING</option>
                        <option value="APPROVED">APPROVED</option>
                        <option value="REJECTED">REJECTED</option>
                      </select>
                    </div>

                    <p className="mt-3 whitespace-pre-wrap text-sm leading-relaxed text-black/80">{review.comment}</p>

                    {review.images.length ? (
                      <div className="mt-3 grid gap-2 sm:grid-cols-3">
                        {review.images.map((image) => (
                          <a
                            key={image.id}
                            href={image.url}
                            target="_blank"
                            rel="noreferrer"
                            className="overflow-hidden rounded-lg border border-black/10 bg-[#f7f3ec]"
                          >
                            <Image src={image.url} alt={`Review ${review.id}`} width={360} height={160} className="h-32 w-full object-cover" />
                          </a>
                        ))}
                      </div>
                    ) : null}
                  </article>
                ))
              : null}
          </div>
        </section>
      </div>
    </main>
  );
}
