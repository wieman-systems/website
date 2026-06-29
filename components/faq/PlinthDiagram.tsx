"use client";

import { useEffect, useRef } from "react";
import { useThemeInk } from "../ThemeProvider";

/**
 * THE PLINTH — an exploded-axonometric "system" that assembles under the cursor.
 *
 * One orthographic object in 2:1 axonometric wireframe: five stacked plates
 * (01 DATA · 02 PIPELINE · 03 LOGIC · 04 DASHBOARD · 05 RUN). It drafts itself
 * in pen-plot style, drifts apart into an exploded view at rest, and slides
 * together into one solid block as the cursor nears — the visitor finishes
 * building the thing the FAQ is describing. Hovering a question lights its plate.
 *
 * Pure monochrome hairlines (#000 on #fff). Canvas 2D, DPR-scaled, gated on
 * fine-pointer + no-reduced-motion, paused offscreen, idles and stops at rest.
 */

interface PlinthDiagramProps {
  /** Index (0-based) of the hovered/focused FAQ item, or null. */
  activeIndex?: number | null;
  labels?: string[];
}

const PLATES = ["DATA", "PIPELINE", "LOGIC", "DASHBOARD", "RUN"];
const N = 5;

const LINE_W = 1.4;
const U = 40;          // px per model unit, horizontal (footprint half-width = HS*U)
const H = 110;         // px per model unit, vertical (z)
const HS = 0.92;       // footprint half-size (model units)
const T = 0.16;        // plate thickness (model units, z)
const GAP_MAX = 0.42;  // exploded gap between plates (model units, z)
const DRAW_MS = 1500;

const clamp = (v: number, a: number, b: number) => (v < a ? a : v > b ? b : v);
const smoothstep = (e0: number, e1: number, x: number) => {
  const t = clamp((x - e0) / (e1 - e0), 0, 1);
  return t * t * (3 - 2 * t);
};
const easeOut = (t: number) => 1 - Math.pow(1 - t, 3);
const seeded = (i: number) => {
  const n = Math.sin(i * 12.9898) * 43758.5453;
  return n - Math.floor(n);
};

