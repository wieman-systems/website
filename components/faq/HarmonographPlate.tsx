"use client";

import { useEffect, useRef } from "react";

/**
 * THE HARMONOGRAPH PLATE — a precision drafting instrument that perpetually
 * traces and erases one decaying-free Lissajous figure inside a registration-
 * marked plate. The cursor "nudges the pendulums" so the figure leans and
 * swells toward it; hovering a FAQ question re-tunes the instrument to that
 * question's signature curve, shown in a live mono readout.
 *
 * Pure monochrome hairline ink (#000 on #fff). Canvas 2D, DPR-scaled, gated on
 * fine-pointer + no-reduced-motion, paused offscreen, idles ~30fps at rest.
 */

interface HarmonographPlateProps {
  activeIndex?: number | null;
}

// Per-question signature tunings: [fx1, fx2, fy1, fy2] near small-integer ratios.
const PRESETS: number[][] = [
  [2.0, 3.0, 3.0, 2.0],
  [3.0, 2.0, 4.0, 3.0],
  [3.0, 4.0, 2.0, 3.0],
  [5.0, 4.0, 4.0, 5.0],
  [5.0, 6.0, 6.0, 5.0],
];
const DEFAULT_TUNE = [2.0, 3.0, 3.0, 2.0];

const TAIL = 1300;     // comet length (points)
const STEPS = 7;       // points appended per frame
const BANDS = 12;      // alpha bands for the comet fade
const LINE_W = 1.4;

const clamp = (v: number, a: number, b: number) => (v < a ? a : v > b ? b : v);
const lerp = (a: number, b: number, t: number) => a + (b - a) * t;

