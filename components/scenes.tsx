import type { SceneRef } from "@/lib/content";
import type { RoadMap } from "./Scene";

/* =============================================================================
   THE SCENES, DRAWN IN CODE.
   Every chapter's world is a hand-authored SVG composition in one shared
   visual language: deep indigo night, dark dune silhouettes, one glowing
   golden road, warm window-light. Because the road inside each scene is a
   vector, it is LITERALLY the same light as the drawn journey line — the
   engine's road maps below are exact by construction, not estimated.

   Frame: 1000×1000, preserveAspectRatio "slice" (behaves like object-fit:
   cover). Compositions keep their subjects inside the safe zone that
   survives both crops (mobile 2:3 → x∈[167,833]; desktop 16:9 → y∈[219,781]).
   ============================================================================= */

const GOLD = "#f0a83a";
const GOLD_SOFT = "#ffd479";
const GOLD_PALE = "#ffe9b0";

/** Deterministic pseudo-random (stable across SSR/CSR). */
function rnd(seed: number): number {
  const x = Math.sin(seed * 127.1 + 311.7) * 43758.5453;
  return x - Math.floor(x);
}

/* ---------------------------------------------------------------------------
   Shared pieces
   --------------------------------------------------------------------------- */

function Stars({ n, seed, yMax = 420 }: { n: number; seed: number; yMax?: number }) {
  const stars = Array.from({ length: n }, (_, i) => ({
    x: rnd(seed + i) * 1000,
    y: rnd(seed + i + 50) * yMax,
    r: rnd(seed + i + 100) < 0.8 ? 1.1 : 1.8,
    o: 0.25 + rnd(seed + i + 150) * 0.5,
    d: rnd(seed + i + 200) * 4,
  }));
  return (
    <g>
      {stars.map((s, i) => (
        <circle
          key={i}
          cx={s.x}
          cy={s.y}
          r={s.r}
          fill="#f4e9cd"
          opacity={s.o}
          className="tw"
          style={{ animationDelay: `${s.d}s` }}
        />
      ))}
    </g>
  );
}

/** The glowing road: soft halo stroke + hot core, dimming into the distance. */
function Road({ id, d, w = 7 }: { id: string; d: string; w?: number }) {
  return (
    <g>
      <path d={d} stroke={GOLD} strokeWidth={w * 4.2} strokeLinecap="round" fill="none" opacity="0.16" filter={`url(#${id}-blur)`} />
      <path d={d} stroke={GOLD_SOFT} strokeWidth={w * 1.9} strokeLinecap="round" fill="none" opacity="0.35" filter={`url(#${id}-blur)`} />
      <path d={d} stroke={`url(#${id}-roadgrad)`} strokeWidth={w} strokeLinecap="round" fill="none" />
    </g>
  );
}

/** A lit window — breathes like lamplight. */
function Window({ x, y, w, h, delay = 0, o = 0.95 }: { x: number; y: number; w: number; h: number; delay?: number; o?: number }) {
  return (
    <rect
      x={x}
      y={y}
      width={w}
      height={h}
      fill={GOLD_SOFT}
      opacity={o}
      className="fl"
      style={{ animationDelay: `${delay}s` }}
    />
  );
}

function Palm({ x, y, s = 1, flip = false }: { x: number; y: number; s?: number; flip?: boolean }) {
  return (
    <g transform={`translate(${x} ${y}) scale(${flip ? -s : s} ${s})`} fill="#0d0f16">
      <path d="M0 0 C -3 -40, -1 -80, 2 -110 L 8 -110 C 6 -80, 7 -40, 10 0 Z" />
      <path d="M5 -108 C -30 -125, -60 -122, -80 -108 C -52 -122, -22 -118, 5 -104 Z" />
      <path d="M5 -108 C 40 -125, 70 -122, 90 -108 C 62 -122, 32 -118, 5 -104 Z" />
      <path d="M5 -110 C -18 -140, -42 -150, -66 -148 C -40 -152, -14 -138, 6 -112 Z" />
      <path d="M5 -110 C 28 -140, 52 -150, 76 -148 C 50 -152, 24 -138, 4 -112 Z" />
      <path d="M4 -112 C 0 -145, 2 -160, 6 -170 C 8 -156, 8 -138, 8 -112 Z" />
    </g>
  );
}

