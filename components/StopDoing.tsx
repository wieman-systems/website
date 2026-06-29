"use client";

import { useRef } from "react";
import { useGSAP } from "@gsap/react";
import { gsap, prefersReducedMotion } from "@/lib/motion";
import SectionHead from "./SectionHead";
import ScrambleText from "./ScrambleText";
import BlueprintGrid from "./BlueprintGrid";

const SECTION_MASK =
  "linear-gradient(to bottom, transparent, #000 16%, #000 84%, transparent)";

const tasks = [
  "Copying data between tools",
  "Compiling weekly and monthly reports",
  "Chasing approvals, statuses, and sign-offs",
  "Reconciling spreadsheets and records",
  "Tagging and routing inbound requests",
  "Updating dashboards by hand",
];

export default function StopDoing() {
  const sectionRef = useRef<HTMLElement>(null);
  const railFillRef = useRef<HTMLDivElement>(null);

  // Sequential timeline: each row highlights in turn as the section scrolls,
  // with a progress rail tracking how far through the list you are.
  useGSAP(
    () => {
      const root = sectionRef.current!;
      const rows = gsap.utils.toArray<HTMLElement>(root.querySelectorAll(".stop-row"));
      const fill = railFillRef.current!;

      if (prefersReducedMotion()) {
        gsap.set(rows, { opacity: 1, x: 0 });
        gsap.set(fill, { scaleY: 1 });
        return;
      }

      gsap.set(rows, { opacity: 0.3, x: -8 });
      gsap.set(fill, { scaleY: 0, transformOrigin: "top center" });

      const wrap = root.querySelector(".stop-timeline") as HTMLElement;
      const step = 0.85;
      const span = (rows.length - 1) * step + 1.1;

      const tl = gsap.timeline({
        scrollTrigger: {
          trigger: wrap,
          start: "top 72%",
          end: "bottom 72%",
          scrub: 0.6,
        },
      });
      tl.to(fill, { scaleY: 1, duration: span, ease: "none" }, 0);
      rows.forEach((row, i) => {
        tl.to(row, { opacity: 1, x: 0, duration: 1.1, ease: "power2.out" }, i * step);
      });
    },
    { scope: sectionRef }
  );

  return (
    <section
      ref={sectionRef}
      style={{
        position: "relative",
        borderTop: "1px solid var(--bg-inverse)",
        overflow: "hidden",
        background: "var(--bg-inverse)",
        color: "var(--fg-inverse)",
      }}
    >
      <BlueprintGrid
        tone="inverse"
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
        <SectionHead
          index="03"
          label="Stop doing by hand"
          title="If your team still does this manually, it is a system we can build."
          maxTitle={880}
          dark
        />
        <div
          className="stop-timeline"
          style={{ position: "relative", paddingLeft: "clamp(18px, 3vw, 30px)" }}
        >
          <div className="stop-rail" style={{ background: "rgba(var(--ink-inverse-rgb), 0.16)" }}>
            <div className="stop-rail__fill" ref={railFillRef} style={{ background: "var(--fg-inverse)" }} />
          </div>
          <div className="stop-grid">
            {tasks.map((task, i) => (
              <div className="stop-row" key={i} style={{ borderTopColor: "rgba(var(--ink-inverse-rgb), 0.16)" }}>
                <span
                  style={{
                    fontFamily: "var(--font-mono), monospace",
                    fontSize: 12,
                    letterSpacing: "0.1em",
                    color: "rgba(var(--ink-inverse-rgb), 0.6)",
                    minWidth: 26,
                  }}
                >
                  {String(i + 1).padStart(2, "0")}
                </span>
                <span
                  style={{
                    fontFamily: "var(--font-display), sans-serif",
                    fontWeight: 500,
                    fontSize: "clamp(17px, 1.5vw, 20px)",
                    letterSpacing: "-0.01em",
                    color: "var(--fg-inverse)",
                    flex: 1,
                  }}
                >
                  {task}
                </span>
                <ScrambleText
                  className="stop-tag"
                  text="→ AUTOMATED"
                  style={{
                    fontFamily: "var(--font-mono), monospace",
                    fontSize: 10,
                    letterSpacing: "0.14em",
                    color: "rgba(var(--ink-inverse-rgb), 0.6)",
                    whiteSpace: "nowrap",
                  }}
                />
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
