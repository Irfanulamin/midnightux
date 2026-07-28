"use client";

import { useRef, useState } from "react";
import {
  motion,
  useReducedMotion,
  useScroll,
  useSpring,
  useTransform,
} from "motion/react";

import { EASE, VIEWPORT } from "@/components/ui/motion";
import { useReveal } from "@/components/ui/reveal";
import {
  ART_DRIFT,
  WhyUsArt,
  type WhyUsArtVariant,
} from "@/components/why-us-art";

/*
 * One Why Choose Us card: the cream panel, its copy, and the layered artwork
 * behind it.
 *
 * This exists as a client component because the card is where the section's
 * three motion sources meet, and all three need to be one thing:
 *
 *   entrance  the card and its artwork arrive as a single sequence
 *   drift     the subject parallaxes against its sweep on scroll
 *   hover     the card lifts and the artwork inside answers
 *
 * The section itself (why-us.tsx) stays a Server Component and passes the icon
 * across the boundary as rendered JSX, which is how ProcessCarousel takes its
 * SectionIntro header. A component reference could not cross; an element can.
 */

/*
 * ONE OBSERVER PER CARD, not one for the grid.
 *
 * This replaced a single <RevealGroup> around all six, and the change is the
 * point of the section rather than a detail of it. The grid wraps: three cards
 * per row at desktop, two at sm, ONE below that — which makes it up to six rows
 * and well over 2000px tall on a phone. A single observer at the group's own
 * threshold fired everything the moment the first row appeared, so rows two
 * through six played out entirely off screen and had long since settled by the
 * time they were scrolled to. The artwork animated; nobody ever saw it. Per-card
 * triggers cost five extra IntersectionObservers and are the only way the work
 * below is ever actually watched.
 *
 * The pricing cards' single-observer rule (see pricing-card.tsx) is the opposite
 * case and does not apply: those two must move as a mirrored pair, so separate
 * observers on elements of unequal height visibly drifted apart. These six are
 * independent and wrap, so they SHOULD arrive independently.
 *
 * `useReveal` rather than a bare useInView, because the reload behaviour has to
 * hold here too: with scroll restoration a reload can land below this section,
 * and a card that never fired would sit at opacity 0 when scrolled back up.
 */
const CARD = {
  hidden: { opacity: 0, y: 28 },
  visible: { opacity: 1, y: 0 },
};

export function WhyUsCard({
  title,
  body,
  icon,
  variant,
  /*
   * Column position, used only to lean the row left-to-right. Rows fire on
   * arrival; within a row the cards land in reading order. Modulo 3 is the
   * desktop column count — at narrower widths it degrades to an arbitrary
   * 0/70/140ms offset per card, which is harmless because the cards are no
   * longer beside each other for it to describe.
   */
  index,
}: {
  title: string;
  body: string;
  icon: React.ReactNode;
  variant: WhyUsArtVariant;
  index: number;
}) {
  const reduce = useReducedMotion();
  const [wrapRef, inView] = useReveal<HTMLDivElement>(VIEWPORT.in);
  const cardRef = useRef<HTMLElement>(null);
  const [hovered, setHovered] = useState(false);

  /*
   * Scroll-linked drift for the artwork's subject. Measured on the card, handed
   * to the art, so the SVG has no scroll wiring of its own.
   *
   * The spring is what stops it reading as nailed to the scrollbar. There used
   * to be a shared ui/parallax.tsx carrying the same reasoning and the same
   * constants, which this could not reuse anyway: that primitive wrapped its
   * child in a div, and this value has to reach an SVG <g> inside the card
   * rather than a box around it. Nothing else ever adopted it, so it was
   * removed and this is now the only scroll-linked drift on the page.
   */
  const { scrollYProgress } = useScroll({
    target: cardRef,
    offset: ["start end", "end start"],
  });
  const rawDrift = useTransform(
    scrollYProgress,
    [0, 1],
    [ART_DRIFT, -ART_DRIFT],
  );
  const drift = useSpring(rawDrift, {
    stiffness: 90,
    damping: 24,
    mass: 0.3,
  });

  const shown = reduce || inView;

  return (
    /*
     * The entrance sits on this wrapper and `.lift` on the article beneath it.
     * They cannot share an element: Motion writes an inline transform, which
     * beats the class and silently kills the hover lift. Same split as the
     * pricing cards.
     *
     * It is also what carries the variant label down to the artwork — the SVG's
     * groups read "hidden"/"visible" from here through MotionContext, which
     * passes through the plain <article> and <svg> in between. No second
     * observer, and a card can never fire out of step with its own art.
     */
    <motion.div
      ref={wrapRef}
      className="w-[min(365px,100%)] shrink-0"
      initial={reduce ? false : "hidden"}
      animate={shown ? "visible" : "hidden"}
      variants={{
        hidden: CARD.hidden,
        visible: {
          ...CARD.visible,
          transition: {
            duration: 0.65,
            delay: (index % 3) * 0.07,
            ease: EASE,
          },
        },
      }}
    >
      {/*
        aspect-[365/370] is the Figma's card, and it is what gives the
        absolutely-positioned artwork a height to be a percentage of. min-h is
        the floor for the narrow-phone case where the card has shrunk below
        365 and the ratio alone would leave the copy and the artwork fighting
        for the same space.

        `pointerType` guard rather than a CSS hover query: on touch,
        pointerenter fires on tap and would latch the artwork in its hover pose
        until something else was tapped, which is the same bug `.lift` avoids
        with @media (hover: hover).
      */}
      <article
        ref={cardRef}
        onPointerEnter={(e) => {
          if (e.pointerType === "mouse") setHovered(true);
        }}
        onPointerLeave={() => setHovered(false)}
        className="lift bg-cream relative flex aspect-[365/370] min-h-[340px] flex-col overflow-hidden rounded-2xl p-[30px]"
      >
        {/*
          Artwork first in DOM order so the copy paints over it. It is
          decoration — the title and body already carry the card's meaning — so
          it is aria-hidden and pointer-events-none, which also keeps it out of
          the way of the hover it reacts to.
        */}
        <WhyUsArt
          variant={variant}
          drift={reduce ? null : drift}
          hovered={hovered && !reduce}
        />

        <div className="relative">
          {icon}
          {/*
            Figma's exact ramp: 26/30 semibold teal with -0.52px tracking, then
            18px ink at 70% on 1.38 with -0.36px. Both are capped at 305px
            there, which is the 365 card minus its 2 x 30 padding, so the
            padding already does it and no max-w is needed.
          */}
          <h3 className="text-teal mt-6 text-[26px] leading-[30px] font-semibold tracking-[-0.52px]">
            {title}
          </h3>
          <p className="text-ink/70 mt-3 text-[18px] leading-[1.38] tracking-[-0.36px]">
            {body}
          </p>
        </div>
      </article>
    </motion.div>
  );
}
