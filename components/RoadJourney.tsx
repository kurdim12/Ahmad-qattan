"use client";

import { useRef } from "react";
import { gsap } from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { useGSAP } from "@gsap/react";
import Lenis from "lenis";
import { content } from "@/lib/content";
import { useLocale } from "@/lib/locale";
import { useReducedMotion } from "@/lib/useReducedMotion";
import { formatStopNumber } from "@/lib/numerals";
import { Stop } from "./Stop";
import { GatewayStop } from "./GatewayStop";
import { SCENE_ROADS, SCENE_ROADS_TALL } from "./Scene";
import { Traveler } from "./Traveler";

gsap.registerPlugin(ScrollTrigger);

interface Anchor {
  x: number;
  y: number;
  gateway: boolean;
  len: number;
}

/** Frame ratios: wide originals and portrait (tall) phone variants. */
const IMG_RATIO = 1680 / 944;
const IMG_RATIO_TALL = 1024 / 1536;
/** .scene__img / .hero__scene img are 112% tall (parallax headroom). */
const IMG_H_FACTOR = 1.12;

function parseFocus(s: string | undefined): [number, number] {
  const m = s?.match(/([\d.]+)%\s+([\d.]+)%/);
  return m ? [parseFloat(m[1]) / 100, parseFloat(m[2]) / 100] : [0.5, 0.5];
}

/**
 * Map a point given as a fraction of the FULL painting to coordinates inside
 * the (object-fit: cover, object-position: focus) crop shown by a figure —
 * i.e. exactly where that spot of the artwork is rendered on screen.
 * Returned coords are relative to the figure's top-left.
 */
function scenePoint(
  fig: DOMRect,
  fx: number,
  fy: number,
  px: number,
  py: number,
  ratio: number = IMG_RATIO,
): { x: number; y: number } {
  const boxW = fig.width;
  const boxH = fig.height * IMG_H_FACTOR;
  let iw = boxW;
  let ih = boxW / ratio;
  if (ih < boxH) {
    ih = boxH;
    iw = boxH * ratio;
  }
  const ox = (boxW - iw) * px;
  const oy = (boxH - ih) * py;
  return { x: ox + fx * iw, y: oy + fy * ih };
}

