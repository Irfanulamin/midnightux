"use client";

import { useEffect, useRef, useState } from "react";
import { motion, useInView, useReducedMotion } from "motion/react";

import { EASE, VIEWPORT } from "@/components/ui/motion";

/*
 * Scroll-entry primitive.
 *
 * Motion's viewport observer rather than GSAP ScrollTrigger: there is no
 * pinning or scrubbing here, just "appear once on enter", and ScrollTrigger
 * would mean shipping and registering a plugin for something the built-in
 * observer already does. GSAP earns its place on pin/scrub work — this is not
 * that.
 *
 * Timing and thresholds come from the shared motion system (motion.ts), so a
 * reveal here reads at the same pace as one anywhere else on the page.
 * Animates transform and opacity only, so it stays on the compositor.
 */

type Direction = "up" | "left" | "right" | "none";

/**
 * Default travel, in px. Small on purpose: for text and cards the entry should
 * register without the reader watching something cross the screen. Raise it
 * per-call for large elements, where the same 28px reads as a twitch.
 */
const DISTANCE = 28;

const offsetFor = (direction: Direction, distance: number) => {
  switch (direction) {
    case "up":
      return { y: distance };
    case "left":
      return { x: -distance };
    case "right":
      return { x: distance };
    default:
      return {};
  }
};

/*
 * The shared trigger, and the one place the reload behaviour lives.
 *
 * `useInView(once)` is the forward path — fires the first time the element
 * scrolls into view, exactly as `whileInView` did.
 *
 * The extra piece is `passed`. When the page is reloaded into the middle of
 * itself (scroll restoration, see SmoothScroll), everything above the landing
 * point was never scrolled through, so its entrance never fired — and a
 * reveal that starts at opacity 0 then just stays there reads as missing
 * content the moment the reader scrolls back up. Motion's observer reports
 * those elements as "not intersecting" (they are above the viewport) and
 * leaves them hidden.
 *
 * So on mount, any element already fully above the viewport is shown straight
 * away. It is off screen when it happens, so the reader never sees it animate;
 * by the time they scroll up to it, it has settled. The setState sits inside a
 * requestAnimationFrame callback, not the effect body, which is both correct
 * (measure after paint) and what keeps it clear of the set-state-in-effect
 * rule.

*
 * Exported because a component that drives more than its own opacity off the
 * trigger cannot use <Reveal> as a wrapper. WhyUsCard is the case: one boolean
 * has to start the card's entrance AND the layered artwork inside it, so it
 * needs the trigger rather than a component that consumes it. Anything reaching
 * for this must keep the `passed` behaviour — that is the whole reason it is a
 * shared hook and not a bare useInView.
 */
export function useReveal<T extends Element>(amount: number) {
  const ref = useRef<T>(null);
  const inView = useInView(ref, { once: true, amount });
  const [passed, setPassed] = useState(false);

  useEffect(() => {
    const el = ref.current;
    if (!el || inView || passed) return;
    if (el.getBoundingClientRect().bottom <= 0) {
      const id = requestAnimationFrame(() => setPassed(true));
      return () => cancelAnimationFrame(id);
    }
  }, [inView, passed]);

  return [ref, inView || passed] as const;
}

export function Reveal({
  children,
  delay = 0,
  direction = "up",
  duration = 0.7,
  className,
  /** Fraction of the element that must be visible before it fires. */
  amount = VIEWPORT.in,
  /** How far it travels, in px. */
  distance = DISTANCE,
}: {
  children: React.ReactNode;
  delay?: number;
  direction?: Direction;
  duration?: number;
  className?: string;
  amount?: number;
  distance?: number;
}) {
  const reduce = useReducedMotion();
  const [ref, inView] = useReveal<HTMLDivElement>(amount);
  const shown = reduce || inView;
  const hidden = { opacity: 0, ...offsetFor(direction, distance) };

  return (
    <motion.div
      ref={ref}
      className={className}
      initial={reduce ? false : hidden}
      animate={shown ? { opacity: 1, x: 0, y: 0 } : hidden}
      transition={{ duration, delay, ease: EASE }}
    >
      {children}
    </motion.div>
  );
}

/*
 * Staggered container. Children must be <RevealItem>, which reads the parent's
 * variants — this is why the stagger works without hand-tuning a delay per
 * child, and why inserting or removing a card cannot desync the sequence.
 */
export function RevealGroup({
  children,
  className,
  stagger = 0.08,
  delayChildren = 0,
  amount = VIEWPORT.in,
}: {
  children: React.ReactNode;
  className?: string;
  stagger?: number;
  delayChildren?: number;
  amount?: number;
}) {
  const reduce = useReducedMotion();
  const [ref, inView] = useReveal<HTMLDivElement>(amount);
  const shown = reduce || inView;

  return (
    <motion.div
      ref={ref}
      className={className}
      initial={reduce ? false : "hidden"}
      animate={shown ? "visible" : "hidden"}
      variants={{
        hidden: {},
        visible: {
          transition: { staggerChildren: stagger, delayChildren },
        },
      }}
    >
      {children}
    </motion.div>
  );
}

/*
 * Curtain reveal.
 *
 * The child sits under a solid brand-colour panel. When the card enters the
 * viewport the panel lifts away upward, uncovering the content from the bottom
 * up — the wipe edge travels bottom -> top.
 *
 * scaleY from a top origin rather than translateY: the panel collapses into its
 * own top edge, so it can never bleed over a neighbouring card the way a
 * sliding panel would, and it stays a pure compositor transform.
 */
export function CurtainReveal({
  children,
  className,
  delay = 0,
  duration = 0.9,
  /** Tailwind background utility for the cover. */
  coverClassName = "bg-teal",
}: {
  children: React.ReactNode;
  className?: string;
  delay?: number;
  duration?: number;
  coverClassName?: string;
}) {
  const reduce = useReducedMotion();
  /*
   * `committed` (0.6) so a card only uncovers once it is properly on screen. A
   * low threshold fires while the card is still half off the right edge, which
   * makes several appear to reveal at once instead of in sequence.
   */
  const [ref, inView] = useReveal<HTMLDivElement>(VIEWPORT.committed);

  return (
    <div ref={ref} className={`relative overflow-hidden ${className ?? ""}`}>
      {children}
      {!reduce ? (
        <motion.div
          aria-hidden
          className={`pointer-events-none absolute inset-0 z-10 origin-top ${coverClassName}`}
          initial={{ scaleY: 1 }}
          animate={{ scaleY: inView ? 0 : 1 }}
          transition={{ duration, delay, ease: EASE }}
        />
      ) : null}
    </div>
  );
}

export function RevealItem({
  children,
  className,
  direction = "up",
  distance = DISTANCE,
  /** Overrides the default per-child duration, for slower large elements. */
  duration = 0.65,
}: {
  children: React.ReactNode;
  className?: string;
  direction?: Direction;
  distance?: number;
  duration?: number;
}) {
  return (
    <motion.div
      className={className}
      variants={{
        hidden: { opacity: 0, ...offsetFor(direction, distance) },
        visible: {
          opacity: 1,
          x: 0,
          y: 0,
          transition: { duration, ease: EASE },
        },
      }}
    >
      {children}
    </motion.div>
  );
}
