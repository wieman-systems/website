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

interface BrandGridProps {
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
}

export default function BrandGrid({
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
}: BrandGridProps) {
  const ref = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = ref.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d")!;
    const seededRand = (x: number, y: number) => {
      const n = Math.sin(x * 127.1 + y * 311.7) * 43758.5453;
      return n - Math.floor(n);
    };

    function draw() {
      const W = canvas!.offsetWidth;
      const H = canvas!.offsetHeight;
      if (!W || !H) {
        setTimeout(draw, 120);
        return;
      }
      canvas!.width = W * devicePixelRatio;
      canvas!.height = H * devicePixelRatio;
      ctx.setTransform(devicePixelRatio, 0, 0, devicePixelRatio, 0, 0);
      ctx.clearRect(0, 0, W, H);
      const unit = unitProp;
      const lineW = 1.5;
      ctx.fillStyle = color;
      const cols = Math.ceil(W / unit) + 2;
      const rows = Math.ceil(H / unit) + 2;
      const colX = (c: number) => c * unit + offsetX;
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

      for (let c = 0; c <= cols; c++) {
        const x = colX(c);
        let top = growthTop[c];
        if (seededRand(c, 21) > 0.78) top += unit;
        ctx.fillRect(x - lineW / 2, top, lineW, H - top);
      }

      for (let row = 0; row < rows; row++) {
        const y = row * unit + unit / 2;
        const ny = y / H;
        const pConnect = Math.min(1, Math.pow(ny, 0.85) * 1.2);
        for (let c = 0; c < cols; c++) {
          if (y >= growthTop[c] && y >= growthTop[c + 1]) {
            if (seededRand(c * 3 + 1, row * 5 + 2) < pConnect)
              ctx.fillRect(
                colX(c) - lineW / 2,
                y - lineW / 2,
                unit + lineW,
                lineW
              );
          }
        }
      }

      const FRAGS = [
        ["u", "l", "r"],
        ["d", "l", "r"],
        ["u", "d", "l"],
        ["u", "d", "r"],
        ["u", "r"],
        ["u", "l"],
        ["d", "r"],
        ["d", "l"],
        ["l", "r"],
        ["l", "r"],
        ["u", "d"],
        ["r"],
        ["l"],
        ["u"],
        ["d"],
      ];

      const drawFrag = (cx: number, cy: number, dirs: string[], len: number) => {
        for (const d of dirs) {
          if (d === "u") ctx.fillRect(cx - lineW / 2, cy - len, lineW, len);
          if (d === "d") ctx.fillRect(cx - lineW / 2, cy, lineW, len);
          if (d === "l") ctx.fillRect(cx - len, cy - lineW / 2, len, lineW);
          if (d === "r") ctx.fillRect(cx, cy - lineW / 2, len, lineW);
        }
      };

      const rowsAll = Math.ceil(H / unit) + 2;
      for (let c = 2; c < cols - 3; c++) {
        for (let r = 0; r < rowsAll; r++) {
          if (seededRand(c * 7.3 + 3, r * 11.1 + 5) > fragRate) continue;
          const cx = colX(c);
          const cy = r * unit + unit / 2;
          const isCluster = seededRand(c + 31, r + 17) > 0.74;
          const pw = isCluster
            ? 2 + Math.floor(seededRand(c + 5, r + 5) * 2)
            : 0;
          const ph = isCluster
            ? 2 + Math.floor(seededRand(c + 8, r + 8) * 2)
            : 0;
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
                  ctx.fillRect(
                    colX(c + gx) - lineW / 2,
                    yAt(gy) - lineW / 2,
                    unit + lineW,
                    lineW
                  );
            for (let gx = 0; gx <= pw; gx++)
              for (let gy = 0; gy < ph; gy++)
                if (keep(gx, gy + 0.5, 2))
                  ctx.fillRect(
                    colX(c + gx) - lineW / 2,
                    yAt(gy) - lineW / 2,
                    lineW,
                    unit + lineW
                  );
            continue;
          }
          const frag =
            FRAGS[Math.floor(seededRand(c * 2.7, r * 3.1) * FRAGS.length)];
          const len = unit * (0.7 + seededRand(c, r) * 0.6);
          drawFrag(cx, cy, frag, len);
        }
      }

      const raggedClear = (
        x0: number,
        y0: number,
        x1: number,
        y1: number,
        mp: number
      ) => {
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
              clr =
                prob > 0 &&
                seededRand(c * 1.3 + 7, rr * 2.1 + 5) < prob;
            }
            if (clr)
              ctx.clearRect(
                cellx - lineW,
                celly - lineW,
                unit + lineW * 2,
                unit + lineW * 2
              );
          }
        }
      };

      if (clearRects)
        for (const cr of clearRects)
          raggedClear(W * cr.x0, H * cr.y0, W * cr.x1, H * cr.y1, 20);

      if (clearTargets) {
        const cb = canvas!.getBoundingClientRect();
        for (const tg of clearTargets) {
          const isClearTarget = tg && "ref" in tg;
          const refObj = isClearTarget
            ? (tg as ClearTarget).ref
            : (tg as React.RefObject<HTMLElement | null>);
          const el = refObj?.current;
          if (!el) continue;
          const r = el.getBoundingClientRect();
          if (!r.width) continue;
          const px = isClearTarget ? (tg as ClearTarget).padX ?? 0 : 0;
          const pt = isClearTarget ? (tg as ClearTarget).padTop ?? 0 : 0;
          const pb = isClearTarget ? (tg as ClearTarget).padBottom ?? 0 : 0;
          const x0 = r.left - cb.left;
          const y0 = r.top - cb.top;
          raggedClear(
            x0 - px,
            y0 - pt,
            x0 + r.width + px,
            y0 + r.height + pb,
            17
          );
        }
      }
    }

    const timers = [0, 60, 150, 350, 800].map((d) => setTimeout(draw, d));
    const ro = new ResizeObserver(draw);
    ro.observe(canvas);
    window.addEventListener("resize", draw);
    window.addEventListener("load", draw);
    return () => {
      timers.forEach(clearTimeout);
      ro.disconnect();
      window.removeEventListener("resize", draw);
      window.removeEventListener("load", draw);
    };
  }, [color, unitProp, offsetX, fragRate, rightBias, edgeBias]);

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
