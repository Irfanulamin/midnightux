"use client";

import Image from "next/image";
import { useEffect, useRef, useState } from "react";
import { useInView, useReducedMotion } from "motion/react";

import {
  Carousel,
  CarouselContent,
  CarouselItem,
  type CarouselApi,
} from "@/components/ui/carousel";
import { Progress } from "@/components/ui/progress";

export type Testimonial = {
  name: string;
  role: string;
  rating: string;
  quote: string;
  image: string;
  /** Intrinsic size of the export, so Next can reserve the right box. */
  width: number;
  height: number;
};

const pad = (n: number) => String(n).padStart(2, "0");

/** How long each slide holds, and how long the bar takes to fill. */
const AUTOPLAY_DELAY = 5200;

/*
 * The Success Stories carousel.
 *
 * THE PROGRESS BAR IS THE CLOCK. When its fill animation ends, the carousel
 * advances. There is no autoplay timer running alongside it.
 *
 * This started as Embla's autoplay plugin with the CSS bar set to the same
 * delay, and the two drifted apart, because they were never measuring the same
 * thing: the plugin schedules its next advance around the scroll animation
 * settling, while the bar restarted the moment the slide index changed, which
 * is when that scroll *begins*. So the bar always finished early and sat full
 * while the carousel took its time. Matching the numbers cannot fix that — the
 * offset is the transition itself, and any figure that lined them up would
 * break the moment the scroll duration changed.
 *
 * Driving one from the other makes them the same event. The bar fills, its
 * `animationend` fires, the slide advances, `select` remounts the bar and it
 * starts again. Pausing on hover comes free and stays exact: pausing the
 * animation pauses the thing that triggers the advance, rather than pausing a
 * separate timer and hoping the two resume together.
 *
 * The bar renders inside every slide because the design puts it in the card,
 * so only the current slide's bar is wired up — they all animate, but a handler
 * on each would advance the carousel once per slide.
 *
 * Under reduced motion there is no animation, so there is nothing to end and
 * the carousel never moves on its own. It stays fully usable by drag and
 * keyboard.
 */
