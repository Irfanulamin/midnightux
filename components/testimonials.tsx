import Image from "next/image";

import { SectionIntro } from "@/components/section-intro";
import {
  TestimonialCarousel,
  type Testimonial,
} from "@/components/testimonial-carousel";
import { Reveal } from "@/components/ui/reveal";

/*
 * Realistic placeholder quotes: one concrete outcome each, short enough to read
 * in a glance. Names and companies are fictional; swap in real ones when you
 * have them.
 */
const testimonials: Testimonial[] = [
  {
    name: "Johnson Smith",
    role: "Founder, Loomcraft Studio",
    rating: "10/10",
    quote:
      "They showed me a homepage before I paid a cent, and it already beat the site I had been putting off for two years. We were live the week after.",
    image: "/design/testimonial-johnson-smith.png",
    /*
     * 535 x 830, measured off the file. It was declared 287 x 405 (the design's
     * display box, not the export), and next/image treats these as the source's
     * INTRINSIC size: it caps the width it will serve at that figure and derives
     * the reserved aspect from it. So this slide was pinned to 287px when 535 was
     * available, and to a 0.709 aspect when the file is 0.645, which is most of
     * why it looked softer and framed differently from the other two.
     */
    width: 535,
    height: 830,
  },
  {
    name: "Alexis John",
    role: "Founder, Northbend Coffee",
    rating: "9.5/10",
    quote:
      "We had the new site and a working booking form live in nine days. Enquiries have not dropped off since.",
    image: "/design/testimonial-alexis-john.png",
    width: 463,
    height: 632,
  },
  {
    name: "Max Francisco",
    role: "Director, Halden Strength",
    rating: "10/10",
    quote:
      "They rebuilt the pages around how members actually use them. Sign-ups climbed without us changing anything else.",
    image: "/design/testimonial-max-francisco.png",
    width: 736,
    height: 946,
  },
];

export function Testimonials() {
  return (
    <section
      id="success-stories"
      className="relative scroll-mt-24 overflow-hidden bg-cream px-6 py-16 sm:py-20 md:py-28"
    >
      {/*
        `isolate` makes this a stacking context so the quote mark's -z-10 stops
        here, behind the heading and the card but still in front of the
        section's cream. Without it the mark would drop behind the section
        background and disappear entirely.
      */}
      <div className="relative isolate mx-auto max-w-[1160px]">
        {/*
          The oversized quote mark behind the section (Figma node 86:10657 —
          two copies of the same comma, which is all the export contains).

          Measured against the CONTENT column, not the section. The design's
          content is 1128 wide inside a 1440 frame, and every figure below is a
          ratio of that 1128, so the mark caps with the column at 1160 instead
          of growing with the viewport — sized off the section it reached
          ~1470px on a 1920 display, half again the size it is drawn.

            group w 1101.5 / 1128            -> 97.6% of the column
            each  w 514.2  / 1101.5          -> 46.7% of the group
            gap     73.2   / 1101.5          ->  6.6% of the group
            bleed past the column's right edge, and the rise above its top,
            are translates of the mark's OWN size rather than offsets in px or
            in column-%, so the whole composition scales as one piece and holds
            at every width.

          The section is already `overflow-hidden`, which crops the bleed the
          way the mask does in Figma. The artwork is white at ~43% alpha in the
          file itself, so it needs no opacity here — over cream it resolves to
          the lighter cream in the design. It sits before the content in DOM
          order, so the content paints over it without needing a z-index.

          Tailwind compiles translate-* to the standalone `translate` property
          while Motion writes `transform`, so the resting offset here and the
          entry travel below compose instead of overwriting each other.
        */}
        {/*
          alt="" keeps both images out of the accessibility tree.

          -z-10 is load-bearing, not decoration. An absolutely positioned
          element paints ABOVE non-positioned block content in the same
          stacking context whatever the DOM order, so being written before the
          heading was not enough — the mark was laying its cream over the words
          and lifting their colour. Dropping it a layer puts it where it
          belongs, behind the text rather than tinting it.
        */}
        <div className="pointer-events-none absolute top-0 right-0 -z-10 flex w-[97.6%] translate-x-[35.4%] -translate-y-[25%] gap-[6.6%]">
          {/*
            Slow and late: the mark drifts in from the right well after the
            heading has assembled, over 1.6s, so it reads as the section
            settling rather than a graphic snapping in. The outer comma trails
            the inner by ~0.2s, so the pair opens outward toward the edge it
            bleeds off instead of arriving as one slab. 90px of travel — a wide
            shape covers ground fast, so the distance stays modest and the
            duration does the smoothing. Each is its own <Reveal>, so the two
            delays are absolute and independent.

            amount 0.1: the mark is mostly outside the section's overflow, so
            the observer only ever sees the sliver that is not clipped.
          */}
          <Reveal
            direction="right"
            distance={90}
            duration={1.6}
            delay={0.75}
            amount={0.1}
            className="w-[46.7%]"
          >
            <Image
              src="/design/comma.png"
              alt=""
              width={2057}
              height={2872}
              className="w-full"
            />
          </Reveal>
          <Reveal
            direction="right"
            distance={90}
            duration={1.6}
            delay={1.25}
            amount={0.1}
            className="w-[46.7%]"
          >
            <Image
              src="/design/comma.png"
              alt=""
              width={2057}
              height={2872}
              className="w-full"
            />
          </Reveal>
        </div>

        <SectionIntro
          label="Success Stories"
          heading="Real Results for Real Businesses"
          headingClassName="mx-auto mt-7 max-w-[700px] text-ink"
          body={
            <>
              Every website we build is designed to solve business challenges
              and drive growth. Here&apos;s how we&apos;ve helped our clients
              succeed.
            </>
          }
          bodyClassName="mx-auto mt-6 max-w-[790px] text-ink-muted"
        />

        <TestimonialCarousel items={testimonials} />

      </div>
    </section>
  );
}
