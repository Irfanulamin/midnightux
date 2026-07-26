"use client";

import { useEffect, useRef } from "react";
import { gsap } from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";

gsap.registerPlugin(ScrollTrigger);

/*
 * Scroll-driven horizontal pan.
 *
 * On desktop the section pins at the top of the viewport, the inner track
 * scrubs sideways as the user scrolls, and once the track runs out the page
 * releases and continues to the next section.
 *
 * This is the one place GSAP earns its place over Motion: it needs real pinning
 * and scrubbing, which ScrollTrigger does natively and `whileInView` cannot.
 * Entry reveals elsewhere stay on Motion.
 *
 * Below md the pan is dropped entirely and the track becomes a plain vertical
 * stack. A pinned section that eats several screens of scroll is hostile on a
 * phone, and the cards are wider than the viewport anyway.
 *
 * Two details that break the desktop path if you get them wrong:
 *   - `start: "top top"` — anything else (e.g. "top center") begins the pan
 *     before the section is pinned, so the user sees the track already
 *     part-way across.
 *   - `end: "+=" + distance` — the scroll length must equal the horizontal
 *     travel, or the pan finishes early and the section sits pinned doing
 *     nothing.
 */
export function HorizontalPan({
  header,
  footer,
  children,
  className,
  gapClassName = "gap-10",
  /**
   * Trailing room after the last card. Raise it when something needs to react
   * to reaching the middle of the screen: at the default the track stops with
   * the last card near the right edge, so it never crosses the centre.
   */
  trailClassName = "md:pr-[12vw]",
  centered = false,
}: {
  header?: React.ReactNode;
  /** Rendered below the track, inside the pinned viewport — it does not pan. */
  footer?: React.ReactNode;
  children: React.ReactNode;
  className?: string;
  gapClassName?: string;
  trailClassName?: string;
  /**
   * Group the pinned content and centre it vertically, instead of letting the
   * track absorb all the slack.
   *
   * Use it when the cards have a real height of their own. The default —
   * track stretched with flex-1 — hands the cards the whole screen, which is
   * right when they should fill it and wrong when they should not: a card with
   * a fixed height then sits at the top with the leftover space dumped
   * underneath it, and anything that lifts on hover or scroll has no room
   * above it to move into.
   */
  centered?: boolean;
}) {
  const wrapRef = useRef<HTMLDivElement>(null);
  const trackRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const wrap = wrapRef.current;
    const track = trackRef.current;
    if (!wrap || !track) return;

    /*
     * gsap.matchMedia rather than a one-shot matchMedia read: it re-runs the
     * setup when the query flips and reverts everything the callback created on
     * the way out, so rotating a tablet past the breakpoint cannot leave a
     * stale pin spacer behind.
     *
     * The reduced-motion clause is part of the query for the same reason — the
     * OS setting can change while the page is open.
     */
    const mm = gsap.matchMedia();

    mm.add(
      "(min-width: 768px) and (prefers-reduced-motion: no-preference)",
      () => {
        const getDistance = () =>
          Math.max(0, track.scrollWidth - window.innerWidth + 48);

        const timeline = gsap.timeline({
          scrollTrigger: {
            trigger: wrap,
            start: "top top",
            end: () => `+=${getDistance()}`,
            pin: true,
            scrub: 1,
            // Recalculates on resize; without it the distance is stale after a
            // viewport change and the pan over- or under-shoots.
            invalidateOnRefresh: true,
          },
        });

        timeline.to(track, { x: () => -getDistance(), ease: "none" }, 0);

        /*
         * Images settle after first paint and change scrollWidth. Without a
         * refresh the pan distance is measured too short and the last cards
         * never arrive.
         */
        const onLoad = () => ScrollTrigger.refresh();
        window.addEventListener("load", onLoad);
        const timer = window.setTimeout(onLoad, 600);

        return () => {
          window.removeEventListener("load", onLoad);
          window.clearTimeout(timer);
        };
      },
    );

    return () => mm.revert();
  }, []);

  return (
    <div ref={wrapRef} className={`relative overflow-hidden ${className ?? ""}`}>
      {/*
        Exactly one viewport tall while pinned, not min-height: the section is
        fixed in place, so anything that does not fit is simply never reachable.
        The header takes its natural height and the track absorbs whatever is
        left (flex-1 + min-h-0), which lets a card size its image to the space
        actually available instead of overflowing its own caption off screen.
      */}
      {/*
        py is kept tight at md on purpose: the section is exactly one viewport,
        so every px of padding here is a px the cards do not get. At py-14 the
        cards came out 336px tall and their content overflowed.

        `pin-short` cuts it further still (globals.css: pinned, under 1080px
        tall). A laptop browser has 640-690px of viewport, and the cards these
        sections are built around - a 562px step card, a screenshot worth
        looking at - do not fit inside that with desktop padding around them.
        The padding yields before the content does.
      */}
      <div
        className={`flex flex-col py-16 md:h-[100dvh] md:py-10 pin-short:py-4 ${
          centered ? "md:justify-center" : ""
        }`}
      >
        {header}
        {/*
          On desktop the track starts one full viewport to the right, so every
          card begins off-screen and arrives one at a time as the section is
          scrubbed. That sequencing is what lets each card's curtain fire on its
          own — if they all started on screen their reveals would trigger
          together. Stacked on mobile there is nothing to sequence, so the
          offsets, w-max and height sharing are all md-only.
        */}
        <div
          ref={trackRef}
          className={`mt-10 flex flex-col px-6 md:mt-6 md:w-max md:flex-row md:px-0 md:pl-[88vw] pin-short:mt-3 ${
            centered ? "md:shrink-0" : "md:min-h-0 md:flex-1"
          } ${trailClassName} ${gapClassName}`}
        >
          {children}
        </div>
        {footer}
      </div>
    </div>
  );
}
