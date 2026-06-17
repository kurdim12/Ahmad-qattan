"use client";

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useState,
  type ReactNode,
} from "react";
import type { Locale } from "./content";

type Dir = "rtl" | "ltr";

interface LocaleCtx {
  locale: Locale;
  dir: Dir;
  setLocale: (l: Locale) => void;
  toggle: () => void;
}

const Ctx = createContext<LocaleCtx | null>(null);

const dirOf = (l: Locale): Dir => (l === "ar" ? "rtl" : "ltr");

/**
 * Locale lives in React state + the URL (?lang=ar|en). No localStorage /
 * sessionStorage (per brief). The <html> dir/lang/font-class is kept in sync
 * here so RTL flips correctly and fonts swap on toggle.
 */
export function LocaleProvider({
  children,
  initial = "ar",
}: {
  children: ReactNode;
  initial?: Locale;
}) {
  const [locale, setLocaleState] = useState<Locale>(initial);

  // Read ?lang from the URL once on mount (URL is the only persistence).
  useEffect(() => {
    const param = new URLSearchParams(window.location.search).get("lang");
    if (param === "ar" || param === "en") setLocaleState(param);
  }, []);

  // Reflect locale onto <html> and the URL whenever it changes.
  useEffect(() => {
    const root = document.documentElement;
    root.lang = locale;
    root.dir = dirOf(locale);
    root.classList.toggle("lang-ar", locale === "ar");
    root.classList.toggle("lang-en", locale === "en");

    const url = new URL(window.location.href);
    url.searchParams.set("lang", locale);
    window.history.replaceState(window.history.state, "", url);
  }, [locale]);

  const setLocale = useCallback((l: Locale) => setLocaleState(l), []);
  const toggle = useCallback(
    () => setLocaleState((p) => (p === "ar" ? "en" : "ar")),
    [],
  );

  return (
    <Ctx.Provider value={{ locale, dir: dirOf(locale), setLocale, toggle }}>
      {children}
    </Ctx.Provider>
  );
}

export function useLocale(): LocaleCtx {
  const ctx = useContext(Ctx);
  if (!ctx) throw new Error("useLocale must be used within <LocaleProvider>");
  return ctx;
}