/** Frame shared by every scene: sky, horizon glow, dunes, stars, road. */
function Frame({
  id,
  horizon = [510, 452] as [number, number],
  warm = 0,
  road,
  roadW,
  stars = 26,
  seed = 1,
  children,
  behindRoad,
  label,
}: {
  id: string;
  horizon?: [number, number];
  warm?: number; // 0 night → 1 dawn
  road: string;
  roadW?: number;
  stars?: number;
  seed?: number;
  children?: React.ReactNode;
  behindRoad?: React.ReactNode;
  label: string;
}) {
  const [hx, hy] = horizon;
  return (
    <svg
      className="scene__img scene__art"
      viewBox="0 0 1000 1000"
      preserveAspectRatio="xMidYMid slice"
      role="img"
      aria-label={label}
    >
      <defs>
        <linearGradient id={`${id}-sky`} x1="0" y1="0" x2="0" y2="1">
          <stop offset="0" stopColor="#04060d" />
          <stop offset="0.32" stopColor="#070b16" />
          <stop offset={String(0.45 - warm * 0.06)} stopColor={warm > 0.5 ? "#2b1a08" : "#0b1020"} />
          <stop offset="0.47" stopColor={warm > 0.5 ? "#5a3410" : "#191408"} />
          <stop offset="0.52" stopColor={warm > 0.5 ? "#3a2208" : "#0e0c09"} />
          <stop offset="1" stopColor="#08070a" />
        </linearGradient>
        <radialGradient id={`${id}-glowh`} cx="0.5" cy="0.5" r="0.5">
          <stop offset="0" stopColor={GOLD_PALE} stopOpacity={0.85} />
          <stop offset="0.35" stopColor={GOLD} stopOpacity={0.35} />
          <stop offset="1" stopColor={GOLD} stopOpacity="0" />
        </radialGradient>
        <linearGradient id={`${id}-roadgrad`} x1="0" y1="1" x2="0" y2="0">
          <stop offset="0" stopColor={GOLD_SOFT} />
          <stop offset="0.55" stopColor={GOLD} />
          <stop offset="1" stopColor="#a8721f" />
        </linearGradient>
        <filter id={`${id}-blur`} x="-60%" y="-60%" width="220%" height="220%">
          <feGaussianBlur stdDeviation="7" />
        </filter>
        <filter id={`${id}-blur2`} x="-80%" y="-80%" width="260%" height="260%">
          <feGaussianBlur stdDeviation="14" />
        </filter>
      </defs>

      <rect width="1000" height="1000" fill={`url(#${id}-sky)`} />
      <Stars n={stars} seed={seed} />
      {/* Horizon light */}
      <ellipse cx={hx} cy={hy} rx={330} ry={78} fill={`url(#${id}-glowh)`} />

      {/* Far and near dunes — separated tones, faint crest light near the glow */}
      <path d="M0 470 Q 140 440 300 462 T 620 452 T 1000 466 L 1000 1000 L 0 1000 Z" fill="#0b0d14" />
      <path d="M0 468 Q 140 438 300 460 T 620 450 T 1000 464" stroke="#2a2416" strokeWidth="1.5" fill="none" opacity="0.5" />
      <path d="M0 560 Q 180 520 380 548 T 740 538 T 1000 556 L 1000 1000 L 0 1000 Z" fill="#0e1017" />
      <path d="M0 700 Q 240 650 480 690 T 1000 686 L 1000 1000 L 0 1000 Z" fill="#12111a" />

      {behindRoad}
      <Road id={id} d={road} w={roadW} />
      {children}

      {/* Ground vignette */}
      <rect width="1000" height="1000" fill={`url(#${id}-vig)`} opacity="0.5" />
      <radialGradient id={`${id}-vig`} cx="0.5" cy="0.45" r="0.75">
        <stop offset="0.6" stopColor="#000" stopOpacity="0" />
        <stop offset="1" stopColor="#04060d" stopOpacity="0.9" />
      </radialGradient>
    </svg>
  );
}

