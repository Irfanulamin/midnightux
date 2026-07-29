"use client";

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useId,
  useMemo,
  useState,
} from "react";
import { Slot } from "radix-ui";
import Cal, { getCalApi } from "@calcom/embed-react";
import { AnimatePresence, motion, useReducedMotion } from "motion/react";
import {
  ArrowLeftIcon,
  ArrowRightIcon,
  CheckCircleIcon,
} from "@phosphor-icons/react/ssr";

import { Button, ButtonLabel } from "@/components/ui/button";
import {
  Dialog,
  DialogBody,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { EASE } from "@/components/ui/motion";
import { getCampaign, gtagEvent, trackLead } from "@/lib/analytics";
import {
  BOOKING_INTENTS,
  calLinkFor,
  type BookingIntentId,
} from "@/lib/booking";

/*
 * Booking, in two steps, in one dialog.
 *
 * A dialog rather than a /contact route, for the same reason project-dialog.tsx
 * is one: this is a single-page site, the CTAs are scattered down 18,000px of
 * it, and sending someone to a route means they lose the scroll position that
 * convinced them to click. Every CTA opens this instead, and the button that
 * was pressed picks the intent (see lib/booking.ts), so the dialog can name
 * what the reader asked for rather than greeting all five CTAs identically.
 *
 * WHY TWO STEPS, when Cal.com's booker already asks for a name and an email.
 *
 * Because the booker asks for them LAST, after the visitor has picked a day and
 * a slot, and because it is an iframe: it is Cal's typography, Cal's spacing and
 * Cal's buttons, on a page where every surface was measured off a Figma export.
 * Opening a CTA straight into somebody else's UI is a visible seam at the exact
 * moment the reader has decided to trust us.
 *
 * So the identity step is ours, in the page's own type and colour, and the
 * calendar step is Cal's, doing the one job that is genuinely hard: real
 * availability, in the visitor's timezone, with a Google Meet link minted on
 * confirmation. What the visitor types in step one is handed to the booker as
 * prefill, so those fields arrive already filled and step two is only ever
 * "pick a time". Two screens, one form's worth of work.
 *
 * The name and email deliberately SURVIVE a close. Somebody who bails at the
 * calendar and comes back through a different CTA should not retype their own
 * address; only the step and the intent reset. See openBooking below.
 */

/**
 * Namespaces the embed so `cal("ui", ...)` reaches this instance and not some
 * future second embed on the page. Cal keys its in-memory store by this.
 */
const CAL_NAMESPACE = "midnight-booking";

/*
 * Guests copied onto the calendar invite, comma-separated.
 *
 * This is the escape hatch, not the recommended route. Anything with
 * NEXT_PUBLIC_ on it is compiled into the client bundle, so an address put here
 * is readable by every scraper that loads the page. The right home for a
 * standing second attendee is the event type in the Cal.com dashboard, which
 * adds them server-side and never ships the address to the browser. Left empty,
 * the CEO still gets the branded lead email from the webhook, which is
 * server-side and safe.
 */
const CAL_GUESTS = (process.env.NEXT_PUBLIC_CAL_GUESTS ?? "")
  .split(",")
  .map((address) => address.trim())
  .filter(Boolean);

type BookingContextValue = {
  openBooking: (intent: BookingIntentId) => void;
};

const BookingContext = createContext<BookingContextValue | null>(null);

/**
 * Opens the booking dialog from anywhere under the provider.
 *
 * Throws rather than no-ops when the provider is missing: a CTA that silently
 * does nothing is the worst possible failure on a page whose entire purpose is
 * getting that click, and it would survive review precisely because it looks
 * fine until someone presses it.
 */
export function useBooking(): BookingContextValue {
  const value = useContext(BookingContext);
  if (!value) {
    throw new Error("useBooking must be used inside <BookingProvider>.");
  }
  return value;
}

/* Deliberately permissive. The mail server is the real validator; this only
 * catches the typo that would otherwise cost us the lead, and a strict RFC
 * pattern rejects valid addresses more often than it catches bad ones. */
const EMAIL_PATTERN = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/;

/*
 * ONE OWNER FOR THE EMAIL POLICY, and it is Cal, not us.
 *
 * A blocklist of throwaway domains lived here briefly and was removed, because
 * duplicating a rule cannot work when the other copy is somebody else's and
 * changes without telling you. Cal rejects addresses it does not like using
 * rules we cannot see; any list here is out of date the moment theirs moves,
 * and it fails in both directions. Too short and it lets through what Cal will
 * refuse, which is the bug it was meant to fix. Too broad and it refuses a
 * booking Cal would have accepted, which is worse, because that is a real lead
 * turned away by us for no reason.
 *
 * So the check below stays what it always was: a typo catcher, nothing more.
 * The reason for the original complaint was never that the block was missing,
 * it was that the visitor found out about it late and in Cal's words. That is
 * answered by telling them what the address is FOR, before they type it (see
 * the hint on the email field), rather than by guessing which addresses Cal
 * will take.
 */

/* The three facts that answer "what am I signing up for", in the order the
 * page makes them. Same claims as faq.tsx and the CTA banner. */
const REASSURANCES = [
  "A free draft design before you pay anything",
  "$0 upfront, and no commitment to take the service",
  "5 to 7 day delivery once you approve the concept",
];

export function BookingProvider({ children }: { children: React.ReactNode }) {
  const [open, setOpen] = useState(false);
  const [intentId, setIntentId] = useState<BookingIntentId>("consultation");
  const [step, setStep] = useState<1 | 2>(1);

  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [message, setMessage] = useState("");
  const [showErrors, setShowErrors] = useState(false);

  const reduce = useReducedMotion();
  const fieldId = useId();

  const openBooking = useCallback((next: BookingIntentId) => {
    /*
     * Reset on OPEN, never on close. Radix animates the panel out over 250ms,
     * and clearing state in onOpenChange(false) plays that whole exit with the
     * form visibly snapped back to step one behind it. Resetting on the way in
     * is invisible, because there is nothing on screen yet to see it happen.
     */
    setIntentId(next);
    setStep(1);
    setShowErrors(false);
    setOpen(true);
    /* Which CTA opened it. No-op when GA is not configured. */
    gtagEvent("booking_open", { intent: next });
  }, []);

  const intent = BOOKING_INTENTS[intentId];

  const nameError = name.trim().length < 2 ? "Please tell us your name." : "";
  const emailError = !EMAIL_PATTERN.test(email.trim())
    ? "Please enter an email we can reach you on."
    : "";

  function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (nameError || emailError) {
      setShowErrors(true);
      return;
    }
    /*
     * The lead event, which used to fire on a click through to /contact.
     *
     * Those links are gone, and with them CampaignTracker's route match, so it
     * has to be fired here or the conversion silently stops being counted. This
     * is the better moment for it anyway: a click on a CTA was only ever intent,
     * where reaching this line means a real name and a real email have been
     * entered. The count goes down and gets truthful.
     */
    trackLead({ intent: intentId, cta_href: "booking-dialog" });
    setStep(2);
  }

  /*
   * What Cal receives.
   *
   * `notes` is the field the host actually reads before joining, so it leads
   * with the intent: by the time the call opens we know whether this was the
   * $699 card or a custom-quote enquiry, without asking. The visitor's own
   * message follows it when there is one.
   *
   * `metadata[intent]` rides along separately because the webhook needs the
   * machine-readable id to pick an email subject, and parsing it back out of a
   * prose notes field would be guesswork.
   *
   * Memoised on the values it reads: this object is a prop on <Cal>, and a
   * fresh identity every render is a fresh config posted into the iframe.
   */
  const calConfig = useMemo(() => {
    /*
     * The utm/click-id set CampaignTracker captured on landing, carried onto
     * the booking. Attribution used to ride the click through to /contact as
     * query params; with the CTAs now opening a dialog there is no navigation
     * to carry it, so it travels as booking metadata instead and lands in the
     * Cal dashboard beside the lead. Compacted to source and campaign because
     * this is a metadata field, not a log.
     */
    const campaign = getCampaign();
    const source = [campaign.utm_source, campaign.utm_campaign]
      .filter(Boolean)
      .join(" / ");

    return {
      name: name.trim(),
      email: email.trim(),
      /*
       * The intent LEADS the notes, ahead of anything the visitor typed.
       *
       * This is the copy that survives no matter how Cal is configured: notes
       * is a built-in field, so it shows on the booking in the dashboard, in
       * Cal's own email to the host, and in the description of the Google
       * Calendar event. Opening the event tells you which button was pressed
       * without anything having been set up.
       */
      notes: message.trim()
        ? `${intent.subject}\n\n${message.trim()}`
        : intent.subject,
      /*
       * NO `package` PREFILL. It was here and it is not coming back without the
       * booking field existing first.
       *
       * The idea was to send the intent as its own labelled booking question so
       * the event type's "Event name in calendar" template could print it, and
       * the reasoning was that Cal discards prefill for a field that does not
       * exist, so it would be inert until the field was created. That is true
       * of RENDERING and not of the rest of the booking: the event type's title
       * field is `hidden: true, required: true`, and it is filled from that name
       * template. Point the template at a variable with nothing behind it and
       * the required title can resolve to empty, which fails validation on
       * submit, after the visitor has chosen a slot and pressed Confirm.
       *
       * The intent still travels in `notes` below, which is a real field on
       * every Cal event type and needs no setup. If the labelled version is
       * wanted, create the hidden `package` question in the dashboard FIRST,
       * then add the prefill and the template together, and book a test slot
       * before trusting it.
       */
      "metadata[intent]": intent.id,
      ...(source ? { "metadata[source]": source } : {}),
      ...(CAL_GUESTS.length ? { guests: CAL_GUESTS } : {}),
      theme: "light" as const,
      layout: "month_view" as const,
    };
  }, [name, email, message, intent]);

  /*
   * Cal's own theming, so the booker is not a white rectangle with a blue
   * button sitting inside a cream dialog. `cal-brand` is the one variable that
   * moves the buttons, the selected day and the slot highlights together, and
   * it is set to the page's teal.
   *
   * Gated on step 2 because getCalApi resolves against a script the embed only
   * injects once it mounts. Called on every entry to step 2 rather than once on
   * mount, since Radix unmounts the closed dialog and takes the embed with it.
   */
  useEffect(() => {
    if (step !== 2) return;
    let cancelled = false;

    (async () => {
      const cal = await getCalApi({ namespace: CAL_NAMESPACE });
      if (cancelled) return;
      cal("ui", {
        cssVarsPerTheme: {
          light: { "cal-brand": "#1c5a55" },
          dark: { "cal-brand": "#1c5a55" },
        },
        /*
         * Cal's own title / duration / description panel is hidden INSIDE THE
         * EMBED ONLY, and the event type still carries all three for the
         * standalone cal.com page.
         *
         * Two reasons. It duplicates: this dialog has already given the reader
         * a heading and a blurb written for the specific button they pressed,
         * so Cal's generic version of the same pitch appears directly beneath a
         * better-targeted one. And it costs width the month view needs, since
         * that panel sits to the left of the calendar inside a panel that is
         * only 900px wide to begin with.
         *
         * Nothing is lost. Anyone arriving at the Cal link directly, rather
         * than through a CTA, gets the full description as normal, which is why
         * it is still worth writing well.
         */
        hideEventTypeDetails: true,
        layout: "month_view",
      });
    })();

    return () => {
      cancelled = true;
    };
  }, [step]);

  const value = useMemo(() => ({ openBooking }), [openBooking]);

  /* Transform and opacity only, and nothing at all under reduced motion. */
  const stepMotion = reduce
    ? {}
    : {
        initial: { opacity: 0, x: 24 },
        animate: { opacity: 1, x: 0 },
        exit: { opacity: 0, x: -24 },
        transition: { duration: 0.35, ease: EASE },
      };

  return (
    <BookingContext.Provider value={value}>
      {children}

      <Dialog open={open} onOpenChange={setOpen}>
          {/*
            ONE SIZE FOR BOTH STEPS, on purpose.

            The obvious build is a narrow panel for two fields that widens for
            the calendar, and it is wrong twice: animating width and height is
            animating layout, which the taste skill bans and which janks against
            an iframe booting inside it, and NOT animating it snaps the panel to
            a new size under a pointer that has not moved. So the box is fixed
            at the size the calendar needs, and step one earns that width with a
            second column instead of leaving it empty.

            dvh rather than vh so the mobile address bar cannot push the close
            button off the top.
          */}
          <DialogContent
            closeLabel="Close booking"
            className="h-[min(90dvh,700px)] w-[min(94vw,900px)]"
          >
            {/*
              pt matches the pb on the step below it (24 / 28 at sm), so the
              panel has the same air above the title as under the last control.
              The pb here is the gap to the content, not an edge, so it is its
              own smaller number. pr-14 is the room the close button needs: it
              is positioned absolutely by <DialogContent>, so it is not in this
              flex row and cannot reserve its own space.
            */}
            <DialogHeader className="px-6 pt-6 pr-14 pb-5 sm:px-8 sm:pt-7 sm:pr-16">
              {/*
                The back arrow occupies its slot only on step two. Rendering it
                conditionally rather than hiding it would shift the title left
                and right between steps.
              */}
              {step === 2 ? (
                <button
                  type="button"
                  onClick={() => setStep(1)}
                  className="-ml-2 grid size-9 shrink-0 cursor-pointer place-items-center rounded-pill text-ink/70 transition-colors duration-200 hover:bg-ink/5 hover:text-ink focus-visible:ring-2 focus-visible:ring-ink/40 focus:outline-none"
                >
                  <ArrowLeftIcon size={18} weight="bold" />
                  <span className="sr-only">Back to your details</span>
                </button>
              ) : null}

              <div className="min-w-0">
                <DialogTitle>
                  {step === 1 ? intent.title : "Pick a time that suits you"}
                </DialogTitle>
                {/*
                  A real <Dialog.Description>, not a styled <p>: radix wires it
                  to the panel's aria-describedby itself, which is one less id
                  to keep in step by hand.
                */}
                <DialogDescription>
                  {step === 1
                    ? intent.blurb
                    : `Times are shown in your own timezone. You will get a Google Meet link by email the moment you confirm, ${name.trim().split(" ")[0]}.`}
                </DialogDescription>
              </div>
            </DialogHeader>

            <DialogBody>
              <AnimatePresence mode="wait" initial={false}>
                {step === 1 ? (
                  <motion.div
                    key="details"
                    {...stepMotion}
                    /*
                      `min-h-full`, never `h-full`, and the difference is the
                      whole bug this replaced.

                      `h-full` pins the box to exactly the scroll container's
                      height, so the bottom padding is drawn at the 100% mark
                      and any content past it spills OUTSIDE the padded box:
                      scroll to the end of a tall form and the last field sits
                      flush against the dialog edge with nothing under it.
                      `min-h-full` makes full height a floor rather than a
                      ceiling, so the box grows with its content and the padding
                      always lands after the last thing in it.

                      It is also what makes `justify-center` safe here. Centring
                      inside a fixed-height box pushes overflow out of BOTH ends
                      and the top becomes unreachable, because a scroll
                      container cannot scroll to negative offsets. With a floor
                      instead of a ceiling there is never spare space to
                      distribute once the content is tall, so the centring
                      quietly becomes a no-op exactly when it would have been
                      harmful, and short content still sits optically centred
                      between the header and the foot.
                    */
                    className="flex min-h-full flex-col justify-center px-6 pb-6 sm:px-8 sm:pb-7"
                  >
                    {/* The grid is a child of the centring flex, not the same
                        element: one box owns the vertical rhythm, the other the
                        two columns, and neither has to compromise for the other. */}
                    <div className="grid gap-8 md:grid-cols-[1fr_minmax(0,340px)] md:gap-10">
                      {/*
                        The column that earns the width. It is not decoration: it
                        restates the offer at the one moment the reader is being
                        asked for their address, which is where the hesitation
                        actually is.
                      */}
                      <div className="order-2 flex flex-col justify-center gap-6 rounded-2xl bg-teal p-6 text-white sm:p-7 md:order-1">
                        <p className="text-[15px] leading-7 text-white/85">
                          What happens on the call
                        </p>
                        <ul className="flex flex-col gap-4">
                          {REASSURANCES.map((item) => (
                            <li key={item} className="flex items-start gap-3">
                              <CheckCircleIcon
                                size={20}
                                weight="fill"
                                aria-hidden
                                className="mt-0.5 shrink-0 text-yellow"
                              />
                              <span className="text-[15px] leading-6 text-white/90">
                                {item}
                              </span>
                            </li>
                          ))}
                        </ul>
                        <p className="border-t border-white/20 pt-5 text-[14px] leading-6 text-white/70">
                          Thirty minutes, and you are under no obligation at the
                          end of it.
                        </p>
                      </div>

                      <form
                        onSubmit={handleSubmit}
                        noValidate
                        /*
                          gap-7, not gap-5: the field errors are absolutely
                          positioned into this gap (see <Field>), so it is
                          carrying a line of text that is not in the flow. At 20
                          it read as cramped the moment a message appeared; 28
                          holds it with air on both sides and looks deliberate
                          when there is no error at all.
                        */
                        className="order-1 flex flex-col justify-center gap-7 md:order-2"
                      >
                        <Field
                          id={`${fieldId}-name`}
                          label="Your name"
                          error={showErrors ? nameError : ""}
                        >
                          <input
                            id={`${fieldId}-name`}
                            name="name"
                            type="text"
                            autoComplete="name"
                            value={name}
                            onChange={(event) => setName(event.target.value)}
                            aria-invalid={showErrors && !!nameError}
                            aria-describedby={
                              showErrors && nameError
                                ? `${fieldId}-name-error`
                                : undefined
                            }
                            placeholder="Jordan Ellis"
                            className={inputClass(showErrors && !!nameError)}
                          />
                        </Field>

                        <Field
                          id={`${fieldId}-email`}
                          label="Email"
                          error={showErrors ? emailError : ""}
                          /*
                            Says what the address is FOR, before it is typed.
                            This is the answer to a visitor getting bounced by
                            Cal's own address check after picking a slot, with
                            no idea why: rather than trying to predict which
                            addresses Cal will refuse, tell them there is
                            something worth receiving at the other end.
                          */
                          hint="We send your free draft design here."
                        >
                          <input
                            id={`${fieldId}-email`}
                            name="email"
                            type="email"
                            inputMode="email"
                            autoComplete="email"
                            value={email}
                            onChange={(event) => setEmail(event.target.value)}
                            aria-invalid={showErrors && !!emailError}
                            aria-describedby={
                              showErrors && emailError
                                ? `${fieldId}-email-error`
                                : undefined
                            }
                            placeholder="jordan@yourbusiness.com"
                            className={inputClass(showErrors && !!emailError)}
                          />
                        </Field>

                        <Field
                          id={`${fieldId}-message`}
                          label="Anything we should know?"
                          optional
                        >
                          <textarea
                            id={`${fieldId}-message`}
                            name="message"
                            rows={3}
                            value={message}
                            onChange={(event) => setMessage(event.target.value)}
                            placeholder="A sentence about your business is plenty."
                            className={`${inputClass(false)} resize-none`}
                          />
                        </Field>

                        <Button
                          type="submit"
                          size="block"
                          className="group mt-1"
                        >
                          <ButtonLabel>Choose a time</ButtonLabel>
                          <ArrowRightIcon
                            size={18}
                            weight="bold"
                            aria-hidden
                            className="transition-transform duration-300 ease-[cubic-bezier(0.16,1,0.3,1)] group-hover:translate-x-0.5"
                          />
                        </Button>

                        <p className="text-[13px] leading-5 text-ink-muted">
                          We use your details for this booking only. No list, no
                          newsletter.
                        </p>
                      </form>
                    </div>
                  </motion.div>
                ) : (
                  <motion.div
                    key="calendar"
                    {...stepMotion}
                    /*
                      `data-booking-embed` is the hook for the pointer-events
                      exception in globals.css. Lenis blanket-disables pointer
                      events on every iframe so the wheel is not swallowed, and
                      without the exception this calendar renders perfectly and
                      refuses every click.
                    */
                    data-booking-embed
                    /*
                      `h-full` is right HERE, unlike on step one: the calendar
                      is an iframe that scrolls its own contents, so it wants to
                      fill the visible box exactly rather than grow past it. The
                      padding matches step one's, so the two steps have the same
                      margins and the panel does not appear to shift.
                    */
                    className="h-full min-h-[520px] px-6 pb-6 sm:px-8 sm:pb-7"
                  >
                    <Cal
                      namespace={CAL_NAMESPACE}
                      calLink={calLinkFor(intent)}
                      config={calConfig}
                      className="h-full w-full overflow-hidden rounded-2xl"
                      style={{ height: "100%", width: "100%" }}
                    />
                  </motion.div>
                )}
              </AnimatePresence>
            </DialogBody>
          </DialogContent>
      </Dialog>
    </BookingContext.Provider>
  );
}

