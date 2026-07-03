"use client";

import { useRef } from "react";
import { gsap } from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { SplitText } from "gsap/SplitText";
import { useGSAP } from "@gsap/react";
import Lenis from "lenis";
import { content } from "@/lib/content";
import { useLocale } from "@/lib/locale";
import { useReducedMotion } from "@/lib/useReducedMotion";
import { Chapter } from "./Chapter";
import { SCENE_ROADS_ART } from "./scenes";
import { Traveler } from "./Traveler";

gsap.registerPlugin(ScrollTrigger, SplitText);

// Real phones resize the viewport every time the address bar hides/shows —
// without this, ScrollTrigger refreshes (and we rebuild the whole road)
// repeatedly MID-SCROLL, which reads as jank. Ignore those resizes; a true
// orientation/width change still triggers a full refresh.
if (typeof window !== "undefined") {
  ScrollTrigger.config({ ignoreMobileResize: true });
}

interface Anchor {
  x: number;
  y: number;
  gateway: boolean;
  len: number;
}

/** Every code-drawn scene shares a square frame ("slice" = cover crop). */
const ART_RATIO = 1;
/** Scene art elements are 112% tall (parallax headroom). */
const IMG_H_FACTOR = 1.12;

/** Map a full-frame fraction to on-screen coords inside the live cover crop. */
function scenePoint(
  fig: DOMRect,
  fx: number,
  fy: number,
  ratio: number = ART_RATIO,
): { x: number; y: number } {
  const boxW = fig.width;
  const boxH = fig.height * IMG_H_FACTOR;
  let iw = boxW;
  let ih = boxW / ratio;
  if (ih < boxH) {
    ih = boxH;
    iw = boxH * ratio;
  }
  // "slice" centres the frame in the box.
  const ox = (boxW - iw) * 0.5;
  const oy = (boxH - ih) * 0.5;
  return { x: ox + fx * iw, y: oy + fy * ih };
}