/* ---------------------------------------------------------------------------
   The ten scenes
   --------------------------------------------------------------------------- */

/** The standard winding road: bottom centre → horizon. Exact map below. */
const ROAD_S = "M 465 1010 C 540 900, 420 795, 475 690 C 520 605, 465 535, 505 458";

function Traveler({ label }: { label: string }) {
  return (
    <Frame id="sc-trav" road={ROAD_S} seed={7} label={label}>
      {/* The man, from behind, on the road */}
      <g fill="#0a0b10">
        <circle cx="487" cy="700" r="13" />
        <path d="M474 712 C 470 745, 472 775, 476 800 L 483 800 L 486 758 L 490 758 L 494 800 L 500 800 C 504 775, 505 745, 500 712 C 494 706, 480 706, 474 712 Z" />
      </g>
      {/* Rim light on his shoulders from the road */}
      <path d="M475 714 C 482 709, 493 709, 499 714" stroke={GOLD} strokeWidth="2.5" fill="none" opacity="0.7" />
    </Frame>
  );
}

function Childhood({ label }: { label: string }) {
  return (
    <Frame id="sc-child" road={ROAD_S} seed={11} label={label}
      behindRoad={
        <g>
          {/* Stone house with one warm window */}
          <g fill="#151220">
            <rect x="235" y="565" width="130" height="88" />
            <path d="M228 566 L 300 538 L 372 566 Z" />
          </g>
          <path d="M228 566 L 300 538 L 372 566" stroke="#2b2438" strokeWidth="1.5" fill="none" opacity="0.7" />
          <Window x={272} y={588} w={26} h={30} delay={0.6} />
          <ellipse cx={285} cy={604} rx={46} ry={30} fill={GOLD} opacity="0.08" />
          <Palm x={215} y={568} s={0.75} />
          <Palm x={392} y={574} s={0.6} flip />
        </g>
      }
    >
      {/* The child, walking, with a small bag */}
      <g fill="#0a0b10">
        <circle cx="472" cy="726" r="10" />
        <path d="M462 735 C 459 760, 461 782, 466 798 L 472 798 L 473 766 L 476 766 L 480 797 L 486 797 C 489 780, 488 758, 483 735 C 477 730, 467 730, 462 735 Z" />
        <path d="M483 745 l 12 6 l -2 14 l -11 -5 Z" />
      </g>
      <path d="M463 737 C 469 733, 478 733, 483 737" stroke={GOLD} strokeWidth="2" fill="none" opacity="0.7" />
      {/* The kite, glowing, swaying — its string traces back to the child */}
      <g className="sway" style={{ transformOrigin: "672px 258px" }}>
        <path d="M 672 228 L 700 258 L 672 292 L 644 258 Z" fill={GOLD_SOFT} opacity="0.92" />
        <path d="M 672 292 C 668 306, 678 314, 672 328" stroke={GOLD} strokeWidth="2" fill="none" opacity="0.7" />
        <circle cx="675" cy="306" r="3" fill={GOLD} opacity="0.8" />
        <circle cx="671" cy="326" r="2.5" fill={GOLD} opacity="0.6" />
      </g>
      <path d="M 484 744 C 560 650, 636 470, 671 292" stroke={GOLD_PALE} strokeWidth="1" fill="none" opacity="0.25" />
    </Frame>
  );
}

