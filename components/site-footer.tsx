import Image from "next/image";

import { Reveal } from "@/components/ui/reveal";
import { SITE_NAME } from "@/lib/site";
import { ArrowUpRightIcon, WhatsappLogoIcon, TelegramLogoIcon } from "@phosphor-icons/react/ssr";

/*
 * Footer, from the bottom of the Landing Page frame (node 221:8193 + content
 * 243:8287).
 *
 * One dark teal card (#286f6b — the same green the design uses for the section
 * label pills, deliberately lighter than --color-teal) inset 10px from the
 * viewport edges, with three decorative layers under the content:
 *
 *   1. a giant script "Studio" watermark (Brigitha Signature, a font the repo
 *      does not ship — exported as an image), cream at ~7% so it reads as a
 *      slightly lighter teal. It says Studio, not Surface: the signature is the
 *      second half of the MidnightUX lockup, and the artwork was re-exported
 *      with the rename;
 *   2. the giant "Midnight" wordmark along the bottom edge, an SVG export of
 *      the vectorised text. In the design it is 1585px wide on a 1420px card
 *      (≈112%) and its bottom quarter runs off the card, so it is wider than
 *      its container and translated down, with the card's overflow crop doing
 *      the clipping;
 *   3. the content: logo, the oversized email, a hairline, then MENU / SOCIAL
 *      columns and the copyright.
 *
 * Same hash anchors as the header nav, rendered as plain <a> for the same
 * reason (Lenis owns in-page scrolling — see SmoothScroll). The social pills
 * point nowhere yet, like the routes the nav CTA references: no URLs exist for
 * this fictional studio.
 */
const footerLinks = [
  { label: "Home", href: "#top" },
  { label: "Our Services", href: "#services" },
  { label: "Our Work", href: "#work" },
  { label: "Pricing", href: "#pricing" },
  // Figma reads "Success Stores" — same typo the header corrects.
  { label: "Success Stories", href: "#success-stories" },
];

const socials = [
  { label: "WhatsApp", href: "#", Icon: WhatsappLogoIcon },
  { label: "Telegram", href: "#", Icon: TelegramLogoIcon },
];

