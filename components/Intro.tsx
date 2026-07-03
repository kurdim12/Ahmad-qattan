"use client";

import { useEffect, useRef, useState } from "react";
import { gsap } from "gsap";
import { useReducedMotion } from "@/lib/useReducedMotion";

/**
 * The opening: black night, a line of light writes itself across the dark —
 * the road, before anything else — then the world fades up. ~1.8s, plays once
 * per session, skippable with a tap, skipped entirely for reduced motion.
 */
export function Intro() {
  const [show, setShow] = useState(false);
  const rootRef = useRef<HTMLDivElement>(null);
  const lineRef = useRef<SVGPathElement>(null);
  const doneRef = useRef(false);
  const reduced = useReducedMotion();

  useEffect(() => {
    if (reduced) return;
    try {
      if (sessionStorage.getItem("road-intro") === "1") return;
      sessionStorage.setItem("road-intro", "1");
    } catch {
      /* storage unavailable → still play once */
    }
    setShow(true);
  }, [reduced]);

  useEffect(() => {
    if (!show) return;
    const root = rootRef.current;
    const line = lineRef.current;
    if (!root || !line) return;

    const total = line.getTotalLength();
    line.style.strokeDasharray = `${total}`;
    line.style.strokeDashoffset = `${total}`;

    const finish = () => {
      if (doneRef.current) return;
      doneRef.current = true;
      gsap.to(root, {
        autoAlpha: 0,
        duration: 0.6,
        ease: "power2.inOut",
        onComplete: () => setShow(false),
      });
    };

    const tl = gsap
      .timeline({ onComplete: finish })
      .to(line, { strokeDashoffset: 0, duration: 1.1, ease: "power2.inOut", delay: 0.25 })
      .to(line, { opacity: 0.0, duration: 0.45, ease: "power2.in" }, "+=0.2");

    const skip = () => {
      tl.kill();
      finish();
    };
    root.addEventListener("pointerdown", skip);
    root.addEventListener("keydown", skip);
    return () => {
      tl.kill();
      root.removeEventListener("pointerdown", skip);
      root.removeEventListener("keydown", skip);
    };
  }, [show]);

  if (!show) return null;

  return (
    <div ref={rootRef} className="intro" role="presentation">
      <svg className="intro__svg" viewBox="0 0 1000 400" preserveAspectRatio="xMidYMid meet" aria-hidden="true">
        <path
          ref={lineRef}
          d="M -20 260 C 220 250, 300 190, 480 205 S 780 250, 1020 175"
          stroke="#e8a53c"
          strokeWidth="2.5"
          strokeLinecap="round"
          fill="none"
        />
      </svg>
    </div>
  );
}
