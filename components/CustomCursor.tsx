"use client";

import { useEffect, useRef } from "react";
import { gsap, isFinePointer, prefersReducedMotion } from "@/lib/motion";

/**
 * Minimalist custom cursor: a lagging ring + a tight dot, blended with
 * `mix-blend-mode: difference` so it stays visible over both black and white.
 * Expands over interactive elements. Only mounts for fine pointers and when
 * the visitor hasn't requested reduced motion — touch users keep their native
 * behaviour untouched.
 */
export default function CustomCursor() {
  const rootRef = useRef<HTMLDivElement>(null);
  const ringRef = useRef<HTMLDivElement>(null);
  const dotRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!isFinePointer() || prefersReducedMotion()) return;

    const root = rootRef.current!;
    const ring = ringRef.current!;
    const dot = dotRef.current!;

    document.documentElement.classList.add("ws-cursor-on");
    gsap.set([ring, dot], { xPercent: -50, yPercent: -50 });

    const xRing = gsap.quickTo(ring, "x", { duration: 0.45, ease: "power3" });
    const yRing = gsap.quickTo(ring, "y", { duration: 0.45, ease: "power3" });
    const xDot = gsap.quickTo(dot, "x", { duration: 0.1, ease: "power3" });
    const yDot = gsap.quickTo(dot, "y", { duration: 0.1, ease: "power3" });

    let first = true;
    const onMove = (e: MouseEvent) => {
      if (first) {
        gsap.set([ring, dot], { x: e.clientX, y: e.clientY });
        gsap.to(root, { autoAlpha: 1, duration: 0.25 });
        first = false;
        return;
      }
      xRing(e.clientX);
      yRing(e.clientY);
      xDot(e.clientX);
      yDot(e.clientY);
    };

    const clickable = (el: EventTarget | null) =>
      el instanceof Element && !!el.closest("a, button, [data-cursor]");

    const onOver = (e: MouseEvent) => {
      if (clickable(e.target)) root.classList.add("ws-cursor--hover");
    };
    const onOut = (e: MouseEvent) => {
      if (clickable(e.target) && !clickable(e.relatedTarget))
        root.classList.remove("ws-cursor--hover");
    };
    const onDown = () => root.classList.add("ws-cursor--down");
    const onUp = () => root.classList.remove("ws-cursor--down");
    const onLeave = () => gsap.to(root, { autoAlpha: 0, duration: 0.2 });
    const onEnter = () => gsap.to(root, { autoAlpha: 1, duration: 0.2 });

    window.addEventListener("mousemove", onMove, { passive: true });
    window.addEventListener("mouseover", onOver, { passive: true });
    window.addEventListener("mouseout", onOut, { passive: true });
    window.addEventListener("mousedown", onDown, { passive: true });
    window.addEventListener("mouseup", onUp, { passive: true });
    document.addEventListener("mouseleave", onLeave);
    document.addEventListener("mouseenter", onEnter);

    return () => {
      document.documentElement.classList.remove("ws-cursor-on");
      window.removeEventListener("mousemove", onMove);
      window.removeEventListener("mouseover", onOver);
      window.removeEventListener("mouseout", onOut);
      window.removeEventListener("mousedown", onDown);
      window.removeEventListener("mouseup", onUp);
      document.removeEventListener("mouseleave", onLeave);
      document.removeEventListener("mouseenter", onEnter);
    };
  }, []);

  return (
    <div ref={rootRef} className="ws-cursor" aria-hidden style={{ opacity: 0 }}>
      <div ref={ringRef} className="ws-cursor__ring" />
      <div ref={dotRef} className="ws-cursor__dot" />
    </div>
  );
}
