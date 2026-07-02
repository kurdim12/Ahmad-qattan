"use client";

import { useEffect, useRef, type CSSProperties, type ReactNode } from "react";
import { gsap } from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import type { Scene } from "@/lib/content";
import { useLocale } from "@/lib/locale";
import { useReducedMotion } from "@/lib/useReducedMotion";
import { LiveBits } from "./LiveBits";

gsap.registerPlugin(ScrollTrigger);

/** Per-scene fusion mask + framing. The mask is what turns a painted frame
 *  into a piece of the page — no edge may ever survive. */
interface Fusion {
  wide?: { top: number; bottom: number };
  radial?: { size: string; at: string; solid: number; fade: number };
  box?: { top: number; bottom: number; side: number };
  tall?: boolean;
}

const LANDSCAPE_W = [720, 1280];
const PORTRAIT_W = [540, 900];

/** "/assets/source/scene-01-world.png" → "scene-01-world" */
const assetName = (p?: string) =>
  p ? p.split("/").pop()!.replace(/\.\w+$/, "") : undefined;

const srcset = (name: string, ext: string, widths: number[]) =>
  widths
    .map((w) => `/assets/${name}/${name}-${w}.${ext} ${w}w`)
    .join(", ");

const FUSION: Record<string, Fusion> = {
  world: { wide: { top: 10, bottom: 86 }, tall: true },
  childhood: { box: { top: 30, bottom: 82, side: 16 } },
  station: { wide: { top: 14, bottom: 78 } },
  word: { wide: { top: 12, bottom: 84 } },
  training: { wide: { top: 14, bottom: 84 } },
  fork: { box: { top: 22, bottom: 88, side: 12 }, tall: true },
  dawn: { wide: { top: 12, bottom: 84 } },
  today: { wide: { top: 16, bottom: 86 } },
  arrival: { wide: { top: 12, bottom: 88 }, tall: true },
};

