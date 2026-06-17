"use client";

import { useRef } from "react";
import type { SimpleIcon } from "simple-icons";
import {
  siNotion,
  siAirtable,
  siGooglesheets,
  siHubspot,
  siGmail,
  siStripe,
  siQuickbooks,
  siZapier,
  siMake,
  siAsana,
  siPostgresql,
  siShopify,
} from "simple-icons";
import Reveal from "./Reveal";

// DRAFT — swap/extend with the tools you actually build on. (Slack, OpenAI and
// Salesforce asked icon sets to drop their marks, so they're intentionally out.)
const TOOLS: { name: string; icon: SimpleIcon }[] = [
  { name: "Notion", icon: siNotion },
  { name: "Airtable", icon: siAirtable },
  { name: "Google Sheets", icon: siGooglesheets },
  { name: "HubSpot", icon: siHubspot },
  { name: "Gmail", icon: siGmail },
  { name: "Stripe", icon: siStripe },
  { name: "QuickBooks", icon: siQuickbooks },
  { name: "Zapier", icon: siZapier },
  { name: "Make", icon: siMake },
  { name: "Asana", icon: siAsana },
  { name: "PostgreSQL", icon: siPostgresql },
  { name: "Shopify", icon: siShopify },
];

function Lockup({ name, icon, dup }: { name: string; icon: SimpleIcon; dup?: boolean }) {
  return (
    <span className="marquee__item" data-dup={dup ? "" : undefined} aria-hidden={dup}>
      <svg className="marquee__logo" viewBox="0 0 24 24" role="img" focusable="false">
        <path d={icon.path} fill="currentColor" />
      </svg>
      {name}
    </span>
  );
}

export default function IntegrationsStrip() {
  const trackRef = useRef<HTMLDivElement>(null);

  // Slow down (not stop) on hover via the Web Animations playbackRate.
  const setRate = (rate: number) => {
    const t = trackRef.current;
    if (!t) return;
    for (const a of t.getAnimations()) a.playbackRate = rate;
  };

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
              marginBottom: 28,
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

          {/* Auto-scrolling marquee — slows on hover. The list is duplicated so
              the loop is seamless; the copy is hidden from assistive tech. */}
          <div
            className="marquee"
            onMouseEnter={() => setRate(0.25)}
            onMouseLeave={() => setRate(1)}
          >
            <div className="marquee__track" ref={trackRef}>
              {TOOLS.map((t) => (
                <Lockup key={t.name} name={t.name} icon={t.icon} />
              ))}
              {TOOLS.map((t) => (
                <Lockup key={`${t.name}-dup`} name={t.name} icon={t.icon} dup />
              ))}
            </div>
          </div>
        </Reveal>
      </div>
    </section>
  );
}
