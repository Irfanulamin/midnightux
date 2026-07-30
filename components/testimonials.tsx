import Image from "next/image";

import { SectionIntro } from "@/components/section-intro";
import {
  TestimonialCarousel,
  type Testimonial,
} from "@/components/testimonial-carousel";
import { Reveal } from "@/components/ui/reveal";

/*
 * REAL testimonials. The three fictional ones that used to stand in here
 * (Johnson Smith, Alexis John, Max Francisco) and their three portraits were
 * removed outright, so nothing invented is left in this section to be mistaken
 * for genuine.
 *
 * Each quote was given verbatim about the studio's founder by name. The subject
 * on this page is the studio, so the name is swapped for MidnightUX and the
 * pronouns follow it; the per-entry comments record the original wording so the
 * edit stays auditable against what the client actually said.
 *
 * EVERY PHOTO IS CROPPED IN THE ASSET, not by object-cover, and that is the
 * fix for them reading as low quality.
 *
 * They arrive as 1000x1000 squares that the carousel would centre-crop into the
 * design's 287 x 405 box. Identical squares do guarantee identical geometry on
 * every slide, which was the point at the time, but a centre crop is a rule
 * applied to photographs that were framed nothing alike. Alysa's is a proper
 * head-and-shoulders portrait and survived it. Adm's is a wide candid of him
 * working, so a centre crop kept the whole room and left his face at maybe a
 * tenth of the frame: a soft photograph shown at 287 x 405 with the subject
 * that small has almost no real detail anywhere the eye actually looks, and no
 * filter fixes that, because the problem is not colour, it is that the
 * information is not there at the size it is being asked for.
 *
 * So each is now cropped to the subject by hand and stored at exactly 287:405
 * (574 x 810, a 2x render of the box). Two things follow. object-cover has
 * nothing left to crop, so the framing is decided here rather than emerging
 * from an aspect-ratio accident, and `sizes` in the carousel drops to the
 * width of the box because the covered size and the box are now the same
 * thing. Anything replacing these has to be cropped the same way; shipping a
 * square again re-opens both.
 *
 * WebP, and sharpened. The supplied PNGs were soft, and a light unsharp mask
 * (sigma ~1.1) recovers most of it at this render size. Sharpening makes PNG
 * bigger, not smaller - it doubled them to ~1.5MB each - so they are stored as
 * quality-92 WebP instead: visually identical, 33-55KB apiece. The alysa source
 * is flattened onto white first, since it carries alpha with rounded corners
 * baked in that must not reach the screen; vik's PNG declares an alpha channel
 * too but every pixel in it is opaque, so that one is simply dropped.
 *
 * Vik's crop is the same recipe with one number moved: 708 x 1000 (the tallest
 * 287:405 window a 1000px-square source holds) taken at x=170 rather than the
 * centre 146, because his head sits a little right of the frame's middle and a
 * true centre crop left him visibly off-axis in a portrait that is nearly all
 * face. Full height is kept, so the head lands in the top half exactly as it
 * does on the other two slides and the three cards read as one set.
 *
 * The uncropped full-frame versions are in git history if a different framing
 * is ever wanted.
 */
const testimonials: Testimonial[] = [
  {
    name: "Adm",
    role: "Founder & CEO, TheBLK Agency",
    rating: "9/10",
    /*
     * Given verbatim as "Kazi is the best, hands down one of the best at what
     * he does." The subject is the studio rather than the individual here, so
     * the name is swapped for MidnightUX and the pronoun with it - which also
     * takes "does" to "do", since "they" needs the plural verb.
     */
    quote:
      "MidnightUX is the best, hands down one of the best at what they do.",
    image: "/testimonial/adm.webp",
    width: 574,
    height: 810,
  },
  {
    name: "Alysa",
    role: "Senior UX Writer & Team Lead, Avast Software",
    rating: "10/10",
    /*
     * Given verbatim as "It was a wonderful experience working with Kazi. He's
     * incredibly talented and patient and knows what he is doing. I highly
     * recommend him to anyone looking for great UX designs." Same treatment as
     * the quote above: the studio is the subject, so Kazi becomes MidnightUX
     * and the pronouns follow it - he's/he/him to they're/they/them, and
     * "knows" to "know" to agree with the plural.
     */
    quote:
      "It was a wonderful experience working with MidnightUX. They're incredibly talented and patient and know what they are doing. I highly recommend them to anyone looking for great UX designs.",
    image: "/testimonial/alysa.webp",
    width: 574,
    height: 810,
  },
  {
    name: "Vik",
    role: "Founder, Kape Capital Financial",
    rating: "10/10",
    /*
     * Given verbatim as "Kazi is great to work with and it was easy to
     * communicate. He delivered quality designs. I would work with him again."
     * Same treatment as the two above: the studio is the subject, so Kazi
     * becomes MidnightUX and the pronouns follow it, he/him to they/them. No
     * verb has to move here - "delivered" is past tense, which reads the same
     * for both.
     */
    quote:
      "MidnightUX is great to work with and it was easy to communicate. They delivered quality designs. I would work with them again.",
    image: "/testimonial/vik.webp",
    width: 574,
    height: 810,
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
