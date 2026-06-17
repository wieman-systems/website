"use client";

import { useState } from "react";
import Header from "@/components/Header";
import CustomCursor from "@/components/CustomCursor";
import BookModal from "@/components/BookModal";
import ClosingBlock from "@/components/ClosingBlock";
import BlueprintGrid from "@/components/BlueprintGrid";
import Reveal from "@/components/Reveal";
import ScrambleText from "@/components/ScrambleText";
import HarmonographPlate from "@/components/faq/HarmonographPlate";

const TOP_MASK =
  "linear-gradient(to bottom, transparent, #000 14%, #000 86%, transparent)";

function SectionLead({ label, title }: { label: string; title: string }) {
  return (
    <div style={{ marginBottom: "clamp(36px, 5vh, 56px)" }}>
      <div
        className="eyebrow"
        style={{
          fontFamily: "var(--font-mono), monospace",
          color: "var(--color-gray-600)",
          marginBottom: 18,
        }}
      >
        <span style={{ width: 22, height: 1, background: "#000", opacity: 0.35, display: "inline-block" }} />
        <ScrambleText text={label} />
      </div>
      <h2
        style={{
          fontFamily: "var(--font-display), sans-serif",
          fontWeight: 700,
          fontSize: "clamp(26px, 3.4vw, 40px)",
          letterSpacing: "-0.03em",
          lineHeight: 1.1,
          maxWidth: 680,
          textWrap: "balance" as never,
        }}
      >
        {title}
      </h2>
    </div>
  );
}

const PRINCIPLES = [
  {
    t: "Your data stays yours",
    d: "I build inside your own accounts and cloud, with least-privilege access. Nothing gets resold, and nothing trains a model.",
  },
  {
    t: "Built around your workflow",
    d: "I shape the system to how your team already works — not a template you have to bend to.",
  },
  {
    t: "Fixed scope, up front",
    d: "You approve exactly what gets built, and what it costs, before any work begins.",
  },
  {
    t: "Direct, not delegated",
    d: "You work with the builder from the first call to the live system. Nothing gets lost in a handoff.",
  },
];

const WORK = [
  {
    t: "Shipping automation",
    d: "Plasma Bionics — turned a manual fulfillment process into a system that prepares and ships orders on its own.",
  },
  {
    t: "Productivity agents",
    d: "Personal AI agents that take over the daily busywork — triage, drafting, follow-ups — so the day starts already handled.",
  },
  {
    t: "…and more in progress",
    d: "New custom systems for businesses of all kinds. Full case studies are on the way.",
  },
];

