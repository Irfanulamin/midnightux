import type { Metadata, Viewport } from "next";
import localFont from "next/font/local";

import { Analytics } from "@/components/analytics";
import { BookingProvider } from "@/components/booking-dialog";
import { CampaignTracker } from "@/components/campaign-tracker";
import { ScrollProgress } from "@/components/ui/scroll-progress";
import { SmoothScroll } from "@/components/ui/smooth-scroll";
import {
  SITE_DESCRIPTION,
  SITE_KEYWORDS,
  SITE_NAME,
  SITE_TAGLINE,
  SITE_URL,
  organizationSchema,
  websiteSchema,
} from "@/lib/site";
import "./globals.css";

/*
 * Inter Display, self-hosted from app/fonts.
 *
 * These are the static instances, not the variable font — so there is no opsz
 * axis to drive. Each weight is a discrete file, and only the five the codebase
 * actually uses are declared (400, 400 italic, 500, 600, 700). Adding a new
 * font-weight utility means adding the matching file here first, otherwise the
 * browser will synthesise it and the type will look subtly wrong.
 */
const interDisplay = localFont({
  src: [
    { path: "./fonts/InterDisplay-Regular.ttf", weight: "400", style: "normal" },
    { path: "./fonts/InterDisplay-Italic.ttf", weight: "400", style: "italic" },
    { path: "./fonts/InterDisplay-Medium.ttf", weight: "500", style: "normal" },
    {
      path: "./fonts/InterDisplay-SemiBold.ttf",
      weight: "600",
      style: "normal",
    },
    { path: "./fonts/InterDisplay-Bold.ttf", weight: "700", style: "normal" },
  ],
  variable: "--font-inter-display",
  display: "swap",
});

/*
 * Site-wide metadata. `metadataBase` makes every relative URL below (Open
 * Graph, canonical, the file-convention opengraph-image) resolve to an absolute
 * one — required for OG tags to validate on social platforms. The title
 * template lets inner routes set only their own name and inherit the brand
 * suffix; the single-page site uses `default` for now.
 */
export const metadata: Metadata = {
  metadataBase: new URL(SITE_URL),
  title: {
    default: `${SITE_NAME} — ${SITE_TAGLINE}`,
    template: `%s | ${SITE_NAME}`,
  },
  description: SITE_DESCRIPTION,
  keywords: SITE_KEYWORDS,
  applicationName: SITE_NAME,
  authors: [{ name: SITE_NAME, url: SITE_URL }],
  creator: SITE_NAME,
  publisher: SITE_NAME,
  category: "technology",
  alternates: {
    canonical: "/",
  },
  openGraph: {
    type: "website",
    locale: "en_US",
    url: SITE_URL,
    siteName: SITE_NAME,
    title: `${SITE_NAME} — ${SITE_TAGLINE}`,
    description: SITE_DESCRIPTION,
    // Resolved from the app/opengraph-image file convention.
  },
  twitter: {
    card: "summary_large_image",
    title: `${SITE_NAME} — ${SITE_TAGLINE}`,
    description: SITE_DESCRIPTION,
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      "max-image-preview": "large",
      "max-snippet": -1,
      "max-video-preview": -1,
    },
  },
  icons: {
    icon: "/favicon.ico",
    apple: "/logo.png",
  },
};

/*
 * `themeColor` matches the surface the browser chrome sits against (the cream
 * page background), so the address bar blends in on mobile. Split out of
 * `metadata` because Next 16 wants viewport fields in their own export.
 */
export const viewport: Viewport = {
  themeColor: "#fbf9f5",
  colorScheme: "light",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="en"
      className={`${interDisplay.variable} h-full antialiased`}
    >
      <body className="min-h-full flex flex-col">
        {/*
          Organisation + WebSite structured data, site-wide. Rendered as raw
          JSON-LD script tags (the standard delivery for schema.org) so search
          engines can build a rich result for the studio and its pricing. The
          FAQPage node lives with the FAQ itself, next to the questions.
        */}
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{
            __html: JSON.stringify(organizationSchema()),
          }}
        />
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{
            __html: JSON.stringify(websiteSchema()),
          }}
        />
        {/*
          Mounted above the page so Lenis is running before any ScrollTrigger
          in the tree below measures the document.
        */}
        <SmoothScroll />
        <ScrollProgress />
        {/*
          Every CTA on the page opens one dialog, so the dialog is mounted once
          here rather than per section. The provider is a client component and
          `children` is a slot passed through it, which is what lets the page
          and its sections stay Server Components: only the triggers cross the
          boundary. See booking-dialog.tsx.
        */}
        <BookingProvider>{children}</BookingProvider>
        {/*
          SEM measurement, free tier only (GA4 + utm attribution). Both are
          env-gated and inert until NEXT_PUBLIC_GA_ID is set; CampaignTracker
          also captures utm/click ids and forwards them onto the CTA links.
        */}
        <Analytics />
        <CampaignTracker />
      </body>
    </html>
  );
}
