import Image from "next/image";

import { SectionIntro } from "@/components/section-intro";
import { Marquee } from "@/components/ui/marquee";

/*
 * Real client marks (public/trusted-logos), replacing the six placeholder
 * exports that shipped with the Figma frame.
 *
 * `mono` is the legibility fix, not a style choice. Four of these six are drawn
 * for dark backgrounds - createdevs and picanholo are white on transparent,
 * kape's wordmark is white under a gold icon, techcenture's name is white
 * beside the purple cap - so on the design's cream tile they render as nothing
 * at all. `brightness-0` collapses every opaque pixel to black and leaves alpha
 * alone, so a mark reads on cream whatever colour it was drawn in, and the six
 * of them read as one set instead of a scrapbook.
 *
 * Munch Box is the exception and has to be: it is knockout white text on a
 * filled disc, so `brightness-0` turns it into a black coin with nothing on it.
 * It is darkened rather than flattened - greyscale plus a brightness cut takes
 * the olive down to the same near-black as the wordmarks while keeping the two
 * tones the knockout needs, so it sits in the set instead of beside it. Its own
 * olive at full strength was tried first and read as the odd one out.
 */
const clients = [
  {
    src: "/trusted-logos/createdevs.png",
    alt: "CreateDevs",
    width: 544,
    height: 116,
  },
  {
    src: "/trusted-logos/kape-capital-financial.png",
    alt: "Kape Capital Financial",
    width: 440,
    height: 262,
  },
  {
    src: "/trusted-logos/munch-box.png",
    alt: "Munch Box",
    width: 399,
    height: 406,
    mono: false,
  },
  {
    src: "/trusted-logos/organice01.png",
    alt: "Organice",
    width: 962,
    height: 188,
  },
  {
    src: "/trusted-logos/picanholo.png",
    alt: "Picanholo",
    width: 1320,
    height: 592,
  },
  {
    src: "/trusted-logos/techcenture.png",
    alt: "Techcenture",
    width: 782,
    height: 220,
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

      {/* Seconds per set width. 45 read as drifting rather than running. */}
      <Marquee duration={26} className="mt-10 sm:mt-16">
        {clients.map((client) => (
          <div
            key={client.src}
            /* No hover treatment — these are client marks scrolling past, not
               things to interact with. */
            /* py holds the design's 250px tile around the taller logo box. */
            className="grid shrink-0 place-items-center rounded-2xl bg-cream px-14 py-[77px]"
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
              className={`h-24 w-[164px] object-contain opacity-80 ${
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
