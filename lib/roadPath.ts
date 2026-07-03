// =============================================================================
// roadPath.ts — geometry for THE one line.
// Fitted scene segments live in content.ts as `d` strings in IMAGE coordinates
// (the painted frame's intrinsic pixel space). At runtime they are mapped
// through each scene's cover transform into page space and joined into a
// single continuous path.
// =============================================================================

export interface Pt {
  x: number;
  y: number;
}

/** background-size:cover / object-fit:cover mapping of an iw×ih image into a
 *  bw×bh box. `fx` is the horizontal focus fraction (object-position x) —
 *  0.5 = centered; smaller keeps more of the image's left side in frame on
 *  narrow viewports. The line and live bits use the SAME fx as the CSS. */
export function coverTransform(
  iw: number,
  ih: number,
  bw: number,
  bh: number,
  fx = 0.5,
) {
  const s = Math.max(bw / iw, bh / ih);
  return { s, ox: (bw - iw * s) * fx, oy: (bh - ih * s) / 2 };
}

/** Affine-transform every coordinate of a fitted "M … C …" `d` string —
 *  Bézier control points transform exactly, so the mapped curve is identical
 *  to the fitted one. Returns the new d plus first/last anchors for joining. */
export function transformD(
  d: string,
  map: (p: Pt) => Pt,
): { d: string; first: Pt; last: Pt } | null {
  const nums = (d.match(/-?\d*\.?\d+(?:e-?\d+)?/gi) ?? []).map(Number);
  if (nums.length < 2 || nums.length % 2 !== 0) return null;
  const pts: Pt[] = [];
  for (let i = 0; i < nums.length; i += 2) {
    pts.push(map({ x: nums[i], y: nums[i + 1] }));
  }
  let out = `M ${round(pts[0].x)} ${round(pts[0].y)}`;
  for (let i = 1; i + 2 < pts.length; i += 3) {
    out += ` C ${round(pts[i].x)} ${round(pts[i].y)} ${round(pts[i + 1].x)} ${round(pts[i + 1].y)} ${round(pts[i + 2].x)} ${round(pts[i + 2].y)}`;
  }
  return { d: out, first: pts[0], last: pts[pts.length - 1] };
}

/** Parse a fitted `d` (our own generated "M … C …" format) into anchor points.
 *  Anchors = the M point plus the end point of every curve triple. */
export function parseFittedD(d: string): Pt[] {
  const nums = (d.match(/-?\d*\.?\d+(?:e-?\d+)?/gi) ?? []).map(Number);
  const pts: Pt[] = [];
  const cmds = d.match(/[a-df-z]/gi) ?? [];
  let i = 0;
  for (const cmd of cmds) {
    const c = cmd.toUpperCase();
    if (c === "M" || c === "L") {
      pts.push({ x: nums[i], y: nums[i + 1] });
      i += 2;
    } else if (c === "C") {
      // consume triples until the next command's numbers would start
      pts.push({ x: nums[i + 4], y: nums[i + 5] });
      i += 6;
    } else if (c === "Q") {
      pts.push({ x: nums[i + 2], y: nums[i + 3] });
      i += 4;
    }
  }
  // A single C command may carry several triples (SVG allows it) — recover
  // any leftovers as extra anchors.
  while (i + 5 < nums.length) {
    pts.push({ x: nums[i + 4], y: nums[i + 5] });
    i += 6;
  }
  return pts.filter((p) => Number.isFinite(p.x) && Number.isFinite(p.y));
}

/** Catmull-Rom → cubic Bézier `d`. Produces the smooth, hand-drawn feel the
 *  fitter and the auto-fitted segments both emit. */
export function pointsToD(pts: Pt[], tension = 1): string {
  if (pts.length === 0) return "";
  if (pts.length === 1) return `M ${pts[0].x} ${pts[0].y}`;
  const p = (i: number) => pts[Math.max(0, Math.min(pts.length - 1, i))];
  let d = `M ${round(pts[0].x)} ${round(pts[0].y)}`;
  for (let i = 0; i < pts.length - 1; i++) {
    const p0 = p(i - 1);
    const p1 = p(i);
    const p2 = p(i + 1);
    const p3 = p(i + 2);
    const c1x = p1.x + ((p2.x - p0.x) / 6) * tension;
    const c1y = p1.y + ((p2.y - p0.y) / 6) * tension;
    const c2x = p2.x - ((p3.x - p1.x) / 6) * tension;
    const c2y = p2.y - ((p3.y - p1.y) / 6) * tension;
    d += ` C ${round(c1x)} ${round(c1y)} ${round(c2x)} ${round(c2y)} ${round(p2.x)} ${round(p2.y)}`;
  }
  return d;
}

const round = (n: number) => Math.round(n * 10) / 10;

/** Arc-length lookup table for a live SVGPathElement. `yMono` is a
 *  monotonically non-decreasing copy of y so a scroll→length binary search
 *  stays well-defined through horizontal or backtracking stretches. */
export interface PathLUT {
  total: number;
  samples: { len: number; x: number; y: number; yMono: number }[];
}

export function buildLUT(path: SVGPathElement, step = 22): PathLUT {
  const total = path.getTotalLength();
  const samples: PathLUT["samples"] = [];
  let yMono = -Infinity;
  const n = Math.max(2, Math.ceil(total / step));
  for (let i = 0; i <= n; i++) {
    const len = (i / n) * total;
    const pt = path.getPointAtLength(len);
    yMono = Math.max(yMono, pt.y);
    samples.push({ len, x: pt.x, y: pt.y, yMono });
  }
  return { total, samples };
}

/** Path length whose (monotonicized) y best matches the given page y. */
export function lengthAtY(lut: PathLUT, y: number): number {
  const s = lut.samples;
  if (y <= s[0].yMono) return s[0].len;
  if (y >= s[s.length - 1].yMono) return s[s.length - 1].len;
  let lo = 0;
  let hi = s.length - 1;
  while (hi - lo > 1) {
    const mid = (lo + hi) >> 1;
    if (s[mid].yMono < y) lo = mid;
    else hi = mid;
  }
  const a = s[lo];
  const b = s[hi];
  const t = b.yMono === a.yMono ? 0 : (y - a.yMono) / (b.yMono - a.yMono);
  return a.len + (b.len - a.len) * t;
}