function Station({ label }: { label: string }) {
  return (
    <Frame id="sc-stn" road={ROAD_S} seed={17} label={label}
      behindRoad={
        <g>
          <Palm x={215} y={560} s={0.8} />
          <Palm x={175} y={585} s={0.55} flip />
          {/* Distant town lights */}
          {Array.from({ length: 9 }, (_, i) => (
            <circle key={i} cx={640 + rnd(i + 3) * 260} cy={447 + rnd(i + 9) * 8} r={1.6} fill={GOLD} opacity={0.5} className="tw" style={{ animationDelay: `${rnd(i) * 3}s` }} />
          ))}
          {/* The kiosk */}
          <g fill="#181523">
            <rect x="240" y="590" width="150" height="105" />
            <rect x="228" y="578" width="174" height="14" />
          </g>
          <path d="M228 578 L 402 578" stroke="#2d2740" strokeWidth="1.5" opacity="0.8" />
          <rect x="258" y="608" width="80" height="52" fill={GOLD_SOFT} opacity="0.9" className="fl" style={{ animationDelay: "1.2s" }} />
          {/* Kettle silhouette + steam inside the lit window */}
          <path d="M282 646 a 10 9 0 1 0 20 0 l -2 -8 l -16 0 Z M302 642 l 8 -5 l 2 3 l -8 5 Z" fill="#1c1405" />
          <path d="M292 632 c -3 -7, 3 -9, 0 -16" stroke="#1c1405" strokeWidth="1.6" fill="none" opacity="0.75" className="steam" />
          {/* Light spilling from the window onto the ground */}
          <path d="M 258 660 L 338 660 L 372 706 L 232 706 Z" fill={GOLD} opacity="0.09" />
          {/* Bench + lamp post */}
          <g fill="#181523">
            <rect x="425" y="668" width="66" height="7" />
            <rect x="430" y="675" width="7" height="18" />
            <rect x="478" y="675" width="7" height="18" />
            <rect x="206" y="480" width="6" height="112" />
            <path d="M209 480 C 209 462, 232 462, 236 472 L 242 480 Z" />
          </g>
          <circle cx="238" cy="484" r="7" fill={GOLD_SOFT} className="fl" />
          <path d="M 238 492 L 214 588 L 268 588 Z" fill={GOLD} opacity="0.08" />
        </g>
      }
    />
  );
}

function Pen({ label }: { label: string }) {
  return (
    <Frame id="sc-pen" road="M 430 1010 C 520 880, 350 770, 450 655 C 540 560, 450 520, 500 455" seed={23} label={label}>
      {/* The nib monument */}
      <g>
        <path d="M 655 690 L 645 560 C 645 520, 660 480, 672 462 C 684 480, 699 520, 699 560 L 689 690 Z" fill="#181423" />
        <path d="M 672 468 L 672 560" stroke="#070609" strokeWidth="4" />
        <circle cx="672" cy="560" r="8" fill="#070609" />
        <rect x="638" y="690" width="68" height="26" fill="#131019" />
        <rect x="630" y="716" width="84" height="14" fill="#0e0c12" />
        {/* Road-light licking the base + rim light up the left edge */}
        <ellipse cx="660" cy="730" rx="90" ry="26" fill={GOLD} opacity="0.12" />
        <path d="M 655 688 L 646 562 C 646 524, 660 486, 671 465" stroke={GOLD} strokeWidth="2" opacity="0.55" fill="none" />
        <circle cx="672" cy="462" r="5" fill={GOLD_PALE} opacity="0.9" className="fl" />
      </g>
      {/* Pages lifting off the tip, scattering into the night */}
      {Array.from({ length: 6 }, (_, i) => {
        const t = i / 5;
        const px = 672 + 20 + t * 105 - Math.sin(t * Math.PI) * 22;
        const py = 448 - t * 130 + Math.sin(t * 6) * 10;
        return (
          <g key={i} className="drift" style={{ animationDelay: `${i * 1.3}s`, transformOrigin: `${px}px ${py}px` }}>
            <path
              d={`M ${px} ${py} l ${16 - t * 5} ${-5 + t * 2} l 2 ${11 - t * 3} l ${-(16 - t * 5)} ${5 - t * 2} Z`}
              fill={i % 2 ? GOLD_SOFT : "#e8d9b2"}
              opacity={0.9 - t * 0.55}
              transform={`rotate(${-12 + t * 40} ${px} ${py})`}
            />
          </g>
        );
      })}
    </Frame>
  );
}

