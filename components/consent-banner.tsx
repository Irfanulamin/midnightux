"use client";

import { useCallback, useEffect, useState } from "react";
import { AnimatePresence, motion, useReducedMotion } from "motion/react";

import { Button } from "@/components/ui/button";
import { EASE } from "@/components/ui/motion";
import {
  CONSENT_KEY,
  hasGoogleTag,
  type ConsentChoice,
} from "@/lib/analytics";

/*
 * The analytics consent banner. Two buttons, one decision, no preference
 * centre.
 *
 * WHY IT EXISTS AT ALL, given the rest of the site takes the opposite approach
 * to added machinery: the privacy policy says three separate times that
 * analytics runs "only if you consent", and section 05 promises that consent is
 * withdrawable "as easy as giving it". That last one is not a promise the
 * studio chose to make, it is GDPR Article 7(3), and it cannot be drafted away.
 * Without this component the policy describes a choice the visitor is never
 * offered and a withdrawal they cannot perform. The banner is the smaller fix.
 *
 * EQUAL WEIGHT IS THE WHOLE DESIGN CONSTRAINT. Accept and Reject are the same
 * component, the same size, the same prominence, side by side, in that visual
 * order only because Accept is the affirmative. There is no pre-ticked box, no
 * greyed-out reject, no "manage preferences" maze standing between the visitor
 * and no, and closing the banner is not treated as agreement. A banner that
 * makes rejecting harder than accepting is not consent under the GDPR, it is a
 * dark pattern with a cookie icon on it, and section 18 of the Terms says we do
 * not build those for clients.
 *
 * IT RENDERS NOTHING WHEN THERE IS NOTHING TO CONSENT TO. With no
 * NEXT_PUBLIC_GA_ID set, <Analytics> loads no third-party script, so asking
 * permission to run it would be theatre. Same when a choice is already stored.
 *
 * The default is denied and is set in the gtag-init script itself (see
 * lib/analytics.ts and analytics.tsx), so nothing here is load-bearing for
 * privacy: if this component failed to mount entirely, analytics_storage would
 * simply stay denied forever. It grants, it never silently assumes.
 */

/** Reopens the banner from anywhere. Dispatched by <ConsentSettingsButton>. */
const REOPEN_EVENT = "ms:consent-open";

function readChoice(): ConsentChoice | null {
  try {
    const stored = localStorage.getItem(CONSENT_KEY);
    return stored === "granted" || stored === "denied" ? stored : null;
  } catch {
    // Private mode / storage disabled. Treated as "never answered", which means
    // the banner shows and the answer simply does not persist.
    return null;
  }
}

export function ConsentBanner() {
  const [open, setOpen] = useState(false);
  const reduce = useReducedMotion();

  /*
   * The setState sits inside a requestAnimationFrame callback rather than the
   * effect body, which is the same shape the reveal primitives use and what
   * keeps this clear of `react-hooks/set-state-in-effect`. It also means the
   * banner is never part of the first paint, so it cannot cost the hero's LCP.
   */
  useEffect(() => {
    if (!hasGoogleTag) return;

    const frame = requestAnimationFrame(() => {
      if (readChoice() === null) setOpen(true);
    });

    const reopen = () => setOpen(true);
    window.addEventListener(REOPEN_EVENT, reopen);

    return () => {
      cancelAnimationFrame(frame);
      window.removeEventListener(REOPEN_EVENT, reopen);
    };
  }, []);

  const answer = useCallback((choice: ConsentChoice) => {
    try {
      localStorage.setItem(CONSENT_KEY, choice);
    } catch {
      // The update below still applies for this pageview; it just will not be
      // remembered on the next one, and the banner will ask again.
    }

    /*
     * Only `analytics_storage` moves. The three ad signals stay denied because
     * nothing on this site runs advertising tags, and granting a signal we have
     * no use for would be collecting permission we did not need to ask for.
     */
    window.gtag?.("consent", "update", { analytics_storage: choice });

    setOpen(false);
  }, []);

  if (!hasGoogleTag) return null;

  return (
    <AnimatePresence>
      {open && (
        <motion.div
          role="dialog"
          aria-modal={false}
          aria-labelledby="consent-title"
          initial={reduce ? { opacity: 0 } : { opacity: 0, y: 16 }}
          animate={reduce ? { opacity: 1 } : { opacity: 1, y: 0 }}
          exit={reduce ? { opacity: 0 } : { opacity: 0, y: 16 }}
          transition={{ duration: reduce ? 0 : 0.5, ease: EASE }}
          /*
            Bottom-left rather than a full-width bar across the foot of the
            page. A bar covers the CTA on a phone, and a banner that hides the
            thing the page is for pressures the fastest dismissal rather than
            the honest answer. z-50 clears the header bar and the scroll rule;
            the booking dialog is a Radix portal above it, so opening a CTA
            still covers this rather than fighting it.
          */
          className="fixed inset-x-2.5 bottom-2.5 z-50 sm:inset-x-auto sm:left-5 sm:bottom-5 sm:max-w-[420px]"
        >
          <div className="rounded-card border border-rule bg-surface p-5 shadow-[0_1px_2px_rgb(0_0_0/0.04),0_24px_60px_-28px_rgb(0_0_0/0.45)] sm:p-6">
            <p
              id="consent-title"
              className="text-[15px] font-semibold tracking-[-0.01em] text-ink sm:text-[16px]"
            >
              Analytics cookies
            </p>
            <p className="mt-2 text-[14px] leading-[1.65] text-ink/70 sm:text-[15px]">
              We would like to use Google Analytics to see which pages are
              useful. It is off until you say yes, and saying no changes nothing
              about how the site works. See our{" "}
              <a
                href="/privacy-policy#cookies-and-analytics"
                className="text-teal underline underline-offset-[3px] decoration-teal/35 transition-colors duration-200 hover:decoration-teal"
              >
                Privacy Policy
              </a>
              .
            </p>

            {/*
              Both buttons are `surface`, the same size, and share the row
              evenly. Making Accept the yellow CTA pill and Reject a plain link
              is the commonest way this component goes wrong: it is still two
              buttons, and it is still not a free choice.
            */}
            <div className="mt-5 flex gap-3">
              <Button
                type="button"
                variant="surface"
                size="block"
                onClick={() => answer("granted")}
              >
                Accept
              </Button>
              <Button
                type="button"
                variant="surface"
                size="block"
                onClick={() => answer("denied")}
              >
                Reject
              </Button>
            </div>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}

/*
 * The withdrawal route, for the footer.
 *
 * Section 05 of the privacy policy promises withdrawing consent is as easy as
 * giving it, so there has to be something that reopens the same two buttons
 * from any page. This is that, and it is deliberately not a preferences panel:
 * it reopens the banner, which already has both answers on it.
 *
 * Renders nothing when no GA id is set, so the footer does not carry a control
 * for a thing that is not running.
 */
export function ConsentSettingsButton({
  className = "",
}: {
  className?: string;
}) {
  if (!hasGoogleTag) return null;

  return (
    <button
      type="button"
      onClick={() => window.dispatchEvent(new Event(REOPEN_EVENT))}
      className={className}
    >
      Cookie settings
    </button>
  );
}
