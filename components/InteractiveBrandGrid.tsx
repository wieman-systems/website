"use client";

import { useEffect, useRef } from "react";

interface ClearRect {
  x0: number;
  x1: number;
  y0: number;
  y1: number;
}

interface ClearTarget {
  ref: React.RefObject<HTMLElement | null>;
  padX?: number;
  padTop?: number;
  padBottom?: number;
}

interface InteractiveBrandGridProps {
  color?: string;
  height?: string;
  opacity?: number;
  anchor?: "bottom" | "top";
  unit?: number;
  offsetX?: number;
  fragRate?: number;
  fade?: boolean;
  rightBias?: number;
  edgeBias?: number;
  clearRects?: ClearRect[] | null;
  clearTargets?: (React.RefObject<HTMLElement | null> | ClearTarget)[] | null;
  style?: React.CSSProperties;
  /** Cursor reactivity: block repulsion + glowing intersection nodes. */
  interactive?: boolean;
  /** Animate the grid drawing itself in when it first enters the viewport. */
  drawIn?: boolean;
}

// kind: 0 = skyline trunk, 1 = horizontal connector, 2 = floating fragment
interface Seg {
  x: number;
  y: number;
  w: number;
  h: number;
  cx: number;
  cy: number;
  bottomY: number;
  kind: 0 | 1 | 2;
  appear: number;
}

const LINE_W = 1.5;
const DRAW_MS = 1500;
const easeOut = (t: number) => 1 - Math.pow(1 - t, 3);
const smoothstep = (e0: number, e1: number, x: number) => {
  const t = Math.min(1, Math.max(0, (x - e0) / (e1 - e0)));
  return t * t * (3 - 2 * t);
};

// ── Living-grid tuning ──────────────────────────────────────────────────
// Instead of nudging each line on its own, the whole grid flows through one
// continuous warp field, so it stretches like a single elastic sheet and
// swells (grows) toward whatever is deforming it. Dial these toward the
// "noticeable" values in the comments when we want more presence.
const CURSOR_RADIUS = 175; // cursor influence radius (css px)
const GROW_CURSOR = 0.18; // magnification under the cursor (~0.32 = noticeable)
const CURSOR_THROB = 0.1; // gentle breathing of the cursor bulge
const AMB_COUNT = 2; // roaming swells drifting under the surface
const AMB_RADIUS = 230; // roaming-swell influence radius (css px)
const AMB_AMP = 0.06; // roaming-swell magnification (~0.1 = noticeable)
const ANCHOR_PIN = 22; // px above the baseline kept rooted to the floor
const SUBDIV_STEP = 9; // px between warp samples along a line
const MAX_SUBDIV = 80; // max samples per line (perf guard)