export default function About() {
  const [modalOpen, setModalOpen] = useState(false);
  const onBook = () => setModalOpen(true);

  return (
    <>
      <CustomCursor hidden={modalOpen} />
      <Header onBook={onBook} />

      <main>
        {/* ── Intro ─────────────────────────────────────────────── */}
        <section style={{ position: "relative", borderBottom: "1px solid #000", overflow: "hidden" }}>
          <BlueprintGrid
            color="#000"
            opacity={0.05}
            unit={52}
            fade={false}
            style={{ height: "70%", maskImage: TOP_MASK, WebkitMaskImage: TOP_MASK }}
          />
          <div
            className="ws-wrap"
            style={{
              position: "relative",
              zIndex: 1,
              padding: "clamp(72px, 12vh, 140px) var(--gutter) clamp(64px, 10vh, 116px)",
            }}
          >
            <div className="about-hero-grid">
              <div>
                <div
                  className="eyebrow"
                  style={{ fontFamily: "var(--font-mono), monospace", color: "var(--color-gray-600)", marginBottom: 24 }}
                >
                  <span style={{ width: 22, height: 1, background: "#000", opacity: 0.35, display: "inline-block" }} />
                  <ScrambleText text="ABOUT" />
                </div>
                <h1
                  style={{
                    fontFamily: "var(--font-display), sans-serif",
                    fontWeight: 700,
                    fontSize: "clamp(30px, 4.6vw, 56px)",
                    letterSpacing: "-0.035em",
                    lineHeight: 1.05,
                    maxWidth: 560,
                    marginBottom: "clamp(24px, 3.5vh, 34px)",
                    textWrap: "balance" as never,
                  }}
                >
                  One builder, working at the frontier.
                </h1>
                <p
                  style={{
                    fontFamily: "var(--font-display), sans-serif",
                    fontSize: "clamp(16px, 1.4vw, 19px)",
                    lineHeight: 1.6,
                    color: "var(--color-gray-700)",
                    maxWidth: 520,
                  }}
                >
                  I&apos;m Caleb Wieman — the person behind Wieman Systems. I&apos;m a college student and a
                  builder, and I spend my time at the edge of what today&apos;s tools can do, then turn it
                  into systems that quietly handle a business&apos;s busywork. No agency, no handoff to a
                  junior team — you work directly with the person building it.
                </p>
              </div>
              <div className="about-visual">
                <HarmonographPlate />
              </div>
            </div>
          </div>
        </section>

        {/* ── How I work ────────────────────────────────────────── */}
        <section style={{ position: "relative", borderBottom: "1px solid #000", overflow: "hidden" }}>
          <BlueprintGrid color="#000" opacity={0.04} unit={52} />
          <div
            className="ws-wrap"
            style={{ position: "relative", zIndex: 1, padding: "clamp(72px, 11vh, 120px) var(--gutter)" }}
          >
            <SectionLead label="HOW I WORK" title="Built to be trusted with your business." />
            <div className="about-grid">
              {PRINCIPLES.map((p, i) => (
                <Reveal key={p.t} delay={i * 0.05}>
                  <div style={{ borderTop: "1px solid rgba(0,0,0,0.14)", padding: "clamp(22px, 3vh, 30px) 0" }}>
                    <h3
                      style={{
                        fontFamily: "var(--font-display), sans-serif",
                        fontWeight: 700,
                        fontSize: 18,
                        letterSpacing: "-0.01em",
                        marginBottom: 10,
                        color: "#000",
                      }}
                    >
                      {p.t}
                    </h3>
                    <p
                      style={{
                        fontFamily: "var(--font-display), sans-serif",
                        fontSize: 15.5,
                        lineHeight: 1.6,
                        color: "var(--color-gray-700)",
                        maxWidth: 460,
                        margin: 0,
                      }}
                    >
                      {p.d}
                    </p>
                  </div>
                </Reveal>
              ))}
            </div>
          </div>
        </section>

        {/* ── Who I work with ───────────────────────────────────── */}
        <section style={{ position: "relative", background: "#000", color: "#fff", overflow: "hidden" }}>
          <BlueprintGrid color="#fff" opacity={0.05} unit={52} />
          <div
            className="ws-wrap"
            style={{ position: "relative", zIndex: 1, padding: "clamp(84px, 13vh, 150px) var(--gutter)" }}
          >
            <Reveal>
              <div
                className="eyebrow"
                style={{ fontFamily: "var(--font-mono), monospace", color: "var(--color-gray-400)", marginBottom: 26 }}
              >
                <span style={{ width: 22, height: 1, background: "#fff", opacity: 0.4, display: "inline-block" }} />
                <ScrambleText text="WHO I WORK WITH" />
              </div>
              <p
                style={{
                  fontFamily: "var(--font-display), sans-serif",
                  fontWeight: 700,
                  fontSize: "clamp(26px, 3.8vw, 46px)",
                  letterSpacing: "-0.03em",
                  lineHeight: 1.12,
                  maxWidth: 880,
                  margin: 0,
                  textWrap: "balance" as never,
                }}
              >
                I do my best work with people who are honest, hardworking, and trustworthy.
              </p>
              <p
                style={{
                  fontFamily: "var(--font-display), sans-serif",
                  fontSize: "clamp(16px, 1.4vw, 19px)",
                  lineHeight: 1.6,
                  color: "var(--color-gray-400)",
                  maxWidth: 560,
                  marginTop: "clamp(22px, 3vh, 30px)",
                }}
              >
                Build something real, treat each other straight, move fast. If that&apos;s how you
                operate, we&apos;ll get along.
              </p>
            </Reveal>
          </div>
        </section>

        {/* ── What I've built ───────────────────────────────────── */}
        <section style={{ position: "relative", borderTop: "1px solid #000", borderBottom: "1px solid #000", overflow: "hidden" }}>
          <BlueprintGrid color="#000" opacity={0.04} unit={52} />
          <div
            className="ws-wrap"
            style={{ position: "relative", zIndex: 1, padding: "clamp(72px, 11vh, 120px) var(--gutter)" }}
          >
            <SectionLead label="WHAT I'VE BUILT" title="Real systems, already running." />
            <div className="wd-grid">
              {WORK.map((w, i) => (
                <Reveal key={w.t} delay={i * 0.06}>
                  <div className="wd-item">
                    <div className="wd-title" style={{ marginBottom: 12 }}>{w.t}</div>
                    <p
                      style={{
                        fontFamily: "var(--font-display), sans-serif",
                        fontSize: 15.5,
                        lineHeight: 1.6,
                        color: "var(--color-gray-700)",
                        margin: 0,
                      }}
                    >
                      {w.d}
                    </p>
                  </div>
                </Reveal>
              ))}
            </div>
          </div>
        </section>

        <ClosingBlock onBook={onBook} />
      </main>

      <BookModal open={modalOpen} onClose={() => setModalOpen(false)} />
    </>
  );
}
