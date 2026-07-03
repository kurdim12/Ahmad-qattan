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
  const { locale } = useLocale();
  const reduced = useReducedMotion();

  const roadRef = useRef<HTMLDivElement>(null);
  const svgRef = useRef<SVGSVGElement>(null);
  const pathRef = useRef<SVGPathElement>(null);
  const glowRef = useRef<SVGPathElement>(null);
  const hazeRef = useRef<SVGPathElement>(null);
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
      const glow = glowRef.current;
      const haze = hazeRef.current;
      const lead = leadRef.current;
      const traveler = travelerRef.current;
      if (!road || !svg || !path || !glow || !haze || !lead || !traveler) return;

      const strokes = [path, glow, haze];
      const markerEls = () =>
        Array.from(road.querySelectorAll<HTMLElement>("[data-marker]"));

      /** Build the winding SVG path through the scenes and markers.
       *  The line runs down the page centre — the same axis the scene
       *  paintings' roads exit on — weaving gently between chapters so the
       *  painted road and the drawn line read as one continuous road. */
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

        const cx = W / 2; // markers sit on the page centre — so does the road
        const amp = isMobile ? 26 : Math.min(W * 0.14, 170);

        // Node list: centreline anchors with alternating bulges between them,
        // starting at the very top of the section (the road emerges from the
        // hero scene's feathered bottom edge).
        const pts: { x: number; y: number }[] = [];
        pts.push({ x: cx, y: 0 });
        for (let i = 0; i < anchors.length; i++) {
          pts.push({ x: cx, y: anchors[i].y });
          if (i < anchors.length - 1) {
            const ymid = (anchors[i].y + anchors[i + 1].y) / 2;
            const side = i % 2 === 0 ? 1 : -1;
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

        cache.current = { total, anchors, gatewayLen };
      };

      /** Apply the drawn fraction: reveal stroke, ride the traveler, light markers. */
      const applyDraw = (progress: number) => {
        const c = cache.current;
        if (!c) return;
        const drawn = progress * c.total;
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
          </defs>
          <path ref={hazeRef} className="road__haze" stroke="#f5a92c" fill="none" />
          <path ref={glowRef} className="road__glow" stroke="#ffb845" fill="none" />
          <path ref={pathRef} className="road__path" stroke="url(#roadGrad)" fill="none" />
          <path ref={leadRef} className="road__lead" stroke="#ffe9b0" fill="none" filter="url(#roadGlow)" />
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
