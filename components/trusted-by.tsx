import Image from "next/image";

import { SectionIntro } from "@/components/section-intro";
import { Marquee } from "@/components/ui/marquee";

/*
 * Real client marks (public/trusted-logos), replacing the six placeholder
 * exports that shipped with the Figma frame. Ordered by filename, which is
 * arbitrary on purpose - the strip loops, so there is no first or last.
 *
 * `mono` is the legibility fix, not a style choice. Many of these are drawn for
 * dark backgrounds - createdevs and picanholo are white on transparent,
 * flighthive is white line art, polynodix sets its wordmark white beside a
 * gradient icon, kape's wordmark is white under a gold icon, techcenture's name
 * is white beside the purple cap, refile's is pale grey - so on the design's
 * cream tile they render as nothing at all. `brightness-0` collapses every
 * opaque pixel to black and leaves alpha alone, so a mark reads on cream
 * whatever colour it was drawn in, and the set reads as one set instead of a
 * scrapbook.
 *
 * `mono: false` is for the three that are knockout on a filled shape, where
 * flattening every opaque pixel to black destroys the mark rather than
 * recolouring it: Munch Box (white text on a filled disc, which becomes a black
 * coin with nothing on it), TGC (white lettering and horse on a red shield, 87%
 * opaque) and Dev Links (white "DEV" on a navy panel). Those are darkened
 * instead of flattened - greyscale plus a brightness cut takes the colour down
 * to the same near-black as the wordmarks while keeping the two tones the
 * knockout needs, so they sit in the set instead of beside it. Munch Box's own
 * olive at full strength was tried first and read as the odd one out.
 *
 * techlolli deliberately stays flattened even though its lollipop is a white
 * swirl on a filled disc: the disc is one glyph in a wordmark that is otherwise
 * all one light green, so the alternative pitches the whole word to mid grey to
 * save one detail, and at that brightness the swirl barely reads anyway. It
 * loses the swirl and keeps the name.
 *
 * Hovering a tile drops the filter and gives the mark back the colours it was
 * drawn in. Every tile does exactly the same thing - no per-logo casing, so the
 * row cannot look sorted into kinds. The resting tile stays the design's cream;
 * only the hover state darkens, to ink-soft.
 *
 * The dark hover is what makes one uniform rule possible. Nine of the thirteen
 * are drawn light for dark backgrounds (measured, not guessed - createdevs,
 * flighthive and techlolli are 100% light pixels, picanholo 84%, techcenture
 * 73%, refile 68%, kape 67%, inotary 56%, polynodix 45%), so simply
 * un-flattening them against cream trades a legible black mark for an invisible
 * white one, which is the failure `brightness-0` exists to prevent in the first
 * place. Dropping the tile to a dark surface gives all nine the background they
 * were designed for, and leaves the other four perfectly legible.
 *
 * A softened black rather than a brand green: teal and teal-deep are both
 * spoken for elsewhere (services, the curtain, the star pricing card), so a
 * tile wearing either reads as a piece of another section that wandered in, and
 * it colours the client's mark by association. ink-soft is neutral, which is
 * the point - it gets out of the way and lets the logo be the only colour in
 * the tile. Straight #101010 was too hard against cream; see globals.css.
 *
 * The uniform rule used to cost something: ai-driven and organice01 were drawn
 * in near-black on transparent, so they were the two marks that read perfectly
 * flattened on cream and lost contrast on the dark tile. Both have since been
 * dropped from the set, so every remaining mark gains from the hover and there
 * is no longer a case the single rule handles badly.
 *
 * The hover is per tile rather than per strip on purpose. The strip-wide
 * pointerenter already eases the marquee to a stop (see marquee.tsx), so the
 * two read as one gesture with two stages: arrive and the row settles, point at
 * a mark and that one comes back to life.
 */