function Training({ label }: { label: string }) {
  return (
    <Frame id="sc-trn" road="M 380 1010 C 470 880, 330 770, 430 660 C 520 570, 450 520, 498 455" seed={31} label={label}
      behindRoad={
        <g>
          {/* Stage: curved stone shell, lit from a single lamp */}
          <path d="M 600 690 C 600 620, 700 600, 780 618 L 792 700 Z" fill="#15120f" />
          <ellipse cx="695" cy="700" rx="105" ry="16" fill="#191512" />
          <ellipse cx="695" cy="697" rx="88" ry="11" fill={GOLD} opacity="0.22" />
          {/* Mic stand */}
          <rect x="693" y="648" width="2.6" height="48" fill="#060709" />
          <circle cx="694" cy="645" r="4" fill="#060709" />
          {/* Lamp post */}
          <rect x="606" y="520" width="5" height="172" fill="#181523" />
          <path d="M608 520 C 608 504, 630 504, 634 514 L 640 521 Z" fill="#181523" />
          <circle cx="636" cy="525" r="6.5" fill={GOLD_SOFT} className="fl" />
          <path d="M 636 532 L 600 690 L 692 690 Z" fill={GOLD} opacity="0.08" />
        </g>
      }
    >
      {/* The audience — quiet heads under the stars */}
      {Array.from({ length: 18 }, (_, i) => {
        const row = Math.floor(i / 6);
        const col = i % 6;
        const x = 596 + col * 34 + rnd(i) * 10 - row * 8;
        const y = 738 + row * 26 + rnd(i + 40) * 6;
        return (
          <g key={i} fill="#0a0b10">
            <circle cx={x} cy={y} r={7 + row} />
            <rect x={x - 8 - row} y={y + 4} width={16 + row * 2} height={14 + row * 2} rx={4} />
          </g>
        );
      })}
    </Frame>
  );
}

function ForkArch({ label }: { label: string }) {
  return (
    <Frame id="sc-arch" road="M 470 1010 C 560 880, 420 760, 480 640 C 510 580, 495 540, 500 470" roadW={7} seed={37} label={label}
      behindRoad={
        <g>
          {/* Dawn, visible only through the arch */}
          <radialGradient id="sc-arch-dawn" cx="0.5" cy="0.6" r="0.6">
            <stop offset="0" stopColor="#ffe9b0" stopOpacity="0.95" />
            <stop offset="0.5" stopColor="#f0a83a" stopOpacity="0.5" />
            <stop offset="1" stopColor="#f0a83a" stopOpacity="0" />
          </radialGradient>
          <path d="M 452 610 L 452 505 C 452 448, 548 448, 548 505 L 548 610 Z" fill="url(#sc-arch-dawn)" />
          {/* The arch stones */}
          <g fill="#161217">
            <path d="M 428 616 L 428 500 C 428 425, 572 425, 572 500 L 572 616 L 544 616 L 544 505 C 544 452, 456 452, 456 505 L 456 616 Z" />
            <rect x="418" y="610" width="52" height="10" />
            <rect x="530" y="610" width="52" height="10" />
          </g>
          {/* Inner-edge dawn light on the stones */}
          <path d="M 456 612 L 456 505 C 456 455, 544 455, 544 505 L 544 612" stroke={GOLD_PALE} strokeWidth="3" fill="none" opacity="0.5" />
          {/* The other road — the branch that stays in the night */}
          <path d="M 505 630 C 640 640, 760 700, 900 780" stroke={GOLD} strokeWidth="4" fill="none" opacity="0.3" />
        </g>
      }
    />
  );
}

function Dawn({ label }: { label: string }) {
  return (
    <Frame
      id="sc-dawn"
      warm={1}
      horizon={[520, 430]}
      road="M 480 1010 C 620 900, 340 800, 480 700 C 620 610, 380 560, 500 480 C 545 450, 510 445, 520 430"
      seed={41}
      stars={8}
      label={label}
    >
      {/* The low sun */}
      <circle cx="520" cy="418" r="26" fill={GOLD_PALE} opacity="0.95" />
      <circle cx="520" cy="418" r="60" fill={GOLD} opacity="0.25" filter="url(#sc-dawn-blur2)" />
      {/* Palms as small far silhouettes */}
      <Palm x={300} y={640} s={0.4} />
      <Palm x={700} y={720} s={0.5} flip />
      <Palm x={620} y={585} s={0.3} />
    </Frame>
  );
}

