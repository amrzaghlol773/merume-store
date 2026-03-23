"use client";

import Link from "next/link";
import { OrderStatus } from "@prisma/client";
import { useEffect, useState } from "react";

type AdminOrder = {
  id: number;
  status: OrderStatus;
  governorate: string;
  streetAddress: string;
  subtotal: number;
  shippingFee: number;
  total: number;
  createdAt: string;
  customer: {
    fullName: string;
    phone: string;
  };
  items: Array<{
    id: number;
    product: { name: string };
    variantLabel: string | null;
    quantity: number;
    lineTotal: number;
  }>;
};

type AdminProduct = {
  id: number;
  name: string;
  category: { name: string };
  variants: Array<{ id: number; label: string; price: number }>;
};

type OrdersStats = {
  filteredRevenue: number;
  pendingOrders: number;
  todayOrders: number;
};

type ToastState = {
  type: "success" | "error";
  message: string;
};

type ThemeMode = "dark" | "light";

const STATUSES: OrderStatus[] = ["NEW", "CONFIRMED", "SHIPPED", "DELIVERED", "CANCELED"];
const ADMIN_THEME_STORAGE_KEY = "merume-admin-theme";

function formatPrice(price: number) {
  return `${price.toLocaleString("en-EG")} EGP`;
}

