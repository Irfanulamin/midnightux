import Link from "next/link";

import { GrowthChart } from "@/components/growth-chart";
import { Button, ButtonLabel } from "@/components/ui/button";
import { GridRules } from "@/components/ui/grid-rules";
import { RevealGroup, RevealItem } from "@/components/ui/reveal";
import { TextReveal } from "@/components/ui/text-reveal";

/*
 * Stacked banner: copy on top, chart underneath.
 *
 * The Figma (node 332:13467) draws this as a WHITE ROUNDED CARD inset from the
 * page, not as a full-bleed background: #FFFFFF at radius 24, 10px clear of the
 * viewport on every side, with the cream page (--color-surface, #FBF9F5) showing
 * as a frame around it. The footer card is built the same way, so the page opens
 * and closes on the same shape.
 *
 * The design fills the card with a ruled grid AND a dot at every intersection.
 * Both are drawn (see .bg-dotgrid), the rules as a hairline connecting the dots,
 * the whole field fading out towards the foot of the card.
 *
 * The negative top margin is what puts the nav bar INSIDE that card, where the
 * design has it, rather than on the cream page behind it. It is the header's
 * whole flow height, from the shared --header-* variables in globals.css, so
 * the card's top edge lands 10px below the top of the page and the bar floats
 * 60px inside it.
 *
 * THE HERO IS NOT ONE SCREEN, AND MUST NOT BE MADE ONE AGAIN. It was `h-dvh`
 * for a long time, which meant the copy and the chart were competing for a
 * fixed budget: every measure had to be sized in dvh, and on an ordinary laptop
 * that resolved to a 56px headline (the design's is 88) above a chart that had
 * grown past the 646 x 550 it is drawn at. The section is now sized the way the
 * design sizes it, in the WIDTH:
 *
 *   88px headline  = 6.11vw at 1440, capped there so it never grows past the
 *                    design on a wide monitor
 *   9.73em measure = 856 / 88, set in em so the three-line break the Figma
 *                    draws survives at every size instead of reflowing
 *   646 x 550 chart, held by aspect-ratio rather than by a measured slot
 *
 * so the type is the same size at 1440 as it is in Figma, the whole card is the
 * design's 1380 tall, and on a laptop the foot of the chart sits just below the
 * fold. That is the trade: the headline reads at full size, and the drawing is
 * something you scroll the last inch to finish.
 *
 * There is deliberately no card behind the chart. The Figma has none (it sits
 * straight on the dot grid), and the white panel that used to be here was the
 * reason the chart looked small: a wide, short box against a drawing that could
 * not match its aspect, so the drawing scaled down inside it and left dead white
 * space either side.
 */
export function Hero() {
  return (
    <section id="top" className="-mt-[var(--header-flow)] px-2.5 pt-2.5">
      {/*
        Every vertical measure below is the Figma's, expressed as a fraction of
        its 1440 frame so the card holds its proportions down to tablet, with a
        px floor for phones and the 1440 value as the ceiling:

          pt   195 = 60 (card above the bar) + 71 (bar) + 64 (gap under it)
          pb    62

        which, with the 276 / 62 / 55 / 550 of content and the gaps between
        them, is the design's 1380px card exactly at 1440 wide.
      */}
      <div className="relative overflow-hidden rounded-[24px] bg-white px-6 pt-[clamp(6.5rem,13.5vw,195px)] pb-[clamp(2rem,4.3vw,62px)]">
        {/*
          The dot field on its own layer, because it carries a mask (see
          .bg-dotgrid): on the card itself the mask would fade the copy out
          along with the dots.
        */}
        <div
          aria-hidden
          className="bg-dotgrid pointer-events-none absolute inset-0"
        >
          {/*
            The rules go INSIDE the masked layer, not beside it, so they fade on
            the same ramp as the dots and reach nothing at the same place. They
            are SVG rather than more background-image because only SVG can be
            told to snap to the pixel grid - see grid-rules.tsx.
          */}
          <GridRules />
        </div>

        <div className="relative mx-auto max-w-[1160px] text-center">
          {/*
            The headline assembles word by word, then subcopy and CTAs follow as
            one group. Sequencing the two separately - rather than making the h1
            another RevealItem - is what lets the words carry the opening beat on
            their own before anything else moves.
          */}
          <TextReveal
            as="h1"
            text="Everything Your Business Needs in One Website"
            className="mx-auto max-w-[9.73em] text-[clamp(1.75rem,6.11vw,5.5rem)] leading-[1.045] font-bold tracking-[-0.04em] text-ink"
            delay={0.15}
            stagger={0.06}
            duration={1}
            // Above the fold at load, so it must not wait to be scrolled into view.
            amount={0.1}
          />

          <RevealGroup stagger={0.11} delayChildren={0.55} amount={0.1}>
            <RevealItem>
              {/* Figma: 18px over 640px, line-height 1.7, 24px under the head. */}
              <p className="mx-auto mt-[clamp(1rem,1.7vw,24px)] max-w-[640px] text-[clamp(1rem,1.25vw,18px)] leading-[1.7] text-balance text-ink-muted">
                Professional websites for small businesses, designed, developed,
                launched, and supported without breaking your bank.
              </p>
            </RevealItem>

            <RevealItem>
              {/* Figma: 55px pills, 20px of side padding, 16px labels. */}
              <div className="mt-[clamp(1.25rem,2.2vw,32px)] flex flex-wrap items-center justify-center gap-3 sm:gap-4">
                <Button
                  asChild
                  className="font-semibold sm:h-[55px] sm:px-5 sm:text-[16px]"
                >
                  <Link href="/contact">
                    <ButtonLabel>Get a Free Consultation</ButtonLabel>
                  </Link>
                </Button>
                <Button
                  asChild
                  variant="surface"
                  className="font-semibold sm:h-[55px] sm:px-5 sm:text-[16px]"
                >
                  {/* In-page jump, so plain <a> — see the header CTA. */}
                  <a href="#work">
                    <ButtonLabel>View Our Work</ButtonLabel>
                  </a>
                </Button>
              </div>
            </RevealItem>
          </RevealGroup>
        </div>

        {/*
          The chart's slot, and nothing else: no card, no padding, no background.
          The Figma's 646 x 550 held by aspect-ratio, which is what gives
          GrowthChart the definite height it has to measure - it sizes itself
          inside this box and a percentage against an auto-height ancestor would
          resolve to nothing. 124px of air above it at 1440, per the design.
        */}
        <div className="relative mx-auto mt-[clamp(2.5rem,8.6vw,124px)] aspect-[646/550] w-full max-w-[646px]">
          <GrowthChart />
        </div>
      </div>
    </section>
  );
}
