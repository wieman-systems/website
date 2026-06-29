"use client";

import { useThemeInk } from "./ThemeProvider";

interface BlueprintGridProps {
  /** Which surface this grid sits on — picks the ink that flips with the theme. */
  tone?: "primary" | "inverse";
  opacity?: number;
  unit?: number;
  fade?: boolean;
  style?: React.CSSProperties;
}

export default function BlueprintGrid({
  tone = "primary",
  opacity = 0.05,
  unit = 48,
  fade = true,
  style,
}: BlueprintGridProps) {
  const ink = useThemeInk(tone);
  const line = `rgba(${ink}, ${opacity})`;

  return (
    <div
      aria-hidden
      style={{
        position: "absolute",
        inset: 0,
        pointerEvents: "none",
        backgroundImage: `linear-gradient(${line} 1px, transparent 1px), linear-gradient(90deg, ${line} 1px, transparent 1px)`,
        backgroundSize: `${unit}px ${unit}px`,
        maskImage: fade
          ? "radial-gradient(ellipse 120% 90% at 50% 35%, #000 35%, transparent 78%)"
          : undefined,
        WebkitMaskImage: fade
          ? "radial-gradient(ellipse 120% 90% at 50% 35%, #000 35%, transparent 78%)"
          : undefined,
        ...style,
      }}
    />
  );
}
