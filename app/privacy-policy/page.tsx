import type { Metadata } from "next";

import { LegalDoc } from "@/components/legal/legal-doc";
import { SiteFooter } from "@/components/site-footer";
import { SiteHeader } from "@/components/site-header";

import { PRIVACY_POLICY_SECTIONS } from "./content";

/*
 * The title picks up the "%s | MidnightUX" template from the root layout, so
 * only the page's own name is set here. `canonical` is explicit because the
 * root layout pins it to "/" for the single-page site, and an inherited
 * canonical pointing at the home page would tell search engines this document
 * does not exist.
 */
export const metadata: Metadata = {
  title: "Privacy Policy",
  description:
    "How MidnightUX collects, uses, shares and retains personal data, the lawful bases we rely on, where our outreach data comes from, and the rights you have over it.",
  alternates: { canonical: "/privacy-policy" },
};

export default function PrivacyPolicyPage() {
  return (
    /*
      No <SmoothScroll> wrapper here. It is mounted once in app/layout.tsx and
      eases the real window scroll position, so this route inherits it already.
      A second instance would be a second rAF loop writing the same scroll
      position as the first, and the two would fight every frame.

      `hrefBase="/"` on both the header and the footer because their links are
      bare hashes aimed at sections that only exist on the home page. Left as
      "#services" they would resolve to nothing here and every nav item would be
      a dead click.
    */
    <div className="flex min-h-[100dvh] flex-col bg-surface">
      <SiteHeader hrefBase="/" />
      <main className="flex-1">
        <LegalDoc
          title="Privacy Policy"
          updated="Last updated 1 August 2026"
          sections={PRIVACY_POLICY_SECTIONS}
          intro={
            <p>
              MidnightUX designs and builds websites for small businesses. This
              policy explains what personal data we handle, why we handle it, who
              we share it with, how long we keep it, and the rights you have over
              it. If we contacted you and you never gave us your details, section{" "}
              <strong>04</strong> answers that directly and tells you how to make
              us stop.
            </p>
          }
        />
      </main>
      <SiteFooter hrefBase="/" />
    </div>
  );
}
