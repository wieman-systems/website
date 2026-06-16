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
      <div style={{ padding: "clamp(44px, 7vh, 72px) 0" }}>
        <Reveal>
          <div
            className="eyebrow"
            style={{
              fontFamily: "var(--font-mono), monospace",
              color: "var(--color-gray-600)",
              marginBottom: 26,
              padding: "0 var(--gutter)",
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

          {/* Auto-scrolling marquee — pauses on hover. The list is duplicated
              so the loop is seamless; the copy is hidden from assistive tech. */}
          <div className="marquee">
            <div className="marquee__track">
              {TOOLS.map((t) => (
                <span className="marquee__item" key={t}>
                  {t}
                </span>
              ))}
              {TOOLS.map((t) => (
                <span className="marquee__item" data-dup aria-hidden key={`${t}-dup`}>
                  {t}
                </span>
              ))}
            </div>
          </div>
        </Reveal>
      </div>
    </section>
  );
}
