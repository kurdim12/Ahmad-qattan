"use client";

import { useRef, useState } from "react";
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
  const [imgError, setImgError] = useState(false);

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

      // Restrained parallax — the scene painting drifts as you leave the hero.
      const scene = root.current?.querySelector(".hero__scene img");
      if (scene) {
        gsap.to(scene, {
          yPercent: 10,
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
      {/* Full-bleed night-road painting — the journey starts inside the art,
          and its glowing road hands off to the drawn line below. */}
      <figure className="hero__scene" aria-hidden>
        <img
          src={`/assets/scenes/${hero.scene.id}.webp`}
          srcSet={`/assets/scenes/${hero.scene.id}-sm.webp 800w, /assets/scenes/${hero.scene.id}.webp 1600w`}
          sizes="100vw"
          alt=""
          loading="eager"
          decoding="async"
          style={{ objectPosition: hero.scene.focus ?? "center" }}
        />
      </figure>

      <div className="hero__portrait" data-rise>
        {imgError ? (
          <div className="hero__monogram" role="img" aria-label={hero.portrait.alt}>
            {hero.name.trim().charAt(0)}
          </div>
        ) : (
          <img
            className="hero__img"
            src={hero.portrait.src}
            alt={hero.portrait.alt}
            width={600}
            height={600}
            loading="eager"
            decoding="async"
            onError={() => setImgError(true)}
          />
        )}
      </div>

      <div className="hero__content">
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
      </div>
    </header>
  );
}
