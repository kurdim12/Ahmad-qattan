"use client";

import { useEffect, useState } from "react";
import { content, scenes, TOTAL_KM } from "@/lib/content";
import { useLocale } from "@/lib/locale";
import { formatNumber } from "@/lib/numerals";
import { FOCUS } from "./engine/RoadLine";

/**
 * The km odometer — fixed at bottom-inline-start. Calibrated on the scenes
 * themselves: it reads each stop's labelled km exactly when that scene's
 * centre crosses the focus line (same anchor the light head uses).
 */
export function ScrollProgress() {
  const { locale } = useLocale();
  const [km, setKm] = useState(0);

  useEffect(() => {
    let anchors: { y: number; km: number }[] = [];

    const measure = () => {
      anchors = scenes
        .map((s) => {
          const el = document.querySelector<HTMLElement>(
            `[data-scene-key="${s.key}"]`,
          );
          if (!el) return null;
          const r = el.getBoundingClientRect();
          return { y: r.top + window.scrollY + r.height / 2, km: s.km };
        })
        .filter((a): a is { y: number; km: number } => a !== null)
        .sort((a, b) => a.y - b.y);
    };

    let raf = 0;
    let lastKm = -1;
    const onScroll = () => {
      cancelAnimationFrame(raf);
      raf = requestAnimationFrame(() => {
        if (anchors.length === 0) return;
        const y = window.scrollY + window.innerHeight * FOCUS;
        let value: number;
        if (y <= anchors[0].y) {
          value = anchors[0].km * Math.max(0, y / anchors[0].y);
        } else if (y >= anchors[anchors.length - 1].y) {
          value = anchors[anchors.length - 1].km;
        } else {
          let i = 0;
          while (i < anchors.length - 1 && anchors[i + 1].y < y) i++;
          const a = anchors[i];
          const b = anchors[i + 1];
          const t = (y - a.y) / (b.y - a.y);
          value = a.km + (b.km - a.km) * t;
        }
        const rounded = Math.min(TOTAL_KM, Math.round(value));
        if (rounded !== lastKm) {
          lastKm = rounded;
          setKm(rounded);
        }
      });
    };

    measure();
    onScroll();
    const ro = new ResizeObserver(() => {
      measure();
      onScroll();
    });
    const world = document.getElementById("road-world");
    if (world) ro.observe(world);
    window.addEventListener("scroll", onScroll, { passive: true });
    window.addEventListener("resize", measure);
    return () => {
      cancelAnimationFrame(raf);
      ro.disconnect();
      window.removeEventListener("scroll", onScroll);
      window.removeEventListener("resize", measure);
    };
  }, []);

  const c = content[locale];
  return (
    <div
      className="odometer"
      role="status"
      aria-label={c.ui.odometerAria}
      dir="rtl"
    >
      <span className="odometer__word">{c.ui.kmWord}</span>{" "}
      <span className="km-display odometer__value">
        {formatNumber(km, locale)}
      </span>
    </div>
  );
}
