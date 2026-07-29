/*
 * Measurement config + helpers (free tier only).
 *
 * Scope is deliberately the no-cost layer: GA4 analytics and utm/click-id
 * attribution. The paid-ad-platform tags (Google Ads conversion, Meta Pixel)
 * were removed on request — add them back only alongside an actual ad account.
 *
 * Everything here is env-gated. With no GA id set, <Analytics> renders nothing
 * and no third-party script loads. Consent defaults to denied (below), so even
 * once an id is set, GA runs cookieless until a consent UI grants storage.
 */

export const GA_ID = process.env.NEXT_PUBLIC_GA_ID ?? "";

export const hasGoogleTag = Boolean(GA_ID);

// Internal CTA routes. A click to a conversion route fires a lead; campaign
// routes get the stored utm/click-id params appended so attribution rides the
// click even though these routes do not exist yet.
//
// NOTE: no CTA points at /contact any more. Every one of them opens the booking
// dialog instead, so the lead event is fired directly by booking-dialog.tsx at
// the moment a name and email are submitted, and the campaign params travel
// with the booking as Cal metadata rather than as query params on a navigation.
// These arrays are kept because they still cover the routes if they are ever
// built, but nothing on the page currently matches them.
export const CONVERSION_ROUTES = ["/contact"];
export const CAMPAIGN_ROUTES = ["/contact", "/work"];

// utm_* plus the ad-platform click ids worth preserving for attribution. (The
// click ids stay useful for GA4 attribution even without the paid tags.)
export const CAMPAIGN_PARAM_KEYS = [
  "utm_source",
  "utm_medium",
  "utm_campaign",
  "utm_term",
  "utm_content",
  "gclid",
  "gbraid",
  "wbraid",
  "fbclid",
  "msclkid",
] as const;

const STORAGE_KEY = "ms_campaign";

type Gtag = (...args: unknown[]) => void;

declare global {
  interface Window {
    dataLayer?: unknown[];
    gtag?: Gtag;
  }
}

/*
 * Consent Mode v2 default: analytics denied until a banner grants it;
 * functionality/security stay granted. This is the privacy-first default — with
 * it, GA runs in cookieless "consent mode" rather than setting cookies on the
 * first pageview. Wire a consent UI to `gtag('consent','update',{...})` to flip
 * `analytics_storage` to granted.
 */
export const CONSENT_DEFAULT = {
  analytics_storage: "denied",
  functionality_storage: "granted",
  security_storage: "granted",
} as const;

// ---- campaign (utm / click-id) capture ----------------------------------

// First-touch capture: store the campaign params from the given query string,
// but only if nothing was captured yet this session, so a later internal
// navigation without params does not wipe the original source.
export function captureCampaign(search: string): void {
  if (typeof window === "undefined") return;
  const params = new URLSearchParams(search);
  const found: Record<string, string> = {};
  for (const key of CAMPAIGN_PARAM_KEYS) {
    const value = params.get(key);
    if (value) found[key] = value;
  }
  if (Object.keys(found).length === 0) return;
  try {
    if (!window.sessionStorage.getItem(STORAGE_KEY)) {
      window.sessionStorage.setItem(STORAGE_KEY, JSON.stringify(found));
    }
  } catch {
    // Private mode / storage disabled — attribution just degrades to none.
  }
}

export function getCampaign(): Record<string, string> {
  if (typeof window === "undefined") return {};
  try {
    const raw = window.sessionStorage.getItem(STORAGE_KEY);
    return raw ? (JSON.parse(raw) as Record<string, string>) : {};
  } catch {
    return {};
  }
}

// Append stored campaign params to an internal href without clobbering any the
// href already carries. Idempotent, so re-decorating a link is a no-op.
export function appendCampaign(href: string): string {
  const campaign = getCampaign();
  const keys = Object.keys(campaign);
  if (keys.length === 0) return href;

  const [pathAndQuery, hash] = href.split("#");
  const [base, query] = pathAndQuery.split("?");
  const params = new URLSearchParams(query);
  for (const key of keys) if (!params.has(key)) params.set(key, campaign[key]);

  const qs = params.toString();
  return `${base}${qs ? `?${qs}` : ""}${hash ? `#${hash}` : ""}`;
}

// ---- events --------------------------------------------------------------

export function gtagEvent(
  name: string,
  params?: Record<string, unknown>,
): void {
  if (typeof window === "undefined" || typeof window.gtag !== "function") return;
  window.gtag("event", name, params ?? {});
}

// Fire a GA4 lead conversion carrying the captured campaign. No-op if GA is not
// present, so it is safe to call unconditionally from the CTA click handler.
export function trackLead(context?: Record<string, unknown>): void {
  const campaign = getCampaign();
  gtagEvent("generate_lead", { ...campaign, ...context });
}