export default function InteractiveBrandGrid({
  color = "#fff",
  height = "70%",
  opacity = 0.5,
  anchor = "bottom",
  unit: unitProp = 13,
  offsetX = 0,
  fragRate = 0.04,
  fade = false,
  rightBias = 0,
  edgeBias = 0,
  clearRects = null,
  clearTargets = null,
  style,
  interactive = true,
  drawIn = true,
}: InteractiveBrandGridProps) {
  const ref = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = ref.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d")!;

    const reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    const fine = window.matchMedia("(hover: hover) and (pointer: fine)").matches;
    const canInteract = interactive && fine && !reduce;

    const seededRand = (x: number, y: number) => {
      const n = Math.sin(x * 127.1 + y * 311.7) * 43758.5453;
      return n - Math.floor(n);
    };

    let W = 0;
    let H = 0;
    let segments: Seg[] = [];

    // ── Geometry: identical generation to the static grid, collected as segments
    function build() {
      W = canvas!.offsetWidth;
      H = canvas!.offsetHeight;
      if (!W || !H) return false;
      canvas!.width = W * devicePixelRatio;
      canvas!.height = H * devicePixelRatio;
      ctx.setTransform(devicePixelRatio, 0, 0, devicePixelRatio, 0, 0);

      const unit = unitProp;
      const cols = Math.ceil(W / unit) + 2;
      const rows = Math.ceil(H / unit) + 2;
      const colX = (c: number) => c * unit + offsetX;
      const segs: Seg[] = [];
      const growthTop: number[] = [];

      for (let c = 0; c <= cols; c++) {
        const wave =
          (Math.sin(c * 0.55) +
            Math.sin(c * 1.27 + 1.7) +
            Math.sin(c * 0.23 + 4.1)) /
          3;
        let v = 0.5 + 0.5 * wave;
        v = v * 0.68 + seededRand(c, 7) * 0.32;
        let base = 0.4 + 0.42 * v;
        if (rightBias) {
          const fr = Math.max(0, (c / cols - 0.82) / 0.18);
          base = 0.74 + 0.14 * v - rightBias * fr * 0.92;
          base = Math.max(0.04, base);
        } else if (edgeBias) {
          const d = Math.abs(c / cols - 0.5) * 2;
          const fr = Math.max(0, (d - 0.52) / 0.48);
          base = 0.78 + 0.12 * v - edgeBias * fr * 0.94;
          base = Math.max(0.04, base);
        }
        growthTop[c] = H * base;
      }

      // Skyline trunks — drawn in by growing upward from the baseline.
      for (let c = 0; c <= cols; c++) {
        const x = colX(c);
        let top = growthTop[c];
        if (seededRand(c, 21) > 0.78) top += unit;
        const appear = Math.min(0.45, 0.04 + (c / cols) * 0.22 + seededRand(c, 99) * 0.05);
        segs.push({
          x: x - LINE_W / 2,
          y: top,
          w: LINE_W,
          h: H - top,
          cx: x,
          cy: (top + H) / 2,
          bottomY: H,
          kind: 0,
          appear,
        });
      }

      // Horizontal connectors.
      for (let row = 0; row < rows; row++) {
        const y = row * unit + unit / 2;
        const ny = y / H;
        const pConnect = Math.min(1, Math.pow(ny, 0.85) * 1.2);
        for (let c = 0; c < cols; c++) {
          if (y >= growthTop[c] && y >= growthTop[c + 1]) {
            if (seededRand(c * 3 + 1, row * 5 + 2) < pConnect) {
              segs.push({
                x: colX(c) - LINE_W / 2,
                y: y - LINE_W / 2,
                w: unit + LINE_W,
                h: LINE_W,
                cx: colX(c) + unit / 2,
                cy: y,
                bottomY: H,
                kind: 1,
                appear: 0.18 + (1 - ny) * 0.28 + seededRand(c + row, row) * 0.08,
              });
            }
          }
        }
      }

      const FRAGS = [
        ["u", "l", "r"], ["d", "l", "r"], ["u", "d", "l"], ["u", "d", "r"],
        ["u", "r"], ["u", "l"], ["d", "r"], ["d", "l"],
        ["l", "r"], ["l", "r"], ["u", "d"], ["r"], ["l"], ["u"], ["d"],
      ];

      const pushFrag = (x: number, y: number, w: number, h: number) => {
        segs.push({
          x, y, w, h,
          cx: x + w / 2,
          cy: y + h / 2,
          bottomY: H,
          kind: 2,
          appear: 0.42 + seededRand(x, y) * 0.42,
        });
      };

      const drawFrag = (cx: number, cy: number, dirs: string[], len: number) => {
        for (const d of dirs) {
          if (d === "u") pushFrag(cx - LINE_W / 2, cy - len, LINE_W, len);
          if (d === "d") pushFrag(cx - LINE_W / 2, cy, LINE_W, len);
          if (d === "l") pushFrag(cx - len, cy - LINE_W / 2, len, LINE_W);
          if (d === "r") pushFrag(cx, cy - LINE_W / 2, len, LINE_W);
        }
      };

      const rowsAll = Math.ceil(H / unit) + 2;
      for (let c = 2; c < cols - 3; c++) {
        for (let r = 0; r < rowsAll; r++) {
          if (seededRand(c * 7.3 + 3, r * 11.1 + 5) > fragRate) continue;
          const cx = colX(c);
          const cy = r * unit + unit / 2;
          const isCluster = seededRand(c + 31, r + 17) > 0.74;
          const pw = isCluster ? 2 + Math.floor(seededRand(c + 5, r + 5) * 2) : 0;
          const ph = isCluster ? 2 + Math.floor(seededRand(c + 8, r + 8) * 2) : 0;
          let localTop = Infinity;
          for (let cc = c - 1; cc <= c + pw + 1; cc++)
            localTop = Math.min(localTop, growthTop[cc] ?? H);
          if (cy > localTop - unit * 1.6) continue;
          if (cy < unit * 0.9) continue;
          if (isCluster) {
            if (cy - ph * unit < unit * 0.5) continue;
            const ccx = pw / 2;
            const ccy = ph / 2;
            const maxd = Math.hypot(ccx, ccy) || 1;
            const yAt = (gy: number) => cy - (ph - gy) * unit;
            const keep = (gx: number, gy: number, salt: number) => {
              const d = Math.hypot(gx - ccx, gy - ccy) / maxd;
              return (
                seededRand(c * 13 + gx * 3 + salt, r * 17 + gy * 5 + salt) <
                1 - d * 0.85
              );
            };
            for (let gy = 0; gy <= ph; gy++)
              for (let gx = 0; gx < pw; gx++)
                if (keep(gx + 0.5, gy, 1))
                  pushFrag(colX(c + gx) - LINE_W / 2, yAt(gy) - LINE_W / 2, unit + LINE_W, LINE_W);
            for (let gx = 0; gx <= pw; gx++)
              for (let gy = 0; gy < ph; gy++)
                if (keep(gx, gy + 0.5, 2))
                  pushFrag(colX(c + gx) - LINE_W / 2, yAt(gy) - LINE_W / 2, LINE_W, unit + LINE_W);
            continue;
          }
          const frag = FRAGS[Math.floor(seededRand(c * 2.7, r * 3.1) * FRAGS.length)];
          const len = unit * (0.7 + seededRand(c, r) * 0.6);
          drawFrag(cx, cy, frag, len);
        }
      }

      segments = segs;
      return true;
    }

    // ── Text-protection clears (re-evaluated each frame so copy stays legible)
    const raggedClear = (x0: number, y0: number, x1: number, y1: number, mp: number) => {
      const unit = unitProp;
      const band = unit * 2.4;
      const c0 = Math.floor((x0 - band - offsetX) / unit);
      const c1 = Math.ceil((x1 + band - offsetX) / unit);
      const r0 = Math.floor((y0 - band) / unit);
      const r1 = Math.ceil((y1 + band) / unit);
      for (let c = c0; c <= c1; c++) {
        for (let rr = r0; rr <= r1; rr++) {
          const cellx = c * unit + offsetX;
          const celly = rr * unit;
          const ccx = cellx + unit / 2;
          const ccy = celly + unit / 2;
          const dx = Math.max(x0 - ccx, 0, ccx - x1);
          const dy = Math.max(y0 - ccy, 0, ccy - y1);
          const dist = Math.hypot(dx, dy);
          let clr: boolean;
          if (dist <= mp) clr = true;
          else {
            const prob = 1 - (dist - mp) / band;
            clr = prob > 0 && seededRand(c * 1.3 + 7, rr * 2.1 + 5) < prob;
          }
          if (clr)
            ctx.clearRect(cellx - LINE_W, celly - LINE_W, unit + LINE_W * 2, unit + LINE_W * 2);
        }
      }
    };

    const applyClears = () => {
      if (clearRects)
        for (const cr of clearRects)
          raggedClear(W * cr.x0, H * cr.y0, W * cr.x1, H * cr.y1, 20);
      if (clearTargets) {
        const cb = canvas!.getBoundingClientRect();
        for (const tg of clearTargets) {
          const isCT = tg && "ref" in tg;
          const refObj = isCT
            ? (tg as ClearTarget).ref
            : (tg as React.RefObject<HTMLElement | null>);
          const el = refObj?.current;
          if (!el) continue;
          const r = el.getBoundingClientRect();
          if (!r.width) continue;
          const px = isCT ? (tg as ClearTarget).padX ?? 0 : 0;
          const pt = isCT ? (tg as ClearTarget).padTop ?? 0 : 0;
          const pb = isCT ? (tg as ClearTarget).padBottom ?? 0 : 0;
          const x0 = r.left - cb.left;
          const y0 = r.top - cb.top;
          raggedClear(x0 - px, y0 - pt, x0 + r.width + px, y0 + r.height + pb, 17);
        }
      }
    };

    // ── Pointer state (smoothed)
    const target = { x: -9999, y: -9999, active: false };
    const cur = { x: -9999, y: -9999 };
    let lastMove = 0;

    const onMove = (e: MouseEvent) => {
      const r = canvas!.getBoundingClientRect();
      const mx = e.clientX - r.left;
      const my = e.clientY - r.top;
      const inside =
        mx > -CURSOR_RADIUS &&
        mx < W + CURSOR_RADIUS &&
        my > -CURSOR_RADIUS &&
        my < H + CURSOR_RADIUS;
      target.active = inside;
      if (inside) {
        target.x = mx;
        target.y = my;
        if (cur.x < -9000) {
          // first engagement — snap so influence doesn't sweep in from a corner
          cur.x = mx;
          cur.y = my;
        }
        lastMove = performance.now();
        ensureRunning();
      }
    };
    const onLeave = () => {
      target.active = false;
    };

    // ── Living-grid state: roaming swells feeding one continuous warp field
    const ambientOn = !reduce;
    let visible = false;
    let docVisible = !document.hidden;
    let lastFrame = 0;
    let cursorAmt = 0; // eased cursor strength so the bulge fades in/out
    let io: IntersectionObserver | null = null;

    // Slow Lissajous drifters that wander under the surface ("alive").
    const AMB = Array.from({ length: AMB_COUNT }, () => ({
      ax: 0.36 + Math.random() * 0.1,
      ay: 0.3 + Math.random() * 0.12,
      sx: 0.00018 + Math.random() * 0.00016, // rad/ms → ~25–60s drift
      sy: 0.00016 + Math.random() * 0.00016,
      px: Math.random() * Math.PI * 2,
      py: Math.random() * Math.PI * 2,
      tw: 0.0011 + Math.random() * 0.0009, // swell breathing rate
      tp: Math.random() * Math.PI * 2,
    }));

    type Deformer = { x: number; y: number; r: number; amp: number };
    let deformers: Deformer[] = [];

    // Sum of radial magnifications. Pinned to the baseline so the skyline
    // stays rooted to the floor while everything above stretches as one sheet.
    const warp = (x: number, y: number): [number, number] => {
      if (deformers.length === 0) return [x, y];
      const pin = smoothstep(0, ANCHOR_PIN, H - y);
      if (pin <= 0) return [x, y];
      let wx = x;
      let wy = y;
      for (let i = 0; i < deformers.length; i++) {
        const d = deformers[i];
        const vx = x - d.x;
        const vy = y - d.y;
        const dist = Math.sqrt(vx * vx + vy * vy);
        if (dist >= d.r) continue;
        const f = 1 - (dist / d.r) ** 2;
        const sc = d.amp * f * f * pin;
        wx += vx * sc;
        wy += vy * sc;
      }
      return [wx, wy];
    };

    // Cheap circle-vs-segment-bounds test to skip lines outside the field.
    const influenced = (ax: number, ay: number, bx: number, by: number) => {
      const minx = Math.min(ax, bx);
      const maxx = Math.max(ax, bx);
      const miny = Math.min(ay, by);
      const maxy = Math.max(ay, by);
      for (let i = 0; i < deformers.length; i++) {
        const d = deformers[i];
        const nx = d.x < minx ? minx : d.x > maxx ? maxx : d.x;
        const ny = d.y < miny ? miny : d.y > maxy ? maxy : d.y;
        const dx = d.x - nx;
        const dy = d.y - ny;
        if (dx * dx + dy * dy < d.r * d.r) return true;
      }
      return false;
    };

    // Centerline endpoints of a segment, so a warped stroke lines up exactly
    // with the unwarped fillRects at the edge of the field (no seam).
    const segEnds = (s: Seg): [number, number, number, number] => {
      if (s.kind === 0) {
        const cx = s.x + LINE_W / 2;
        return [cx, s.y, cx, s.bottomY];
      }
      if (s.w >= s.h) {
        const cy = s.y + s.h / 2;
        return [s.x, cy, s.x + s.w, cy];
      }
      const cx = s.x + s.w / 2;
      return [cx, s.y, cx, s.y + s.h];
    };

    const addWarped = (ax: number, ay: number, bx: number, by: number) => {
      const len = Math.hypot(bx - ax, by - ay);
      const n = Math.min(MAX_SUBDIV, Math.max(2, Math.ceil(len / SUBDIV_STEP)));
      for (let i = 0; i <= n; i++) {
        const u = i / n;
        const [wx, wy] = warp(ax + (bx - ax) * u, ay + (by - ay) * u);
        if (i === 0) ctx.moveTo(wx, wy);
        else ctx.lineTo(wx, wy);
      }
    };

    // ── Render
    let revealStart = reduce || !drawIn ? -1 : 0; // -1 => fully settled
    const render = () => {
      const now = performance.now();
      let P = 1;
      if (revealStart > 0) P = Math.min(1, (now - revealStart) / DRAW_MS);
      else if (revealStart === 0) P = 0; // armed but not yet started

      const armed = revealStart === 0;
      const playingIn = revealStart > 0 && P < 1;
      const pointerOn = canInteract && target.active;
      const recentlyMoved = canInteract && now - lastMove < 600;
      const ambientActive = ambientOn && visible && docVisible;
      const highRate =
        pointerOn || playingIn || recentlyMoved || cursorAmt > 0.002;

      // Ambient-only frames run at ~30fps to spare battery; cursor reactions
      // and the draw-in get full frame rate.
      if (!highRate && ambientActive && now - lastFrame < 32) {
        raf = requestAnimationFrame(render);
        return;
      }
      lastFrame = now;

      ctx.clearRect(0, 0, W, H);
      ctx.fillStyle = color;

      if (armed) {
        // Off-screen, nothing has drawn in yet.
        raf = 0;
        return;
      }

      // ── Draw-in: clean assembly, warp held back until it settles ────────
      if (playingIn) {
        for (const s of segments) {
          const win = s.kind === 0 ? 0.45 : 0.32;
          const lp = easeOut(Math.min(1, Math.max(0, (P - s.appear) / win)));
          if (lp <= 0) continue;
          if (s.kind === 0) {
            ctx.globalAlpha = Math.min(1, lp * 1.6);
            ctx.fillRect(s.x, s.bottomY - s.h * lp, s.w, s.h * lp);
          } else {
            ctx.globalAlpha = lp;
            ctx.fillRect(s.x, s.y, s.w, s.h);
          }
        }
        ctx.globalAlpha = 1;
        applyClears();
        raf = requestAnimationFrame(render);
        return;
      }

      // ── Settled: build the deformer field (cursor + roaming swells) ─────
      if (pointerOn) {
        cur.x += (target.x - cur.x) * 0.18;
        cur.y += (target.y - cur.y) * 0.18;
      }
      cursorAmt += ((pointerOn ? 1 : 0) - cursorAmt) * 0.12;

      deformers = [];
      if (cursorAmt > 0.002) {
        const throb = 1 + CURSOR_THROB * Math.sin(now * 0.004);
        deformers.push({
          x: cur.x,
          y: cur.y,
          r: CURSOR_RADIUS,
          amp: GROW_CURSOR * throb * cursorAmt,
        });
      }
      if (ambientOn) {
        for (let i = 0; i < AMB_COUNT; i++) {
          const a = AMB[i];
          deformers.push({
            x: W * (0.5 + a.ax * Math.sin(now * a.sx + a.px)),
            y: H * (0.5 + a.ay * Math.sin(now * a.sy + a.py)),
            r: AMB_RADIUS,
            amp: AMB_AMP * (0.6 + 0.4 * Math.sin(now * a.tw + a.tp)),
          });
        }
      }

      // Lines outside the field paint as cheap rects; influenced lines bend
      // through it as subdivided polylines, so the grid stretches as one piece.
      ctx.globalAlpha = 1;
      ctx.beginPath();
      for (const s of segments) {
        const [ax, ay, bx, by] = segEnds(s);
        if (deformers.length && influenced(ax, ay, bx, by)) {
          addWarped(ax, ay, bx, by);
        } else {
          ctx.fillRect(s.x, s.y, s.w, s.h);
        }
      }
      ctx.strokeStyle = color;
      ctx.lineWidth = LINE_W;
      ctx.lineJoin = "round";
      ctx.lineCap = "round";
      ctx.stroke();

      applyClears();

      const settling =
        pointerOn &&
        (Math.abs(target.x - cur.x) > 0.4 || Math.abs(target.y - cur.y) > 0.4);
      if (
        pointerOn ||
        settling ||
        recentlyMoved ||
        ambientActive ||
        cursorAmt > 0.002
      ) {
        raf = requestAnimationFrame(render);
      } else {
        raf = 0;
      }
    };

    let raf = 0;
    const ensureRunning = () => {
      if (!raf) raf = requestAnimationFrame(render);
    };

    // ── Boot: build geometry (retry until it has a measurable size), then arm
    let booted = false;
    const boot = () => {
      if (!build()) {
        setTimeout(boot, 120);
        return;
      }
      booted = true;
      // Track on-screen state to drive the roaming swells, and arm the
      // draw-in the first time the grid scrolls into view.
      io = new IntersectionObserver(
        (entries) => {
          for (const e of entries) {
            visible = e.isIntersecting;
            if (e.isIntersecting) {
              if (revealStart === 0) revealStart = performance.now();
              ensureRunning();
            }
          }
        },
        { threshold: 0.06 }
      );
      io.observe(canvas);
      render(); // paint current state immediately
    };
    boot();

    const onResize = () => {
      if (!booted) return;
      build();
      render();
    };

    const onVis = () => {
      docVisible = !document.hidden;
      if (docVisible) ensureRunning();
    };

    const ro = new ResizeObserver(onResize);
    ro.observe(canvas);
    window.addEventListener("resize", onResize);
    if (canInteract) window.addEventListener("mousemove", onMove, { passive: true });
    document.addEventListener("mouseleave", onLeave);
    document.addEventListener("visibilitychange", onVis);

    return () => {
      if (raf) cancelAnimationFrame(raf);
      ro.disconnect();
      io?.disconnect();
      window.removeEventListener("resize", onResize);
      if (canInteract) window.removeEventListener("mousemove", onMove);
      document.removeEventListener("mouseleave", onLeave);
      document.removeEventListener("visibilitychange", onVis);
    };
  }, [
    color,
    unitProp,
    offsetX,
    fragRate,
    rightBias,
    edgeBias,
    interactive,
    drawIn,
    clearRects,
    clearTargets,
  ]);

  const pos =
    anchor === "top" ? { top: 0, transform: "scaleY(-1)" } : { bottom: 0 };
  const maskCss = fade
    ? "linear-gradient(to top, #000 18%, rgba(0,0,0,0.85) 45%, transparent 100%)"
    : undefined;

  return (
    <canvas
      ref={ref}
      aria-hidden
      style={{
        position: "absolute",
        left: 0,
        ...pos,
        width: "100%",
        height,
        pointerEvents: "none",
        opacity,
        maskImage: maskCss,
        WebkitMaskImage: maskCss,
        ...style,
      }}
    />
  );
}
