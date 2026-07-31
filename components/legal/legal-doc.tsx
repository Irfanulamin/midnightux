"use client";

import { useCallback, useEffect, useRef, useState, type ReactNode } from "react";
import { CaretDownIcon } from "@phosphor-icons/react/ssr";
import { motion, useMotionValueEvent, useReducedMotion, useScroll } from "motion/react";

import { EASE } from "@/components/ui/motion";

/*
 * Long-form legal document: sticky table-of-contents rail, scroll-spy, and a
 * single sliding marker.
 *
 * Content and presentation are kept strictly apart. Each page hands over an
 * array of `{ id, title, body }` where `body` is plain semantic JSX, and every
 * type and spacing decision lives in the PROSE constant below, applied once to
 * the body wrapper. A copy edit never touches styling; restyling never touches
 * copy.
 *
 * Section numbering is derived from the array index, never stored, so
 * reordering or inserting a section renumbers the whole document for free.
 */

export type LegalSection = {
  /** Anchor target and scroll-spy key. Kebab-case, stable, deep-linkable. */
  id: string;
  title: string;
  body: ReactNode;
};

/*
 * The line across the viewport that decides which section is "current".
 *
 * Legal sections run several screens tall, which is exactly why this is not an
 * IntersectionObserver: "topmost visible section" leaves the highlight a full
 * screen behind the text you are actually reading. Instead the active section
 * is the LAST heading that has crossed this line, which tracks reading position
 * rather than element visibility.
 *
 * The two values clear different chrome. On desktop only the header bar is
 * above the text; below `lg` the pinned TOC bar sits under it and takes another
 * ~56px, so the line has to drop to match or the highlight changes one section
 * too early.
 */
const READING_LINE = { desktop: 168, mobile: 216 } as const;

/*
 * Where an anchor jump parks the target heading. Larger than the reading line
 * so a jumped-to section lands clearly below the chrome rather than tucked
 * under it, and larger again below `lg` for the TOC bar.
 */
const ANCHOR_OFFSET = { desktop: 116, mobile: 176 } as const;

const isDesktop = () =>
  typeof window !== "undefined" && window.matchMedia("(min-width: 1024px)").matches;

/*
 * Every type and spacing rule for legal body copy, in one descendant-selector
 * string applied once.
 *
 * `dl` rather than `table` for the key/value blocks the source documents write
 * as markdown tables. A table needs horizontal scrolling on a phone the moment
 * a cell holds a sentence, and a 12-row table with a hairline under every row
 * is the worst available layout for this content. A definition list carries the
 * same pairs, wraps naturally, and reads as prose on a narrow screen.
 */
const PROSE = [
  // Paragraphs. 65ch is enforced by the column cap, not here.
  "[&_p]:mb-5 [&_p]:text-[15px] [&_p]:leading-[1.75] [&_p]:text-ink/75",
  "sm:[&_p]:text-[16px] sm:[&_p]:leading-[1.8]",

  // Sub-headings inside a section.
  "[&_h3]:mt-9 [&_h3]:mb-3 [&_h3]:text-[17px] [&_h3]:font-semibold [&_h3]:tracking-[-0.01em] [&_h3]:text-ink",
  "sm:[&_h3]:mt-11 sm:[&_h3]:text-[19px]",

  // Lists.
  "[&_ul]:mb-5 [&_ul]:list-disc [&_ul]:space-y-2 [&_ul]:pl-5",
  "[&_ol]:mb-5 [&_ol]:list-decimal [&_ol]:space-y-2 [&_ol]:pl-5",
  "[&_li]:text-[15px] [&_li]:leading-[1.7] [&_li]:text-ink/75 [&_li]:marker:text-teal/50",
  "sm:[&_li]:text-[16px]",

  // Key/value blocks.
  "[&_dl]:mb-6 [&_dl]:divide-y [&_dl]:divide-rule [&_dl]:border-y [&_dl]:border-rule",
  "[&_dt]:pt-4 [&_dt]:text-[14px] [&_dt]:font-semibold [&_dt]:tracking-[-0.01em] [&_dt]:text-ink sm:[&_dt]:text-[15px]",
  "[&_dd]:pb-4 [&_dd]:text-[15px] [&_dd]:leading-[1.7] [&_dd]:text-ink/70 sm:[&_dd]:text-[16px]",

  // Emphasis and links.
  "[&_strong]:font-semibold [&_strong]:text-ink",
  "[&_em]:italic",
  "[&_a]:text-teal [&_a]:underline [&_a]:underline-offset-[3px] [&_a]:decoration-teal/35",
  "[&_a]:transition-colors [&_a]:duration-200 hover:[&_a]:decoration-teal",

  // Inline code, for the storage keys and parameter names the policy names.
  "[&_code]:rounded-md [&_code]:bg-cream [&_code]:px-1.5 [&_code]:py-0.5",
  "[&_code]:text-[13px] [&_code]:text-ink sm:[&_code]:text-[14px]",

  // Callout. A cream panel with a teal edge, for the passages that carry more
  // weight than the surrounding prose.
  "[&_blockquote]:my-6 [&_blockquote]:rounded-2xl [&_blockquote]:border-l-2 [&_blockquote]:border-teal",
  "[&_blockquote]:bg-cream [&_blockquote]:px-5 [&_blockquote]:py-4",
  "[&_blockquote_p]:mb-3 [&_blockquote_p]:text-[14px] [&_blockquote_p]:text-ink/80 sm:[&_blockquote_p]:text-[15px]",
  "[&_blockquote_p:last-child]:mb-0",

  "[&>*:last-child]:mb-0",
].join(" ");

