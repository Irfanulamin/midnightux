import type { Metadata } from "next";

import { LegalDoc } from "@/components/legal/legal-doc";
import { SiteFooter } from "@/components/site-footer";
import { SiteHeader } from "@/components/site-header";

import { TERMS_SECTIONS } from "./content";

export const metadata: Metadata = {
  title: "Terms of Service",
  description:
    "The terms that govern MidnightUX projects: what the free draft commits either side to, pricing and payment, revisions and scope, intellectual property, and limitation of liability.",
  alternates: { canonical: "/terms-of-service" },
};

export default function TermsOfServicePage() {
  return (
    /* See the note in app/privacy-policy/page.tsx. Same two reasons. */
    <div className="flex min-h-[100dvh] flex-col bg-surface">
      <SiteHeader hrefBase="/" retract="desktop-only" />
      <main className="flex-1">
        <LegalDoc
          title="Terms of Service"
          updated="Last updated 1 August 2026"
          sections={TERMS_SECTIONS}
          intro={
            <p>
              These terms govern this website and every design and development
              project we take on. Two sections are worth reading before the rest:{" "}
              <strong>05</strong>, on exactly what the free draft does and does not
              commit either of us to, and <strong>14</strong>, which limits our
              liability. We sell to businesses only.
            </p>
          }
        />
      </main>
      <SiteFooter hrefBase="/" />
    </div>
  );
}
