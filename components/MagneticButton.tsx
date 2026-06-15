"use client";

import { ButtonHTMLAttributes, ReactNode, useRef } from "react";
import { useGSAP } from "@gsap/react";
import { gsap, isFinePointer, prefersReducedMotion } from "@/lib/motion";

type Variant = "outline-dark" | "solid-dark" | "solid-light";

interface MagneticButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: Variant;
  /** How strongly the button is pulled toward the cursor (0–1). */
  strength?: number;
  children: ReactNode;
}

/**
 * A button with two premium micro-interactions:
 *  - a magnetic pull toward the cursor while hovered (fine pointers only)
 *  - an inverted colour sweep on hover, driven by the `.ws-btn` CSS.
 */
export default function MagneticButton({
  variant = "outline-dark",
  strength = 0.34,
  children,
  className,
  ...rest
}: MagneticButtonProps) {
  const ref = useRef<HTMLButtonElement>(null);

  useGSAP(
    () => {
      if (!isFinePointer() || prefersReducedMotion()) return;
      const el = ref.current!;
      const xTo = gsap.quickTo(el, "x", { duration: 0.5, ease: "power3" });
      const yTo = gsap.quickTo(el, "y", { duration: 0.5, ease: "power3" });

      const onMove = (e: MouseEvent) => {
        const r = el.getBoundingClientRect();
        xTo((e.clientX - (r.left + r.width / 2)) * strength);
        yTo((e.clientY - (r.top + r.height / 2)) * strength);
      };
      const onLeave = () => {
        xTo(0);
        yTo(0);
      };

      el.addEventListener("mousemove", onMove);
      el.addEventListener("mouseleave", onLeave);
      return () => {
        el.removeEventListener("mousemove", onMove);
        el.removeEventListener("mouseleave", onLeave);
      };
    },
    { scope: ref }
  );

  return (
    <button
      ref={ref}
      data-cursor
      className={`ws-btn ws-btn--${variant}${className ? ` ${className}` : ""}`}
      {...rest}
    >
      <span className="ws-btn__label">{children}</span>
    </button>
  );
}
