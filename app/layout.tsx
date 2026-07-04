import type { Metadata, Viewport } from "next";
import { Reem_Kufi, IBM_Plex_Sans_Arabic, Fraunces, Inter } from "next/font/google";
import { content } from "@/lib/content";
import "./globals.css";

// next/font → self-hosted, font-display:swap, zero layout shift.
// Reem Kufi: the display voice — Kufic is the script of carved monuments,
// which is exactly what the chapter words and the hero name should feel like.
// IBM Plex Sans Arabic: body copy that disappears into the experience.
const reemKufi = Reem_Kufi({
  subsets: ["arabic"],
  weight: ["400", "500", "600", "700"],
  variable: "--font-kufi",
  display: "swap",
});
const plexArabic = IBM_Plex_Sans_Arabic({
  subsets: ["arabic"],
  weight: ["300", "400", "500", "600"],
  variable: "--font-plex-ar",
  display: "swap",
});
const fraunces = Fraunces({
  subsets: ["latin"],
  variable: "--font-fraunces",
  display: "swap",
});
const inter = Inter({
  subsets: ["latin"],
  variable: "--font-inter",
  display: "swap",
});

// NOTE: set this to the production origin before deploy (README → SEO).
const SITE_URL = "https://ahmad-qattan.example";
const meta = content.ar.meta;

export const metadata: Metadata = {
  metadataBase: new URL(SITE_URL),
  title: meta.title,
  description: meta.description,
  keywords: meta.keywords,
  authors: [{ name: meta.siteName }],
  alternates: {
    canonical: "/",
    languages: {
      ar: `${SITE_URL}/?lang=ar`,
      en: `${SITE_URL}/?lang=en`,
      "x-default": `${SITE_URL}/`,
    },
  },
  openGraph: {
    type: "website",
    siteName: meta.siteName,
    title: meta.ogTitle,
    description: meta.ogDescription,
    url: SITE_URL,
    locale: "ar_AR",
    alternateLocale: ["en_US"],
    images: [{ url: "/og.svg", width: 1200, height: 630, alt: meta.ogTitle }],
  },
  twitter: {
    card: "summary_large_image",
    title: meta.ogTitle,
    description: meta.ogDescription,
    images: ["/og.svg"],
  },
  robots: { index: true, follow: true },
};

// Night theme — keeps mobile browser chrome (address bar) in the same world.
export const viewport: Viewport = {
  themeColor: "#04060d",
  width: "device-width",
  initialScale: 1,
};

const personJsonLd = {
  "@context": "https://schema.org",
  "@type": "Person",
  name: "Ahmad Qattan",
  alternateName: "أحمد قطان",
  jobTitle: "Writer & Trainer",
  description: meta.ogDescription,
  url: SITE_URL,
  sameAs: [] as string[], // TODO(client): add social profile URLs
};

export default function RootLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="ar" dir="rtl" className="lang-ar">
      <body
        className={`${reemKufi.variable} ${plexArabic.variable} ${fraunces.variable} ${inter.variable}`}
      >
        {children}
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(personJsonLd) }}
        />
      </body>
    </html>
  );
}
