import Image from "next/image";

import { ProjectDialog, type Project } from "@/components/project-dialog";
import { SectionIntro } from "@/components/section-intro";
import { HorizontalPan } from "@/components/ui/horizontal-pan";
import { CurtainReveal } from "@/components/ui/reveal";

/*
 * Real client sites, replacing the four placeholder projects that stood in
 * while there were only two work images in the Figma export.
 *
 * WHAT THE CARD SHOWS, and why it is a still.
 *
 * The originals are full-page captures: 4481 to 5760 px wide, up to 32768 tall,
 * 182MB for the five, at aspect ratios from 1:5.3 to 1:7.3. They cannot be used
 * as they are - 32768 is the ceiling on image dimensions in Chrome and Safari,
 * so these are not merely oversized, they are at the point of not rendering.
 *
 * A scroll-through was built for them and then removed. The card became a
 * window, the section pinned, and each site scrolled its whole page top to
 * bottom while parked in the middle of the screen. It worked, and it was still
 * wrong: playing five ~6000px pages costs ~6400px of pinned scroll, which is
 * five screens where the reader cannot leave, and the honest read of that is
 * not generosity but a section that will not let go. A visitor deciding whether
 * to hire a studio does not need to be walked down all of somebody else's home
 * page; they need to see that the work is real and looks good, and then be
 * given a way through to the rest.
 *
 * So the card is a still of the top of each site, and the whole page moves into
 * a dialog behind a button (project-dialog.tsx). The section costs one screen
 * of pan again, and the full captures cost nothing at all until someone asks
 * for one, because Radix does not mount closed dialog content.
 *
 * `src` is the still: the top of each page cropped to EXACTLY the Figma card's
 * 1853x2023 ratio, so object-cover has nothing left to crop, then resized to
 * 1120 wide (2x the widest the card ever gets). 337KB for the set, down from
 * 182MB.
 *
 * `full` is the whole page at 1720 wide, ~0.7MB each, loaded on demand. 1720 is
 * 2x the 856px the dialog renders it at: the first pass built these at 1080,
 * which is only 1.26x the display size and left the body text on a downscaled
 * ~5000px capture visibly soft. At 2x it is legible, and it is only ever paid
 * for one at a time and only when asked for.
 *
 * The copy describes what is visibly on each page rather than claiming
 * outcomes, since these are the studio's own clients and the results are not
 * ours to state. Swap in real numbers where they exist.
 */
const projects: Project[] = [
  {
    src: "/our-work/web/crypto4good-top.webp",
    full: "/our-work/web/crypto4good.webp",
    fullWidth: 1720,
    fullHeight: 9138,
    title: "Crypto4Good",
    body: "A donation platform for social impact projects, where the running total carries the argument and the wallet flow stays out of the way.",
  },
  {
    src: "/our-work/web/munch-box-top.webp",
    full: "/our-work/web/munch-box.webp",
    fullWidth: 1720,
    fullHeight: 10618,
    title: "Munch Box",
    body: "A product site for a UK supplier of compostable tableware, built to sell to retail, wholesale and catering buyers from a single scroll.",
  },
  {
    src: "/our-work/web/off-grid-equipt-top.webp",
    full: "/our-work/web/off-grid-equipt.webp",
    fullWidth: 1720,
    fullHeight: 9853,
    title: "Off Grid Equipt",
    body: "A quote-first site for a West Australian solar lighting specialist, with the range, the credentials and the enquiry form on one page.",
  },
  {
    src: "/our-work/web/the-code-dose-top.webp",
    full: "/our-work/web/the-code-dose.webp",
    fullWidth: 1720,
    fullHeight: 12578,
    title: "The Code Dose",
    body: "A course landing page for a JavaScript program, laying out the full module roadmap before it ever asks anyone to enrol.",
  },
  {
    src: "/our-work/web/organice01-top.webp",
    full: "/our-work/web/organice01.webp",
    fullWidth: 1720,
    fullHeight: 10061,
    title: "Organice01",
    body: "A storefront for a digital template studio, with browsing, search and cart kept to a few taps on any screen.",
  },
];

