"use client";

import { useEffect, useRef } from "react";
import { scenes } from "@/lib/content";
import { useReducedMotion } from "@/lib/useReducedMotion";
import {
  buildLUT,
  coverTransform,
  lengthAtY,
  transformD,
  type PathLUT,
  type Pt,
} from "@/lib/roadPath";

/** .scene__media overscan (inset -4%, height 108%) — the cover mapping must
 *  target the real rendered image box, not the section box. */
const OVERSCAN_TOP = 0.04;
const OVERSCAN_SCALE = 1.08;

/** Where the light "is" relative to the viewport (0 top … 1 bottom). Scene
 *  card reveals and the odometer anchor to the same ratio. */
export const FOCUS = 0.55;

const TRAIL = 320; // px of hot trail behind the head

/**
 * THE one line. A single SVG spanning the whole road-world: per-scene fitted
 * segments (image coords → cover transform → page coords) joined by generated
 * void curves. A hot head + short trail ride it, scroll-scrubbed; the branch
 * through the fork arch is a separate reveal path.
 */
export function RoadLine() {
  const svgRef = useRef<SVGSVGElement>(null);
  const baseRef = useRef<SVGPathElement>(null);
  const trailRef = useRef<SVGPathElement>(null);
  const trailSoftRef = useRef<SVGPathElement>(null);
  const branchRef = useRef<SVGPathElement>(null);
  const headRef = useRef<SVGGElement>(null);
  const reduced = useReducedMotion();

  useEffect(() => {
    const svg = svgRef.current;
    const base = baseRef.current;
    const trail = trailRef.current;
    const trailSoft = trailSoftRef.current;
    const branch = branchRef.current;
    const head = headRef.current;
    if (!svg || !base || !trail || !trailSoft || !head) return;

    const world = document.getElementById("road-world");
    if (!world) return;

    let lut: PathLUT | null = null;
    let total = 0;
    let target = 0;
    let current = -1;
    let raf = 0;
    let alive = true;

    const build = () => {
      const worldBox = world.getBoundingClientRect();
      const worldTop = worldBox.top + window.scrollY;
      const w = world.clientWidth;
      const h = world.scrollHeight;
      svg.setAttribute("viewBox", `0 0 ${w} ${h}`);
      svg.setAttribute("width", String(w));
      svg.setAttribute("height", String(h));

      let d = "";
      let prevExit: Pt | null = null;
      let branchD = "";

      for (const scene of scenes) {
        const el = world.querySelector<HTMLElement>(
          `[data-scene-key="${scene.key}"]`,
        );
        if (!el || !scene.path) continue;
        const r = el.getBoundingClientRect();
        const top = r.top + window.scrollY - worldTop;
        const left = r.left - worldBox.left;

        const usePortrait =
          !!scene.asset.portrait &&
          !!scene.pathPortrait &&
          window.matchMedia("(max-aspect-ratio: 4/5)").matches;
        const fitted = usePortrait ? scene.pathPortrait! : scene.path;
        const iw = usePortrait ? 941 : 1672;
        const ih = usePortrait ? 1672 : 941;
        // Map into the overscanned media box the parallax layer renders in.
        const boxH = r.height * OVERSCAN_SCALE;
        const boxTop = top - r.height * OVERSCAN_TOP;
        const { s, ox, oy } = coverTransform(iw, ih, r.width, boxH);
        const map = (p: Pt): Pt => ({
          x: left + ox + p.x * s,
          y: boxTop + oy + p.y * s,
        });

        const seg = transformD(fitted, map);
        if (!seg) continue;
        if (!d) {
          d = seg.d;
        } else if (prevExit) {
          // Void connector: a vertical-tangent cubic through the gap.
          const dv = Math.max(90, (seg.first.y - prevExit.y) * 0.42);
          d += ` C ${prevExit.x} ${prevExit.y + dv} ${seg.first.x} ${seg.first.y - dv} ${seg.first.x} ${seg.first.y}`;
          d += seg.d.replace(/^M[^C]+/, " ");
        }
        prevExit = seg.last;

        if (scene.branch && branch) {
          const b = transformD(scene.branch, map);
          if (b) branchD = b.d;
        }
      }

      if (!d) return;
      base.setAttribute("d", d);
      trail.setAttribute("d", d);
      trailSoft.setAttribute("d", d);
      if (branch) branch.setAttribute("d", branchD || "M -10 -10");

      lut = buildLUT(base);
      total = lut.total;

      if (reduced) {
        // Static world: full line lit, no head chase.
        for (const p of [trail, trailSoft]) {
          p.style.strokeDasharray = "none";
          p.style.strokeDashoffset = "0";
          p.style.opacity = "0.4";
        }
        const end = base.getPointAtLength(total);
        head.setAttribute("transform", `translate(${end.x} ${end.y})`);
      } else {
        const dash = `${TRAIL} ${Math.ceil(total)}`;
        trail.style.strokeDasharray = dash;
        trailSoft.style.strokeDasharray = dash;
      }

      // Branch reveal setup (scrubbed by scroll near the fork).
      if (branch && branchD) {
        const bl = branch.getTotalLength();
        branch.style.strokeDasharray = `${bl}`;
        branch.style.strokeDashoffset = reduced ? "0" : `${bl}`;
      }

      onScroll();
    };

    const worldTopAbs = () =>
      world.getBoundingClientRect().top + window.scrollY;

    const onScroll = () => {
      if (!lut) return;
      const y = window.scrollY + window.innerHeight * FOCUS - worldTopAbs();
      target = lengthAtY(lut, y);

      // Branch reveal: driven here (cheap) instead of a separate trigger.
      const branchEl = branchRef.current;
      const fork = document.querySelector<HTMLElement>(
        '[data-scene-key="fork"]',
      );
      if (branchEl && fork && !reduced) {
        const r = fork.getBoundingClientRect();
        const p = Math.min(
          1,
          Math.max(0, (window.innerHeight * 0.85 - r.top) / (r.height * 0.7)),
        );
        const bl = branchEl.getTotalLength();
        branchEl.style.strokeDashoffset = String(bl * (1 - p));
      }
    };

    const tick = () => {
      if (!alive) return;
      raf = requestAnimationFrame(tick);
      if (!lut || reduced) return;
      const delta = target - current;
      if (Math.abs(delta) < 0.05) return;
      current = Math.abs(delta) > total * 0.5 ? target : current + delta * 0.14;
      const pt = base.getPointAtLength(Math.max(0, current));
      head.setAttribute("transform", `translate(${pt.x} ${pt.y})`);
      const off = String(TRAIL - current);
      trail.style.strokeDashoffset = off;
      trailSoft.style.strokeDashoffset = off;
    };

    build();
    tick();

    const ro = new ResizeObserver(() => build());
    ro.observe(world);
    window.addEventListener("scroll", onScroll, { passive: true });
    window.addEventListener("resize", build);
    return () => {
      alive = false;
      cancelAnimationFrame(raf);
      ro.disconnect();
      window.removeEventListener("scroll", onScroll);
      window.removeEventListener("resize", build);
    };
  }, [reduced]);

  return (
    <svg ref={svgRef} className="road-line" aria-hidden focusable="false">
      {/* Softness comes from layered strokes, not filters — a blur filter on a
          page-tall path would force full-canvas repaints every frame. */}
      <defs>
        <radialGradient id="rl-halo">
          <stop offset="0%" stopColor="#f2cb74" stopOpacity="0.9" />
          <stop offset="45%" stopColor="#f2cb74" stopOpacity="0.35" />
          <stop offset="100%" stopColor="#f2cb74" stopOpacity="0" />
        </radialGradient>
      </defs>
      <path ref={baseRef} className="road-line__base" />
      <path ref={branchRef} className="road-line__branch" />
      <path ref={trailSoftRef} className="road-line__trail road-line__trail--soft" />
      <path ref={trailRef} className="road-line__trail" />
      <g ref={headRef} className="road-line__head">
        <circle r="16" fill="url(#rl-halo)" />
        <circle r="3.2" className="road-line__core" />
      </g>
    </svg>
  );
}
