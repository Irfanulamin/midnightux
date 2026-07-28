"use client";

import { useEffect } from "react";
import { gsap } from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import Lenis from "lenis";
import { useReducedMotion } from "motion/react";

gsap.registerPlugin(ScrollTrigger);

/*
 * Clearance for the sticky nav when jumping to an anchor. Kept in step with the
 * `scroll-mt-24` on the anchored sections, which is the no-Lenis fallback.
 */
const HEADER_OFFSET = 96;

/** Seconds for an anchor jump, regardless of distance. */
const ANCHOR_DURATION = 1.1;

/*
 * The live instance, held at module scope rather than only in the effect's
 * closure. The effect re-runs when the reduced-motion query resolves, and in
 * dev React mounts effects twice — so a handler that closed over `lenis`
 * directly could end up holding one that had already been destroyed, whose
 * scrollTo silently does nothing. Reading it from here means the handler always
 * talks to the instance that is actually running.
 */
let activeLenis: Lenis | null = null;

/*
 * Global smooth scroll.
 *
 * Lenis intercepts wheel/touch input and eases the real window scroll position
 * toward the target, so everything already reading scroll — ScrollTrigger's pin
 * in <HorizontalPan>, Motion's useScroll in the header and in the Why Us card's
 * drift — inherits the smoothing for free. Nothing downstream needs to know
 * Lenis exists.
 *
 * Three wiring details carry the whole thing:
 *
 *   1. autoRaf: false + gsap.ticker
 *      Lenis' own rAF loop and GSAP's ticker are two independent loops. Running
 *      both means the smoothed scroll position is written in one frame and read
 *      by ScrollTrigger in the next, and the pinned section visibly trails the
 *      cursor. Driving lenis.raf from the ticker collapses them into one frame.
 *
 *   2. lenis.on("scroll", ScrollTrigger.update)
 *      Lenis' easing keeps moving after the input stops. Without this,
 *      ScrollTrigger only samples on native scroll events and the horizontal
 *      pan stutters through the tail of every gesture.
 *
 *   3. lagSmoothing(0)
 *      GSAP normally clamps a long frame's delta to avoid a jump. Here that
 *      desyncs the ticker from Lenis' real elapsed time, which reads as the page
 *      lurching after any hitch. Lenis does its own interpolation, so the
 *      clamp is not wanted.
 */
