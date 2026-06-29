"use client";

import { useEffect, useRef } from "react";
import { useThemeInk } from "./ThemeProvider";

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
  /** Guaranteed-clear margin around the box (px). Lower = grid sits closer. */
  mp?: number;
}

interface InteractiveBrandGridProps {
  /** Which surface this grid sits on — picks the ink that flips with the theme. */
  tone?: "primary" | "inverse";
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
// The existing lines never move and never fade. Instead, solid-black lattice
// (extra lines + whole squares) grows in on the grid's own lattice to "meet"
// the cursor, then recedes from the outside in when it leaves. It's drawn as a
// level set: an eased field over the lattice, solid wherever it's >= THRESH,
// with the frontier edges clipped to the crossing so they draw in by length.
const REVEAL_RADIUS = 90; // base reach of the bloom around the cursor (css px)
const REVEAL_CORE = 0.2; // inner fraction at full strength (rest eases out)
const REVEAL_THRESH = 0.4; // level-set cutoff — at/above this the grid is solid
const RISE = 0.24; // grow-in speed — reaching out to meet you
const FALL = 0.06; // suck-back speed — slower, recedes from the outside in
const WOBBLE = 0.34; // low-frequency shape distortion — higher = less circular
const SPIKE = 0.46; // per-node rim roughness — higher = spikier / more fragmented
const CURSOR_THROB = 0.1; // gentle breathing of the bloom size
const AMB_COUNT = 2; // idle blooms that drift when there's no cursor
const AMB_RADIUS = 96; // idle-bloom reach (css px)
const AMB_AMP = 0.66; // idle-bloom strength (set 0 to disable idle life)
const EDGE_SHIMMER = 24; // px the skyline top edge grows/recedes as it shimmers
// When the cursor nears an existing gridline, a thin grid-aligned strand draws
// in to connect them. The lines themselves never move.
const CONNECT_DIST = 160; // cursor-to-line distance at which a strand forms (px)

export default function InteractiveBrandGrid({
  tone = "primary",
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
  const drawColor = `rgb(${useThemeInk(tone)})`;

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
          const mp = isCT ? (tg as ClearTarget).mp ?? 17 : 17;
          const x0 = r.left - cb.left;
          const y0 = r.top - cb.top;
          raggedClear(x0 - px, y0 - pt, x0 + r.width + px, y0 + r.height + pb, mp);
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
        mx > -REVEAL_RADIUS &&
        mx < W + REVEAL_RADIUS &&
        my > -REVEAL_RADIUS &&
        my < H + REVEAL_RADIUS;
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

    // ── Living grid: a bloom that grows fresh lattice to meet the cursor ──
    const ambientOn = !reduce;
    let visible = false;
    let docVisible = !document.hidden;
    let lastFrame = 0;
    let cursorAmt = 0; // eased cursor strength so the bloom fades in/out
    let io: IntersectionObserver | null = null;

    // Slow Lissajous drifters: idle blooms that wander when there's no cursor.
    const AMB = Array.from({ length: AMB_COUNT }, () => ({
      ax: 0.36 + Math.random() * 0.1,
      ay: 0.3 + Math.random() * 0.12,
      sx: 0.00018 + Math.random() * 0.00016, // rad/ms → ~25–60s drift
      sy: 0.00016 + Math.random() * 0.00016,
      px: Math.random() * Math.PI * 2,
      py: Math.random() * Math.PI * 2,
      tw: 0.0011 + Math.random() * 0.0009, // breathing rate
      tp: Math.random() * Math.PI * 2,
      seed: Math.random() * 100, // distinct organic shape per bloom
    }));

    // Lattice helpers (same lattice the base grid is built on).
    const colX = (c: number) => c * unitProp + offsetX;
    const yRow = (r: number) => r * unitProp + unitProp / 2;

    // Field of the lattice NODES: g eases toward a target reveal, the grid is
    // solid wherever g >= REVEAL_THRESH, and the frontier edges are clipped to
    // the crossing. grow holds the eased field; tgt is rebuilt each frame.
    const grow = new Map<string, number>();
    const tgt = new Map<string, number>();
    let wobT = 0; // shared time phase for the organic edge

    const bump = (key: string, t: number) => {
      const prev = tgt.get(key);
      if (prev === undefined || t > prev) tgt.set(key, t);
    };

    const hash = (a: number, b: number) => {
      const n = Math.sin(a * 127.1 + b * 311.7) * 43758.5453;
      return n - Math.floor(n);
    };
    // Per-node value noise that drifts slowly in time, so spikes morph instead
    // of strobing.
    const nodeNoise = (a: number, b: number, t: number) => {
      const ti = Math.floor(t);
      const f = t - ti;
      const s = f * f * (3 - 2 * f);
      const h0 = hash(a + ti * 0.37, b - ti * 0.53);
      const h1 = hash(a + (ti + 1) * 0.37, b - (ti + 1) * 0.53);
      return h0 + (h1 - h0) * s;
    };

    // Reveal at a lattice node. A mild angular wobble sets the overall shape;
    // strong per-node noise on the rim radius shreds the edge into spikes and
    // fragments. The inner core radius is fixed, so the centre stays solid.
    const reveal = (
      c: number,
      r: number,
      sx: number,
      sy: number,
      radius: number,
      seed: number
    ) => {
      const dx = colX(c) - sx;
      const dy = yRow(r) - sy;
      const d = Math.hypot(dx, dy);
      if (d >= radius * 2) return 0;
      const ang = Math.atan2(dy, dx);
      const wob =
        1 +
        WOBBLE *
          (0.6 * Math.sin(2 * ang + wobT * 0.9 + seed) +
            0.4 * Math.sin(3 * ang - wobT * 0.7 + seed * 1.7));
      const spike = 1 + SPIKE * (2 * nodeNoise(c + seed, r - seed, wobT * 0.7) - 1);
      const rr = radius * wob * spike;
      return d >= rr ? 0 : smoothstep(rr, radius * REVEAL_CORE, d);
    };

    const addBloom = (
      sx: number,
      sy: number,
      r: number,
      amp: number,
      seed: number
    ) => {
      const maxR = r * 2;
      const c0 = Math.floor((sx - maxR - offsetX) / unitProp);
      const c1 = Math.ceil((sx + maxR - offsetX) / unitProp);
      const r0 = Math.floor((sy - maxR) / unitProp) - 1;
      const r1 = Math.ceil((sy + maxR) / unitProp) + 1;
      for (let c = c0; c <= c1; c++) {
        for (let rr = r0; rr <= r1; rr++) {
          const t = amp * reveal(c, rr, sx, sy, r, seed);
          if (t > 0.002) bump(`${c},${rr}`, t);
        }
      }
    };

    const gAt = (c: number, r: number) => grow.get(`${c},${r}`) ?? 0;

    // Draw the horizontal edge (c,r)→(c+1,r), solid, clipped to the part of it
    // that sits inside the level set (no fade, frontier draws/recedes by length).
    const drawEdgeH = (c: number, r: number) => {
      const g0 = gAt(c, r);
      const g1 = gAt(c + 1, r);
      const a0 = g0 >= REVEAL_THRESH;
      const a1 = g1 >= REVEAL_THRESH;
      if (!a0 && !a1) return;
      const xn = colX(c);
      const y = yRow(r);
      let x0 = xn;
      let x1 = xn + unitProp;
      if (a0 && !a1) x1 = xn + unitProp * ((g0 - REVEAL_THRESH) / (g0 - g1));
      else if (!a0 && a1)
        x0 = xn + unitProp - unitProp * ((g1 - REVEAL_THRESH) / (g1 - g0));
      ctx.fillRect(x0 - LINE_W / 2, y - LINE_W / 2, x1 - x0 + LINE_W, LINE_W);
    };

    const drawEdgeV = (c: number, r: number) => {
      const g0 = gAt(c, r);
      const g1 = gAt(c, r + 1);
      const a0 = g0 >= REVEAL_THRESH;
      const a1 = g1 >= REVEAL_THRESH;
      if (!a0 && !a1) return;
      const x = colX(c);
      const yn = yRow(r);
      let y0 = yn;
      let y1 = yn + unitProp;
      if (a0 && !a1) y1 = yn + unitProp * ((g0 - REVEAL_THRESH) / (g0 - g1));
      else if (!a0 && a1)
        y0 = yn + unitProp - unitProp * ((g1 - REVEAL_THRESH) / (g1 - g0));
      ctx.fillRect(x - LINE_W / 2, y0 - LINE_W / 2, LINE_W, y1 - y0 + LINE_W);
    };

    // ── Thin strands that connect the cursor to nearby existing gridlines ──
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

    // Nearest point on an axis-aligned segment to (px,py).
    const nearestOnSeg = (
      px: number,
      py: number,
      ax: number,
      ay: number,
      bx: number,
      by: number
    ): [number, number] => {
      const dx = bx - ax;
      const dy = by - ay;
      const len2 = dx * dx + dy * dy || 1;
      let t = ((px - ax) * dx + (py - ay) * dy) / len2;
      t = t < 0 ? 0 : t > 1 ? 1 : t;
      return [ax + dx * t, ay + dy * t];
    };

    type Strand = {
      fromC: number;
      fromR: number;
      toC: number;
      toR: number;
      p: number;
      target: number;
    };
    const strands = new Map<string, Strand>();

    // Draw an L-shaped, grid-aligned strand from the cursor's lattice node out
    // to the existing line, revealed up to fraction p by length — straight grid
    // segments that draw in like the rest, never bent.
    const drawStrand = (st: Strand) => {
      const sx = colX(st.fromC);
      const sy = yRow(st.fromR);
      const cornerX = colX(st.toC);
      const endY = yRow(st.toR);
      const leg1 = Math.abs(cornerX - sx);
      const leg2 = Math.abs(endY - sy);
      let budget = st.p * (leg1 + leg2);
      if (leg1 > 0) {
        const draw = Math.min(budget, leg1);
        if (draw > 0) {
          const x0 = cornerX >= sx ? sx : sx - draw;
          ctx.fillRect(x0 - LINE_W / 2, sy - LINE_W / 2, draw + LINE_W, LINE_W);
        }
        budget -= leg1;
      }
      if (budget > 0 && leg2 > 0) {
        const draw = Math.min(budget, leg2);
        const y0 = endY >= sy ? sy : sy - draw;
        ctx.fillRect(cornerX - LINE_W / 2, y0 - LINE_W / 2, LINE_W, draw + LINE_W);
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
      ctx.fillStyle = drawColor;

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

      // ── Settled: static base grid + a bloom of fresh lattice ──────────
      if (pointerOn) {
        cur.x += (target.x - cur.x) * 0.18;
        cur.y += (target.y - cur.y) * 0.18;
      }
      cursorAmt += ((pointerOn ? 1 : 0) - cursorAmt) * 0.12;

      // base grid (straight, never bends) + a subtle ambient shimmer: short
      // grid lines slowly add and recede along the skyline's top edge
      ctx.globalAlpha = 1;
      for (const s of segments) ctx.fillRect(s.x, s.y, s.w, s.h);
      if (ambientOn) {
        const et = now * 0.0005;
        for (const s of segments) {
          if (s.kind !== 0) continue; // trunks form the top edge
          const c = Math.round((s.x + LINE_W / 2 - offsetX) / unitProp);
          const e = smoothstep(0.55, 0.92, nodeNoise(c * 1.7, 11, et));
          if (e <= 0.002) continue;
          // grow the trunk straight up its own column only — always on-grid
          ctx.fillRect(s.x, s.y - e * EDGE_SHIMMER, s.w, e * EDGE_SHIMMER);
        }
      }

      // gather reveal targets from the cursor and the idle blooms
      wobT = now * 0.001;
      tgt.clear();
      if (cursorAmt > 0.002) {
        const throb = 1 + CURSOR_THROB * Math.sin(now * 0.004);
        addBloom(cur.x, cur.y, REVEAL_RADIUS, cursorAmt * throb, 0);
      }
      if (ambientOn) {
        for (let i = 0; i < AMB_COUNT; i++) {
          const a = AMB[i];
          const breath = 0.85 + 0.15 * Math.sin(now * a.tw + a.tp);
          addBloom(
            W * (0.5 + a.ax * Math.sin(now * a.sx + a.px)),
            H * (0.5 + a.ay * Math.sin(now * a.sy + a.py)),
            AMB_RADIUS,
            AMB_AMP * breath,
            a.seed
          );
        }
      }

      // ease the node field toward the targets, then prune the dead
      for (const [key, g] of grow) {
        const t = tgt.get(key) ?? 0;
        const next = g + (t - g) * (t > g ? RISE : FALL);
        if (next < 0.004 && t <= 0) {
          grow.delete(key);
          continue;
        }
        grow.set(key, next);
        tgt.delete(key);
      }
      for (const [key, t] of tgt) grow.set(key, t * RISE);

      // draw the level set: solid black, frontier edges clipped by length
      ctx.globalAlpha = 1;
      for (const key of grow.keys()) {
        const p = key.split(",");
        const c = +p[0];
        const r = +p[1];
        drawEdgeH(c, r);
        drawEdgeV(c, r);
        if (!grow.has(`${c - 1},${r}`)) drawEdgeH(c - 1, r);
        if (!grow.has(`${c},${r - 1}`)) drawEdgeV(c, r - 1);
      }

      // connect the cursor to the nearest existing gridline with a thin strand
      for (const st of strands.values()) st.target = 0;
      if (cursorAmt > 0.002) {
        let best = CONNECT_DIST * CONNECT_DIST;
        let qx = 0;
        let qy = 0;
        let found = false;
        for (const s of segments) {
          const [ax, ay, bx, by] = segEnds(s);
          if (
            cur.x < Math.min(ax, bx) - CONNECT_DIST ||
            cur.x > Math.max(ax, bx) + CONNECT_DIST ||
            cur.y < Math.min(ay, by) - CONNECT_DIST ||
            cur.y > Math.max(ay, by) + CONNECT_DIST
          )
            continue;
          const [nx, ny] = nearestOnSeg(cur.x, cur.y, ax, ay, bx, by);
          const dd = (cur.x - nx) ** 2 + (cur.y - ny) ** 2;
          if (dd < best) {
            best = dd;
            qx = nx;
            qy = ny;
            found = true;
          }
        }
        if (found) {
          const cC = Math.round((cur.x - offsetX) / unitProp);
          const cR = Math.round((cur.y - unitProp / 2) / unitProp);
          const toC = Math.round((qx - offsetX) / unitProp);
          const toR = Math.round((qy - unitProp / 2) / unitProp);
          if (toC !== cC || toR !== cR) {
            const tp =
              cursorAmt *
              smoothstep(CONNECT_DIST, CONNECT_DIST * 0.3, Math.sqrt(best));
            const key = `${toC},${toR}`;
            let st = strands.get(key);
            if (!st) {
              st = { fromC: cC, fromR: cR, toC, toR, p: 0, target: 0 };
              strands.set(key, st);
            }
            st.fromC = cC;
            st.fromR = cR;
            st.target = tp;
          }
        }
      }
      for (const [key, st] of strands) {
        st.p += (st.target - st.p) * (st.target > st.p ? RISE : FALL);
        if (st.p < 0.004 && st.target <= 0) {
          strands.delete(key);
          continue;
        }
        drawStrand(st);
      }

      applyClears();

      if (
        pointerOn ||
        recentlyMoved ||
        ambientActive ||
        cursorAmt > 0.002 ||
        grow.size > 0 ||
        strands.size > 0
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
    drawColor,
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
