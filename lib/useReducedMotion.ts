"use client";

import { useEffect, useState } from "react";

/**
 * Tracks `prefers-reduced-motion`. Returns `true` when the user has asked for
 * reduced motion — every animation in the site checks this and degrades to a
 * static, accessible experience (road shown, portal just opens the link).
 *
 * Defaults to `true` during SSR / first paint so we never flash motion before
 * the preference is known.
 */
export function useReducedMotion(): boolean {
  const [reduced, setReduced] = useState(true);

  useEffect(() => {
    const mq = window.matchMedia("(prefers-reduced-motion: reduce)");
    const update = () => setReduced(mq.matches);
    update();
    mq.addEventListener("change", update);
    return () => mq.removeEventListener("change", update);
  }, []);

  return reduced;
}
