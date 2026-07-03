import type { SceneRef } from "@/lib/content";
import { SceneArt } from "./scenes";

/** Where the road lives inside a scene, as fractions of its frame:
 *  entry — the far end (horizon) where the journey line dissolves in,
 *  mids  — the bends the traveler follows across the world,
 *  exit  — where the road crosses the bottom edge and re-emerges. */
export interface RoadMap {
  entry: [number, number];
  mids?: [number, number][];
  exit: number;
}

/**
 * A chapter's world, drawn entirely in code (see scenes.tsx). The figure
 * feathers into the night sky at its edges, so the journey line appears to
 * dive into the scene — and because the scene's road is a vector in the same
 * palette, the drawn line and the world's road are literally the same light.
 */
export function Scene({ scene }: { scene: SceneRef }) {
  return (
    <figure className="scene" data-scene data-scene-id={scene.id}>
      <SceneArt id={scene.id} label={scene.alt} />
    </figure>
  );
}
