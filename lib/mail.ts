import "server-only";

import nodemailer, { type Transporter } from "nodemailer";

/*
 * Outgoing mail, over plain SMTP.
 *
 * SMTP rather than a transactional email API because the brief was explicitly
 * "no paid": Gmail will send this for nothing with an app password, and the
 * whole integration is then two environment variables and no vendor account.
 * The trade is real and worth stating plainly. Gmail caps a free account at
 * roughly 500 recipients a day, and mail sent from a gmail.com address to a
 * stranger lands in Promotions more often than mail from a verified domain
 * does. At the volume a booking form produces, neither of those bites, and the
 * calendar invite from Cal.com is the delivery path that actually matters: this
 * mail is the branded confirmation on top of it, not the only thing the visitor
 * receives. If deliverability ever does become the problem, swap the transport
 * below for Resend or SES and nothing above this file changes.
 *
 * Nothing in here runs anywhere but the server. `server-only` makes that a
 * build error rather than a code review question, because the module reads
 * credentials.
 */

const BRAND = {
  teal: "#1c5a55",
  cream: "#f2ede1",
  surface: "#fbf9f5",
  ink: "#101010",
  inkMuted: "#6b6b6b",
  yellow: "#ffe273",
} as const;

let cached: Transporter | null = null;

/**
 * The SMTP transport, built once and reused.
 *
 * Returns null rather than throwing when the credentials are absent, so a
 * developer running `pnpm dev` without a .env.local gets a working booking flow
 * and a console warning instead of a 500 from the webhook. The booking itself
 * is Cal.com's job and succeeds either way; only the branded extras go missing.
 */
function getTransport(): Transporter | null {
  if (cached) return cached;

  const user = process.env.SMTP_USER;
  const pass = process.env.SMTP_PASS;
  if (!user || !pass) return null;

  const port = Number(process.env.SMTP_PORT ?? 465);
  cached = nodemailer.createTransport({
    host: process.env.SMTP_HOST ?? "smtp.gmail.com",
    port,
    // 465 is implicit TLS; 587 upgrades with STARTTLS. Deriving it from the
    // port means one less variable to get wrong.
    secure: port === 465,
    auth: { user, pass },
  });

  return cached;
}

export type BookingMailData = {
  name: string;
  email: string;
  /** The human subject from lib/booking.ts, e.g. "Landing Page package ($399)". */
  subject: string;
  /** ISO start time from the Cal webhook. */
  startTime: string;
  endTime?: string;
  /** IANA zone the attendee booked in. Times are rendered in theirs, not ours. */
  attendeeTimeZone?: string;
  /** Google Meet URL, when Cal has minted one by the time the webhook fires. */
  meetUrl?: string;
  /** Everything the visitor typed, as Cal recorded it. */
  notes?: string;
  /** Cal's booking uid, so a reply can be traced back to the booking. */
  uid?: string;
};

/**
 * Formats a booking start in a given timezone.
 *
 * Long weekday and named zone deliberately: a confirmation that says "Tuesday
 * 3 September, 14:30 GMT+1" is checkable at a glance, where an ISO string or a
 * bare "14:30" makes the reader do timezone arithmetic to find out whether they
 * are free.
 */
function formatWhen(iso: string, timeZone?: string): string {
  const date = new Date(iso);
  if (Number.isNaN(date.getTime())) return "Time to be confirmed";

  try {
    return new Intl.DateTimeFormat("en-GB", {
      weekday: "long",
      day: "numeric",
      month: "long",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
      timeZoneName: "short",
      timeZone: timeZone || "UTC",
    }).format(date);
  } catch {
    // An unknown IANA zone from a webhook payload should not cost us the email.
    return new Intl.DateTimeFormat("en-GB", {
      dateStyle: "full",
      timeStyle: "short",
      timeZone: "UTC",
    }).format(date);
  }
}

/** Escapes interpolated values. Everything here originates from a form. */
function esc(value: string): string {
  return value
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;");
}

/*
 * Email HTML is not web HTML.
 *
 * Tables and inline styles, because Outlook still renders through Word and
 * strips most of a stylesheet, and flexbox and grid are simply not available.
 * The page's own colours and a system font stack: the Inter Display files are
 * served by this site and a mail client will not load them, so asking for a
 * webfont here would only produce an inconsistent fallback.
 */
