"use client";

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
} from "react";

export type Theme = "light" | "dark";

const STORAGE_KEY = "ws-theme";

interface ThemeContextValue {
  theme: Theme;
  /** True once mounted on the client — guards against hydration mismatch. */
  ready: boolean;
  toggle: () => void;
  setTheme: (t: Theme) => void;
}

const ThemeContext = createContext<ThemeContextValue | null>(null);

/** Read the theme the no-flash script already committed to <html>. SSR-safe. */
function currentTheme(): Theme {
  if (typeof document === "undefined") return "light";
  return document.documentElement.getAttribute("data-theme") === "dark"
    ? "dark"
    : "light";
}

function applyTheme(theme: Theme) {
  const root = document.documentElement;
  root.setAttribute("data-theme", theme);
  // Keep the browser chrome (URL bar, etc.) in step with the page.
  const meta = document.querySelector('meta[name="theme-color"]');
  if (meta) meta.setAttribute("content", theme === "dark" ? "#0b0b0c" : "#ffffff");
}

export function ThemeProvider({ children }: { children: React.ReactNode }) {
  const [theme, setThemeState] = useState<Theme>("light");
  const [ready, setReady] = useState(false);

  // Sync React state to whatever the inline script set before paint (defaults to
  // light), then arm CSS transitions (theme-ready) on the next frame so the
  // initial set is silent. The OS preference is intentionally not followed —
  // light is the default until the visitor explicitly toggles to dark.
  useEffect(() => {
    setThemeState(currentTheme());
    setReady(true);
    const root = document.documentElement;
    const raf = requestAnimationFrame(() => root.classList.add("theme-ready"));
    return () => cancelAnimationFrame(raf);
  }, []);

  const setTheme = useCallback((next: Theme) => {
    applyTheme(next);
    try {
      localStorage.setItem(STORAGE_KEY, next);
    } catch {
      /* private mode / storage disabled — runtime theme still works */
    }
    setThemeState(next);
  }, []);

  const toggle = useCallback(() => {
    setTheme(currentTheme() === "dark" ? "light" : "dark");
  }, [setTheme]);

  const value = useMemo(
    () => ({ theme, ready, toggle, setTheme }),
    [theme, ready, toggle, setTheme],
  );

  return <ThemeContext.Provider value={value}>{children}</ThemeContext.Provider>;
}

export function useTheme(): ThemeContextValue {
  const ctx = useContext(ThemeContext);
  if (!ctx) throw new Error("useTheme must be used within <ThemeProvider>");
  return ctx;
}

/**
 * Concrete canvas ink for the current theme, as an "r, g, b" triple to drop
 * into `rgba(...)` / `rgb(...)`. `role` picks which surface the canvas sits on:
 *   "primary" → ink on the main page (black in light, near-white in dark)
 *   "inverse" → ink on the inverted accent sections (the mirror of primary)
 *
 * Deterministic from context theme (server + first client render both resolve
 * "light"), so canvas/grid markup hydrates without mismatch, then flips after
 * mount. KEEP THESE VALUES IN SYNC with --ink-rgb / --ink-inverse-rgb in
 * globals.css.
 */
const INK: Record<Theme, { primary: string; inverse: string }> = {
  light: { primary: "0, 0, 0", inverse: "255, 255, 255" },
  dark: { primary: "245, 245, 245", inverse: "11, 11, 12" },
};

export function useThemeInk(role: "primary" | "inverse" = "primary"): string {
  const { theme } = useTheme();
  return INK[theme][role];
}
