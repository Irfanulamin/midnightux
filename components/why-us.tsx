import Image from "next/image";

import { SectionIntro } from "@/components/section-intro";
import { RevealGroup, RevealItem } from "@/components/ui/reveal";
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
 * The artwork is Figma's own SVG export (public/design/why-us/). SVG rather than
 * the 4x PNGs the old bento used, for two reasons: it stays sharp at every card
 * width, and it sidesteps the Next image-optimizer cache note that file carried
 * (the optimizer keys on URL, so replacing a PNG in place kept serving stale
 * bytes). The orange sweep is part of each export rather than hand-drawn, since
 * it is one clipped path per card and separating it would mean re-deriving six
 * curves by eye; see the note on ART below if it needs to come out.
 *
 * `unoptimized` on every one of them is LOAD-BEARING, not a hint. Next's image
 * optimizer refuses SVG unless `dangerouslyAllowSVG` is set in next.config, and
 * it is not set here (correctly: it would apply to every SVG the app ever
 * serves). Without `unoptimized` the /_next/image request 400s and all six cards
 * render with no artwork at all. There is nothing to optimize in a vector anyway,
 * so this serves the file straight from public/.
 *
 * Sizes are all percentages of the card, never fixed px. The Figma draws these at
 * exactly 365 wide and the grid is fluid, so a px offset is only correct at one
 * viewport; as a share of the card the art holds its position at any width.
 */

/*
 * One entry per card, in the Figma's reading order. Every `art` is a single
 * full-bleed 365 x 370 export, so all six cards render through one identical code
 * path.
 *
 * Clear Communication needed building to get there. Figma composites that one
 * through a CSS alpha mask instead of flattening it, so `get_design_context`
 * returns three separate pieces and their offsets rather than one image. Placing
 * them individually as percentages of the card worked geometrically but put the
 * sweep on its own sizing rules (it is 117.75% wide, wider than the card) and left
 * its right end depending on how the browser resolved a percentage width on an
 * absolutely-positioned next/image. So the three were composed once, offline, into
 * art-communication.svg at the design's exact card-space coordinates:
 *
 *   sweep  x -48.25   y 257.70   429.807 x 177.825   (box is the export's real
 *                                                     size: the node measures
 *                                                     427.5 x 175.5, the rest is
 *                                                     the 2px stroke's overhang)
 *   bubble x  96.00   y 214.00    85.738 x  77
 *   reply  x 205.738  y 258.00    51.220 x  46       (mirrored on X: Figma rotates
 *                                                     it 180 and flips it on Y,
 *                                                     which nets to the same thing)
 *
 * The mask asset is not needed; the card's own overflow-hidden does that job. The
 * three source pieces are inlined as data URIs, so nothing is fetched at runtime.
 */
const CARDS = [
  {
    title: "Custom Design",
    body: "Every website is designed from scratch, never from templates",
    Icon: IconCustomDesign,
    art: "/design/why-us/art-custom-design.svg",
  },
  {
    title: "Affordable Start",
    body: "Professional websites starting from just $0 upfront",
    Icon: IconAffordable,
    art: "/design/why-us/art-affordable.svg",
  },
  {
    title: "Fully Responsive",
    body: "Optimized for desktop, tablet, and mobile devices",
    Icon: IconResponsive,
    art: "/design/why-us/art-responsive.svg",
  },
  {
    title: "Clear Communication",
    body: "Transparent updates and collaboration from start to finish",
    Icon: IconCommunication,
    art: "/design/why-us/art-communication.svg",
  },
  {
    title: "One Solution",
    body: "Design, development, hosting, and support, all in one place",
    Icon: IconOneSolution,
    art: "/design/why-us/art-one-solution.svg",
  },
  {
    title: "Fast Delivery",
    body: "Launch your website in a week, not months",
    Icon: IconFastDelivery,
    art: "/design/why-us/art-fast-delivery.svg",
  },
] as const;

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
          Cascades card by card in reading order.

          Card-level stagger is right here in a way it was not for the old bento:
          the cards are now independent items rather than flex children dividing a
          fixed column height, so wrapping each in its own animated element cannot
          break the layout the way it would have before.

          WRAP, do not stretch. This is flex-wrap with a fixed 365px card (the
          Figma's width) rather than a 1/2/3 column grid, and the difference is the
          point: grid columns divide the row, so at any width between breakpoints
          the cards stretch or squeeze, and a squeezed card re-wraps its title,
          moves its body, and slides the artwork under the copy. That reads as a
          layout bug rather than as a narrower card. At a fixed width the card is
          always the card, and the row simply fits three, then two, then one.

          `shrink-0` is what enforces it (a flex item's default is to shrink).

          The width is `min(365px, 100%)` rather than `w-[365px] max-w-full`. The
          two look equivalent and are not: with `shrink-0` set, a flex item takes
          its width from flex-basis and the max-width clamp is applied at a
          different stage, which on a phone narrower than 365 plus the section's
          px-6 left the card wider than its container and pushed the page sideways.
          Folding the cap into the width itself cannot race anything: the used
          width is never more than the container, whatever flex does around it.
        */}
        <RevealGroup
          stagger={0.09}
          delayChildren={0.1}
          amount={0.15}
          className="mt-10 flex flex-wrap justify-center gap-4 sm:mt-14 md:mt-16"
        >
          {CARDS.map(({ title, body, Icon, art }) => (
            <RevealItem key={title} className="w-[min(365px,100%)] shrink-0">
              {/*
                aspect-[365/370] is the Figma's card, and it is what gives the
                absolutely-positioned artwork a height to be a percentage of. The
                old bento used a fixed md:h-[900px] on the whole grid plus min-h-*
                per card, which had to be retuned every time the type changed; an
                aspect ratio needs no such maintenance.

                Applied at every width now that the card's width is fixed, so it
                resolves to the Figma's exact 370px. min-h is the floor for the
                narrow-phone case where max-w-full has shrunk the card and the
                ratio alone would leave the copy and the artwork fighting for the
                same space.
              */}
              <article className="lift bg-cream relative flex aspect-[365/370] min-h-[340px] flex-col overflow-hidden rounded-2xl p-[30px]">
                {/*
                  Artwork first in DOM order so the copy paints over it. Empty alt
                  plus aria-hidden: it is decoration, and the title and body
                  already carry the card's meaning.
                */}
                <Image
                  src={art}
                  alt=""
                  width={365}
                  height={370}
                  aria-hidden
                  unoptimized
                  className="pointer-events-none absolute inset-0 h-full w-full"
                />

                <div className="relative">
                  <Icon className="text-coral h-6 w-6" />
                  {/*
                    Figma's exact ramp: 26/30 semibold teal with -0.52px tracking,
                    then 18px ink at 70% on 1.38 with -0.36px. Both are capped at
                    305px there, which is the 365 card minus its 2 x 30 padding,
                    so the padding already does it and no max-w is needed.
                  */}
                  <h3 className="text-teal mt-6 text-[26px] leading-[30px] font-semibold tracking-[-0.52px]">
                    {title}
                  </h3>
                  <p className="text-ink/70 mt-3 text-[18px] leading-[1.38] tracking-[-0.36px]">
                    {body}
                  </p>
                </div>
              </article>
            </RevealItem>
          ))}
        </RevealGroup>
      </div>
    </section>
  );
}
