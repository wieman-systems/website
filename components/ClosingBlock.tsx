"use client";

import { useRef } from "react";
import Image from "next/image";
import InteractiveBrandGrid from "./InteractiveBrandGrid";
import BlueprintGrid from "./BlueprintGrid";
import Plus from "./Plus";
import MagneticButton from "./MagneticButton";
import ScrambleText from "./ScrambleText";

const EMAIL = "caleb@wiemansystems.com";

interface ClosingBlockProps {
  onBook: () => void;
}

export default function ClosingBlock({ onBook }: ClosingBlockProps) {
  const ctaRef = useRef<HTMLHeadingElement>(null);
  const logoRef = useRef<HTMLAnchorElement>(null);
  const mailRef = useRef<HTMLAnchorElement>(null);

  return (
    <section
      className="cta-shell"
      style={{
        position: "relative",
        background: "var(--bg-inverse)",
        color: "var(--fg-inverse)",
        overflow: "hidden",
        display: "flex",
        flexDirection: "column",
      }}
    >
      <InteractiveBrandGrid
        tone="inverse"
        height="82%"
        opacity={0.9}
        unit={20}
        offsetX={0}
        fragRate={0.042}
        edgeBias={0.95}
        interactive
        drawIn
        clearTargets={[
          ctaRef,
          logoRef,
          { ref: mailRef, padBottom: 30 },
        ]}
      />
      <BlueprintGrid
        tone="inverse"
        opacity={0.04}
        fade={false}
        unit={52}
        style={{ bottom: "58%" }}
      />

      <div
        className="ws-wrap"
        style={{
          position: "relative",
          flex: 1,
          display: "flex",
          flexDirection: "column",
          paddingTop: "clamp(92px, 15vh, 168px)",
          paddingBottom: "clamp(32px, 5vh, 56px)",
        }}
      >
        {/* CTA */}
        <div
          style={{
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            textAlign: "center",
          }}
        >
          <div
            className="eyebrow"
            style={{
              fontFamily: "var(--font-mono), monospace",
              color: "rgba(var(--ink-inverse-rgb), 0.72)",
              marginBottom: 26,
            }}
          >
            <Plus size={12} color="var(--fg-inverse)" opacity={0.55} />
            <ScrambleText text="Start here" />
          </div>
          <h2
            className="cta-h2"
            ref={ctaRef}
            style={{
              maxWidth: 980,
              marginBottom: 42,
              fontFamily: "var(--font-display), sans-serif",
              color: "var(--fg-inverse)",
            }}
          >
            Find out what your team could stop doing by hand.
          </h2>
          <MagneticButton
            variant="solid-light"
            onClick={onBook}
            style={{ padding: "15px 30px", letterSpacing: "0.05em" }}
          >
            Book a call
            <span style={{ fontSize: 16, lineHeight: 1 }}>&rarr;</span>
          </MagneticButton>
        </div>

        {/* spacer — grid rises through this */}
        <div
          style={{ flex: 1, minHeight: "clamp(120px, 22vh, 260px)" }}
        />

        {/* Footer */}
        <div
          className="cta-footer"
          style={{
            display: "flex",
            alignItems: "flex-end",
            justifyContent: "space-between",
            gap: 32,
            flexWrap: "wrap",
          }}
        >
          <a
            href="#top"
            ref={logoRef}
            onClick={(e) => {
              e.preventDefault();
              window.scrollTo({ top: 0, behavior: "smooth" });
            }}
            style={{
              display: "flex",
              alignItems: "center",
              gap: "clamp(10px, 3vw, 16px)",
              textDecoration: "none",
              position: "relative",
            }}
          >
            <Image
              src="/assets/logo-clean-white.png"
              alt="Wieman Systems"
              width={60}
              height={60}
              data-logo
              style={{ height: "clamp(38px, 11vw, 60px)", width: "auto" }}
            />
            <span
              style={{ display: "flex", flexDirection: "column", lineHeight: 1.1 }}
            >
              <span
                style={{
                  fontFamily: "var(--font-display), sans-serif",
                  fontWeight: 700,
                  fontSize: "clamp(14px, 4.2vw, 18px)",
                  letterSpacing: "0.14em",
                  color: "var(--fg-inverse)",
                }}
              >
                WIEMAN
              </span>
              <span
                style={{
                  fontFamily: "var(--font-display), sans-serif",
                  fontWeight: 500,
                  fontSize: "clamp(9px, 2.7vw, 11px)",
                  letterSpacing: "0.46em",
                  color: "var(--fg-inverse)",
                  marginTop: 4,
                }}
              >
                SYSTEMS
              </span>
            </span>
          </a>

          <div
            className="cta-contact"
            style={{
              display: "flex",
              flexDirection: "column",
              gap: 10,
              alignItems: "flex-end",
              textAlign: "right",
              position: "relative",
            }}
          >
            <a
              href={`mailto:${EMAIL}`}
              ref={mailRef}
              style={{
                fontFamily: "var(--font-mono), monospace",
                fontSize: "clamp(12px, 3.4vw, 15px)",
                letterSpacing: "0.02em",
                color: "var(--fg-inverse)",
                textDecoration: "none",
                borderBottom: "1px solid var(--fg-inverse)",
                paddingBottom: 3,
              }}
            >
              <ScrambleText text={EMAIL} />
            </a>
            <div
              style={{
                display: "flex",
                gap: 16,
                fontFamily: "var(--font-mono), monospace",
                fontSize: 11,
                letterSpacing: "0.04em",
              }}
            >
              <a href="/privacy" style={{ color: "rgba(var(--ink-inverse-rgb), 0.6)", textDecoration: "none" }}>
                Privacy
              </a>
              <a href="/terms" style={{ color: "rgba(var(--ink-inverse-rgb), 0.6)", textDecoration: "none" }}>
                Terms
              </a>
            </div>
            <span
              style={{
                fontFamily: "var(--font-mono), monospace",
                fontSize: 11,
                color: "rgba(var(--ink-inverse-rgb), 0.6)",
                letterSpacing: "1.4px",
              }}
            >
              <ScrambleText text="© 2026 Wieman Systems LLC" />
            </span>
          </div>
        </div>
      </div>
    </section>
  );
}
