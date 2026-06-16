"use client";

import { useRef } from "react";
import { useGSAP } from "@gsap/react";
import { gsap, SplitText, prefersReducedMotion } from "@/lib/motion";
import InteractiveBrandGrid from "./InteractiveBrandGrid";
import BlueprintGrid from "./BlueprintGrid";
import MagneticButton from "./MagneticButton";

interface HeroProps {
  onBook: () => void;
}

export default function Hero({ onBook }: HeroProps) {
  const heroRef = useRef<HTMLElement>(null);
  const heroBtnRef = useRef<HTMLDivElement>(null);
  const headingRef = useRef<HTMLHeadingElement>(null);
  const leadRef = useRef<HTMLParagraphElement>(null);

  // Staggered, line-by-line clip-mask reveal for the headline.
  useGSAP(
    () => {
      const h1 = headingRef.current;
      if (!h1 || prefersReducedMotion()) return;

      gsap.set(h1, { autoAlpha: 0 });
      let split: SplitText | null = null;
      let ran = false;

      const run = () => {
        if (ran) return;
        ran = true;
        split = new SplitText(h1, {
          type: "lines",
          mask: "lines",
          linesClass: "ws-h1-line",
        });
        gsap.set(h1, { autoAlpha: 1 });
        gsap.from(split.lines, {
          yPercent: 118,
          duration: 1.05,
          ease: "power4.out",
          stagger: 0.14,
          onComplete: () => split?.revert(),
        });
      };

      // Split only once webfonts are ready so line breaks are measured right,
      // with a timeout fallback so the headline can never get stuck hidden.
      document.fonts?.ready.then(run);
      const t = window.setTimeout(run, 400);

      return () => {
        window.clearTimeout(t);
        split?.revert();
      };
    },
    { scope: heroRef }
  );

  return (
    <section
      ref={heroRef}
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
      {/* Dynamic, cursor-reactive brand grid that draws itself in on load. */}
      <InteractiveBrandGrid
        color="#000"
        height="100%"
        opacity={1}
        unit={20}
        offsetX={0}
        fragRate={0.044}
        rightBias={1}
        interactive
        drawIn
        clearTargets={[
          { ref: headingRef, padX: 6, padTop: 2, padBottom: 4, mp: 6 },
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

        <div ref={heroBtnRef} style={{ display: "inline-flex" }}>
          <MagneticButton
            variant="outline-dark"
            onClick={onBook}
            style={{ letterSpacing: "0.16em" }}
          >
            Book a call
            <span style={{ fontSize: 16, lineHeight: 1 }}>&rarr;</span>
          </MagneticButton>
        </div>
      </div>
    </section>
  );
}
