// =============================================================================
// content.ts — SINGLE SOURCE OF TRUTH for the Night Road (AR + EN).
//
// Every narrative string is a PLACEHOLDER until the client delivers real copy,
// and is visibly marked [محتوى مبدئي] (AR) / [Placeholder] (EN). No biography
// facts are invented here.
//
// The Think Equality gateway URL stays "#" and the WhatsApp number stays
// 9627XXXXXXXX until the client supplies the real ones.
// =============================================================================

export type Locale = "ar" | "en";

/** A bilingual string. */
export type L = { ar: string; en: string };

/** Live elements layered over a painted frame. */
export type LiveBit = "steam" | "flicker" | "kite" | "papers" | "cityLights";

export interface SceneAsset {
  /** Base frame under public/ (source PNG for now; pipeline swaps formats). */
  base: string;
  /** Optional real-alpha foreground layer for 2.5D parallax. */
  fg?: string;
  /** Optional 9:16 variant for narrow viewports. */
  portrait?: string;
  /** Per-frame CSS filter nudge that converges the frames into one grade. */
  grade?: string;
}

export interface Scene {
  key: string;
  /** Kilometre mark the odometer must read when the light reaches the stop. */
  km: number;
  asset: SceneAsset;
  /** Fitted SVG path segment (d) over the painted road — filled via ?fit=1. */
  path?: string;
  /** Optional secondary fitted segment (the fork's branch through the arch). */
  branch?: string;
  live?: LiveBit[];
  title: L;
  body?: L[];
}

export const SRC = "/assets/source";

export const scenes: Scene[] = [
  {
    key: "world",
    km: 0,
    asset: {
      base: `${SRC}/scene-01-world.png`,
      portrait: `${SRC}/scene-01-world-portrait.png`,
    },
    title: { ar: "أحمد قطّان", en: "Ahmad Qattan" },
    body: [
      {
        ar: "سطر تعريفي واحد يُكتب لاحقًا. [محتوى مبدئي]",
        en: "A single introduction line, to be written. [Placeholder]",
      },
    ],
  },
  {
    key: "childhood",
    km: 7,
    asset: {
      base: `${SRC}/scene-02-bg.png`,
      fg: `${SRC}/scene-02-fg.png`,
    },
    live: ["kite", "flicker"],
    title: { ar: "البداية", en: "The Beginning" },
    body: [
      {
        ar: "فقرة عن الطفولة والبيت الأول. [محتوى مبدئي]",
        en: "A paragraph about childhood and the first home. [Placeholder]",
      },
    ],
  },
  {
    key: "station",
    km: 14,
    asset: { base: `${SRC}/scene-03-station.png` },
    live: ["steam", "flicker"],
    title: { ar: "المحطة", en: "The Station" },
    body: [
      {
        ar: "«اقتباس قصير يوضع هنا لاحقًا.» [محتوى مبدئي]",
        en: "“A short quote goes here later.” [Placeholder]",
      },
    ],
  },
  {
    key: "word",
    km: 21,
    asset: { base: `${SRC}/scene-04-pen.png` },
    live: ["papers"],
    title: { ar: "الكلمة", en: "The Word" },
    body: [
      {
        ar: "فقرة عن الكتابة وأثرها. [محتوى مبدئي]",
        en: "A paragraph about writing and its impact. [Placeholder]",
      },
    ],
  },
  {
    key: "training",
    km: 28,
    asset: { base: `${SRC}/scene-05-training.png` },
    live: ["flicker"],
    title: { ar: "التدريب", en: "The Training" },
    body: [
      {
        ar: "فقرة عن التدريب والمنصّة. [محتوى مبدئي]",
        en: "A paragraph about training and the stage. [Placeholder]",
      },
    ],
  },
  {
    key: "fork",
    km: 35,
    asset: { base: `${SRC}/scene-06-fork-arch.png` },
    title: { ar: "المفترق", en: "The Fork" },
    body: [
      {
        ar: "سطر يقدّم Think Equality. [محتوى مبدئي]",
        en: "A line introducing Think Equality. [Placeholder]",
      },
    ],
  },
  {
    key: "dawn",
    km: 39,
    asset: { base: `${SRC}/scene-07-dawn.png` },
    title: { ar: "فجر", en: "Dawn" },
    body: [
      {
        ar: "سطر واحد عن Think Equality. [محتوى مبدئي]",
        en: "One line about Think Equality. [Placeholder]",
      },
    ],
  },
  {
    key: "today",
    km: 43,
    asset: { base: `${SRC}/scene-08-traveler.png` },
    title: { ar: "اليوم", en: "Today" },
    body: [
      {
        ar: "فقرة عن الحاضر. [محتوى مبدئي]",
        en: "A paragraph about the present. [Placeholder]",
      },
    ],
  },
  {
    key: "arrival",
    km: 47,
    asset: {
      base: `${SRC}/scene-09-amman.png`,
      portrait: `${SRC}/scene-09-amman-portrait.png`,
    },
    live: ["cityLights", "flicker"],
    title: { ar: "الوصول", en: "The Arrival" },
    body: [
      {
        ar: "لنتحدّث.",
        en: "Let’s talk.",
      },
    ],
  },
];

