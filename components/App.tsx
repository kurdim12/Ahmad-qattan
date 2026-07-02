"use client";

import { useEffect } from "react";
import { gsap } from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import Lenis from "lenis";
import { content, scenes, whatsapp } from "@/lib/content";
import { LocaleProvider, useLocale } from "@/lib/locale";
import { useReducedMotion } from "@/lib/useReducedMotion";
import { Footer } from "./Footer";
import { GatewayStop } from "./GatewayStop";
import { LocaleToggle } from "./LocaleToggle";
import { ScrollProgress } from "./ScrollProgress";
import { Fitter } from "./engine/Fitter";
import { Preloader } from "./engine/Preloader";
import { RoadLine } from "./engine/RoadLine";
import { SceneShell } from "./engine/SceneShell";
import { SkyCanvas } from "./engine/SkyCanvas";

gsap.registerPlugin(ScrollTrigger);

/** Smooth scroll + motion flag. No-JS and reduced-motion stay native. */
function useMotionShell(reduced: boolean) {
  useEffect(() => {
    if (reduced) return;
    document.documentElement.classList.add("has-motion");
    const lenis = new Lenis({ lerp: 0.11 });
    lenis.on("scroll", ScrollTrigger.update);
    const raf = (t: number) => lenis.raf(t * 1000);
    gsap.ticker.add(raf);
    gsap.ticker.lagSmoothing(0);
    return () => {
      gsap.ticker.remove(raf);
      lenis.destroy();
      document.documentElement.classList.remove("has-motion");
    };
  }, [reduced]);
}

function Shell() {
  const { locale } = useLocale();
  const reduced = useReducedMotion();
  const c = content[locale];
  useMotionShell(reduced);

  return (
    <>
      <a href="#main" className="skip">
        {c.ui.skip}
      </a>
      <LocaleToggle />
      <Preloader />
      <SkyCanvas />

      <main id="main">
        <div id="road-world" className="road-world">
          <RoadLine />
          {scenes.map((s, i) => (
            <div key={s.key}>
              <SceneShell scene={s} index={i}>
                {s.key === "fork" && <GatewayStop />}
                {s.key === "arrival" && (
                  <a className="whatsapp-cta" href={whatsapp.href}>
                    {whatsapp.label[locale]}
                    <span aria-hidden> ↗</span>
                  </a>
                )}
              </SceneShell>
              {i < scenes.length - 1 && (
                <div className="void-gap" aria-hidden />
              )}
            </div>
          ))}
        </div>
        <Footer />
      </main>

      <ScrollProgress />
      <Fitter />

      {/* The two unifiers — always the last layers, above everything. */}
      <div className="grain" aria-hidden />
      <div className="vignette" aria-hidden />
    </>
  );
}

export function App() {
  return (
    <LocaleProvider initial="ar">
      <Shell />
    </LocaleProvider>
  );
}
