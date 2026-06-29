"use client";

import { useEffect, useRef } from "react";
import { useThemeInk } from "../ThemeProvider";

/**
 * THE CALIPER — a living dimension gauge that measures the FAQ. A vertical
 * engineer's caliper fills the column beside the questions; its jaws glide to
 * span whichever question is hovered (measuring the *actual* card box) and a
 * mono readout prints the dimension + index ("Δ 184 u", "Q.03 / 05"). Idle, the
 * jaws span the whole list ("Σ 5 ITEMS"). The lower jaw is draggable and snaps
 * to the nearest card edge.
 *
 * Pure monochrome hairlines (#000 on #fff) with a brutalist offset-shadow chip
 * (echoes the modal's 8px 8px 0 #000). Canvas 2D, DPR-scaled, gated on fine-
 * pointer + no-reduced-motion. Static at rest (a precise instrument), animating
 * only through hover / drag transitions.
 */

interface CaliperGaugeProps {
  /** Index of the hovered FAQ card, or null. */
  activeIndex?: number | null;
  /** Refs to the FAQ card elements, so the jaws can measure the real rows. */
  itemsRef?: React.RefObject<(HTMLElement | null)[]>;
  count?: number;
}

const LINE_W = 1.4;
const clamp = (v: number, a: number, b: number) => (v < a ? a : v > b ? b : v);

