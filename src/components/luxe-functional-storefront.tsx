"use client";

import Storefront from "@/components/storefront";
import { useEffect, useState } from "react";

type ThemeMode = "dark" | "light";

const THEME_STORAGE_KEY = "merume-theme";

export default function LuxeFunctionalStorefront() {
  const [theme, setTheme] = useState<ThemeMode>("dark");
  const [isThemeReady, setIsThemeReady] = useState(false);

  useEffect(() => {
    const savedTheme = window.localStorage.getItem(THEME_STORAGE_KEY);
    const nextTheme =
      savedTheme === "dark" || savedTheme === "light"
        ? savedTheme
        : window.matchMedia("(prefers-color-scheme: dark)").matches
          ? "dark"
          : "light";

    // eslint-disable-next-line react-hooks/set-state-in-effect
    setTheme(nextTheme);
    setIsThemeReady(true);
  }, []);

  useEffect(() => {
    if (!isThemeReady) {
      return;
    }

    window.localStorage.setItem(THEME_STORAGE_KEY, theme);
  }, [theme, isThemeReady]);

  const toggleTheme = () => {
    setTheme((previous) => (previous === "dark" ? "light" : "dark"));
  };

  if (!isThemeReady) {
    return <div className="min-h-screen bg-[#0f1115]" aria-hidden="true" />;
  }

  return (
    <div className={`luxe-functional-storefront ${theme === "dark" ? "theme-dark" : "theme-light"}`}>
      <Storefront theme={theme} onToggleThemeAction={toggleTheme} />
    </div>
  );
}
