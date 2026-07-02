import type { Metadata } from "next";
import {
  Amiri,
  IBM_Plex_Sans_Arabic,
  Rakkas,
  Space_Grotesk,
} from "next/font/google";
import { content } from "@/lib/content";
import "./globals.css";

// next/font → self-hosted, font-display:swap, zero layout shift.
const amiri = Amiri({
  subsets: ["arabic", "latin"],
  weight: ["700"],
  variable: "--font-amiri",
  display: "swap",
});
const plex = IBM_Plex_Sans_Arabic({
  subsets: ["arabic", "latin"],
  weight: ["300", "400", "500"],
  variable: "--font-plex",
  display: "swap",
});
const rakkas = Rakkas({
  subsets: ["arabic", "latin"],
  weight: ["400"],
  variable: "--font-rakkas",
  display: "swap",
});
const grotesk = Space_Grotesk({
  subsets: ["latin"],
  weight: ["400", "500"],
  variable: "--font-grotesk",
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
    images: [
      {
        url: "/assets/og-cover.png",
        width: 1200,
        height: 630,
        alt: meta.ogTitle,
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: meta.ogTitle,
    description: meta.ogDescription,
    images: ["/assets/og-cover.png"],
  },
  robots: { index: true, follow: true },
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
        className={`${amiri.variable} ${plex.variable} ${rakkas.variable} ${grotesk.variable}`}
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