export function SceneShell({
  scene,
  index,
  children,
  overlay,
}: {
  scene: Scene;
  index: number;
  children?: ReactNode;
  /** Rendered outside the animated card (absolute against the section). */
  overlay?: ReactNode;
}) {
  const { locale } = useLocale();
  const reduced = useReducedMotion();
  const ref = useRef<HTMLElement>(null);
  const bgRef = useRef<HTMLImageElement>(null);
  const fgRef = useRef<HTMLDivElement>(null);
  const cardRef = useRef<HTMLDivElement>(null);

  const fusion = FUSION[scene.key] ?? { wide: { top: 12, bottom: 85 } };
  const baseName = assetName(scene.asset.base)!;
  const portraitName = assetName(scene.asset.portrait);
  const fgName = assetName(scene.asset.fg);

  // Parallax (bg 0.95x, fg 1.1x + mouse) and card reveal at light arrival.
  useEffect(() => {
    if (reduced) return;
    const section = ref.current;
    if (!section) return;
    let ctx: gsap.Context | undefined;
    // Defer trigger creation out of the hydration flush (9 scenes at once
    // would otherwise form one long task).
    const initId = window.setTimeout(() => {
    ctx = gsap.context(() => {
      if (bgRef.current) {
        gsap.fromTo(
          bgRef.current,
          { yPercent: -3.5 },
          {
            yPercent: 3.5,
            ease: "none",
            scrollTrigger: {
              trigger: section,
              start: "top bottom",
              end: "bottom top",
              scrub: true,
            },
          },
        );
      }
      if (fgRef.current) {
        gsap.fromTo(
          fgRef.current,
          { yPercent: 5.5 },
          {
            yPercent: -5.5,
            ease: "none",
            scrollTrigger: {
              trigger: section,
              start: "top bottom",
              end: "bottom top",
              scrub: true,
            },
          },
        );
      }
      if (cardRef.current) {
        gsap.fromTo(
          cardRef.current,
          { autoAlpha: 0, y: 34 },
          {
            autoAlpha: 1,
            y: 0,
            ease: "none",
            scrollTrigger: {
              trigger: section,
              start: "center 82%",
              end: "center 58%",
              scrub: true,
            },
          },
        );
      }
    }, section);
    }, 0);

    // fg mouse drift ±6px — transform only, lerped.
    let raf = 0;
    let tx = 0;
    let ty = 0;
    let cx = 0;
    let cy = 0;
    const inner = fgRef.current?.firstElementChild as HTMLElement | null;
    const onMove = (e: PointerEvent) => {
      if (e.pointerType !== "mouse") return;
      tx = (e.clientX / window.innerWidth - 0.5) * 12;
      ty = (e.clientY / window.innerHeight - 0.5) * 12;
      if (!raf && inner) raf = requestAnimationFrame(tick);
    };
    const tick = () => {
      raf = 0;
      cx += (tx - cx) * 0.08;
      cy += (ty - cy) * 0.08;
      if (inner) inner.style.transform = `translate3d(${cx}px, ${cy}px, 0)`;
      if (Math.abs(tx - cx) > 0.1 || Math.abs(ty - cy) > 0.1) {
        raf = requestAnimationFrame(tick);
      }
    };
    if (inner) window.addEventListener("pointermove", onMove, { passive: true });
    return () => {
      clearTimeout(initId);
      ctx?.revert();
      window.removeEventListener("pointermove", onMove);
      cancelAnimationFrame(raf);
    };
  }, [reduced, scene.key]);

  const maskStyle: CSSProperties & Record<string, string> = {};
  let fuseClass = "fuse-wide";
  if (fusion.radial) {
    fuseClass = "fuse";
    maskStyle["--fuse-size"] = fusion.radial.size;
    maskStyle["--fuse-at"] = fusion.radial.at;
    maskStyle["--fuse-solid"] = `${fusion.radial.solid}%`;
    maskStyle["--fuse-fade"] = `${fusion.radial.fade}%`;
  } else if (fusion.box) {
    fuseClass = "fuse-box";
    maskStyle["--fuse-top"] = `${fusion.box.top}%`;
    maskStyle["--fuse-bottom"] = `${fusion.box.bottom}%`;
    maskStyle["--fuse-side"] = `${fusion.box.side}%`;
  } else if (fusion.wide) {
    maskStyle["--fuse-top"] = `${fusion.wide.top}%`;
    maskStyle["--fuse-bottom"] = `${fusion.wide.bottom}%`;
  }
  if (scene.asset.grade) maskStyle["--grade"] = scene.asset.grade;

  const kiteBob = !reduced && scene.live?.includes("kite");

  return (
    <section
      ref={ref}
      data-scene-key={scene.key}
      className={`scene scene--${scene.key}${fusion.tall ? " scene--tall" : ""}`}
      aria-label={scene.title[locale]}
    >
      <div className={`scene__frame ${fuseClass}`} style={maskStyle}>
        {/* Base frame from the derivative pipeline: AVIF → WebP → JPEG,
            portrait variant swapping in below 4/5 aspect. */}
        <picture>
          {portraitName && (
            <>
              <source
                media="(max-aspect-ratio: 4/5)"
                type="image/avif"
                srcSet={srcset(portraitName, "avif", PORTRAIT_W)}
                sizes="100vw"
              />
              <source
                media="(max-aspect-ratio: 4/5)"
                type="image/webp"
                srcSet={srcset(portraitName, "webp", PORTRAIT_W)}
                sizes="100vw"
              />
              <source
                media="(max-aspect-ratio: 4/5)"
                srcSet={srcset(portraitName, "jpg", PORTRAIT_W)}
                sizes="100vw"
              />
            </>
          )}
          <source
            type="image/avif"
            srcSet={srcset(baseName, "avif", LANDSCAPE_W)}
            sizes="100vw"
          />
          <source
            type="image/webp"
            srcSet={srcset(baseName, "webp", LANDSCAPE_W)}
            sizes="100vw"
          />
          <img
            ref={bgRef}
            className="scene__media"
            src={`/assets/${baseName}/${baseName}-1280.jpg`}
            srcSet={srcset(baseName, "jpg", LANDSCAPE_W)}
            sizes="100vw"
            alt=""
            draggable={false}
            loading={index === 0 ? "eager" : "lazy"}
            fetchPriority={index === 0 ? "high" : "auto"}
            decoding="async"
          />
        </picture>
        {fgName && (
          <div ref={fgRef} className="scene__fg-wrap" aria-hidden>
            <picture>
              <source
                type="image/webp"
                srcSet={srcset(fgName, "webp", LANDSCAPE_W)}
                sizes="60vw"
              />
              <img
                className={`scene__media scene__media--fg${kiteBob ? " scene__media--bob" : ""}`}
                src={`/assets/${fgName}/${fgName}-1280.png`}
                alt=""
                draggable={false}
                loading="lazy"
                decoding="async"
              />
            </picture>
          </div>
        )}
      </div>

      <LiveBits scene={scene} />

      <div ref={cardRef} className="scene__card">
        <p className="eyebrow">
          {index === 0
            ? "KM 00 — THE NIGHT ROAD"
            : `KM ${String(scene.km).padStart(2, "0")} — CH.${String(index).padStart(2, "0")}`}
        </p>
        {index === 0 ? (
          <h1 className="title scene__title scene__title--name">
            {scene.title[locale]}
          </h1>
        ) : (
          <h2 className="title scene__title">{scene.title[locale]}</h2>
        )}
        {scene.body?.map((b, i) => (
          <p key={i} className="scene__body">
            {b[locale]}
          </p>
        ))}
        {children}
      </div>
      {overlay}
    </section>
  );
}
