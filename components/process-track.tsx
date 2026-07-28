"use client";

import { useCallback, useRef, useState } from "react";
import { useMotionValueEvent, useScroll } from "motion/react";

import { HorizontalPan } from "@/components/ui/horizontal-pan";

export type Step = {
  n: string;
  title: string;
  body: string;
  /* Passed as a rendered element, not a component: functions cannot cross the
     server/client boundary, but JSX can. */
  icon: React.ReactNode;
};

/*
 * The step carousel: pinned pan, six cards with exactly one lit at a time, and
 * the design's pagination dots underneath. It owns the <HorizontalPan> rather
 * than being slotted into one, because the active index has to reach both the
 * cards (inside the panning track) and the dots (below it, not panning), and
 * that shared state needs a common client-side parent.
 *
 * The highlight used to be a hover state, so the steps only read as a sequence
 * if you dragged a cursor across them. It is driven by position now, so the
 * scrub itself walks the user through the process: each step lifts and turns
 * yellow as it takes the centre of the screen, and settles back as the next one
 * takes over.
 *
 * Nearest-to-centre rather than an IntersectionObserver band, because "one at a
 * time" cannot be expressed as a band. Cards sit on a 384px pitch with a 24px
 * gap, so any observer window wider than that gap catches two neighbours at
 * once, and any window narrower than it drops to zero while a gap crosses the
 * middle. Measuring distance to the centre has neither failure: there is always
 * exactly one winner.
 *
 * The axis flips at the same breakpoint the pan does: horizontal while pinned
 * at md and up, vertical once the cards stack.
 *
 * Cost is six getBoundingClientRect reads per scroll frame, and setState only
 * when the winner actually changes, so the tree re-renders once per step rather
 * than once per frame. This is the sanctioned way to read scroll — a raw
 * scroll listener is banned by the taste skill.
 */
