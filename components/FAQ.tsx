import SectionHead from "./SectionHead";
import Reveal from "./Reveal";
import BlueprintGrid from "./BlueprintGrid";

const SECTION_MASK =
  "linear-gradient(to bottom, transparent, #000 16%, #000 84%, transparent)";

// DRAFT answers — verify these against how you actually operate before launch
// (especially data handling and pricing).
const faqs = [
  {
    q: "What kind of work can you automate?",
    a: "If it's repetitive and spread across your tools — reporting, data entry, approvals, reconciliation, routing requests — it's usually a candidate. We build around your real workflow, not a template.",
  },
  {
    q: "Where does my data live, and is it secure?",
    a: "Your data stays in your own accounts and infrastructure. We build on the tools and cloud you already trust, with least-privilege access — we don't resell it or train models on it.",
  },
  {
    q: "Does my team need to be technical to use it?",
    a: "No. We build around your existing workflow, so your team keeps working the way they already do — the automation just runs underneath.",
  },
  {
    q: "How long until the first system is live?",
    a: "Most first builds go live in about 2–4 weeks, depending on scope. We start with a short mapping phase so you see the plan before anything is built.",
  },
  {
    q: "What does it cost?",
    a: "Every engagement is scoped and priced up front — you approve a fixed scope before any work begins, so there are no surprises.",
  },
];

export default function FAQ() {
  return (
    <section
      style={{ position: "relative", borderTop: "1px solid #000", overflow: "hidden" }}
    >
      <BlueprintGrid
        color="#000"
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
        <SectionHead index="04" label="FAQ" title="Questions, answered." />
        <div style={{ maxWidth: 820 }}>
          {faqs.map((f, i) => (
            <Reveal key={f.q} delay={i * 0.05}>
              <div
                style={{
                  borderTop: "1px solid rgba(0,0,0,0.12)",
                  padding: "clamp(22px, 3vh, 30px) 0",
                }}
              >
                <h3
                  style={{
                    fontFamily: "var(--font-display), sans-serif",
                    fontWeight: 600,
                    fontSize: "clamp(18px, 1.9vw, 23px)",
                    letterSpacing: "-0.02em",
                    marginBottom: 12,
                    color: "#000",
                  }}
                >
                  {f.q}
                </h3>
                <p
                  style={{
                    fontFamily: "var(--font-display), sans-serif",
                    fontSize: 16,
                    lineHeight: 1.62,
                    color: "var(--color-gray-700)",
                    maxWidth: 660,
                    margin: 0,
                  }}
                >
                  {f.a}
                </p>
              </div>
            </Reveal>
          ))}
        </div>
      </div>
    </section>
  );
}
