"use client";

import { useRef, useState } from "react";
import Image from "next/image";
import BrandGrid from "./BrandGrid";
import BlueprintGrid from "./BlueprintGrid";
import Plus from "./Plus";

const EMAIL = "caleb@wiemansystems.com";

interface ClosingBlockProps {
  onBook: () => void;
}

export default function ClosingBlock({ onBook }: ClosingBlockProps) {
  const ctaRef = useRef<HTMLHeadingElement>(null);
  const logoRef = useRef<HTMLAnchorElement>(null);
  const mailRef = useRef<HTMLAnchorElement>(null);
  const [hovered, setHovered] = useState(false);
  const [pressed, setPressed] = useState(false);

  const btnBg = pressed ? "rgba(200,200,200,1)" : hovered ? "rgba(230,230,230,1)" : "#fff";

  return (
    <section
      style={{
        position: "relative",
        background: "#000",
        color: "#fff",
        overflow: "hidden",
        minHeight: "90vh",
        display: "flex",
        flexDirection: "column",
      }}
    >
      <BrandGrid
        color="#fff"
        height="82%"
        opacity={0.9}
        unit={20}
        offsetX={0}
        fragRate={0.042}
        edgeBias={0.95}
        clearTargets={[
          ctaRef,
          logoRef,
          { ref: mailRef, padBottom: 30 },
        ]}
      />
      <BlueprintGrid
        color="#fff"
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
          padding: "clamp(92px, 15vh, 168px) 0 clamp(32px, 5vh, 56px)",
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
              color: "var(--color-gray-300)",
              marginBottom: 26,
            }}
          >
            <Plus size={12} color="#fff" opacity={0.55} />
            Start here
          </div>
          <h2
            className="cta-h2"
            ref={ctaRef}
            style={{
              maxWidth: 980,
              marginBottom: 42,
              fontFamily: "var(--font-display), sans-serif",
              color: "#fff",
            }}
          >
            Find out what your team could stop doing by hand.
          </h2>
          <button
            onClick={onBook}
            onMouseEnter={() => setHovered(true)}
            onMouseLeave={() => { setHovered(false); setPressed(false); }}
            onMouseDown={() => setPressed(true)}
            onMouseUp={() => setPressed(false)}
            style={{
              fontFamily: "var(--font-display), sans-serif",
              fontWeight: 600,
              fontSize: 13,
              letterSpacing: "0.05em",
              textTransform: "uppercase",
              padding: "15px 30px",
              background: btnBg,
              color: "#000",
              border: "1px solid #fff",
              display: "inline-flex",
              alignItems: "center",
              gap: 8,
              whiteSpace: "nowrap",
              boxShadow: hovered && !pressed ? "4px 4px 0 var(--color-gray-600)" : "none",
              transform: pressed ? "translate(2px,2px)" : "none",
              transition:
                "box-shadow 80ms linear, transform 80ms linear, background 80ms linear",
            }}
          >
            Book a call &nbsp;&rarr;
          </button>
        </div>

        {/* spacer — grid rises through this */}
        <div
          style={{ flex: 1, minHeight: "clamp(120px, 22vh, 260px)" }}
        />

        {/* Footer */}
        <div
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
              gap: 16,
              textDecoration: "none",
              position: "relative",
            }}
          >
            <Image
              src="/assets/logo-clean-white.png"
              alt="Wieman Systems"
              width={60}
              height={60}
              style={{ height: 60, width: "auto" }}
            />
            <span
              style={{ display: "flex", flexDirection: "column", lineHeight: 1.1 }}
            >
              <span
                style={{
                  fontFamily: "var(--font-display), sans-serif",
                  fontWeight: 700,
                  fontSize: 18,
                  letterSpacing: "0.14em",
                  color: "#fff",
                }}
              >
                WIEMAN
              </span>
              <span
                style={{
                  fontFamily: "var(--font-display), sans-serif",
                  fontWeight: 500,
                  fontSize: 11,
                  letterSpacing: "0.46em",
                  color: "#fff",
                  marginTop: 4,
                }}
              >
                SYSTEMS
              </span>
            </span>
          </a>

          <div
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
                fontSize: 15,
                letterSpacing: "0.02em",
                color: "#fff",
                textDecoration: "none",
                borderBottom: "1px solid #fff",
                paddingBottom: 3,
              }}
            >
              {EMAIL}
            </a>
            <span
              style={{
                fontFamily: "var(--font-mono), monospace",
                fontSize: 11,
                color: "var(--color-gray-400)",
                letterSpacing: "1.4px",
              }}
            >
              © 2026 Wieman Systems
            </span>
          </div>
        </div>
      </div>
    </section>
  );
}
