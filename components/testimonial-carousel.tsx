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
          per-item padding. That pattern is zeroed here and the spacing is a
          flex `gap` instead, which is not the usual advice and is the right
          call at one slide per view.

          The negative-margin/padding pair makes each slide a full-width box
          with the gutter cut OUT of it, so the card is narrower than the
          viewport by the gutter and sits against the left edge with a strip of
          cream stranded on the right. Fine when three slides are visible and
          that strip is the next card. Wrong here, where it is just a card that
          no longer lines up with the section.

          A `gap` adds the space BETWEEN the slides instead of inside them, so
          every card stays exactly viewport-wide at rest and the 16px only
          exists while the carousel is moving, which is the moment it is needed:
          without it the outgoing and incoming cards travel as one continuous
          white band and the advance reads as the text swapping rather than a
          card being replaced. Embla is fine with it, and this is worth knowing
          because its docs steer you to the margin pattern: it measures spacing
          as the distance between consecutive slide start edges
          (`measureWithGaps`), which picks up a flex gap exactly as it picks up
          a margin, in loop mode too.

          Deliberately wider than the 4px between the portrait and the quote
          card inside a slide, so the two gaps cannot be read as the same kind
          of seam.
        */}
        <CarouselContent className="ml-0 gap-4">
          {items.map((item, i) => (
            <CarouselItem key={item.name} className="pl-0">
              {/*
                Portrait and quote sit flush at md, exactly as in the design.
                Stacked below that they read as one broken card, so they only
                close up once they are side by side.

                `h-full` is what makes every slide the same size, and it is only
                visible on phones. Embla lays the slides out in a flex row, so
                CarouselItem already stretches to the height of the tallest one:
                the carousel is as tall as the longest quote no matter which
                slide is showing. What was missing is that this wrapper did not
                CLAIM that height, so a short testimonial drew a short white
                card and left the rest of the slide as empty page. Two quotes of
                different length therefore produced two visibly different cards
                in the same box, and advancing between them looked like the
                design changing size rather than the content changing.

                With the height claimed here, the card below takes the remainder
                through its own `flex-1` and its `justify-between` pins the name
                row to the bottom edge, so the footer sits in the same place on
                every slide. At md this is already true without help, because
                the 405px portrait is taller than any of the quotes and it is
                the portrait that sets the row height.
              */}
              <div className="flex h-full flex-col gap-4 md:flex-row md:gap-1">
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

                  `sizes` is 287, the width of the box, and it is only allowed to
                  be that because the ASSETS are now cut to 287:405 (see
                  testimonials.tsx). It was 405 while they were squares, and the
                  arithmetic is worth keeping because it is the trap here:
                  `sizes` describes how much image data is needed, and under
                  object-cover that is the COVERED size rather than the box. A
                  1:1 source in a 287 x 405 box is scaled to the box HEIGHT, so
                  it renders 405 wide and is cropped back to 287, and asking for
                  287 under-requests by ~41%. Now that the source aspect and the
                  box aspect are the same, cover scales to the width and the two
                  numbers finally agree.

                  So this is a function of the source's aspect against 287/405,
                  not a constant. Ship a differently shaped photo and it has to
                  be recomputed, which is the second reason the crop belongs in
                  the asset: it keeps the answer at 287.
                */}
                {/*
                  The box is now a wrapper rather than the <img> itself, because
                  the grain has to be a LAYER over the photograph (see
                  .photo-grain in globals.css). It cannot be a filter on the
                  image: CSS has no grain filter, and the two things that come
                  closest, contrast and saturate, are what was already tried
                  here and what the whole comment below is about giving up on.

                  Every box class stayed on this element and only object-fit
                  moved down, so the geometry is unchanged. `overflow-hidden` is
                  new and required: the grain layer is inset-0 on a rounded box,
                  so without it the texture squares off the corners the photo
                  rounds.
                */}
                <div className="photo-duotone photo-grain mx-auto aspect-[287/405] w-full max-w-[287px] shrink-0 overflow-hidden rounded-2xl md:mx-0 md:aspect-auto md:h-[405px]">
                  <Image
                    src={item.image}
                    alt={item.name}
                    width={item.width}
                    height={item.height}
                    sizes="287px"
                    /*
                      NOTHING ON THE IMAGE. It carries fit and position only, and
                      every part of the treatment lives on the wrapper: the
                      duotone needs the image to blend with a background it does
                      not own, and the grain needs to sit on top of the result.
                      The desaturate is applied there too (.photo-duotone img),
                      as step one of that sandwich rather than as a look in its
                      own right.

                      Worth recording that plain grayscale was tried here first,
                      and on its own it is the wrong tool. It removes the
                      chromatic tells, which is real, but it also flattens a
                      soft photograph into the midtones and leaves it looking
                      exactly as low resolution as it is, only duller: the
                      complaint that started all of this was made about the
                      black and white version.

                      What actually changed it was three things in order, and
                      none of them is a filter setting: crop to the subject so
                      the pixels are spent on a face rather than a room (see
                      testimonials.tsx), grain so the remaining softness reads
                      as film rather than as interpolation, and only then a
                      duotone so the whole thing reads as a treatment. Reach for
                      that order if these are ever replaced, rather than for the
                      opacity dials.
                    */
                    className="h-full w-full object-cover object-center"
                  />
                </div>

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
