import Link from "next/link";

import { GrowthChart } from "@/components/growth-chart";
import { Button, ButtonLabel } from "@/components/ui/button";
import { RevealGroup, RevealItem } from "@/components/ui/reveal";
import { TextReveal } from "@/components/ui/text-reveal";

/*
 * Stacked banner: copy on top, chart underneath, the whole thing inside one
 * screen.
 *
 * The height has to be definite (h-, not min-h-), because the chart measures the
 * slot it is given and a percentage against an auto-height ancestor resolves to
 * nothing. dvh rather than vh so mobile browser chrome does not hide the bottom
 * of the chart, plus a px floor so a very short window overflows instead of
 * crushing the headline.
 *
 * The chart is the section's whole point, and it gets whatever the copy leaves,
 * so every vertical measure above it is sized in dvh rather than at a fixed px
 * or a breakpoint: `clamp(floor, Ndvh, ceiling)`. A short screen therefore hands
 * the drawing its space continuously rather than at one snap point, which is
 * what stopped the chart being squeezed on a laptop while looking right on a
 * desktop. The floors keep the copy legible when the window is genuinely tiny.
 *
 * The headline is clamped against BOTH axes, min(vw, dvh): width alone let it
 * stay at its cap on a wide-but-short window and eat the chart's height.
 *
 * There is deliberately no card behind the chart. The Figma has none (it sits
 * straight on the dot grid), and the white panel that used to be here was the
 * reason the chart looked small: a wide, short box against a drawing that could
 * not match its aspect, so the drawing scaled down inside it and left dead white
 * space either side.
 */
export function Hero() {
  return (
    <section
      id="top"
      className="bg-dotgrid relative flex h-dvh min-h-[620px] flex-col px-6 pt-[clamp(1.5rem,4dvh,4rem)] pb-[clamp(1rem,2.4dvh,2rem)]"
    >
      <div className="mx-auto max-w-[1160px] text-center">
        {/*
          The headline assembles word by word, then subcopy and CTAs follow as
          one group. Sequencing the two separately — rather than making the h1
          another RevealItem — is what lets the words carry the opening beat on
          their own before anything else moves.
        */}
        <TextReveal
          as="h1"
          text="Everything Your Business Needs in One Website"
          /*
           * Stepped down from the Figma's 88px, which sets three lines here and
           * would take roughly 130px straight out of the chart. Two lines at
           * this ramp is the trade the section is built on.
           */
          className="mx-auto max-w-[820px] text-[clamp(1.75rem,min(4.8vw,6dvh),3.5rem)] leading-[1.08] font-bold tracking-[-0.04em] text-ink"
          delay={0.15}
          stagger={0.06}
          duration={1}
          // Above the fold at load, so it must not wait to be scrolled into view.
          amount={0.1}
        />

        <RevealGroup stagger={0.11} delayChildren={0.55} amount={0.1}>
          <RevealItem>
            <p className="mx-auto mt-[clamp(0.5rem,1.8dvh,1.25rem)] max-w-[600px] text-[clamp(0.9375rem,1.9dvh,1.0625rem)] leading-[1.55] text-balance text-ink-muted">
              Professional websites for small businesses, designed, developed,
              launched, and supported without breaking your bank.
            </p>
          </RevealItem>

          <RevealItem>
            <div className="mt-[clamp(0.75rem,2.2dvh,1.5rem)] flex flex-wrap items-center justify-center gap-3">
              <Button asChild className="font-semibold">
                <Link href="/contact">
                  <ButtonLabel>Get a Free Consultation</ButtonLabel>
                </Link>
              </Button>
              <Button asChild variant="surface" className="font-semibold">
                <Link href="/work">
                  <ButtonLabel>View Our Work</ButtonLabel>
                </Link>
              </Button>
            </div>
          </RevealItem>
        </RevealGroup>
      </div>

      {/*
        The chart's slot, and nothing else: no card, no padding, no background.
        `flex-1 min-h-0` hands it the rest of the screen; GrowthChart measures this
        box and sizes itself inside it, holding the Figma's near-square aspect and
        its own px ceiling, then centring on the dot grid. So this max-w is only an
        outer bound, not the drawing's width, and the chart cannot be stretched
        wide by a wide window.
      */}
      <div className="mx-auto mt-[clamp(0.75rem,2.4dvh,2rem)] flex min-h-0 w-full max-w-[960px] flex-1 items-center justify-center">
        <GrowthChart />
      </div>
    </section>
  );
}
