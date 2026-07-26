"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import {
  animate,
  motion,
  useInView,
  useMotionValue,
  useMotionValueEvent,
  useReducedMotion,
} from "motion/react";

/*
 * Hero growth chart.
 *
 * Marks, colours and proportions are the Figma's (node 332:13462, a 646 x 550
 * box holding a 581 x 425 plot): one orange curve, six dashed gridlines, no axis
 * rules, no area fill, two labelled dots on the line and a concentric target dot
 * with a pill beside it. The design has no card behind any of it, so this draws
 * straight onto the hero's dot grid.
 *
 * Geometry is PARAMETRIC, not a transcribed viewBox. The chart is the hero's
 * whole point and the hero is one fixed screen, so the space it gets is whatever
 * the copy above leaves: wide and short on a laptop, tall and narrow on a phone.
 * A fixed viewBox can only match one of those, and against the rest
 * preserveAspectRatio scales the whole drawing down and centres it, which is
 * what used to leave the chart floating small in the middle of a wide box. So
 * the box is MEASURED and every coordinate is derived from it. Inside the aspect
 * clamp below, one user unit is one device px and the drawing fills its slot at
 * any size.
 *
 * Beat order matters to the pitch:
 *   1. frame in  - gridlines wipe out from the left, axis copy rises
 *   2. draw      - the orange curve climbs, marker riding the head
 *   3. pass      - each labelled dot pops as the marker sweeps past it
 *   4. arrive    - the target dot's three rings land, the pill springs in
 */

/* Figma: stroke #FF884D. Mirrored as --color-orange in globals.css. */
const ORANGE = "#ff884d";
/* Figma: the callout pill's #FFF3ED fill. */
const ORANGE_TINT = "#fff3ed";
/* Figma: gridlines #F2F2F2. */
const GRID = "#f2f2f2";
/* Figma: label ink #090A15, set at 70% for the non-accent spans. */
const INK = "#090a15";

/*
 * The curve, as control points normalised into the plot box: u runs left to
 * right, v runs bottom to top.
 *
 * These ARE the Figma's, converted straight off its exported path
 *
 *   M1.279 425.913 C361.962 425.913, 582.593 269.233, 582.593 1.27902
 *
 * divided through by the 581.31 x 424.63 it is drawn at. Two properties of it are
 * the design and must survive any edit here:
 *
 *   P0.v == P1.v   the line leaves the start EXACTLY horizontal, so it lies flat
 *                  along the bottom for the first third and the growth has a
 *                  "before" to be measured against
 *   P2.u == P3.u   it arrives EXACTLY vertical, straight up into the target dot
 *
 * Sampled across the width, which is what makes it read as compounding rather
 * than as a ramp: the first 42% of the width buys under 7% of the rise, and the
 * last 10% carries 30% of it.
 *
 *   u  0.20  0.35  0.50  0.65  0.76  0.85  0.92  0.97  1.00
 *   v  0.02  0.06  0.13  0.21  0.30  0.41  0.53  0.70  1.00
 *
 * A gentler version was tried, on the reading that the late rise was too abrupt,
 * and it was wrong: spread evenly the line stops being an exponential and reads
 * as a straight diagonal with a bend, which is a different claim about the
 * product. Steep at the end is the point.
 */
const CONTROL = [
  { u: 0.0, v: 0.0 },
  { u: 0.6227, v: 0.0 },
  { u: 1.0, v: 0.369 },
  { u: 1.0, v: 1.0 },
] as const;

/*
 * The two labelled dots, positioned by t along the cubic rather than by
 * hand-solved coordinates. Solving them by hand is what the old version did, and
 * it meant any edit to the curve silently left the dots floating off the line.
 *
 * These t values put them where the Figma has them: u 0.764 and u 0.968, both up
 * on the steep section. Copy and gaps are the Figma's too, with the design's
 * "Engement" typo fixed, and the gaps scaled off the type size below.
 */
const DOTS = [
  { t: 0.53, label: "Website Live In A Week", gap: 30 },
  { t: 0.83, label: "Audience Engagement", gap: 40 },
] as const;

