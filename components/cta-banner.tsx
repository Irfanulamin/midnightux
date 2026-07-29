import Image from "next/image";
import { ArrowUpRight, CheckCircle } from "@phosphor-icons/react/ssr";

import { BookingTrigger } from "@/components/booking-dialog";
import { Button } from "@/components/ui/button";
import { Reveal } from "@/components/ui/reveal";
import { MaskReveal } from "@/components/ui/text-reveal";

export function CtaBanner() {
  return (
    /*
      The header's "Get a Free Consultation" lands here, so the section needs an
      id. scroll-mt-24 matches the HEADER_OFFSET (96) that SmoothScroll applies,
      and is the fallback that keeps the banner clear of the fixed bar if Lenis
      is not running - same pairing as every other anchored section.
    */
    <section id="contact" className="scroll-mt-24 px-6 pb-16 sm:pb-20 md:pb-28">
      <Reveal className="relative mx-auto max-w-[1160px] overflow-hidden rounded-[24px] bg-[#28706d] px-6 py-12 text-white sm:px-10 sm:py-16 md:px-14 md:py-20">
        {/*
          Three layers, bottom up: the flat #28706d card, the grid, then the
          white gradient over the top of it.

          There was a fourth — the card colour rising from transparent, to fade
          the grid out toward the bottom — and it is gone on purpose. Ending at
          fully opaque #28706d, it did not fade the grid so much as erase it,
          and with the grid already at 10% there was nothing left to see. The
          white gradient does that job on its own: it is strongest at the top
          where it lifts the whole card, and thins toward the bottom, so the
          grid quietly loses contrast as it descends without being painted out.

          All of it paints below the content: the content div is positioned, so
          it comes after these in paint order regardless of anything else.
        */}
        {/*
          The grid, a 4x export of the 1128x412 card — its aspect matches the
          card's exactly, so at the design size the spacing lands as drawn.
          `object-cover` rather than a stretch: the card's aspect moves with
          the viewport, and scaling the artwork proportionally and cropping the
          excess keeps the grid square, where filling would shear it into
          diamonds.
        */}
        <Image
          src="/design/grid.png"
          alt=""
          aria-hidden
          width={4512}
          height={1648}
          className="opacity-25
           pointer-events-none absolute inset-0 h-full w-full object-cover bg-[linear-gradient(0deg,rgba(255,255,255,0.05)_0%,rgba(255,255,255,0.15)_100%)]"
        />
        

        <div className="relative flex flex-col gap-10 lg:flex-row lg:items-end lg:justify-between lg:gap-12">
          <div>
            <p className="text-[16px] text-white/80 sm:text-[19px]">
              Are You Still Confused To Work With Us?
            </p>
            {/*
              Two stacked masks rather than <TextReveal>, because the second
              line carries a coloured span — the word splitter takes a plain
              string. Each MaskReveal is a block, so they also supply the line
              break the <br> used to.
            */}
            <h2 className="mt-4 text-[clamp(2rem,4vw,3.25rem)] font-bold leading-[1.1] tracking-[-0.02em]">
              <MaskReveal>Build Your Website with</MaskReveal>
              <MaskReveal delay={0.1}>
                <span className="text-yellow">$0.00</span> Upfront
              </MaskReveal>
            </h2>

            <ul className="mt-8 flex flex-wrap items-center gap-x-6 gap-y-3 sm:mt-12 sm:gap-8">
              {["Free Draft Design", "No Commitment to Take Service"].map(
                (item) => (
                  <li key={item} className="flex items-center gap-2.5">
                    <CheckCircle
                      size={20}
                      weight="fill"
                      aria-hidden
                      className="text-yellow"
                    />
                    <span className="text-[15px] text-white/90">{item}</span>
                  </li>
                ),
              )}
            </ul>
          </div>

          <div className="shrink-0">
            <p className="text-[15px] text-white/70">9.8/10</p>
            <p className="mt-1 text-[17px] sm:text-[19px]">
              Successfully Completed 100+ Project
            </p>
            {/*
              Was a <Link href="/contact"> to a route that has never existed.
              It opens the booking dialog now, which is the thing the button was
              always promising. BookingTrigger merges the click onto the Button
              itself, so the pill keeps its own hover and press physics.
            */}
            <BookingTrigger intent="general">
              <Button size="lg" className="group mt-7">
                Contact Us
                <ArrowUpRight
                  size={18}
                  weight="bold"
                  aria-hidden
                  className="transition-transform duration-300 ease-[cubic-bezier(0.16,1,0.3,1)] group-hover:translate-x-0.5 group-hover:-translate-y-0.5"
                />
              </Button>
            </BookingTrigger>
          </div>
        </div>
      </Reveal>
    </section>
  );
}
