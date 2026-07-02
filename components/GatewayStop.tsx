"use client";

import { useCallback, useEffect, useRef } from "react";
import { gsap } from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { content, gateway } from "@/lib/content";
import { useLocale } from "@/lib/locale";
import { useReducedMotion } from "@/lib/useReducedMotion";

gsap.registerPlugin(ScrollTrigger);

const isPlaceholderUrl = (url: string) => !url || url.startsWith("#");

/**
 * The Think Equality fork. Rendered inside the fork scene's card. The dawn
 * inversion itself lives here too: html.is-dawn toggles while the arch and
 * the dawn scene hold the viewport, and eases back before "today".
 * The portal keeps the original behavior: animate first, then open the
 * external URL (placeholder "#" stays a no-op demo).
 */
export function GatewayStop() {
  const { locale } = useLocale();
  const reduced = useReducedMotion();
  const ui = content[locale].ui;

  const btnRef = useRef<HTMLButtonElement>(null);
  const overlayRef = useRef<HTMLDivElement>(null);
  const irisRef = useRef<HTMLDivElement>(null);
  const wordmarkRef = useRef<HTMLDivElement>(null);
  const runningRef = useRef(false);

  // Dawn inversion: from the arch centring until the dawn scene releases.
  useEffect(() => {
    const fork = document.querySelector('[data-scene-key="fork"]');
    const dawn = document.querySelector('[data-scene-key="dawn"]');
    if (!fork) return;
    const st = ScrollTrigger.create({
      trigger: fork,
      start: "center 62%",
      endTrigger: dawn ?? fork,
      end: "bottom 35%",
      toggleClass: { targets: "html", className: "is-dawn" },
    });
    return () => st.kill();
  }, []);

  const navigate = useCallback(() => {
    if (isPlaceholderUrl(gateway.url)) return;
    window.open(gateway.url, "_blank", "noopener,noreferrer");
  }, []);

  const enter = useCallback(() => {
    if (reduced) {
      navigate();
      return;
    }
    if (runningRef.current) return;
    const overlay = overlayRef.current;
    const iris = irisRef.current;
    const wordmark = wordmarkRef.current;
    if (!overlay || !iris || !wordmark) return;
    runningRef.current = true;

    const finish = () => {
      overlay.style.pointerEvents = "none";
      gsap.set(overlay, { autoAlpha: 0 });
      runningRef.current = false;
    };

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
      .to(state, { r: maxR, duration: 0.7, ease: "power3.inOut", onUpdate: applyClip })
      .fromTo(
        wordmark,
        { autoAlpha: 0, y: 14 },
        { autoAlpha: 1, y: 0, duration: 0.35, ease: "power2.out" },
        "-=0.15",
      )
      .call(navigate)
      .to(wordmark, { autoAlpha: 0, duration: 0.3, ease: "power2.in" }, "+=0.5")
      .to(state, { r: 0, duration: 0.6, ease: "power3.inOut", onUpdate: applyClip }, "-=0.05");
  }, [reduced, navigate]);

  return (
    <div className="gateway" data-gateway-stop>
      <span className="km-display gateway__word" aria-hidden>
        {gateway.word[locale]}
      </span>
      <p className="gateway__name title">{gateway.name.ar}</p>
      <p className="gateway__tag">{gateway.tag[locale]}</p>
      <button
        ref={btnRef}
        type="button"
        className="gateway__btn"
        onClick={enter}
        aria-label={`${gateway.cta[locale]} ${isPlaceholderUrl(gateway.url) ? "" : ui.openExternal}`.trim()}
      >
        {gateway.cta[locale]}
        <span className="gateway__arrow" aria-hidden>
          ↗
        </span>
      </button>

      <div ref={overlayRef} className="portal" aria-hidden>
        <div ref={irisRef} className="portal__iris" />
        <div ref={wordmarkRef} className="portal__wordmark">
          <span className="portal__name title">{gateway.name.ar}</span>
          <span className="portal__tag">{ui.portalEntering}</span>
        </div>
      </div>
    </div>
  );
}
