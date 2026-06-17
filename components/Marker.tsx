import { PortalStar } from "./icons";

/**
 * A milestone marker that lives ON the road axis, inside the central channel.
 * The number is rendered INSIDE the solid disc (never free-floating text), so
 * it can never overlap card copy (brief §4.3).
 *
 * The road engine toggles `.is-active` on the wrapping element (matched via the
 * `data-marker` attribute) as the traveler passes — completed markers stay lit.
 */
export function Marker({
  number,
  gateway = false,
}: {
  number?: string;
  gateway?: boolean;
}) {
  return (
    <span
      data-marker
      data-gateway={gateway ? "" : undefined}
      className={[
        "marker",
        gateway ? "marker--gateway" : "",
      ].join(" ")}
      aria-hidden="true"
    >
      <span className="marker__disc">
        {gateway ? <PortalStar className="h-6 w-6" /> : <span className="marker__num">{number}</span>}
      </span>
    </span>
  );
}
