"use client";

import {
  motion,
  useReducedMotion,
  useScroll,
  useSpring,
  useTransform,
} from "motion/react";

import { LOCK_SAFE_RIGHT } from "@/components/ui/dialog";

/*
 * Reading-progress rule pinned to the top of the viewport.
 *
 * The page is one long scroll with no chrome to anchor against, so this is the
 * only persistent signal of how far through it you are.
 *
 * scaleX on a full-width bar rather than an animated width — width would lay
 * out on every frame of every scroll, which is the most expensive way possible
 * to draw a 3px line.
 */
export function ScrollProgress() {
  const reduce = useReducedMotion();
  const { scrollYProgress } = useScroll();

  // Lenis already smooths the scroll position; the spring only takes the last
  // edge off so the bar settles rather than stopping dead.
  const smoothed = useSpring(scrollYProgress, {
    stiffness: 120,
    damping: 30,
    mass: 0.3,
  });

  const progress = reduce ? scrollYProgress : smoothed;

  /*
   * Fades out over the last stretch of the page.
   *
   * Once the footer is on screen there is no reading left to measure, and a
   * full-width bar sitting over it is just chrome on top of the closing frame.
   * The footer is a screen tall, so the last few percent of the scroll is
   * exactly that closing frame.
   *
   * Derived from the same motion value rather than held in state: this runs on
   * the compositor and costs no renders, where a scroll listener flipping a
   * boolean would re-render the tree near the bottom of every page view.
   */
  const opacity = useTransform(progress, [0.94, 0.99], [1, 0]);

  return (
    <motion.div
      aria-hidden
      style={{ scaleX: progress, opacity }}
      /*
        LOCK_SAFE_RIGHT is why this does not twitch when a dialog opens.
        Opening one locks the page scroll, which removes the scrollbar, which
        hands ~15px of viewport width back. Radix compensates the body for that,
        but this bar is `fixed` and so is not in the body's flow: it would
        stretch by the width of the scrollbar at the moment the dialog appears
        and snap back when it closes. The class pins its right edge where the
        scrollbar used to be, and carries no rules at all while nothing is
        locked. See components/ui/dialog.tsx.
      */
      className={`fixed inset-x-0 top-0 z-[60] h-[3px] origin-left bg-yellow-strong ${LOCK_SAFE_RIGHT}`}
    />
  );
}
