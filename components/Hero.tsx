"use client";

import { useRef, useState } from "react";
import BrandGrid from "./BrandGrid";
import BlueprintGrid from "./BlueprintGrid";

interface HeroProps {
  onBook: () => void;
}

export default function Hero({ onBook }: HeroProps) {
  const heroBtnRef = useRef<HTMLButtonElement>(null);
  const headingRef = useRef<HTMLHeadingElement>(null);
  const leadRef = useRef<HTMLParagraphElement>(null);
  const [bh, setBh] = useState(false);

  return (
    <section
      id="top"
      className="hero-shell"
      style={{
        position: "relative",
        overflow: "hidden",
        background: "#fff",
        color: "#000",
        borderBottom: "1px solid #000",
        display: "flex",
        flexDirection: "column",
      }}
    >
      {/* Dense pitch-black brand grid: base + right-side climb + floaters.
          Clear the grid around the actual heading/lead/CTA boxes so it adapts
          to however the copy wraps (esp. on mobile) instead of a fixed rect. */}
      <BrandGrid
        color="#000"
        height="100%"
        opacity={1}
        unit={20}
        offsetX={0}
        fragRate={0.044}
        rightBias={1}
        clearTargets={[
          { ref: headingRef, padX: 14, padTop: 10, padBottom: 12 },
          { ref: leadRef, padX: 14, padTop: 8, padBottom: 10 },
          { ref: heroBtnRef, padX: 10, padTop: 8, padBottom: 8 },
        ]}
      />

      {/* Subtle graph-paper overlay */}
      <BlueprintGrid
        color="#000"
        opacity={0.04}
        unit={52}
        style={{ height: "46%", bottom: "auto" }}
      />

      {/* Pitch content */}
      <div
        className="ws-wrap"
        style={{
          position: "relative",
          flex: 1,
          display: "flex",
          flexDirection: "column",
          justifyContent: "center",
          alignItems: "flex-start",
          paddingTop: "clamp(40px, 7vh, 96px)",
          paddingBottom: "clamp(40px, 7vh, 96px)",
        }}
      >
        <h1
          ref={headingRef}
          className="hero-h1"
          style={{
            maxWidth: 1080,
            margin: 0,
            fontFamily: "var(--font-display), sans-serif",
          }}
        >
          <span className="hl">
            Building <strong>Systems.</strong>
          </span>
          <span className="hl">
            Delivering <strong>Solutions.</strong>
          </span>
        </h1>

        <div
          style={{
            width: 48,
            height: 2,
            background: "#000",
            margin: "clamp(26px,3.6vh,38px) 0 clamp(22px,3vh,30px)",
          }}
        />

        <p
          ref={leadRef}
          style={{
            fontFamily: "var(--font-display), sans-serif",
            fontSize: "clamp(16px, 1.4vw, 19px)",
            lineHeight: 1.55,
            color: "var(--color-gray-700)",
            maxWidth: 420,
            marginBottom: "clamp(32px,4.5vh,44px)",
          }}
        >
          Innovative technology solutions that drive performance and growth.
        </p>

        <button
          ref={heroBtnRef}
          onClick={onBook}
          onMouseEnter={() => setBh(true)}
          onMouseLeave={() => setBh(false)}
          style={{
            display: "inline-flex",
            alignItems: "center",
            gap: 16,
            alignSelf: "flex-start",
            fontFamily: "var(--font-display), sans-serif",
            fontWeight: 600,
            fontSize: 13,
            letterSpacing: "0.16em",
            textTransform: "uppercase",
            whiteSpace: "nowrap",
            padding: "17px 30px",
            background: bh ? "#000" : "transparent",
            color: bh ? "#fff" : "#000",
            border: "1px solid #000",
            transition: "background 100ms linear, color 100ms linear",
          }}
        >
          Book a call{" "}
          <span style={{ fontSize: 16, lineHeight: 1 }}>&rarr;</span>
        </button>
      </div>
    </section>
  );
}