const pad = (n: number) => String(n + 1).padStart(2, "0");

/* ---------------------------------------------------------------------- */

/**
 * The TOC rows, shared verbatim by the desktop rail and the mobile dropdown.
 *
 * The sliding marker is measured from the row elements, so both instances get
 * it without either owning the geometry: each renders its own marker against
 * its own list.
 */
function TocRows({
  sections,
  activeId,
  onNavigate,
  className = "",
}: {
  sections: LegalSection[];
  activeId: string;
  onNavigate?: () => void;
  className?: string;
}) {
  const listRef = useRef<HTMLUListElement>(null);
  const [marker, setMarker] = useState<{ top: number; height: number } | null>(null);
  const reduce = useReducedMotion();

  /*
   * Measure the active row and move the marker to it.
   *
   * The setState sits inside a requestAnimationFrame callback, which is both
   * correct (measure after paint, so offsetTop is real) and what keeps this
   * clear of `react-hooks/set-state-in-effect`.
   */
  useEffect(() => {
    const list = listRef.current;
    if (!list) return;

    const frame = requestAnimationFrame(() => {
      const row = list.querySelector<HTMLElement>(`[data-row="${activeId}"]`);
      if (!row) return;

      setMarker({ top: row.offsetTop, height: row.offsetHeight });

      /*
       * Keep the active row centred in the rail's OWN scroll box.
       *
       * Deliberately not `row.scrollIntoView()`: that walks up the ancestor
       * chain and scrolls the page too, so the scroll that triggered this
       * would be fighting a scroll caused by it.
       */
      const target = row.offsetTop - list.clientHeight / 2 + row.offsetHeight / 2;
      list.scrollTo({
        top: Math.max(0, target),
        behavior: reduce ? "auto" : "smooth",
      });
    });

    return () => cancelAnimationFrame(frame);
  }, [activeId, reduce]);

  const onClick = useCallback(
    (event: React.MouseEvent<HTMLAnchorElement>, id: string) => {
      // Leave modified clicks alone. They mean "open elsewhere", not "navigate".
      if (event.metaKey || event.ctrlKey || event.shiftKey || event.altKey) return;

      const el = document.getElementById(id);
      if (!el) return;

      /*
       * preventDefault here is what hands the scroll to us rather than to the
       * delegated Lenis listener in <SmoothScroll>, which bails on an already
       * defaulted event. That listener is right for the marketing page but
       * uses a single 96px offset; these pages need a second, larger one below
       * `lg` to clear the pinned TOC bar as well as the header.
       */
      event.preventDefault();

      const offset = isDesktop() ? ANCHOR_OFFSET.desktop : ANCHOR_OFFSET.mobile;
      window.scrollTo({
        top: el.getBoundingClientRect().top + window.scrollY - offset,
        behavior: reduce ? "auto" : "smooth",
      });

      // Shareable URL, without pushing a history entry per row.
      window.history.replaceState(null, "", `#${id}`);
      onNavigate?.();
    },
    [onNavigate, reduce],
  );

  return (
    <ul
      ref={listRef}
      className={`relative [scrollbar-width:none] [&::-webkit-scrollbar]:hidden ${className}`}
    >
      {/*
        One measured marker sliding between rows, rather than a border toggling
        on and off per row. `y` is a transform so the movement stays on the
        compositor; the element is absolutely positioned and pointer-events-none,
        so animating its height repaints only itself and never reflows the page.
      */}
      {marker && (
        <motion.span
          aria-hidden
          initial={false}
          animate={{ y: marker.top, height: marker.height }}
          transition={
            reduce
              ? { duration: 0 }
              : { type: "spring", stiffness: 420, damping: 38 }
          }
          className="pointer-events-none absolute inset-x-0 top-0 rounded-xl bg-cream"
        />
      )}

      {sections.map((section, i) => {
        const active = section.id === activeId;
        return (
          <li key={section.id} data-row={section.id} className="relative">
            <a
              href={`#${section.id}`}
              onClick={(event) => onClick(event, section.id)}
              aria-current={active ? "true" : undefined}
              className={`flex gap-3 rounded-xl px-3 py-2.5 text-[14px] leading-snug transition-colors duration-300 ${
                active ? "text-ink" : "text-ink/55 hover:text-ink/80"
              }`}
            >
              <span
                className={`shrink-0 pt-px text-[11px] font-semibold tabular-nums transition-colors duration-300 ${
                  active ? "text-teal" : "text-ink/35"
                }`}
              >
                {pad(i)}
              </span>
              <span className={active ? "font-medium" : ""}>{section.title}</span>
            </a>
          </li>
        );
      })}
    </ul>
  );
}