function shell(heading: string, body: string): string {
  return `<!doctype html>
<html lang="en"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"></head>
<body style="margin:0;padding:0;background:${BRAND.surface};">
  <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="background:${BRAND.surface};padding:32px 16px;">
    <tr><td align="center">
      <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="max-width:560px;background:#ffffff;border-radius:24px;overflow:hidden;font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',Roboto,Helvetica,Arial,sans-serif;">
        <tr><td style="background:${BRAND.teal};padding:28px 32px;">
          <p style="margin:0;font-size:13px;letter-spacing:0.08em;text-transform:uppercase;color:rgba(255,255,255,0.7);">Midnight Surface</p>
          <h1 style="margin:8px 0 0;font-size:24px;line-height:1.25;font-weight:700;color:#ffffff;">${esc(heading)}</h1>
        </td></tr>
        <tr><td style="padding:32px;color:${BRAND.ink};font-size:15px;line-height:1.65;">${body}</td></tr>
        <tr><td style="background:${BRAND.cream};padding:20px 32px;color:${BRAND.inkMuted};font-size:13px;line-height:1.6;">
          Midnight Surface, websites for small businesses. Free draft design, $0 upfront, no commitment.
        </td></tr>
      </table>
    </td></tr>
  </table>
</body></html>`;
}

/** A labelled row in the detail block. */
function row(label: string, value: string): string {
  return `<tr>
    <td style="padding:6px 0;color:${BRAND.inkMuted};font-size:14px;width:110px;vertical-align:top;">${esc(label)}</td>
    <td style="padding:6px 0;color:${BRAND.ink};font-size:14px;font-weight:600;">${value}</td>
  </tr>`;
}

function meetButton(url: string): string {
  return `<table role="presentation" cellpadding="0" cellspacing="0" style="margin:24px 0;"><tr>
    <td style="background:${BRAND.yellow};border-radius:9999px;">
      <a href="${esc(url)}" style="display:inline-block;padding:14px 28px;font-size:15px;font-weight:600;color:${BRAND.ink};text-decoration:none;">Join the Google Meet</a>
    </td></tr></table>`;
}

/** What the visitor gets. Reassurance first, logistics second. */
function visitorEmail(data: BookingMailData) {
  const when = formatWhen(data.startTime, data.attendeeTimeZone);
  const firstName = data.name.trim().split(/\s+/)[0] || "there";

  const html = shell(
    "Your call is booked",
    `<p style="margin:0 0 16px;">Hi ${esc(firstName)},</p>
     <p style="margin:0 0 16px;">Thanks for booking. Here are the details, and a calendar invite with the same link is on its way from Google.</p>
     <table role="presentation" cellpadding="0" cellspacing="0" style="width:100%;margin:24px 0;border-top:1px solid rgba(16,16,16,0.1);border-bottom:1px solid rgba(16,16,16,0.1);padding:8px 0;">
       ${row("When", esc(when))}
       ${row("About", esc(data.subject))}
       ${row("Where", "Google Meet, link below")}
     </table>
     ${data.meetUrl ? meetButton(data.meetUrl) : `<p style="margin:0 0 16px;color:${BRAND.inkMuted};">Your Google Meet link is in the calendar invite.</p>`}
     <p style="margin:0 0 16px;">Nothing to prepare. Bring a rough idea of what your business needs and we will talk through what we would build, then send you a free draft design before you pay anything.</p>
     <p style="margin:0;">If that time stops working, just reply to this email and we will move it.</p>`,
  );

  const text = `Hi ${firstName},

Thanks for booking. Here are the details:

When:  ${when}
About: ${data.subject}
Where: Google Meet${data.meetUrl ? `\nLink:  ${data.meetUrl}` : " (link is in your calendar invite)"}

Nothing to prepare. Bring a rough idea of what your business needs and we will talk through what we would build, then send you a free draft design before you pay anything.

If that time stops working, just reply to this email and we will move it.

Midnight Surface`;

  return { subject: `Your call is booked: ${data.subject}`, html, text };
}