/** Cream-card input styling, in one place so the three fields cannot drift. */
function inputClass(invalid: boolean) {
  return [
    "w-full rounded-2xl border bg-white px-4 py-3 text-[15px] text-ink",
    "placeholder:text-ink-muted/60 transition-colors duration-200",
    "focus:outline-none focus-visible:ring-2 focus-visible:ring-teal/40",
    invalid ? "border-coral" : "border-ink/10 focus-visible:border-teal",
  ].join(" ");
}

function Field({
  id,
  label,
  error,
  hint,
  optional,
  children,
}: {
  id: string;
  label: string;
  error?: string;
  /**
   * Standing note under the field, replaced by `error` when there is one.
   *
   * They share the slot rather than stacking, because both are one line of
   * 13px sitting in the form's gap, and showing them together would push the
   * second into the next label. Swapping is also the better reading: once the
   * field is wrong, what it is for stops being the useful thing to say.
   */
  hint?: string;
  optional?: boolean;
  children: React.ReactNode;
}) {
  /*
    THE ERROR IS TAKEN OUT OF FLOW, so it cannot resize anything.

    In flow it was a row that did not exist until it did. Inside a fixed-height
    dialog that is not a cosmetic problem: two messages appearing at once added
    around 44px, which pushed the submit button below the fold and shifted every
    field the reader was already looking at, at the exact moment they were being
    told they had made a mistake.

    `absolute top-full` hangs the message under the input in the space the form
    gap already provides, so it occupies zero flow height and the panel never
    changes size. The form's `gap-7` is sized for it: 28px holds a 13px line set
    at `leading-snug` plus its 6px offset, with room to spare, so the message
    lands cleanly between two fields rather than against the next label.

    `inset-x-0` rather than a left offset, so a long message wraps within the
    column instead of running out of the panel.
  */
  return (
    <div className="relative">
      <label
        htmlFor={id}
        className="mb-2 flex items-baseline gap-2 text-[14px] font-medium text-ink"
      >
        {label}
        {optional ? (
          <span className="text-[13px] font-normal text-ink-muted">
            Optional
          </span>
        ) : null}
      </label>
      {children}
      {/*
        role="alert" so it is announced the moment it appears rather than
        waiting for focus to arrive; the input points at it with
        aria-describedby, since out of flow it is no longer merely the next
        thing a screen reader would reach.
      */}
      {error ? (
        <p
          id={`${id}-error`}
          role="alert"
          className="absolute inset-x-0 top-full mt-1.5 text-[13px] leading-snug text-coral"
        >
          {error}
        </p>
      ) : hint ? (
        <p className="absolute inset-x-0 top-full mt-1.5 text-[13px] leading-snug text-ink-muted">
          {hint}
        </p>
      ) : null}
    </div>
  );
}

/**
 * The CTA wrapper. Server sections render this around their own button, so a
 * section stays a Server Component and only the trigger crosses the boundary.
 *
 * `asChild` hands the click to whatever is inside, which is what lets the
 * existing <Button> keep its variants, its hover mask and its press physics
 * instead of this component reimplementing them.
 */
export function BookingTrigger({
  intent,
  children,
}: {
  intent: BookingIntentId;
  children: React.ReactNode;
}) {
  const { openBooking } = useBooking();
  /*
   * Slot.Root merges the handler onto the child element itself, the same
   * mechanism <Button asChild> uses. The alternative — a wrapper span carrying
   * the onClick and catching the bubble — puts a click handler on a
   * non-interactive element and leaves the real button with no idea it does
   * anything, which is a keyboard and screen-reader problem, not just a lint
   * one.
   */
  return <Slot.Root onClick={() => openBooking(intent)}>{children}</Slot.Root>;
}