/* Figma: six lines on an 85px pitch across a 425px plot. */
const GRID_LINES = 6;

const PILL_LABEL = "Your Business";

const DRAW_SECONDS = 2.4;

// Long enough for the empty frame to land before the line starts moving.
const LEAD_IN = 1.3;

// Bias the moving marker slightly ahead so it does not appear clipped at the
// very first frame when the curve begins at the plot edge.
const START_PROGRESS = 0.012;

// Entrances and settles.
const EASE = [0.22, 1, 0.36, 1] as const;

/*
 * The draw itself eases IN, not out. Expo-out launched fast and coasted, which
 * rushed the steep climb (the interesting part) and crawled through the flat.
 * This lingers in the flat years and accelerates into the growth.
 */
const DRAW_EASE = [0.65, 0, 0.35, 1] as const;

const SAMPLES = 260;

/*
 * Aspect clamp for the measured box.
 *
 * The Figma draws the chart at 646 x 550, so it is very nearly square (1.175),
 * and the plot inside it is 1.367. These bracket that. A wide range was tried
 * first, on the theory that filling the whole slot was the goal, and it was
 * wrong: stretched past about 1.4 the flat opening of the curve turns into a
 * long horizontal nothing, the labels drift away from their dots, and the chart
 * stops reading as the design's compact panel.
 *
 * So the box takes the slot's aspect only where that already falls in range, and
 * otherwise sits at the nearest end and centres. It centres onto the dot grid,
 * with no card edge to make the leftover read as dead space, which is what makes
 * a clamp this tight affordable.
 */
const MIN_ASPECT = 1.05;
const MAX_ASPECT = 1.35;

/*
 * And a ceiling, because "fills the space" is not the same as "should be as large
 * as the space allows". The Figma sets the chart at 646 wide inside a 1440 frame,
 * a bit under half the width; on a large monitor an uncapped box just inflates
 * the line weight and the type past the proportions the design was drawn at.
 *
 * It is the design's own 646 x 550 and not a hair more. The previous 700 x 620
 * was a little slack over the top of it, and because the hero hands the chart
 * everything the copy does not take, that slack was reached on any ordinary
 * laptop: the drawing sat above its drawn size while the headline was still
 * being squeezed below the design's, which is exactly the imbalance the hero
 * ratio note describes.
 */
const MAX_BOX = { w: 646, h: 550 };

/*
 * What the server and the first frame draw, before the box has been measured.
 * The Figma's own box, so the pre-measure paint is already the right shape.
 */
const FALLBACK = { w: 646, h: 550 };

const clamp = (v: number, min: number, max: number) =>
  Math.min(Math.max(v, min), max);

const lerp = (a: number, b: number, t: number) => a + (b - a) * t;

type Point = { x: number; y: number };

const cubic1d = (a: number, b: number, c: number, d: number, t: number) => {
  const s = 1 - t;
  return s * s * s * a + 3 * s * s * t * b + 3 * s * t * t * c + t * t * t * d;
};

/*
 * Each dot's normalised u, precomputed: it depends only on CONTROL, and the type
 * size below needs it before there are any pixel coordinates to work from.
 */
const DOT_U = DOTS.map((d) =>
  cubic1d(CONTROL[0].u, CONTROL[1].u, CONTROL[2].u, CONTROL[3].u, d.t),
);

/*
 * Width of a label in multiples of the type size, as the ratio the Figma's own
 * measurements give: its 13-character "Your Business" is 130px at 20px, so 0.5em
 * a character. Enough to lay out a capsule and to check a label has room, which
 * is all it is used for; SVG text cannot be measured before it is laid out.
 */
const EM_PER_CHAR = 0.5;

const pointOnCubic = (p: readonly Point[], t: number): Point => {
  const s = 1 - t;
  const b0 = s * s * s;
  const b1 = 3 * s * s * t;
  const b2 = 3 * s * t * t;
  const b3 = t * t * t;
  return {
    x: b0 * p[0].x + b1 * p[1].x + b2 * p[2].x + b3 * p[3].x,
    y: b0 * p[0].y + b1 * p[1].y + b2 * p[2].y + b3 * p[3].y,
  };
};