export function ProcessCarousel({
  header,
  steps,
}: {
  header?: React.ReactNode;
  steps: Step[];
}) {
  const refs = useRef<(HTMLElement | null)[]>([]);
  // -1 = nothing lit, which is correct until the section is actually on screen.
  const [activeIndex, setActiveIndex] = useState(-1);
  const { scrollY } = useScroll();

  const measure = useCallback(() => {
    const horizontal = window.matchMedia("(min-width: 768px)").matches;
    const centre = horizontal ? window.innerWidth / 2 : window.innerHeight / 2;

    let winner = -1;
    let shortest = Infinity;

    refs.current.forEach((el, i) => {
      if (!el) return;
      const r = el.getBoundingClientRect();

      // Ignore anything off screen, so nothing is lit before you arrive.
      const offScreen = horizontal
        ? r.right < 0 || r.left > window.innerWidth
        : r.bottom < 0 || r.top > window.innerHeight;
      if (offScreen) return;

      const cardCentre = horizontal ? (r.left + r.right) / 2 : (r.top + r.bottom) / 2;
      const distance = Math.abs(cardCentre - centre);
      if (distance < shortest) {
        shortest = distance;
        winner = i;
      }
    });

    setActiveIndex((prev) => (prev === winner ? prev : winner));
  }, []);

  useMotionValueEvent(scrollY, "change", measure);

  return (
    <HorizontalPan
      /*
        Enough trailing room for step 06 to reach the middle of the screen.
        At the default 12vw the track stops with the last card pinned near the
        right edge, so it never crossed the centre band and never lit up.

        38vw puts its centre at ~53% of the viewport on the final frame, which
        is inside the band. Going further (62vw was tried) just parks the card
        left of centre and leaves a screen of empty track scrolling past.
      */
      trailClassName="md:pr-[38vw]"
      /* 24px between cards at md, exactly the design's gap. */
      gapClassName="gap-8 md:gap-6"
      /*
        The cards have a real height (562px at lg), so the track must not
        stretch to fill the screen — grouped and centred, the leftover height
        sits above and below the whole block instead of being dumped under the
        cards, and the space above is what the active card lifts into.
      */
      centered
      header={header}
      footer={<Dots count={steps.length} active={activeIndex} />}
    >
      {steps.map((step, i) => {
        const active = i === activeIndex;
        return (
          <div
            key={step.n}
            /*
              pt-[44px] on top of the track's own mt-6 puts 68px between the
              rule and a resting card.

              The design's own gap was 50px, and this deliberately opens it up.
              The whole point of the move is the contrast between the step that
              has crossed the line and the ones that have not, and at 50px below
              / 51px above the two states sat almost symmetrically about the
              rule, which read as a wobble rather than as one card singled out.
              Dropping the resting cards and raising the active one further
              separates the two states instead of just offsetting them.
            */
            className="w-full md:w-[360px] md:shrink-0 md:pt-[44px] lg:min-w-[360px] pin-short:pt-8 pin-tight:pt-2"
          >
            {/*
              No border and no shadow, active or not: in the Figma the active
              card is a flat yellow plane; the raise alone does the separating.

              The raise is the design's line-crossing move. At rest the cards
              sit 68px below the rule that ends the header (track mt-6 + this
              wrapper's pt-[44px]); the active card lifts 136px at lg, putting
              its top edge 68px above the rule. Equal distance either side, so
              the lit step reads as having crossed a threshold rather than
              having nudged upward - the Figma's tighter 50px below / 51px above
              left the two states nearly symmetrical about the rule at this card
              size, which read as a wobble. The track paints after the header,
              so the raised card covers the rule rather than sliding under it.
              Below md there is no rule to cross, so the lift stays at the
              subtle 12px.

              The lift scales with the room above the card, since that is where
              it has to come from: 136px at lg, 92px at md AND at pin-short, 44
              under pin-tight where a full lift would carry the card's top edge
              off the top of the pin.

              pin-short carrying nearly the full lift is the important one and
              was originally the bug. It is `max-height: 1079px`, so practically
              every laptop is inside it - a 1440x900 has about 800px of viewport
              - which means the lg numbers are the ones almost nobody sees.
              Measured at 800px of viewport the column comes to ~698px, leaving
              ~51px of slack above it, so the card's top edge starts ~125px down
              and a 92px lift still clears the top of the pin by ~33px.

              700ms, not the 500ms used elsewhere: this transition is the
              storytelling beat, so it wants to be seen rather than snapped
              through. The lift is gated behind motion-safe, leaving
              reduced-motion users the colour change, which carries the same
              information without moving anything.

              overflow-hidden on the card is a guard for short viewports, where
              the corner icon would otherwise spill past the rounded corner.
            */}
            {/*
              Values below are the Figma's own, not approximations: 30px card
              padding (70px on top), 16px label in #399e98 at 50%, 96px
              SemiBold number and 32px title in #286f6b at 50% (both turning
              #1c5a55 — the teal token — on the active card), a 64px gap
              between number and title, 18px body at 1.7 line height, and a
              120px icon in the bottom-right corner. The icon is in flow after
              an mt-auto, so on cards squeezed shorter than the design's 562px
              it clips at the bottom edge instead of colliding with the body.
              `pin-short` compresses type and gaps on pinned viewports that
              cannot fit the full-scale card — see globals.css.

              Sizes climbing by breakpoint: 470px stacked, 510px once the pan
              takes over at md, and the design's 360x562 at lg. THE CARD IS
              NEVER SHRUNK TO FIT THE PIN — it is the section, and a step card
              scaled down to survive a short window is not the design.

              What gives instead is the room around it. The pinned section is
              exactly 100dvh and the column is centred, so anything the column
              cannot hold is clipped at BOTH ends: the top of the card goes, and
              the pagination dots go off the bottom. At the old spacing the
              column cost 218px around a 562px card, which needs 780px of
              viewport, and a maximised browser on a 1280x800 or 1366x768
              laptop has 640-690 — which is exactly the md-to-lg breakage. So
              `pin-short` (globals.css: pinned, under 1080px tall) trims the
              spacing rather than the card, here and in HorizontalPan:

                py-10  -> py-4    48
                mt-6   -> mt-3    12   (the track)
                pt-26  -> pt-3    14   (this wrapper)
                mt-16  -> mt-6    40   (the dots)

              114px back, so the whole column fits from about 662px of viewport
              height. Below that the design's card and its dots genuinely cannot
              share one screen, and the dots — decorative, aria-hidden — are what
              goes first: `pin-tight` (globals.css, under 680px) drops them,
              trims the padding again and cuts the lift to 24px, which carries
              the full-size card down to a 600px viewport. Without it the centred
              column overflowed both ends and the LIFTED card lost its top edge,
              which is the "cut off at the top" a 1366x768 laptop showed.
            */}
            <article
              ref={(el) => {
                refs.current[i] = el;
              }}
              data-active={active}
              className="group relative flex min-h-[470px] w-full flex-col overflow-hidden rounded-lg bg-cream-light p-6 pt-8 transition-all duration-700 ease-[cubic-bezier(0.16,1,0.3,1)] data-[active=true]:bg-yellow motion-safe:data-[active=true]:-translate-y-3 sm:p-[30px] sm:pt-[70px] md:min-h-[510px] md:motion-safe:data-[active=true]:-translate-y-[92px] lg:h-[562px] lg:w-[360px] lg:motion-safe:data-[active=true]:-translate-y-[136px] pin-short:pt-[30px] pin-short:motion-safe:data-[active=true]:-translate-y-[92px] pin-tight:motion-safe:data-[active=true]:-translate-y-11"
            >
              <p className="text-[14px] font-semibold tracking-[0.05em] text-[#399e98]/50 transition-colors duration-700 group-data-[active=true]:text-teal/70 sm:text-[16px]">
                /STEPS
              </p>
              <p className="mt-4 text-[72px] font-semibold leading-[1.1] tracking-[-0.02em] text-[#286f6b]/50 transition-colors duration-700 group-data-[active=true]:text-teal sm:mt-6 sm:text-[96px] pin-short:mt-4 pin-short:text-[72px]">
                {step.n}
              </p>
              <h3 className="mt-8 text-[24px] font-semibold leading-[1.15] tracking-[-0.05em] text-[#286f6b]/50 transition-colors duration-700 group-data-[active=true]:text-teal sm:mt-16 sm:text-[32px] pin-short:mt-7 pin-short:text-[25px]">
                {step.title}
              </h3>
              <p className="mt-4 max-w-[300px] text-[16px] leading-[1.7] text-ink/40 transition-colors duration-700 group-data-[active=true]:text-ink/70 sm:mt-6 sm:text-[18px] pin-short:mt-3 pin-short:text-[16px]">
                {step.body}
              </p>

              <div className="mt-auto -mr-2 -mb-2 shrink-0 self-end pt-4 text-[#286f6b]/50 transition-colors duration-700 group-data-[active=true]:text-teal">
                {step.icon}
              </div>
            </article>
          </div>
        );
      })}
    </HorizontalPan>
  );
}