export function SmoothScroll() {
  const reduce = useReducedMotion();

  /*
   * Reload behaviour, and why the browser cannot be left to do it.
   *
   * Two sections pin (Our Work, How It Works), and a pin adds a spacer roughly
   * as tall as the track it scrubs — several thousand px of document height
   * that exists only once ScrollTrigger has run, in an effect, after hydration.
   *
   * The browser restores the old scroll position before any of that, while the
   * document is still the short unpinned version. A position that was valid for
   * the pinned layout gets clamped to whatever currently fits, and "somewhere
   * in Pricing" clamps to "somewhere in Our Work". The pins are built a moment
   * later, the document grows, and the scroll stays where it was clamped. It
   * looks like a redirect; it is a restore measured against a document that did
   * not exist yet.
   *
   * The browser cannot win that race — its restore happens before the height it
   * needs is knowable. So the position is recorded here on the way out and
   * replayed on the way back in, once the pins exist and the height is real.
   * Restoration is set to manual purely to stop the browser attempting its own
   * broken version first; the position itself is preserved, not discarded.
   *
   * ScrollTrigger also keeps a record of scroll positions and reapplies it on
   * refresh, fighting the same fight, so clearScrollMemory drops it.
   */
  useEffect(() => {
    const previous = history.scrollRestoration;
    history.scrollRestoration = "manual";
    ScrollTrigger.clearScrollMemory();

    const key = `midnight-surface:scroll:${window.location.pathname}`;

    /*
     * sessionStorage, not localStorage: this should survive a reload, not come
     * back days later on a fresh visit. Wrapped because storage access throws
     * outright in some privacy modes, and a saved scroll position is never
     * worth taking the page down for.
     */
    const readSaved = () => {
      try {
        return Number(sessionStorage.getItem(key)) || 0;
      } catch {
        return 0;
      }
    };

    const save = () => {
      try {
        sessionStorage.setItem(key, String(Math.round(window.scrollY)));
      } catch {
        /* Storage unavailable. The reload just starts at the top. */
      }
    };

    /*
     * pagehide rather than beforeunload: it fires on reload and on navigating
     * away, it does not block the unload, and unlike beforeunload it is not
     * ignored on mobile Safari. visibilitychange covers the case where the tab
     * is backgrounded and then discarded without ever firing pagehide.
     */
    const onHide = () => {
      if (document.visibilityState === "hidden") save();
    };

    window.addEventListener("pagehide", save);
    document.addEventListener("visibilitychange", onHide);

    // An explicit hash is a stated destination and outranks a saved position.
    const hash = window.location.hash;
    const target = hash && hash !== "#" ? document.querySelector(hash) : null;
    const saved = target ? 0 : readSaved();

    const cleanUp: (() => void)[] = [
      () => {
        history.scrollRestoration = previous;
        window.removeEventListener("pagehide", save);
        document.removeEventListener("visibilitychange", onHide);
      },
    ];

    if (target || saved > 0) {
      /*
       * Where the last restore put the page. The second pass compares against
       * it and stands down if the number has moved, so a correction meant for a
       * settling layout can never yank back a user who started scrolling.
       */
      let placedAt = -1;

      const restore = () => {
        if (placedAt >= 0 && Math.abs(window.scrollY - placedAt) > 4) return;

        // Measure after a refresh: before the images settle the pins are short,
        // and any position derived from them is stale the moment they are not.
        ScrollTrigger.refresh();

        const top = target
          ? target.getBoundingClientRect().top + window.scrollY - HEADER_OFFSET
          : saved;

        const clamped = Math.max(
          0,
          Math.min(top, document.documentElement.scrollHeight - window.innerHeight),
        );

        // Lenis holds its own target; moving the window behind its back would
        // be undone on its next frame.
        if (activeLenis) activeLenis.scrollTo(clamped, { immediate: true });
        else window.scrollTo({ top: clamped, behavior: "auto" });

        placedAt = Math.round(clamped);
      };

      /*
       * The first pass runs on the next frame, which is the earliest the pins
       * can exist: every effect in the tree has run by then, so the document is
       * already its full pinned height and the reader never sees the hero.
       *
       * The second corrects for <HorizontalPan>'s own post-image refresh at
       * 600ms, which moves every measurement taken before it. Two passes, fixed
       * — a correction that rescheduled itself would chase a settling layout
       * indefinitely.
       */
      const frame = requestAnimationFrame(restore);
      const timer = window.setTimeout(restore, 800);

      cleanUp.push(() => {
        cancelAnimationFrame(frame);
        window.clearTimeout(timer);
      });
    }

    return () => cleanUp.forEach((fn) => fn());
  }, []);

  useEffect(() => {
    // Smoothing hijacks the scroll the user asked the OS for. Never do that to
    // someone who has asked for reduced motion — leave native scrolling alone.
    if (reduce) return;

    const lenis = new Lenis({
      // Per-frame interpolation toward the target. 0.1 is ~unnoticeable lag at
      // 60fps; higher reads as sluggish on a trackpad, lower defeats the point.
      lerp: 0.1,
      // Touch devices already have momentum scrolling from the OS. Doubling it
      // up feels wrong and costs a frame of latency on every drag.
      smoothWheel: true,
      syncTouch: false,
      autoRaf: false,
      // In-page anchors are handled by the delegated listener below instead.
      anchors: false,
    });

    activeLenis = lenis;

    lenis.on("scroll", ScrollTrigger.update);

    const raf = (time: number) => {
      // GSAP's ticker reports seconds; Lenis wants milliseconds.
      lenis.raf(time * 1000);
    };

    gsap.ticker.add(raf);
    gsap.ticker.lagSmoothing(0);

    /*
     * In-page anchors, eased through Lenis.
     *
     * Lenis' own `anchors` option did not intercept these — the browser kept
     * doing its native instant jump — so the click is handled here instead.
     * One delegated listener rather than a handler per link, so any future
     * hash link anywhere on the page gets the behaviour for free.
     *
     * HEADER_OFFSET is what stops an anchored section's heading landing
     * underneath the sticky nav pill. Sections also carry `scroll-mt-24` (the
     * same 96px) so the native jump lands in the right place when Lenis is not
     * running at all — reduced motion, or no JS.
     */
    const onAnchorClick = (event: MouseEvent) => {
      // Leave modified clicks alone; they are "open elsewhere", not "navigate".
      if (
        event.defaultPrevented ||
        event.button !== 0 ||
        event.metaKey ||
        event.ctrlKey ||
        event.shiftKey ||
        event.altKey
      ) {
        return;
      }

      const anchor = (event.target as Element | null)?.closest?.<HTMLAnchorElement>(
        'a[href^="#"]',
      );
      const href = anchor?.getAttribute("href");
      if (!href || href === "#") return;

      const target = document.querySelector(href);
      if (!target) return;

      event.preventDefault();

      /*
       * Resolved to a number here rather than handing Lenis the element, and
       * given an explicit duration, so neither the distance nor the timing is
       * left to Lenis' own defaults.
       */
      const topOf = () =>
        target.getBoundingClientRect().top + window.scrollY - HEADER_OFFSET;

      if (!activeLenis) {
        window.scrollTo({ top: topOf(), behavior: "smooth" });
      } else {
        activeLenis.scrollTo(topOf(), {
          duration: ANCHOR_DURATION,
          /*
           * The two pinned sections resize the document as ScrollTrigger
           * engages and releases their spacers, so a position measured at click
           * time can be several hundred px stale by the time the scroll lands.
           * Re-measure once on arrival and close the gap.
           *
           * Deliberately a single correction with no onComplete of its own —
           * a self-rescheduling one could chase a moving layout forever.
           */
          onComplete: () => {
            const drift = target.getBoundingClientRect().top - HEADER_OFFSET;
            if (Math.abs(drift) > 2) {
              activeLenis?.scrollTo(topOf(), { duration: 0.35 });
            }
          },
        });
      }

      // Keep the URL shareable without letting the browser scroll again.
      window.history.pushState(null, "", href);
    };

    document.addEventListener("click", onAnchorClick);

    // Lenis sets height:auto on html/body, which can change document height.
    // Any trigger measured before that is measuring the old page.
    ScrollTrigger.refresh();

    return () => {
      document.removeEventListener("click", onAnchorClick);
      gsap.ticker.remove(raf);
      gsap.ticker.lagSmoothing(500, 33); // GSAP's default.
      lenis.destroy();
      if (activeLenis === lenis) activeLenis = null;
    };
  }, [reduce]);

  return null;
}
