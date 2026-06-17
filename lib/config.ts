// =============================================================================
// config.ts — small tuning knobs the client/designer is most likely to touch.
// (Gold *intensity* of the page gradient is tuned in app/globals.css via the
//  --grad-* custom properties; see README → "Tuning the gold intensity".)
// =============================================================================

/** The Think Equality threshold effect. "iris" = gold circle expands from the
 *  button; "curtain" = a gold panel sweeps across. See README → "Portal effect". */
export const PORTAL_VARIANT: "iris" | "curtain" = "iris";

/** Durations (seconds) for the portal sequence. Kept short — a flourish, not a
 *  loading screen (brief §6B). */
export const PORTAL = {
  irisOpen: 0.7,
  irisClose: 0.6,
  curtainSweep: 0.55,
  wordmarkHold: 0.5,
} as const;

/** Custom ease used across the site (≈ cubic-bezier(.2,.7,.2,1)). */
export const ROAD_EASE = "0.2, 0.7, 0.2, 1";
