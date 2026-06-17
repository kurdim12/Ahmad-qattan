// =============================================================================
// content.ts — SINGLE SOURCE OF TRUTH for all copy (AR + EN).
// The client edits everything here, in one place.
//
// Every string below the meta block is PLACEHOLDER and marked with
//   [محتوى مبدئي]  (Arabic)   /   [Placeholder]  (English).
// The Think Equality gateway URL is the placeholder `#` until the client
// supplies the real address (see README → "Where real content goes").
// =============================================================================

export type Locale = "ar" | "en";

/** A milestone on the road. Discriminated union keyed by `type`. */
export type Stop =
  // Plain narrative stop (About, Story, ...) — optional body paragraphs.
  | { key: string; station: string; label: string; body?: string[] }
  // Services: an icon list of what he does.
  | {
      key: string;
      station: string;
      label: string;
      type: "services";
      body?: string[];
      items: { name: string; desc: string; icon: ServiceIcon }[];
    }
  // Values / Ventures: chips. A chip can be a plain string or flagged as a feature.
  | {
      key: string;
      station: string;
      label: string;
      type: "chips";
      body?: string[];
      items: (string | { t: string; feature?: boolean })[];
    }
  // Impact: headline stats.
  | {
      key: string;
      station: string;
      label: string;
      type: "stats";
      body?: string[];
      stats: { n: string; l: string }[];
    }
  // Testimonials: short quotes.
  | {
      key: string;
      station: string;
      label: string;
      type: "quotes";
      items: { quote: string; who: string }[];
    }
  // Contact / destination: WhatsApp CTA + location + closing line.
  | {
      key: string;
      station: string;
      label: string;
      type: "contact";
      body?: string[];
      whatsapp: { label: string; number: string; href: string };
      location: string;
      closing: string;
    }
  // Think Equality GATEWAY — the fork in the road. Opens an external site.
  | {
      key: string;
      station: string;
      label: string;
      type: "gateway";
      name: string;
      tag: string;
      body: string;
      cta: string;
      url: string; // external — placeholder "#" until client supplies it
    };

export type ServiceIcon = "pen" | "users" | "layers" | "spark";

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
    toggleTo: string; // label shown on the toggle (the OTHER language)
    toggleAria: string;
    progressAria: string;
    explore: string;
    scrollHint: string;
    openExternal: string; // a11y suffix for external links
    readMore: string;
    readLess: string;
    portalEntering: string;
    portalClose: string;
    portalHint: string;
    footnote: string;
  };
  hero: {
    eyebrow: string;
    name: string;
    wildcard: string;
    intro: string;
    cta: string;
  };
  stops: Stop[];
}

export type Content = Record<Locale, LocaleContent>;