export function OurWork() {
  return (
    <section id="work" className="scroll-mt-24">
      {/*
        The heading sits OUTSIDE the pinned block, the same call How It Works
        makes and for the same reason: the pin is exactly one screen, so every
        px the header holds is a px the shots do not get.

        Pinned, the header cost about 240px of a 100dvh section, and on a
        laptop between md and lg that left the images roughly 180px tall - a
        letterbox strip of a screenshot, cropped so hard there was nothing to
        look at. Scrolling the heading away first hands that height back to the
        track, and the shots come out around 440px on the same screen.
      */}
      {/* Left-aligned in the design, unlike its sibling sections. */}
      <SectionIntro
        align="left"
        className="mx-auto w-full max-w-[1160px] px-6 pt-16 sm:pt-20 md:pt-28"
        label="Our Work"
        heading="Websites That Deliver Real Results"
        headingClassName="mt-7 max-w-[620px] text-ink"
        body="Every project is designed with one goal in mind: helping businesses attract more customers, generate leads, and grow online"
        bodyClassName="mt-6 max-w-[640px] text-ink-muted"
      />

      {/*
        Card width scales with viewport HEIGHT, not width, because the crop is a
        height problem: the pin is 100dvh and the shot fills it, so on a 27"
        monitor (~1300px of viewport) a 420px card gave the media a 0.38 aspect
        against the screenshot's 0.916 and object-cover ate most of the width -
        the headline was cut off at both edges.

        Clamped 420-560: 420 is the Figma card and the floor short laptops keep,
        560 is as wide as a card can get before five of them stop reading as a
        row. justify-center then puts the leftover height above and below the
        card rather than dumping it all underneath.
      */}
      <HorizontalPan>
        {projects.map((project) => (
          <article
            key={project.src}
            className="flex w-full flex-col md:h-full md:w-[clamp(420px,46dvh,560px)] md:shrink-0 md:justify-center"
          >
            {/*
              Each shot is covered by a teal panel that lifts away as the card
              arrives, so the work is revealed rather than just appearing.
              rounded-xl lives on the wrapper so the cover is clipped to the
              same corners as the image beneath it.
            */}
            {/*
              max-h is the card width times the shot's 2023/1853 ratio (x
              1.0917), tracking the clamp above. It is the cap that stops
              object-cover cropping sideways: flex-1 still hands the media
              whatever height a short viewport has left (so it always fits), but
              it can never grow taller than the width can honestly carry.
            */}
            <CurtainReveal
              className="rounded-xl md:min-h-0 md:max-h-[clamp(459px,50.2dvh,611px)] md:flex-1"
              delay={0.05}
            >
              {/*
                Stacked on mobile the shot keeps its natural ratio. Inside the
                pin it fills the height the track has left over and crops,
                anchored to the top - though since the file is already cropped
                to the card's own ratio, object-cover has nothing to take off
                except on viewports short enough to squeeze the card.
              */}
              <Image
                src={project.src}
                alt={`${project.title} website`}
                width={1120}
                height={1223}
                className="h-auto w-full md:h-full md:object-cover md:object-top"
                sizes="(min-width: 768px) 560px, 92vw"
              />
            </CurtainReveal>

            {/*
              Title and action share a line, with the body underneath.

              The button sat below the body before, which pushed it to the
              bottom of a tall card where it read as a footer to the paragraph
              rather than as the thing to do with the project. On the heading
              line it is where the eye already is when it finishes reading the
              name, and the caption block ends on the copy instead of a pill.

              items-center rather than baseline: the pill and the heading are
              different heights, and matching their optical centres looks right
              where matching their baselines leaves the pill sitting low.
            */}
            <div className="mt-5 flex shrink-0 items-center justify-between gap-4 md:mt-6">
              <h3 className="min-w-0 text-[22px] font-semibold tracking-[-0.01em] text-ink sm:text-[26px]">
                {project.title}
              </h3>
              {/*
                The reason the card can afford to be a still: everything the
                crop cuts off is one click away, in a dialog rather than a
                route.
              */}
              <ProjectDialog project={project} />
            </div>

            <p className="mt-3 shrink-0 text-[15px] leading-7 text-ink-muted">
              {project.body}
            </p>
          </article>
        ))}
      </HorizontalPan>
    </section>
  );
}
