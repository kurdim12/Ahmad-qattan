import type { ServiceIcon } from "@/lib/content";

type IconProps = { className?: string };

const base = "h-6 w-6";

/** Writing / pen. */
function PenIcon({ className }: IconProps) {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.6}
      strokeLinecap="round" strokeLinejoin="round" className={className ?? base} aria-hidden>
      <path d="M16.5 3.5a2.12 2.12 0 0 1 3 3L7 19l-4 1 1-4Z" />
      <path d="M15 5l3 3" />
    </svg>
  );
}

/** Training / people. */
function UsersIcon({ className }: IconProps) {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.6}
      strokeLinecap="round" strokeLinejoin="round" className={className ?? base} aria-hidden>
      <circle cx="9" cy="8" r="3" />
      <path d="M3 20a6 6 0 0 1 12 0" />
      <path d="M16 5.5a3 3 0 0 1 0 5.5" />
      <path d="M18 14a6 6 0 0 1 3 6" />
    </svg>
  );
}

/** Content / layers. */
function LayersIcon({ className }: IconProps) {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.6}
      strokeLinecap="round" strokeLinejoin="round" className={className ?? base} aria-hidden>
      <path d="M12 3 3 8l9 5 9-5Z" />
      <path d="M3 13l9 5 9-5" />
    </svg>
  );
}

/** Initiatives / spark. (Non-directional — never mirrored.) */
function SparkIcon({ className }: IconProps) {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.6}
      strokeLinecap="round" strokeLinejoin="round" className={className ?? base} aria-hidden>
      <path d="M12 3v4M12 17v4M3 12h4M17 12h4M5.6 5.6l2.8 2.8M15.6 15.6l2.8 2.8M18.4 5.6l-2.8 2.8M8.4 15.6l-2.8 2.8" />
    </svg>
  );
}

const map = { pen: PenIcon, users: UsersIcon, layers: LayersIcon, spark: SparkIcon };

export function ServiceGlyph({ name, className }: { name: ServiceIcon; className?: string }) {
  const C = map[name];
  return <C className={className} />;
}

/**
 * Directional arrow. Logical "forward" along the reading direction.
 * In RTL it is mirrored automatically (CSS `scale-x-[-1]` via `dir`-aware class
 * is applied by the caller's container); here we render a forward-pointing
 * chevron and rely on the consuming component to flip when needed.
 */
export function ArrowForward({ className }: IconProps) {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.8}
      strokeLinecap="round" strokeLinejoin="round" className={className ?? "h-4 w-4"} aria-hidden>
      <path d="M5 12h14" />
      <path d="M13 6l6 6-6 6" />
    </svg>
  );
}

/** Downward chevron for the "explore the story ↓" hint (non-directional). */
export function ArrowDown({ className }: IconProps) {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.8}
      strokeLinecap="round" strokeLinejoin="round" className={className ?? "h-5 w-5"} aria-hidden>
      <path d="M12 5v14" />
      <path d="M6 13l6 6 6-6" />
    </svg>
  );
}

/** The ✦ portal glyph for the Think Equality gateway marker. */
export function PortalStar({ className }: IconProps) {
  return (
    <svg viewBox="0 0 24 24" fill="currentColor" className={className ?? "h-6 w-6"} aria-hidden>
      <path d="M12 1.5c.5 4.4 2.1 6 6.5 6.5-4.4.5-6 2.1-6.5 6.5-.5-4.4-2.1-6-6.5-6.5 4.4-.5 6-2.1 6.5-6.5Z" />
      <path d="M19 14c.25 2.2 1.05 3 3.25 3.25C20.05 17.5 19.25 18.3 19 20.5c-.25-2.2-1.05-3-3.25-3.25C17.95 17 18.75 16.2 19 14Z" opacity="0.7" />
    </svg>
  );
}