/*
 * Everything the drawing needs, derived from the box it has to fill.
 *
 * The insets are the Figma's proportions (it reserves 65 of 646 on the right for
 * the rotated y label and 64 of 550 at the bottom for the x label) with px
 * floors and ceilings, so the labels still have room in a small box and the plot
 * does not lose half a wide one to margin.
 */
function buildLayout(w: number, h: number) {
  const padR = clamp(w * 0.1, 44, 78);
  const padB = clamp(h * 0.116, 40, 68);
  // The Figma's curve starts at x = 0 exactly; 2px is the round cap's overhang.
  const padL = 2;

  const x0 = padL;
  const x1 = w - padR;
  const pw = Math.max(x1 - x0, 1);

  /*
   * Figma sets its labels at 20px inside a 646-wide box. Held to that ratio, and
   * floored so a phone stays legible and capped so a wide desktop does not
   * balloon. These are literal device px: the viewBox IS the measured box.
   *
   * Then capped again by whether the longest dot label actually fits between the
   * plot's left edge and its own dot. On a narrow box that constraint binds first
   * (a 320px-wide phone is the case that found it), and the alternative is a
   * label running off the side of the chart. Solved rather than clipped, because
   * every term in it is a known multiple of the type size:
   *
   *   u * pw  >=  dotR + gap + labelWidth,  all three linear in `type`
   */
  const labelLimit = Math.min(
    ...DOTS.map(
      (d, i) =>
        (DOT_U[i] * pw) /
        (0.4477 + d.gap / 20 + d.label.length * EM_PER_CHAR),
    ),
  );
  const type = Math.max(Math.min(clamp((20 * w) / 646, 13, 21), labelLimit), 10);

  /* Figma: mid dots r 8.95312 against 20px type. */
  const dotR = type * 0.4477;

  /*
   * Figma's target dot is three stacked discs, r 25.5805 / 19.1853 / 12.7902 at
   * 20px type, at 30% / 50% / full opacity.
   */
  const targetR = type * 1.279;
  const targetMidR = type * 0.9593;
  const targetInnerR = type * 0.6395;

  /*
   * The top inset has to clear the target dot, which straddles the plot's top
   * edge, and the pill beside it, which is centred on the same line. Figma's own
   * value is 61 of 550 (11.1%), and the max() is what keeps the outer disc inside
   * the box when the proportion alone would not: the disc scales with the type,
   * the inset with the box height, and on a short box the type wins.
   *
   * Computed after `type` for that reason, which is why it is not up with padR
   * and padB.
   */
  const padT = Math.max(h * 0.111, targetR + type * 0.4);

  const y0 = padT;
  const y1 = h - padB;
  const ph = Math.max(y1 - y0, 1);

  const at = (u: number, v: number): Point => ({
    x: x0 + u * pw,
    y: y1 - v * ph,
  });

  const control = CONTROL.map((p) => at(p.u, p.v));
  const [c0, c1, c2, c3] = control;
  const curve = `M ${c0.x} ${c0.y} C ${c1.x} ${c1.y}, ${c2.x} ${c2.y}, ${c3.x} ${c3.y}`;

  /*
   * The target dot sits ON the curve's endpoint. The Figma floats it 35px clear
   * of the line end, which reads fine there only because the approach is exactly
   * vertical; centred on the endpoint it is unambiguously the point the curve
   * arrives at, and the travelling marker (which ends on the same coordinate) has
   * something to hand off to instead of parking beside it as a second dot.
   */
  const target: Point = { x: c3.x, y: c3.y };

  /*
   * Figma: a 181.161 x 50.813 pill around a 130px "Your Business" set at 20px,
   * 20px clear of the target disc. All of those are ratios of the type size, so
   * the capsule and its label grow together. Sizing only the font would spill
   * the text straight out of the pill, and there is no way to measure SVG text
   * before layout.
   */
  const pillH = type * 2.5407;
  const pillPadX = type * 1.279;
  const pillW = type * 6.5 + pillPadX * 2;
  const pill = {
    x: target.x - targetR - type - pillW,
    y: target.y - pillH / 2,
    w: pillW,
    h: pillH,
    textX: target.x - targetR - type - pillW / 2,
  };

  const dots = DOTS.map((d) => {
    const at_ = pointOnCubic(control, d.t);
    return {
      ...d,
      x: at_.x,
      y: at_.y,
      // Label right edge, gap px clear of the dot, level with its centre.
      labelX: at_.x - dotR - (d.gap / 20) * type,
    };
  });

  const grid = Array.from(
    { length: GRID_LINES },
    (_, i) => y1 - (i / (GRID_LINES - 1)) * ph,
  );

  return {
    w,
    h,
    x0,
    x1,
    y0,
    y1,
    pw,
    ph,
    type,
    /*
     * Axis label anchors, both sitting inside their own inset: the x label low
     * in the bottom band (Figma centres it 56 of 64px below the plot), the y
     * label hugging the right edge (Figma puts it in the last 15 of 65px).
     */
    xAxisY: y1 + padB * 0.62,
    yAxisX: x1 + padR * 0.72,
    curve,
    dots,
    dotR,
    target,
    targetR,
    targetMidR,
    targetInnerR,
    pill,
    grid,
    start: c0,
    // Figma: stroke-width 2.55804 at 20px type, with a 2px hairline floor.
    stroke: Math.max(type * 0.1279, 2),
    // Figma: stroke-dasharray "10 10" at 20px type.
    dash: `${type * 0.5} ${type * 0.5}`,
    // Figma: tracking-[1px] on the uppercase axis labels.
    tracking: type * 0.05,
  };
}

