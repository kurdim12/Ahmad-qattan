"use client";

/**
 * The REAL photo (public/ahmad-qattan.jpg) with a CSS-only archive
 * treatment — duotone, scanlines, dissolved edges. The pixels are never
 * modified and the file never leaves the repo; everything here is filter,
 * mask and overlay. The global grain rides on top like everywhere else.
 */
export function Portrait({ variant }: { variant: "hero" | "today" }) {
  return (
    <figure
      className={`portrait portrait--${variant}`}
      aria-label="أحمد قطّان — صورة أرشيفية"
    >
      <img
        className="portrait__img"
        src="/ahmad-qattan.jpg"
        alt=""
        loading="lazy"
        decoding="async"
        draggable={false}
      />
      <span className="portrait__tone" aria-hidden />
      <span className="portrait__scan" aria-hidden />
    </figure>
  );
}
