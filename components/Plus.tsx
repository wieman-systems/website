interface PlusProps {
  size?: number;
  stroke?: number;
  color?: string;
  opacity?: number;
  style?: React.CSSProperties;
}

export default function Plus({
  size = 16,
  stroke = 1,
  color = "#000",
  opacity = 1,
  style,
}: PlusProps) {
  const h = size / 2;
  return (
    <svg
      width={size}
      height={size}
      viewBox={`0 0 ${size} ${size}`}
      aria-hidden
      style={{ display: "block", overflow: "visible", opacity, flexShrink: 0, ...style }}
    >
      <line x1={h} y1="0" x2={h} y2={size} stroke={color} strokeWidth={stroke} />
      <line x1="0" y1={h} x2={size} y2={h} stroke={color} strokeWidth={stroke} />
    </svg>
  );
}
