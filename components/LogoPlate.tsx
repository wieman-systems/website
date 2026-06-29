"use client";

import { useEffect, useRef } from "react";
import { useThemeInk } from "./ThemeProvider";

/**
 * THE MARK PLATE — a precision drafting instrument that plots the Wieman Systems
 * mark inside a registration-marked plate, then loops: a pen TRACES the three
 * pillars in hairline ink, the forms FLOOD with solid ink from the base up, the
 * finished mark HOLDS, then FADES and re-draws. A live mono readout prints the
 * plotter state (PLOT / INK / LOCK / RESET). On desktop the cursor nudges the
 * plotter faster and drops a registration reticle; touch devices get a single
 * draw-in on scroll; reduced-motion gets the finished mark, static.
 *
 * Pure monochrome ink (#000 on #fff). Canvas 2D, DPR-scaled, gated on pointer +
 * reduced-motion, paused offscreen and when the tab is hidden.
 *
 * Geometry traced from public/assets/logo-mark.png (3 forms, 16 vertices),
 * normalised into the pillars' bounding box [89..310] × [20..378].
 */

// ── logo geometry, in source-PNG pixels ────────────────────────────────────
const SRC_X0 = 89, SRC_Y0 = 20, SRC_W = 221, SRC_H = 358;
const LOGO_ASPECT = SRC_W / SRC_H; // ≈ 0.617 (portrait)

// Each form is a closed polygon, ordered from its top vertex. Drawn left →
// centre → right so the tall centre tower lands as the middle beat.
const RAW: number[][][] = [
  [[139, 89], [140, 281], [163, 289], [160, 366], [89, 286], [89, 138]],            // left slab (stepped right edge)
  [[200, 20], [165, 54], [165, 251], [188, 274], [188, 378], [235, 378], [235, 53]], // centre tower
  [[260, 94], [310, 142], [310, 327], [260, 377]],                                  // right column
];
// → normalised unit space (nx, ny ∈ [0,1]); scaled to the plate at render time.
const FORMS: number[][][] = RAW.map((pts) =>
  pts.map(([x, y]) => [(x - SRC_X0) / SRC_W, (y - SRC_Y0) / SRC_H])
);

// ── loop timing (ms) ────────────────────────────────────────────────────────
const TRACE_MS = 2400;
const FILL_MS = 850;
const HOLD_MS = 1500;
const FADE_MS = 700;
const CYCLE = TRACE_MS + FILL_MS + HOLD_MS + FADE_MS;
const ONCE_END = TRACE_MS + FILL_MS + HOLD_MS; // touch: draw once, then rest solid

const OUTLINE_W = 1.6;

const clamp = (v: number, a: number, b: number) => (v < a ? a : v > b ? b : v);
const lerp = (a: number, b: number, t: number) => a + (b - a) * t;
const easeInOut = (t: number) => (t < 0.5 ? 2 * t * t : 1 - Math.pow(-2 * t + 2, 2) / 2);
const easeOut = (t: number) => 1 - Math.pow(1 - t, 3);

