import SectionHead from "./SectionHead";
import Reveal from "./Reveal";
import ScrambleText from "./ScrambleText";
import BlueprintGrid from "./BlueprintGrid";

const SECTION_MASK =
  "linear-gradient(to bottom, transparent, #000 16%, #000 84%, transparent)";

const items = [
  {
    id: "01",
    title: "Custom AI Systems",
    desc: "Automation and data pipelines built around how your business actually runs — not an off-the-shelf template.",
  },
  {
    id: "02",
    title: "Intelligent Dashboards",
    desc: "Real-time, role-based dashboards that turn scattered data into decisions your team can act on.",
  },
  {
    id: "03",
    title: "Built & Managed",
    desc: "We host, monitor, and keep optimizing the system, so it just works — month after month.",
  },
];

export default function WhatWeDo() {
  return (
    <section
      style={{ position: "relative", borderTop: "1px solid var(--fg)", overflow: "hidden" }}
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
          index="01"
          label="What we do"
          title="Systems built, run, and owned end-to-end."
        />
        <div className="wd-grid">
          {items.map((it, i) => (
            <Reveal className="wd-item" key={it.id} delay={i * 0.09}>
              <div
                style={{
                  fontFamily: "var(--font-mono), monospace",
                  fontSize: 12,
                  letterSpacing: "0.18em",
                  color: "var(--text-muted)",
                  marginBottom: 24,
                }}
              >
                <ScrambleText text={it.id} />
              </div>
              <h3
                className="wd-title"
                style={{
                  marginBottom: 16,
                  fontFamily: "var(--font-display), sans-serif",
                }}
              >
                <ScrambleText text={it.title} />
              </h3>
              <p
                style={{
                  fontFamily: "var(--font-display), sans-serif",
                  fontSize: 16,
                  lineHeight: 1.62,
                  color: "rgba(var(--ink-rgb), 0.72)",
                  maxWidth: 340,
                }}
              >
                {it.desc}
              </p>
            </Reveal>
          ))}
        </div>
      </div>
    </section>
  );
}
