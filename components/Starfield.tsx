"use client";

import { useEffect, useRef } from "react";
import { useReducedMotion } from "@/lib/useReducedMotion";

/**
 * The living night: a fixed canvas of faint stars (two depth layers, slow
 * twinkle) and a handful of drifting dust motes low in the frame. Deliberately
 * quiet — atmosphere, not spectacle. Skipped entirely under reduced motion
 * (a static, non-animated pass is painted once instead).
 */
export function Starfield() {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const reduced = useReducedMotion();

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    let raf = 0;
    let running = true;
    const DPR = Math.min(window.devicePixelRatio || 1, 2);

    interface Star { x: number; y: number; r: number; base: number; phase: number; speed: number; }
    interface Mote { x: number; y: number; r: number; vx: number; vy: number; a: number; }
    let stars: Star[] = [];
    let motes: Mote[] = [];

    const seed = (w: number, h: number) => {
      const count = Math.min(90, Math.round((w * h) / 22000));
      stars = Array.from({ length: count }, () => ({
        x: Math.random() * w,
        y: Math.random() * h * 0.85,
        r: Math.random() < 0.75 ? 0.7 : 1.2,
        base: 0.12 + Math.random() * 0.4,
        phase: Math.random() * Math.PI * 2,
        speed: 0.2 + Math.random() * 0.5,
      }));
      motes = Array.from({ length: 14 }, () => ({
        x: Math.random() * w,
        y: h * (0.55 + Math.random() * 0.45),
        r: 0.6 + Math.random() * 1.1,
        vx: (Math.random() - 0.5) * 0.08,
        vy: -(0.02 + Math.random() * 0.05),
        a: 0.05 + Math.random() * 0.12,
      }));
    };

    const resize = () => {
      const w = window.innerWidth;
      const h = window.innerHeight;
      canvas.width = w * DPR;
      canvas.height = h * DPR;
      ctx.setTransform(DPR, 0, 0, DPR, 0, 0);
      seed(w, h);
      if (reduced) paint(0); // single static frame
    };

    const paint = (t: number) => {
      const w = window.innerWidth;
      const h = window.innerHeight;
      ctx.clearRect(0, 0, w, h);
      for (const s of stars) {
        const tw = reduced ? 1 : 0.65 + 0.35 * Math.sin(s.phase + t * 0.001 * s.speed);
        ctx.globalAlpha = s.base * tw;
        ctx.fillStyle = "#f4e9cd";
        ctx.beginPath();
        ctx.arc(s.x, s.y, s.r, 0, Math.PI * 2);
        ctx.fill();
      }
      if (!reduced) {
        for (const m of motes) {
          m.x += m.vx;
          m.y += m.vy;
          if (m.y < h * 0.4 || m.x < -4 || m.x > w + 4) {
            m.x = Math.random() * w;
            m.y = h * (0.8 + Math.random() * 0.2);
          }
          ctx.globalAlpha = m.a;
          ctx.fillStyle = "#e8c98a";
          ctx.beginPath();
          ctx.arc(m.x, m.y, m.r, 0, Math.PI * 2);
          ctx.fill();
        }
      }
      ctx.globalAlpha = 1;
    };

    const loop = (t: number) => {
      if (!running) return;
      paint(t);
      raf = requestAnimationFrame(loop);
    };

    resize();
    window.addEventListener("resize", resize);
    if (!reduced) {
      raf = requestAnimationFrame(loop);
      const onVis = () => {
        running = document.visibilityState === "visible";
        if (running) raf = requestAnimationFrame(loop);
        else cancelAnimationFrame(raf);
      };
      document.addEventListener("visibilitychange", onVis);
      return () => {
        running = false;
        cancelAnimationFrame(raf);
        window.removeEventListener("resize", resize);
        document.removeEventListener("visibilitychange", onVis);
      };
    }
    return () => window.removeEventListener("resize", resize);
  }, [reduced]);

  return <canvas ref={canvasRef} className="starfield" aria-hidden="true" />;
}
