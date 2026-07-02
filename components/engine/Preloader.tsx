"use client";

import { useEffect, useRef, useState } from "react";
import { preloader } from "@/lib/content";
import { useLocale } from "@/lib/locale";
import { formatKm } from "@/lib/numerals";
import { useReducedMotion } from "@/lib/useReducedMotion";

const DURATION = 2100; // ms for KM 000→100

/**
 * 00 — the departure. An odometer runs KM ٠٠٠→١٠٠ while the words
 * كاتب / مدرّب / مؤسّس pass, then the name lands and the night opens.
 * Skipped entirely under reduced motion; click skips it any time.
 */
export function Preloader() {
  const { locale } = useLocale();
  const reduced = useReducedMotion();
  const [gone, setGone] = useState(false);
  const [fading, setFading] = useState(false);
  const [n, setN] = useState(0);
  const [word, setWord] = useState(0); // index into words; words.length = the name
  const doneRef = useRef(false);

  useEffect(() => {
    if (reduced) {
      setGone(true);
      return;
    }
    document.documentElement.classList.add("is-loading");
    let raf = 0;
    const t0 = performance.now();
    const tick = (t: number) => {
      const p = Math.min(1, (t - t0) / DURATION);
      const eased = 1 - Math.pow(1 - p, 3);
      setN(Math.round(eased * 100));
      setWord(Math.min(preloader.words.length, Math.floor(p * (preloader.words.length + 1))));
      if (p < 1) {
        raf = requestAnimationFrame(tick);
      } else if (!doneRef.current) {
        doneRef.current = true;
        setFading(true);
        setTimeout(() => setGone(true), 900);
      }
    };
    raf = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(raf);
  }, [reduced]);

  useEffect(() => {
    if (gone) document.documentElement.classList.remove("is-loading");
  }, [gone]);

  if (gone) return null;

  const label =
    word >= preloader.words.length
      ? preloader.name[locale]
      : preloader.words[word][locale];

  return (
    <div
      className={`preloader${fading ? " preloader--fading" : ""}`}
      role="status"
      aria-live="off"
      onClick={() => {
        doneRef.current = true;
        setFading(true);
        setTimeout(() => setGone(true), 500);
      }}
    >
      <p
        className={`preloader__word${word >= preloader.words.length ? " preloader__word--name title" : ""}`}
      >
        {label}
      </p>
      <p className="km-display preloader__km" dir="rtl">
        {formatKm(n, locale)}
      </p>
    </div>
  );
}
