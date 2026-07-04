"use client";

import { useCallback, useRef } from "react";
import { gsap } from "gsap";
import type { Chapter as ChapterData } from "@/lib/content";
import { content } from "@/lib/content";
import { useLocale } from "@/lib/locale";
import { useReducedMotion } from "@/lib/useReducedMotion";
import { PORTAL } from "@/lib/config";
import { formatStopNumber } from "@/lib/numerals";
import { Scene } from "./Scene";

const isPlaceholderUrl = (url: string) => !url || url.startsWith("#");

/**
 * A chapter of the journey. No cards, no boxes: a painting the road passes
 * through, a chapter word carved over the night (the road runs beneath it),
 * and words that arrive like ink. The waypoint node on the road is the only
 * "UI" — a small light that brightens as the traveler passes.
 */
export function Chapter({ chapter }: { chapter: ChapterData }) {
  const { locale } = useLocale();

  return (
    <section
      data-chapter
      id={`chapter-${chapter.key}`}
      className={`chapter chapter--${chapter.key}`}
    >
      <Scene scene={chapter.scene} />

      {/* Waypoint: the road engine anchors the line here and lights it. */}
      <span data-marker data-gateway={chapter.gateway ? "" : undefined} className="waypoint" aria-hidden="true" />

      <header className="chapter__head">
        <p className="chapter__kicker" data-ink>
          {chapter.kicker}
        </p>
        <h2 className="chapter__word" data-carve>
          {chapter.word}
        </h2>
      </header>

      {chapter.body?.length ? (
        <div className="chapter__prose">
          {chapter.body.map((p, i) => (
            <p key={i} data-ink>
              {p}
            </p>
          ))}
        </div>
      ) : null}

      {chapter.craft ? <CraftList craft={chapter.craft} locale={locale} /> : null}
      {chapter.gateway ? <Crossing chapter={chapter} /> : null}
      {chapter.stats ? (
        <dl className="figures">
          {chapter.stats.map((s, i) => (
            <div key={i} className="figures__item" data-ink>
              <dt className="figures__n" dir="ltr">
                {s.n}
              </dt>
              <dd className="figures__l">{s.l}</dd>
            </div>
          ))}
        </dl>
      ) : null}

      {/* Second beat of the chapter (dawn after the arch, campfire voices). */}
      {chapter.scene2 ? <Scene scene={chapter.scene2} /> : null}

      {chapter.voices ? (
        <div className="voices">
          {chapter.voices.map((v, i) => (
            <blockquote key={i} className="voice">
              <p className="voice__quote" data-ink>
                «{v.quote}»
              </p>
              <footer className="voice__who" data-ink>
                — {v.who}
              </footer>
            </blockquote>
          ))}
        </div>
      ) : null}

      {chapter.contact ? <Arrival chapter={chapter} /> : null}
    </section>
  );
}

/** The craft, set like a book's contents — numerals hang, hairlines write themselves. */
function CraftList({
  craft,
  locale,
}: {
  craft: NonNullable<ChapterData["craft"]>;
  locale: "ar" | "en";
}) {
  return (
    <ol className="craft">
      {craft.map((c, i) => (
        <li key={c.name} className="craft__item" data-ink>
          <span className="craft__n" aria-hidden="true">
            {formatStopNumber(i + 1, locale)}
          </span>
          <span className="craft__text">
            <span className="craft__name">{c.name}</span>
            <span className="craft__desc">{c.desc}</span>
          </span>
        </li>
      ))}
    </ol>
  );
}