function Impact({ label }: { label: string }) {
  return (
    <Frame id="sc-imp" road={ROAD_S} seed={43} label={label}>
      {/* Milestones along the roadside, receding — each with a lit plate */}
      {Array.from({ length: 5 }, (_, i) => {
        const t = i / 4;
        const x = 600 + t * -20 + i * 34;
        const y = 520 + t * 260;
        const s = 0.45 + t * 0.85;
        return (
          <g key={i} transform={`translate(${x} ${y}) scale(${s})`}>
            <path d="M -16 40 L -16 -18 C -16 -34, 16 -34, 16 -18 L 16 40 Z" fill="#141117" />
            <rect x="-9" y="-14" width="18" height="24" rx="3" fill={GOLD_SOFT} opacity="0.9" className="fl" style={{ animationDelay: `${i * 0.9}s` }} />
            <ellipse cx="0" cy="42" rx="26" ry="7" fill={GOLD} opacity="0.14" />
          </g>
        );
      })}
    </Frame>
  );
}

function Voices({ label }: { label: string }) {
  return (
    <Frame id="sc-voc" road="M 560 1010 C 640 880, 500 770, 560 655 C 610 565, 480 520, 508 455" seed={47} label={label}>
      {/* The campfire circle */}
      <g>
        <ellipse cx="310" cy="740" rx="120" ry="26" fill={GOLD} opacity="0.1" />
        {/* Fire */}
        <g className="fire" style={{ transformOrigin: "310px 720px" }}>
          <path d="M 310 690 C 318 702, 322 710, 316 722 C 328 716, 328 704, 324 696 C 334 706, 336 720, 326 730 L 294 730 C 284 718, 288 700, 298 692 C 294 704, 298 714, 304 720 C 300 708, 302 698, 310 690 Z" fill={GOLD_SOFT} />
        </g>
        <ellipse cx="310" cy="731" rx="20" ry="5" fill="#100c08" />
        {/* Companions, seated */}
        {[
          [252, 716, 1],
          [368, 716, -1],
          [282, 742, 1],
          [340, 744, -1],
        ].map(([x, y, f], i) => (
          <g key={i} transform={`translate(${x} ${y}) scale(${f as number} 1)`} fill="#0a0b10">
            <circle cx="0" cy="-22" r="9" />
            <path d="M -12 -14 C -14 0, -12 10, -6 14 L 12 14 C 14 4, 12 -8, 8 -14 Z" />
          </g>
        ))}
        {/* Embers rising */}
        {Array.from({ length: 6 }, (_, i) => (
          <circle
            key={i}
            cx={302 + rnd(i + 5) * 20}
            cy={690}
            r={1.6 + rnd(i) * 1.2}
            fill={GOLD_SOFT}
            className="ember"
            style={{ animationDelay: `${i * 1.4}s` }}
          />
        ))}
      </g>
    </Frame>
  );
}

