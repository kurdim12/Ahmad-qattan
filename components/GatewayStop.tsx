"use client";

import { useCallback, useRef } from "react";
import { gsap } from "gsap";
import type { Stop } from "@/lib/content";
import { content } from "@/lib/content";
import { useLocale } from "@/lib/locale";
import { useReducedMotion } from "@/lib/useReducedMotion";
import { PORTAL, PORTAL_VARIANT } from "@/lib/config";
import { Marker } from "./Marker";
import { ArrowForward } from "./icons";

type GatewayData = Extract<Stop, { type: "gateway" }>;

const isPlaceholderUrl = (url: string) => !url || url.startsWith("#");

export function GatewayStop({ stop }: { stop: GatewayData }) {
  const { locale, dir } = useLocale();
  const reduced = useReducedMotion();
  const ui = content[locale].ui;

  const btnRef = useRef<HTMLButtonElement>(null);
  const overlayRef = useRef<HTMLDivElement>(null);
  const irisRef = useRef<HTMLDivElement>(null);
  const curtainRef = useRef<HTMLDivElement>(null);
  const wordmarkRef = useRef<HTMLDivElement>(null);
  const runningRef = useRef(false);

  /** Open the external destination — new tab, hardened rel. Placeholder `#`
   *  stays a no-op so the threshold plays as a demo until the client adds a URL. */
  const navigate = useCallback(() => {
    if (isPlaceholderUrl(stop.url)) return;
    window.open(stop.url, "_blank", "noopener,noreferrer");
  }, [stop.url]);

  // --- Magnetic button (transform only; skipped for reduced motion / touch) ---
  const onMove = useCallback(
    (e: React.PointerEvent<HTMLButtonElement>) => {
      if (reduced || e.pointerType === "touch") return;
      const el = btnRef.current;
      if (!el) return;
      const r = el.getBoundingClientRect();
      const mx = e.clientX - (r.left + r.width / 2);
      const my = e.clientY - (r.top + r.height / 2);
      gsap.to(el, { x: mx * 0.25, y: my * 0.3, duration: 0.4, ease: "power3.out" });
    },
    [reduced],
  );
  const onLeave = useCallback(() => {
    if (btnRef.current) gsap.to(btnRef.current, { x: 0, y: 0, duration: 0.5, ease: "power3.out" });
  }, []);

  // --- The threshold: animate first, then navigate (brief §6B) ---
  const enter = useCallback(() => {
    // Reduced motion: no animation, just open the link.
    if (reduced) {
      navigate();
      return;
    }
    if (runningRef.current) return;
    const overlay = overlayRef.current;
    const wordmark = wordmarkRef.current;
    if (!overlay || !wordmark) return;
    runningRef.current = true;

    const useCurtain = PORTAL_VARIANT === "curtain" && curtainRef.current;
    const finish = () => {
      overlay.style.pointerEvents = "none";
      gsap.set(overlay, { autoAlpha: 0 }); // reset cleanly: opacity 0 + visibility hidden
      runningRef.current = false;
    };

    if (useCurtain) {
      const curtain = curtainRef.current!;
      const fromOrigin = dir === "rtl" ? "right center" : "left center";
      const toOrigin = dir === "rtl" ? "left center" : "right center";
      gsap
        .timeline({ onComplete: finish })
        .set(overlay, { autoAlpha: 1, pointerEvents: "auto" })
        .fromTo(
          curtain,
          { scaleX: 0, transformOrigin: fromOrigin },
          { scaleX: 1, duration: PORTAL.curtainSweep, ease: "power3.inOut" },
        )
        .fromTo(wordmark, { autoAlpha: 0, y: 12 }, { autoAlpha: 1, y: 0, duration: 0.3, ease: "power2.out" })
        .call(navigate)
        .to(wordmark, { autoAlpha: 0, duration: 0.25, ease: "power2.in" }, `+=${PORTAL.wordmarkHold}`)
        .set(curtain, { transformOrigin: toOrigin })
        .to(curtain, { scaleX: 0, duration: 0.5, ease: "power3.inOut" });
      return;
    }

    // Default: gold iris expands from the button centre.
    const iris = irisRef.current!;
    const r = (btnRef.current ?? overlay).getBoundingClientRect();
    const cx = r.left + r.width / 2;
    const cy = r.top + r.height / 2;
    const maxR = Math.hypot(
      Math.max(cx, window.innerWidth - cx),
      Math.max(cy, window.innerHeight - cy),
    );
    const state = { r: 0 };
    const applyClip = () => {
      iris.style.clipPath = `circle(${state.r}px at ${cx}px ${cy}px)`;
    };
    applyClip();

    gsap
      .timeline({ onComplete: finish })
      .set(overlay, { autoAlpha: 1, pointerEvents: "auto" })
      .set(state, { r: 0 })
      .to(state, { r: maxR, duration: PORTAL.irisOpen, ease: "power3.inOut", onUpdate: applyClip })
      .fromTo(wordmark, { autoAlpha: 0, y: 14 }, { autoAlpha: 1, y: 0, duration: 0.35, ease: "power2.out" }, "-=0.15")
      .call(navigate)
      .to(wordmark, { autoAlpha: 0, duration: 0.3, ease: "power2.in" }, `+=${PORTAL.wordmarkHold}`)
      .to(state, { r: 0, duration: PORTAL.irisClose, ease: "power3.inOut", onUpdate: applyClip }, "-=0.05");
  }, [reduced, dir, navigate]);

  return (
    <li data-stop data-gateway-stop className="stop stop--gateway is-gateway">
      <Marker gateway />

      <div className="gateway reveal-gateway">
        <span className="gateway__bloom" aria-hidden />
        <p className="gateway__station">{stop.station}</p>
        <h2 className="gateway__label">{stop.name}</h2>
        <p className="gateway__tag">{stop.tag}</p>
        <p className="gateway__body">{stop.body}</p>

        <div className="gateway__magnet">
          <button
            ref={btnRef}
            type="button"
            className="gateway__btn group"
            onPointerMove={onMove}
            onPointerLeave={onLeave}
            onClick={enter}
            aria-label={`${stop.cta} ${isPlaceholderUrl(stop.url) ? "" : ui.openExternal}`.trim()}
          >
            <span className="gateway__star" aria-hidden>
              ✦
            </span>
            {stop.cta}
            <span className="gateway__arrow" aria-hidden>
              <ArrowForward />
            </span>
          </button>
        </div>
      </div>

      {/* Fixed threshold overlay. Covers the viewport during the sequence,
          then reverses so the portfolio is intact underneath on return. */}
      <div ref={overlayRef} className="portal" aria-hidden>
        <div ref={irisRef} className="portal__iris" />
        <div ref={curtainRef} className="portal__curtain" />
        <div ref={wordmarkRef} className="portal__wordmark">
          <span className="portal__name">{stop.name}</span>
          <span className="portal__tag">{ui.portalEntering}</span>
        </div>
      </div>
    </li>
  );
}
