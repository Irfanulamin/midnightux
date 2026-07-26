import { CaretDown, CaretUp } from "@phosphor-icons/react/ssr";

import { SectionIntro } from "@/components/section-intro";
import { Accordion, AccordionItem } from "@/components/ui/accordion";
import { Reveal } from "@/components/ui/reveal";
import { faqSchema } from "@/lib/site";

/*
 * Real answers, written to the studio's actual policies: the free draft, $0
 * upfront, no commitment, 5-7 day delivery, the two published prices, and the
 * WordPress / React / AI scope. The Figma drew five identical placeholder rows;
 * these replace them.
 */
const faqs = [
  {
    q: "How does the free draft design work?",
    a: "We design your homepage first and show it to you before you pay anything. If it is not right, you walk away owing nothing. Most clients see their first concept within a few days of the initial call.",
  },
  {
    q: "What does $0 upfront actually mean?",
    a: "You do not pay to get started. We only ask for payment once you have seen the design and decided to go ahead, so there is no risk in finding out what we would build for you.",
  },
  {
    q: "How long until my site is live?",
    a: "A landing page is usually live in five to seven days once we have your content and your go-ahead. Larger multi-page sites take a little longer, and we give you a firm date before we start.",
  },
  {
    q: "What is included in the price?",
    a: "Design, responsive development, a contact form, basic SEO setup, speed optimisation and two rounds of revisions. The Landing Page is $399 one time and the Complete Website is $699 one time, with no monthly fees.",
  },
  {
    q: "Do you build in WordPress or with code?",
    a: "Both. We use WordPress when you want to edit pages yourself, and React or Next.js when you need something faster or more custom. We recommend whichever fits how you plan to run the site.",
  },
  {
    q: "Can you add AI features or custom tools?",
    a: "Yes. We integrate AI for things like support replies and content drafting, and we build custom tools such as dashboards and booking systems on top of your own database when an off-the-shelf option will not do.",
  },
];

export function Faq() {
  return (
    <section className="px-6 py-16 sm:py-20 md:py-28">
      {/*
        FAQPage schema, built from the same `faqs` array rendered below, so the
        questions can earn an FAQ rich result. Colocated here — not in layout —
        so the structured data and the visible answers can never fall out of sync.
      */}
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(faqSchema(faqs)) }}
      />
      <div className="mx-auto max-w-[1160px]">
        <SectionIntro
          label="Common Questions"
          heading="Everything You Need to Know"
          headingClassName="mt-7 text-ink"
          body={
            <>
              Have questions? We&apos;ve answered the ones we hear most often to
              help you make an informed decision with confidence.
            </>
          }
          bodyClassName="mx-auto mt-6 max-w-[790px] text-ink-muted"
        />

        {/*
          Starts fully collapsed. The Figma draws row 2 open, but that is the
          state of a mock rather than a resting page: on load it reads as a row
          the reader opened, and it pushes the rest of the set down before they
          have asked anything. Accordion's default is null, so nothing is passed.
        */}
        {/* fixedHeight reserves the tallest panel so the block never jumps. */}
        <Accordion
          fixedHeight
          className="mx-auto mt-10 max-w-[935px] space-y-3 sm:mt-16 sm:space-y-4"
        >
          {faqs.map((faq, index) => (
            // Per-row reveal, same reasoning as the services list: the set is
            // taller than the viewport, so a single group would burn the later
            // rows' animations off screen.
            <Reveal
              key={index}
              delay={Math.min(index, 3) * 0.06}
              duration={0.6}
            >
              <AccordionItem
                index={index}
                /*
                 * The open row is cream, closed rows are white. Driven off the
                 * trigger's aria-expanded via has-*, so the primitive does not
                 * need to leak its open state back out just for styling.
                 */
                className="overflow-hidden rounded-xl bg-white transition-colors duration-300 has-[[aria-expanded=true]]:bg-cream"
                triggerClassName="flex w-full cursor-pointer items-start justify-between gap-4 px-5 py-5 text-left sm:gap-6 sm:px-7 sm:py-6"
                trigger={
                  <>
                    <span className="text-[15px] text-ink sm:text-[17px]">
                      {faq.q}
                    </span>
                    {/* Both carets render; aria-expanded picks the visible one. */}
                    <span className="relative mt-1 block size-5 shrink-0">
                      <CaretDown
                        size={20}
                        aria-hidden
                        className="absolute inset-0 text-ink opacity-100 transition-opacity duration-300 group-aria-expanded:opacity-0"
                      />
                      <CaretUp
                        size={20}
                        aria-hidden
                        className="absolute inset-0 text-ink opacity-0 transition-opacity duration-300 group-aria-expanded:opacity-100"
                      />
                    </span>
                  </>
                }
              >
                <p className="max-w-[860px] px-5 pb-5 text-[15px] leading-7 text-ink-muted sm:px-7 sm:pb-6">
                  {faq.a}
                </p>
              </AccordionItem>
            </Reveal>
          ))}
        </Accordion>
      </div>
    </section>
  );
}
