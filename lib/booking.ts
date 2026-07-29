/*
 * What each CTA is actually asking for.
 *
 * Every call-to-action on the page opens the same dialog, but they are not the
 * same conversation: "Get Started" under the $699 card is a decision, "Get a
 * Free Consultation" in the header is a first hello, and "Request a Custom
 * Quote" is neither. The button that was pressed is the single most useful
 * thing we know about a lead, and it is free information, so it is carried the
 * whole way through: into the dialog's own heading, into the booking's notes
 * field, into the calendar event title, and into the subject line of both
 * emails. Nobody has to ask "which page were you on?" in the first minute of
 * the call.
 *
 * This module is plain data with no imports, so server sections can read it to
 * label a trigger without pulling the client dialog into their bundle.
 */

export type BookingIntentId =
  | "consultation"
  | "landing-page"
  | "complete-website"
  | "custom-quote"
  | "general";

export type BookingIntent = {
  id: BookingIntentId;
  /**
   * The one-line summary of what this lead wants. Goes into the Cal booking
   * notes and both email subject lines, so it is written to read as a sentence
   * fragment after "Booking: ", not as a UI label.
   */
  subject: string;
  /** The dialog's own heading. */
  title: string;
  /** The line under it. Sets the expectation for what the call is. */
  blurb: string;
  /**
   * Optional per-intent Cal event type, if you ever want the $699 conversation
   * on a longer slot than the first hello. Falls back to NEXT_PUBLIC_CAL_LINK,
   * which is the normal case: one 30-minute event type for everything.
   */
  eventType?: string;
};

/*
 * The blurbs restate the studio's real policies (free draft, $0 upfront, no
 * commitment, 5-7 day delivery) because this dialog is the last thing a reader
 * sees before giving up their email, and that is exactly where the reassurance
 * has to be. Keep them consistent with faq.tsx and pricing.tsx, and keep them
 * free of em-dashes like the rest of the page.
 */
export const BOOKING_INTENTS: Record<BookingIntentId, BookingIntent> = {
  consultation: {
    id: "consultation",
    subject: "Free 30-minute consultation",
    title: "Book your free consultation",
    blurb:
      "Thirty minutes, no cost and no commitment. Tell us what your business needs and we will tell you what we would build, then send a free draft design before you pay anything.",
  },
  "landing-page": {
    id: "landing-page",
    subject: "Landing Page package ($399)",
    title: "Let's start your landing page",
    blurb:
      "The $399 Landing Page, one time, no monthly fees. We will confirm the details on the call and send a free draft design first, so you decide after you have seen it.",
  },
  "complete-website": {
    id: "complete-website",
    subject: "Complete Website package ($699)",
    title: "Let's start your website",
    blurb:
      "The $699 Complete Website, one time, no monthly fees. Delivery runs 5 to 7 days from approval, and you see a free draft design before you commit to anything.",
  },
  "custom-quote": {
    id: "custom-quote",
    subject: "Custom solution quote",
    title: "Tell us what you need built",
    blurb:
      "Custom features, integrations, dashboards or an unusual workflow. Bring the awkward parts to the call and we will scope it properly and quote it honestly.",
  },
  general: {
    id: "general",
    subject: "General enquiry",
    title: "Let's talk about your project",
    blurb:
      "A short call to work out whether we are a fit. Free draft design, $0 upfront and no commitment to take the service.",
  },
};

export function getBookingIntent(id: BookingIntentId): BookingIntent {
  return BOOKING_INTENTS[id];
}

/**
 * The Cal.com link an intent books against, as `username/event-type`.
 *
 * Read from the environment rather than hard-coded so the same build can point
 * at a personal Cal account in development and the studio's in production, and
 * so nothing has to be recompiled to move the event type.
 */
export function calLinkFor(intent: BookingIntent): string {
  return (
    intent.eventType ??
    process.env.NEXT_PUBLIC_CAL_LINK ??
    "midnight-surface/30min"
  );
}
