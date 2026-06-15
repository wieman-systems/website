import SectionHead from "./SectionHead";

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
    <section style={{ position: "relative", borderTop: "1px solid #000" }}>
      <div
        className="ws-wrap"
        style={{ padding: "clamp(72px, 11vh, 128px) var(--gutter)" }}
      >
        <SectionHead
          index="01"
          label="What we do"
          title="Systems built, run, and owned end-to-end."
        />
        <div className="wd-grid">
          {items.map((it) => (
            <div className="wd-item" key={it.id}>
              <div
                style={{
                  fontFamily: "var(--font-mono), monospace",
                  fontSize: 12,
                  letterSpacing: "0.18em",
                  color: "var(--color-gray-500)",
                  marginBottom: 24,
                }}
              >
                {it.id}
              </div>
              <h3
                className="wd-title"
                style={{
                  marginBottom: 16,
                  fontFamily: "var(--font-display), sans-serif",
                }}
              >
                {it.title}
              </h3>
              <p
                style={{
                  fontFamily: "var(--font-display), sans-serif",
                  fontSize: 16,
                  lineHeight: 1.62,
                  color: "var(--color-gray-700)",
                  maxWidth: 340,
                }}
              >
                {it.desc}
              </p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
