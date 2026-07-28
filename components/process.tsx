import {
  CursorClick,
  FastForward,
  IdentificationCard,
  Lightbulb,
  Rocket,
  TrendUp,
} from "@phosphor-icons/react/ssr";

import { ProcessCarousel } from "@/components/process-track";
import { SectionIntro } from "@/components/section-intro";

/*
 * Six steps. The Figma draws five step cards (S1-S5) but six pagination dots,
 * so the sixth step existed in the design's intent even though its card was
 * never drawn — 06 Grow Together fills that slot and keeps the dots honest.
 */
const steps = [
  {
    n: "01",
    title: "Share Your Idea",
    body: "Tell us about your business and website goals",
    Icon: Lightbulb,
  },
  {
    n: "02",
    title: "Let's Meet",
    body: "A free 30-minute consultation to discuss your project",
    Icon: IdentificationCard,
  },
  {
    n: "03",
    title: "Free Design Preview",
    body: "See our initial homepage concept before making any commitment",
    Icon: CursorClick,
  },
  {
    n: "04",
    title: "Move Forward",
    body: "Approve the concept and we'll start the full website",
    Icon: FastForward,
  },
  {
    n: "05",
    title: "Build & Launch",
    body: "We design, develop, test, and launch your website",
    Icon: Rocket,
  },
  {
    n: "06",
    title: "Grow Together",
    body: "Need updates or improvements? We're here to help",
    Icon: TrendUp,
  },
];

export function Process() {
  return (
    <section id="process" className="scroll-mt-24">
      {/*
        Same pinned scrub as Our Work, for the same reason: the six steps are a
        sequence, and a marquee showed them as an undifferentiated loop the eye
        slides off. Pinned, each step arrives on its own and uncovers itself, so
        the section reads in the order the process actually happens.

        The carousel is a Client Component (it shares the active index between
        the cards and the pagination dots); the header stays server-rendered
        and crosses the boundary as JSX.

        Icons are rendered here and passed down as elements because a component
        reference cannot cross that boundary. Phosphor writes size onto the
        SVG's width/height attributes, so the size-* utilities (CSS) win and
        scale it without a second icon.
      */}
      {/*
        The heading sits OUTSIDE the pinned block, and that is what makes the
        cards their real size.

        The design draws this section 1145px tall — heading, a 562px card and
        the dots, all in one view. A pinned section is exactly one screen, so
        on anything shorter than roughly 1050px those three cannot all fit, and
        the card is what gives: pinning the heading too left about 390px for a
        562px card, so its bottom — the icon — was cropped, and the dots were
        pushed off the screen entirely.

        Scrolling the heading away first hands the pinned block ~300px back,
        which is more than the card needs. The rule stays inside the pin
        because the choreography depends on it: resting cards sit 50px below
        it and the active card rises 101px to cross it, both measured off the
        design.
      */}
      <SectionIntro
        className="mx-auto max-w-[1160px] px-6 pt-16 sm:pt-20 md:pt-28"
        label="How It Works"
        heading="A Simple Process From Idea to Launch"
        headingClassName="mx-auto mt-7 max-w-[820px] text-ink"
        body={
          <>
            We&apos;ve created a clear, collaborative process that keeps your
            project moving smoothly from the first conversation to a successful
            launch
          </>
        }
        bodyClassName="mx-auto mt-6 max-w-[790px] text-ink-muted"
      />

      <ProcessCarousel
        /*
          2px rule above the carousel, sampled at #e8e7e5 in the Figma.

          The md margin drops the rule down the pinned viewport. The pinned
          column is centred, so the margin is shared: the group grows by the
          full amount and re-centres, moving the rule down by half of it and
          carrying the cards with it. mt-8 therefore reads as about 16px lower.

          Clawed back under pin-short/pin-tight, where the column is already
          fighting for the card's full height and 16px of air above the rule is
          the cheapest thing in it to give up.
        */
        header={
          <div className="h-0.5 w-full bg-rule md:mt-8 pin-short:mt-3 pin-tight:mt-0" />
        }
        steps={steps.map((step) => ({
          n: step.n,
          title: step.title,
          body: step.body,
          icon: (
            <step.Icon
              size={120}
              weight="thin"
              aria-hidden
              className="size-[80px] sm:size-[120px] pin-short:size-[80px]"
            />
          ),
        }))}
      />
    </section>
  );
}
