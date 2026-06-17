"use client";

import { useRef } from "react";
import { gsap } from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { useGSAP } from "@gsap/react";
import { content } from "@/lib/content";
import { useLocale } from "@/lib/locale";
import { useReducedMotion } from "@/lib/useReducedMotion";
import { ArrowDown } from "./icons";

gsap.registerPlugin(ScrollTrigger);

export function Hero() {
  const { locale } = useLocale();
  const reduced = useReducedMotion();
  const hero = content[locale].hero;
  const ui = content[locale].ui;
  const root = useRef<HTMLElement>(null);

  useGSAP(
    () => {
      if (reduced) return;

      // One orchestrated page-load sequence (~1s): brand + hero rise in.
      const items = gsap.utils.toArray<HTMLElement>("[data-rise]");
      gsap.set(items, { autoAlpha: 0, y: 28 });
      gsap.to(items, {
        autoAlpha: 1,
        y: 0,
        duration: 0.9,
        ease: "power3.out",
        stagger: 0.12,
        delay: 0.15,
      });

      // Restrained parallax — sky only.
      const sky = root.current?.querySelector(".hero__sky");
      if (sky) {
        gsap.to(sky, {
          yPercent: 18,
          ease: "none",
          scrollTrigger: {
            trigger: root.current,
            start: "top top",
            end: "bottom top",
            scrub: true,
          },
        });
      }
    },
    { scope: root, dependencies: [locale, reduced] },
  );

  const explore = () => {
    const target = document.getElementById("road");
    target?.scrollIntoView({ behavior: reduced ? "auto" : "smooth", block: "start" });
  };

  return (
    <header className="hero" ref={root}>
      <span className="hero__sky" aria-hidden />
      <p className="hero__eyebrow" data-rise>
        {hero.eyebrow}
      </p>
      <h1 className="hero__name" data-rise>
        {hero.name}
      </h1>
      <p className="hero__wildcard" data-rise>
        {hero.wildcard}
      </p>
      <p className="hero__intro" data-rise>
        {hero.intro}
      </p>
      <div className="hero__actions" data-rise>
        <button type="button" className="cta group" onClick={explore}>
          {hero.cta}
          <span className="cta__arrow" aria-hidden>
            <ArrowDown />
          </span>
        </button>
        <span className="hero__hint">
          {ui.scrollHint}
          <ArrowDown className="h-4 w-4" />
        </span>
      </div>
    </header>
  );
}
