/*
 * Single source of truth for site-wide SEO facts.
 *
 * Everything here is derived from the studio's real, published offering (see
 * CLAUDE.md): UI/web design, WordPress and React/Next builds, full-stack work
 * with databases, AI integration, a free first draft, $0 upfront, no
 * commitment, 5-7 day delivery, and the two prices ($399 / $699).
 *
 * SITE_URL drives every absolute URL (canonicals, Open Graph, sitemap,
 * structured data). Set NEXT_PUBLIC_SITE_URL in the environment for the real
 * production domain; the fallback is a placeholder and MUST be updated before
 * launch, or canonicals and OG tags will point at the wrong host.
 */
export const SITE_URL = (
  process.env.NEXT_PUBLIC_SITE_URL ?? "https://www.midnightux.com"
).replace(/\/$/, "");

/*
 * The studio is MidnightUX, set as one word, which is how the logo draws it
 * (the yellow "Studio" script is part of the mark, not part of the name). The
 * other places the name is spelled out are the two logo assets, the chart's
 * axis label in growth-chart.tsx and the footer email.
 */
export const SITE_NAME = "MidnightUX";

export const SITE_TAGLINE =
  "Websites That Work as Hard as You Do";

export const SITE_DESCRIPTION =
  "MidnightUX designs, builds, and launches professional websites for small businesses. Free first draft, $0 upfront, live in 5-7 days. WordPress, React and Next.js builds from $399.";

// Short, keyword-aware phrases the copy already stands behind — no invented
// promises. Search engines mostly ignore the keywords tag now, but it is
// harmless and documents intent for anyone reading the head.
export const SITE_KEYWORDS = [
  "small business website design",
  "web design studio",
  "website development",
  "WordPress website",
  "React website",
  "Next.js website",
  "landing page design",
  "affordable web design",
  "AI website integration",
  "custom web development",
];

const OFFERS = [
  {
    name: "Landing Page",
    price: "399",
    description:
      "A single, conversion-focused page: design, responsive build, contact form, basic SEO and speed optimisation, with two rounds of revisions.",
  },
  {
    name: "Complete Website",
    price: "699",
    description:
      "A full multi-page site with everything in the Landing Page plus the pages your business needs, all delivered for one flat price and no monthly fees.",
  },
];

/*
 * Organisation / local-business schema. ProfessionalService is the most
 * specific type that fits a web studio, and it carries priceRange and the two
 * concrete offers so a rich result can surface the actual pricing.
 */
export function organizationSchema() {
  return {
    "@context": "https://schema.org",
    "@type": "ProfessionalService",
    "@id": `${SITE_URL}/#organization`,
    name: SITE_NAME,
    url: SITE_URL,
    logo: `${SITE_URL}/logo.png`,
    image: `${SITE_URL}/opengraph-image`,
    description: SITE_DESCRIPTION,
    priceRange: "$$",
    areaServed: "Worldwide",
    serviceType: [
      "Web Design",
      "Web Development",
      "WordPress Development",
      "React & Next.js Development",
      "AI Integration",
    ],
    makesOffer: OFFERS.map((offer) => ({
      "@type": "Offer",
      name: offer.name,
      description: offer.description,
      priceCurrency: "USD",
      price: offer.price,
      availability: "https://schema.org/InStock",
    })),
  };
}

// WebSite node, linked to the organisation. No SearchAction — this is a
// single marketing page with no on-site search to point one at.
export function websiteSchema() {
  return {
    "@context": "https://schema.org",
    "@type": "WebSite",
    "@id": `${SITE_URL}/#website`,
    name: SITE_NAME,
    url: SITE_URL,
    publisher: { "@id": `${SITE_URL}/#organization` },
    inLanguage: "en",
  };
}

// Builds a FAQPage node from the on-page FAQ, so the questions can earn an
// FAQ rich result. Kept as a builder rather than inline JSON so the FAQ
// component stays the single source of the questions themselves.
export function faqSchema(items: { q: string; a: string }[]) {
  return {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    mainEntity: items.map((item) => ({
      "@type": "Question",
      name: item.q,
      acceptedAnswer: { "@type": "Answer", text: item.a },
    })),
  };
}
