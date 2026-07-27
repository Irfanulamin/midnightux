import { SectionIntro } from "@/components/section-intro";
import { WhyUsCard } from "@/components/why-us-card";
import type { WhyUsArtVariant } from "@/components/why-us-art";
import {
  IconAffordable,
  IconCommunication,
  IconCustomDesign,
  IconFastDelivery,
  IconOneSolution,
  IconResponsive,
} from "@/components/why-us-icons";

/*
 * Why Choose Us, rebuilt from the Figma's redesign (node 330:13398).
 *
 * The design used to be a 7-card 2/3/2 bento of big headings on cream; it is now
 * a UNIFORM 2 x 3 grid of six 365 x 370 cards, each one built the same way:
 *
 *   cream card, 16px radius, 30px padding
 *     24px coral icon
 *     24px gap
 *     26px teal title  (leading 30, tracking -0.52px)
 *     12px gap
 *     18px ink body at 70%  (leading 1.38, tracking -0.36px)
 *     line-art illustration + orange sweep in the lower half, bleeding off both
 *     edges and clipped by the card
 *
 * Every colour is an existing token: #f2ede1 is --color-cream, #1c5a55 is
 * --color-teal, and the icons' #FD7C5A is --color-coral. Nothing new was added.
 *
 * That uniformity is the design's and it stays, but it is also what made this
 * the flattest section on the page: six identical cream boxes, no depth (the
 * page bans blur and hover shadows, so there was no cue left), and static
 * artwork served as flat <img>. The fix is motion and layering rather than
 * layout — see components/why-us-art.tsx for the artwork's three tiers and
 * components/why-us-card.tsx for why each card now observes itself.
 *
 * The card and its artwork live in why-us-card.tsx because they share hover and
 * entrance state; this file is still a Server Component and holds only the copy.
 * The icons cross the client boundary as rendered elements rather than as
 * component references, which do not serialize.
 */

/*
 * One entry per card, in the Figma's reading order. `art` names a builder in
 * why-us-art.tsx rather than a file in public/ — the exports are inlined now, so
 * their layers can be addressed individually.
 */
const CARDS: {
  title: string;
  body: string;
  Icon: (p: { className?: string }) => React.ReactElement;
  art: WhyUsArtVariant;
}[] = [
  {
    title: "Custom Design",
    body: "Every website is designed from scratch, never from templates",
    Icon: IconCustomDesign,
    art: "customDesign",
  },
  {
    title: "Affordable Start",
    body: "Professional websites starting from just $0 upfront",
    Icon: IconAffordable,
    art: "affordable",
  },
  {
    title: "Fully Responsive",
    body: "Optimized for desktop, tablet, and mobile devices",
    Icon: IconResponsive,
    art: "responsive",
  },
  {
    title: "Clear Communication",
    body: "Transparent updates and collaboration from start to finish",
    Icon: IconCommunication,
    art: "communication",
  },
  {
    title: "One Solution",
    body: "Design, development, hosting, and support, all in one place",
    Icon: IconOneSolution,
    art: "oneSolution",
  },
  {
    title: "Fast Delivery",
    body: "Launch your website in a week, not months",
    Icon: IconFastDelivery,
    art: "fastDelivery",
  },
];

export function WhyUs() {
  return (
    <section className="px-6 py-16 sm:py-20 md:py-28">
      <div className="mx-auto max-w-[1160px]">
        <SectionIntro
          label="Why Choose Us"
          heading="Built for Small Businesses That Want Results"
          headingClassName="mx-auto mt-7 max-w-[740px] text-ink"
          body="We simplify the entire website process by bringing design, development, launch, and ongoing support together under one reliable team"
          bodyClassName="mx-auto mt-6 max-w-[780px] text-ink-muted"
        />

        {/*
          WRAP, do not stretch. This is flex-wrap with a fixed 365px card (the
          Figma's width) rather than a 1/2/3 column grid, and the difference is
          the point: grid columns divide the row, so at any width between
          breakpoints the cards stretch or squeeze, and a squeezed card re-wraps
          its title, moves its body, and slides the artwork under the copy. That
          reads as a layout bug rather than as a narrower card. At a fixed width
          the card is always the card, and the row simply fits three, then two,
          then one.

          `shrink-0` (on the card wrapper) is what enforces it — a flex item's
          default is to shrink.

          The width is `min(365px, 100%)` rather than `w-[365px] max-w-full`. The
          two look equivalent and are not: with `shrink-0` set, a flex item takes
          its width from flex-basis and the max-width clamp is applied at a
          different stage, which on a phone narrower than 365 plus the section's
          px-6 left the card wider than its container and pushed the page
          sideways. Folding the cap into the width itself cannot race anything:
          the used width is never more than the container, whatever flex does
          around it.

          There is no RevealGroup here any more. The cards observe themselves,
          for the reason set out in why-us-card.tsx.
        */}
        <div className="mt-10 flex flex-wrap justify-center gap-4 sm:mt-14 md:mt-16">
          {CARDS.map(({ title, body, Icon, art }, i) => (
            <WhyUsCard
              key={title}
              title={title}
              body={body}
              variant={art}
              index={i}
              icon={<Icon className="text-coral h-6 w-6" />}
            />
          ))}
        </div>
      </div>
    </section>
  );
}
