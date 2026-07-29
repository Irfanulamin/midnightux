"use client";

import { useEffect, useRef, useState } from "react";
import Image from "next/image";
import { gsap } from "gsap";
import Lenis from "lenis";
import { motion, useReducedMotion } from "motion/react";
import { BrowserIcon } from "@phosphor-icons/react/ssr";

import { Button, ButtonLabel } from "@/components/ui/button";
import {
  Dialog,
  DialogBody,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { EASE } from "@/components/ui/motion";
import { Skeleton } from "@/components/ui/skeleton";

export type Project = {
  /** Top crop, the still on the card. */
  src: string;
  title: string;
  body: string;
  /** The whole page, shown only inside the dialog. */
  full: string;
  fullWidth: number;
  fullHeight: number;
};

/*
 * "View full page" - the whole client site, in a dialog.
 *
 * This is where the full-length captures finally belong. The section itself
 * shows a still of the top of each site (see our-work.tsx for why the pinned
 * scroll-through was removed), so the rest of the page needs somewhere to live
 * that does not cost the reader five screens of scroll they cannot escape. A
 * dialog inverts the deal: nothing is spent unless someone asks, and then they
 * get the entire page at a legible width and scroll it themselves, at their own
 * speed, and close it when they are done.
 *
 * It also fixes the loading problem by construction. Radix unmounts closed
 * dialog content, so the five full-page images - the reason the section was
 * ~1.5MB and slow - are not fetched at all until one is opened, and then it is
 * one image rather than five. The card stills are 337KB for the set.
 *
 * A dialog rather than a route, because this is a single-page site: there is
 * no /work/<slug> to navigate to, and inventing one would mean either building
 * a route tree for five screenshots or shipping a dead link.
 */
/*
 * The loading state: a wireframe of a web page.
 *
 * A travelling gradient band was here first and was wrong twice over. It is the
 * shimmer every UI framework ships, so it says nothing about this product; and
 * a bright narrow streak crossing a flat panel is a gloss effect on a page that
 * has no gloss anywhere - the surfaces are flat cream, the depth is offset
 * sheets, there is not a blur or a highlight on the whole site.
 *
 * What is loading is a WEBSITE, made by a studio that designs websites, so the
 * placeholder is the thing itself in outline: a nav bar, a hero, a couple of
 * lines of copy, a row of cards. Flat blocks in the page's own ink, breathing
 * in a slow stagger down the layout rather than a streak across it, which is
 * where the playfulness comes from - the wireframe assembles the same way a
 * real page would.
 *
 * Blocks are proportional (percentages, not px) so the wireframe holds its
 * shape at any panel size, and the whole thing is capped to one viewport
 * because that is all anyone sees before the image lands.
 */
const WIREFRAME = [
  { h: "h-[7%]", w: "w-1/3" }, // nav
  { h: "h-[34%]", w: "w-full" }, // hero
  { h: "h-[4%]", w: "w-3/4" }, // copy
  { h: "h-[4%]", w: "w-1/2" }, // copy
  { h: "h-[22%]", w: "w-full" }, // content band
  { h: "h-[14%]", w: "w-full" }, // footer band
];

function PageSkeleton({ reduce }: { reduce: boolean }) {
  return (
    <Skeleton
      aria-hidden
      className="absolute inset-0 animate-none overflow-hidden rounded-lg bg-cream-light"
    >
      <div className="absolute inset-x-0 top-0 flex h-[85dvh] flex-col gap-[2.5%] p-[5%]">
        {WIREFRAME.map((block, i) => (
          <motion.div
            key={i}
            className={`${block.h} ${block.w} shrink-0 rounded-lg bg-ink/10`}
            /*
              Each block breathes on the same loop, offset down the page, so it
              reads as one wave settling rather than six things blinking. The
              floor is 0.4 rather than 0: blocks that vanish entirely make the
              layout look broken instead of pending.
            */
            animate={reduce ? undefined : { opacity: [0.4, 1, 0.4] }}
            transition={
              reduce
                ? undefined
                : {
                    duration: 2.6,
                    ease: EASE,
                    repeat: Infinity,
                    delay: i * 0.14,
                  }
            }
          />
        ))}
      </div>
    </Skeleton>
  );
}

export function ProjectDialog({ project }: { project: Project }) {
  /*
   * Latched, not reset on close. Radix unmounts the content each time, so this
   * would otherwise flash a skeleton over an image already sitting in cache
   * every time the same project is reopened. Once loaded, always loaded.
   */
  const [loaded, setLoaded] = useState(false);
  const reduce = useReducedMotion();

  /*
   * The dialog's own Lenis.
   *
   * The page is smooth-scrolled but this panel was not, so opening it dropped
   * you from eased scrolling straight onto the raw native wheel - most notable
   * here of all places, because the thing being scrolled is several thousand px
   * of somebody's website. Lenis scopes to any element via `wrapper`/`content`,
   * so the panel gets its own instance for as long as it is open.
   *
   * It is `open`-gated rather than mounted once: Radix unmounts closed content,
   * so the nodes this measures do not exist until then, and destroying it on
   * close means no listeners or ticker callbacks outlive the panel.
   *
   * Driven off gsap.ticker for the same reason smooth-scroll.tsx is - the app
   * already runs one ticker, and a second rAF loop racing it is the exact thing
   * that setup exists to avoid. The main instance still needs
   * `data-lenis-prevent` on the scroller so the two never both claim a wheel
   * event.
   */
  const [open, setOpen] = useState(false);
  const scrollRef = useRef<HTMLDivElement>(null);
  const contentRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const wrapper = scrollRef.current;
    const content = contentRef.current;
    // Same call the page makes: never hijack scrolling from someone who asked
    // for reduced motion.
    if (!open || reduce || !wrapper || !content) return;

    const lenis = new Lenis({
      wrapper,
      content,
      // Matching the page, so crossing into the dialog is not a change of feel.
      lerp: 0.1,
      smoothWheel: true,
      syncTouch: false,
      autoRaf: false,
    });

    // GSAP's ticker reports seconds; Lenis wants milliseconds.
    const raf = (time: number) => lenis.raf(time * 1000);
    gsap.ticker.add(raf);

    return () => {
      gsap.ticker.remove(raf);
      lenis.destroy();
    };
  }, [open, reduce]);

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        {/*
          "Preview" with a browser window.

          Two icons were wrong before it. Arrows-out is the fullscreen sign, so
          next to a label about pages it read as "make this card bigger". An eye
          is worse in a different way: it is the glyph for surveillance and for
          password reveal, and on a stranger's portfolio it lands as being
          watched rather than as an invitation to look.

          A browser window says exactly what is behind the button - a web page -
          and carries no second meaning. The short label is what lets the button
          sit on the heading line instead of taking a row of its own.

          shrink-0 so the heading text is what gives when the card is narrow.
        */}
        <Button size="sm" className="shrink-0">
          <ButtonLabel>Preview</ButtonLabel>
          <BrowserIcon weight="bold" className="size-4" />
        </Button>
      </DialogTrigger>

      {/*
        Sized off the viewport rather than the content: the content is a
        6000px screenshot and would otherwise define the panel. dvh, not vh,
        so the mobile address bar cannot push the close button off screen.
      */}
      <DialogContent
        closeLabel={`Close ${project.title}`}
        className="h-[min(88dvh,900px)] w-[min(92vw,920px)]"
      >
        {/* pr-14 is the room the absolutely positioned close button needs. */}
        <DialogHeader className="px-6 py-5 pr-14 sm:px-8 sm:py-6 sm:pr-16">
          <div className="min-w-0">
            <DialogTitle>{project.title}</DialogTitle>
            <DialogDescription>{project.body}</DialogDescription>
          </div>
        </DialogHeader>

        {/*
          The scroller, now <DialogBody>, which carries the three things this
          needed and used to spell out by hand: `data-lenis-prevent` (Lenis is
          easing the window behind the panel and would otherwise claim a wheel
          event over the screenshot), `overscroll-contain` (a flick that reaches
          the end of the image must not continue into the page), and the site's
          own scrollbar rather than the operating system's grey slab, which was
          especially wrong here where the bar sits next to a screenshot of a
          website we designed.
        */}
        <DialogBody
          ref={scrollRef}
          className="px-6 pb-6 sm:px-8 sm:pb-8"
        >
            {/*
              relative so the skeleton can sit exactly on the image's box. The
              box exists before the bytes do: next/image writes the intrinsic
              width and height onto the img, so the browser derives the aspect
              ratio and reserves the full height up front. The skeleton is
              therefore the right shape immediately, the scrollbar does not
              change length when the image lands, and there is no CLS.
            */}
            {/* Lenis measures this as the scroller's content. */}
            <div ref={contentRef} className="relative">
              <Image
                src={project.full}
                alt={`The full ${project.title} home page`}
                width={project.fullWidth}
                height={project.fullHeight}
                /*
                  Full length at panel width, so the page reads at roughly the
                  size it would in a browser. No object-fit and no height cap:
                  the point is that nothing is cropped.
                */
                className="h-auto w-full rounded-lg"
                sizes="(min-width: 920px) 856px, 92vw"
                /*
                  Served exactly as built, rather than through the optimizer.

                  The file is already a WebP cut to 1720 wide, which is 2x the
                  856px the panel renders it at - the size the optimizer would
                  be aiming for anyway. Letting Next re-encode it means decoding
                  a 1720 x 12578 image (21 megapixels) on the first request for
                  each one, which is a large amount of work and a second copy on
                  disk to arrive at the same picture.
                */
                unoptimized
                onLoad={() => setLoaded(true)}
                /*
                  Clear the skeleton on failure too. Otherwise a broken or
                  blocked image leaves a shimmering block forever, which reads
                  as "still loading" and never resolves.
                */
                onError={() => setLoaded(true)}
              />

              {/*
                shadcn's Skeleton is the block; the sweep across it is ours.

                As generated the component is `animate-pulse`, which is an
                opacity fade - and fading a block that is only 10% ink between
                full and half strength is a change you have to be told about to
                see. So the pulse is switched off (`animate-none` wins in the
                cn merge) and replaced with a band of light travelling left to
                right, which is the thing people actually read as "loading".

                Motion rather than another @keyframes block in globals.css: this
                is already a client component, Motion is already the page's
                animation library, and it keeps the behaviour beside the thing
                it belongs to.

                The band is capped at 85dvh rather than stretched over the whole
                element. The skeleton stands in for an image up to 12578px tall,
                and a gradient that size would be rasterised in full for the
                sake of the ~700px anyone can actually see.
              */}
              {!loaded ? <PageSkeleton reduce={!!reduce} /> : null}
            </div>
        </DialogBody>
      </DialogContent>
    </Dialog>
  );
}
