"use client";

import { useEffect, useRef, useState } from "react";
import { prefersReducedMotion } from "@/lib/motion";

const GLYPHS = "ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789#%&/<>*+=";

interface ScrambleTextProps {
  text: string;
  className?: string;
  style?: React.CSSProperties;
  /** Total decode time in ms. */
  duration?: number;
  /** What kicks off the decode. "view" also re-runs on hover. */
  trigger?: "view" | "hover" | "load";
}

/**
 * Matrix-style "decode" effect: characters resolve left-to-right out of random
 * glyphs. Renders the real text for assistive tech and ships the final string
 * on the server so there is never layout shift.
 */
export default function ScrambleText({
  text,
  className,
  style,
  duration = 760,
  trigger = "view",
}: ScrambleTextProps) {
  const ref = useRef<HTMLSpanElement>(null);
  const raf = useRef<number | null>(null);
  const started = useRef(false);
  const [display, setDisplay] = useState(text);

  const run = () => {
    if (prefersReducedMotion()) {
      setDisplay(text);
      return;
    }
    if (raf.current) cancelAnimationFrame(raf.current);
    const start = performance.now();
    const len = text.length;
    const tick = (now: number) => {
      const p = Math.min(1, (now - start) / duration);
      const revealed = Math.floor(p * len);
      let out = "";
      for (let i = 0; i < len; i++) {
        const ch = text[i];
        if (ch === " ") out += " ";
        else if (i < revealed) out += ch;
        else out += GLYPHS[(Math.random() * GLYPHS.length) | 0];
      }
      setDisplay(out);
      if (p < 1) raf.current = requestAnimationFrame(tick);
      else setDisplay(text);
    };
    raf.current = requestAnimationFrame(tick);
  };

  useEffect(() => {
    const el = ref.current;
    if (!el) return;

    if (trigger === "load") {
      run();
      return;
    }
    if (trigger === "view") {
      const io = new IntersectionObserver(
        (entries) => {
          for (const e of entries) {
            if (e.isIntersecting && !started.current) {
              started.current = true;
              run();
            }
          }
        },
        { threshold: 0.6 }
      );
      io.observe(el);
      return () => io.disconnect();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [text, trigger]);

  useEffect(
    () => () => {
      if (raf.current) cancelAnimationFrame(raf.current);
    },
    []
  );

  return (
    <span
      ref={ref}
      className={`ws-scramble${className ? ` ${className}` : ""}`}
      style={style}
      onMouseEnter={trigger !== "load" ? run : undefined}
    >
      <span aria-hidden="true">{display}</span>
      <span className="ws-visually-hidden">{text}</span>
    </span>
  );
}