/** The Crossing — Think Equality. The one dramatic beat of the journey. */
function Crossing({ chapter }: { chapter: ChapterData }) {
  const { locale } = useLocale();
  const reduced = useReducedMotion();
  const ui = content[locale].ui;
  const gw = chapter.gateway!;

  const btnRef = useRef<HTMLButtonElement>(null);
  const overlayRef = useRef<HTMLDivElement>(null);
  const irisRef = useRef<HTMLDivElement>(null);
  const wordmarkRef = useRef<HTMLDivElement>(null);
  const runningRef = useRef(false);

  const navigate = useCallback(() => {
    if (isPlaceholderUrl(gw.url)) return;
    window.open(gw.url, "_blank", "noopener,noreferrer");
  }, [gw.url]);

  // Magnetic pull — pointers only.
  const onMove = useCallback(
    (e: React.PointerEvent<HTMLButtonElement>) => {
      if (reduced || e.pointerType === "touch") return;
      const el = btnRef.current;
      if (!el) return;
      const r = el.getBoundingClientRect();
      gsap.to(el, {
        x: (e.clientX - (r.left + r.width / 2)) * 0.22,
        y: (e.clientY - (r.top + r.height / 2)) * 0.28,
        duration: 0.4,
        ease: "power3.out",
      });
    },
    [reduced],
  );
  const onLeave = useCallback(() => {
    if (btnRef.current)
      gsap.to(btnRef.current, { x: 0, y: 0, duration: 0.5, ease: "power3.out" });
  }, []);

  /** Crossing the threshold: dawn light floods from the button, then recedes. */
  const enter = useCallback(() => {
    if (reduced) {
      navigate();
      return;
    }
    if (runningRef.current) return;
    const overlay = overlayRef.current;
    const iris = irisRef.current;
    const wordmark = wordmarkRef.current;
    if (!overlay || !iris || !wordmark) return;
    runningRef.current = true;

    const r = (btnRef.current ?? overlay).getBoundingClientRect();
    const cx = r.left + r.width / 2;
    const cy = r.top + r.height / 2;
    const maxR = Math.hypot(
      Math.max(cx, window.innerWidth - cx),
      Math.max(cy, window.innerHeight - cy),
    );
    const state = { r: 0 };
    const applyClip = () => {
      iris.style.clipPath = `circle(${state.r}px at ${cx}px ${cy}px)`;
    };
    applyClip();

    gsap
      .timeline({
        onComplete: () => {
          overlay.style.pointerEvents = "none";
          gsap.set(overlay, { autoAlpha: 0 });
          runningRef.current = false;
        },
      })
      .set(overlay, { autoAlpha: 1, pointerEvents: "auto" })
      .to(state, { r: maxR, duration: PORTAL.irisOpen, ease: "power3.inOut", onUpdate: applyClip })
      .fromTo(
        wordmark,
        { autoAlpha: 0, y: 14 },
        { autoAlpha: 1, y: 0, duration: 0.35, ease: "power2.out" },
        "-=0.15",
      )
      .call(navigate)
      .to(wordmark, { autoAlpha: 0, duration: 0.3, ease: "power2.in" }, `+=${PORTAL.wordmarkHold}`)
      .to(state, { r: 0, duration: PORTAL.irisClose, ease: "power3.inOut", onUpdate: applyClip }, "-=0.05");
  }, [reduced, navigate]);

  return (
    <div className="crossing" data-gateway-stop>
      <p className="crossing__name" data-carve>
        {gw.name}
      </p>
      <p className="crossing__tag" data-ink>
        {gw.tag}
      </p>
      <p className="crossing__body" data-ink>
        {gw.body}
      </p>
      <button
        ref={btnRef}
        type="button"
        className="btn btn--gate"
        onPointerMove={onMove}
        onPointerLeave={onLeave}
        onClick={enter}
        aria-label={`${gw.cta} ${isPlaceholderUrl(gw.url) ? "" : ui.openExternal}`.trim()}
      >
        <span className="btn__label">{gw.cta}</span>
        <span className="btn__line" aria-hidden="true" />
      </button>

      <div ref={overlayRef} className="portal" aria-hidden="true">
        <div ref={irisRef} className="portal__iris" />
        <div ref={wordmarkRef} className="portal__wordmark">
          <span className="portal__name">{gw.name}</span>
          <span className="portal__tag">{ui.portalEntering}</span>
        </div>
      </div>
    </div>
  );
}

/** The destination. Not a footer — an arrival. */
function Arrival({ chapter }: { chapter: ChapterData }) {
  const { locale } = useLocale();
  const ui = content[locale].ui;
  const c = chapter.contact!;
  const name = content[locale].hero.name;

  return (
    <div className="arrival">
      <p className="arrival__closing" data-ink>
        {c.closing}
      </p>
      <p className="arrival__wordmark" data-carve>
        {name}
      </p>
      <a
        className="btn btn--primary"
        href={c.whatsapp.href}
        target="_blank"
        rel="noopener noreferrer"
      >
        <span className="btn__label">
          {c.whatsapp.label}
          <span className="btn__num" dir="ltr">
            {c.whatsapp.number}
          </span>
        </span>
        <span className="btn__line" aria-hidden="true" />
        <span className="sr-only">{ui.openExternal}</span>
      </a>
      <p className="arrival__loc" data-ink>
        {c.location}
      </p>
      <p className="arrival__footnote">{ui.footnote}</p>
    </div>
  );
}