export function RoadJourney() {
  const { locale } = useLocale();
  const reduced = useReducedMotion();

  const roadRef = useRef<HTMLDivElement>(null);
  const svgRef = useRef<SVGSVGElement>(null);
  const pathRef = useRef<SVGPathElement>(null);
  const glowRef = useRef<SVGPathElement>(null);
  const hazeRef = useRef<SVGPathElement>(null);
  const leadRef = useRef<SVGPathElement>(null);
  const travelerRef = useRef<HTMLDivElement>(null);
  const maskBaseRef = useRef<SVGRectElement>(null);
  const maskScenesRef = useRef<SVGGElement>(null);
  const cache = useRef<{
    total: number;
    anchors: Anchor[];
    gatewayLen: number;
    sampled: { l: number; y: number }[];
    roadTop: number;
  } | null>(null);

  // --- Smooth scroll (Lenis) synced to GSAP's ticker; skipped for reduced motion.
  useGSAP(
    () => {
      if (reduced) return;
      const lenis = new Lenis({ lerp: 0.1, smoothWheel: true });
      lenis.on("scroll", ScrollTrigger.update);
      const onTick = (time: number) => lenis.raf(time * 1000);
      gsap.ticker.add(onTick);
      gsap.ticker.lagSmoothing(0);
      return () => {
        gsap.ticker.remove(onTick);
        lenis.destroy();
      };
    },
    { dependencies: [reduced] },
  );

  // --- The road engine: build geometry, draw on scroll, ride the traveler.
  useGSAP(
    () => {
      const road = roadRef.current;
      const svg = svgRef.current;
      const path = pathRef.current;
      const glow = glowRef.current;
      const haze = hazeRef.current;
      const lead = leadRef.current;
      const traveler = travelerRef.current;
      if (!road || !svg || !path || !glow || !haze || !lead || !traveler) return;

      const strokes = [path, glow, haze];
      const markerEls = () =>
        Array.from(road.querySelectorAll<HTMLElement>("[data-marker]"));

      /** Build the SVG path as ONE road with the paintings: it arrives at each
       *  scene's painted-road horizon point, follows the painted road's bends
       *  (SCENE_ROADS waypoints mapped through the live crop), and re-emerges
       *  exactly where the painted road crosses the frame's bottom edge. An
       *  SVG mask hides the stroke inside the paintings — there the PAINTED
       *  road carries the journey and only the traveler dot rides across it.
       *  Markers are shifted onto the road (each scene's exit x), so line →
       *  number → card thread as one. */
      const buildPath = () => {
        const markers = markerEls();
        if (markers.length === 0) return;

        const roadRect = road.getBoundingClientRect();
        const W = road.clientWidth;
        const H = road.clientHeight;
        const isMobile = window.matchMedia("(max-width: 767px)").matches;

        const cx = W / 2;
        const ampSmall = isMobile ? 20 : 80; // weave for scene-less stretches
        const clampX = (x: number) => Math.max(28, Math.min(W - 28, x));

        const pts: { x: number; y: number }[] = [];
        const anchors: Anchor[] = [];
        const sceneRects: { top: number; h: number }[] = [];

        // Wide painting on desktop, portrait painting on phones — each has its
        // own frame ratio and its own traced road map.
        const roadOf = (el: HTMLElement) => {
          const id = el.dataset.sceneId as keyof typeof SCENE_ROADS | undefined;
          if (!id) return null;
          const tall = isMobile && el.dataset.tall === "1";
          return {
            meta: tall ? SCENE_ROADS_TALL[id] : SCENE_ROADS[id],
            ratio: tall ? IMG_RATIO_TALL : IMG_RATIO,
          };
        };

        // Start where the HERO painting's road crosses its bottom edge — the
        // drawn line literally continues the picture above.
        let startX = cx;
        const heroFig = document.querySelector<HTMLElement>(".hero__scene");
        const heroRoad = heroFig && roadOf(heroFig);
        if (heroFig && heroRoad?.meta) {
          const hr = heroFig.getBoundingClientRect();
          const [hpx, hpy] = parseFocus(heroFig.dataset.focus);
          startX = clampX(
            hr.left -
              roadRect.left +
              scenePoint(hr, heroRoad.meta.exit, 1, hpx, hpy, heroRoad.ratio).x,
          );
        }
        pts.push({ x: startX, y: 0 });

        // Walk scenes + markers in document order.
        const els = Array.from(
          road.querySelectorAll<HTMLElement>("[data-scene], [data-marker]"),
        );
        let pendingExitX: number | null = null;
        let lastWasMarker = false;
        let bulgeSide = 1;

        for (const el of els) {
          if (el.hasAttribute("data-scene")) {
            const sceneRoad = roadOf(el);
            const fr = el.getBoundingClientRect();
            const fx0 = fr.left - roadRect.left;
            const fy0 = fr.top - roadRect.top;
            if (sceneRoad?.meta) {
              const { meta, ratio } = sceneRoad;
              const [px, py] = parseFocus(el.dataset.focus);
              const eP = scenePoint(fr, meta.entry[0], meta.entry[1], px, py, ratio);
              const entryX = clampX(fx0 + eP.x);
              // Pre-entry node above the painting: the sideways swing toward
              // the horizon point happens across the tall card zone, so the
              // line always ENTERS the picture near-vertically (no flat
              // full-width streaks in the sky).
              const prevY = pts[pts.length - 1].y;
              const preY = fy0 - (isMobile ? 80 : 140);
              if (preY > prevY + 60) pts.push({ x: entryX, y: preY });
              pts.push({ x: entryX, y: fy0 + Math.max(24, eP.y) });
              for (const [mx, my] of meta.mids ?? []) {
                const mP = scenePoint(fr, mx, my, px, py, ratio);
                pts.push({ x: clampX(fx0 + mP.x), y: fy0 + mP.y });
              }
              pendingExitX = clampX(
                fx0 + scenePoint(fr, meta.exit, 1, px, py, ratio).x,
              );
              pts.push({ x: pendingExitX, y: fy0 + fr.height });
              sceneRects.push({ top: fy0, h: fr.height });
            }
            lastWasMarker = false;
          } else {
            // Marker: park it where the painted road left the frame (or keep
            // it centred on scene-less stops), THEN measure it.
            el.style.transform =
              pendingExitX != null
                ? `translateX(${(pendingExitX - cx).toFixed(1)}px)`
                : "";
            const r = el.getBoundingClientRect();
            const mx = r.left - roadRect.left + r.width / 2;
            const my = r.top - roadRect.top + r.height / 2;
            if (lastWasMarker) {
              // Two markers with no painting between them: gentle weave.
              const prev = pts[pts.length - 1];
              pts.push({ x: cx + bulgeSide * ampSmall, y: (prev.y + my) / 2 });
              bulgeSide = -bulgeSide;
            }
            pts.push({ x: mx, y: my });
            anchors.push({
              x: mx,
              y: my,
              gateway: el.hasAttribute("data-gateway"),
              len: 0,
            });
            pendingExitX = null;
            lastWasMarker = true;
          }
        }
        // NOTE: no trailing point — the path FINISHES exactly on the last
        // marker so the line + traveler land on the final number.

        // Smooth through nodes with vertical tangents (cp shares x with node).
        let d = `M ${pts[0].x.toFixed(2)} ${pts[0].y.toFixed(2)}`;
        for (let i = 1; i < pts.length; i++) {
          const p0 = pts[i - 1];
          const p1 = pts[i];
          const dy = (p1.y - p0.y) * 0.5;
          d += ` C ${p0.x.toFixed(2)} ${(p0.y + dy).toFixed(2)} ${p1.x.toFixed(2)} ${(p1.y - dy).toFixed(2)} ${p1.x.toFixed(2)} ${p1.y.toFixed(2)}`;
        }

        svg.setAttribute("viewBox", `0 0 ${W} ${H}`);
        strokes.forEach((p) => p.setAttribute("d", d));
        lead.setAttribute("d", d);

        const total = path.getTotalLength();

        // Sample once to map each anchor (and the gateway) to a path length.
        const SAMPLES = 600;
        const sampled: { l: number; y: number }[] = [];
        for (let i = 0; i <= SAMPLES; i++) {
          const l = (i / SAMPLES) * total;
          sampled.push({ l, y: path.getPointAtLength(l).y });
        }
        let gatewayLen = total;
        anchors.forEach((a) => {
          const hit = sampled.find((s) => s.y >= a.y) ?? sampled[sampled.length - 1];
          a.len = hit.l;
          if (a.gateway) gatewayLen = hit.l;
        });

        strokes.forEach((p) => {
          p.style.strokeDasharray = `${total}`;
          p.style.strokeDashoffset = `${total}`;
        });

        // Lead glow: a bright segment ending at the gateway, faded in on approach.
        const seg = isMobile ? 90 : 150;
        lead.style.strokeDasharray = `${seg} ${total}`;
        lead.style.strokeDashoffset = `${seg - gatewayLen}`;
        lead.style.opacity = "0";

        // Mask: hide the stroke inside each painting (soft dissolve at the
        // edges) — there the PAINTED road carries the journey.
        const maskBase = maskBaseRef.current;
        const maskScenes = maskScenesRef.current;
        if (maskBase && maskScenes) {
          maskBase.setAttribute("width", `${W}`);
          maskBase.setAttribute("height", `${H}`);
          maskScenes.textContent = "";
          const NS = "http://www.w3.org/2000/svg";
          for (const sr of sceneRects) {
            const rect = document.createElementNS(NS, "rect");
            rect.setAttribute("x", "0");
            rect.setAttribute("width", `${W}`);
            rect.setAttribute("y", `${sr.top}`);
            rect.setAttribute("height", `${sr.h}`);
            rect.setAttribute("fill", "url(#sceneHide)");
            maskScenes.appendChild(rect);
          }
        }

        cache.current = {
          total,
          anchors,
          gatewayLen,
          sampled,
          roadTop: roadRect.top + window.scrollY,
        };
      };

      /** Path length at a given page-y (both monotonic along the road). */
      const lengthAtY = (y: number) => {
        const c = cache.current;
        if (!c) return 0;
        const s = c.sampled;
        if (y <= s[0].y) return 0;
        if (y >= s[s.length - 1].y) return c.total;
        let lo = 0;
        let hi = s.length - 1;
        while (hi - lo > 1) {
          const mid = (lo + hi) >> 1;
          if (s[mid].y < y) lo = mid;
          else hi = mid;
        }
        const t = (y - s[lo].y) / Math.max(1e-6, s[hi].y - s[lo].y);
        return s[lo].l + t * (s[hi].l - s[lo].l);
      };

      /** Apply a drawn length: reveal stroke, ride the traveler, light markers. */
      const applyDraw = (drawn: number) => {
        const c = cache.current;
        if (!c) return;
        strokes.forEach((p) => {
          p.style.strokeDashoffset = `${c.total - drawn}`;
        });
        const pt = path.getPointAtLength(drawn);
        gsap.set(traveler, { x: pt.x, y: pt.y, xPercent: -50, yPercent: -50 });
        const markers = markerEls();
        c.anchors.forEach((a, i) => {
          markers[i]?.classList.toggle("is-active", drawn >= a.len - 1);
        });
      };

      /** The sync rule: the draw head IS the middle of your screen. The dot is
       *  always exactly where you're looking; markers light as they cross it. */
      const drawAtViewport = () => {
        const c = cache.current;
        if (!c) return;
        const focalY = window.scrollY + window.innerHeight * 0.5 - c.roadTop;
        applyDraw(lengthAtY(focalY));
      };

      // ---- Reduced motion: show the finished road, everything lit, no scrub. ----
      if (reduced) {
        buildPath();
        const c = cache.current;
        if (c) {
          strokes.forEach((p) => {
            p.style.strokeDashoffset = "0";
          });
          const end = path.getPointAtLength(c.total);
          gsap.set(traveler, { x: end.x, y: end.y, xPercent: -50, yPercent: -50, autoAlpha: 0 });
          markerEls().forEach((m) => m.classList.add("is-active"));
        }
        return;
      }

      document.documentElement.classList.add("has-motion");

      // Card reveals (calm rise + fade).
      gsap.utils.toArray<HTMLElement>(".reveal").forEach((el) => {
        gsap.fromTo(
          el,
          { autoAlpha: 0, y: 40 },
          {
            autoAlpha: 1,
            y: 0,
            duration: 0.9,
            ease: "power3.out",
            scrollTrigger: { trigger: el, start: "top 85%", once: true },
          },
        );
      });

      // Scenes: slow fade-up + a gentle parallax drift so the paintings feel
      // like landscapes passing by, not stickers on the page.
      gsap.utils.toArray<HTMLElement>("[data-scene]").forEach((fig) => {
        gsap.fromTo(
          fig,
          { autoAlpha: 0 },
          {
            autoAlpha: 1,
            duration: 1.4,
            ease: "power2.out",
            scrollTrigger: { trigger: fig, start: "top 88%", once: true },
          },
        );
        const img = fig.querySelector("img");
        if (img) {
          gsap.fromTo(
            img,
            { yPercent: -5 },
            {
              yPercent: 5,
              ease: "none",
              scrollTrigger: {
                trigger: fig,
                start: "top bottom",
                end: "bottom top",
                scrub: true,
              },
            },
          );
        }
      });

      // Gateway reveal — weightier: scale + settle (brief §6A).
      const gatewayEl = road.querySelector<HTMLElement>("[data-gateway-stop]");
      const gatewayCard = road.querySelector<HTMLElement>(".reveal-gateway");
      if (gatewayCard && gatewayEl) {
        gsap.fromTo(
          gatewayCard,
          { autoAlpha: 0, scale: 0.82, y: 30 },
          {
            autoAlpha: 1,
            scale: 1,
            y: 0,
            duration: 1.1,
            ease: "power3.out",
            scrollTrigger: { trigger: gatewayEl, start: "top 80%", once: true },
          },
        );
      }

      // Main draw: active for the road's whole time on screen; the drawn head
      // is computed from the viewport's focal line (see drawAtViewport), so
      // line, paintings and text stay in lockstep with the reader.
      ScrollTrigger.create({
        trigger: road,
        start: "top bottom",
        end: "bottom top",
        scrub: true,
        invalidateOnRefresh: true,
        onRefresh: () => {
          buildPath();
          drawAtViewport();
        },
        onUpdate: drawAtViewport,
      });

      // Gateway approach: siblings recede, lead glow brightens, ✦ pulses (tent curve).
      if (gatewayEl) {
        ScrollTrigger.create({
          trigger: gatewayEl,
          start: "top 85%",
          end: "bottom 15%",
          scrub: true,
          onUpdate: (self) => {
            const tent = 1 - Math.abs(2 * self.progress - 1);
            road.style.setProperty("--approach", tent.toFixed(3));
            lead.style.opacity = String(tent);
            lead.style.strokeWidth = String(3 + tent * 6);
          },
        });
      }

      // Initial geometry + traveler "drop in" at the start.
      buildPath();
      drawAtViewport();
      gsap.fromTo(
        traveler,
        { autoAlpha: 0, scale: 0.4 },
        { autoAlpha: 1, scale: 1, duration: 0.7, delay: 0.4, ease: "back.out(2)" },
      );

      // Re-measure after fonts settle (avoids layout-shift drift).
      if (document.fonts?.ready) {
        document.fonts.ready.then(() => ScrollTrigger.refresh());
      }
    },
    { scope: roadRef, dependencies: [locale, reduced] },
  );

  // ---- Render: stops mapped to Stop / GatewayStop with numbering.
  const stops = content[locale].stops;
  let n = 0;

  return (
    <section
      id="road"
      ref={roadRef}
      className="road"
      aria-label={content[locale].ui.progressAria}
    >
      <div className="road__channel" aria-hidden="true">
        {/* Three stacked strokes fake a luminous road without SVG filters
            (cheap on mobile): wide haze, mid glow, hot core. The lead path
            keeps its blur — it only lights up near the gateway. */}
        <svg ref={svgRef} className="road__svg" preserveAspectRatio="none">
          <defs>
            <linearGradient id="roadGrad" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0" stopColor="#8a5a16" />
              <stop offset="0.5" stopColor="#e79a2e" />
              <stop offset="1" stopColor="#ffd479" />
            </linearGradient>
            <filter id="roadGlow" x="-50%" y="-50%" width="200%" height="200%">
              <feGaussianBlur stdDeviation="3.5" />
            </filter>
            {/* Inside a painting the stroke dissolves (luminance mask) and the
                PAINTED road takes over — only the traveler dot crosses the art. */}
            <linearGradient id="sceneHide" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0" stopColor="#fff" />
              <stop offset="0.14" stopColor="#000" />
              <stop offset="0.86" stopColor="#000" />
              <stop offset="1" stopColor="#fff" />
            </linearGradient>
            <mask id="roadMask" maskUnits="userSpaceOnUse">
              <rect ref={maskBaseRef} x="0" y="0" fill="#fff" />
              <g ref={maskScenesRef} />
            </mask>
          </defs>
          <g mask="url(#roadMask)">
            <path ref={hazeRef} className="road__haze" stroke="#f5a92c" fill="none" />
            <path ref={glowRef} className="road__glow" stroke="#ffb845" fill="none" />
            <path ref={pathRef} className="road__path" stroke="url(#roadGrad)" fill="none" />
            <path ref={leadRef} className="road__lead" stroke="#ffe9b0" fill="none" filter="url(#roadGlow)" />
          </g>
        </svg>
        <Traveler ref={travelerRef} />
      </div>

      <ol className="stops">
        {stops.map((stop) => {
          if ("type" in stop && stop.type === "gateway") {
            return <GatewayStop key={stop.key} stop={stop} />;
          }
          n += 1;
          return (
            <Stop
              key={stop.key}
              stop={stop}
              number={formatStopNumber(n, locale)}
            />
          );
        })}
      </ol>
    </section>
  );
}