export default function HarmonographPlate({ activeIndex = null }: HarmonographPlateProps) {
  const wrapRef = useRef<HTMLDivElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const activeRef = useRef<number | null>(activeIndex);
  activeRef.current = activeIndex;

  useEffect(() => {
    const canvas = canvasRef.current;
    const wrap = wrapRef.current;
    if (!canvas || !wrap) return;
    const ctx = canvas.getContext("2d")!;

    const reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    const fine = window.matchMedia("(hover: hover) and (pointer: fine)").matches;
    const canInteract = fine && !reduce;

    let W = 0, H = 0, dpr = 1;
    // plate frame geometry (computed in size())
    let px = 0, py = 0, pw = 0, ph = 0, cx = 0, cy = 0, amp = 0;
    const size = () => {
      W = wrap.offsetWidth; H = wrap.offsetHeight;
      if (!W || !H) return false;
      dpr = Math.min(window.devicePixelRatio || 1, 2);
      canvas.width = Math.round(W * dpr);
      canvas.height = Math.round(H * dpr);
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
      const m = 10;
      pw = W - m * 2;
      ph = Math.min(H - m * 2, pw * 1.32);
      px = (W - pw) / 2;
      py = (H - ph) / 2;
      cx = px + pw / 2;
      cy = py + ph / 2 - 8; // leave room for caption
      amp = Math.min(pw, ph) * 0.30;
      return true;
    };

    // ── tuning state (lerps toward preset / default) ───────────────────────
    const tune = [...DEFAULT_TUNE];
    const phase = [0.2, 1.1, 2.3, 0.7];
    let lean = 0;       // px-driven phase shear
    let swell = 0;      // py-driven amplitude swell
    const ptr = { x: 0, y: 0, on: false };
    let lastMove = 0;

    const onMove = (e: MouseEvent) => {
      const r = canvas.getBoundingClientRect();
      const inside = e.clientX >= r.left && e.clientX <= r.right && e.clientY >= r.top && e.clientY <= r.bottom;
      ptr.on = inside;
      if (inside) {
        ptr.x = ((e.clientX - r.left) / r.width) * 2 - 1;
        ptr.y = ((e.clientY - r.top) / r.height) * 2 - 1;
        lastMove = performance.now();
        ensure();
      }
    };

    // ── point generator ────────────────────────────────────────────────────
    let tt = 0;
    const pts: number[] = []; // flat [x,y,x,y,...] ring (we just push + slice)
    const sample = (s: number): [number, number] => {
      const x = Math.sin(tune[0] * s + phase[0] + lean) + 0.62 * Math.sin(tune[1] * s + phase[1]);
      const y = Math.sin(tune[2] * s + phase[2]) + 0.62 * Math.sin(tune[3] * s + phase[3] - lean * 0.6);
      const a = amp * (1 + 0.14 * swell) / 1.62;
      return [cx + x * a, cy + y * a];
    };

    const pushPoints = (k: number, dt: number) => {
      for (let i = 0; i < k; i++) {
        tt += dt;
        const [x, y] = sample(tt);
        pts.push(x, y);
      }
      const max = TAIL * 2;
      if (pts.length > max) pts.splice(0, pts.length - max);
    };

    // ── frame chrome: registration plate + caption ─────────────────────────
    const drawChrome = () => {
      ctx.lineWidth = 1;
      ctx.strokeStyle = "rgba(0,0,0,0.55)";
      ctx.strokeRect(Math.round(px) + 0.5, Math.round(py) + 0.5, Math.round(pw), Math.round(ph));
      // corner registration ticks
      const tk = 9;
      ctx.strokeStyle = "rgba(0,0,0,0.9)";
      ctx.lineWidth = 1.2;
      const corner = (x: number, y: number, sx: number, sy: number) => {
        ctx.beginPath();
        ctx.moveTo(x, y); ctx.lineTo(x + sx * tk, y);
        ctx.moveTo(x, y); ctx.lineTo(x, y + sy * tk);
        ctx.stroke();
      };
      corner(px, py, 1, 1); corner(px + pw, py, -1, 1);
      corner(px, py + ph, 1, -1); corner(px + pw, py + ph, -1, -1);
      // pivot crosshair (faint)
      ctx.strokeStyle = "rgba(0,0,0,0.14)";
      ctx.lineWidth = 1;
      ctx.beginPath();
      ctx.moveTo(cx - 6, cy); ctx.lineTo(cx + 6, cy);
      ctx.moveTo(cx, cy - 6); ctx.lineTo(cx, cy + 6);
      ctx.stroke();
      // caption
      const a = activeRef.current;
      const rx = (tune[0] / tune[2]) || 0;
      ctx.fillStyle = "rgba(0,0,0,0.62)";
      ctx.font = `400 10px ui-monospace, SFMono-Regular, Menlo, monospace`;
      ctx.textBaseline = "alphabetic";
      const label = a != null ? `Q.${String(a + 1).padStart(2, "0")}` : "IDLE";
      ctx.fillText(
        `fx ${tune[0].toFixed(2)}  fy ${tune[2].toFixed(2)}  r ${rx.toFixed(2)}  ${label}`,
        px + 2,
        py + ph + 16
      );
    };

    // ── comet draw (banded alpha fade, head dark → tail transparent) ───────
    const drawComet = () => {
      const n = pts.length / 2;
      if (n < 3) return;
      ctx.lineWidth = LINE_W;
      ctx.lineCap = "round";
      ctx.lineJoin = "round";
      const per = Math.ceil(n / BANDS);
      for (let b = 0; b < BANDS; b++) {
        const start = b * per;
        const end = Math.min(n - 1, start + per);
        if (end <= start) continue;
        const a = Math.pow((b + 1) / BANDS, 1.5); // newer bands darker
        ctx.strokeStyle = `rgba(0,0,0,${0.9 * a})`;
        ctx.beginPath();
        ctx.moveTo(pts[start * 2], pts[start * 2 + 1]);
        for (let i = start + 1; i <= end; i++) ctx.lineTo(pts[i * 2], pts[i * 2 + 1]);
        ctx.stroke();
      }
    };

    // ── render loop ────────────────────────────────────────────────────────
    let raf = 0, visible = false, docVisible = !document.hidden;

    const render = () => {
      const now = performance.now();
      // ease tuning toward target preset / default
      const a = activeRef.current;
      const tgt = a != null && PRESETS[a] ? PRESETS[a] : DEFAULT_TUNE;
      for (let i = 0; i < 4; i++) tune[i] = lerp(tune[i], tgt[i], 0.04);
      // cursor coupling
      const wantLean = canInteract && ptr.on ? ptr.x * 0.9 : 0;
      const wantSwell = canInteract && ptr.on ? -ptr.y : 0;
      lean = lerp(lean, wantLean, 0.06);
      swell = lerp(swell, wantSwell, 0.06);

      pushPoints(STEPS, 0.045);

      ctx.clearRect(0, 0, W, H);
      drawComet();
      drawChrome();

      const moving = canInteract && now - lastMove < 800;
      if ((visible && docVisible && !reduce) || moving) raf = requestAnimationFrame(render);
      else raf = 0;
    };
    const ensure = () => { if (!raf) raf = requestAnimationFrame(render); };

    // static single frame for reduced-motion / coarse pointer
    const drawStill = () => {
      pts.length = 0;
      tt = 0;
      for (let i = 0; i < TAIL; i++) { tt += 0.045; const [x, y] = sample(tt); pts.push(x, y); }
      ctx.clearRect(0, 0, W, H);
      drawComet();
      drawChrome();
    };

    let booted = false;
    const boot = () => {
      if (!size()) { setTimeout(boot, 120); return; }
      booted = true;
      if (!canInteract) { drawStill(); return; }
      const io = new IntersectionObserver(
        (entries) => {
          for (const e of entries) {
            visible = e.isIntersecting;
            if (e.isIntersecting) ensure();
          }
        },
        { threshold: 0.05 }
      );
      io.observe(canvas);
      ioRef = io;
      // synchronous first paint: pre-fill a partial comet so there's immediate
      // content even before the rAF loop ticks; the loop then animates it.
      pushPoints(900, 0.045);
      ctx.clearRect(0, 0, W, H);
      drawComet();
      drawChrome();
      ensure();
    };
    let ioRef: IntersectionObserver | null = null;
    boot();

    const onResize = () => { if (!booted) return; size(); if (!canInteract) drawStill(); else ensure(); };
    const onVis = () => { docVisible = !document.hidden; if (docVisible) ensure(); };

    const ro = new ResizeObserver(onResize);
    ro.observe(wrap);
    window.addEventListener("resize", onResize);
    if (canInteract) window.addEventListener("mousemove", onMove, { passive: true });
    document.addEventListener("visibilitychange", onVis);

    return () => {
      if (raf) cancelAnimationFrame(raf);
      ro.disconnect();
      ioRef?.disconnect();
      window.removeEventListener("resize", onResize);
      if (canInteract) window.removeEventListener("mousemove", onMove);
      document.removeEventListener("visibilitychange", onVis);
    };
  }, []);

  return (
    <div ref={wrapRef} style={{ position: "absolute", inset: 0 }}>
      <canvas ref={canvasRef} aria-hidden style={{ width: "100%", height: "100%", display: "block" }} />
    </div>
  );
}
