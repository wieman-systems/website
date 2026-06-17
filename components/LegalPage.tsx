"use client";

import { useState } from "react";
import Header from "@/components/Header";
import CustomCursor from "@/components/CustomCursor";
import BookModal from "@/components/BookModal";
import ClosingBlock from "@/components/ClosingBlock";
import BlueprintGrid from "@/components/BlueprintGrid";
import ScrambleText from "@/components/ScrambleText";

const TOP_MASK =
  "linear-gradient(to bottom, transparent, #000 14%, #000 86%, transparent)";

export interface LegalSection {
  heading: string;
  /** Paragraphs of body copy. */
  body?: string[];
  /** Optional bullet list rendered after the paragraphs. */
  bullets?: string[];
}

interface LegalPageProps {
  eyebrow: string;
  title: string;
  lastUpdated: string;
  intro: string;
  sections: LegalSection[];
}

export default function LegalPage({
  eyebrow,
  title,
  lastUpdated,
  intro,
  sections,
}: LegalPageProps) {
  const [modalOpen, setModalOpen] = useState(false);
  const onBook = () => setModalOpen(true);

  return (
    <>
      <CustomCursor hidden={modalOpen} />
      <Header onBook={onBook} />

      <main>
        {/* ── Header ────────────────────────────────────────────── */}
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
              padding: "clamp(72px, 12vh, 140px) var(--gutter) clamp(40px, 6vh, 72px)",
            }}
          >
            <div
              className="eyebrow"
              style={{ fontFamily: "var(--font-mono), monospace", color: "var(--color-gray-600)", marginBottom: 24 }}
            >
              <span style={{ width: 22, height: 1, background: "#000", opacity: 0.35, display: "inline-block" }} />
              <ScrambleText text={eyebrow} />
            </div>
            <h1
              style={{
                fontFamily: "var(--font-display), sans-serif",
                fontWeight: 700,
                fontSize: "clamp(30px, 4.6vw, 56px)",
                letterSpacing: "-0.035em",
                lineHeight: 1.05,
                maxWidth: 640,
                marginBottom: "clamp(16px, 2.4vh, 22px)",
                textWrap: "balance" as never,
              }}
            >
              {title}
            </h1>
            <p
              style={{
                fontFamily: "var(--font-mono), monospace",
                fontSize: 12,
                letterSpacing: "0.04em",
                color: "var(--color-gray-500)",
                marginBottom: "clamp(24px, 3.5vh, 34px)",
              }}
            >
              Last updated: {lastUpdated}
            </p>
            <p
              style={{
                fontFamily: "var(--font-display), sans-serif",
                fontSize: "clamp(16px, 1.4vw, 19px)",
                lineHeight: 1.6,
                color: "var(--color-gray-700)",
                maxWidth: 680,
              }}
            >
              {intro}
            </p>
          </div>
        </section>

        {/* ── Body ──────────────────────────────────────────────── */}
        <section style={{ position: "relative", borderBottom: "1px solid #000", overflow: "hidden" }}>
          <BlueprintGrid color="#000" opacity={0.04} unit={52} />
          <div
            className="ws-wrap"
            style={{ position: "relative", zIndex: 1, padding: "clamp(56px, 9vh, 104px) var(--gutter)" }}
          >
            <div style={{ maxWidth: 760, display: "flex", flexDirection: "column", gap: "clamp(34px, 5vh, 52px)" }}>
              {sections.map((s, i) => (
                <div key={s.heading}>
                  <h2
                    style={{
                      fontFamily: "var(--font-display), sans-serif",
                      fontWeight: 700,
                      fontSize: "clamp(19px, 2vw, 24px)",
                      letterSpacing: "-0.02em",
                      marginBottom: 14,
                      color: "#000",
                    }}
                  >
                    <span style={{ color: "var(--color-gray-400)", marginRight: 12, fontVariantNumeric: "tabular-nums" }}>
                      {String(i + 1).padStart(2, "0")}
                    </span>
                    {s.heading}
                  </h2>
                  {s.body?.map((p, j) => (
                    <p
                      key={j}
                      style={{
                        fontFamily: "var(--font-display), sans-serif",
                        fontSize: 15.5,
                        lineHeight: 1.68,
                        color: "var(--color-gray-700)",
                        margin: "0 0 12px",
                      }}
                    >
                      {p}
                    </p>
                  ))}
                  {s.bullets && (
                    <ul style={{ margin: "8px 0 0", paddingLeft: 20, listStyleType: "disc" }}>
                      {s.bullets.map((b, k) => (
                        <li
                          key={k}
                          style={{
                            fontFamily: "var(--font-display), sans-serif",
                            fontSize: 15.5,
                            lineHeight: 1.68,
                            color: "var(--color-gray-700)",
                            marginBottom: 6,
                          }}
                        >
                          {b}
                        </li>
                      ))}
                    </ul>
                  )}
                </div>
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