export function GrowthChart({ className = "" }: { className?: string } = {}) {
  const rootRef = useRef<SVGSVGElement>(null);
  const pathRef = useRef<SVGPathElement>(null);
  const markerRef = useRef<SVGGElement>(null);
  const dotRef = useRef<SVGCircleElement>(null);
  const haloRef = useRef<SVGCircleElement>(null);

  /*
   * The measured box.
   *
   * State is set from the ResizeObserver's callback rather than from the effect
   * body, which is what keeps this clear of react-hooks/set-state-in-effect (the
   * same pattern components/ui/marquee.tsx uses to measure its track). Observing
   * the svg itself is safe: a viewBox change cannot alter the element's own box,
   * so there is no measure/paint feedback loop.
   */
  const [box, setBox] = useState(FALLBACK);

  const [arrivedState, setArrivedState] = useState(false);
  const [reached, setReached] = useState(0);

  const reachedRef = useRef(0);
  const arrivedRef = useRef(false);

  // Frame-to-frame velocity, smoothed, driving the marker's size.
  const previousRef = useRef(0);
  const heatRef = useRef(0);

  /*
   * The chart is the bottom half of a one-screen hero, so it is on screen at
   * load. 0.45 leaves margin on a short window where a higher threshold is
   * simply unreachable and every element would stay at opacity 0.
   */
  const inView = useInView(rootRef, { amount: 0.45, once: true });
  const reduce = useReducedMotion();

  const progress = useMotionValue(0);

  /*
   * Pre-sample the curve once per layout. Calling getPointAtLength every frame
   * makes the browser re-walk the path geometry; a lookup table reduces the
   * per-frame cost to an index and one interpolation.
   */
  const pointsRef = useRef<Point[]>([]);

  /*
   * Memoised on the measured box, and that matters: buildLayout returns fresh
   * arrays, so an unmemoised call would give `paint` a new identity on every
   * render, which would re-run the sampling effect below and walk the path
   * geometry 261 times for nothing.
   */
  const layout = useMemo(() => buildLayout(box.w, box.h), [box.w, box.h]);

  /*
   * Arrival is derived from reduced motion rather than assigned, so the static
   * branch needs no state at all.
   */
  const arrived = reduce === true || arrivedState;
  const show = inView;

  useEffect(() => {
    const node = rootRef.current;
    if (!node) return;

    const observer = new ResizeObserver(([entry]) => {
      const { width, height } = entry.contentRect;
      if (!width || !height) return;

      /*
       * The largest box that fits the slot, stays under the ceiling, and holds an
       * aspect in range. Round it: sub-pixel churn in the observed box would
       * otherwise rebuild the layout and re-sample the path on every scroll frame
       * that nudges the viewport by a fraction of a px.
       */
      const availW = Math.min(width, MAX_BOX.w);
      const availH = Math.min(height, MAX_BOX.h);
      const aspect = clamp(availW / availH, MIN_ASPECT, MAX_ASPECT);

      let w = availW;
      let h = w / aspect;
      if (h > availH) {
        h = availH;
        w = h * aspect;
      }

      setBox((prev) => {
        const next = { w: Math.round(w), h: Math.round(h) };
        return prev.w === next.w && prev.h === next.h ? prev : next;
      });
    });

    observer.observe(node);
    return () => observer.disconnect();
  }, []);

  /*
   * Marker position and size are the only per-frame work. Shared with the
   * re-sample below, so a resize mid-animation (or long after it) leaves the
   * marker on the line rather than at a stale px coordinate.
   */
  const paint = useCallback(
    (p: number) => {
      const points = pointsRef.current;
      const marker = markerRef.current;
      const dot = dotRef.current;
      if (!points.length || !marker || !dot) return;

      const safeProgress = clamp(p, 0, 1);
      const markerProgress = Math.max(safeProgress, START_PROGRESS);
      const exact = markerProgress * SAMPLES;
      const i = Math.floor(exact);
      const j = Math.min(i + 1, SAMPLES);
      const t = exact - i;
      const x = lerp(points[i].x, points[j].x, t);
      const y = lerp(points[i].y, points[j].y, t);

      marker.setAttribute("transform", `translate(${x} ${y})`);

      /*
       * Dots trigger on the marker's x, not on progress: progress is a
       * path-length fraction, and length diverges from horizontal distance on
       * the steep section, so a fraction-based trigger would fire in the wrong
       * place. State is only set on an actual crossing, so this costs two
       * renders in total rather than one per frame.
       */
      let count = 0;
      for (const d of layout.dots) if (x >= d.x) count += 1;
      if (count !== reachedRef.current) {
        reachedRef.current = count;
        setReached(count);
      }

      /*
       * Arrival is derived from progress, not from the tween's onComplete.
       * useReducedMotion() resolves null -> false after hydration, which re-runs
       * the effect and calls controls.stop() on the in-flight animation, so
       * onComplete could silently never fire and leave the target dot and the
       * pill stuck at opacity 0 forever. Reading the value cannot miss.
       */
      if (p >= 0.999 && !arrivedRef.current) {
        arrivedRef.current = true;
        setArrivedState(true);
      }

      /*
       * Size scales with the marker's own velocity, smoothed. Because the curve
       * is exponential and the ease accelerates, the dot physically speeds up as
       * it climbs, and tying its weight to that makes it look like it is loading
       * up rather than sliding at a constant rate. Radius only: the page has no
       * shadows, so there is no glow to drive.
       */
      const velocity = Math.abs(p - previousRef.current);
      previousRef.current = p;
      heatRef.current += (velocity - heatRef.current) * 0.14;
      const heat = Math.min(heatRef.current * 110, 1);

      dot.setAttribute("r", String(layout.dotR * (1 + heat * 0.28)));
    },
    [layout.dots, layout.dotR],
  );

  useMotionValueEvent(progress, "change", paint);

  // Re-sample whenever the curve changes shape, and put the marker back on it.
  useEffect(() => {
    const path = pathRef.current;
    if (!path) return;
    const total = path.getTotalLength();
    pointsRef.current = Array.from({ length: SAMPLES + 1 }, (_, i) => {
      const { x, y } = path.getPointAtLength((i / SAMPLES) * total);
      return { x, y };
    });
    paint(progress.get());
  }, [layout.curve, paint, progress]);

  useEffect(() => {
    if (!inView) return;

    if (reduce) {
      progress.set(1);
      return;
    }

    // Arrival is handled by the progress listener above, not by onComplete.
    const controls = animate(progress, 1, {
      duration: DRAW_SECONDS,
      ease: DRAW_EASE,
      delay: LEAD_IN,
    });

    return () => controls.stop();
  }, [inView, reduce, progress]);

  return (
    <motion.svg
      ref={rootRef}
      viewBox={`0 0 ${layout.w} ${layout.h}`}
      /*
       * Fills its slot; the viewBox above is that slot, measured. Within the
       * aspect clamp the two agree exactly and nothing is scaled, so every size
       * in buildLayout is a real device px.
       */
      className={`h-full w-full ${className}`}
      role="img"
      aria-label="Chart showing business growth accelerating over time with MidnightUX"
      initial={reduce ? false : { opacity: 0, scale: 0.97, y: 16 }}
      animate={show ? { opacity: 1, scale: 1, y: 0 } : undefined}
      transition={{ duration: 0.85, ease: EASE }}
    >
      {/*
        1. Gridlines. Figma's dashed rules, and the only structure behind the
        curve: the design draws no axis lines at all.

        They wipe out from the left on scaleX rather than on pathLength, and that
        is load-bearing: Motion implements pathLength as a stroke-dasharray, so
        it cannot share an element with a real dash pattern. One would silently
        overwrite the other.
      */}
      {layout.grid.map((y, i) => (
        <motion.line
          key={i}
          x1={layout.x0}
          x2={layout.x1}
          y1={y}
          y2={y}
          stroke={GRID}
          strokeWidth="2"
          strokeDasharray={layout.dash}
          strokeLinecap="round"
          initial={reduce ? false : { scaleX: 0, opacity: 0 }}
          animate={show ? { scaleX: 1, opacity: 1 } : undefined}
          transition={{ duration: 0.9, ease: EASE, delay: 0.15 + i * 0.06 }}
          style={{ transformOrigin: `${layout.x0}px ${y}px` }}
        />
      ))}

      {/*
        2. Axis copy. Two spans each, as the Figma sets them: the sentence in ink
        at 70% and the subject in orange, so the two axes read together as "your
        growth over time with MidnightUX".

        The wordmark is the Figma's, verbatim. The rest of the site now agrees
        with it: the studio is MidnightUX everywhere (SITE_NAME in lib/site.ts,
        the header and footer marks), so this string, the two logo assets and
        SITE_NAME are the places a further rename has to touch.
      */}
      <motion.g
        fill={INK}
        fontSize={layout.type}
        letterSpacing={layout.tracking}
        initial={reduce ? false : { opacity: 0, y: 8 }}
        animate={show ? { opacity: 1, y: 0 } : undefined}
        transition={{ duration: 0.65, ease: EASE, delay: 0.32 }}
      >
        <text
          x={layout.x0 + layout.pw / 2}
          y={layout.xAxisY}
          textAnchor="middle"
          dominantBaseline="central"
        >
          {/*
            The gap between the spans is a NON-BREAKING space, and has to be.
            SVG applies XML whitespace handling to tspan content, so a plain
            trailing space is collapsed away and the two spans render welded
            together as "TIME WITHMIDNIGHTUX".
          */}
          <tspan fillOpacity="0.7">{"TIME WITH\u00a0"}</tspan>
          <tspan fill={ORANGE} fontWeight="500">
            MIDNIGHTUX
          </tspan>
        </text>
        <text
          x={layout.yAxisX}
          y={layout.y0 + layout.ph / 2}
          textAnchor="middle"
          dominantBaseline="central"
          transform={`rotate(-90 ${layout.yAxisX} ${layout.y0 + layout.ph / 2})`}
        >
          {/* Non-breaking space, for the reason above. */}
          <tspan fillOpacity="0.7">{"YOUR\u00a0"}</tspan>
          <tspan fill={ORANGE} fontWeight="500">
            GROWTH
          </tspan>
        </text>
      </motion.g>

      {/*
        3. The curve.

        strokeLinecap is the Figma's "round". Motion implements pathLength: 0 as
        `stroke-dasharray: 0px 1px`, and per the SVG spec a zero-length dash with
        a round cap paints a filled circle of stroke-width diameter, so a round
        cap does put a dot at the path's start before the draw begins. It is
        harmless here only because the travelling marker sits on that exact point
        at several times the radius, and because opacity snaps on at LEAD_IN
        rather than fading in across the draw. Do not move either.
      */}
      <motion.path
        ref={pathRef}
        d={layout.curve}
        fill="none"
        stroke={ORANGE}
        strokeWidth={layout.stroke}
        strokeLinecap="round"
        initial={reduce ? false : { pathLength: 0, opacity: 0 }}
        animate={show ? { pathLength: 1, opacity: 1 } : undefined}
        /*
         * pathLength must match the marker's tween exactly, same duration, ease
         * and delay, or the dot drifts off the end of its own line.
         */
        transition={{
          pathLength: {
            duration: DRAW_SECONDS,
            ease: DRAW_EASE,
            delay: LEAD_IN,
          },
          opacity: { duration: 0.01, delay: LEAD_IN },
        }}
      />

      {/*
        4. The labelled dots, each popping as the marker sweeps past it, so the
        single sweep becomes a sequence of beats the eye can follow. Labels sit
        level with their dot and right-aligned to its left, as the Figma places
        them.
      */}
      {layout.dots.map((d, i) => {
        const hit = reached > i;
        return (
          <motion.g
            key={d.label}
            initial={reduce ? false : { opacity: 0 }}
            animate={hit ? { opacity: 1 } : undefined}
            transition={{ duration: 0.45, ease: EASE }}
          >
            <motion.circle
              cx={d.x}
              cy={d.y}
              r={layout.dotR}
              fill={ORANGE}
              initial={reduce ? false : { scale: 0 }}
              animate={hit ? { scale: [0, 1.7, 1] } : undefined}
              transition={{ duration: 0.6, ease: EASE, times: [0, 0.4, 1] }}
              style={{ transformOrigin: `${d.x}px ${d.y}px` }}
            />
            <motion.text
              x={d.labelX}
              y={d.y}
              textAnchor="end"
              dominantBaseline="central"
              fontSize={layout.type}
              fill={INK}
              fillOpacity="0.7"
              initial={reduce ? false : { opacity: 0, x: 8 }}
              animate={hit ? { opacity: 1, x: 0 } : undefined}
              transition={{ duration: 0.5, ease: EASE, delay: 0.08 }}
            >
              {d.label}
            </motion.text>
          </motion.g>
        );
      })}

      {/*
        5. The target dot: three stacked orange discs at the Figma's radii and
        opacities, sitting on the curve's endpoint so the line runs into it. It
        does not exist until the curve actually reaches it, because showing the
        destination up front gives away the ending and leaves a stray dot floating
        in empty space.

        The rings land outside-in on a stagger, which is what carries the arrival
        beat now that there is no area fill to reveal (the Figma has none). `fill`
        stays a plain attribute: in `initial` it meant the first paint, before
        Motion applied anything, used SVG's default fill of black.

        The pulse below them is the resting beat. It used to live on the
        travelling marker, but the marker now retires on arrival (see 7), and
        without something breathing here a finished chart reads as a screenshot to
        anyone who scrolls back up. Same centre, same radius as the outer disc, so
        it reads as THIS dot being live rather than as another dot.
      */}
      <motion.circle
        cx={layout.target.x}
        cy={layout.target.y}
        r={layout.targetR}
        fill={ORANGE}
        initial={reduce ? false : { scale: 1, opacity: 0 }}
        animate={
          reduce
            ? { scale: 1, opacity: 0 }
            : arrived
              ? { scale: [1, 1.9, 1], opacity: [0.26, 0, 0.26] }
              : undefined
        }
        transition={
          reduce
            ? { duration: 0 }
            : { duration: 3.2, repeat: Infinity, ease: "easeOut", delay: 0.7 }
        }
        style={{
          transformOrigin: `${layout.target.x}px ${layout.target.y}px`,
        }}
      />

      {[
        { r: layout.targetR, opacity: 0.3, delay: 0 },
        { r: layout.targetMidR, opacity: 0.5, delay: 0.07 },
        { r: layout.targetInnerR, opacity: 1, delay: 0.14 },
      ].map((ring, i) => (
        <motion.circle
          key={i}
          cx={layout.target.x}
          cy={layout.target.y}
          r={ring.r}
          fill={ORANGE}
          fillOpacity={ring.opacity}
          initial={reduce ? false : { scale: 0 }}
          animate={arrived ? { scale: [0, 1.35, 1] } : undefined}
          transition={{
            duration: 0.75,
            ease: EASE,
            times: [0, 0.45, 1],
            delay: ring.delay,
          }}
          style={{
            transformOrigin: `${layout.target.x}px ${layout.target.y}px`,
          }}
        />
      ))}

      {/* 6. Callout pill, springing in behind the arrival beat. */}
      <motion.g
        initial={reduce ? false : { opacity: 0, scale: 0.8, x: 8 }}
        animate={arrived ? { opacity: 1, scale: 1, x: 0 } : undefined}
        transition={{ type: "spring", stiffness: 300, damping: 22, delay: 0.2 }}
        style={{
          transformOrigin: `${layout.pill.x + layout.pill.w}px ${layout.target.y}px`,
        }}
      >
        <rect
          x={layout.pill.x}
          y={layout.pill.y}
          width={layout.pill.w}
          height={layout.pill.h}
          rx={layout.pill.h / 2}
          fill={ORANGE_TINT}
        />
        <text
          x={layout.pill.textX}
          y={layout.target.y}
          textAnchor="middle"
          dominantBaseline="central"
          fontSize={layout.type}
          fontWeight="500"
          fill={ORANGE}
        >
          {PILL_LABEL}
        </text>
      </motion.g>

      {/*
        7. Travelling marker, painted last so it sits above the curve. The outer
        <g> is positioned imperatively; the inner motion.g owns the fade. Sharing
        one element between Motion and an imperative transform write means one
        silently clobbers the other.

        It is the drawing head, and it RETIRES on arrival. The target dot now
        lands on the same point, so leaving the marker there would stack two dots
        and two competing pulses on one coordinate. Fading it out hands the beat
        to the target dot, which is where the eye should finish.

        Under reduced motion `arrived` is true from the first frame, so the marker
        is never painted at all and the static chart is the design's three dots.
      */}
      <g
        ref={markerRef}
        transform={`translate(${layout.start.x} ${layout.start.y})`}
      >
        <motion.g
          initial={reduce ? false : { opacity: 0 }}
          animate={arrived ? { opacity: 0 } : show ? { opacity: 1 } : undefined}
          transition={
            arrived
              ? { duration: 0.4, ease: EASE, delay: 0.12 }
              : { duration: 0.4, delay: 0.26 }
          }
        >
          <motion.circle
            ref={haloRef}
            r={layout.dotR * 1.66}
            fill={ORANGE}
            /*
             * Pulses only while the line is being drawn. There is no
             * post-arrival branch any more, because the marker is on its way out
             * by then and the target dot has taken over the resting beat.
             */
            animate={
              reduce || arrived
                ? { scale: 1, opacity: 0 }
                : { scale: [1, 2.5, 1], opacity: [0.3, 0, 0.3] }
            }
            transition={
              reduce || arrived
                ? { duration: 0.3 }
                : { duration: 1.8, repeat: Infinity, ease: "easeOut" }
            }
          />
          <circle ref={dotRef} r={layout.dotR} fill={ORANGE} />
        </motion.g>
      </g>
    </motion.svg>
  );
}
