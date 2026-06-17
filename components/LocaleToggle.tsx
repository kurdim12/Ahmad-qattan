"use client";

import { content } from "@/lib/content";
import { useLocale } from "@/lib/locale";

/** Corner toggle: flips dir/lang/fonts. Shows the OTHER language's label. */
export function LocaleToggle() {
  const { locale, toggle } = useLocale();
  const ui = content[locale].ui;
  return (
    <button
      type="button"
      className="locale-toggle"
      onClick={toggle}
      aria-label={ui.toggleAria}
      lang={locale === "ar" ? "en" : "ar"}
    >
      {ui.toggleTo}
    </button>
  );
}
