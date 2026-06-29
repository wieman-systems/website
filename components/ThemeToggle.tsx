"use client";

import { useTheme } from "./ThemeProvider";

/**
 * Color-invert toggle. A half-filled "contrast" disc — the brand's monochrome
 * language — that rotates 180° when the theme flips, so the dark half swaps
 * sides and the control literally reads as "invert the colors". Uses
 * currentColor (→ --fg) so it adapts to whichever theme is active.
 */
export default function ThemeToggle() {
  const { theme, ready, toggle } = useTheme();
  const isDark = ready && theme === "dark";

  return (
    <button
      type="button"
      onClick={toggle}
      className={`ws-theme-toggle${isDark ? " is-dark" : ""}${ready ? " is-ready" : ""}`}
      aria-label={
        ready
          ? `Switch to ${isDark ? "light" : "dark"} theme`
          : "Toggle color theme"
      }
      aria-pressed={isDark}
      title={ready ? `Switch to ${isDark ? "light" : "dark"} theme` : "Toggle color theme"}
      data-cursor
    >
      <svg
        viewBox="0 0 20 20"
        width="18"
        height="18"
        aria-hidden="true"
        focusable="false"
        className="ws-theme-toggle__glyph"
      >
        <circle
          cx="10"
          cy="10"
          r="8"
          fill="none"
          stroke="currentColor"
          strokeWidth="1.5"
        />
        {/* right half filled — the "ink" side */}
        <path d="M10 2 A8 8 0 0 1 10 18 Z" fill="currentColor" />
      </svg>
    </button>
  );
}