/** What the studio gets. Facts, densely, so the call can be prepared for. */
function leadEmail(data: BookingMailData) {
  const ownerZone = process.env.OWNER_TIMEZONE || "UTC";
  const whenOurs = formatWhen(data.startTime, ownerZone);
  const whenTheirs = data.attendeeTimeZone
    ? formatWhen(data.startTime, data.attendeeTimeZone)
    : null;

  const html = shell(
    "New booking",
    `<table role="presentation" cellpadding="0" cellspacing="0" style="width:100%;margin:0 0 24px;">
       ${row("Name", esc(data.name))}
       ${row("Email", `<a href="mailto:${esc(data.email)}" style="color:${BRAND.teal};">${esc(data.email)}</a>`)}
       ${row("Wants", esc(data.subject))}
       ${row("When", esc(whenOurs))}
       ${whenTheirs ? row("Their time", esc(`${whenTheirs} (${data.attendeeTimeZone})`)) : ""}
       ${data.uid ? row("Booking", esc(data.uid)) : ""}
     </table>
     ${
       data.notes
         ? `<p style="margin:0 0 8px;color:${BRAND.inkMuted};font-size:14px;">What they wrote</p>
            <div style="background:${BRAND.cream};border-radius:16px;padding:16px 20px;white-space:pre-wrap;font-size:14px;line-height:1.6;">${esc(data.notes)}</div>`
         : ""
     }
     ${data.meetUrl ? meetButton(data.meetUrl) : ""}`,
  );

  const text = `New booking

Name:  ${data.name}
Email: ${data.email}
Wants: ${data.subject}
When:  ${whenOurs}${whenTheirs ? `\nTheirs: ${whenTheirs} (${data.attendeeTimeZone})` : ""}${data.uid ? `\nUid:   ${data.uid}` : ""}
${data.notes ? `\nWhat they wrote:\n${data.notes}\n` : ""}${data.meetUrl ? `\nMeet: ${data.meetUrl}` : ""}`;

  return { subject: `New booking: ${data.subject} (${data.name})`, html, text };
}

/**
 * Sends both mails: the confirmation to the visitor, the lead to the studio.
 *
 * `allSettled`, not `all`. These are two independent obligations, and the
 * failure mode of `all` is the one that costs money: a bounce on the visitor's
 * address would reject the promise and take the studio's copy down with it, so
 * a real booking would sit in a calendar with nobody told about it.
 *
 * Recipients come from the environment. OWNER_EMAIL and CEO_EMAIL are two
 * separate variables rather than one comma list because they are two different
 * people with two different reasons to be there, and a typo in a list silently
 * drops one of them.
 */
export async function sendBookingMails(data: BookingMailData): Promise<{
  visitor: "sent" | "failed" | "skipped";
  studio: "sent" | "failed" | "skipped";
}> {
  const transport = getTransport();
  if (!transport) {
    console.warn(
      "[mail] SMTP_USER / SMTP_PASS are not set, so no booking emails were sent.",
    );
    return { visitor: "skipped", studio: "skipped" };
  }

  const from =
    process.env.MAIL_FROM || `Midnight Surface <${process.env.SMTP_USER}>`;

  const studioRecipients = [
    process.env.OWNER_EMAIL,
    process.env.CEO_EMAIL,
  ].filter((address): address is string => Boolean(address));

  const visitor = visitorEmail(data);
  const lead = leadEmail(data);

  const [visitorResult, studioResult] = await Promise.allSettled([
    transport.sendMail({
      from,
      to: data.email,
      replyTo: studioRecipients[0] || from,
      subject: visitor.subject,
      html: visitor.html,
      text: visitor.text,
    }),
    studioRecipients.length
      ? transport.sendMail({
          from,
          to: studioRecipients,
          // So hitting reply in the inbox answers the lead, not ourselves.
          replyTo: `${data.name} <${data.email}>`,
          subject: lead.subject,
          html: lead.html,
          text: lead.text,
        })
      : Promise.reject(new Error("OWNER_EMAIL / CEO_EMAIL are not set")),
  ]);

  if (visitorResult.status === "rejected") {
    console.error("[mail] visitor confirmation failed:", visitorResult.reason);
  }
  if (studioResult.status === "rejected") {
    console.error("[mail] studio notification failed:", studioResult.reason);
  }

  return {
    visitor: visitorResult.status === "fulfilled" ? "sent" : "failed",
    studio: studioResult.status === "fulfilled" ? "sent" : "failed",
  };
}
