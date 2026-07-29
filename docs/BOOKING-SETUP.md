# Booking setup

Everything the CTAs need in order to put a real Google Meet in a real calendar
and email two people about it. Nothing here costs money.

The whole flow, end to end:

```
CTA pressed  ->  dialog step 1 (name, email, message, in our own design)
             ->  dialog step 2 (Cal.com booker, prefilled, real availability)
             ->  visitor confirms
                   |
                   +-- Cal + Google Calendar send the invite with the Meet link
                   |     to the visitor, to you, and to anyone on the guest list
                   |
                   +-- Cal POSTs /api/cal/webhook
                         -> branded confirmation to the visitor
                         -> lead email to OWNER_EMAIL and CEO_EMAIL
```

Cal.com is [AGPL open source](https://github.com/calcom/cal.com). This uses
their free hosted plan, and because it is open source you can move the same
setup onto your own server later without touching this codebase: only
`NEXT_PUBLIC_CAL_LINK` would change.

---

## What is actually required

**Two values.** Everything else is optional or has a working default.

| # | Value | Where it comes from | Goes in |
|---|-------|--------------------|---------|
| 1 | Cal.com username + event slug | Step 1 below | `NEXT_PUBLIC_CAL_LINK` |
| 2 | Which Google account owns the calendar | Yours | Connected in step 2 |

That is the whole booking flow. Cal.com and Google do all the sending between
them: Cal emails the visitor a confirmation, Google emails every attendee the
invite with the Meet link.

Optional on top of that:

| Value | What it adds | Goes in |
|---|---|---|
| A second attendee's email | Puts them on every calendar invite | `NEXT_PUBLIC_CAL_GUESTS` |
| Webhook secret, Gmail app password, recipient addresses | Branded copies of those emails in the site's own type, plus a lead notification carrying what the visitor wrote, plus an .ics invite for the second attendee sent server-side | Part C |

Until step 1 exists the site still builds and runs. The dialog opens, the form
validates, and step 2 shows Cal's "event type not found".

---

## Step 1 — Create the Cal.com account and event type

1. Sign up at [cal.com](https://cal.com) (free plan).
2. Pick your username during onboarding. Whatever you choose becomes the first
   half of `NEXT_PUBLIC_CAL_LINK`.
3. **Event Types -> New**. Title it something the visitor will recognise on the
   confirmation, e.g. *Free Consultation*. Set the duration to **30 minutes**,
   which is what the site's copy promises in `process.tsx` and the FAQ.
4. Note the URL slug it generates (e.g. `30min`, or `free-consultation`).

`NEXT_PUBLIC_CAL_LINK` is now `username/slug`, for example
`midnight-surface/free-consultation`.

> **Availability** is set under **Availability** in the sidebar. Cal shows only
> hours you mark as free, converted into whatever timezone the visitor is
> browsing from. This is the part you are getting for free that would otherwise
> be a week of work.

## Step 2 — Connect Google Calendar, so the Meet link is generated

1. **Apps -> Google Calendar -> Install**, and authorise the Google account
   that should own these meetings.
2. **Apps -> Google Meet -> Install**. Meet only appears as an option once
   Google Calendar is connected, because it hangs off that same grant.
3. Open your event type -> **Location** -> choose **Google Meet**.

From here every confirmed booking creates a Google Calendar event with a Meet
link, and Google emails the invite to everyone on it. That invite is the
delivery path that actually matters; our own email is the branded layer on top.

## Step 3 — Add the CEO to every invite

So both of you are on the calendar event itself, not just in the lead email.

Set `NEXT_PUBLIC_CAL_GUESTS` to their address. They are then copied onto every
booking as a guest, so Google emails them the invite and it lands on their
calendar.

Check **Advanced -> Add guests** is toggled ON on the event type, or the
prefill has no field to fill and the guest is silently dropped.

Two things to know:

- **`NEXT_PUBLIC_` ships the address in the browser bundle**, where anyone
  viewing source can read it. The only ways to avoid that are Cal's paid Teams
  plan, or Part C, which sends the same person an `.ics` invite from the server
  with their address never leaving it.
- **This invites, it does not schedule.** Cal is still only checking one
  person's availability, so a visitor can book a slot when the guest is busy,
  and the guest can decline. The only thing that closes that gap is Cal's
  **collective scheduling**, which shows only times everyone is free, and that
  is a paid Teams feature (roughly $12 to $15 per user per month). The free
  plan is single user.

## Step 4 — Point the webhook at this site

1. Generate a secret:
   ```bash
   openssl rand -hex 32
   ```
   (On Windows PowerShell: `-join ((1..32) | % { '{0:x2}' -f (Get-Random -Max 256) })`)
2. In Cal: **Settings -> Developer -> Webhooks -> New**.
3. **Subscriber URL**: `https://your-domain.com/api/cal/webhook`
4. **Event triggers**: tick **Booking Created** and **Booking Rescheduled**.
   The route ignores everything else with a 200.
5. **Secret**: paste the string from step 1, and put the same string in
   `CAL_WEBHOOK_SECRET`.

The route verifies an HMAC-SHA256 of the raw request body against the
`x-cal-signature-256` header. A wrong or missing secret returns 401 and sends
nothing, which is deliberate: an unsigned endpoint that sends mail on request
is an open relay for whoever finds the URL.

> **Testing locally**: Cal cannot reach `localhost`. Run
> `npx untun@latest tunnel http://localhost:3000` or `ngrok http 3000` and use
> the public URL it prints as the subscriber URL while you test.

## Step 5 — Gmail app password, for the branded emails

An app password, **not** your Google password. It only works with 2FA on.

1. Turn on 2-Step Verification: <https://myaccount.google.com/signinoptions/two-step-verification>
2. Go to <https://myaccount.google.com/apppasswords>
3. Create one named "Midnight Surface site". Google shows 16 characters in four
   groups. Copy it (spaces are fine to include or strip, both work).
4. Put it in `SMTP_PASS`, and the matching Gmail address in `SMTP_USER`.

Free Gmail sends roughly 500 recipients a day, which is far beyond what a
booking form produces. Mail from a `gmail.com` address does land in Promotions
more often than mail from a verified domain, so if you later buy a domain,
switching to Resend or SES means changing only the transport in `lib/mail.ts`.

## Step 6 — Write the env file

```bash
cp .env.example .env.local
```

Fill it in, then restart the dev server. `NEXT_PUBLIC_*` variables are baked in
at build time, so a running server will not pick them up.

On your host (Vercel, Netlify, wherever), add the same variables to the project
settings and redeploy. `.env.local` is gitignored and never ships.

---

## Verifying it works

1. `pnpm dev`, open the site, press **Get a Free Consultation** in the header.
2. Fill in a name and a real email you can check, press **Choose a time**.
3. The Cal booker should appear with those fields already filled and your
   availability showing. Book the earliest slot.
4. Expect, with only Part A and B set up:
   - Cal's confirmation to the visitor
   - Google Calendar invite to the visitor, to you, and to anyone in
     `NEXT_PUBLIC_CAL_GUESTS`, each carrying the Meet link

   And with Part C set up as well, three more:
   - our branded confirmation to the visitor
   - our lead notification to `OWNER_EMAIL`
   - our lead notification to `CEO_EMAIL`, this one carrying an `.ics` invite

   The last two are separate sends on purpose. The owner is the Cal host, so
   Google already put the event on their calendar; attaching our invite too
   would create a second entry beside it. The CEO is the one Cal never invited.

5. Cal's **Settings -> Developer -> Webhooks** page logs each delivery and its
   response. A 200 with `{"mail":{"visitor":"sent","owner":"sent","ceo":"sent"}}`
   is the success case. `"skipped"` means the matching address is unset, which
   is not an error.

### If the branded emails do not arrive

The server log names the failure directly.

| Log line | Cause |
|---|---|
| `SMTP_USER / SMTP_PASS are not set` | Step 5 or 6 incomplete. Bookings still work; only our emails are skipped. |
| `Invalid signature` (401) | `CAL_WEBHOOK_SECRET` does not match what Cal has. |
| `CAL_WEBHOOK_SECRET is not set` (500) | Not in the deployed environment. Redeploy after adding it. |
| `Invalid login: 535` | Account password used instead of an app password, or 2FA is off. |
| `booking had no attendee email` | Payload arrived without an attendee. Check the trigger is Booking Created. |

### If the calendar shows but nothing is clickable

That is the Lenis iframe rule. `globals.css` disables pointer events on every
iframe so the smoothed scroll is not swallowed, with an exception scoped to
`[data-booking-embed]`. If the embed is ever moved out of that wrapper, the
calendar renders perfectly and ignores every click.

---

## Which CTA opens what

Defined in `lib/booking.ts`. The intent picks the dialog's heading, the booking
notes, the calendar event context and both email subject lines, so you know
before joining which button was pressed.

| CTA | Intent | Subject on the emails |
|---|---|---|
| Header + mobile menu, *Get a Free Consultation* | `consultation` | Free 30-minute consultation |
| Pricing, *Get Started* under Landing Page | `landing-page` | Landing Page package ($399) |
| Pricing, *Get Started* under Complete Website | `complete-website` | Complete Website package ($699) |
| Pricing, *Request a Custom Quote* | `custom-quote` | Custom solution quote |
| CTA banner, *Contact Us* | `general` | General enquiry |

To add another, add an entry to `BOOKING_INTENTS` and wrap the button:

```tsx
<BookingTrigger intent="custom-quote">
  <Button>Talk to us</Button>
</BookingTrigger>
```

Give an intent its own `eventType` if it should book a longer slot than the
default 30 minutes.