export function TestimonialCarousel({ items }: { items: Testimonial[] }) {
  const reduce = useReducedMotion();
  const [api, setApi] = useState<CarouselApi>();
  const [selected, setSelected] = useState(0);

  /*
   * Nothing runs until the section is fully on screen.
   *
   * Without this the carousel spends the whole page scrolling through its
   * slides off screen, and by the time the reader arrives it is part way
   * through a quote with the bar half full. `amount: "all"` holds it until the
   * whole carousel is in view, so the countdown only ever starts from full on a
   * quote the reader can actually see. No `once`: it stops again when the
   * section leaves, not just starts when it first arrives.
   *
   * Pausing the fill is all it takes. The fill is what advances the carousel,
   * so a paused bar is a stopped carousel, and it holds its position rather
   * than resetting, so scrolling back finds it where it was left.
   */
  const ref = useRef<HTMLDivElement>(null);
  const inView = useInView(ref, { amount: "all" });

  /*
   * Clamped, because this index can outlive the list it was taken from.
   *
   * `selected` is Embla's snap index held in React state, and it is not
   * re-derived when `items` changes - Fast Refresh in particular preserves
   * state across a hot update, so editing this file from three testimonials
   * down to two left `selected` sitting at 2 with only 0 and 1 remaining.
   *
   * That single stale number breaks three things at once, which is worth
   * spelling out because none of them look related: the counter reads "03" of
   * "02"; `i === current` matches no slide, so no progress bar carries the
   * advance handler and the autoplay stops dead on the last quote; and the
   * `key` never matches a real slide either. Clamping fixes all three, and it
   * is correct beyond hot reloads - any future change to the number of
   * testimonials would hit the same edge on a live page.
   */
  const current = Math.min(selected, items.length - 1);

  useEffect(() => {
    if (!api) return;
    // Subscribe only. Embla starts on slide 0, which is what `selected`
    // already holds, so there is nothing to read synchronously — and reading
    // it here would be a setState inside an effect, which the lint rules
    // reject for exactly the cascading-render reason they describe.
    const onSelect = () => setSelected(api.selectedScrollSnap());
    api.on("select", onSelect).on("reInit", onSelect);
    return () => {
      api.off("select", onSelect).off("reInit", onSelect);
    };
  }, [api]);

  return (
    /* `group` is what lets the countdown bar pause when the pointer is over
       the carousel. */
    <div ref={ref} className="group mt-10 sm:mt-16">
      {/*
        Loop only once there are more than two slides.

        Embla builds a loop by translating the real slides around the viewport
        rather than cloning them, which needs enough total width to keep a slide
        under the viewport at all times. At one slide per view, two slides is
        not enough: to close the loop it has to reposition the slide you just
        left back onto the far side, so it reappears as an apparent third and
        the set reads as A, B, A. That is the duplicate.

        Below the threshold the loop is off and the wrap is done by hand in the
        advance handler, which costs one reverse scroll at the end and shows
        each person exactly once.
      */}
      <Carousel
        setApi={setApi}
        opts={{ loop: items.length > 2, align: "start", duration: 32 }}
        className="w-full"
      >
        {/*
          The generated CarouselContent carries a negative margin to pair with
          per-item padding. There is one slide across at every width here, so
          the gutter is zeroed rather than fought.
        */}
        <CarouselContent className="ml-0">
          {items.map((item, i) => (
            <CarouselItem key={item.name} className="pl-0">
              {/*
                Portrait and quote sit flush at md, exactly as in the design.
                Stacked below that they read as one broken card, so they only
                close up once they are side by side.
              */}
              <div className="flex flex-col gap-4 md:flex-row md:gap-1">
                {/*
                  ONE box at every width: the design's 287 x 405 portrait.

                  It used to be `w-full h-[320px]` below md, widening to the
                  design's portrait only at md, and that broke the slides against
                  each other in two ways at once.

                  The three exports are 535x830, 463x632 and 736x946 -- different
                  sizes AND different aspects (0.645 / 0.733 / 0.778). next/image
                  never upscales past a source's intrinsic width, so a full-width
                  box at sm (about 590px) served the smallest at an upscale and the
                  largest at native: one slide soft, the next sharp. Meanwhile
                  object-top over three different aspects cropped each portrait to a
                  different place, so the framing jumped on advance.

                  Pinning the aspect to 287/405 and capping the width at 287 fixes
                  both: identical geometry on every slide, identical crop, and no
                  asset ever asked to fill more pixels than it has. `sizes` is
                  explicit for the same reason -- with it absent the browser assumes
                  100vw and picks candidates for a box far wider than this ever is.

                  `sizes` is 405, NOT the 287 of the box, and the difference is
                  the whole reason these looked soft.

                  `sizes` has to describe how much image data is needed, and
                  under object-cover that is the COVERED size, not the box. The
                  portraits this was written for were taller than 287/405, so
                  cover scaled them to the box width and 287 was right. The
                  photos are 1:1 now, so cover scales them to the box HEIGHT:
                  they render 405 x 405 and get cropped to 287 wide. Asking for
                  287 therefore under-requests by ~41%, and on a 2x screen the
                  browser picked a 640px candidate to fill an 810px render and
                  upscaled it. 405 makes it choose 828 instead.

                  Anything replacing these photos should re-check this number:
                  it is a function of the source's aspect against 287/405, not
                  a constant.
                */}
                <Image
                  src={item.image}
                  alt={item.name}
                  width={item.width}
                  height={item.height}
                  sizes="405px"
                  className="mx-auto aspect-[287/405] w-full max-w-[287px] shrink-0 rounded-2xl object-cover object-center md:mx-0 md:aspect-auto md:h-[405px]"
                />

                <div className="flex flex-1 flex-col justify-between rounded-2xl bg-white p-6 sm:p-8 md:p-11">
                  <div>
                    <p className="max-w-[740px] text-[19px] leading-[1.4] tracking-[-0.01em] text-ink sm:text-[22px] md:text-[26px] md:leading-[1.35]">
                      {item.quote}
                    </p>
                    <p className="mt-6 text-[15px] text-ink-muted">
                      Recommendation:{" "}
                      <span className="text-coral">{item.rating}</span>
                    </p>
                  </div>

                  {/*
                    Name on the left, slide counter on the right, on one line at
                    the foot of the card — the row the design draws.

                    The counter lives inside the card rather than under the
                    carousel, so it has to be rendered per slide. It reads the
                    shared `selected` state, not anything from `item`, so every
                    slide shows the same figure and it looks like one fixed
                    control rather than something travelling with the quote.
                  */}
                  <div className="mt-8 flex items-end justify-between gap-6 sm:mt-10">
                    <div>
                      <p className="text-[18px] font-semibold text-ink">
                        {item.name}
                      </p>
                      <p className="mt-1 text-[15px] text-ink-muted">
                        {item.role}
                      </p>
                    </div>

                    <div className="flex shrink-0 items-center gap-3 text-[14px]">
                      <span className="text-ink tabular-nums">
                        {pad(current + 1)}
                      </span>
                      {/*
                        `key` is what makes this a countdown. Remounting the
                        element on every slide change restarts the CSS
                        animation from empty — restarting an animation in place
                        otherwise means removing the class, forcing a reflow
                        and adding it back, which is a DOM hack where React
                        already has the right tool.

                        Reduced motion has no countdown to show, so it falls
                        back to what the bar means statically: how far through
                        the set you are.
                      */}
                      <Progress
                        key={current}
                        value={
                          reduce ? ((current + 1) / items.length) * 100 : 0
                        }
                        indicatorClassName={
                          reduce
                            ? undefined
                            : `progress-fill group-hover:[animation-play-state:paused] ${
                                inView ? "" : "[animation-play-state:paused]"
                              }`
                        }
                        style={
                          {
                            "--progress-duration": `${AUTOPLAY_DELAY}ms`,
                          } as React.CSSProperties
                        }
                        /*
                          Only the visible slide's bar advances the carousel.
                          Every slide's bar fills, and one handler each would
                          scroll that many slides at once. `animationend`
                          bubbles, so catching it on the root picks up the fill
                          inside.

                          It scrolls to an explicit index rather than calling
                          scrollNext, because scrollNext is a no-op at the end
                          of a non-looping carousel - and the loop is off at two
                          slides (see the Carousel opts). The bar has already
                          fired its one animationend by then, so nothing would
                          ever restart it and the autoplay just died on the last
                          quote.

                          `(current + 1) % items.length` has no such end: it
                          wraps by arithmetic, so it behaves the same whether
                          the loop is on or off and cannot get stuck at any
                          number of slides.
                        */
                        onAnimationEnd={
                          i === current
                            ? () =>
                                api?.scrollTo((current + 1) % items.length)
                            : undefined
                        }
                        aria-label={`Testimonial ${current + 1} of ${items.length}`}
                        className="w-16 sm:w-20"
                      />
                      <span className="text-ink/40 tabular-nums">
                        {pad(items.length)}
                      </span>
                    </div>
                  </div>
                </div>
              </div>
            </CarouselItem>
          ))}
        </CarouselContent>
      </Carousel>
    </div>
  );
}
