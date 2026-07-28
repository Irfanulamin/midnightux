import Image from "next/image";

import { SectionIntro } from "@/components/section-intro";
import { HorizontalPan } from "@/components/ui/horizontal-pan";
import { CurtainReveal } from "@/components/ui/reveal";

/*
 * Realistic placeholder projects (there are only two work images in the
 * export, so they repeat). Swap titles, copy and images when real case studies
 * exist.
 */
const projects = [
  {
    src: "/design/work-01.png",
    title: "Northbend Coffee",
    body: "A one-page ordering site for a local roaster. Live in eight days, with mobile orders climbing through the first month.",
  },
  {
    src: "/design/work-02.png",
    title: "Halden Strength",
    body: "A gym membership site rebuilt around how people actually sign up. A cleaner flow meant more joins completed, not just started.",
  },
  {
    src: "/design/work-01.png",
    title: "Meridian Dental",
    body: "A booking-first site for a two-chair practice. Fewer phone calls at the desk, more appointments booked overnight.",
  },
  {
    src: "/design/work-02.png",
    title: "Verde Landscaping",
    body: "A portfolio and quote-request site that turns weekend browsers into Monday enquiries.",
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
        letterbox strip of a screenshot that is 1853 x 2023, cropped so hard by
        object-cover that there was nothing to look at. Scrolling the heading
        away first hands that height back to the track, and the shots come out
        around 440px on the same screen.
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
        560 is as wide as a card can get before four of them stop reading as a
        row. justify-center then puts the leftover height above and below the
        card rather than dumping it all underneath.
      */}
      <HorizontalPan>
        {projects.map((project, index) => (
          <article
            key={index}
            className="flex w-full flex-col md:h-full md:w-[clamp(420px,46dvh,560px)] md:shrink-0 md:justify-center"
          >
            {/*
              Each shot is covered by a teal panel that lifts away as the card
              arrives, so the work is revealed rather than just appearing.
              rounded-xl lives on the wrapper so the cover is clipped to the
              same corners as the image beneath it.
            */}
            {/*
              max-h is the card width divided by the shot's 1853/2023 ratio
              (width x 1.0917), tracking the clamp above. It is the cap that
              stops object-cover cropping sideways: flex-1 still hands the media
              whatever height a short viewport has left (so it always fits), but
              it can never grow taller than the width can honestly carry.
            */}
            <CurtainReveal
              className="rounded-xl md:min-h-0 md:max-h-[clamp(459px,50.2dvh,611px)] md:flex-1"
              delay={0.05}
            >
              {/*
                Stacked on mobile the shot keeps its natural 1853x2023 ratio.

                Inside the pin it cannot: the section is exactly one viewport
                tall, and at 420px wide this image is ~460px high, which pushed
                the title and body below the fold where they were unreachable.
                So on md it fills the height the track has left over and crops,
                anchored to the top — these are website screenshots, and the top
                of the page is the part worth showing.
              */}
              <Image
                src={project.src}
                alt={project.title}
                width={1853}
                height={2023}
                className="h-auto w-full md:h-full md:object-cover md:object-top"
              />
            </CurtainReveal>
            <h3 className="mt-5 shrink-0 text-[22px] font-semibold tracking-[-0.01em] text-ink sm:text-[26px] md:mt-6">
              {project.title}
            </h3>
            <p className="mt-3 shrink-0 text-[15px] leading-7 text-ink-muted">
              {project.body}
            </p>
          </article>
        ))}
      </HorizontalPan>
    </section>
  );
}
