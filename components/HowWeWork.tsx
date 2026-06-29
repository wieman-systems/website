import SectionHead from "./SectionHead";
import Plus from "./Plus";
import Reveal from "./Reveal";
import ScrambleText from "./ScrambleText";
import BlueprintGrid from "./BlueprintGrid";

const SECTION_MASK =
  "linear-gradient(to bottom, transparent, #000 16%, #000 84%, transparent)";

const steps = [
  {
    id: "01",
    title: "Map",
    desc: "We trace the manual work across your team and pinpoint exactly what is worth automating.",
  },
  {
    id: "02",
    title: "Build",
    desc: "We design and build the system around your real workflow — integrated with the tools you already use.",
  },
  {
    id: "03",
    title: "Run",
    desc: "We host, monitor, and keep improving it. You get the output, not the upkeep.",
  },
];

export default function HowWeWork() {
  return (
    <section
      style={{
        position: "relative",
        background: "var(--surface-2)",
        borderTop: "1px solid var(--fg)",
        overflow: "hidden",
      }}
    >
      <BlueprintGrid
        opacity={0.05}
        unit={52}
        fade={false}
        style={{ maskImage: SECTION_MASK, WebkitMaskImage: SECTION_MASK }}
      />
      <div
        className="ws-wrap"
        style={{
          position: "relative",
          zIndex: 1,
          padding: "clamp(72px, 11vh, 128px) var(--gutter)",
        }}
      >
        <SectionHead
          index="02"
          label="How we work"
          title="Three phases. One operator."
        />
        <p
          style={{
            fontFamily: "var(--font-display), sans-serif",
            fontSize: "clamp(16px, 1.4vw, 19px)",
            lineHeight: 1.6,
            color: "rgba(var(--ink-rgb), 0.72)",
            maxWidth: 560,
            marginTop: -28,
            marginBottom: "clamp(48px, 7vh, 72px)",
          }}
        >
          You work directly with the engineer who builds your system — from the
          first map to the system running in production.
        </p>
        <div className="proc-grid">
          {steps.map((s, i) => (
            <Reveal className="proc-step" key={s.id} delay={i * 0.09}>
              <div
                style={{
                  display: "flex",
                  alignItems: "center",
                  gap: 12,
                  marginBottom: 22,
                }}
              >
                <ScrambleText
                  text={s.id}
                  style={{
                    fontFamily: "var(--font-mono), monospace",
                    fontWeight: 700,
                    fontSize: 13,
                    letterSpacing: "0.12em",
                  }}
                />
                <span
                  style={{
                    flex: 1,
                    height: 1,
                    background: "var(--fg)",
                    opacity: 0.18,
                  }}
                />
                <Plus size={11} opacity={0.4} />
              </div>
              <h3
                style={{
                  fontFamily: "var(--font-display), sans-serif",
                  fontWeight: 700,
                  fontSize: "clamp(24px, 2.4vw, 30px)",
                  letterSpacing: "-0.02em",
                  marginBottom: 14,
                }}
              >
                <ScrambleText text={s.title} />
              </h3>
              <p
                style={{
                  fontFamily: "var(--font-display), sans-serif",
                  fontSize: 16,
                  lineHeight: 1.6,
                  color: "rgba(var(--ink-rgb), 0.72)",
                  maxWidth: 320,
                }}
              >
                {s.desc}
              </p>
            </Reveal>
          ))}
        </div>
      </div>
    </section>
  );
}
