"use client";

import { useEffect, useRef } from "react";
import { gsap } from "gsap";
import { content } from "@/lib/content";
import { LocaleProvider, useLocale } from "@/lib/locale";
import { useReducedMotion } from "@/lib/useReducedMotion";
import { Hero } from "./Hero";
import { RoadJourney } from "./RoadJourney";
import { LocaleToggle } from "./LocaleToggle";
import { ScrollProgress } from "./ScrollProgress";

function Shell() {
  const { locale } = useLocale();
  const reduced = useReducedMotion();
  const c = content[locale];
  const mainRef = useRef<HTMLElement>(null);
  const firstRender = useRef(true);

  // Calm crossfade when the locale (and thus all copy) swaps.
  useEffect(() => {
    if (firstRender.current) {
      firstRender.current = false;
      return;
    }
    if (reduced || !mainRef.current) return;
    gsap.fromTo(
      mainRef.current,
      { opacity: 0.35 },
      { opacity: 1, duration: 0.45, ease: "power2.out" },
    );
  }, [locale, reduced]);

  return (
    <>
      <div className="page-bg" aria-hidden />
      <a href="#main" className="skip">
        {c.ui.skip}
      </a>

      <header className="topbar">
        <a href="#main" className="brand">
          {c.meta.siteName}
        </a>
        <LocaleToggle />
      </header>
      <ScrollProgress />

      <main id="main" ref={mainRef}>
        <Hero />
        <RoadJourney />
      </main>

      <footer className="site-footer">{c.ui.footnote}</footer>
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