/**
 * THE ROAD — the main character. One line crossing the whole journey:
 * it traces the painted road inside every painting (dissolving there, so the
 * artwork carries it), re-emerges where the paint leaves the frame, passes
 * beneath the chapter words, and ends inside Amman. The traveler is a comet
 * of light locked to the reader's eyeline; a trailing ember follows it.
 * After the arch, the whole night warms (--warmth 0→1 on the root).
 */
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
  const trailRef = useRef<HTMLDivElement>(null);
  const maskBaseRef = useRef<SVGRectElement>(null);
  const maskScenesRef = useRef<SVGGElement>(null);
  const cache = useRef<{
    total: number;
    anchors: Anchor[];
    gatewayLen: number;
    sampled: { l: number; y: number }[];
    roadTop: number;
    markers: HTMLElement[];
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

  // --- The road engine.
  useGSAP(
    () => {
      const road = roadRef.current;
      const svg = svgRef.current;
      const path = pathRef.current;
      const glow = glowRef.current;
      const haze = hazeRef.current;
      const lead = leadRef.current;
      const traveler = travelerRef.current;
      const trail = trailRef.current;
      if (!road || !svg || !path || !glow || !haze || !lead || !traveler || !trail) return;

      const strokes = [path, glow, haze];
      const markerEls = () =>
        Array.from(road.querySelectorAll<HTMLElement>("[data-marker]"));

      const buildPath = () => {
        const markers = markerEls();
        if (markers.length === 0) return;

        const roadRect = road.getBoundingClientRect();
        const W = road.clientWidth;
        const H = road.clientHeight;
        const isMobile = window.matchMedia("(max-width: 767px)").matches;

        const cx = W / 2;
        const ampSmall = isMobile ? 20 : 80;
        const clampX = (x: number) => Math.max(28, Math.min(W - 28, x));

        const pts: { x: number; y: number }[] = [];
        const anchors: Anchor[] = [];
        const sceneRects: { top: number; h: number }[] = [];

        const roadOf = (el: HTMLElement) => {
          const id = el.dataset.sceneId as keyof typeof SCENE_ROADS_ART | undefined;
          return id ? SCENE_ROADS_ART[id] : null;
        };

        // The line begins where the hero scene's road crosses its bottom edge.
        let startX = cx;
        const heroFig = document.querySelector<HTMLElement>(".hero__scene");
        const heroRoad = heroFig && roadOf(heroFig);
        if (heroFig && heroRoad) {
          const hr = heroFig.getBoundingClientRect();
          startX = clampX(
            hr.left - roadRect.left + scenePoint(hr, heroRoad.exit, 1).x,
          );
        }
        pts.push({ x: startX, y: 0 });

        const els = Array.from(
          road.querySelectorAll<HTMLElement>("[data-scene], [data-marker]"),
        );
        let pendingExitX: number | null = null;
        let lastWasMarker = false;
        let bulgeSide = 1;

        for (const el of els) {
          if (el.hasAttribute("data-scene")) {
            const meta = roadOf(el);
            const fr = el.getBoundingClientRect();
            const fx0 = fr.left - roadRect.left;
            const fy0 = fr.top - roadRect.top;
            if (meta) {
              const eP = scenePoint(fr, meta.entry[0], meta.entry[1]);
              const entryX = clampX(fx0 + eP.x);
              // Enter every scene near-vertically: the sideways swing
              // happens over the text zone above it.
              const prevY = pts[pts.length - 1].y;
              const preY = fy0 - (isMobile ? 80 : 140);
              if (preY > prevY + 60) pts.push({ x: entryX, y: preY });
              pts.push({ x: entryX, y: fy0 + Math.max(24, eP.y) });
              for (const [mx, my] of meta.mids ?? []) {
                const mP = scenePoint(fr, mx, my);
                pts.push({ x: clampX(fx0 + mP.x), y: fy0 + mP.y });
              }
              pendingExitX = clampX(fx0 + scenePoint(fr, meta.exit, 1).x);
              pts.push({ x: pendingExitX, y: fy0 + fr.height });
              sceneRects.push({ top: fy0, h: fr.height });
            }
            lastWasMarker = false;
          } else {
            el.style.transform =
              pendingExitX != null
                ? `translateX(${(pendingExitX - cx).toFixed(1)}px)`
                : "";
            const r = el.getBoundingClientRect();
            const mx = r.left - roadRect.left + r.width / 2;
            const my = r.top - roadRect.top + r.height / 2;
            if (lastWasMarker) {
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
        // The path FINISHES on the last node — inside Amman.

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
        const SAMPLES = 700;
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

        const seg = isMobile ? 90 : 150;
        lead.style.strokeDasharray = `${seg} ${total}`;
        lead.style.strokeDashoffset = `${seg - gatewayLen}`;
        lead.style.opacity = "0";

        // Mask: inside each painting the stroke dissolves — the paint carries it.
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
          markers,
        };
      };

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

      // Trailing ember follows the traveler with an eased lag — a comet.
      const trailTo = {
        x: gsap.quickTo(trail, "x", { duration: 0.5, ease: "power2.out" }),
        y: gsap.quickTo(trail, "y", { duration: 0.5, ease: "power2.out" }),
      };

      const applyDraw = (drawn: number) => {
        const c = cache.current;
        if (!c) return;
        strokes.forEach((p) => {
          p.style.strokeDashoffset = `${c.total - drawn}`;
        });
        const pt = path.getPointAtLength(drawn);
        gsap.set(traveler, { x: pt.x, y: pt.y, xPercent: -50, yPercent: -50 });
        trailTo.x(pt.x);
        trailTo.y(pt.y);
        // The traveler dissolves into Amman at the very end of the road.
        const endFade = gsap.utils.clamp(
          0,
          1,
          (c.total - drawn) / Math.max(1, c.total * 0.015),
        );
        traveler.style.opacity = String(endFade);
        trail.style.opacity = String(endFade * 0.8);
        c.anchors.forEach((a, i) => {
          c.markers[i]?.classList.toggle("is-active", drawn >= a.len - 1);
        });
      };

      /** The draw head IS the middle of the screen — the light is always
       *  exactly where the reader is looking. */
      const drawAtViewport = () => {
        const c = cache.current;
        if (!c) return;
        applyDraw(lengthAtY(window.scrollY + window.innerHeight * 0.5 - c.roadTop));
      };

      // ---- Reduced motion: complete experience, no scrub. ----
      if (reduced) {
        buildPath();
        const c = cache.current;
        if (c) {
          strokes.forEach((p) => {
            p.style.strokeDashoffset = "0";
          });
          gsap.set([traveler, trail], { autoAlpha: 0 });
          markerEls().forEach((m) => m.classList.add("is-active"));
          document.documentElement.style.setProperty("--warmth", "1");
        }
        return;
      }

      document.documentElement.classList.add("has-motion");

      // ---- INK: every text block arrives like lines being written. ----
      const splits: SplitText[] = [];
      gsap.utils.toArray<HTMLElement>("[data-ink]").forEach((el) => {
        const split = new SplitText(el, {
          type: "lines",
          linesClass: "ink-line",
          mask: "lines",
        });
        splits.push(split);
        gsap.fromTo(
          split.lines,
          { yPercent: 115 },
          {
            yPercent: 0,
            duration: 0.9,
            ease: "power3.out",
            stagger: 0.09,
            scrollTrigger: { trigger: el, start: "top 86%", once: true },
          },
        );
      });

      // ---- CARVE: chapter words surface like inscriptions. ----
      gsap.utils.toArray<HTMLElement>("[data-carve]").forEach((el) => {
        gsap.fromTo(
          el,
          { autoAlpha: 0, letterSpacing: "0.08em" },
          {
            autoAlpha: 1,
            letterSpacing: "0em",
            duration: 1.4,
            ease: "power2.out",
            scrollTrigger: { trigger: el, start: "top 82%", once: true },
          },
        );
      });

      // ---- Written separators: hairlines draw themselves. ----
      gsap.utils.toArray<HTMLElement>(".craft__item").forEach((el) => {
        gsap.fromTo(
          el,
          { "--rule": "0%" },
          {
            "--rule": "100%",
            duration: 1.1,
            ease: "power2.inOut",
            scrollTrigger: { trigger: el, start: "top 88%", once: true },
          },
        );
      });

      // ---- Scenes: parallax drift only. ----
      gsap.utils.toArray<HTMLElement>("[data-scene]").forEach((fig) => {
        const img = fig.querySelector(".scene__img");
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

      // ---- Main draw, synced to the eyeline. ----
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

      // ---- THE CROSSING: past the arch, night turns to warmth. ----
      const crossing = road.querySelector<HTMLElement>(".chapter--crossing");
      if (crossing) {
        ScrollTrigger.create({
          trigger: crossing,
          start: "center center",
          endTrigger: road,
          end: "bottom bottom",
          scrub: true,
          onUpdate: (self) => {
            document.documentElement.style.setProperty(
              "--warmth",
              (self.progress * 0.9 + (self.progress > 0 ? 0.1 : 0)).toFixed(3),
            );
          },
        });
        // Lead glow brightens on approach to the arch.
        ScrollTrigger.create({
          trigger: crossing,
          start: "top 85%",
          end: "center 30%",
          scrub: true,
          onUpdate: (self) => {
            const tent = 1 - Math.abs(2 * self.progress - 1);
            lead.style.opacity = String(tent * 0.9);
            lead.style.strokeWidth = String(3 + tent * 5);
          },
        });
      }

      // ---- Figures count up when the road lights them (real numbers only). ----
      gsap.utils.toArray<HTMLElement>(".figures__n").forEach((el) => {
        const raw = el.textContent ?? "";
        const western = raw.replace(/[٠-٩]/g, (d) => String("٠١٢٣٤٥٦٧٨٩".indexOf(d)));
        const target = parseInt(western.replace(/\D/g, ""), 10);
        if (!target || Number.isNaN(target)) return; // placeholders stay untouched
        const suffix = /\+/.test(raw) ? "+" : "";
        const eastern = /[٠-٩]/.test(raw);
        const obj = { v: 0 };
        gsap.to(obj, {
          v: target,
          duration: 1.6,
          ease: "power2.out",
          scrollTrigger: { trigger: el, start: "top 85%", once: true },
          onUpdate: () => {
            let s = String(Math.round(obj.v));
            if (eastern) s = s.replace(/\d/g, (d) => "٠١٢٣٤٥٦٧٨٩"[Number(d)]);
            el.textContent = s + suffix;
          },
        });
      });

      buildPath();
      drawAtViewport();
      gsap.fromTo(
        traveler,
        { autoAlpha: 0, scale: 0.4 },
        { autoAlpha: 1, scale: 1, duration: 0.7, delay: 0.4, ease: "back.out(2)" },
      );

      if (document.fonts?.ready) {
        document.fonts.ready.then(() => ScrollTrigger.refresh());
      }

      return () => splits.forEach((s) => s.revert());
    },
    { scope: roadRef, dependencies: [locale, reduced] },
  );

  const chapters = content[locale].chapters;

  return (
    <section
      id="road"
      ref={roadRef}
      className="road"
      aria-label={content[locale].ui.progressAria}
    >
      <div className="road__channel" aria-hidden="true">
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
        <div ref={trailRef} className="traveler-trail" aria-hidden="true" />
        <Traveler ref={travelerRef} />
      </div>

      <div className="chapters">
        {chapters.map((ch) => (
          <Chapter key={ch.key} chapter={ch} />
        ))}
      </div>
    </section>
  );
}
