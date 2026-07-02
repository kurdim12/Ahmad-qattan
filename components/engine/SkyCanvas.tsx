"use client";

import { useEffect, useRef } from "react";
import { useReducedMotion } from "@/lib/useReducedMotion";

/** Deterministic PRNG so the sky is stable across renders. */
function mulberry32(seed: number) {
  return () => {
    seed |= 0;
    seed = (seed + 0x6d2b79f5) | 0;
    let t = Math.imul(seed ^ (seed >>> 15), 1 | seed);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

const STAR_COUNT = 110;
const DUST_COUNT = 34;
const FRAME_MS = 1000 / 45; // ~45fps cap

/**
 * The living sky: twinkling stars + drifting gold dust over the whole
 * viewport. Proof of continuity in the void gaps, atmosphere over frames.
 * Eases out during the dawn inversion. Pauses when the tab hides.
 */
export function SkyCanvas() {
  const ref = useRef<HTMLCanvasElement>(null);
  const reduced = useReducedMotion();

  useEffect(() => {
    const canvas = ref.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    const rand = mulberry32(20260703);
    const stars = Array.from({ length: STAR_COUNT }, () => ({
      x: rand(),
      y: rand() * 0.9,
      r: 0.5 + rand() * 1.1,
      phase: rand() * Math.PI * 2,
      speed: 0.4 + rand() * 1.1,
      warm: rand() < 0.3,
    }));
    const dust = Array.from({ length: DUST_COUNT }, () => ({
      x: rand(),
      y: rand(),
      r: 0.8 + rand() * 1.6,
      vy: 0.006 + rand() * 0.012, // upward drift, viewport-fractions/s
      sway: 6 + rand() * 18,
      phase: rand() * Math.PI * 2,
      a: 0.08 + rand() * 0.16,
    }));

    let w = 0;
    let h = 0;
    let dpr = 1;
    const resize = () => {
      dpr = Math.min(2, window.devicePixelRatio || 1);
      w = window.innerWidth;
      h = window.innerHeight;
      canvas.width = Math.round(w * dpr);
      canvas.height = Math.round(h * dpr);
      canvas.style.width = `${w}px`;
      canvas.style.height = `${h}px`;
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    };
    resize();

    let dawnMix = 0;
    let dawnTarget = document.documentElement.classList.contains("is-dawn")
      ? 1
      : 0;
    const mo = new MutationObserver(() => {
      dawnTarget = document.documentElement.classList.contains("is-dawn")
        ? 1
        : 0;
    });
    mo.observe(document.documentElement, {
      attributes: true,
      attributeFilter: ["class"],
    });

    const draw = (t: number) => {
      ctx.clearRect(0, 0, w, h);
      dawnMix += (dawnTarget - dawnMix) * 0.04;
      const night = 1 - dawnMix;

      if (night > 0.02) {
        for (const s of stars) {
          const tw = 0.35 + 0.65 * (0.5 + 0.5 * Math.sin(s.phase + t * 0.001 * s.speed));
          ctx.globalAlpha = 0.5 * tw * night;
          ctx.fillStyle = s.warm ? "#f2cb74" : "#ede3cf";
          ctx.beginPath();
          ctx.arc(s.x * w, s.y * h, s.r, 0, Math.PI * 2);
          ctx.fill();
        }
      }

      for (const m of dust) {
        const y = ((m.y - ((t * 0.001 * m.vy) % 1)) % 1 + 1) % 1;
        const x = m.x * w + Math.sin(m.phase + t * 0.0004) * m.sway;
        ctx.globalAlpha = m.a * (0.6 + 0.4 * night);
        ctx.fillStyle = "#d2a64b";
        ctx.beginPath();
        ctx.arc(x, y * h, m.r, 0, Math.PI * 2);
        ctx.fill();
      }
      ctx.globalAlpha = 1;
    };

    if (reduced) {
      draw(4200); // one static frame
      window.addEventListener("resize", () => {
        resize();
        draw(4200);
      });
      return () => mo.disconnect();
    }

    let raf = 0;
    let last = 0;
    let running = true;
    const loop = (t: number) => {
      raf = requestAnimationFrame(loop);
      if (t - last < FRAME_MS) return;
      last = t;
      draw(t);
    };
    raf = requestAnimationFrame(loop);

    const onVis = () => {
      if (document.hidden) {
        cancelAnimationFrame(raf);
        running = false;
      } else if (!running) {
        running = true;
        raf = requestAnimationFrame(loop);
      }
    };
    document.addEventListener("visibilitychange", onVis);
    window.addEventListener("resize", resize);
    return () => {
      cancelAnimationFrame(raf);
      mo.disconnect();
      document.removeEventListener("visibilitychange", onVis);
      window.removeEventListener("resize", resize);
    };
  }, [reduced]);

  return <canvas ref={ref} className="sky-canvas" aria-hidden />;
}
