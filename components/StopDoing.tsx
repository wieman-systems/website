import SectionHead from "./SectionHead";

const tasks = [
  "Copying data between tools",
  "Compiling weekly and monthly reports",
  "Chasing approvals, statuses, and sign-offs",
  "Reconciling spreadsheets and records",
  "Tagging and routing inbound requests",
  "Updating dashboards by hand",
];

export default function StopDoing() {
  return (
    <section style={{ position: "relative", borderTop: "1px solid #000" }}>
      <div
        className="ws-wrap"
        style={{ padding: "clamp(72px, 11vh, 128px) var(--gutter)" }}
      >
        <SectionHead
          index="03"
          label="Stop doing by hand"
          title="If your team still does this manually, it is a system we can build."
          maxTitle={880}
        />
        <div className="stop-grid">
          {tasks.map((task, i) => (
            <div className="stop-row" key={i}>
              <span
                style={{
                  fontFamily: "var(--font-mono), monospace",
                  fontSize: 12,
                  letterSpacing: "0.1em",
                  color: "var(--color-gray-500)",
                  minWidth: 26,
                }}
              >
                {String(i + 1).padStart(2, "0")}
              </span>
              <span
                style={{
                  fontFamily: "var(--font-display), sans-serif",
                  fontWeight: 500,
                  fontSize: "clamp(17px, 1.5vw, 20px)",
                  letterSpacing: "-0.01em",
                  color: "#000",
                  flex: 1,
                }}
              >
                {task}
              </span>
              <span
                className="stop-tag"
                style={{
                  fontFamily: "var(--font-mono), monospace",
                  fontSize: 10,
                  letterSpacing: "0.14em",
                  color: "var(--color-gray-500)",
                  whiteSpace: "nowrap",
                }}
              >
                &rarr; AUTOMATED
              </span>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