export default function CaliperGauge({ activeIndex = null, itemsRef, count = 5 }: CaliperGaugeProps) {
  const wrapRef = useRef<HTMLDivElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const activeRef = useRef<number | null>(activeIndex);
  activeRef.current = activeIndex;
  const kickRef = useRef<(() => void) | null>(null);
  const ink = useThemeInk("primary"); // hairlines + readout text
  const panel = useThemeInk("inverse"); // readout chip background (page bg)

  useEffect(() => {
    const canvas = canvasRef.current;
    const wrap = wrapRef.current;
    if (!canvas || !wrap) return;
    const ctx = canvas.getContext("2d")!;

    const reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    const fine = window.matchMedia("(hover: hover) and (pointer: fine)").matches;
    const canInteract = fine && !reduce;

    let W = 0, H = 0, dpr = 1, beamX = 0, tipX = 0;
    const PADY = 14;
    const size = () => {
      W = wrap.offsetWidth; H = wrap.offsetHeight;
      if (!W || !H) return false;
      dpr = Math.min(window.devicePixelRatio || 1, 2);
      canvas.width = Math.round(W * dpr);
      canvas.height = Math.round(H * dpr);
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
      beamX = Math.round(W * 0.62) + 0.5;
      tipX = Math.round(W * 0.16) + 0.5;
      return true;
    };

    // Measure the FAQ cards relative to the canvas (CSS px). Falls back to equal
    // bands if no card refs are supplied.
    type Bounds = { tops: (number | null)[]; bots: (number | null)[]; yA: number; yB: number; real: boolean };
    const measure = (): Bounds | null => {
      const items = itemsRef?.current;
      const cr = canvas.getBoundingClientRect();
      if (!cr.height) return null;
      if (!items || !items.length) {
        const yA = PADY, yB = H - PADY, bandH = (yB - yA) / count;
        const tops: number[] = [], bots: number[] = [];
        for (let i = 0; i < count; i++) { tops[i] = yA + i * bandH; bots[i] = yA + (i + 1) * bandH; }
        return { tops, bots, yA, yB, real: false };
      }
      const tops: (number | null)[] = [], bots: (number | null)[] = [];
      let any = false, mn = Infinity, mx = -Infinity;
      for (let i = 0; i < items.length; i++) {
        const el = items[i];
        if (!el) { tops[i] = null; bots[i] = null; continue; }
        const r = el.getBoundingClientRect();
        const t = r.top - cr.top, b = r.bottom - cr.top;
        tops[i] = t; bots[i] = b; any = true;
        if (t < mn) mn = t; if (b > mx) mx = b;
      }
      if (!any) return null;
      return { tops, bots, yA: Math.max(2, mn), yB: Math.min(H - 2, mx), real: true };
    };

    // jaw + drag state
    let jawTop = 0, jawBot = 0, inited = false;
    let dragging = false, dragY = 0, lastMove = 0;
    let snapEdges: number[] = [];

    const onDown = (e: MouseEvent) => {
      const r = canvas.getBoundingClientRect();
      const my = e.clientY - r.top, mx = e.clientX - r.left;
      if (Math.abs(my - jawBot) < 18 && mx < beamX + 14) {
        dragging = true; dragY = my; lastMove = performance.now(); ensure(); e.preventDefault();
      }
    };
    const onMove = (e: MouseEvent) => {
      if (!dragging) return;
      const r = canvas.getBoundingClientRect();
      dragY = clamp(e.clientY - r.top, jawTop + 14, H - 4);
      lastMove = performance.now(); ensure();
    };
    const onUp = () => {
      if (!dragging) return;
      dragging = false;
      // snap to nearest card edge
      if (snapEdges.length) {
        let best = dragY, bd = Infinity;
        for (const e of snapEdges) { const d = Math.abs(e - dragY); if (d < bd) { bd = d; best = e; } }
        dragY = best;
      }
      ensure();
    };

    let raf = 0, visible = false, docVisible = !document.hidden, visibleSince = 0;

    const render = () => {
      const now = performance.now();
      const active = activeRef.current;
      const m = measure();
      const yA = m ? m.yA : PADY;
      const yB = m ? m.yB : H - PADY;
      snapEdges = m ? [...m.tops, ...m.bots].filter((v): v is number => v != null) : [];

      // targets
      let topT: number, botT: number;
      if (dragging) {
        topT = yA; botT = dragY;
      } else if (active != null && m && m.tops[active] != null && m.bots[active] != null) {
        topT = (m.tops[active] as number) + 5;
        botT = (m.bots[active] as number) - 5;
      } else {
        topT = yA; botT = yB; // idle: span the whole list (static)
      }

      if (!inited) { jawTop = topT; jawBot = botT; inited = true; }
      jawTop += (topT - jawTop) * (dragging ? 1 : 0.2);
      jawBot += (botT - jawBot) * (dragging ? 1 : 0.2);

      ctx.clearRect(0, 0, W, H);
      ctx.lineCap = "butt";
      ctx.lineJoin = "miter";

      // ── beam + graduated scale (spans the card range) ───────────────────
      ctx.strokeStyle = `rgba(${ink},0.5)`;
      ctx.lineWidth = 1;
      ctx.beginPath(); ctx.moveTo(beamX, yA); ctx.lineTo(beamX, yB); ctx.stroke();
      ctx.fillStyle = `rgba(${ink},0.38)`;
      ctx.font = `400 8px ui-monospace, SFMono-Regular, Menlo, monospace`;
      ctx.textBaseline = "middle";
      let k = 0;
      for (let y = yA; y <= yB + 0.5; y += 12, k++) {
        const major = k % 4 === 0;
        ctx.strokeStyle = major ? `rgba(${ink},0.42)` : `rgba(${ink},0.22)`;
        ctx.beginPath();
        ctx.moveTo(beamX, Math.round(y) + 0.5);
        ctx.lineTo(beamX + (major ? 10 : 5), Math.round(y) + 0.5);
        ctx.stroke();
        if (major) ctx.fillText(String(Math.round(y - yA)).padStart(3, "0"), beamX + 14, y);
      }

      // ── sliding frame + jaws ────────────────────────────────────────────
      ctx.strokeStyle = `rgba(${ink},0.85)`;
      ctx.lineWidth = LINE_W;
      ctx.beginPath(); ctx.moveTo(beamX - 4, jawTop); ctx.lineTo(beamX - 4, jawBot); ctx.stroke();

      const hot = active != null || dragging;
      const drawJaw = (y: number) => {
        ctx.strokeStyle = hot ? `rgba(${ink},1)` : `rgba(${ink},0.85)`;
        ctx.lineWidth = LINE_W;
        ctx.beginPath(); ctx.moveTo(beamX - 4, y); ctx.lineTo(tipX, y); ctx.stroke();
        ctx.beginPath(); ctx.moveTo(tipX, y - 7); ctx.lineTo(tipX, y + 7); ctx.stroke();
        ctx.strokeStyle = `rgba(${ink},0.5)`; ctx.lineWidth = 1;
        ctx.beginPath(); ctx.moveTo(tipX - 4, y); ctx.lineTo(tipX + 4, y); ctx.stroke();
      };
      drawJaw(jawTop);
      drawJaw(jawBot);

      // measured-span line between jaw tips
      ctx.strokeStyle = `rgba(${ink},${hot ? 0.5 : 0.22})`;
      ctx.lineWidth = 1;
      ctx.setLineDash([2, 3]);
      ctx.beginPath(); ctx.moveTo(tipX, jawTop); ctx.lineTo(tipX, jawBot); ctx.stroke();
      ctx.setLineDash([]);

      // ── readout chip (centered on the span, brutalist offset shadow) ────
      const span = Math.round(jawBot - jawTop);
      const chipW = 96, chipH = 40;
      const chipX = clamp(tipX + 6, 6, W - chipW - 10);
      const chipY = clamp((jawTop + jawBot) / 2 - chipH / 2, 6, H - chipH - 6);
      ctx.fillStyle = `rgb(${ink})`; ctx.fillRect(chipX + 6, chipY + 6, chipW, chipH);
      ctx.fillStyle = `rgb(${panel})`; ctx.fillRect(chipX, chipY, chipW, chipH);
      ctx.strokeStyle = `rgb(${ink})`; ctx.lineWidth = 1;
      ctx.strokeRect(chipX + 0.5, chipY + 0.5, chipW, chipH);
      ctx.fillStyle = `rgb(${ink})`; ctx.textBaseline = "alphabetic";
      ctx.font = `700 13px ui-monospace, SFMono-Regular, Menlo, monospace`;
      ctx.fillText(`Δ ${String(span).padStart(3, "0")} u`, chipX + 9, chipY + 20);
      ctx.font = `400 9px ui-monospace, SFMono-Regular, Menlo, monospace`;
      ctx.fillStyle = `rgba(${ink},0.6)`;
      const tag = dragging
        ? "DRAG"
        : active != null
        ? `Q.${String(active + 1).padStart(2, "0")} / ${String(count).padStart(2, "0")}`
        : `Σ ${count} ITEMS`;
      ctx.fillText(tag, chipX + 9, chipY + 33);

      const settling = Math.abs(jawTop - topT) > 0.3 || Math.abs(jawBot - botT) > 0.3;
      // Track card positions while they animate in (Reveal) or just after becoming
      // visible; then rest. Resizes re-measure via onResize.
      const inGrace = !reduce && visibleSince > 0 && now - visibleSince < 1600;
      const animating = dragging || settling || (canInteract && now - lastMove < 500) || inGrace;
      if (animating && docVisible) raf = requestAnimationFrame(render);
      else raf = 0;
    };
    const ensure = () => { if (!raf) raf = requestAnimationFrame(render); };
    kickRef.current = ensure;

    let booted = false;
    const boot = () => {
      if (!size()) { setTimeout(boot, 120); return; }
      booted = true;
      const io = new IntersectionObserver(
        (entries) => {
          for (const e of entries) {
            visible = e.isIntersecting;
            if (e.isIntersecting) { visibleSince = performance.now(); ensure(); }
          }
        },
        { threshold: 0.02 }
      );
      io.observe(canvas);
      ioRef = io;
      render(); // synchronous first paint (full-span resting gauge)
    };
    let ioRef: IntersectionObserver | null = null;
    boot();

    const onResize = () => { if (!booted) return; size(); inited = false; render(); };
    const onVis = () => { docVisible = !document.hidden; if (docVisible) ensure(); };

    const ro = new ResizeObserver(onResize);
    ro.observe(wrap);
    window.addEventListener("resize", onResize);
    document.addEventListener("visibilitychange", onVis);
    if (canInteract) {
      canvas.addEventListener("mousedown", onDown);
      window.addEventListener("mousemove", onMove, { passive: true });
      window.addEventListener("mouseup", onUp);
    }

    return () => {
      if (raf) cancelAnimationFrame(raf);
      kickRef.current = null;
      ro.disconnect();
      ioRef?.disconnect();
      window.removeEventListener("resize", onResize);
      document.removeEventListener("visibilitychange", onVis);
      if (canInteract) {
        canvas.removeEventListener("mousedown", onDown);
        window.removeEventListener("mousemove", onMove);
        window.removeEventListener("mouseup", onUp);
      }
    };
  }, [count, itemsRef, ink, panel]);

  // Kick the (otherwise idle) render loop whenever the hovered card changes.
  useEffect(() => { kickRef.current?.(); }, [activeIndex]);

  return (
    <div ref={wrapRef} style={{ position: "absolute", inset: 0 }}>
      <canvas ref={canvasRef} aria-hidden style={{ width: "100%", height: "100%", display: "block" }} />
    </div>
  );
}
