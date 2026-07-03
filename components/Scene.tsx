import type { SceneRef } from "@/lib/content";

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
    <figure className="scene" data-scene>
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
