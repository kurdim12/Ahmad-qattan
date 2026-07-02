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
  /** Fitted segment for the 9:16 portrait variant (portrait image coords). */
  pathPortrait?: string;
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
      grade: "saturate(1.04) contrast(1.02)",
    },
    path: "M 873.8 292 C 867.8 297.0 852.4 311.3 838 322 C 823.6 332.7 804.4 343.3 787.3 356 C 770.2 368.7 748.9 386.7 735.2 398 C 721.5 409.3 682.8 414.3 705 424 C 727.2 433.7 836.2 447.3 868.7 456 C 901.2 464.7 908.5 465.3 900.0 476 C 891.5 486.7 845.9 506.7 818 520 C 790.1 533.3 754.6 545.0 732.7 556 C 710.8 567.0 691.5 574.3 686.4 586 C 681.3 597.7 670.3 602.7 701.9 626 C 733.5 649.3 838.0 701.0 875.9 726 C 913.8 751.0 920.9 761.0 929.0 776 C 937.1 791.0 948.1 792.7 924.6 816 C 901.1 839.3 810.9 899.3 788.1 916",
    pathPortrait:
      "M 497.1 998.0 C 497.9 1000.0 512.1 1004.0 502.0 1010.0 C 491.9 1016.0 437.2 1026.0 436.5 1034.0 C 435.7 1042.0 492.9 1052.0 497.4 1058.0 C 501.9 1064.0 467.6 1066.0 463.6 1070.0 C 459.5 1074.0 461.1 1076.0 472.9 1082.0 C 484.8 1088.0 533.1 1096.0 534.6 1106.0 C 536.1 1116.0 473.9 1128.0 482.0 1142.0 C 490.2 1156.0 565.8 1180.0 583.5 1190.0 C 601.2 1200.0 605.6 1190.0 588.4 1202.0 C 571.1 1214.0 497.3 1248.0 479.9 1262.0 C 462.5 1276.0 473.7 1276.0 483.8 1286.0 C 493.9 1296.0 529.5 1312.0 540.5 1322.0 C 551.5 1332.0 568.7 1332.0 549.6 1346.0 C 530.5 1360.0 455.7 1388.0 425.9 1406.0 C 396.0 1424.0 378.8 1442.0 370.6 1454.0 C 362.5 1466.0 365.8 1466.0 377.1 1478.0 C 388.4 1490.0 426.5 1514.0 438.5 1526.0 C 450.6 1538.0 451.2 1540.0 449.4 1550.0 C 447.6 1560.0 441.0 1572.0 427.6 1586.0 C 414.3 1600.0 378.1 1624.0 369.5 1634.0 C 360.9 1644.0 374.9 1644.0 376.0 1646.0",
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
      grade:
        "sepia(0.45) saturate(1.3) hue-rotate(-16deg) brightness(0.78) contrast(1.1)",
    },
    path: "M 1215 641 C 1198.8 644.5 1150.5 653.8 1118 662 C 1085.5 670.2 1034.7 679.5 1020 690 C 1005.3 700.5 1013.3 714.7 1030 725 C 1046.7 735.3 1100.0 742.8 1120 752 C 1140.0 761.2 1160.0 767.0 1150 780 C 1140.0 793.0 1105.0 817.5 1060 830 C 1015.0 842.5 973.3 861.3 930 875 C 886.7 888.7 830.0 899.8 800 912 C 770.0 924.2 758.3 936.2 750 941",
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
    asset: {
      base: `${SRC}/scene-03-station.png`,
      grade: "saturate(1.05) contrast(1.02)",
    },
    path: "M 60 905 C 133.3 897.8 360.0 877.5 500 862 C 640.0 846.5 766.7 829.3 900 812 C 1033.3 794.7 1173.3 776.7 1300 758 C 1426.7 739.3 1600.0 709.7 1660 700",
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
    asset: {
      base: `${SRC}/scene-04-pen.png`,
      grade: "saturate(1.05) contrast(1.02)",
    },
    path: "M 1292 592 C 1300.8 600.8 1343.7 627.0 1345 645 C 1346.3 663.0 1330.8 682.5 1300 700 C 1269.2 717.5 1211.7 733.3 1160 750 C 1108.3 766.7 1046.7 783.3 990 800 C 933.3 816.7 876.7 833.3 820 850 C 763.3 866.7 696.7 884.8 650 900 C 603.3 915.2 558.3 934.2 540 941",
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
    asset: {
      base: `${SRC}/scene-05-training.png`,
      grade: "saturate(1.05) contrast(1.02)",
    },
    path: "M 430 447 C 451.7 450.3 521.7 460.3 560 467 C 598.3 473.7 653.3 477.8 660 487 C 666.7 496.2 626.7 511.8 600 522 C 573.3 532.2 524.2 540.0 500 548 C 475.8 556.0 466.7 561.3 455 570 C 443.3 578.7 450.8 587.5 430 600 C 409.2 612.5 371.7 629.2 330 645 C 288.3 660.8 231.7 679.5 180 695 C 128.3 710.5 46.7 730.8 20 738",
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
    asset: {
      base: `${SRC}/scene-06-fork-arch.png`,
      grade: "saturate(1.03) contrast(1.01)",
    },
    path: "M 1440 585 C 1448.3 589.2 1493.3 600.0 1490 610 C 1486.7 620.0 1453.3 630.0 1420 645 C 1386.7 660.0 1331.7 682.5 1290 700 C 1248.3 717.5 1203.3 733.3 1170 750 C 1136.7 766.7 1116.7 780.0 1090 800 C 1063.3 820.0 1031.7 846.5 1010 870 C 988.3 893.5 968.3 929.2 960 941",
    branch:
      "M 430 700 C 448.3 693.3 505.0 672.0 540 660 C 575.0 648.0 614.2 638.0 640 628 C 665.8 618.0 685.8 604.7 695 600",
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
    asset: {
      base: `${SRC}/scene-07-dawn.png`,
      grade: "contrast(1.03) saturate(1.04)",
    },
    path: "M 908.5 276.0 C 909.9 286.0 916.6 319.3 916.9 336.0 C 917.2 352.7 902.9 364.3 910.3 376.0 C 917.7 387.7 952.5 396.0 961.3 406.0 C 970.1 416.0 965.1 427.7 963.3 436.0 C 961.5 444.3 975.7 444.3 950.3 456.0 C 924.9 467.7 839.8 491.0 810.9 506.0 C 782.0 521.0 753.6 526.0 776.8 546.0 C 799.9 566.0 917.2 609.3 949.8 626.0 C 982.4 642.7 966.7 637.7 972.3 646.0 C 977.9 654.3 992.3 662.7 983.3 676.0 C 974.3 689.3 978.6 699.3 918.3 726.0 C 858.0 752.7 684.8 807.7 621.4 836.0 C 558.0 864.3 554.2 881.0 537.6 896.0 C 521.0 911.0 524.6 921.0 522.0 926.0",
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
    asset: {
      base: `${SRC}/scene-08-traveler.png`,
      grade: "saturate(1.08) hue-rotate(-6deg) brightness(0.97)",
    },
    path: "M 855 575 C 850.8 580.8 840.0 595.8 830 610 C 820.0 624.2 806.7 643.3 795 660 C 783.3 676.7 770.8 693.3 760 710 C 749.2 726.7 738.3 743.3 730 760 C 721.7 776.7 716.7 790.0 710 810 C 703.3 830.0 695.8 858.2 690 880 C 684.2 901.8 677.5 930.8 675 941",
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
      grade: "saturate(1.06) contrast(1.02)",
    },
    path: "M 852 588 C 887.2 597.7 1023.3 632.7 1063 646 C 1102.7 659.3 1092.2 659.0 1090 668 C 1087.8 677.0 1072.0 688.7 1050 700 C 1028.0 711.3 979.7 725.0 958 736 C 936.3 747.0 970.0 752.7 920 766 C 870.0 779.3 711.7 799.3 658 816 C 604.3 832.7 626.7 851.0 598 866 C 569.3 881.0 506.5 896.0 486 906 C 465.5 916.0 476.8 922.7 475 926",
    pathPortrait:
      "M 483.0 1034.0 C 485.9 1036.0 501.8 1040.0 500.5 1046.0 C 499.3 1052.0 476.2 1064.0 475.7 1070.0 C 475.3 1076.0 498.7 1078.0 497.9 1082.0 C 497.1 1086.0 476.8 1088.0 470.7 1094.0 C 464.6 1100.0 458.7 1110.0 461.3 1118.0 C 463.9 1126.0 484.3 1134.0 486.4 1142.0 C 488.6 1150.0 490.4 1154.0 474.0 1166.0 C 457.6 1178.0 401.6 1204.0 387.9 1214.0 C 374.1 1224.0 374.9 1216.0 391.5 1226.0 C 408.1 1236.0 466.4 1260.0 487.4 1274.0 C 508.5 1288.0 515.2 1298.0 517.8 1310.0 C 520.4 1322.0 513.0 1334.0 503.1 1346.0 C 493.2 1358.0 461.6 1370.0 458.4 1382.0 C 455.1 1394.0 465.6 1402.0 483.5 1418.0 C 501.4 1434.0 550.7 1462.0 565.5 1478.0 C 580.3 1494.0 580.7 1500.0 572.4 1514.0 C 564.1 1528.0 524.5 1552.0 515.8 1562.0 C 507.0 1572.0 525.2 1570.0 520.2 1574.0 C 515.2 1578.0 490.0 1582.0 485.7 1586.0 C 481.3 1590.0 500.5 1590.0 493.9 1598.0 C 487.3 1606.0 452.8 1626.0 445.8 1634.0 C 438.8 1642.0 451.0 1644.0 452.0 1646.0",
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