export default function LogoPlate() {
  const wrapRef = useRef<HTMLDivElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const ink = useThemeInk("primary");

  useEffect(() => {
    const canvas = canvasRef.current;
    const wrap = wrapRef.current;
    if (!canvas || !wrap) return;
    const ctx = canvas.getContext("2d")!;

    const reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    const fine = window.matchMedia("(hover: hover) and (pointer: fine)").matches;
    const loop = fine && !reduce;     // desktop: continuous loop
    const playOnce = !fine && !reduce; // touch: single draw-in on scroll

    // ── layout: a portrait registration plate sized to the mark, centred ─────
    let W = 0, H = 0, dpr = 1;
    let px = 0, py = 0, pw = 0, ph = 0;       // plate rect
    let lx = 0, ly = 0, lw = 0, lh = 0;       // logo rect inside the plate
    const PAD = 14, PAD_X = 26, PAD_TOP = 22, PAD_BOT = 30;
    const size = () => {
      W = wrap.offsetWidth; H = wrap.offsetHeight;
      if (!W || !H) return false;
      dpr = Math.min(window.devicePixelRatio || 1, 2);
      canvas.width = Math.round(W * dpr);
      canvas.height = Math.round(H * dpr);
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);

      const availW = W - PAD * 2, availH = H - PAD * 2;
      lh = Math.min(availH - PAD_TOP - PAD_BOT, 460);
      lw = lh * LOGO_ASPECT;
      const maxW = availW - PAD_X * 2;
      if (lw > maxW) { lw = maxW; lh = lw / LOGO_ASPECT; }
      pw = lw + PAD_X * 2;
      ph = lh + PAD_TOP + PAD_BOT;
      px = Math.round((W - pw) / 2);
      py = Math.round((H - ph) / 2);
      lx = px + (pw - lw) / 2;
      ly = py + PAD_TOP;
      return true;
    };

    // map a form's normalised points → screen px at the current layout
    const screenForm = (form: number[][]): number[][] =>
      form.map(([nx, ny]) => [lx + nx * lw, ly + ny * lh]);
    const perim = (pts: number[][]) => {
      let s = 0;
      for (let i = 0; i < pts.length; i++) {
        const a = pts[i], b = pts[(i + 1) % pts.length];
        s += Math.hypot(b[0] - a[0], b[1] - a[1]);
      }
      return s;
    };

    // stroke a closed loop from vertex 0 up to arc-length L; return the pen head
    const strokeLoopPartial = (pts: number[][], L: number): [number, number] => {
      ctx.beginPath();
      ctx.moveTo(pts[0][0], pts[0][1]);
      let acc = 0, hx = pts[0][0], hy = pts[0][1];
      for (let i = 0; i < pts.length; i++) {
        const a = pts[i], b = pts[(i + 1) % pts.length];
        const seg = Math.hypot(b[0] - a[0], b[1] - a[1]);
        if (acc + seg <= L) { ctx.lineTo(b[0], b[1]); acc += seg; hx = b[0]; hy = b[1]; }
        else {
          const t = seg > 0 ? (L - acc) / seg : 0;
          hx = a[0] + (b[0] - a[0]) * t; hy = a[1] + (b[1] - a[1]) * t;
          ctx.lineTo(hx, hy); break;
        }
      }
      ctx.stroke();
      return [hx, hy];
    };
    const pathLoop = (pts: number[][]) => {
      ctx.beginPath();
      ctx.moveTo(pts[0][0], pts[0][1]);
      for (let i = 1; i < pts.length; i++) ctx.lineTo(pts[i][0], pts[i][1]);
      ctx.closePath();
    };
    const strokeFull = (forms: number[][][], alpha: number) => {
      ctx.strokeStyle = `rgba(${ink},${alpha})`;
      ctx.lineWidth = OUTLINE_W;
      for (const f of forms) { pathLoop(f); ctx.stroke(); }
    };
    const fillFull = (forms: number[][][], alpha: number) => {
      ctx.fillStyle = `rgba(${ink},${alpha})`;
      for (const f of forms) { pathLoop(f); ctx.fill(); }
    };

    // ── plate chrome ─────────────────────────────────────────────────────────
    const drawChrome = (phaseLabel: string) => {
      // frame
      ctx.lineWidth = 1;
      ctx.strokeStyle = `rgba(${ink},0.5)`;
      ctx.strokeRect(px + 0.5, py + 0.5, Math.round(pw), Math.round(ph));
      // corner registration ticks
      const tk = 9;
      ctx.strokeStyle = `rgba(${ink},0.9)`;
      ctx.lineWidth = 1.2;
      const corner = (x: number, y: number, sx: number, sy: number) => {
        ctx.beginPath();
        ctx.moveTo(x, y); ctx.lineTo(x + sx * tk, y);
        ctx.moveTo(x, y); ctx.lineTo(x, y + sy * tk);
        ctx.stroke();
      };
      corner(px, py, 1, 1); corner(px + pw, py, -1, 1);
      corner(px, py + ph, 1, -1); corner(px + pw, py + ph, -1, -1);
      // caption
      const by = py + ph - 11;
      ctx.textBaseline = "alphabetic";
      ctx.fillStyle = `rgba(${ink},0.6)`;
      ctx.font = "600 10px ui-monospace, SFMono-Regular, Menlo, monospace";
      ctx.textAlign = "left";
      ctx.fillText("WS-MARK", px + 8, by);
      ctx.fillStyle = `rgba(${ink},0.42)`;
      ctx.font = "400 10px ui-monospace, SFMono-Regular, Menlo, monospace";
      ctx.textAlign = "right";
      ctx.fillText(phaseLabel, px + pw - 8, by);
      ctx.textAlign = "left";
    };

    // faint pivot crosshair at the mark's centre (behind the figure)
    const drawPivot = () => {
      const cx = lx + lw / 2, cy = ly + lh / 2;
      ctx.strokeStyle = `rgba(${ink},0.13)`;
      ctx.lineWidth = 1;
      ctx.beginPath();
      ctx.moveTo(cx - 7, cy); ctx.lineTo(cx + 7, cy);
      ctx.moveTo(cx, cy - 7); ctx.lineTo(cx, cy + 7);
      ctx.stroke();
    };

    // ── pointer: speed nudge + tracking reticle (desktop only) ───────────────
    const ptr = { x: 0, y: 0, inside: false };
    let speed = 1, speedT = 1, lastMove = 0;
    let rectCache: DOMRect | null = null;
    const onMove = (e: MouseEvent) => {
      const r = rectCache ?? (rectCache = canvas.getBoundingClientRect());
      const inPlate =
        e.clientX >= r.left + px && e.clientX <= r.left + px + pw &&
        e.clientY >= r.top + py && e.clientY <= r.top + py + ph;
      ptr.inside = inPlate;
      ptr.x = e.clientX - r.left; ptr.y = e.clientY - r.top;
      speedT = inPlate ? 1.7 : 1;
      lastMove = performance.now();
      ensure();
    };
    const onScroll = () => { rectCache = null; };

    const drawReticle = () => {
      if (!ptr.inside) return;
      const x = clamp(ptr.x, px, px + pw), y = clamp(ptr.y, py, py + ph);
      ctx.strokeStyle = `rgba(${ink},0.28)`;
      ctx.lineWidth = 1;
      ctx.beginPath();
      ctx.moveTo(x - 9, y); ctx.lineTo(x - 3, y); ctx.moveTo(x + 3, y); ctx.lineTo(x + 9, y);
      ctx.moveTo(x, y - 9); ctx.lineTo(x, y - 3); ctx.moveTo(x, y + 3); ctx.lineTo(x, y + 9);
      ctx.stroke();
    };

    // ── render loop ──────────────────────────────────────────────────────────
    let raf = 0, visible = false, docVisible = !document.hidden;
    let clock = 0, last = 0, started = false;

    const drawScene = () => {
      const forms = FORMS.map(screenForm);

      // resolve phase
      let t: number, phase: "trace" | "fill" | "hold" | "fade";
      if (reduce) { t = ONCE_END; phase = "hold"; }
      else if (playOnce) { t = Math.min(clock, ONCE_END); phase = "hold"; }
      else { t = clock % CYCLE; phase = "trace"; }

      if (t < TRACE_MS) phase = "trace";
      else if (t < TRACE_MS + FILL_MS) phase = "fill";
      else if (t < ONCE_END) phase = "hold";
      else phase = "fade";

      ctx.clearRect(0, 0, W, H);
      drawPivot();

      ctx.lineCap = "round";
      ctx.lineJoin = "round";

      let label = "MARK";
      if (phase === "trace") {
        const p = easeInOut(clamp(t / TRACE_MS, 0, 1));
        // faint pencil guide of the full mark, then ink over it
        strokeFull(forms, 0.07);
        const total = forms.reduce((s, f) => s + perim(f), 0);
        let rem = p * total, head: [number, number] | null = null;
        ctx.strokeStyle = `rgba(${ink},0.9)`;
        ctx.lineWidth = OUTLINE_W;
        for (const f of forms) {
          const per = perim(f);
          const take = clamp(rem, 0, per);
          if (take <= 0) break;
          head = strokeLoopPartial(f, take);
          rem -= per;
          if (rem <= 0) break;
        }
        if (head) {
          ctx.fillStyle = `rgb(${ink})`;
          ctx.beginPath(); ctx.arc(head[0], head[1], 2.4, 0, Math.PI * 2); ctx.fill();
          ctx.strokeStyle = `rgba(${ink},0.45)`; ctx.lineWidth = 1;
          ctx.beginPath();
          ctx.moveTo(head[0] - 6, head[1]); ctx.lineTo(head[0] + 6, head[1]);
          ctx.moveTo(head[0], head[1] - 6); ctx.lineTo(head[0], head[1] + 6);
          ctx.stroke();
        }
        label = `PLOT ${Math.round((t / TRACE_MS) * 100)}%`;
      } else if (phase === "fill") {
        const p = easeOut(clamp((t - TRACE_MS) / FILL_MS, 0, 1));
        const wipe = ly + lh - p * lh; // ink front, rising from the base
        ctx.save();
        ctx.beginPath();
        ctx.rect(lx - PAD_X, wipe, lw + PAD_X * 2, ly + lh - wipe + 1);
        ctx.clip();
        fillFull(forms, 1);
        ctx.restore();
        strokeFull(forms, 0.9);
        // ink-front hairline
        ctx.strokeStyle = `rgba(${ink},0.5)`;
        ctx.lineWidth = 1;
        ctx.beginPath();
        ctx.moveTo(lx, Math.round(wipe) + 0.5); ctx.lineTo(lx + lw, Math.round(wipe) + 0.5);
        ctx.stroke();
        label = `INK ${Math.round(p * 100)}%`;
      } else if (phase === "hold") {
        fillFull(forms, 1);
        strokeFull(forms, 0.9);
        label = reduce ? "MARK" : "LOCK";
      } else {
        // fade: ink dissolves, plate stays
        const p = clamp((t - ONCE_END) / FADE_MS, 0, 1);
        ctx.globalAlpha = 1 - p;
        fillFull(forms, 1);
        strokeFull(forms, 0.9);
        ctx.globalAlpha = 1;
        label = "RESET";
      }

      drawChrome(label);
      if (loop) drawReticle();
    };

    const render = () => {
      const now = performance.now();
      if (!last) last = now;
      let dt = now - last; last = now;
      if (dt > 60) dt = 60; // clamp tab-switch / resume jumps

      if (loop) { speed = lerp(speed, speedT, 0.08); clock += dt * speed; }
      else if (playOnce) { clock = Math.min(clock + dt, ONCE_END); }

      drawScene();

      const done = playOnce && clock >= ONCE_END;
      const moving = loop && now - lastMove < 700;
      if (!reduce && !done && docVisible && (visible || moving)) raf = requestAnimationFrame(render);
      else raf = 0;
    };
    const ensure = () => { if (!raf && !reduce) raf = requestAnimationFrame(render); };

    // ── boot ─────────────────────────────────────────────────────────────────
    let booted = false, ioRef: IntersectionObserver | null = null;
    const boot = () => {
      if (!size()) { setTimeout(boot, 120); return; }
      booted = true;
      if (reduce) { drawScene(); return; }     // static finished mark
      const io = new IntersectionObserver(
        (entries) => {
          for (const e of entries) {
            visible = e.isIntersecting;
            if (e.isIntersecting) {
              if (!started) { started = true; last = 0; clock = 0; } // arm draw-in
              ensure();
            }
          }
        },
        { threshold: 0.05 }
      );
      io.observe(canvas);
      ioRef = io;
      drawScene(); // first paint (blank plate, pre-trace)
    };
    boot();

    const onResize = () => { if (!booted) return; rectCache = null; size(); if (reduce) drawScene(); else ensure(); };
    const onVis = () => { docVisible = !document.hidden; if (docVisible) { last = 0; ensure(); } };

    const ro = new ResizeObserver(onResize);
    ro.observe(wrap);
    window.addEventListener("resize", onResize);
    window.addEventListener("scroll", onScroll, { passive: true });
    if (loop) window.addEventListener("mousemove", onMove, { passive: true });
    document.addEventListener("visibilitychange", onVis);

    return () => {
      if (raf) cancelAnimationFrame(raf);
      ro.disconnect();
      ioRef?.disconnect();
      window.removeEventListener("resize", onResize);
      window.removeEventListener("scroll", onScroll);
      if (loop) window.removeEventListener("mousemove", onMove);
      document.removeEventListener("visibilitychange", onVis);
    };
  }, [ink]);

  return (
    <div ref={wrapRef} style={{ position: "absolute", inset: 0 }}>
      <canvas ref={canvasRef} aria-hidden style={{ width: "100%", height: "100%", display: "block" }} />
    </div>
  );
}
