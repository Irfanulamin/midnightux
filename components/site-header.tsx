"use client";

import Image from "next/image";
import Link from "next/link";
import { List } from "@phosphor-icons/react/ssr";
import { motion, useMotionValueEvent, useScroll } from "motion/react";
import { useRef, useState } from "react";

import { BookingTrigger, useBooking } from "@/components/booking-dialog";
import { Button } from "@/components/ui/button";
import { EASE } from "@/components/ui/motion";
import {
  Sheet,
  SheetContent,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet";

/*
 * In-page anchors, not routes — this is a one-page site and those routes do not
 * exist. Rendered as plain <a>, deliberately: next/link intercepts the click and
 * runs its own scroll restoration for a same-page hash, which fights Lenis and
 * produces a jump followed by a smooth correction. A bare anchor lets Lenis own
 * the scroll (see `anchors` in <SmoothScroll>).
 */
const navLinks = [
  { label: "Home", href: "#top" },
  { label: "Our Services", href: "#services" },
  { label: "Our Work", href: "#work" },
  { label: "Pricing", href: "#pricing" },
  // Figma reads "Success Stores" — treating that as a typo for "Stories".
  { label: "Success Stories", href: "#success-stories" },
];


/*
 * `hrefBase` exists because these links are bare hashes, and a bare hash only
 * means anything on the page that owns those sections.
 *
 * On "/" it stays "", so the delegated Lenis listener in <SmoothScroll> matches
 * `a[href^="#"]` and eases the jump. On a standalone route (the legal pages)
 * the same links would resolve to nothing at all and every nav item would be a
 * dead click, so those pages pass "/" and get real cross-page navigation back
 * to the section. Not `next/link` even then: the target is a hash on another
 * route, and letting the browser do a plain navigation is what lets
 * <SmoothScroll>'s own hash handling take over cleanly on arrival.
 */
export function SiteHeader({ hrefBase = "" }: { hrefBase?: string }) {
  const [condensed, setCondensed] = useState(false);
  const [hidden, setHidden] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);
  /* Used only by the mobile CTA, which has to sequence against the sheet. */
  const { openBooking } = useBooking();
  const { scrollY } = useScroll();
  const lastY = useRef(0);

  /*
   * useScroll + a motion-value listener rather than a scroll event handler.
   * A raw listener fires every frame with no batching and is explicitly banned
   * by the taste skill; state here only flips when a threshold is crossed.
   *
   * Direction-aware: the bar gets out of the way while you read down the page
   * and comes back the moment you reverse, so navigation is always one small
   * gesture away without permanently costing 56px of viewport.
   */
  useMotionValueEvent(scrollY, "change", (y) => {
    const previous = lastY.current;
    lastY.current = y;

    setCondensed((prev) => (y > 40 === prev ? prev : y > 40));

    // Always present at the top, where there is nothing to get out of the way of.
    if (y < 80) {
      setHidden(false);
      return;
    }

    /*
     * Lenis keeps emitting sub-pixel changes as its easing settles, and those
     * can carry the opposite sign to the gesture. Ignoring small deltas is what
     * stops the bar flickering at the end of every scroll.
     */
    const delta = y - previous;
    if (Math.abs(delta) < 4) return;

    const next = delta > 0;
    setHidden((prev) => (prev === next ? prev : next));
    // A menu left open while the bar slides away would be orphaned on screen.
    if (next) setMenuOpen(false);
  });

  /*
   * --header-lead (globals.css) is the bar's resting distance from the top of
   * the page: the Figma floats it 60px inside the hero's white card, and a
   * sticky element's `top` only takes over once it has been scrolled to, so the
   * lead is a margin. Hero pulls its card up by lead + bar together.
   */
  return (
    <header className="sticky top-4 z-50 mt-[var(--header-lead)] px-4 sm:top-6 sm:px-6">
      <motion.nav
        // Drops in on load rather than just being there, then the same y is
        // reused to park it off screen while scrolling down.
        initial={{ y: -80, opacity: 0 }}
        animate={{ y: hidden ? "-160%" : 0, opacity: hidden ? 0 : 1 }}
        transition={{ duration: hidden ? 0.35 : 0.5, ease: EASE }}
        /*
         * All four numbers are the Figma's (node 332:13520): a 1054 x 71 bar,
         * 20px in from the left, 10px from the right, which is what leaves the
         * 51px logo and the 51px CTA their 10px of breathing room top and
         * bottom. The bar is deliberately narrower than the 1160 content
         * measure the sections below use.
         *
         * The height is load-bearing beyond this file, so it comes from the
         * shared --header-bar rather than being written here: `Hero` pulls its
         * card up by the bar plus its lead, and the two must not drift.
         */
        className={`mx-auto flex h-[var(--header-bar)] w-full max-w-[1054px] items-center justify-between rounded-pill pl-4 pr-2 transition-[background-color,box-shadow] duration-500 ease-[cubic-bezier(0.16,1,0.3,1)] sm:pl-5 sm:pr-2.5 ${
          condensed
            ? // Frosted once you leave the top of the page. Height and logo stay
              // put — resizing them mid-scroll made the mark visibly breathe.
              "bg-white/70 shadow-[0_1px_2px_rgb(0_0_0/0.04),0_16px_40px_-20px_rgb(0_0_0/0.28)] backdrop-blur-xl"
            : "bg-white shadow-[0_1px_2px_rgb(0_0_0/0.04),0_8px_24px_-12px_rgb(0_0_0/0.12)]"
        }`}
      >
        <Link href="/" className="shrink-0">
          {/*
            The mark, re-exported at 4x after the rename: "MidnightUX" in near
            black with the yellow "Studio" script written across it. It is a much
            wider lockup than the old two-line one (172 x 51, an aspect of 3.4
            against 2.2), so the small sizes step down further than they used to
            or the wordmark crowds the menu button at 375.
          */}
          <Image
            src="/logo.png"
            alt="MidnightUX"
            width={688}
            height={204}
            priority
            className="h-[30px] w-auto sm:h-[40px] lg:h-[51px]"
          />
        </Link>

        {/*
          lg, not md: at 768 the five links plus the logo and the CTA do not
          fit on one line — they wrapped to two rows and ran straight through
          the wordmark. Tablets get the menu button.
        */}
        {/*
          Figma sets the links 24px apart, not 28 - which is what xl restores.
          16px between lg and xl because the CTA beside them is now "Get a Free
          Consultation" rather than "Get Started", roughly twice the width, and
          at 1024 the logo, five 18px labels and that pill come to within ~40px
          of the bar. Buying back 32px here and 16px on the pill's padding keeps
          it on one line without touching the measured 18px type, which is the
          thing that would actually be noticed.
        */}
        <ul className="hidden items-center gap-4 lg:flex xl:gap-6">
          {navLinks.map((link) => (
            <li key={link.href}>
              <a
                href={`${hrefBase}${link.href}`}
                /*
                 * 18px, measured: the Figma's five labels are 50 / 107 / 79 /
                 * 58 / 129 wide, which only Inter Display at 18 sets. The 15px
                 * this used to be is what made the bar read as undersized next
                 * to the logo.
                 */
                className="group relative block py-1 text-[18px] text-ink/80 transition-colors duration-300 hover:text-ink"
              >
                {link.label}
                {/*
                  Underline grows from the left on hover. scaleX rather than
                  width so it stays on the compositor.
                */}
                <span
                  aria-hidden
                  className="absolute inset-x-0 -bottom-0.5 h-px origin-left scale-x-0 bg-ink transition-transform duration-300 ease-[cubic-bezier(0.16,1,0.3,1)] group-hover:scale-x-100"
                />
              </a>
            </li>
          ))}
        </ul>

        <div className="flex items-center gap-1.5 sm:gap-2">
          {/*
            133 x 51 in the Figma, which the size-based padding cannot express on
            its own now the bar is 71 tall: the height is set so the pill fills
            the bar's 10px inset exactly.
          */}
          {/*
            This used to be an in-page jump to #contact, on the reasoning that
            the banner is where the free draft and the $0 upfront are written
            down. It opens the booking dialog directly now, because the label
            promises a consultation and the shortest path to one is the point:
            scrolling someone to a second button that says "Contact Us" is a
            step that only ever loses people. The banner still carries the
            reassurance for readers who arrive by scrolling.
          */}
          <BookingTrigger intent="consultation">
            <Button
              size="sm"
              /* lg:px-4 is part of keeping the bar on one line - see the nav ul. */
              className="h-10 font-semibold hover:-translate-y-0.5 sm:h-[51px] sm:px-6 sm:text-[16px] lg:px-4 xl:px-6"
            >
              Get a Free Consultation
            </Button>
          </BookingTrigger>

          {/*
            Mobile nav is the shadcn Sheet (radix Dialog). Controlled rather than
            trigger-only so the direction-aware scroll logic above can close it
            (`setMenuOpen(false)`) when the bar slides away — a menu left open
            over a hidden bar would be orphaned on screen. Radix owns focus trap,
            Escape and scroll-lock, which is why the old manual handlers are gone.
          */}
          <Sheet open={menuOpen} onOpenChange={setMenuOpen}>
            <SheetTrigger
              aria-label="Open menu"
              className="grid size-10 shrink-0 cursor-pointer place-items-center rounded-pill text-ink transition-colors duration-300 hover:bg-ink/5 focus:outline-none lg:hidden"
            >
              <List size={24} aria-hidden />
            </SheetTrigger>

            <SheetContent side="right" className="w-4/5 max-w-xs gap-0 pt-16">
              <SheetTitle className="sr-only">Menu</SheetTitle>
              <nav aria-label="Mobile">
                <ul className="flex flex-col gap-1">
                  {navLinks.map((link) => (
                    <li key={link.href}>
                      <a
                        href={`${hrefBase}${link.href}`}
                        onClick={() => setMenuOpen(false)}
                        className="block rounded-xl px-4 py-3.5 text-[17px] text-ink/85 transition-colors duration-200 hover:bg-cream hover:text-ink"
                      >
                        {link.label}
                      </a>
                    </li>
                  ))}
                </ul>
              </nav>

              {/*
                Not <BookingTrigger>, because the ORDER matters here and the
                trigger cannot express it.

                This button lives inside the mobile Sheet, which is itself a
                radix Dialog. Closing one dialog and opening another in the same
                tick puts two focus managers in a race: the sheet restores focus
                to the hamburger as it unmounts, and that restore lands AFTER
                the booking dialog has taken focus, so the trap is left holding
                nothing and the first Tab escapes into the page behind. Waiting
                out the sheet's 0.35s exit makes it a sequence instead of a
                race. The extra 30ms is slack, not superstition: the animation
                has to have ended before radix will unmount.
              */}
              <Button
                size="block"
                className="mt-6 font-semibold"
                onClick={() => {
                  setMenuOpen(false);
                  window.setTimeout(() => openBooking("consultation"), 380);
                }}
              >
                Get a Free Consultation
              </Button>
            </SheetContent>
          </Sheet>
        </div>
      </motion.nav>
    </header>
  );
}