function Amman({ label }: { label: string }) {
  // The hill city: deterministic terraces of small houses, windows breathing.
  const houses = Array.from({ length: 90 }, (_, i) => {
    const band = Math.floor(i / 18); // 5 terraces up the hill
    const t = (i % 18) / 17;
    const y = 300 + band * 52 + rnd(i + 2) * 26;
    const x = 90 + t * 820 + rnd(i) * 34 - Math.sin(t * Math.PI) * (band * -14);
    const w = 26 + rnd(i + 7) * 22;
    const h = 22 + rnd(i + 13) * 20;
    return { x, y, w, h, i };
  });
  return (
    <Frame
      id="sc-amm"
      horizon={[500, 330]}
      road="M 470 1010 C 570 880, 400 760, 490 640 C 560 545, 470 470, 500 380"
      seed={53}
      label={label}
      behindRoad={
        <g>
          {/* Warm city haze — a gradient breath, not a disk */}
          <radialGradient id="sc-amm-haze" cx="0.5" cy="0.5" r="0.5">
            <stop offset="0" stopColor={GOLD} stopOpacity="0.16" />
            <stop offset="0.55" stopColor={GOLD} stopOpacity="0.07" />
            <stop offset="1" stopColor={GOLD} stopOpacity="0" />
          </radialGradient>
          <ellipse cx="500" cy="400" rx="520" ry="200" fill="url(#sc-amm-haze)" />
          {/* The hill mass */}
          <path d="M 0 470 C 200 330, 380 290, 520 292 C 700 294, 860 350, 1000 460 L 1000 700 L 0 700 Z" fill="#0a0b11" />
          <path d="M 0 470 C 200 330, 380 290, 520 292 C 700 294, 860 350, 1000 460" stroke="#241d10" strokeWidth="1.5" fill="none" opacity="0.6" />
          {/* A minaret on the crest */}
          <g fill="#12131b">
            <rect x="512" y="238" width="9" height="56" />
            <path d="M508 238 L 516.5 222 L 525 238 Z" />
          </g>
          <circle cx="516.5" cy="245" r="2.4" fill={GOLD_SOFT} className="tw" />
          {/* Houses */}
          {houses.map((hse) => (
            <g key={hse.i}>
              <rect x={hse.x} y={hse.y} width={hse.w} height={hse.h} fill="#13141d" />
              {rnd(hse.i + 31) > 0.28 ? (
                <Window
                  x={hse.x + 4 + rnd(hse.i + 17) * (hse.w - 12)}
                  y={hse.y + 4 + rnd(hse.i + 23) * (hse.h - 14)}
                  w={6.5}
                  h={8.5}
                  o={0.55 + rnd(hse.i + 41) * 0.45}
                  delay={rnd(hse.i + 43) * 6}
                />
              ) : null}
            </g>
          ))}
        </g>
      }
    />
  );
}

/* ---------------------------------------------------------------------------
   Registry + EXACT road maps (fractions of the 1000×1000 frame)
   --------------------------------------------------------------------------- */

export function SceneArt({ id, label }: { id: SceneRef["id"]; label: string }) {
  switch (id) {
    case "traveler": return <Traveler label={label} />;
    case "childhood": return <Childhood label={label} />;
    case "station": return <Station label={label} />;
    case "pen": return <Pen label={label} />;
    case "training": return <Training label={label} />;
    case "fork-arch": return <ForkArch label={label} />;
    case "dawn": return <Dawn label={label} />;
    case "impact": return <Impact label={label} />;
    case "testimonials": return <Voices label={label} />;
    case "amman": return <Amman label={label} />;
  }
}

/** The road maps are exact: they are the control points of the authored
 *  vector roads above, expressed as fractions of the frame. */
export const SCENE_ROADS_ART: Record<SceneRef["id"], RoadMap> = {
  traveler: { entry: [0.505, 0.455], mids: [[0.5, 0.56], [0.48, 0.66], [0.5, 0.82]], exit: 0.47 },
  childhood: { entry: [0.505, 0.455], mids: [[0.5, 0.56], [0.48, 0.66], [0.5, 0.82]], exit: 0.47 },
  station: { entry: [0.505, 0.455], mids: [[0.5, 0.56], [0.48, 0.66], [0.5, 0.82]], exit: 0.47 },
  pen: { entry: [0.5, 0.455], mids: [[0.49, 0.56], [0.45, 0.655], [0.46, 0.82]], exit: 0.43 },
  training: { entry: [0.498, 0.455], mids: [[0.48, 0.57], [0.43, 0.66], [0.42, 0.82]], exit: 0.38 },
  "fork-arch": { entry: [0.5, 0.47], mids: [[0.495, 0.56], [0.48, 0.64], [0.5, 0.8]], exit: 0.47 },
  dawn: { entry: [0.52, 0.43], mids: [[0.5, 0.48], [0.47, 0.56], [0.5, 0.7], [0.48, 0.85]], exit: 0.48 },
  impact: { entry: [0.505, 0.455], mids: [[0.5, 0.56], [0.48, 0.66], [0.5, 0.82]], exit: 0.47 },
  testimonials: { entry: [0.508, 0.455], mids: [[0.53, 0.56], [0.56, 0.66], [0.57, 0.82]], exit: 0.56 },
  amman: { entry: [0.5, 0.38], mids: [[0.5, 0.47], [0.49, 0.56], [0.49, 0.66], [0.5, 0.82]], exit: 0.47 },
};
