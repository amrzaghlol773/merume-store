"use client";

import { useRouter } from "next/navigation";
import { FormEvent, useEffect, useState } from "react";

type ThemeMode = "dark" | "light";

const ADMIN_THEME_STORAGE_KEY = "merume-admin-theme";

export default function AdminLoginPage() {
  const router = useRouter();
  const [theme, setTheme] = useState<ThemeMode>("dark");
  const [isThemeReady, setIsThemeReady] = useState(false);
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

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

  const onSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setError("");
    setLoading(true);

    try {
      const response = await fetch("/api/admin/login", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ username, password }),
      });

      const json = (await response.json()) as { error?: string };
      if (!response.ok) {
        throw new Error(json.error || "Invalid credentials");
      }

      router.replace("/admin");
      router.refresh();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Login failed");
    } finally {
      setLoading(false);
    }
  };

  if (!isThemeReady) {
    return <main className="admin-login-shell theme-dark min-h-screen bg-[#0f1115]" aria-hidden="true" />;
  }

  return (
    <main
      className={`admin-login-shell ${theme === "dark" ? "theme-dark" : "theme-light"} relative flex min-h-screen items-center justify-center bg-[#f7f3ec] p-4`}
    >
      <button
        type="button"
        onClick={() => setTheme((previous) => (previous === "dark" ? "light" : "dark"))}
        className="admin-theme-toggle absolute right-4 top-4 rounded-lg border px-4 py-2 text-sm font-semibold"
        aria-label={theme === "dark" ? "Switch to light mode" : "Switch to dark mode"}
        title={theme === "dark" ? "Switch to light mode" : "Switch to dark mode"}
      >
        {theme === "dark" ? "Light" : "Dark"}
      </button>
      <form
        onSubmit={onSubmit}
        className="w-full max-w-md rounded-2xl border border-black/10 bg-white p-6 shadow-sm"
      >
        <p className="text-xs uppercase tracking-[0.2em] text-black/50">Essence Admin</p>
        <h1 className="mt-2 text-3xl font-semibold text-[#1f2328]">Login</h1>

        <div className="mt-5 space-y-4">
          <label className="block">
            <span className="mb-1 block text-xs font-semibold uppercase tracking-[0.12em] text-black/60">Username</span>
            <input
              type="text"
              required
              value={username}
              onChange={(event) => setUsername(event.target.value)}
              className="w-full rounded-lg border border-black/20 px-4 py-3 outline-none focus:border-[#1f2328]"
            />
          </label>

          <label className="block">
            <span className="mb-1 block text-xs font-semibold uppercase tracking-[0.12em] text-black/60">Password</span>
            <input
              type="password"
              required
              value={password}
              onChange={(event) => setPassword(event.target.value)}
              className="w-full rounded-lg border border-black/20 px-4 py-3 outline-none focus:border-[#1f2328]"
            />
          </label>
        </div>

        {error ? <p className="mt-3 text-sm font-semibold text-red-600">{error}</p> : null}

        <button
          type="submit"
          disabled={loading}
          className="mt-5 w-full rounded-lg bg-[#1f2328] px-4 py-3 text-sm font-semibold uppercase tracking-[0.12em] text-white transition hover:opacity-90 disabled:cursor-not-allowed disabled:opacity-60"
        >
          {loading ? "Signing In..." : "Sign In"}
        </button>
      </form>
    </main>
  );
}
