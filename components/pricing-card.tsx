"use client";

import { useRef } from "react";
import { CheckSquare } from "@phosphor-icons/react/ssr";
import { motion, useInView, useReducedMotion } from "motion/react";

import { BookingTrigger } from "@/components/booking-dialog";
import { PopularBadge } from "@/components/popular-badge";
import { PriceCounter } from "@/components/price-counter";
import { Button } from "@/components/ui/button";
import { EASE } from "@/components/ui/motion";
import type { BookingIntentId } from "@/lib/booking";

export type Plan = {
  name: string;
  blurb: string;
  /** The number the counter starts from, before the saving is applied. */
  priceFrom: number;
  priceTo: number;
  period: string;
  features: string[];
  tone: "light" | "dark";
  badge?: string;
  /** Which side the card converges from. */
  enterFrom: "left" | "right";
  /**
   * Which conversation this card's CTA opens. Both buttons read "Get Started",
   * so without this the studio would have no way to tell a $399 booking from a
   * $699 one, which is the single most useful thing to know before the call.
   */
  intent: BookingIntentId;
};


/* One block of the card: heading, blurb, price row, CTA, list header. */
const block = {
  hidden: { opacity: 0, y: 20 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.6, ease: EASE } },
};

/*
 * Feature rows come in from the left rather than from below, so the list reads
 * as being written down the card in order instead of rising as a block.
 */
const featureRow = {
  hidden: { opacity: 0, x: -12 },
  visible: { opacity: 1, x: 0, transition: { duration: 0.45, ease: EASE } },
};

/*
 * The tick is stamped on, not faded in: it springs from nothing with a slight
 * counter-rotation, landing just after its row has settled. Over nine rows
 * that reads as a checklist being ticked off one item at a time, which is the
 * thing the reader is actually being sold.
 *
 * A spring rather than a duration because the overshoot is the whole effect —
 * an eased scale to 1 looks like it grew, a spring looks like it was pressed.
 */
const tick = {
  hidden: { scale: 0, rotate: -35 },
  visible: {
    scale: 1,
    rotate: 0,
    transition: { type: "spring", stiffness: 520, damping: 15, delay: 0.12 },
  },
} as const;

/*
 * ONE observer for the whole section.
 *
 * Both cards, both price counters and both badges are driven from this single
 * `useInView` and a shared variant label. The cards previously carried a
 * `whileInView` each, which is what made them arrive out of step: two separate
 * IntersectionObservers on two elements of different height cross their
 * thresholds at different scroll positions, so the pair drifted apart by
 * whatever the height difference happened to be. One trigger cannot desync,
 * which is the same reason <RevealGroup> exists for the rest of the page.
 *
 * `animate` bound to a boolean rather than `whileInView` for the same reason:
 * it lets the counters (which are imperative, and cannot join a variant tree)
 * start from the exact instant the cards do.
 */
export function PricingGrid({ plans }: { plans: Plan[] }) {
  const ref = useRef<HTMLDivElement>(null);
  const inView = useInView(ref, { once: true, amount: 0.15 });
  const reduce = useReducedMotion();

  const state = reduce || inView ? "visible" : "hidden";

  return (
    <motion.div
      ref={ref}
      className="mt-10 grid grid-cols-1 gap-5 sm:mt-14 sm:gap-6 md:grid-cols-2"
      /*
       * No staggerChildren: the two cards are a mirrored pair and start on the
       * same frame, so the convergence reads as one gesture. Staggering them
       * was the second half of what made the entrance feel loose.
       */
      initial={reduce ? "visible" : "hidden"}
      animate={state}
      variants={{ hidden: {}, visible: {} }}
    >
      {plans.map((plan) => (
        <PricingCard key={plan.name} plan={plan} started={state === "visible"} />
      ))}
    </motion.div>
  );
}

