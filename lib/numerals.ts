import type { Locale } from "./content";

const EASTERN = ["٠", "١", "٢", "٣", "٤", "٥", "٦", "٧", "٨", "٩"] as const;

/** Convert any Western digits in a string to Eastern-Arabic numerals. */
export function toEastern(value: string | number): string {
  return String(value).replace(/\d/g, (d) => EASTERN[Number(d)]);
}

/**
 * Format a milestone number for a marker disc.
 * AR → Eastern-Arabic ("٠١"), EN → Western ("01"). Always two digits.
 */
export function formatStopNumber(n: number, locale: Locale): string {
  const two = String(n).padStart(2, "0");
  return locale === "ar" ? toEastern(two) : two;
}
