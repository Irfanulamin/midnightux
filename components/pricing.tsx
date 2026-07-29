import { BookingTrigger } from "@/components/booking-dialog";
import { PricingGrid, type Plan } from "@/components/pricing-card";
import { SectionIntro } from "@/components/section-intro";
import { Button } from "@/components/ui/button";
import { Reveal } from "@/components/ui/reveal";

/*
 * Both plans list "Speed Optimization" twice. That is verbatim from the Figma,
 * like the repeated FAQ rows — left alone deliberately.
 */
const plans: Plan[] = [
  {
    name: "Landing Page",
    blurb: "Perfect for launching a product, service, or campaign.",
    priceFrom: 999,
    priceTo: 399,
    period: "Onetime",
    tone: "light",
    badge: "Popular",
    enterFrom: "left",
    intent: "landing-page",
    features: [
      "1 Custom Landing Page",
      "Responsive Development",
      "UI/UX Design",
      "Contact Form",
      "Basic SEO Setup",
      "Speed Optimization",
      "Speed Optimization",
      "2 Rounds of Revisions",
      "Delivery in 5–7 Days",
    ],
  },
  {
    name: "Complete Website",
    blurb: "Perfect for launching a product, service, or campaign.",
    priceFrom: 2000,
    priceTo: 699,
    period: "Onetime",
    tone: "dark",
    enterFrom: "right",
    intent: "complete-website",
    features: [
      "Up to 5-10 Pages",
      "Responsive Development",
      "UI/UX Design",
      "Contact Form",
      "Basic SEO Setup",
      "Speed Optimization",
      "Speed Optimization",
      "2 Rounds of Revisions",
      "Delivery in 5–7 Days",
    ],
  },
];

export function Pricing() {
  return (
    <section id="pricing" className="scroll-mt-24 px-6 py-16 sm:py-20 md:py-28">
      <div className="mx-auto max-w-[1160px]">
        <SectionIntro
          label="Pricing"
          heading="Affordable Website Packages for Every Business"
          headingClassName="mx-auto mt-7 max-w-[860px] text-ink"
          body="Choose the package that fits your business today, with the flexibility to scale as your needs grow"
          bodyClassName="mx-auto mt-6 max-w-[820px] text-ink-muted"
        />

        {/*
          Not RevealGroup: the grid needs one trigger driving a nested cascade
          (card, then interior, then feature rows), which RevealItem does not
          do. <PricingGrid> is that orchestrator and owns the only observer in
          the section.
        */}
        <PricingGrid plans={plans} />

        <Reveal
          delay={0.14}
          className="mt-5 flex flex-col gap-6 rounded-2xl border border-ink/10 bg-surface p-6 sm:mt-6 sm:p-8 md:flex-row md:items-center md:justify-between md:p-10"
        >
          <div>
            <h3 className="text-[22px] font-semibold text-ink sm:text-[26px]">
              Custom Solution
            </h3>
            <p className="mt-3 max-w-[700px] text-[15px] leading-7 text-ink-muted">
              Every business is different. If your project requires custom
              features, advanced integrations, or a unique workflow, we&apos;ll
              create a tailored solution designed specifically for your goals.
            </p>
          </div>
          <BookingTrigger intent="custom-quote">
            <Button className="self-start md:self-auto">
              Request a Custom Quote
            </Button>
          </BookingTrigger>
        </Reveal>
      </div>
    </section>
  );
}
