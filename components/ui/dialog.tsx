"use client";

/*
 * shadcn Dialog (radix Dialog), rebuilt on this project's tokens.
 *
 * Same rebuild as sheet.tsx and button.tsx: as the CLI generates it this file
 * references `bg-background`, `text-muted-foreground`, `border` and lucide's
 * XIcon, none of which exist here (shadcn's init never ran, and globals.css is
 * hand-built). Shipped as generated the panel renders as unstyled text on a
 * transparent box.
 *
 * Enter/exit motion is CSS `@keyframes` from globals.css rather than a
 * transition, because radix drives the exit off `animationend` and a plain
 * transition lets the panel unmount before it can animate out. The curve is the
 * page's one decelerate ease, so a dialog settles like every other surface.
 *
 * WHAT THIS PRIMITIVE EXISTS TO GET RIGHT, beyond styling: the page behind it.
 *
 * Radix locks the page scroll while a modal is open, which is what we want, and
 * it does it by setting `overflow: hidden` on the body. That removes the page's
 * scrollbar, so opening a dialog made the whole site's scrollbar blink out of
 * existence and closing it brought it back. Radix then adds a `padding-right`
 * equal to the removed bar so in-flow content does not jump sideways, which
 * does nothing for `fixed` elements: ScrollProgress is `fixed inset-x-0` and
 * stretched by that same ~15px on every open.
 *
 * Both symptoms are one cause, and it is fixed in globals.css rather than here,
 * because it is the ROOT element that has to change: `html` carries
 * `overflow-y: scroll` so the scrollbar is permanently rendered and the
 * viewport scrolls the root rather than the body, and radix's compensation is
 * then neutralised as a lock that removes nothing needs no padding to make up
 * for it. See the comments on those two rules; the ordering and specificity
 * traps around them are not obvious and cost real time once already.
 *
 * The lock itself is untouched and still complete: Lenis is stopped (see
 * setPageScrollLocked), and react-remove-scroll's capture-phase wheel and
 * touchmove handlers, which are a separate mechanism from its styling, still
 * refuse any scroll starting outside the panel.
 */

import * as React from "react";
import { Dialog as DialogPrimitive } from "radix-ui";
import { XIcon } from "@phosphor-icons/react/ssr";

import { setPageScrollLocked } from "@/components/ui/smooth-scroll";
import { cn } from "@/lib/utils";

function Dialog(props: React.ComponentProps<typeof DialogPrimitive.Root>) {
  /*
   * `modal` is left at its default of true, deliberately. It is what gives the
   * focus trap, the aria-hidden on the rest of the page, and the scroll lock:
   * the reader's attention belongs to the panel while it is open. Passing
   * modal={false} to dodge the scroll lock also silently drops the focus trap,
   * which is not a trade worth making.
   */
  return <DialogPrimitive.Root data-slot="dialog" {...props} />;
}

function DialogTrigger(
  props: React.ComponentProps<typeof DialogPrimitive.Trigger>,
) {
  return <DialogPrimitive.Trigger data-slot="dialog-trigger" {...props} />;
}

function DialogClose(props: React.ComponentProps<typeof DialogPrimitive.Close>) {
  return <DialogPrimitive.Close data-slot="dialog-close" {...props} />;
}

function DialogPortal(
  props: React.ComponentProps<typeof DialogPrimitive.Portal>,
) {
  return <DialogPrimitive.Portal data-slot="dialog-portal" {...props} />;
}

function DialogOverlay({
  className,
  ...props
}: React.ComponentProps<typeof DialogPrimitive.Overlay>) {
  return (
    <DialogPrimitive.Overlay
      data-slot="dialog-overlay"
      className={cn(
        "fixed inset-0 z-50 bg-ink/60 backdrop-blur-[2px]",
        "data-[state=open]:animate-[sheet-fade-in_0.4s_cubic-bezier(0.16,1,0.3,1)]",
        "data-[state=closed]:animate-[sheet-fade-out_0.3s_cubic-bezier(0.16,1,0.3,1)]",
        className,
      )}
      {...props}
    />
  );
}

/*
 * Freezes the page's smooth scroll for as long as a panel is on screen.
 *
 * IT HAS TO BE A COMPONENT RENDERED INSIDE THE CONTENT, not a hook called in
 * DialogContent's body, and the difference is the whole page.
 *
 * <DialogContent> renders the portal rather than sitting inside one, so React
 * runs its function body whenever its parent renders — including every moment
 * the dialog is CLOSED, when the portal below it returns null. A hook called
 * there would lock the page on mount and never release it, because the effect's
 * cleanup only runs when the whole dialog unmounts. The site would simply stop
 * scrolling, and it would look nothing like a dialog bug.
 *
 * Radix gates DialogPrimitive.Content on `Presence`, so a child of it mounts on
 * open and unmounts on close. Mount and unmount are therefore the exact
 * lifecycle we want, with no `open` prop to thread through and no difference
 * between a controlled and an uncontrolled dialog. Radix keeps the content
 * mounted through the exit animation, so the page stays frozen until the panel
 * has actually gone, which is the behaviour you want anyway.
 *
 * See setPageScrollLocked for why radix's own scroll lock is not sufficient on
 * this site.
 */
