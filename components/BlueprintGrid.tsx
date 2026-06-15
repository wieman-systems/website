interface BlueprintGridProps {
  color?: string;
  opacity?: number;
  unit?: number;
  fade?: boolean;
  style?: React.CSSProperties;
}

export default function BlueprintGrid({
  color = "#000",
  opacity = 0.05,
  unit = 48,
  fade = true,
  style,
}: BlueprintGridProps) {
  const hex = color.replace("#", "");
  const r = parseInt(hex.slice(0, 2), 16);
  const g = parseInt(hex.slice(2, 4), 16);
  const b = parseInt(hex.slice(4, 6), 16);
  const line = `rgba(${r},${g},${b},${opacity})`;

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
