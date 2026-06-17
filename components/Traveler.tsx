import { forwardRef } from "react";

/**
 * The traveler dot — gold halo + white core + soft pulse — rides the draw head
 * of the road. Positioned by the road engine via GSAP (transform only).
 * Pure presentation; positioning lives in <RoadJourney>.
 */
export const Traveler = forwardRef<HTMLDivElement>(function Traveler(_props, ref) {
  return (
    <div ref={ref} className="traveler" aria-hidden="true">
      <span className="traveler__halo" />
      <span className="traveler__core" />
    </div>
  );
});