function FreezePage() {
  React.useEffect(() => {
    setPageScrollLocked(true);
    return () => setPageScrollLocked(false);
  }, []);
  return null;
}

function DialogContent({
  className,
  children,
  showClose = true,
  closeLabel = "Close",
  ...props
}: React.ComponentProps<typeof DialogPrimitive.Content> & {
  showClose?: boolean;
  closeLabel?: string;
}) {
  return (
    <DialogPortal>
      <DialogOverlay />
      <DialogPrimitive.Content
        data-slot="dialog-content"
        className={cn(
          "fixed top-1/2 left-1/2 z-50 flex -translate-x-1/2 -translate-y-1/2 flex-col overflow-hidden rounded-card bg-cream focus:outline-none",
          "data-[state=open]:animate-[dialog-in_0.45s_cubic-bezier(0.16,1,0.3,1)]",
          "data-[state=closed]:animate-[dialog-out_0.25s_cubic-bezier(0.16,1,0.3,1)]",
          className,
        )}
        {...props}
      >
        <FreezePage />
        {children}
        {showClose ? (
          <DialogPrimitive.Close
            aria-label={closeLabel}
            className="absolute top-5 right-5 grid size-9 cursor-pointer place-items-center rounded-pill text-ink/70 transition-colors duration-200 hover:bg-ink/5 hover:text-ink focus-visible:ring-2 focus-visible:ring-ink/40 focus:outline-none"
          >
            <XIcon size={18} weight="bold" aria-hidden />
          </DialogPrimitive.Close>
        ) : null}
      </DialogPrimitive.Content>
    </DialogPortal>
  );
}

/** Fixed at the top of the panel. Give it the panel's own side padding. */
function DialogHeader({ className, ...props }: React.ComponentProps<"header">) {
  return (
    <header
      data-slot="dialog-header"
      className={cn("flex shrink-0 items-start gap-4", className)}
      {...props}
    />
  );
}

/**
 * The scrolling middle of a panel.
 *
 * `min-h-0` is what makes it scroll at all: a flex child's default `min-height:
 * auto` refuses to shrink below its content, so without it the content pushes
 * the panel taller instead of overflowing, and `overflow-y-auto` never has
 * anything to do.
 *
 * `data-lenis-prevent` is load-bearing on this site. Lenis is easing the real
 * window scroll behind the panel, and without the attribute a wheel event in
 * here is claimed by the page rather than by the thing in front of you. It is
 * Lenis' own opt-out and costs nothing when Lenis is not running.
 *
 * `scrollbar-themed` is the site's scrollbar rather than the operating
 * system's; see globals.css.
 */
function DialogBody({ className, ...props }: React.ComponentProps<"div">) {
  return (
    <div
      data-slot="dialog-body"
      data-lenis-prevent
      className={cn(
        "scrollbar-themed min-h-0 flex-1 overflow-y-auto overscroll-contain",
        className,
      )}
      {...props}
    />
  );
}

function DialogFooter({ className, ...props }: React.ComponentProps<"footer">) {
  return (
    <footer
      data-slot="dialog-footer"
      className={cn("flex shrink-0 items-center gap-3", className)}
      {...props}
    />
  );
}

function DialogTitle({
  className,
  ...props
}: React.ComponentProps<typeof DialogPrimitive.Title>) {
  return (
    <DialogPrimitive.Title
      data-slot="dialog-title"
      className={cn(
        "text-[20px] font-semibold tracking-[-0.01em] text-ink sm:text-[24px]",
        className,
      )}
      {...props}
    />
  );
}

function DialogDescription({
  className,
  ...props
}: React.ComponentProps<typeof DialogPrimitive.Description>) {
  return (
    <DialogPrimitive.Description
      data-slot="dialog-description"
      className={cn(
        "mt-2 max-w-[62ch] text-[14px] leading-6 text-ink-muted sm:text-[15px]",
        className,
      )}
      {...props}
    />
  );
}

export {
  Dialog,
  DialogBody,
  DialogClose,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogOverlay,
  DialogPortal,
  DialogTitle,
  DialogTrigger,
};