export function SiteFooter() {
  return (
    <footer className="px-2.5 pb-2.5">
      {/*
        A full screen tall, and `dvh` rather than `vh` or `h-screen`: on mobile
        Safari `vh` is measured against the viewport WITHOUT the address bar, so
        a 100vh footer is taller than what you can actually see and the giant
        wordmark at its foot sits below the fold until the bar retracts. `min-h`
        rather than `h` so the footer can still grow past a screen if the links
        wrap on a short, narrow device instead of overflowing its own card.
      */}
      <div className="relative flex min-h-[100dvh] flex-col overflow-hidden rounded-[24px] bg-[#286f6b]">
        {/*
          The whole bottom-of-card artwork in one asset: the teal script
          "Studio" and the giant cream "Midnight" already composited, and
          already cropped at the right edge the way the design masks it. It
          replaces what used to be two separately positioned images.

          It is a 4x export of the 1420x883 card, so at full width it lines up
          on its own — no bleed percentages to keep in step. Anchored to the
          bottom rather than stretched: the top third of the file is empty, and
          scaling by width keeps the letterforms in proportion instead of
          squashing them when the card is taller than the design's aspect.

          Behind the content on purpose. The script passes under the links in
          the design too; only the wordmark, which starts around two thirds
          down, sits clear of them.
        */}
        {/*
          It rises into place as the footer arrives. The artwork is already
          cropped by the card's bottom edge, so starting it lower and letting it
          settle reads as the wordmark coming up out of that edge rather than an
          image fading in.

          Slow, short and last. 2.4s over 34px, on a 0.35s delay so the links
          above settle first and the wordmark rises in behind them as the final
          beat. A wide shape covers ground fast even on a small offset, so the
          distance stays small and the duration does the smoothing; longer
          travel read as the wordmark overshooting rather than settling.
        */}
        <Reveal
          direction="up"
          distance={50}
          duration={3}
          delay={0.35}
          amount={0.1}
          className="pointer-events-none absolute inset-x-0 bottom-0"
        >
          <Image
            src="/design/footer-bg-text.png"
            alt=""
            aria-hidden
            width={5680}
            height={3532}
            className="w-full"
          />
        </Reveal>

        {/*
          flex-1 so the content takes the height the screen-tall card gives it
          and the wordmark is held at the bottom, rather than everything
          bunching at the top with a screen of empty teal underneath.
        */}
        <div className="relative mx-auto flex w-full max-w-[1160px] flex-1 flex-col gap-8 px-5 pt-12 pb-6 sm:gap-10 sm:px-6 sm:pt-16 md:flex-row md:gap-20 md:px-8 md:pt-20 lg:gap-36">
          {/*
            The footer variant, not /logo.png: the site mark sets "MidnightUX"
            in near black for the white header, which all but disappears on this
            teal. Same lockup with the wordmark repainted --color-surface and
            the yellow "Studio" script untouched.

            Note the Figma's own footer still carries the pre-rename Midnight /
            Surface mark (node 243:8279); this asset is derived from the updated
            header lockup instead, so the two ends of the page agree.
          */}
          <Image
            src="/design/footer-logo.png"
            alt="MidnightUX"
            width={688}
            height={204}
            className="h-[34px] w-auto self-start sm:h-[42px] md:h-[51px] opacity-50"
          />

          <div className="min-w-0 flex-1">
            <a
              href="mailto:hello@midnightux.com"
              className="group flex items-start gap-2 text-surface lowercase sm:gap-3"
            >
              {/*
                Wraps instead of truncating. At 375px the address needs ~13px
                type to fit on one line, which is unreadable, so it is allowed
                to break — `anywhere` because an email has no spaces to break
                at and `break-words` alone would leave it overflowing.
              */}
              <span className="min-w-0 text-[clamp(22px,5vw,64px)] leading-[1.1] tracking-[-0.02em] transition-colors duration-300 [overflow-wrap:anywhere] group-hover:text-yellow">
                hello@midnightux.com
              </span>
              <ArrowUpRightIcon
                size={32}
                aria-hidden
                className="mt-1 size-5 shrink-0 text-coral transition-transform duration-300 ease-[cubic-bezier(0.16,1,0.3,1)] group-hover:translate-x-0.5 group-hover:-translate-y-0.5 sm:size-7 md:mt-2"
              />
            </a>

            <div className="mt-6 h-px w-full bg-yellow/40 sm:mt-8" />

            <div className="mt-10 flex flex-wrap items-start gap-x-14 gap-y-10 sm:mt-12">
              <nav aria-label="Footer">
                <p className="text-[15px] font-semibold tracking-[0.05em] text-yellow sm:text-[16px]">
                  MENU
                </p>
                <ul className="mt-4 flex flex-col gap-3">
                  {footerLinks.map((link) => (
                    <li key={link.href}>
                      <a
                        href={link.href}
                        className="text-[17px] tracking-[-0.02em] text-surface transition-colors duration-300 hover:text-yellow sm:text-[18px]"
                      >
                        {link.label}
                      </a>
                    </li>
                  ))}
                </ul>
              </nav>

              <div>
                <p className="text-[15px] font-semibold tracking-[0.08em] text-yellow sm:text-[16px]">
                  SOCIAL
                </p>
                <div className="mt-4 flex flex-wrap gap-3">
                  {socials.map(({ label, href, Icon }) => (
                    <a
                      key={label}
                      href={href}
                      className="flex items-center gap-2 rounded-pill border-[0.5px] border-white bg-[#2e7d78] py-[5px] pr-[15px] pl-[5px] transition-transform duration-300 ease-[cubic-bezier(0.16,1,0.3,1)] hover:-translate-y-0.5"
                    >
                      <span className="flex size-[30px] items-center justify-center rounded-full bg-white text-[#2e7d78]">
                        <Icon size={19} aria-hidden />
                      </span>
                      <span className="text-[15px] font-medium tracking-[-0.02em] text-white sm:text-[16px]">
                        {label}
                      </span>
                    </a>
                  ))}
                </div>
              </div>

              <p className="w-full self-end text-[13px] tracking-[-0.02em] text-surface/80 sm:ml-auto sm:w-auto sm:text-[14px]">
                &copy; {new Date().getFullYear()} {SITE_NAME}. All rights
                reserved.
              </p>
            </div>
          </div>
        </div>

      </div>
    </footer>
  );
}
