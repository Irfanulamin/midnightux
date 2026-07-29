import { createHmac, timingSafeEqual } from "node:crypto";

import { BOOKING_INTENTS, type BookingIntentId } from "@/lib/booking";
import { sendBookingMails } from "@/lib/mail";

/*
 * Cal.com booking webhook.
 *
 * WHY A WEBHOOK, and not a fetch from the dialog when the booker says done.
 *
 * Because the browser is not a witness worth trusting here. The tab can be
 * closed between confirming and the callback firing, the embed is a
 * cross-origin iframe whose completion event we would be taking on faith, and
 * anyone can POST our own endpoint claiming a booking that never existed. The
 * webhook comes from Cal, carries an HMAC we can check, and fires once the
 * booking is actually in the calendar. It is the only signal that means a call
 * exists.
 *
 * The route is deliberately generous about where it looks for each field.
 * Cal's payload shape has moved between versions (the Meet URL has lived in
 * three different places, and the notes field in two), and a booking is worth
 * far too much to drop because one key was renamed upstream. Every extractor
 * below falls through a list of known locations and gives up gracefully.
 */

/** Node, not Edge: nodemailer opens a TCP socket, which Edge cannot do. */
export const runtime = "nodejs";

/* A webhook must never be answered from a cache. */
export const dynamic = "force-dynamic";

type Json = Record<string, unknown>;

function obj(value: unknown): Json | undefined {
  return typeof value === "object" && value !== null && !Array.isArray(value)
    ? (value as Json)
    : undefined;
}

function str(value: unknown): string | undefined {
  return typeof value === "string" && value.trim() ? value.trim() : undefined;
}

/** Walks a dotted path, returning undefined the moment the path breaks. */
function dig(root: Json | undefined, path: string): unknown {
  let node: unknown = root;
  for (const key of path.split(".")) {
    const current = obj(node);
    if (!current) return undefined;
    node = current[key];
  }
  return node;
}

/** First path that yields a non-empty string. */
function firstString(root: Json | undefined, paths: string[]): string | undefined {
  for (const path of paths) {
    const found = str(dig(root, path));
    if (found) return found;
  }
  return undefined;
}

/**
 * Constant-time signature check.
 *
 * `timingSafeEqual` throws when the two buffers differ in length, so the length
 * is compared first. That check is not itself constant-time, but it only leaks
 * the length of a hex digest that is always 64 characters, which is public.
 */
function isSignatureValid(rawBody: string, signature: string, secret: string) {
  const expected = createHmac("sha256", secret).update(rawBody).digest("hex");
  const received = signature.trim().toLowerCase();
  if (received.length !== expected.length) return false;
  return timingSafeEqual(Buffer.from(expected), Buffer.from(received));
}

export async function POST(request: Request) {
  const secret = process.env.CAL_WEBHOOK_SECRET;

  /*
   * The raw text, before any parsing. The HMAC is over the exact bytes Cal
   * signed, and JSON.parse followed by JSON.stringify does not reproduce them:
   * key order, whitespace and unicode escaping all move. Parsing the body first
   * and re-serialising it to verify is the single most common way this check is
   * got wrong, and it fails closed, so it looks like a config problem forever.
   */
  const rawBody = await request.text();

  if (!secret) {
    /*
     * Refuse rather than trust. An unsigned endpoint that sends mail on request
     * is an open relay for anyone who finds the URL, and the failure of a
     * missing secret has to be loud in the logs, not silent in the inbox.
     */
    console.error(
      "[cal-webhook] CAL_WEBHOOK_SECRET is not set, so the request was rejected.",
    );
    return Response.json({ error: "Webhook not configured" }, { status: 500 });
  }

  const signature = request.headers.get("x-cal-signature-256");
  if (!signature || !isSignatureValid(rawBody, signature, secret)) {
    return Response.json({ error: "Invalid signature" }, { status: 401 });
  }

  let body: Json | undefined;
  try {
    body = obj(JSON.parse(rawBody));
  } catch {
    return Response.json({ error: "Malformed JSON" }, { status: 400 });
  }

  const triggerEvent = str(body?.triggerEvent);
  const payload = obj(body?.payload);
  if (!payload) {
    return Response.json({ error: "Missing payload" }, { status: 400 });
  }

  /*
   * Only the two events that mean "there is a call, at this time".
   * Cancellations and payment events are acknowledged with a 200 and ignored:
   * returning an error would make Cal retry a delivery we are choosing not to
   * act on, and its retry schedule is not gentle.
   */
  if (triggerEvent !== "BOOKING_CREATED" && triggerEvent !== "BOOKING_RESCHEDULED") {
    return Response.json({ ok: true, ignored: triggerEvent ?? "unknown" });
  }

  const attendees = Array.isArray(payload.attendees) ? payload.attendees : [];
  const attendee = obj(attendees[0]);

  const email = firstString(payload, [
    "responses.email.value",
    "attendees.0.email",
  ]) ?? str(attendee?.email);

  if (!email) {
    // Nothing useful can be done without somewhere to write to.
    console.error("[cal-webhook] booking had no attendee email:", payload.uid);
    return Response.json({ ok: true, skipped: "no attendee email" });
  }

  const name =
    firstString(payload, ["responses.name.value", "attendees.0.name"]) ??
    str(attendee?.name) ??
    "there";

  /*
   * The intent id we planted as `metadata[intent]` in the embed prefill. When
   * it survives the round trip we get the exact CTA that was pressed; when it
   * does not (someone booked from the Cal page directly, or the key was
   * dropped), the event title is a reasonable second best and "General enquiry"
   * is the floor.
   */
  const intentId = str(dig(payload, "metadata.intent")) as
    | BookingIntentId
    | undefined;
  const subject =
    intentId && intentId in BOOKING_INTENTS
      ? BOOKING_INTENTS[intentId].subject
      : (str(payload.title) ?? BOOKING_INTENTS.general.subject);

  const meetUrl = firstString(payload, [
    "metadata.videoCallUrl",
    "videoCallData.url",
    "responses.location.value.value",
    "location",
  ]);

  const startTime = str(payload.startTime) ?? new Date().toISOString();

  const result = await sendBookingMails({
    name,
    email,
    subject,
    startTime,
    endTime: str(payload.endTime),
    attendeeTimeZone:
      firstString(payload, ["attendees.0.timeZone"]) ?? str(attendee?.timeZone),
    // A Meet URL only counts if it is one. Cal writes the string
    // "integrations:daily" or similar into the same field for other providers.
    meetUrl: meetUrl?.startsWith("http") ? meetUrl : undefined,
    notes: firstString(payload, [
      "responses.notes.value",
      "additionalNotes",
      "description",
    ]),
    uid: str(payload.uid),
  });

  /*
   * 200 even when a send failed, because a retry cannot help: the booking is
   * already made, and Cal replaying this delivery would re-send whichever of
   * the two mails DID work. The failure is in the response body and the server
   * log, which is where it can be acted on.
   */
  return Response.json({ ok: true, event: triggerEvent, mail: result });
}
