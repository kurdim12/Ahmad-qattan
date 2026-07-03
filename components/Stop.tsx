"use client";

import { useState } from "react";
import type { Stop as StopData } from "@/lib/content";
import { useLocale } from "@/lib/locale";
import { content } from "@/lib/content";
import { Marker } from "./Marker";
import { Scene } from "./Scene";
import { ServiceGlyph, ArrowForward } from "./icons";

/** Heuristic: only offer expand/collapse when copy is genuinely long (§4.6). */
const LONG = 240;

/**
 * A chapter on the night road: full-bleed scene painting (when the stop has
 * one), then the numbered marker sitting ON the road line, then the card.
 * Single centred column — the same journey on a phone and a desktop.
 */
export function Stop({
  stop,
  number,
}: {
  stop: Exclude<StopData, { type: "gateway" }>;
  number: string;
}) {
  const { locale } = useLocale();
  const ui = content[locale].ui;
  const isContact = "type" in stop && stop.type === "contact";

  return (
    <li data-stop className={`stop ${isContact ? "stop--contact" : ""}`}>
      {stop.scene ? <Scene scene={stop.scene} /> : null}
      <Marker number={number} />
      <article className="stop__card card reveal">
        <p className="card__station">{stop.station}</p>
        <h2 className="card__label">{stop.label}</h2>
        <StopBody stop={stop} ui={ui} />
      </article>
    </li>
  );
}

function StopBody({
  stop,
  ui,
}: {
  stop: Exclude<StopData, { type: "gateway" }>;
  ui: (typeof content)["ar"]["ui"];
}) {
  if (!("type" in stop)) return <Paragraphs body={stop.body} ui={ui} />;

  switch (stop.type) {
    case "services":
      return (
        <>
          <Paragraphs body={stop.body} ui={ui} />
          <ul className="services">
            {stop.items.map((it) => (
              <li key={it.name} className="services__item">
                <span className="services__icon" aria-hidden>
                  <ServiceGlyph name={it.icon} />
                </span>
                <span>
                  <span className="services__name">{it.name}</span>
                  <span className="services__desc">{it.desc}</span>
                </span>
              </li>
            ))}
          </ul>
        </>
      );

    case "chips":
      return (
        <>
          <Paragraphs body={stop.body} ui={ui} />
          <ul className="chips">
            {stop.items.map((c, i) => {
              const obj = typeof c === "string" ? { t: c } : c;
              return (
                <li
                  key={`${obj.t}-${i}`}
                  className={`chip ${"feature" in obj && obj.feature ? "chip--feature" : ""}`}
                >
                  {"feature" in obj && obj.feature ? (
                    <span className="chip__star" aria-hidden>
                      ✦
                    </span>
                  ) : null}
                  {obj.t}
                </li>
              );
            })}
          </ul>
        </>
      );

    case "stats":
      return (
        <>
          <Paragraphs body={stop.body} ui={ui} />
          <dl className="stats">
            {stop.stats.map((s, i) => (
              <div key={i} className="stat">
                <dt className="stat__n" dir="ltr">
                  {s.n}
                </dt>
                <dd className="stat__l">{s.l}</dd>
              </div>
            ))}
          </dl>
        </>
      );

    case "quotes":
      return (
        <ul className="quotes">
          {stop.items.map((q, i) => (
            <li key={i}>
              <blockquote className="quote">
                <p className="quote__text">“{q.quote}”</p>
                <footer className="quote__who">— {q.who}</footer>
              </blockquote>
            </li>
          ))}
        </ul>
      );

    case "contact":
      return (
        <div className="contact">
          <Paragraphs body={stop.body} ui={ui} />
          <a
            className="cta cta--whatsapp group"
            href={stop.whatsapp.href}
            target="_blank"
            rel="noopener noreferrer"
          >
            {stop.whatsapp.label}
            <span className="cta__num" dir="ltr">
              {stop.whatsapp.number}
            </span>
            <span className="cta__arrow" aria-hidden>
              <ArrowForward />
            </span>
            <span className="sr-only">{ui.openExternal}</span>
          </a>
          <p className="contact__loc">{stop.location}</p>
          <p className="contact__closing">{stop.closing}</p>
        </div>
      );

    default:
      return null;
  }
}

function Paragraphs({
  body,
  ui,
}: {
  body?: string[];
  ui: (typeof content)["ar"]["ui"];
}) {
  const [open, setOpen] = useState(false);
  if (!body || body.length === 0) return null;

  const total = body.join(" ").length;
  const collapsible = body.length > 1 && total > LONG;

  if (!collapsible) {
    return (
      <div className="prose">
        {body.map((p, i) => (
          <p key={i}>{p}</p>
        ))}
      </div>
    );
  }

  return (
    <div className="prose">
      <p>{body[0]}</p>
      <div className="prose__more" hidden={!open}>
        {body.slice(1).map((p, i) => (
          <p key={i}>{p}</p>
        ))}
      </div>
      <button
        type="button"
        className="readmore"
        aria-expanded={open}
        onClick={() => setOpen((o) => !o)}
      >
        {open ? ui.readLess : ui.readMore}
      </button>
    </div>
  );
}
