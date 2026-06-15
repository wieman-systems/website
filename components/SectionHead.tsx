import ScrambleText from "./ScrambleText";

interface SectionHeadProps {
  index: string;
  label: string;
  title: string;
  dark?: boolean;
  align?: "left" | "center";
  maxTitle?: number;
}

export default function SectionHead({
  index,
  label,
  title,
  dark = false,
  align = "left",
  maxTitle = 760,
}: SectionHeadProps) {
  const labelColor = dark ? "var(--color-gray-400)" : "var(--color-gray-600)";
  const ruleColor = dark ? "#fff" : "#000";

  return (
    <div
      style={{
        textAlign: align,
        maxWidth: align === "center" ? maxTitle : undefined,
        marginLeft: align === "center" ? "auto" : 0,
        marginRight: align === "center" ? "auto" : 0,
        marginBottom: "clamp(40px, 6vh, 64px)",
      }}
    >
      <div
        className="eyebrow"
        style={{
          fontFamily: "var(--font-mono), monospace",
          color: labelColor,
          marginBottom: 20,
          justifyContent: align === "center" ? "center" : "flex-start",
        }}
      >
        <ScrambleText
          text={index}
          style={{
            fontFamily: "var(--font-mono), monospace",
            fontWeight: 700,
            color: ruleColor,
          }}
        />
        <span
          style={{
            width: 22,
            height: 1,
            background: ruleColor,
            opacity: 0.35,
            display: "inline-block",
          }}
        />
        <ScrambleText text={label} />
      </div>
      <h2
        style={{
          fontFamily: "var(--font-display), sans-serif",
          fontWeight: 700,
          fontSize: "clamp(28px, 4vw, 46px)",
          letterSpacing: "-0.03em",
          lineHeight: 1.1,
          color: ruleColor,
          textWrap: "balance" as never,
          maxWidth: maxTitle,
          marginLeft: align === "center" ? "auto" : 0,
          marginRight: align === "center" ? "auto" : 0,
        }}
      >
        {title}
      </h2>
    </div>
  );
}
