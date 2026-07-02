"use client";

import { useEffect, useRef, useState } from "react";
import type { Scene } from "@/lib/content";
import { coverTransform } from "@/lib/roadPath";
import { useReducedMotion } from "@/lib/useReducedMotion";

const PAPERS = "/assets/sprite-papers/sprite-papers-720.webp";

/** Image-space anchors (1672×941) for the living elements of each scene:
 *  window/lamp flickers, teapot steam, breathing spotlight, sun pulse. */
const ANCHORS: Record<
  string,
  { kind: "flicker" | "steam" | "spot"; x: number; y: number; r: number }[]
> = {
  childhood: [{ kind: "flicker", x: 628, y: 650, r: 65 }],
  station: [
    { kind: "steam", x: 573, y: 585, r: 30 },
    { kind: "flicker", x: 312, y: 430, r: 46 },
    { kind: "flicker", x: 585, y: 545, r: 120 },
  ],
  training: [
    { kind: "flicker", x: 1102, y: 400, r: 52 },
    { kind: "spot", x: 1190, y: 520, r: 300 },
  ],
  dawn: [{ kind: "spot", x: 906, y: 242, r: 240 }],
  arrival: [
    { kind: "flicker", x: 260, y: 545, r: 55 },
    { kind: "flicker", x: 1330, y: 500, r: 55 },
    { kind: "flicker", x: 700, y: 480, r: 45 },
  ],
};

/** Live overlays: positioned via the same cover transform the line uses, so
 *  a glow stays on its painted window at every viewport. */
export function LiveBits({ scene }: { scene: Scene }) {
  const reduced = useReducedMotion();
  const ref = useRef<HTMLDivElement>(null);
  const [box, setBox] = useState<{ s: number; ox: number; oy: number } | null>(
    null,
  );

  const [portraitMode, setPortraitMode] = useState(false);
  useEffect(() => {
    const mq = window.matchMedia("(max-aspect-ratio: 4/5)");
    const update = () => setPortraitMode(mq.matches);
    update();
    mq.addEventListener("change", update);
    return () => mq.removeEventListener("change", update);
  }, []);

  // Anchor coords live in the landscape frame — a portrait variant is a
  // different composition, so anchored bits stand down there.
  const anchors =
    scene.asset.portrait && portraitMode ? undefined : ANCHORS[scene.key];
  const papers = scene.live?.includes("papers");
  const cityLights = scene.live?.includes("cityLights");

  useEffect(() => {
    const el = ref.current?.parentElement;
    if (!el) return;
    const measure = () => {
      const r = el.getBoundingClientRect();
      setBox(coverTransform(1672, 941, r.width, r.height));
    };
    measure();
    const ro = new ResizeObserver(measure);
    ro.observe(el);
    return () => ro.disconnect();
  }, []);

  if (reduced) return <div ref={ref} className="livebits" aria-hidden />;

  return (
    <div ref={ref} className="livebits" aria-hidden>
      {box &&
        anchors?.map((a, i) => {
          const style = {
            left: `${box.ox + a.x * box.s}px`,
            top: `${box.oy + a.y * box.s}px`,
            width: `${a.r * 2 * box.s}px`,
            height: `${a.r * 2 * box.s}px`,
            animationDelay: `${(i * 0.9) % 2.7}s`,
          };
          if (a.kind === "steam") {
            return (
              <span key={i} className="live-steam" style={style}>
                <i />
                <i />
                <i />
              </span>
            );
          }
          return (
            <span
              key={i}
              className={a.kind === "spot" ? "live-spot" : "live-flicker"}
              style={style}
            />
          );
        })}

      {papers && (
        <>
          <span
            className="live-papers live-papers--a"
            style={{ backgroundImage: `url(${PAPERS})` }}
          />
          <span
            className="live-papers live-papers--b"
            style={{ backgroundImage: `url(${PAPERS})` }}
          />
        </>
      )}

      {cityLights && <CityShimmer />}
    </div>
  );
}

/** Cheap canvas shimmer over Amman's window band. */
function CityShimmer() {
  const ref = useRef<HTMLCanvasElement>(null);
  useEffect(() => {
    const canvas = ref.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;
    let seed = 97;
    const rand = () => {
      seed = (seed * 16807) % 2147483647;
      return seed / 2147483647;
    };
    const dots = Array.from({ length: 90 }, () => ({
      x: rand(),
      y: 0.42 + rand() * 0.34, // the painted city band
      r: 0.8 + rand() * 1.4,
      phase: rand() * Math.PI * 2,
      speed: 0.5 + rand() * 1.4,
    }));
    let w = 0;
    let h = 0;
    const resize = () => {
      const r = canvas.parentElement!.getBoundingClientRect();
      w = r.width;
      h = r.height;
      canvas.width = w;
      canvas.height = h;
    };
    resize();
    const ro = new ResizeObserver(resize);
    ro.observe(canvas.parentElement!);
    let raf = 0;
    let last = 0;
    const loop = (t: number) => {
      raf = requestAnimationFrame(loop);
      if (t - last < 1000 / 30) return; // 30fps is plenty for shimmer
      last = t;
      ctx.clearRect(0, 0, w, h);
      for (const d of dots) {
        const a = 0.1 + 0.22 * (0.5 + 0.5 * Math.sin(d.phase + t * 0.0012 * d.speed));
        ctx.globalAlpha = a;
        ctx.fillStyle = "#f2cb74";
        ctx.beginPath();
        ctx.arc(d.x * w, d.y * h, d.r, 0, Math.PI * 2);
        ctx.fill();
      }
      ctx.globalAlpha = 1;
    };
    raf = requestAnimationFrame(loop);
    const onVis = () => {
      cancelAnimationFrame(raf);
      if (!document.hidden) raf = requestAnimationFrame(loop);
    };
    document.addEventListener("visibilitychange", onVis);
    return () => {
      cancelAnimationFrame(raf);
      ro.disconnect();
      document.removeEventListener("visibilitychange", onVis);
    };
  }, []);
  return <canvas ref={ref} className="live-city" />;
}
