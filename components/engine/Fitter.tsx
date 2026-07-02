"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import { scenes, type Scene } from "@/lib/content";
import { coverTransform, pointsToD, type Pt } from "@/lib/roadPath";

/**
 * ?fit=1 — the road fitter. Shows a scene frame at 50% opacity in the exact
 * cover mapping SceneShell uses; click along the painted road, the smooth `d`
 * (in IMAGE coordinates, ready for content.ts) prints to the console and can
 * be copied. Z removes the last point, C clears, B toggles branch mode.
 */
export function Fitter() {
  const [active, setActive] = useState(false);
  const [sceneIdx, setSceneIdx] = useState(0);
  const [pts, setPts] = useState<Pt[]>([]);
  const [branchMode, setBranchMode] = useState(false);
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    setActive(new URLSearchParams(window.location.search).get("fit") === "1");
  }, []);

  const scene: Scene | undefined = scenes[sceneIdx];
  const usePortrait = false; // fit the landscape master; portrait maps itself
  const iw = usePortrait ? 941 : 1672;
  const ih = usePortrait ? 1672 : 941;

  const d = useMemo(
    () => (pts.length > 1 ? pointsToD(pts) : ""),
    [pts],
  );

  useEffect(() => {
    if (d && scene) {
      console.log(
        `[fitter] ${scene.key}${branchMode ? " (branch)" : ""}:\n${d}`,
      );
    }
  }, [d, scene, branchMode]);

  const onClick = useCallback(
    (e: React.MouseEvent<HTMLDivElement>) => {
      const box = e.currentTarget.getBoundingClientRect();
      const { s, ox, oy } = coverTransform(iw, ih, box.width, box.height);
      const x = (e.clientX - box.left - ox) / s;
      const y = (e.clientY - box.top - oy) / s;
      setPts((p) => [...p, { x: Math.round(x), y: Math.round(y) }]);
    },
    [iw, ih],
  );

  useEffect(() => {
    if (!active) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "z" || e.key === "Z") setPts((p) => p.slice(0, -1));
      if (e.key === "c" || e.key === "C") setPts([]);
      if (e.key === "b" || e.key === "B") setBranchMode((b) => !b);
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [active]);

  if (!active || !scene) return null;

  const previewD = d;

  return (
    <div className="fitter" onClick={onClick}>
      <div
        className="fitter__stage"
        style={{ backgroundImage: `url(${scene.asset.base})` }}
      />
      <svg className="fitter__overlay" aria-hidden>
        <FitPreview pts={pts} d={previewD} iw={iw} ih={ih} />
      </svg>
      <div className="fitter__panel" dir="ltr" onClick={(e) => e.stopPropagation()}>
        <select
          value={sceneIdx}
          onChange={(e) => {
            setSceneIdx(Number(e.target.value));
            setPts([]);
          }}
        >
          {scenes.map((s, i) => (
            <option key={s.key} value={i}>
              {String(i + 1).padStart(2, "0")} — {s.key}
            </option>
          ))}
        </select>
        <span>
          {pts.length} pts {branchMode ? "· BRANCH" : ""} · Z undo · C clear ·
          B branch
        </span>
        <textarea readOnly value={d} rows={3} />
        <button
          type="button"
          onClick={async () => {
            await navigator.clipboard.writeText(d);
            setCopied(true);
            setTimeout(() => setCopied(false), 1200);
          }}
        >
          {copied ? "copied ✓" : "copy d"}
        </button>
      </div>
    </div>
  );
}

/** Maps image-space points/path into the on-screen cover box for preview. */
function FitPreview({
  pts,
  d,
  iw,
  ih,
}: {
  pts: Pt[];
  d: string;
  iw: number;
  ih: number;
}) {
  const [box, setBox] = useState({ w: 0, h: 0 });
  useEffect(() => {
    const update = () => setBox({ w: window.innerWidth, h: window.innerHeight });
    update();
    window.addEventListener("resize", update);
    return () => window.removeEventListener("resize", update);
  }, []);
  if (!box.w) return null;
  const { s, ox, oy } = coverTransform(iw, ih, box.w, box.h);
  return (
    <g transform={`translate(${ox} ${oy}) scale(${s})`}>
      {d && (
        <path
          d={d}
          fill="none"
          stroke="#f2cb74"
          strokeWidth={3 / s}
          opacity={0.9}
        />
      )}
      {pts.map((p, i) => (
        <circle
          key={i}
          cx={p.x}
          cy={p.y}
          r={5 / s}
          fill={i === 0 ? "#7fd47f" : "#f2cb74"}
        />
      ))}
    </g>
  );
}