// -----------------------------------------------------------------------------
// AR — Arabic (default, RTL)
// -----------------------------------------------------------------------------
const ar: LocaleContent = {
  meta: {
    title: "أحمد قطان — الطريق",
    description:
      "[محتوى مبدئي] الموقع الشخصي لأحمد قطان، كاتب ومدرّب — رحلة على الطريق من الذهبي إلى الأبيض، حيث كل محطة فصل من قصته.",
    ogTitle: "أحمد قطان — الطريق",
    ogDescription:
      "[محتوى مبدئي] كاتب ومدرّب، والخيط الذي يربط عدة مشاريع. سِر على الطريق واكتشف القصة.",
    siteName: "أحمد قطان",
    keywords: ["أحمد قطان", "كاتب", "مدرّب", "ثينك إكوالٿي", "محتوى", "تدريب"],
  },
  ui: {
    skip: "تجاوز إلى المحتوى",
    toggleTo: "EN",
    toggleAria: "التبديل إلى الإنجليزية",
    progressAria: "تقدّم القراءة على الطريق",
    explore: "اكتشف القصة",
    scrollHint: "انزل على الطريق",
    openExternal: "(يفتح في نافذة جديدة)",
    readMore: "اقرأ المزيد",
    readLess: "اعرض أقل",
    portalEntering: "ندخل إلى ثينك إكوالٿي…",
    portalClose: "إغلاق",
    portalHint: "اضغط للدخول إلى ثينك إكوالٿي",
    footnote: "[محتوى مبدئي] جميع النصوص مبدئية وقابلة للتعديل.",
  },
  hero: {
    eyebrow: "كاتب ومدرّب",
    name: "أحمد قطان",
    wildcard: "الخيط الذي يربط كل شيء",
    intro:
      "[محتوى مبدئي] جملة تعريفية قصيرة عن أحمد: من يكون، وما الذي يجمع بين كل ما يفعله. تُكتب هنا بضع كلمات تمهّد للرحلة على الطريق.",
    cta: "اكتشف القصة",
  },
  stops: [
    {
      key: "about",
      station: "نقطة الانطلاق",
      label: "من هو أحمد قطان",
      body: [
        "[محتوى مبدئي] فقرة قصيرة تعرّف بأحمد قطان: خلفيته، وما الذي يميّز صوته ككاتب ومدرّب.",
        "[محتوى مبدئي] فقرة ثانية توضح «الخيط المشترك» الذي يربط بين مشاريعه المختلفة، وكيف يظهر هذا الخيط في كل ما يقدّمه.",
      ],
    },
    {
      key: "story",
      station: "الطريق",
      label: "الرحلة",
      body: [
        "[محتوى مبدئي] سرد مختصر للرحلة: البداية، نقطة التحوّل، وإلى أين وصل الطريق اليوم.",
        "[محتوى مبدئي] سطر إضافي يربط الماضي بالحاضر ويمهّد لما يفعله الآن.",
      ],
    },
    {
      key: "services",
      station: "المهارات",
      label: "ماذا يفعل",
      type: "services",
      items: [
        {
          name: "[محتوى مبدئي] الكتابة",
          desc: "[محتوى مبدئي] وصف موجز لخدمة الكتابة.",
          icon: "pen",
        },
        {
          name: "[محتوى مبدئي] التدريب",
          desc: "[محتوى مبدئي] وصف موجز لورش العمل والتدريب.",
          icon: "users",
        },
        {
          name: "[محتوى مبدئي] صناعة المحتوى",
          desc: "[محتوى مبدئي] وصف موجز لإنتاج المحتوى.",
          icon: "layers",
        },
        {
          name: "[محتوى مبدئي] المبادرات",
          desc: "[محتوى مبدئي] وصف موجز للمبادرات والمشاريع.",
          icon: "spark",
        },
      ],
    },
    {
      key: "values",
      station: "البوصلة",
      label: "بماذا يؤمن",
      type: "chips",
      items: [
        "[محتوى مبدئي] قيمة أولى",
        "[محتوى مبدئي] قيمة ثانية",
        "[محتوى مبدئي] قيمة ثالثة",
        "[محتوى مبدئي] قيمة رابعة",
        "[محتوى مبدئي] قيمة خامسة",
      ],
    },
    {
      key: "ventures",
      station: "المشاريع",
      label: "خلف كل ذلك",
      type: "chips",
      body: [
        "[محتوى مبدئي] فقرة تُرسّخ فكرة «الورقة الرابحة»: أحمد هو الخيط خلف عدة مشاريع. إحداها مفترق طريق.",
      ],
      items: [
        "[محتوى مبدئي] مشروع أول",
        "[محتوى مبدئي] مشروع ثانٍ",
        { t: "Think Equality", feature: true },
        "[محتوى مبدئي] مشروع رابع",
      ],
    },
    {
      key: "think-equality",
      station: "مفترق الطريق",
      label: "ثينك إكوالٿي",
      type: "gateway",
      name: "Think Equality",
      tag: "[محتوى مبدئي] الوسم القصير للبوابة",
      body: "[محتوى مبدئي] جملة تدعو الزائر لعبور البوابة إلى موقع ثينك إكوالٿي المستقل.",
      cta: "ادخل إلى ثينك إكوالٿي",
      url: "#",
    },
    {
      key: "impact",
      station: "الأثر",
      label: "بالأرقام",
      type: "stats",
      stats: [
        { n: "٠٠+", l: "[محتوى مبدئي] مؤشر أول" },
        { n: "٠٠", l: "[محتوى مبدئي] مؤشر ثانٍ" },
        { n: "٠٠+", l: "[محتوى مبدئي] مؤشر ثالث" },
      ],
    },
    {
      key: "testimonials",
      station: "أصداء",
      label: "ماذا يقولون",
      type: "quotes",
      items: [
        {
          quote: "[محتوى مبدئي] اقتباس قصير من شخص تعامل مع أحمد.",
          who: "[محتوى مبدئي] الاسم، الصفة",
        },
        {
          quote: "[محتوى مبدئي] اقتباس ثانٍ يلخّص الأثر.",
          who: "[محتوى مبدئي] الاسم، الصفة",
        },
      ],
    },
    {
      key: "contact",
      station: "نهاية الطريق",
      label: "الوجهة",
      type: "contact",
      body: ["[محتوى مبدئي] سطر ختامي قصير يدعو للتواصل."],
      whatsapp: {
        label: "تواصل عبر واتساب",
        number: "+962 7 0000 0000",
        href: "https://wa.me/9627XXXXXXXX",
      },
      location: "[محتوى مبدئي] عمّان، الأردن",
      closing: "[محتوى مبدئي] الطريق لا ينتهي — إنه يبدأ من جديد.",
    },
  ],
};

