"use client";

import { Children, useEffect, useRef, useState } from "react";
import { gsap } from "gsap";
import { useReducedMotion } from "motion/react";

/*
 * Infinite marquee, GSAP-driven.
 *
 * The previous version was pure CSS: two copies of the row, translated -50%.
 * That is only seamless while one copy is at least as wide as the viewport.
 * With six logos the row is ~1260px, so on any screen wider than that the
 * translate ran the second copy off before the first came back around and left
 * a gap on the right, which reads as the strip snapping back instead of
 * looping. Adding copies in CSS cannot fix it cleanly, because the right number
 * depends on the viewport width, which CSS cannot measure.
 *
 * So it measures. One set is observed, and enough copies are rendered to more
 * than fill the container (`copies`). GSAP then slides the track left by
 * exactly one set width on an endless repeat, with a wrap modifier that folds
 * the x back into a single set — so the boundary between repeats is invisible
 * and the loop is genuinely seamless at any width. Duration is seconds per set
 * width, so the speed is constant however many copies end up on screen.
 *
 * The measurements come from ResizeObservers, whose callbacks (not the effect
 * body) set state — correct, since they fire on observe and on every resize
 * including when the logo images finish loading and change the set's width, and
 * clear of the set-state-in-effect rule. Reduced motion renders the row static.
 */
export function Marquee({
  children,
  /** Seconds for the track to advance by one set width. Longer = slower. */
  duration = 40,
  /** Padding-right utility applied to every item; this is the visual gap. */
  gapClassName = "pr-5",
  className,
}: {
  children: React.ReactNode;
  duration?: number;
  gapClassName?: string;
  className?: string;
}) {
  const reduce = useReducedMotion();
  const containerRef = useRef<HTMLDivElement>(null);
  const trackRef = useRef<HTMLDivElement>(null);

  const [setWidth, setSetWidth] = useState(0);
  const [containerWidth, setContainerWidth] = useState(0);

  // Two extra copies past what strictly fills the container, so there is always
  // content entering from the right as the last one leaves.
  const copies =
    setWidth > 0 ? Math.max(2, Math.ceil(containerWidth / setWidth) + 2) : 2;

  useEffect(() => {
    const container = containerRef.current;
    const track = trackRef.current;
    if (!container || !track) return;

    // The first set is index 0 and keeps its identity across copy changes, so
    // this reference stays valid.
    const firstSet = track.firstElementChild;

    const setObserver = new ResizeObserver(() => {
      if (firstSet) setSetWidth(firstSet.scrollWidth);
    });
    const containerObserver = new ResizeObserver(() => {
      setContainerWidth(container.offsetWidth);
    });

    if (firstSet) setObserver.observe(firstSet);
    containerObserver.observe(container);

    return () => {
      setObserver.disconnect();
      containerObserver.disconnect();
    };
  }, []);

  useEffect(() => {
    if (reduce || setWidth <= 0) return;
    const container = containerRef.current;
    const track = trackRef.current;
    if (!track) return;

    const ctx = gsap.context(() => {
      const wrapX = gsap.utils.unitize(gsap.utils.wrap(-setWidth, 0), "px");
      const tween = gsap.to(track, {
        x: -setWidth,
        duration,
        ease: "none",
        repeat: -1,
        modifiers: { x: wrapX },
      });

      /*
       * Hover does not pause the tween, it ramps its timeScale to 0.
       *
       * `tween.pause()` removes all of the strip's velocity on a single frame,
       * and at ~70px/sec that reads as the page hitching rather than as the
       * strip responding to the cursor - the eye is tracking a moving row, and
       * the row is simply not where the next frame says it is. Easing the rate
       * down lets it coast to a standstill over ~0.7s, so the cursor looks like
       * it slowed the strip rather than broke it, and the ramp back up hides
       * the same discontinuity on the way out.
       *
       * `overwrite: true` matters here: pointer in/out inside the ramp window
       * is normal (a cursor crossing the strip does it constantly), and without
       * it the two rate tweens run at once and fight over timeScale.
       */
      const rampTo = (value: number, duration: number) =>
        gsap.to(tween, { timeScale: value, duration, ease: "power2.out", overwrite: true });

      // Out is slower than in: stopping should feel like it settles, starting
      // again should not feel like it is reluctant to.
      const pause = () => rampTo(0, 0.7);
      const play = () => rampTo(1, 0.5);
      container?.addEventListener("pointerenter", pause);
      container?.addEventListener("pointerleave", play);

      return () => {
        container?.removeEventListener("pointerenter", pause);
        container?.removeEventListener("pointerleave", play);
      };
    }, track);

    return () => ctx.revert();
  }, [reduce, setWidth, duration, copies]);

  const items = Children.map(children, (child, i) => (
    <div key={i} className={`shrink-0 ${gapClassName}`}>
      {child}
    </div>
  ));

  return (
    <div
      ref={containerRef}
      className={`relative overflow-hidden ${className ?? ""}`}
    >
      <div ref={trackRef} className="flex w-max will-change-transform">
        {Array.from({ length: copies }, (_, i) => (
          // Only the first set is read by a screen reader; the rest are copies.
          <div key={i} className="flex shrink-0" aria-hidden={i > 0}>
            {items}
          </div>
        ))}
      </div>
    </div>
  );
}
