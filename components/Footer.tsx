"use client";

import { useEffect, useState } from "react";
import { footer } from "@/lib/content";
import { useLocale } from "@/lib/locale";

/** 10 — the footer: Amman live clock, ventures marquee, rights. */
export function Footer() {
  const { locale } = useLocale();
  const [time, setTime] = useState("");

  useEffect(() => {
    const fmt = new Intl.DateTimeFormat(
      locale === "ar" ? "ar-JO-u-nu-arab" : "en-GB",
      { timeZone: "Asia/Amman", hour: "2-digit", minute: "2-digit", second: "2-digit" },
    );
    const tick = () => setTime(fmt.format(new Date()));
    tick();
    const id = setInterval(tick, 1000);
    return () => clearInterval(id);
  }, [locale]);

  const ventures = [...footer.ventures, ...footer.ventures]; // seamless loop

  return (
    <footer className="site-footer">
      <p className="site-footer__clock" role="status">
        <span className="eyebrow">AMMAN</span>{" "}
        <span className="site-footer__label">{footer.clockLabel[locale]}</span>{" "}
        <span className="km-display site-footer__time" dir="ltr">
          {time}
        </span>
      </p>

      <div className="marquee" aria-hidden>
        <div className="marquee__track">
          {ventures.map((v, i) => (
            <span key={i} className="marquee__item">
              {v[locale]} <span className="marquee__star">✦</span>
            </span>
          ))}
        </div>
      </div>

      <p className="site-footer__rights">{footer.rights[locale]}</p>
    </footer>
  );
}
