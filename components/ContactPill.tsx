"use client";

import { useEffect, useState } from "react";
import { content } from "@/lib/content";
import { useLocale } from "@/lib/locale";

/**
 * The escape hatch: a whisper-quiet contact link that appears once the hero
 * is behind you and stays reachable for the whole journey — visitors who are
 * ready don't have to walk the full road to act.
 */
export function ContactPill() {
  const { locale } = useLocale();
  const [visible, setVisible] = useState(false);
  const c = content[locale];
  const contact = c.chapters.find((ch) => ch.contact)?.contact;

  useEffect(() => {
    const onScroll = () => setVisible(window.scrollY > window.innerHeight * 0.9);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  if (!contact) return null;

  return (
    <a
      className={`contact-pill ${visible ? "is-visible" : ""}`}
      href={contact.whatsapp.href}
      target="_blank"
      rel="noopener noreferrer"
      tabIndex={visible ? 0 : -1}
      aria-hidden={!visible}
    >
      {c.ui.contactPill}
      <span className="sr-only"> {c.ui.openExternal}</span>
    </a>
  );
}
