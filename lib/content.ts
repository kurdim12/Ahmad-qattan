// =============================================================================
// content.ts — SINGLE SOURCE OF TRUTH for all copy (AR + EN).
// The client edits everything here, in one place.
//
// AUTHENTICITY RULE (from the creative direction): never invent biography,
// achievements, quotes or statistics. Every string that awaits Ahmad's real
// words is marked [محتوى مبدئي] (AR) / [Placeholder] (EN).
// =============================================================================

export type Locale = "ar" | "en";

/** One of the night-road paintings in public/assets/scenes/.
 *  `id` maps to `<id>.webp` (wide, desktop) + `<id>-tall.webp` (2:3, phones).
 *  `focus` is the CSS object-position for the wide crop. */
export interface SceneRef {
  id:
    | "traveler"
    | "childhood"
    | "station"
    | "pen"
    | "training"
    | "fork-arch"
    | "dawn"
    | "amman"
    | "impact"
    | "testimonials";
  alt: string;
  focus?: string;
}

/** A chapter of the journey. The visitor never leaves the road:
 *  scene (a painting the road passes through) → chapter word → words/beat. */
export interface Chapter {
  key: string;
  /** The huge chapter word — a title card carved over the night. */
  word: string;
  /** Small kicker above the word (chapter numbering as prose, not UI). */
  kicker: string;
  /** Ink paragraphs. Optional — some chapters speak through their beat. */
  body?: string[];
  scene: SceneRef;
  /** Optional second painting inside the chapter (dawn after the arch,
   *  the campfire under the voices). */
  scene2?: SceneRef;
  /** The craft list — typographic, no icons. */
  craft?: { name: string; desc: string }[];
  /** Headline numbers. Never fabricated — placeholders stay ٠٠ until real. */
  stats?: { n: string; l: string }[];
  /** Roadside voices — named, outcome-specific quotes. */
  voices?: { quote: string; who: string }[];
  /** The crossing — Think Equality. */
  gateway?: { name: string; tag: string; body: string; cta: string; url: string };
  /** The destination block. */
  contact?: {
    whatsapp: { label: string; number: string; href: string };
    location: string;
    closing: string;
  };
}

export interface LocaleContent {
  meta: {
    title: string;
    description: string;
    ogTitle: string;
    ogDescription: string;
    siteName: string;
    keywords: string[];
  };
  ui: {
    skip: string;
    toggleTo: string;
    toggleAria: string;
    progressAria: string;
    scrollHint: string;
    openExternal: string;
    contactPill: string;
    portalEntering: string;
    footnote: string;
  };
  hero: {
    /** Small line above the name — who he is. */
    eyebrow: string;
    /** THE landmark. */
    name: string;
    /** One plain sentence: who he helps and what changes for them. */
    positioning: string;
    cta: string;
    scene: SceneRef;
  };
  chapters: Chapter[];
}

export type Content = Record<Locale, LocaleContent>;