export default function AdminPage() {
  const [theme, setTheme] = useState<ThemeMode>("dark");
  const [isThemeReady, setIsThemeReady] = useState(false);
  const [orders, setOrders] = useState<AdminOrder[]>([]);
  const [products, setProducts] = useState<AdminProduct[]>([]);
  const [loading, setLoading] = useState(true);
  const [statusLoadingId, setStatusLoadingId] = useState<number | null>(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState<"ALL" | OrderStatus>("ALL");
  const [fromDate, setFromDate] = useState("");
  const [toDate, setToDate] = useState("");
  const [sortOrder, setSortOrder] = useState<"newest" | "oldest">("newest");
  const [page, setPage] = useState(1);
  const [pagination, setPagination] = useState({ page: 1, pageSize: 10, total: 0, totalPages: 1 });
  const [stats, setStats] = useState<OrdersStats>({ filteredRevenue: 0, pendingOrders: 0, todayOrders: 0 });
  const [toast, setToast] = useState<ToastState | null>(null);

  const loadData = async (
    targetPage = page,
    query = searchQuery,
    status = statusFilter,
    from = fromDate,
    to = toDate,
    sort = sortOrder,
  ) => {
    setLoading(true);
    try {
      const params = new URLSearchParams({
        page: String(targetPage),
        pageSize: "10",
        sort,
      });

      if (query.trim()) {
        params.set("q", query.trim());
      }

      if (status !== "ALL") {
        params.set("status", status);
      }

      if (from) {
        params.set("from", from);
      }

      if (to) {
        params.set("to", to);
      }

      const [ordersRes, productsRes] = await Promise.all([
        fetch(`/api/admin/orders?${params.toString()}`, { cache: "no-store" }),
        fetch("/api/admin/products", { cache: "no-store" }),
      ]);

      const ordersJson = (await ordersRes.json()) as {
        orders?: AdminOrder[];
        pagination?: { page: number; pageSize: number; total: number; totalPages: number };
        stats?: OrdersStats;
        error?: string;
      };
      const productsJson = await productsRes.json();

      if (!ordersRes.ok || !productsRes.ok) {
        throw new Error(ordersJson.error || productsJson.error || "Failed to load admin data");
      }

      setOrders(ordersJson.orders || []);
      setPagination(ordersJson.pagination || { page: 1, pageSize: 10, total: 0, totalPages: 1 });
      setStats(ordersJson.stats || { filteredRevenue: 0, pendingOrders: 0, todayOrders: 0 });
      setPage(ordersJson.pagination?.page || 1);
      setProducts(productsJson.products || []);
    } catch (error) {
      console.error(error);
      setToast({
        type: "error",
        message: error instanceof Error ? error.message : "Failed to load admin data",
      });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    void loadData();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    const timer = window.setTimeout(() => {
      void loadData(1, searchQuery, statusFilter, fromDate, toDate, sortOrder);
    }, 250);

    return () => window.clearTimeout(timer);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [searchQuery, statusFilter, fromDate, toDate, sortOrder]);

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

  const onStatusChange = async (orderId: number, status: OrderStatus) => {
    setStatusLoadingId(orderId);
    try {
      const response = await fetch(`/api/admin/orders/${orderId}`, {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ status }),
      });

      if (!response.ok) {
        const json = await response.json();
        throw new Error(json.error || "Failed to update status");
      }

      setOrders((previous) =>
        previous.map((order) => (order.id === orderId ? { ...order, status } : order)),
      );
      setToast({ type: "success", message: `Order #${orderId} updated to ${status}` });
    } catch (error) {
      console.error(error);
      setToast({
        type: "error",
        message: error instanceof Error ? error.message : "Failed to update status",
      });
    } finally {
      setStatusLoadingId(null);
    }
  };

  const onLogout = async () => {
    try {
      await fetch("/api/admin/logout", {
        method: "POST",
      });
      window.location.href = "/admin/login";
    } catch {
      setToast({ type: "error", message: "Logout failed. Try again." });
    }
  };

  const onExportCsv = () => {
    const params = new URLSearchParams({
      sort: sortOrder,
    });

    if (searchQuery.trim()) {
      params.set("q", searchQuery.trim());
    }

    if (statusFilter !== "ALL") {
      params.set("status", statusFilter);
    }

    if (fromDate) {
      params.set("from", fromDate);
    }

    if (toDate) {
      params.set("to", toDate);
    }

    window.open(`/api/admin/orders/export?${params.toString()}`, "_blank", "noopener");
  };

  if (!isThemeReady) {
    return <main className="admin-shell theme-dark min-h-screen bg-[#0f1115]" aria-hidden="true" />;
  }

  return (
    <main
      className={`admin-shell ${theme === "dark" ? "theme-dark" : "theme-light"} admin-dashboard min-h-screen bg-[#f7f3ec] p-4 text-[#1f2328] sm:p-8`}
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
          <div className="flex items-start justify-between gap-4">
            <div>
              <p className="text-xs uppercase tracking-[0.2em] text-black/50">Essence Admin</p>
              <h1 className="mt-2 text-3xl font-semibold">Dashboard</h1>
              <p className="mt-2 text-sm text-black/60">Track orders and monitor product catalog.</p>
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
              <button
                type="button"
                onClick={() => void onLogout()}
                className="rounded-lg border border-black/20 px-4 py-2 text-sm font-semibold transition hover:bg-black hover:text-white"
              >
                Logout
              </button>
            </div>
          </div>
        </header>

        {loading ? (
          <div className="rounded-2xl border border-black/10 bg-white p-5">Loading...</div>
        ) : null}

        <section className="grid gap-3 sm:grid-cols-3">
          <article className="rounded-xl border border-black/10 bg-white p-4 shadow-sm">
            <p className="text-xs uppercase tracking-[0.12em] text-black/50">Filtered Revenue</p>
            <p className="mt-1 text-2xl font-semibold">{formatPrice(stats.filteredRevenue)}</p>
          </article>
          <article className="rounded-xl border border-black/10 bg-white p-4 shadow-sm">
            <p className="text-xs uppercase tracking-[0.12em] text-black/50">Pending Orders</p>
            <p className="mt-1 text-2xl font-semibold">{stats.pendingOrders}</p>
          </article>
          <article className="rounded-xl border border-black/10 bg-white p-4 shadow-sm">
            <p className="text-xs uppercase tracking-[0.12em] text-black/50">Today Orders</p>
            <p className="mt-1 text-2xl font-semibold">{stats.todayOrders}</p>
          </article>
        </section>

        <section className="rounded-2xl border border-black/10 bg-white p-5 shadow-sm">
          <div className="flex items-center justify-between">
            <h2 className="text-2xl font-semibold">Orders</h2>
            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={onExportCsv}
                className="rounded-lg border border-black/20 px-4 py-2 text-sm font-semibold transition hover:bg-black hover:text-white"
              >
                Export CSV
              </button>
              <button
                type="button"
                onClick={() => void loadData(page, searchQuery, statusFilter, fromDate, toDate, sortOrder)}
                className="rounded-lg border border-black/20 px-4 py-2 text-sm font-semibold transition hover:bg-black hover:text-white"
              >
                Refresh
              </button>
            </div>
          </div>
          <div className="mt-4 grid gap-3 sm:grid-cols-5">
            <label className="block sm:col-span-2">
              <span className="mb-1 block text-xs font-semibold uppercase tracking-[0.12em] text-black/60">Search</span>
              <input
                type="text"
                placeholder="Order ID, customer name, phone, governorate"
                value={searchQuery}
                onChange={(event) => setSearchQuery(event.target.value)}
                className="w-full rounded-lg border border-black/20 px-4 py-3 text-sm outline-none focus:border-black"
              />
            </label>
            <label className="block">
              <span className="mb-1 block text-xs font-semibold uppercase tracking-[0.12em] text-black/60">Status</span>
              <select
                value={statusFilter}
                onChange={(event) => setStatusFilter(event.target.value as "ALL" | OrderStatus)}
                className="w-full rounded-lg border border-black/20 px-4 py-3 text-sm outline-none focus:border-black"
              >
                <option value="ALL">ALL</option>
                {STATUSES.map((status) => (
                  <option key={status} value={status}>
                    {status}
                  </option>
                ))}
              </select>
            </label>
            <label className="block">
              <span className="mb-1 block text-xs font-semibold uppercase tracking-[0.12em] text-black/60">From</span>
              <input
                type="date"
                value={fromDate}
                onChange={(event) => setFromDate(event.target.value)}
                className="w-full rounded-lg border border-black/20 px-4 py-3 text-sm outline-none focus:border-black"
              />
            </label>
            <label className="block">
              <span className="mb-1 block text-xs font-semibold uppercase tracking-[0.12em] text-black/60">To</span>
              <input
                type="date"
                value={toDate}
                onChange={(event) => setToDate(event.target.value)}
                className="w-full rounded-lg border border-black/20 px-4 py-3 text-sm outline-none focus:border-black"
              />
            </label>
            <label className="block sm:col-span-2">
              <span className="mb-1 block text-xs font-semibold uppercase tracking-[0.12em] text-black/60">Sort</span>
              <select
                value={sortOrder}
                onChange={(event) => setSortOrder(event.target.value as "newest" | "oldest")}
                className="w-full rounded-lg border border-black/20 px-4 py-3 text-sm outline-none focus:border-black"
              >
                <option value="newest">Newest first</option>
                <option value="oldest">Oldest first</option>
              </select>
            </label>
          </div>
          <div className="mt-4 space-y-4">
            {!orders.length ? <p className="text-black/60">No orders yet.</p> : null}
            {orders.map((order) => (
              <article key={order.id} className="rounded-xl border border-black/10 p-4">
                <div className="flex flex-col justify-between gap-3 sm:flex-row sm:items-center">
                  <div>
                    <p className="text-xs uppercase tracking-[0.15em] text-black/50">Order #{order.id}</p>
                    <h3 className="text-lg font-semibold">{order.customer.fullName}</h3>
                    <p className="text-sm text-black/60">{order.customer.phone}</p>
                    <p className="text-sm text-black/60">{order.governorate} - {order.streetAddress}</p>
                    <p className="text-xs text-black/45">{new Date(order.createdAt).toLocaleString("en-EG")}</p>
                  </div>
                  <div className="flex items-center gap-2">
                    <select
                      className="rounded-lg border border-black/20 px-3 py-2 text-sm"
                      value={order.status}
                      disabled={statusLoadingId === order.id}
                      onChange={(event) => void onStatusChange(order.id, event.target.value as OrderStatus)}
                    >
                      {STATUSES.map((status) => (
                        <option key={status} value={status}>
                          {status}
                        </option>
                      ))}
                    </select>
                  </div>
                </div>

                <div className="mt-3 space-y-1 text-sm text-black/75">
                  {order.items.map((item) => (
                    <p key={item.id}>
                      - {item.product.name}
                      {item.variantLabel ? ` ${item.variantLabel}` : ""} x{item.quantity} = {formatPrice(item.lineTotal)}
                    </p>
                  ))}
                </div>

                <div className="mt-3 flex flex-wrap gap-4 text-sm font-semibold">
                  <span>Subtotal: {formatPrice(order.subtotal)}</span>
                  <span>Shipping: {formatPrice(order.shippingFee)}</span>
                  <span>Total: {formatPrice(order.total)}</span>
                </div>
              </article>
            ))}
          </div>
          <div className="mt-5 flex flex-wrap items-center justify-between gap-3 border-t border-black/10 pt-4">
            <p className="text-sm text-black/60">
              Showing page {pagination.page} of {pagination.totalPages} ({pagination.total} orders)
            </p>
            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={() =>
                  void loadData(Math.max(1, page - 1), searchQuery, statusFilter, fromDate, toDate, sortOrder)
                }
                disabled={page <= 1}
                className="rounded-lg border border-black/20 px-3 py-2 text-sm font-semibold transition hover:bg-black hover:text-white disabled:cursor-not-allowed disabled:opacity-50"
              >
                Prev
              </button>
              <button
                type="button"
                onClick={() =>
                  void loadData(Math.min(pagination.totalPages, page + 1), searchQuery, statusFilter, fromDate, toDate, sortOrder)
                }
                disabled={page >= pagination.totalPages}
                className="rounded-lg border border-black/20 px-3 py-2 text-sm font-semibold transition hover:bg-black hover:text-white disabled:cursor-not-allowed disabled:opacity-50"
              >
                Next
              </button>
            </div>
          </div>
        </section>

        <section className="rounded-2xl border border-black/10 bg-white p-5 shadow-sm">
          <div className="flex items-center justify-between gap-2">
            <h2 className="text-2xl font-semibold">Products (Read-only)</h2>
            <div className="flex items-center gap-2">
              <Link
                href="/admin/reviews"
                className="rounded-lg border border-black/20 px-4 py-2 text-sm font-semibold transition hover:bg-black hover:text-white"
              >
                Moderate Reviews
              </Link>
              <Link
                href="/admin/products"
                className="rounded-lg border border-black/20 px-4 py-2 text-sm font-semibold transition hover:bg-black hover:text-white"
              >
                Manage Products
              </Link>
            </div>
          </div>
          <div className="mt-4 overflow-x-auto">
            <table className="w-full min-w-[560px] border-collapse text-left text-sm">
              <thead>
                <tr className="border-b border-black/10 text-black/60">
                  <th className="px-2 py-2">Product</th>
                  <th className="px-2 py-2">Category</th>
                  <th className="px-2 py-2">Variants</th>
                </tr>
              </thead>
              <tbody>
                {products.map((product) => (
                  <tr key={product.id} className="border-b border-black/5">
                    <td className="px-2 py-2 font-medium">{product.name}</td>
                    <td className="px-2 py-2">{product.category.name}</td>
                    <td className="px-2 py-2">
                      {product.variants.map((variant) => `${variant.label}: ${formatPrice(variant.price)}`).join(" | ")}
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
