import type { SceneRef } from "@/lib/content";

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
export const SCENE_ROADS: Record<
  SceneRef["id"],
  { entry: [number, number]; mids?: [number, number][]; exit: number }
> = {
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
  return (
    <figure
      className="scene"
      data-scene
      data-scene-id={scene.id}
      data-focus={scene.focus ?? "50% 50%"}
    >
      <img
        className="scene__img"
        src={`/assets/scenes/${scene.id}.webp`}
        srcSet={`/assets/scenes/${scene.id}-sm.webp 800w, /assets/scenes/${scene.id}.webp 1600w`}
        sizes="100vw"
        alt={scene.alt}
        loading={eager ? "eager" : "lazy"}
        decoding="async"
        style={{ objectPosition: scene.focus ?? "center" }}
      />
    </figure>
  );
}