const clients = [
  {
    src: "/trusted-logos/ai-artmade.png",
    alt: "AI Artmade",
    width: 408,
    height: 413,
  },
  {
    src: "/trusted-logos/createdevs.png",
    alt: "CreateDevs",
    width: 544,
    height: 116,  },
  {
    src: "/trusted-logos/dev-links.png",
    alt: "Dev Links",
    width: 816,
    height: 289,
    mono: false,
  },
  {
    src: "/trusted-logos/flighthive.png",
    alt: "Flighthive Technologies",
    width: 368,
    height: 280,  },
  {
    src: "/trusted-logos/inotary.png",
    alt: "iNotary",
    width: 1008,
    height: 199,  },
  {
    src: "/trusted-logos/kape-capital-financial.png",
    alt: "Kape Capital Financial",
    width: 440,
    height: 262,  },
  {
    src: "/trusted-logos/munch-box.png",
    alt: "Munch Box",
    width: 399,
    height: 406,
    mono: false,
  },
  {
    src: "/trusted-logos/picanholo.png",
    alt: "Picanholo",
    width: 1320,
    height: 592,  },
  {
    src: "/trusted-logos/polynodix.png",
    alt: "Polynodix",
    width: 720,
    height: 172,  },
  {
    src: "/trusted-logos/refile.png",
    alt: "ReFile",
    width: 560,
    height: 160,  },
  {
    src: "/trusted-logos/techcenture.png",
    alt: "Techcenture",
    width: 782,
    height: 220,  },
  {
    src: "/trusted-logos/techlolli.png",
    alt: "Techlolli",
    width: 720,
    height: 180,  },
  {
    src: "/trusted-logos/tgc.png",
    alt: "TGC",
    width: 137,
    height: 208,
    mono: false,
  },
];

export function TrustedBy() {
  return (
    <section className="px-6 py-14 sm:py-20 md:py-24">
      <SectionIntro
        className="mx-auto max-w-[1160px]"
        heading="Businesses That Trust Our Work"
        headingClassName="mx-auto max-w-[640px] text-ink"
        body={
          <>
            We&apos;re proud to partner with businesses across different
            industries, helping them build a strong online presence with
            websites that deliver real results
          </>
        }
        bodyClassName="mx-auto mt-6 max-w-[790px] text-ink-muted"
      />

      {/*
        Seconds per set width, so it has to scale with the set. 26 was tuned
        against six logos (45 read as drifting rather than running); the set is
        now thirteen, so holding 26 would run it well over twice as fast as the
        speed that was chosen. 56 is the same px/sec against the longer row, and
        it has to be re-derived whenever a logo is added or dropped.
      */}
      <Marquee duration={56} className="mt-10 sm:mt-16">
        {clients.map((client) => (
          <div
            key={client.src}
            /*
              py holds the design's 250px tile around the taller logo box.

              Colour only, no lift: these are client marks, and the point of the
              hover is to show you the real logo, not to offer it as a control.
              500ms on the shared decelerate curve, so a cursor crossing the row
              leaves a wake of tiles settling rather than a strobe.
            */
            className="group grid shrink-0 place-items-center rounded-2xl bg-cream px-14 py-[77px] transition-colors duration-500 ease-[cubic-bezier(0.16,1,0.3,1)] hover:bg-ink-soft"
          >
            {/*
              A fixed BOX rather than a fixed size, because these run from 1:1
              (Munch Box's seal) to 5:1 (the Organice wordmark). object-contain
              inside 164x80 lets a wordmark use the width and a roundel use the
              height, so they arrive at similar optical weight instead of the
              wordmark shrinking to a 16px sliver in a square.
            */}
            <Image
              src={client.src}
              alt={client.alt}
              width={client.width}
              height={client.height}
              /*
                group-hover drops the filter entirely and takes opacity to full,
                which is the whole hover: the mark returns to the colours it was
                drawn in. The group-hover utilities win over the resting filter
                on specificity (two classes plus a pseudo against one), not on
                source order, so the resting classes can stay last and readable.
              */
              className={`h-24 w-[164px] object-contain opacity-80 transition-[filter,opacity] duration-500 ease-[cubic-bezier(0.16,1,0.3,1)] group-hover:opacity-100 group-hover:brightness-100 group-hover:grayscale-0 ${
                client.mono === false
                  ? "brightness-[0.45] grayscale"
                  : "brightness-0"
              }`}
            />
          </div>
        ))}
      </Marquee>
    </section>
  );
}
