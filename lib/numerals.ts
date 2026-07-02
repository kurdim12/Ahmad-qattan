import type { Locale } from "./content";

/**
 * Locale-aware integer formatting. AR uses Arabic-Indic digits via
 * Intl ("ar-JO-u-nu-arab"), EN uses Western digits — per the style bible,
 * never via manual digit swapping in rendered copy.
 */
const FMT: Record<Locale, Intl.NumberFormat> = {
  ar: new Intl.NumberFormat("ar-JO-u-nu-arab", { useGrouping: false }),
  en: new Intl.NumberFormat("en", { useGrouping: false }),
};

export function formatNumber(n: number, locale: Locale): string {
  return FMT[locale].format(n);
}

/** Odometer reading, zero-padded to three places (٠٠٧ / 007). */
export function formatKm(n: number, locale: Locale, pad = 3): string {
  const int = Math.max(0, Math.round(n));
  const padded = String(int).padStart(pad, "0");
  return locale === "ar"
    ? padded.replace(/\d/g, (d) => FMT.ar.format(Number(d)))
    : padded;
}
