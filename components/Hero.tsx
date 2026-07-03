"use client";

import { useRef } from "react";
import { gsap } from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { useGSAP } from "@gsap/react";
import { content } from "@/lib/content";
import { useLocale } from "@/lib/locale";
import { useReducedMotion } from "@/lib/useReducedMotion";
import { TALL_SCENES } from "./Scene";

gsap.registerPlugin(ScrollTrigger);

/**
 * The hero is a landmark, not a heading. The traveler painting fills the
 * viewport; Ahmad's Arabic name stands monumental across it; one plain
 * positioning line answers who/what/for-whom within the first five seconds.
 * The road begins directly below.
 */
export function Hero() {
  const { locale } = useLocale();
  const reduced = useReducedMotion();
  const hero = content[locale].hero;
  const ui = content[locale].ui;
  const root = useRef<HTMLElement>(null);

  useGSAP(
    () => {
      if (reduced) return;

      // One quiet arrival: eyebrow → name → line → cta, like a title card.
      const items = gsap.utils.toArray<HTMLElement>("[data-rise]");
      gsap.set(items, { autoAlpha: 0, y: 26 });
      gsap.to(items, {
        autoAlpha: 1,
        y: 0,
        duration: 1.1,
        ease: "power3.out",
        stagger: 0.14,
        delay: 0.2,
      });

      // The painting drifts as you leave — the world moves, not the text.
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

  const begin = () => {
    document
      .getElementById("road")
      ?.scrollIntoView({ behavior: reduced ? "auto" : "smooth", block: "start" });
  };

  return (
    <header className="hero" ref={root}>
      <figure
        className="hero__scene"
        aria-hidden="true"
        data-scene-id={hero.scene.id}
        data-focus={hero.scene.focus ?? "50% 50%"}
        data-tall={TALL_SCENES.has(hero.scene.id) ? "1" : undefined}
      >
        <picture>
          {TALL_SCENES.has(hero.scene.id) ? (
            <source
              media="(max-width: 767px)"
              srcSet={`/assets/scenes/${hero.scene.id}-tall-sm.webp 640w, /assets/scenes/${hero.scene.id}-tall.webp 1024w`}
            />
          ) : null}
          <img
            src={`/assets/scenes/${hero.scene.id}.webp`}
            srcSet={`/assets/scenes/${hero.scene.id}-sm.webp 800w, /assets/scenes/${hero.scene.id}.webp 1600w`}
            sizes="100vw"
            alt=""
            loading="eager"
            decoding="async"
            style={{ objectPosition: hero.scene.focus ?? "center" }}
          />
        </picture>
      </figure>

      <div className="hero__content">
        <p className="hero__eyebrow" data-rise>
          {hero.eyebrow}
        </p>
        <h1 className="hero__name" data-rise>
          {hero.name}
        </h1>
        <p className="hero__positioning" data-rise>
          {hero.positioning}
        </p>
        <div className="hero__actions" data-rise>
          <button type="button" className="btn btn--primary" onClick={begin}>
            <span className="btn__label">{hero.cta}</span>
            <span className="btn__line" aria-hidden="true" />
          </button>
          <span className="hero__hint" aria-hidden="true">
            {ui.scrollHint}
            <span className="hero__hint-line" />
          </span>
        </div>
      </div>
    </header>
  );
}
