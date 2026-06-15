"use client";

import { ReactNode, useRef } from "react";
import { useGSAP } from "@gsap/react";
import { gsap, prefersReducedMotion } from "@/lib/motion";

interface RevealProps {
  children: ReactNode;
  className?: string;
  style?: React.CSSProperties;
  /** Vertical travel of the fade-up, in px. */
  y?: number;
  delay?: number;
  duration?: number;
  /** ScrollTrigger start position. */
  start?: string;
}

/**
 * Scroll-triggered fade-up wrapper. Content is hidden via GSAP inside a layout
 * effect (so there is no flash), and is left fully visible for reduced-motion
 * users and when JS is unavailable.
 */
export default function Reveal({
  children,
  className,
  style,
  y = 26,
  delay = 0,
  duration = 0.9,
  start = "top 85%",
}: RevealProps) {
  const ref = useRef<HTMLDivElement>(null);

  useGSAP(
    () => {
      const el = ref.current!;
      if (prefersReducedMotion()) {
        gsap.set(el, { autoAlpha: 1, y: 0 });
        return;
      }
      gsap.from(el, {
        autoAlpha: 0,
        y,
        duration,
        delay,
        ease: "power3.out",
        scrollTrigger: { trigger: el, start, once: true },
      });
    },
    { scope: ref }
  );

  return (
    <div ref={ref} className={className} style={style}>
      {children}
    </div>
  );
}
