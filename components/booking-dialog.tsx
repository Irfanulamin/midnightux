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
import { Dialog, Slot } from "radix-ui";
import Cal, { getCalApi } from "@calcom/embed-react";
import { AnimatePresence, motion, useReducedMotion } from "motion/react";
import {
  ArrowLeftIcon,
  ArrowRightIcon,
  CheckCircleIcon,
  XIcon,
} from "@phosphor-icons/react/ssr";

import { Button, ButtonLabel } from "@/components/ui/button";
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
      notes: message.trim()
        ? `${intent.subject}\n\n${message.trim()}`
        : intent.subject,
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
        hideEventTypeDetails: false,
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

      <Dialog.Root open={open} onOpenChange={setOpen}>
        <Dialog.Portal>
          <Dialog.Overlay
            data-slot="dialog-overlay"
            className="fixed inset-0 z-50 bg-ink/60 backdrop-blur-[2px] data-[state=closed]:animate-[sheet-fade-out_0.3s_cubic-bezier(0.16,1,0.3,1)] data-[state=open]:animate-[sheet-fade-in_0.4s_cubic-bezier(0.16,1,0.3,1)]"
          />

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
          <Dialog.Content
            data-slot="dialog-content"
            aria-describedby={`${fieldId}-blurb`}
            className="fixed top-1/2 left-1/2 z-50 flex h-[min(90dvh,760px)] w-[min(94vw,900px)] -translate-x-1/2 -translate-y-1/2 flex-col overflow-hidden rounded-card bg-cream focus:outline-none data-[state=closed]:animate-[dialog-out_0.25s_cubic-bezier(0.16,1,0.3,1)] data-[state=open]:animate-[dialog-in_0.45s_cubic-bezier(0.16,1,0.3,1)]"
          >
            <header className="flex shrink-0 items-start gap-4 px-6 pt-5 pb-4 sm:px-8 sm:pt-6">
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
                <Dialog.Title className="text-[20px] font-semibold tracking-[-0.01em] text-ink sm:text-[24px]">
                  {step === 1 ? intent.title : "Pick a time that suits you"}
                </Dialog.Title>
                <p
                  id={`${fieldId}-blurb`}
                  className="mt-2 max-w-[62ch] text-[14px] leading-6 text-ink-muted sm:text-[15px]"
                >
                  {step === 1
                    ? intent.blurb
                    : `Times are shown in your own timezone. You will get a Google Meet link by email the moment you confirm, ${name.trim().split(" ")[0]}.`}
                </p>
              </div>

              <Dialog.Close
                aria-label="Close booking"
                className="ml-auto grid size-9 shrink-0 cursor-pointer place-items-center rounded-pill text-ink/70 transition-colors duration-200 hover:bg-ink/5 hover:text-ink focus-visible:ring-2 focus-visible:ring-ink/40 focus:outline-none"
              >
                <XIcon size={18} weight="bold" />
              </Dialog.Close>
            </header>

            {/*
              `data-lenis-prevent` for the same reason project-dialog.tsx uses
              it: Lenis is easing the window behind this panel, and without the
              attribute a wheel event inside the dialog scrolls the page under
              it instead of the content in front of you.
            */}
            <div
              data-lenis-prevent
              className="min-h-0 flex-1 overflow-y-auto overscroll-contain"
            >
              <AnimatePresence mode="wait" initial={false}>
                {step === 1 ? (
                  <motion.div
                    key="details"
                    {...stepMotion}
                    className="grid h-full gap-8 px-6 pb-6 sm:px-8 sm:pb-8 md:grid-cols-[1fr_minmax(0,340px)] md:gap-10"
                  >
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
                      className="order-1 flex flex-col justify-center gap-5 md:order-2"
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
                          placeholder="Jordan Ellis"
                          className={inputClass(showErrors && !!nameError)}
                        />
                      </Field>

                      <Field
                        id={`${fieldId}-email`}
                        label="Email"
                        error={showErrors ? emailError : ""}
                      >
                        <input
                          id={`${fieldId}-email`}
                          name="email"
                          type="email"
                          inputMode="email"
                          autoComplete="email"
                          value={email}
                          onChange={(event) => setEmail(event.target.value)}
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

                      <Button type="submit" size="block" className="group mt-1">
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
                    className="h-full min-h-[520px] px-2 pb-4 sm:px-4 sm:pb-6"
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
            </div>
          </Dialog.Content>
        </Dialog.Portal>
      </Dialog.Root>
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
  optional,
  children,
}: {
  id: string;
  label: string;
  error?: string;
  optional?: boolean;
  children: React.ReactNode;
}) {
  return (
    <div>
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
        role="alert" so the message is announced when it appears, and the field
        is described by it rather than merely followed by it.
      */}
      {error ? (
        <p role="alert" className="mt-2 text-[13px] text-coral">
          {error}
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