export default function PlinthDiagram({ activeIndex = null, labels = PLATES }: PlinthDiagramProps) {
  const wrapRef = useRef<HTMLDivElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const activeRef = useRef<number | null>(activeIndex);
  activeRef.current = activeIndex;
  const ink = useThemeInk("primary");

  useEffect(() => {
    const canvas = canvasRef.current;
    const wrap = wrapRef.current;
    if (!canvas || !wrap) return;
    const ctx = canvas.getContext("2d")!;

    const reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    const fine = window.matchMedia("(hover: hover) and (pointer: fine)").matches;
    const canInteract = fine && !reduce;

    let W = 0, H_ = 0, dpr = 1;
    const size = () => {
      W = wrap.offsetWidth;
      H_ = wrap.offsetHeight;
      if (!W || !H_) return false;
      dpr = Math.min(window.devicePixelRatio || 1, 2);
      canvas.width = Math.round(W * dpr);
      canvas.height = Math.round(H_ * dpr);
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
      return true;
    };

    // ── pointer → seat (assembly) ──────────────────────────────────────────
    const target = { seat: 0 };
    let seat = 0;                // 0 = exploded, 1 = assembled
    let lastMove = 0;
    let rectCache: DOMRect | null = null;
    const onMove = (e: MouseEvent) => {
      const r = rectCache ?? (rectCache = canvas.getBoundingClientRect());
      const cx = clamp(e.clientX, r.left, r.right);
      const cy = clamp(e.clientY, r.top, r.bottom);
      const dist = Math.hypot(e.clientX - cx, e.clientY - cy);
      target.seat = smoothstep(300, 70, dist);
      lastMove = performance.now();
      ensure();
    };
    const onScroll = () => { rectCache = null; };

    // ── geometry ───────────────────────────────────────────────────────────
    // box corners (footprint square × thickness), edges by index pairs
    const EDGES: [number, number][] = [
      [0, 1], [1, 2], [2, 3], [3, 0],   // bottom
      [4, 5], [5, 6], [6, 7], [7, 4],   // top
      [0, 4], [1, 5], [2, 6], [3, 7],   // verticals
    ];
    const cornersOf = (zb: number, zt: number) => [
      [-HS, -HS, zb], [HS, -HS, zb], [HS, HS, zb], [-HS, HS, zb],
      [-HS, -HS, zt], [HS, -HS, zt], [HS, HS, zt], [-HS, HS, zt],
    ];

    let cx0 = 0, cy0 = 0, zMid = 0;
    const project = (x: number, y: number, z: number): [number, number] => [
      cx0 + (x - y) * U,
      cy0 - (z - zMid) * H + (x + y) * U * 0.5,
    ];

    // draw an edge from a→b revealed up to fraction p by length (pen-plot draw-in)
    const strokeEdge = (a: number[], b: number[], p: number) => {
      const [ax, ay] = project(a[0], a[1], a[2]);
      const [bx, by] = project(b[0], b[1], b[2]);
      ctx.beginPath();
      ctx.moveTo(ax, ay);
      ctx.lineTo(ax + (bx - ax) * p, ay + (by - ay) * p);
      ctx.stroke();
    };

    // ── render ───────────────────────────────────────────────────────────
    let raf = 0;
    let visible = false;
    let docVisible = !document.hidden;
    let drawStart = reduce ? -1 : 0; // 0 = armed, -1 = settled (no draw-in)

    const render = () => {
      const now = performance.now();

      // assembly easing
      const wantSeat = canInteract ? target.seat : 0;
      seat += (wantSeat - seat) * 0.1;
      if (seat < 0.001 && wantSeat === 0) seat = 0;

      const g = GAP_MAX * (1 - seat);
      const totalZ = N * T + (N - 1) * g;
      zMid = totalZ / 2;
      cx0 = W * 0.6;
      cy0 = H_ * 0.5;

      // draw-in progress
      let P = 1;
      if (drawStart > 0) P = clamp((now - drawStart) / DRAW_MS, 0, 1);
      else if (drawStart === 0) P = 0;
      const drafting = drawStart > 0 && P < 1;

      ctx.clearRect(0, 0, W, H_);
      ctx.lineWidth = LINE_W;
      ctx.lineCap = "round";
      ctx.lineJoin = "round";

      const active = activeRef.current;
      const t = now * 0.001;

      for (let i = 0; i < N; i++) {
        const bob = drafting ? 0 : (1 - seat) * 5 * Math.sin(t * 0.7 + seeded(i + 1) * 6.28);
        const bottomZ = i * (T + g) + bob / H;
        const topZ = bottomZ + T;
        const corners = cornersOf(bottomZ, topZ);

        const isActive = active === i;
        const dim = active != null && !isActive;

        // active plate slides slightly proud (toward viewer) + lifts
        let ox = 0, oy = 0;
        if (isActive) { ox = 14; oy = -4; }
        const proud = isActive ? 1 : 0;

        // alpha for edges + top-face wash
        const baseEdge = 0.5 + 0.42 * seat;
        const edgeA = isActive ? 1 : dim ? 0.16 : baseEdge;
        const faceA = (0.03 + 0.09 * seat) * (isActive ? 2.2 : dim ? 0.4 : 1);

        ctx.save();
        ctx.translate(ox, oy);

        // top-face wash (gives the "solid" read as it assembles / on hover)
        const tf = [corners[4], corners[5], corners[6], corners[7]].map((c) =>
          project(c[0], c[1], c[2])
        );
        ctx.beginPath();
        ctx.moveTo(tf[0][0], tf[0][1]);
        for (let k = 1; k < 4; k++) ctx.lineTo(tf[k][0], tf[k][1]);
        ctx.closePath();
        ctx.fillStyle = `rgba(${ink},${faceA})`;
        ctx.fill();

        // edges
        ctx.strokeStyle = `rgba(${ink},${edgeA})`;
        for (let e = 0; e < EDGES.length; e++) {
          const [ai, bi] = EDGES[e];
          let p = 1;
          if (drafting) {
            const appear = (i / N) * 0.46 + e * 0.012;
            p = easeOut(clamp((P - appear) / 0.34, 0, 1));
            if (p <= 0) continue;
          }
          strokeEdge(corners[ai], corners[bi], p);
        }

        // label + leader line (left of plate), faded while drafting
        if (!drafting) {
          const lz = (bottomZ + topZ) / 2;
          const [lpx, lpy] = project(-HS, HS, lz); // left-front vertex
          const labelX = 16;
          const labelY = lpy + oy + 3;
          const labA = isActive ? 1 : dim ? 0.22 : 0.5;
          // leader
          ctx.strokeStyle = `rgba(${ink},${labA * 0.55})`;
          ctx.beginPath();
          ctx.moveTo(labelX + 54, labelY - 3);
          ctx.lineTo(lpx + ox, lpy + oy);
          ctx.stroke();
          // text
          ctx.fillStyle = `rgba(${ink},${labA})`;
          ctx.font = `600 10px ui-monospace, SFMono-Regular, Menlo, monospace`;
          ctx.textBaseline = "alphabetic";
          const num = String(i + 1).padStart(2, "0");
          ctx.fillText(`${num} ${labels[i] ?? PLATES[i]}`, labelX, labelY);
          void proud;
        }

        ctx.restore();
      }

      const animating =
        drafting ||
        Math.abs(seat - wantSeat) > 0.001 ||
        seat > 0.001 ||
        (canInteract && now - lastMove < 700) ||
        (!reduce && visible && docVisible);

      if (animating && docVisible) raf = requestAnimationFrame(render);
      else raf = 0;
    };

    const ensure = () => { if (!raf) raf = requestAnimationFrame(render); };

    // ── boot ───────────────────────────────────────────────────────────────
    let booted = false;
    const boot = () => {
      if (!size()) { setTimeout(boot, 120); return; }
      booted = true;
      const io = new IntersectionObserver(
        (entries) => {
          for (const e of entries) {
            visible = e.isIntersecting;
            if (e.isIntersecting && drawStart === 0) drawStart = performance.now();
            if (e.isIntersecting) ensure();
          }
        },
        { threshold: 0.05 }
      );
      io.observe(canvas);
      ioRef = io;
      render();
    };
    let ioRef: IntersectionObserver | null = null;
    boot();

    const onResize = () => { if (booted) { rectCache = null; size(); ensure(); } };
    const onVis = () => { docVisible = !document.hidden; if (docVisible) ensure(); };

    const ro = new ResizeObserver(onResize);
    ro.observe(wrap);
    window.addEventListener("resize", onResize);
    window.addEventListener("scroll", onScroll, { passive: true });
    if (canInteract) window.addEventListener("mousemove", onMove, { passive: true });
    document.addEventListener("visibilitychange", onVis);

    return () => {
      if (raf) cancelAnimationFrame(raf);
      ro.disconnect();
      ioRef?.disconnect();
      window.removeEventListener("resize", onResize);
      window.removeEventListener("scroll", onScroll);
      if (canInteract) window.removeEventListener("mousemove", onMove);
      document.removeEventListener("visibilitychange", onVis);
    };
  }, [labels, ink]);

  return (
    <div ref={wrapRef} style={{ position: "absolute", inset: 0 }}>
      <canvas ref={canvasRef} aria-hidden style={{ width: "100%", height: "100%", display: "block" }} />
    </div>
  );
}
