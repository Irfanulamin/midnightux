/*
 * The ruled lines of the hero's grid field, drawn as SVG rather than as a CSS
 * background.
 *
 * WHY THIS IS NOT A BACKGROUND GRADIENT. It was, twice, and both times the grid
 * read as though some rules were bolder than others. Nothing was: a CSS
 * background gradient is painted at whatever subpixel position the layout gives
 * it and is NEVER snapped to the device pixel grid, so each rule covers a
 * different fraction of the pixel row it lands in. One falls inside a single
 * device pixel and paints at full strength; the next straddles two and paints as
 * a pair of half-strength rows, which the eye reads as lighter and fuzzier. The
 * effect gets worse, not better, the thinner the line is, and no combination of
 * width, alpha and background-position can fix it — the variation is in where
 * the rules land, not in what they are.
 *
 * SVG can be told. `shape-rendering="crispEdges"` turns off antialiasing and
 * snaps edges to the pixel grid, so every rule here is exactly one device pixel
 * at exactly the same alpha as every other one. That is the whole reason this
 * file exists; do not fold these lines back into `.bg-dotgrid`.
 *
 * The dots stay in CSS (see `.bg-dotgrid`). They are 4px round and antialiased
 * by nature, so the subpixel phase that wrecks a hairline is invisible on them,
 * and drawing them here would mean COLS x ROWS elements instead of COLS + ROWS.
 *
 * There is no viewBox on purpose: without one, SVG user units are CSS px, so the
 * constants below are the same numbers `.bg-dotgrid` tiles the dots on and the
 * two layers line up by construction. THEY MUST BE KEPT IN STEP — the cell here
 * and `--grid-cell-w` / `--grid-cell-h` there are one measurement in two files.
 */

/*
 * The design's pitch, rounded to whole pixels.
 *
 * Measured off the Figma tile (node 10:8437) as 463.667 / 10 across and
 * 463.667 / 11 down, i.e. 46.367 x 42.152 — deliberately not square. The
 * decimals are dropped because crispEdges rounds each rule to the nearest device
 * pixel: on a fractional pitch that leaves the SPACING alternating between 46
 * and 47px, and while that is far subtler than the intensity flicker it replaced
 * it is still free to avoid. On a whole pitch the gaps come out even. The cost
 * is 0.8% / 0.36%, about a third of a cell across the whole 1420px card.
 */
const CELL_W = 46;
const CELL_H = 42;

/*
 * Fixed counts rather than a measured element, so this stays a Server Component
 * with no observer and no client JS. The card clips whatever overhangs, so these
 * only have to be generous: 60 x 46 = 2760px wide covers any monitor, and
 * 40 x 42 = 1680px covers the card's ~1380px tallest.
 */
const COLS = 60;
const ROWS = 40;

const WIDTH = COLS * CELL_W;
const HEIGHT = ROWS * CELL_H;

export function GridRules() {
  return (
    <svg
      aria-hidden
      className="absolute inset-0 h-full w-full"
      shapeRendering="crispEdges"
    >
      {/*
        Stroke and opacity are set on the group so all 101 lines carry one
        value. `strokeOpacity` rather than an rgba stroke: opacity is applied
        after rasterisation, so it does not interact with the snapping above.

        The width is the ATTRIBUTE FALLBACK only. `.grid-rules` in globals.css
        overrides it on hi-DPI screens (presentation attributes lose to CSS),
        because how thin this can go is a property of the display, not of the
        design - see the note there.
      */}
      <g
        className="grid-rules"
        stroke="#000"
        strokeOpacity={0.03}
        strokeWidth={1}
      >
        {Array.from({ length: COLS + 1 }, (_, i) => {
          const x = i * CELL_W;
          return <line key={`v${i}`} x1={x} y1={0} x2={x} y2={HEIGHT} />;
        })}
        {Array.from({ length: ROWS + 1 }, (_, i) => {
          const y = i * CELL_H;
          return <line key={`h${i}`} x1={0} y1={y} x2={WIDTH} y2={y} />;
        })}
      </g>
    </svg>
  );
}