// -----------------------------------------------------------------------------
// EN — English (LTR)
// -----------------------------------------------------------------------------
const en: LocaleContent = {
  meta: {
    title: "Ahmad Qattan — The Road",
    description:
      "[Placeholder] The personal site of Ahmad Qattan, writer & trainer — a journey down the road from gold to white, where every milestone is a chapter of his story.",
    ogTitle: "Ahmad Qattan — The Road",
    ogDescription:
      "[Placeholder] Writer & trainer, the thread behind several ventures. Travel the road and discover the story.",
    siteName: "Ahmad Qattan",
    keywords: ["Ahmad Qattan", "writer", "trainer", "Think Equality", "content", "training"],
  },
  ui: {
    skip: "Skip to content",
    toggleTo: "ع",
    toggleAria: "Switch to Arabic",
    progressAria: "Reading progress along the road",
    explore: "Explore the story",
    scrollHint: "Travel the road",
    openExternal: "(opens in a new tab)",
    readMore: "Read more",
    readLess: "Show less",
    portalEntering: "Entering Think Equality…",
    portalClose: "Close",
    portalHint: "Press to enter Think Equality",
    footnote: "[Placeholder] All copy is placeholder and editable.",
  },
  hero: {
    eyebrow: "Writer & Trainer",
    name: "Ahmad Qattan",
    wildcard: "the thread that ties it all together",
    intro:
      "[Placeholder] A short introductory line about Ahmad: who he is, and what unites everything he does. A few words here set up the journey down the road.",
    cta: "Explore the story",
  },
  stops: [
    {
      key: "about",
      station: "Starting point",
      label: "Who is Ahmad Qattan",
      body: [
        "[Placeholder] A short paragraph introducing Ahmad Qattan: his background, and what makes his voice distinct as a writer and trainer.",
        "[Placeholder] A second paragraph on the common thread that links his ventures, and how it shows up in everything he makes.",
      ],
    },
    {
      key: "story",
      station: "The road",
      label: "The journey",
      body: [
        "[Placeholder] A brief narrative of the journey: the beginning, the turning point, and where the road is today.",
        "[Placeholder] One more line connecting past to present and setting up what he does now.",
      ],
    },
    {
      key: "services",
      station: "Craft",
      label: "What he does",
      type: "services",
      items: [
        {
          name: "[Placeholder] Writing",
          desc: "[Placeholder] A short description of the writing service.",
          icon: "pen",
        },
        {
          name: "[Placeholder] Training",
          desc: "[Placeholder] A short description of workshops and training.",
          icon: "users",
        },
        {
          name: "[Placeholder] Content",
          desc: "[Placeholder] A short description of content production.",
          icon: "layers",
        },
        {
          name: "[Placeholder] Initiatives",
          desc: "[Placeholder] A short description of initiatives and projects.",
          icon: "spark",
        },
      ],
    },
    {
      key: "values",
      station: "Compass",
      label: "What he believes",
      type: "chips",
      items: [
        "[Placeholder] Value one",
        "[Placeholder] Value two",
        "[Placeholder] Value three",
        "[Placeholder] Value four",
        "[Placeholder] Value five",
      ],
    },
    {
      key: "ventures",
      station: "Ventures",
      label: "Behind it all",
      type: "chips",
      body: [
        "[Placeholder] A paragraph that establishes the wildcard: Ahmad is the thread behind several ventures. One of them is a fork in the road.",
      ],
      items: [
        "[Placeholder] Venture one",
        "[Placeholder] Venture two",
        { t: "Think Equality", feature: true },
        "[Placeholder] Venture four",
      ],
    },
    {
      key: "think-equality",
      station: "A fork in the road",
      label: "Think Equality",
      type: "gateway",
      name: "Think Equality",
      tag: "[Placeholder] Short tag for the gateway",
      body: "[Placeholder] A line inviting the visitor to cross the threshold into the separate Think Equality website.",
      cta: "Enter Think Equality",
      url: "#",
    },
    {
      key: "impact",
      station: "Impact",
      label: "By the numbers",
      type: "stats",
      stats: [
        { n: "00+", l: "[Placeholder] Metric one" },
        { n: "00", l: "[Placeholder] Metric two" },
        { n: "00+", l: "[Placeholder] Metric three" },
      ],
    },
    {
      key: "testimonials",
      station: "Echoes",
      label: "What they say",
      type: "quotes",
      items: [
        {
          quote: "[Placeholder] A short quote from someone who worked with Ahmad.",
          who: "[Placeholder] Name, role",
        },
        {
          quote: "[Placeholder] A second quote that captures the impact.",
          who: "[Placeholder] Name, role",
        },
      ],
    },
    {
      key: "contact",
      station: "End of the road",
      label: "Destination",
      type: "contact",
      body: ["[Placeholder] A short closing line inviting people to get in touch."],
      whatsapp: {
        label: "Message on WhatsApp",
        number: "+962 7 0000 0000",
        href: "https://wa.me/9627XXXXXXXX",
      },
      location: "[Placeholder] Amman, Jordan",
      closing: "[Placeholder] The road doesn't end — it begins again.",
    },
  ],
};

export const content: Content = { ar, en };

// Convenience: the gateway stop pulled out for the portal logic.
export function getGateway(c: LocaleContent) {
  return c.stops.find((s) => "type" in s && s.type === "gateway") as
    | Extract<Stop, { type: "gateway" }>
    | undefined;
}
