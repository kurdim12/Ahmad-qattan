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
import { Traveler } from "./Traveler";

gsap.registerPlugin(ScrollTrigger);

interface Anchor {
  x: number;
  y: number;
  gateway: boolean;
  len: number;
}

export function RoadJourney() {
  const { locale, dir } = useLocale();
  const reduced = useReducedMotion();

  const roadRef = useRef<HTMLDivElement>(null);
  const svgRef = useRef<SVGSVGElement>(null);
  const pathRef = useRef<SVGPathElement>(null);
  const leadRef = useRef<SVGPathElement>(null);
  const travelerRef = useRef<HTMLDivElement>(null);
  const cache = useRef<{ total: number; anchors: Anchor[]; gatewayLen: number } | null>(null);

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
      const lead = leadRef.current;
      const traveler = travelerRef.current;
      if (!road || !svg || !path || !lead || !traveler) return;

      const markerEls = () =>
        Array.from(road.querySelectorAll<HTMLElement>("[data-marker]"));

      /** Build the winding SVG path from the live marker positions. */
      const buildPath = () => {
        const markers = markerEls();
        if (markers.length === 0) return;

        const roadRect = road.getBoundingClientRect();
        const W = road.clientWidth;
        const H = road.clientHeight;
        const isMobile = window.matchMedia("(max-width: 767px)").matches;

        const anchors: Anchor[] = markers.map((m) => {
          const r = m.getBoundingClientRect();
          return {
            x: r.left - roadRect.left + r.width / 2,
            y: r.top - roadRect.top + r.height / 2,
            gateway: m.hasAttribute("data-gateway"),
            len: 0,
          };
        });

        const cx = anchors[0].x; // markers share the channel/rail axis
        const amp = isMobile ? 14 : 34; // ≤ channel/2 (48) so the line stays in-channel
        const lead0 = isMobile ? 40 : 64;

        // Node list: centreline anchors with alternating bulges between them.
        const pts: { x: number; y: number }[] = [];
        pts.push({ x: cx, y: Math.max(0, anchors[0].y - lead0) });
        for (let i = 0; i < anchors.length; i++) {
          pts.push({ x: cx, y: anchors[i].y });
          if (i < anchors.length - 1) {
            const ymid = (anchors[i].y + anchors[i + 1].y) / 2;
            const side = isMobile ? (dir === "rtl" ? -1 : 1) : i % 2 === 0 ? 1 : -1;
            pts.push({ x: cx + side * amp, y: ymid });
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
        path.setAttribute("d", d);
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

        path.style.strokeDasharray = `${total}`;
        path.style.strokeDashoffset = `${total}`;

        // Lead glow: a bright segment ending at the gateway, faded in on approach.
        const seg = isMobile ? 90 : 150;
        lead.style.strokeDasharray = `${seg} ${total}`;
        lead.style.strokeDashoffset = `${seg - gatewayLen}`;
        lead.style.opacity = "0";

        cache.current = { total, anchors, gatewayLen };
      };

      /** Apply the drawn fraction: reveal stroke, ride the traveler, light markers. */
      const applyDraw = (progress: number) => {
        const c = cache.current;
        if (!c) return;
        const drawn = progress * c.total;
        path.style.strokeDashoffset = `${c.total - drawn}`;
        const pt = path.getPointAtLength(drawn);
        gsap.set(traveler, { x: pt.x, y: pt.y, xPercent: -50, yPercent: -50 });
        const markers = markerEls();
        c.anchors.forEach((a, i) => {
          markers[i]?.classList.toggle("is-active", drawn >= a.len - 1);
        });
      };

      // ---- Reduced motion: show the finished road, everything lit, no scrub. ----
      if (reduced) {
        buildPath();
        const c = cache.current;
        if (c) {
          path.style.strokeDashoffset = "0";
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

      // Main draw: scrubbed. End is the LAST marker (not the road bottom, which
      // a short footer can't push to centre) so the line + traveler always reach
      // and finish on the final number. 80% keeps it within reachable scroll.
      const lastMarkerEl = markerEls().at(-1) ?? road;
      ScrollTrigger.create({
        trigger: road,
        start: "top center",
        endTrigger: lastMarkerEl,
        end: "center 80%",
        scrub: true,
        invalidateOnRefresh: true,
        onRefresh: buildPath,
        onUpdate: (self) => applyDraw(self.progress),
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
      applyDraw(0);
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
    { scope: roadRef, dependencies: [locale, reduced, dir] },
  );

  // ---- Render: stops mapped to Stop / GatewayStop with numbering + alternation.
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
        <svg ref={svgRef} className="road__svg" preserveAspectRatio="none">
          <defs>
            <linearGradient id="roadGrad" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0" stopColor="#34300F" />
              <stop offset="0.55" stopColor="#8A7A2E" />
              <stop offset="1" stopColor="#B7A441" />
            </linearGradient>
            <filter id="roadGlow" x="-50%" y="-50%" width="200%" height="200%">
              <feGaussianBlur stdDeviation="3.5" />
            </filter>
          </defs>
          <path ref={pathRef} className="road__path" stroke="url(#roadGrad)" fill="none" />
          <path ref={leadRef} className="road__lead" stroke="#DED39A" fill="none" filter="url(#roadGlow)" />
        </svg>
        <Traveler ref={travelerRef} />
      </div>

      <ol className="stops">
        {stops.map((stop) => {
          if ("type" in stop && stop.type === "gateway") {
            return <GatewayStop key={stop.key} stop={stop} />;
          }
          n += 1;
          const side = n % 2 === 1 ? "start" : "end";
          return (
            <Stop
              key={stop.key}
              stop={stop}
              number={formatStopNumber(n, locale)}
              side={side}
            />
          );
        })}
      </ol>
    </section>
  );
}
