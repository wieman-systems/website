import Reveal from "./Reveal";

// DRAFT — replace with the tools you actually build on / integrate with.
const TOOLS = [
  "Slack",
  "Notion",
  "HubSpot",
  "Airtable",
  "Google Sheets",
  "Postgres",
  "Make",
  "OpenAI",
  "Gmail",
  "Stripe",
  "Salesforce",
  "QuickBooks",
];

export default function IntegrationsStrip() {
  return (
    <section
      style={{ position: "relative", background: "#fff", borderTop: "1px solid #000" }}
    >
      <div
        className="ws-wrap"
        style={{ padding: "clamp(44px, 7vh, 72px) var(--gutter)" }}
      >
        <Reveal>
          <div
            className="eyebrow"
            style={{
              fontFamily: "var(--font-mono), monospace",
              color: "var(--color-gray-600)",
              marginBottom: 24,
            }}
          >
            <span
              style={{
                width: 22,
                height: 1,
                background: "#000",
                opacity: 0.35,
                display: "inline-block",
              }}
            />
            Works with the tools you already use
          </div>
          <ul
            style={{
              listStyle: "none",
              margin: 0,
              padding: 0,
              display: "flex",
              flexWrap: "wrap",
              alignItems: "center",
              gap: "clamp(14px, 2.2vw, 26px) clamp(22px, 3.4vw, 48px)",
            }}
          >
            {TOOLS.map((t) => (
              <li
                key={t}
                style={{
                  fontFamily: "var(--font-display), sans-serif",
                  fontWeight: 500,
                  fontSize: "clamp(16px, 1.6vw, 21px)",
                  letterSpacing: "-0.01em",
                  color: "var(--color-gray-500)",
                }}
              >
                {t}
              </li>
            ))}
          </ul>
        </Reveal>
      </div>
    </section>
  );
}
