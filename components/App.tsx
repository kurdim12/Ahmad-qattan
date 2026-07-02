"use client";

import { content, scenes } from "@/lib/content";
import { LocaleProvider, useLocale } from "@/lib/locale";
import { formatKm } from "@/lib/numerals";
import { LocaleToggle } from "./LocaleToggle";

/**
 * P0 shell — proves the night before the engine lands: page bg == --night,
 * grain + vignette riding on top of everything, Amiri carrying the name,
 * Rakkas carrying a km numeral. Scenes replace the stage from P3 on.
 */
function Shell() {
  const { locale } = useLocale();
  const c = content[locale];
  const hero = scenes[0];

  return (
    <>
      <a href="#main" className="skip">
        {c.ui.skip}
      </a>
      <LocaleToggle />

      <main id="main">
        <section className="night-stage" aria-label={hero.title[locale]}>
          <p className="eyebrow">KM 00 — THE NIGHT ROAD</p>
          <h1 className="night-stage__name">{hero.title[locale]}</h1>
          <p className="km-display night-stage__km" dir="rtl">
            {c.ui.kmWord} {formatKm(0, locale, 1)}
          </p>
          {hero.body?.map((b, i) => (
            <p key={i} className="night-stage__tag">
              {b[locale]}
            </p>
          ))}
        </section>
        <div className="night-void" aria-hidden />
      </main>

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
