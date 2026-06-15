"use client";

// Central GSAP setup + motion helpers shared across the site.
// Plugins (ScrollTrigger, SplitText, ScrambleText) ship inside the free `gsap`
// package in this version, so they can be imported and registered directly.
import { gsap } from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { SplitText } from "gsap/SplitText";

// Registration touches no browser globals at import time, but guard anyway so
// it is a no-op during server rendering of the client components that use it.
if (typeof window !== "undefined") {
  gsap.registerPlugin(ScrollTrigger, SplitText);
}

/** True when the visitor has asked the OS to reduce motion. */
export const prefersReducedMotion = (): boolean =>
  typeof window !== "undefined" &&
  window.matchMedia("(prefers-reduced-motion: reduce)").matches;

/** True for precise, hover-capable pointers (i.e. a real mouse, not touch). */
export const isFinePointer = (): boolean =>
  typeof window !== "undefined" &&
  window.matchMedia("(hover: hover) and (pointer: fine)").matches;

export { gsap, ScrollTrigger, SplitText };
