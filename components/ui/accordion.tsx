"use client";

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useId,
  useRef,
  useState,
} from "react";
import { useReducedMotion } from "motion/react";

/*
 * Single-open accordion primitive.
 *
 * Owns the state, the ARIA wiring and the open/close animation; styling is left
 * entirely to the caller, because the two places this is used look nothing
 * alike (borderless rows on teal vs. separated cards on cream). Trying to
 * express both through one set of style props would have been worse than
 * passing the visuals in.
 */

type AccordionContextValue = {
  openIndex: number | null;
  setOpenIndex: (index: number | null) => void;
  baseId: string;
  reportMetrics: (index: number, triggerHeight: number, panelHeight: number) => void;
};

const AccordionContext = createContext<AccordionContextValue | null>(null);

function useAccordion() {
  const ctx = useContext(AccordionContext);
  if (!ctx) {
    throw new Error("<AccordionItem> must be rendered inside <Accordion>");
  }
  return ctx;
}

export function Accordion({
  children,
  defaultIndex = null,
  className,
  /**
   * Reserve space for the tallest panel so the block never changes height as
   * rows toggle. Off by default; opt in where the layout shift is disruptive.
   */
  fixedHeight = false,
}: {
  children: React.ReactNode;
  /** Index open on first paint. `null` starts fully collapsed. */
  defaultIndex?: number | null;
  className?: string;
  fixedHeight?: boolean;
}) {
  const [openIndex, setOpenIndex] = useState<number | null>(defaultIndex);
  const baseId = useId();
  const rootRef = useRef<HTMLDivElement>(null);

  /*
   * Reserve = sum of the (always-collapsed) trigger rows + the tallest panel.
   *
   * Critically this never reads the root's own height. An earlier version did,
   * and since the reserve is applied AS the root's min-height, every
   * measurement included the value it had just written — the reserve grew on
   * each ResizeObserver tick until the renderer locked up. Deriving it only
   * from children makes the feedback loop structurally impossible.
   */
  const metrics = useRef<Map<number, { trigger: number; panel: number }>>(
    new Map(),
  );
  const [reserve, setReserve] = useState<number | null>(null);

  const reportMetrics = useCallback(
    (index: number, triggerHeight: number, panelHeight: number) => {
      if (!fixedHeight) return;

      const prev = metrics.current.get(index);
      if (prev && prev.trigger === triggerHeight && prev.panel === panelHeight) {
        return;
      }
      metrics.current.set(index, {
        trigger: triggerHeight,
        panel: panelHeight,
      });

      let triggers = 0;
      let tallestPanel = 0;
      for (const m of metrics.current.values()) {
        triggers += m.trigger;
        tallestPanel = Math.max(tallestPanel, m.panel);
      }
      setReserve(Math.ceil(triggers + tallestPanel));
    },
    [fixedHeight],
  );

  return (
    <AccordionContext.Provider
      value={{ openIndex, setOpenIndex, baseId, reportMetrics }}
    >
      <div
        ref={rootRef}
        className={className}
        style={reserve ? { minHeight: reserve } : undefined}
      >
        {children}
      </div>
    </AccordionContext.Provider>
  );
}

export function AccordionItem({
  index,
  trigger,
  children,
  className,
  triggerClassName,
}: {
  index: number;
  /*
   * Plain ReactNode, deliberately not a render prop. These items are used from
   * Server Components, and functions cannot cross the server -> client
   * boundary. Callers style against open state with Tailwind's aria variants
   * instead — the button carries `group` and `aria-expanded`, so children can
   * use `group-aria-expanded:*` and ancestors `has-[[aria-expanded=true]]:*`.
   */
  trigger: React.ReactNode;
  children: React.ReactNode;
  className?: string;
  triggerClassName?: string;
}) {
  const { openIndex, setOpenIndex, baseId, reportMetrics } = useAccordion();
  const reduce = useReducedMotion();
  const triggerRef = useRef<HTMLHeadingElement>(null);

  /*
   * The panel opens by animating grid-template-rows 0fr -> 1fr, not to a
   * measured pixel height.
   *
   * It used to animate to a number read from the content on mount. That number
   * is a second source of truth for something the layout already knows, and
   * when it was wrong — measured before the content had its final width, or
   * read off a node the observer had lost — the panel animated to a height
   * shorter than its contents and silently clipped them, which is exactly what
   * happened to the service rows once the tag list started wrapping.
   *
   * 0fr -> 1fr has no such failure mode: the row resolves to whatever the
   * content actually is, at every viewport, with no measurement involved. The
   * inner min-h-0 is what lets the track collapse below the content's min-content
   * height — without it the panel will not close.
   *
   * (Animating height:auto was never an option: Motion can animate *to* auto,
   * but animating away from a literal auto snapped in via initial={false} fails
   * silently, leaving an open panel stuck at full height.)
   */
  const contentRef = useRef<HTMLDivElement>(null);

  /*
   * The observer now only feeds the optional fixedHeight reserve. If it ever
   * reports a stale number the reserve is a little off — it can no longer
   * truncate the panel itself.
   */
  useEffect(() => {
    const el = contentRef.current;
    if (!el) return;
    const measure = () => {
      reportMetrics(
        index,
        triggerRef.current?.offsetHeight ?? 0,
        el.offsetHeight,
      );
    };
    measure();
    const observer = new ResizeObserver(measure);
    observer.observe(el);
    return () => observer.disconnect();
  }, [index, reportMetrics]);

  const open = openIndex === index;
  const panelId = `${baseId}-panel-${index}`;
  const triggerId = `${baseId}-trigger-${index}`;

  return (
    <div className={className}>
      <h3 ref={triggerRef}>
        <button
          type="button"
          id={triggerId}
          aria-expanded={open}
          aria-controls={panelId}
          // Clicking an open row closes it, so the set can rest fully collapsed.
          onClick={() => setOpenIndex(open ? null : index)}
          className={`group appearance-none border-0 bg-transparent p-0 text-left focus-visible:outline-none ${triggerClassName ?? ""}`}
        >
          {trigger}
        </button>
      </h3>

      {/*
       * Always mounted, collapsed by the grid track rather than unmounted.
       *
       * This previously used AnimatePresence with a conditional child, and the
       * exit animation intermittently failed to run — leaving a closed panel
       * stuck open while its trigger reported aria-expanded="false". Keeping the
       * node mounted removes the entire mount/unmount race; there is no exit to
       * miss.
       *
       * A plain CSS transition rather than Motion: grid-template-rows is not a
       * value Motion interpolates, and the browser does it natively.
       *
       * `inert` (React 19) pulls the collapsed content out of the tab order and
       * the accessibility tree, which overflow-hidden alone does not do.
       */}
      <div
        id={panelId}
        role="region"
        aria-labelledby={triggerId}
        data-open={open ? "true" : "false"}
        inert={!open}
        className={`grid overflow-hidden ${
          reduce
            ? ""
            : "transition-[grid-template-rows,opacity] duration-420 ease-[cubic-bezier(0.22,1,0.36,1)]"
        } ${open ? "grid-rows-[1fr] opacity-100" : "grid-rows-[0fr] opacity-0"}`}
      >
        <div ref={contentRef} className="min-h-0">
          {children}
        </div>
      </div>
    </div>
  );
}