// -----------------------------------------------------------------------------
// AR — Arabic (default, RTL)
// -----------------------------------------------------------------------------
const ar: LocaleContent = {
  meta: {
    title: "أحمد قطان — الرحلة",
    description:
      "[محتوى مبدئي] رحلة على طريق مضيء في ليل الصحراء الأردنية — حياة أحمد قطان، كاتب ومدرّب، فصلًا بعد فصل حتى عمّان.",
    ogTitle: "أحمد قطان — الرحلة",
    ogDescription:
      "[محتوى مبدئي] كاتب ومدرّب. طريق واحد يعبر الليل نحو عمّان — سِر معه.",
    siteName: "أحمد قطان",
    keywords: ["أحمد قطان", "كاتب", "مدرّب", "ثينك إكوالتي", "عمّان", "الأردن"],
  },
  ui: {
    skip: "تجاوز إلى المحتوى",
    toggleTo: "EN",
    toggleAria: "التبديل إلى الإنجليزية",
    progressAria: "الرحلة على الطريق",
    scrollHint: "سِر على الطريق",
    openExternal: "(يفتح في نافذة جديدة)",
    contactPill: "تواصل",
    portalEntering: "نعبر إلى ثينك إكوالتي…",
    footnote: "[محتوى مبدئي] جميع النصوص مبدئية بانتظار كلمات أحمد الحقيقية.",
  },
  hero: {
    eyebrow: "كاتب ومدرّب",
    name: "أحمد قطان",
    positioning:
      "[محتوى مبدئي] جملة واحدة واضحة: من يساعد أحمد، وما الذي يتغيّر في حياتهم بعد أن يلتقوه.",
    cta: "ابدأ الرحلة",
    scene: {
      id: "traveler",
      alt: "مسافر يقف على طريق ذهبي مضيء وسط ليل الصحراء، يتأمل ضوء الأفق",
      focus: "42% 62%",
    },
  },
  chapters: [
    {
      key: "beginning",
      kicker: "الفصل الأول",
      word: "البداية",
      scene: {
        id: "childhood",
        alt: "طفل يمشي على طريق متوهّج ليلًا، وطائرة ورقية مضيئة في السماء",
        focus: "42% 65%",
      },
      body: [
        "[محتوى مبدئي] من أين بدأ الطريق: البيت الأول، الضوء الأول، أول كلمة قرأها فغيّرت شيئًا في داخله.",
        "[محتوى مبدئي] سطر يمهّد لما ستصبح عليه هذه البداية لاحقًا.",
      ],
    },
    {
      key: "road",
      kicker: "الفصل الثاني",
      word: "الطريق",
      scene: {
        id: "station",
        alt: "استراحة شاي صغيرة مضاءة على كتف الطريق في الليل",
        focus: "35% 58%",
      },
      body: [
        "[محتوى مبدئي] سنوات المشي: المحطات التي توقّف عندها، وما تعلّمه من كل استراحة على الطريق.",
        "[محتوى مبدئي] نقطة التحوّل التي جعلت الكتابة قرارًا لا صدفة.",
      ],
    },
    {
      key: "craft",
      kicker: "الفصل الثالث",
      word: "الحرفة",
      scene: {
        id: "pen",
        alt: "نصب حجري على شكل ريشة قلم يقف قرب الطريق، وأوراق مضيئة تتطاير منه",
        focus: "40% 58%",
      },
      body: [
        "[محتوى مبدئي] سطر واحد يلخّص علاقته بالكلمة: لماذا يكتب، ولمن.",
      ],
      craft: [
        { name: "الكتابة", desc: "[محتوى مبدئي] وصف من سطر واحد." },
        { name: "التدريب", desc: "[محتوى مبدئي] وصف من سطر واحد." },
        { name: "صناعة المحتوى", desc: "[محتوى مبدئي] وصف من سطر واحد." },
        { name: "المبادرات", desc: "[محتوى مبدئي] وصف من سطر واحد." },
      ],
    },
    {
      key: "voice",
      kicker: "الفصل الرابع",
      word: "الصوت",
      scene: {
        id: "training",
        alt: "منصة صغيرة مضاءة في العراء وجمهور جالس تحت النجوم قرب الطريق",
        focus: "55% 60%",
      },
      body: [
        "[محتوى مبدئي] حين وقف أمام الناس أول مرة: ما الذي يؤمن به، وما الذي يحاول أن يوقظه في من يدرّبهم.",
        "[محتوى مبدئي] سطر عن القيم التي لا يساوم عليها.",
      ],
    },
    {
      key: "crossing",
      kicker: "الفصل الخامس",
      word: "العبور",
      scene: {
        id: "fork-arch",
        alt: "قوس حجري قديم عند مفترق: عبره يبدأ ضوء الفجر، وحوله يستمر الليل",
        focus: "45% 52%",
      },
      scene2: {
        id: "dawn",
        alt: "الطريق الذهبي يعبر الصحراء كلها نحو شمس منخفضة — العالم بعد العبور",
        focus: "55% 50%",
      },
      gateway: {
        name: "Think Equality",
        tag: "[محتوى مبدئي] ما هي ثينك إكوالتي في سطر.",
        body: "[محتوى مبدئي] ليست موقعًا آخر — إنها ما صنعته الرحلة. جملة تدعو الزائر للعبور.",
        cta: "اعبر البوابة",
        url: "#",
      },
    },
    {
      key: "impact",
      kicker: "الفصل السادس",
      word: "الأثر",
      scene: {
        id: "impact",
        alt: "أحجار معالم متوهجة على جانب الطريق الذهبي الممتد نحو الأفق",
        focus: "50% 50%",
      },
      scene2: {
        id: "testimonials",
        alt: "نار مخيّم صغيرة يجلس حولها رفاق الطريق تحت النجوم",
        focus: "50% 50%",
      },
      stats: [
        { n: "٠٠+", l: "[محتوى مبدئي] مؤشر أول" },
        { n: "٠٠", l: "[محتوى مبدئي] مؤشر ثانٍ" },
        { n: "٠٠+", l: "[محتوى مبدئي] مؤشر ثالث" },
      ],
      voices: [
        {
          quote: "[محتوى مبدئي] اقتباس حقيقي محدد الأثر من شخص عمل مع أحمد.",
          who: "[محتوى مبدئي] الاسم، الصفة",
        },
        {
          quote: "[محتوى مبدئي] اقتباس ثانٍ يذكر نتيجة ملموسة.",
          who: "[محتوى مبدئي] الاسم، الصفة",
        },
      ],
    },
    {
      key: "arrival",
      kicker: "الفصل الأخير",
      word: "الوصول",
      scene: {
        id: "amman",
        alt: "عمّان ليلًا: تلال مضاءة بآلاف النوافذ والطريق الذهبي يدخل المدينة",
        focus: "50% 62%",
      },
      body: ["[محتوى مبدئي] سطر ختامي: الطريق لا ينتهي في عمّان — يبدأ منها من جديد."],
      contact: {
        whatsapp: {
          label: "تواصل عبر واتساب",
          number: "+962 7 0000 0000",
          href: "https://wa.me/9627XXXXXXXX",
        },
        location: "عمّان، الأردن",
        closing: "[محتوى مبدئي] جملة استقبال قصيرة لمن وصل إلى نهاية الرحلة.",
      },
    },
  ],
};