/*
 * A pricing plan, and the one section on the page whose entrance is a sequence
 * rather than a single reveal.
 *
 * The two cards converge from opposite edges. That is the section's argument
 * made physical: this is a comparison, two options brought together, and it is
 * a movement no other section uses — Our Work wipes, How It Works pans, the
 * headings assemble word by word. Pricing gets its own.
 *
 * Once the pair lands, each card's contents unpack in reading order — name,
 * blurb, price, CTA, then the feature rows cascading one by one. The cascade is
 * the point: the list is what the reader is actually buying, and drawing it in
 * row by row makes them read it instead of skimming a wall of ticks. Both cards
 * run identical interior timing, so they stay mirror images the whole way in.
 *
 * The entrance sits on a wrapper and `.lift` stays on the article beneath it.
 * They cannot share an element: Motion writes an inline transform, and an
 * inline transform beats the class, so putting both on the article silently
 * killed the hover lift.
 */
function PricingCard({ plan, started }: { plan: Plan; started: boolean }) {
  const dark = plan.tone === "dark";

  return (
    <motion.div
      className="h-full"
      variants={{
        hidden: { opacity: 0, x: plan.enterFrom === "left" ? -40 : 40 },
        visible: {
          opacity: 1,
          x: 0,
          transition: {
            duration: 0.8,
            ease: EASE,
            staggerChildren: 0.06,
            delayChildren: 0.35,
          },
        },
      }}
    >
      <article
        className={`lift relative h-full rounded-2xl p-6 sm:p-8 md:p-10 ${
          dark ? "bg-teal-deep text-white" : "bg-cream"
        }`}
      >
        {plan.badge ? <PopularBadge>{plan.badge}</PopularBadge> : null}

        <motion.h3
          variants={block}
          className={`text-[23px] font-semibold sm:text-[28px] ${
            dark ? "" : "text-teal-deep"
          }`}
        >
          {plan.name}
        </motion.h3>

        <motion.p
          variants={block}
          className={`mt-3 text-[15px] ${dark ? "text-white/65" : "text-ink-muted"}`}
        >
          {plan.blurb}
        </motion.p>

        <motion.p
          variants={block}
          className="mt-6 flex items-baseline gap-3 sm:mt-8"
        >
          <PriceCounter
            from={plan.priceFrom}
            to={plan.priceTo}
            started={started}
            /* Starts as the price row itself settles, not before it exists. */
            delay={0.55}
            /*
              No tabular-nums: it is a different glyph set from the rest of the
              page's figures, so the price changed typeface while counting.
            */
            className={`text-[44px] font-bold leading-none sm:text-[56px] ${
              dark ? "" : "text-ink"
            }`}
          />
          <span
            className={`text-[16px] italic ${
              dark ? "text-white/65" : "text-ink-muted"
            }`}
          >
            {plan.period}
          </span>
        </motion.p>

        <motion.div variants={block} className="mt-6 sm:mt-8">
          <BookingTrigger intent={plan.intent}>
            <Button size="block">Get Started</Button>
          </BookingTrigger>
        </motion.div>

        <motion.p
          variants={block}
          className={`mt-8 border-t pt-7 text-[15px] ${
            dark ? "border-white/20 text-white/65" : "border-ink/10 text-ink-muted"
          }`}
        >
          What&apos;s Included:
        </motion.p>

        <motion.ul
          className="mt-5 space-y-4"
          variants={{
            hidden: {},
            visible: { transition: { staggerChildren: 0.05 } },
          }}
        >
          {plan.features.map((item, i) => (
            <motion.li
              key={i}
              variants={featureRow}
              className="flex items-center gap-3 text-[15px]"
            >
              <motion.span
                variants={tick}
                className={`flex shrink-0 ${dark ? "text-white/85" : "text-teal"}`}
              >
                <CheckSquare size={20} weight="fill" aria-hidden />
              </motion.span>
              {item}
            </motion.li>
          ))}
        </motion.ul>
      </article>
    </motion.div>
  );
}