/*
 * The design's pagination: six 14px dots with the active one swapped for a
 * 16px coral dot inside a coral-tinted ring (sampled rgba(253,124,90,0.2) —
 * exactly coral/20). Rendered as one shape whose colours and size transition,
 * so the state hands over smoothly instead of teleporting.
 *
 * Purely decorative — the scrub is the control — so it is aria-hidden. md-only
 * because the mobile fallback is a plain vertical stack with nothing to page.
 */
function Dots({ count, active }: { count: number; active: number }) {
  return (
    <div
      aria-hidden
      /*
        64px below the cards at md, which is the design's gap, cut to 24 on a
        pinned viewport short enough that the design's gap would push the dots
        off the bottom of the pin - see the card's note.

        Below `pin-tight` they go entirely. They and their gap are the last 46px
        of the column, and dropping them is what buys the card its full 562px
        without the lift running off the top of the screen. Decorative and
        aria-hidden, so nothing is lost but the paging read.
      */
      className="mt-8 hidden shrink-0 items-center justify-center gap-3 md:mt-16 md:flex pin-short:mt-6 pin-tight:hidden"
    >
      {Array.from({ length: count }, (_, i) => {
        const lit = i === active;
        return (
          <span
            key={i}
            className={`rounded-full p-[3px] transition-colors duration-300 ${
              lit ? "bg-coral/20" : "bg-transparent"
            }`}
          >
            <span
              className={`block rounded-full transition-all duration-300 ${
                lit ? "size-4 bg-coral" : "size-3.5 bg-rule"
              }`}
            />
          </span>
        );
      })}
    </div>
  );
}
