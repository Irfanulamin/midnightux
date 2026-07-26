import { ArrowUpRight } from "@phosphor-icons/react/ssr";

import { SectionIntro } from "@/components/section-intro";
import { Accordion, AccordionItem } from "@/components/ui/accordion";
import { Reveal } from "@/components/ui/reveal";

/*
 * The Figma only specifies body copy for the first row; the rest are drawn
 * collapsed. Copy written to the studio's real scope (UI and web design,
 * WordPress and React builds, full-stack, databases, AI). Tags name the actual
 * stack per service.
 */
const services = [
  {
    name: "Website Design",
    body: "We design every page around the one thing a visitor came to do, so the layout leads them there instead of getting in the way. You get a build-ready design, not just a nice picture.",
    tags: ["Figma", "HTML", "CSS", "Node.js"],
  },
  {
    name: "Website Development",
    body: "We build fast, responsive sites in Next.js and TypeScript that hold up as your traffic grows. Clean, documented code your team can read, not a black box only we can touch.",
    tags: ["Next.js", "TypeScript", "Node.js"],
  },
  {
    name: "UI/UX Design",
    body: "We map the real path your users take, prototype it, then turn it into a design system your product can grow on. Fewer dead ends, more tasks people actually finish.",
    tags: ["Figma", "Prototyping", "Design Systems"],
  },
  {
    name: "Website Redesign",
    body: "We audit what your current site is costing you in speed and lost visitors, then rebuild it without losing your search rankings. Your content and SEO carry over intact.",
    tags: ["Audit", "Migration", "SEO"],
  },
  {
    name: "WordPress Development",
    body: "We build WordPress sites your team can actually update, with clean templates instead of a pile of plugins. Edit your own pages without fear of breaking the layout.",
    tags: ["WordPress", "PHP", "Elementor"],
  },
  {
    name: "E-commerce Development",
    body: "We build stores on Shopify or headless setups that check out fast and win back abandoned carts. Fewer steps between the product page and a paid order.",
    tags: ["Shopify", "Stripe", "Headless"],
  },
  {
    name: "Custom Web Applications",
    body: "We build the tools off-the-shelf software cannot, from dashboards to booking systems, wired straight to your database and APIs. Software shaped around how you actually work.",
    tags: ["React", "APIs", "Databases"],
  },
  {
    name: "AI Integration",
    body: "We add AI where it saves real time: drafting replies, answering support questions, clearing the busywork. Practical features your customers feel, not a chatbot bolted on for show.",
    tags: ["LLMs", "Automation", "Chatbots"],
  },
];

export function Services() {
  return (
    <section
      id="services"
      className="scroll-mt-24 bg-teal px-6 py-16 text-white sm:py-20 md:py-28"
    >
      <div className="mx-auto max-w-[1160px]">
        <SectionIntro
          label="Our Services"
          tone="onTeal"
          heading="What We Build"
          headingClassName="mt-7 text-white"
          body="From simple business websites to powerful custom platforms, we provide complete website solutions tailored to your goals"
          bodyClassName="mx-auto mt-6 max-w-[760px] text-white/70"
        />

        {/*
          Row 1 open on load, matching the Figma's resting state.

          fixedHeight reserves the tallest panel so the section never grows or
          shrinks as rows toggle. It measures at runtime rather than using a
          hardcoded px value, which silently under-reserves as soon as the copy
          or the viewport width changes how the body text wraps.
        */}
        <Accordion
          defaultIndex={0}
          fixedHeight
          className="mt-10 sm:mt-14 md:mt-20"
        >
          {services.map((service, index) => (
            /*
              Each row reveals on its own entry rather than as one staggered
              group: the list is taller than the viewport, so a group would run
              the last rows' animations while they are still off screen and the
              user would scroll down to find them already finished.

              The delay is capped so the first rows cascade and the rest, which
              are scrolled to individually, arrive without a growing wait.
            */
            <Reveal
              key={service.name}
              delay={Math.min(index, 3) * 0.06}
              duration={0.6}
            >
              <AccordionItem
                index={index}
                className="w-full"
                triggerClassName="flex w-full cursor-pointer items-center justify-between gap-4 py-5 text-left sm:gap-6 sm:py-7"
                trigger={
                  <>
                    <span className="text-[19px] tracking-[-0.01em] text-white transition-colors duration-300 group-hover:text-yellow/80 group-aria-expanded:text-yellow sm:text-[22px] md:text-[26px]">
                      {service.name}
                    </span>

                    {/*
                      One glyph doing a half turn, rather than two glyphs
                      cross-fading. 180deg lands ArrowUpRight exactly on the
                      ArrowDownLeft the Figma draws for the open state, so the
                      design's two icons become one that travels between them.

                      The transitioned property is `rotate`, NOT `transform`.
                      Tailwind v4 compiles rotate-* to the standalone `rotate`
                      property so transforms can compose, which means
                      transition-[transform] never sees it and the icon snaps
                      round with no animation at all.
                    */}
                    <ArrowUpRight
                      size={26}
                      aria-hidden
                      className="size-[22px] shrink-0 text-white transition-[rotate,color] duration-500 ease-[cubic-bezier(0.16,1,0.3,1)] group-aria-expanded:rotate-180 group-aria-expanded:text-yellow sm:size-[26px]"
                    />
                  </>
                }
              >
                {/*
                  Side by side only at lg. At md the 640px paragraph leaves the
                  tag list ~80px, so every tag wrapped onto its own line and the
                  panel grew far taller than the row it was measured for —
                  which is what pushed the copy through the divider below.
                */}
                <div className="flex flex-col gap-6 pb-6 sm:gap-8 sm:pb-8 lg:flex-row lg:items-end lg:justify-between">
                  <p className="max-w-[640px] text-[15px] leading-7 text-white/70">
                    {service.body}
                  </p>
                  <ul className="flex shrink-0 flex-wrap gap-2 sm:gap-3">
                    {service.tags.map((tag) => (
                      <li
                        key={tag}
                        className="rounded-pill border border-yellow px-4 py-2 text-[13px] text-yellow sm:px-5 sm:py-2.5 sm:text-[14px]"
                      >
                        {tag}
                      </li>
                    ))}
                  </ul>
                </div>
              </AccordionItem>
            </Reveal>
          ))}
        </Accordion>
      </div>
    </section>
  );
}