// -----------------------------------------------------------------------------
// EN — English (LTR, supportive voice)
// -----------------------------------------------------------------------------
const en: LocaleContent = {
  meta: {
    title: "Ahmad Qattan — The Journey",
    description:
      "[Placeholder] A journey down a glowing road through the Jordanian desert night — the life of Ahmad Qattan, writer & trainer, chapter by chapter until Amman.",
    ogTitle: "Ahmad Qattan — The Journey",
    ogDescription:
      "[Placeholder] Writer & trainer. One road crossing the night toward Amman — walk it.",
    siteName: "Ahmad Qattan",
    keywords: ["Ahmad Qattan", "writer", "trainer", "Think Equality", "Amman", "Jordan"],
  },
  ui: {
    skip: "Skip to content",
    toggleTo: "ع",
    toggleAria: "Switch to Arabic",
    progressAria: "The journey along the road",
    scrollHint: "Walk the road",
    openExternal: "(opens in a new tab)",
    contactPill: "Contact",
    portalEntering: "Crossing into Think Equality…",
    footnote: "[Placeholder] All copy is placeholder awaiting Ahmad's real words.",
  },
  hero: {
    eyebrow: "Writer & Trainer",
    name: "Ahmad Qattan",
    positioning:
      "[Placeholder] One plain sentence: who Ahmad helps, and what changes for them after they meet him.",
    cta: "Begin the journey",
    scene: {
      id: "traveler",
      alt: "A traveler standing on a glowing golden road in the desert night, facing the horizon light",
      focus: "42% 62%",
    },
  },
  chapters: [
    {
      key: "beginning",
      kicker: "Chapter One",
      word: "The Beginning",
      scene: {
        id: "childhood",
        alt: "A child walking a glowing night road, a lit paper kite in the sky",
        focus: "42% 65%",
      },
      body: [
        "[Placeholder] Where the road began: the first home, the first light, the first written line that changed something inside him.",
        "[Placeholder] A line that foreshadows what this beginning will become.",
      ],
    },
    {
      key: "road",
      kicker: "Chapter Two",
      word: "The Road",
      scene: {
        id: "station",
        alt: "A small lit tea rest on the shoulder of the road at night",
        focus: "35% 58%",
      },
      body: [
        "[Placeholder] The walking years: the stations he stopped at, and what each rest taught him.",
        "[Placeholder] The turning point that made writing a decision, not an accident.",
      ],
    },
    {
      key: "craft",
      kicker: "Chapter Three",
      word: "The Craft",
      scene: {
        id: "pen",
        alt: "A stone monument shaped like a pen nib beside the road, lit pages flying from it",
        focus: "40% 58%",
      },
      body: ["[Placeholder] One line on his relationship with the word: why he writes, and for whom."],
      craft: [
        { name: "Writing", desc: "[Placeholder] One-line description." },
        { name: "Training", desc: "[Placeholder] One-line description." },
        { name: "Content", desc: "[Placeholder] One-line description." },
        { name: "Initiatives", desc: "[Placeholder] One-line description." },
      ],
    },
    {
      key: "voice",
      kicker: "Chapter Four",
      word: "The Voice",
      scene: {
        id: "training",
        alt: "A small open-air stage lit at night, an audience seated under the stars near the road",
        focus: "55% 60%",
      },
      body: [
        "[Placeholder] The first time he stood before people: what he believes, and what he tries to awaken in those he trains.",
        "[Placeholder] A line on the values he will not trade.",
      ],
    },
    {
      key: "crossing",
      kicker: "Chapter Five",
      word: "The Crossing",
      scene: {
        id: "fork-arch",
        alt: "An ancient stone arch at a fork: through it dawn begins, around it the night continues",
        focus: "45% 52%",
      },
      scene2: {
        id: "dawn",
        alt: "The golden road crossing the whole desert toward a low sun — the world after the crossing",
        focus: "55% 50%",
      },
      gateway: {
        name: "Think Equality",
        tag: "[Placeholder] What Think Equality is, in one line.",
        body: "[Placeholder] Not another website — it is what the journey created. A line inviting the visitor to cross.",
        cta: "Cross the gate",
        url: "#",
      },
    },
    {
      key: "impact",
      kicker: "Chapter Six",
      word: "The Trace",
      scene: {
        id: "impact",
        alt: "Glowing milestone stones along the golden road stretching toward the horizon",
        focus: "50% 50%",
      },
      scene2: {
        id: "testimonials",
        alt: "A small campfire, companions of the road seated around it under the stars",
        focus: "50% 50%",
      },
      stats: [
        { n: "00+", l: "[Placeholder] Metric one" },
        { n: "00", l: "[Placeholder] Metric two" },
        { n: "00+", l: "[Placeholder] Metric three" },
      ],
      voices: [
        {
          quote: "[Placeholder] A real, outcome-specific quote from someone who worked with Ahmad.",
          who: "[Placeholder] Name, role",
        },
        {
          quote: "[Placeholder] A second quote naming a tangible result.",
          who: "[Placeholder] Name, role",
        },
      ],
    },
    {
      key: "arrival",
      kicker: "Final Chapter",
      word: "The Arrival",
      scene: {
        id: "amman",
        alt: "Amman at night: hills lit by thousands of windows, the golden road entering the city",
        focus: "50% 62%",
      },
      body: ["[Placeholder] A closing line: the road does not end in Amman — it begins again from her."],
      contact: {
        whatsapp: {
          label: "Message on WhatsApp",
          number: "+962 7 0000 0000",
          href: "https://wa.me/9627XXXXXXXX",
        },
        location: "Amman, Jordan",
        closing: "[Placeholder] A short welcome for whoever reached the end of the journey.",
      },
    },
  ],
};

export const content: Content = { ar, en };

/** The crossing chapter, pulled out for the portal logic. */
export function getGateway(c: LocaleContent) {
  return c.chapters.find((ch) => ch.gateway)?.gateway;
}
