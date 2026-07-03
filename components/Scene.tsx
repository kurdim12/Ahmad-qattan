import type { SceneRef } from "@/lib/content";

/** Build-time base path for subpath hosting (e.g. GitHub Pages). */
const BASE = process.env.NEXT_PUBLIC_BASE_PATH ?? "";

/**
 * Where the painted road lives inside each 1680×944 painting, as fractions of
 * the full image. The road engine routes the drawn line THROUGH these points:
 *   entry — the road's far end (horizon / vanishing point) where the line
 *           arrives and dissolves into the painting,
 *   mids  — bends of the painted road (ordered top → bottom) the traveler
 *           dot follows across the artwork,
 *   exit  — the x where the road crosses the frame's bottom edge; the drawn
 *           line re-emerges there and carries on down the page.
 */
export interface RoadMap {
  entry: [number, number];
  mids?: [number, number][];
  exit: number;
}

export const SCENE_ROADS: Record<SceneRef["id"], RoadMap> = {
  traveler: { entry: [0.57, 0.6], exit: 0.45 },
  childhood: { entry: [0.86, 0.66], mids: [[0.6, 0.78]], exit: 0.35 },
  station: { entry: [0.88, 0.75], mids: [[0.52, 0.85]], exit: 0.18 },
  pen: { entry: [0.8, 0.6], mids: [[0.58, 0.73]], exit: 0.34 },
  training: { entry: [0.14, 0.6], mids: [[0.33, 0.68], [0.18, 0.78]], exit: 0.12 },
  dawn: {
    entry: [0.565, 0.24],
    mids: [[0.62, 0.42], [0.46, 0.6], [0.56, 0.76]],
    exit: 0.4,
  },
  "fork-arch": { entry: [0.47, 0.5], mids: [[0.65, 0.72]], exit: 0.8 },
  amman: { entry: [0.53, 0.52], mids: [[0.62, 0.7]], exit: 0.3 },
  // These two ship as portrait paintings; the desktop "wide" files are 16:9
  // bands cropped from them (impact: top 520/1536, testimonials: 640/1536) —
  // the fractions below are remapped into those bands.
  impact: { entry: [0.53, 0.27], mids: [[0.52, 0.56], [0.47, 0.83]], exit: 0.46 },
  testimonials: { entry: [0.62, 0.25], mids: [[0.6, 0.49], [0.64, 0.76]], exit: 0.6 },
};

/**
 * PORTRAIT (2:3, 1024×1536) variants of the paintings — used on phones so the
 * art fills the screen instead of being cropped out of a wide frame.
 *
 * Drop the files at public/assets/scenes/<id>-tall.webp (1024w) and
 * <id>-tall-sm.webp (640w), then add the id to TALL_SCENES to activate.
 * Road fractions below are pre-traced from the portrait paintings.
 */
export const TALL_SCENES = new Set<SceneRef["id"]>([
  "traveler",
  "childhood",
  "station",
  "pen",
  "training",
  "fork-arch",
  "dawn",
  "amman",
  "impact",
  "testimonials",
]);

export const SCENE_ROADS_TALL: Record<SceneRef["id"], RoadMap> = {
  traveler: {
    entry: [0.55, 0.53],
    mids: [[0.55, 0.62], [0.5, 0.72]],
    exit: 0.52,
  },
  childhood: {
    entry: [0.49, 0.51],
    mids: [[0.57, 0.61], [0.6, 0.67], [0.5, 0.76]],
    exit: 0.45,
  },
  station: {
    entry: [0.55, 0.49],
    mids: [[0.59, 0.58], [0.63, 0.68], [0.56, 0.8]],
    exit: 0.52,
  },
  pen: {
    entry: [0.5, 0.54],
    mids: [[0.45, 0.63], [0.42, 0.73], [0.43, 0.83]],
    exit: 0.4,
  },
  training: {
    entry: [0.5, 0.45],
    mids: [[0.44, 0.55], [0.42, 0.63], [0.32, 0.76]],
    exit: 0.3,
  },
  dawn: {
    entry: [0.53, 0.3],
    mids: [[0.48, 0.42], [0.56, 0.53], [0.46, 0.65], [0.52, 0.78]],
    exit: 0.5,
  },
  "fork-arch": {
    entry: [0.51, 0.57],
    mids: [[0.54, 0.67], [0.49, 0.78]],
    exit: 0.45,
  },
  amman: {
    entry: [0.5, 0.34],
    mids: [[0.54, 0.45], [0.49, 0.57], [0.52, 0.7]],
    exit: 0.48,
  },
  impact: {
    entry: [0.53, 0.44],
    mids: [[0.52, 0.55], [0.47, 0.65], [0.44, 0.8]],
    exit: 0.4,
  },
  testimonials: {
    entry: [0.62, 0.51],
    mids: [[0.6, 0.6], [0.64, 0.7], [0.6, 0.8]],
    exit: 0.57,
  },
};

/**
 * A night-road scene painting the journey line travels through.
 * The figure feathers into the night sky at its edges (CSS mask), so the
 * glowing SVG road appears to dive into the picture and come out the other
 * side — the painted road and the drawn line read as ONE road.
 *
 * The <img> is 112% tall and parallax-shifted by the road engine, so it can
 * drift a few percent on scroll without ever exposing a gap.
 */
export function Scene({
  scene,
  eager = false,
}: {
  scene: SceneRef;
  eager?: boolean;
}) {
  const tall = TALL_SCENES.has(scene.id);
  const img = (
    <img
      className="scene__img"
      src={`${BASE}/assets/scenes/${scene.id}.webp`}
      srcSet={`${BASE}/assets/scenes/${scene.id}-sm.webp 800w, ${BASE}/assets/scenes/${scene.id}.webp 1600w`}
      sizes="100vw"
      alt={scene.alt}
      loading={eager ? "eager" : "lazy"}
      decoding="async"
      style={{ objectPosition: scene.focus ?? "center" }}
    />
  );
  return (
    <figure
      className="scene"
      data-scene
      data-scene-id={scene.id}
      data-focus={scene.focus ?? "50% 50%"}
      data-tall={tall ? "1" : undefined}
    >
      {tall ? (
        <picture>
          {/* Phones get the portrait painting — full composition, no crop. */}
          <source
            media="(max-width: 767px)"
            srcSet={`${BASE}/assets/scenes/${scene.id}-tall-sm.webp 640w, ${BASE}/assets/scenes/${scene.id}-tall.webp 1024w`}
          />
          {img}
        </picture>
      ) : (
        img
      )}
    </figure>
  );
}