/** Total km of the road — the odometer ends here (كم ٤٧). */
export const TOTAL_KM = 47;

/** The Think Equality fork — external portal. URL stays "#" until supplied. */
export const gateway = {
  url: "#",
  name: { ar: "Think Equality", en: "Think Equality" } as L,
  word: { ar: "البوابة", en: "Gate" } as L,
  tag: {
    ar: "سطر تعريفي عن المبادرة. [محتوى مبدئي]",
    en: "A one-liner about the initiative. [Placeholder]",
  } as L,
  cta: { ar: "اعبر البوابة", en: "Cross the gate" } as L,
};

/** WhatsApp CTA — number stays a placeholder until supplied. */
export const whatsapp = {
  number: "9627XXXXXXXX",
  href: "https://wa.me/9627XXXXXXXX",
  label: { ar: "راسلني على واتساب", en: "Message me on WhatsApp" } as L,
};

/** Preloader odometer words (KM 000→100). */
export const preloader = {
  words: [
    { ar: "كاتب", en: "Writer" },
    { ar: "مدرّب", en: "Trainer" },
    { ar: "مؤسّس", en: "Founder" },
  ] as L[],
  name: { ar: "أحمد قطّان", en: "Ahmad Qattan" } as L,
};

/** Footer — Amman live clock + ventures marquee (placeholders). */
export const footer = {
  clockLabel: { ar: "عمّان الآن", en: "Amman, now" } as L,
  ventures: [
    { ar: "مشروع أوّل [محتوى مبدئي]", en: "Venture one [Placeholder]" },
    { ar: "مشروع ثانٍ [محتوى مبدئي]", en: "Venture two [Placeholder]" },
    { ar: "مشروع ثالث [محتوى مبدئي]", en: "Venture three [Placeholder]" },
  ] as L[],
  rights: {
    ar: "© أحمد قطّان. جميع الحقوق محفوظة.",
    en: "© Ahmad Qattan. All rights reserved.",
  } as L,
};

// -----------------------------------------------------------------------------
// Per-locale chrome strings (locale system + metadata consume these).
// -----------------------------------------------------------------------------
export interface LocaleContent {
  meta: {
    title: string;
    description: string;
    keywords: string[];
    siteName: string;
    ogTitle: string;
    ogDescription: string;
  };
  ui: {
    skip: string;
    toggleTo: string;
    toggleAria: string;
    kmWord: string;
    odometerAria: string;
    openExternal: string;
    portalEntering: string;
  };
}

export const content: Record<Locale, LocaleContent> = {
  ar: {
    meta: {
      title: "أحمد قطّان — طريق الليل",
      description:
        "رحلة أحمد قطّان على طريق ذهبي واحد عبر ليل الصحراء الأردنية. [محتوى مبدئي]",
      keywords: ["أحمد قطّان", "كاتب", "مدرّب", "عمّان", "الأردن"],
      siteName: "أحمد قطّان",
      ogTitle: "أحمد قطّان — طريق الليل",
      ogDescription:
        "طريق ذهبي واحد يروي الحكاية من البداية إلى الوصول. [محتوى مبدئي]",
    },
    ui: {
      skip: "تجاوز إلى المحتوى",
      toggleTo: "EN",
      toggleAria: "Switch to English",
      kmWord: "كم",
      odometerAria: "عدّاد المسافة",
      openExternal: "(يفتح في نافذة جديدة)",
      portalEntering: "جارٍ العبور…",
    },
  },
  en: {
    meta: {
      title: "Ahmad Qattan — The Night Road",
      description:
        "Ahmad Qattan’s journey along one golden road through a Jordanian desert night. [Placeholder]",
      keywords: ["Ahmad Qattan", "writer", "trainer", "Amman", "Jordan"],
      siteName: "Ahmad Qattan",
      ogTitle: "Ahmad Qattan — The Night Road",
      ogDescription:
        "One golden road tells the story, from the beginning to the arrival. [Placeholder]",
    },
    ui: {
      skip: "Skip to content",
      toggleTo: "ع",
      toggleAria: "التبديل إلى العربية",
      kmWord: "km",
      odometerAria: "Distance odometer",
      openExternal: "(opens in a new tab)",
      portalEntering: "Crossing…",
    },
  },
};