/* ---------------------------------------------------------------------- */

export function LegalDoc({
  title,
  updated,
  intro,
  sections,
}: {
  title: string;
  /** Rendered under the h1, e.g. "Last updated 1 August 2026". */
  updated: string;
  /** One short standfirst paragraph. Optional. */
  intro?: ReactNode;
  sections: LegalSection[];
}) {
  const [activeId, setActiveId] = useState(sections[0]?.id ?? "");
  const [open, setOpen] = useState(false);
  const { scrollY } = useScroll();

  /*
   * Scroll-spy.
   *
   * `useScroll` + a motion-value listener rather than a scroll event handler:
   * a raw listener fires unbatched on every frame and is banned by both the
   * project conventions and the taste skill. This samples once per frame, and
   * because Lenis eases the real `window.scrollY`, it stays in step through the
   * whole of a smoothed gesture rather than only on native scroll events.
   */
  useMotionValueEvent(scrollY, "change", (y) => {
    const line = isDesktop() ? READING_LINE.desktop : READING_LINE.mobile;

    /*
     * Bottom-of-page override, and it is not a nicety.
     *
     * The last section is short and sits above a screen-tall footer, so its
     * heading may never cross the reading line no matter how far you scroll.
     * Without this the highlight sticks one section short of the end for the
     * entire bottom of the document.
     */
    const bottom =
      y + window.innerHeight >= document.documentElement.scrollHeight - 2;

    if (bottom) {
      const last = sections[sections.length - 1]?.id;
      if (last) setActiveId((prev) => (prev === last ? prev : last));
      return;
    }

    let current = sections[0]?.id ?? "";
    for (const section of sections) {
      const el = document.getElementById(section.id);
      if (!el) continue;
      // Document order, so the first heading still below the line ends it.
      if (el.getBoundingClientRect().top > line) break;
      current = section.id;
    }

    setActiveId((prev) => (prev === current ? prev : current));
  });

  const activeIndex = Math.max(
    0,
    sections.findIndex((section) => section.id === activeId),
  );
  const activeSection = sections[activeIndex];

  return (
    <div className="mx-auto w-full max-w-[1160px] px-5 pb-24 sm:px-6 md:px-8 md:pb-32">
      <header className="pt-10 pb-8 sm:pt-14 md:pt-20 md:pb-12">
        <h1 className="max-w-[16ch] text-[34px] leading-[1.05] font-semibold tracking-[-0.03em] text-ink sm:text-[46px] md:text-[58px]">
          {title}
        </h1>
        <p className="mt-4 text-[13px] tracking-[-0.01em] text-ink-muted sm:text-[14px]">
          {updated}
        </p>
        {intro && (
          <div
            className={`mt-6 max-w-[68ch] border-t border-rule pt-6 ${PROSE}`}
          >
            {intro}
          </div>
        )}
      </header>

      {/*
        Pinned TOC bar, below `lg` only. It doubles as a progress readout, so
        the reader always knows where they are in a document this long.

        It sits under the header, whose bar is `--header-bar` tall starting at
        `top-4`. Sticky rather than fixed so it never covers the h1 above it.
      */}
      <div className="sticky top-[calc(1rem+var(--header-bar)+8px)] z-30 -mx-5 mb-8 sm:top-[calc(1.5rem+var(--header-bar)+8px)] sm:-mx-6 lg:hidden">
        <div className="relative px-5 sm:px-6">
          <button
            type="button"
            onClick={() => setOpen((v) => !v)}
            aria-expanded={open}
            className="flex w-full cursor-pointer items-center gap-3 rounded-2xl border border-rule bg-white/85 px-4 py-3 text-left shadow-[0_1px_2px_rgb(0_0_0/0.04),0_12px_28px_-18px_rgb(0_0_0/0.25)] backdrop-blur-xl"
          >
            <span className="text-[12px] font-semibold tabular-nums text-teal">
              {pad(activeIndex)}
            </span>
            <span className="min-w-0 flex-1 truncate text-[14px] font-medium tracking-[-0.01em] text-ink">
              {activeSection?.title}
            </span>
            <CaretDownIcon
              size={16}
              aria-hidden
              className={`shrink-0 text-ink/50 transition-transform duration-300 ease-[cubic-bezier(0.16,1,0.3,1)] ${
                open ? "rotate-180" : ""
              }`}
            />
          </button>

          {/*
            `absolute inset-x-0 top-full`, never in flow. An in-flow expansion
            changes the bar's height and shoves every section below it down the
            page, which moves the very text the reader is looking at.

            Its own opaque background, because a parent's backdrop-blur does not
            extend past its own border box and this panel overlays body text.
          */}
          {open && (
            <div className="absolute inset-x-5 top-full z-10 mt-2 overflow-hidden rounded-2xl border border-rule bg-surface shadow-[0_18px_50px_-24px_rgb(0_0_0/0.4)] sm:inset-x-6">
              <TocRows
                sections={sections}
                activeId={activeId}
                onNavigate={() => setOpen(false)}
                className="max-h-[52svh] overflow-y-auto p-2"
              />
            </div>
          )}
        </div>
      </div>

      {/*
        No `items-start` on this row, deliberately.

        With `items-start` the aside shrinks to its content height, which gives
        `position: sticky` almost no travel inside its own containing block, so
        it unpins a few hundred px in and the rail scrolls away with the text.
        Letting it stretch the full column height is what makes it hold all the
        way down and release naturally at the end.
      */}
      <div className="flex flex-col gap-12 lg:flex-row lg:gap-16">
        <aside className="hidden w-[248px] shrink-0 lg:block xl:w-[276px]">
          <div className="sticky top-[calc(1.5rem+var(--header-bar)+24px)]">
            <p className="px-3 pb-3 text-[11px] font-semibold tracking-[0.14em] text-teal uppercase">
              Table of content
            </p>
            {/*
              The rail is taller than a laptop viewport, so it gets its own
              scroll box. The scrollbar is hidden because the marker plus the
              auto-centring already communicate position.
            */}
            <TocRows
              sections={sections}
              activeId={activeId}
              className="max-h-[calc(100svh-13rem)] overflow-y-auto"
            />
          </div>
        </aside>

        {/*
          `min-w-0` so a long unbroken string (an email, a URL) cannot force the
          flex item wider than its share. The measure cap keeps lines readable;
          long-form legal text at full 1160px width is punishing.
        */}
        <div className="min-w-0 flex-1 lg:max-w-[72ch]">
          {sections.map((section, i) => (
            <section
              key={section.id}
              id={section.id}
              /*
                Matches ANCHOR_OFFSET, and is the fallback that makes deep links
                land correctly with JavaScript disabled or reduced motion on.
              */
              className="scroll-mt-[176px] border-t border-rule pt-8 pb-2 first:border-t-0 first:pt-0 lg:scroll-mt-[116px]"
            >
              <h2 className="mb-5 flex gap-3 text-[22px] leading-tight font-semibold tracking-[-0.02em] text-ink sm:mb-6 sm:text-[26px] md:text-[28px]">
                <span className="shrink-0 pt-1.5 text-[12px] font-semibold tabular-nums text-teal sm:pt-2 sm:text-[13px]">
                  {pad(i)}
                </span>
                <span>{section.title}</span>
              </h2>
              <div className={`pb-10 md:pb-14 ${PROSE}`}>{section.body}</div>
            </section>
          ))}
        </div>
      </div>
    </div>
  );
}

/* Re-exported so a page can lay out a bespoke block with the same type ramp. */
export { PROSE as LEGAL_PROSE, EASE };
