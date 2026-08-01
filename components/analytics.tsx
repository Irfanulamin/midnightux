import Script from "next/script";

import { CONSENT_DEFAULT, CONSENT_KEY, GA_ID, hasGoogleTag } from "@/lib/analytics";

/*
 * Google Analytics 4 (the free tier). The paid-ad tags (Google Ads, Meta Pixel)
 * were removed on request.
 *
 * Env-gated: renders nothing unless NEXT_PUBLIC_GA_ID is set, so an empty env
 * loads no third-party script at all. Consent Mode v2 default is pushed BEFORE
 * config() — that ordering is load-bearing: it starts GA in cookieless consent
 * mode instead of setting cookies on the first pageview. `afterInteractive`
 * keeps it off the critical path so it never costs the hero's LCP.
 *
 * THE STORED CHOICE IS READ INSIDE THE DEFAULT CALL, not applied afterwards by
 * the banner. A returning visitor who accepted last time would otherwise have
 * their first pageview measured cookielessly and only the second onwards
 * properly, because <ConsentBanner> mounts after this script has already run
 * config(). Reading localStorage synchronously here costs nothing and makes the
 * first ping correct. It is wrapped in try/catch because Safari's private mode
 * throws on localStorage access rather than returning null, and an exception
 * here would take the whole tag down.
 */
export function Analytics() {
  if (!hasGoogleTag) return null;

  return (
    <>
      <Script
        id="gtag-src"
        src={`https://www.googletagmanager.com/gtag/js?id=${GA_ID}`}
        strategy="afterInteractive"
      />
      <Script id="gtag-init" strategy="afterInteractive">
        {`
          window.dataLayer = window.dataLayer || [];
          function gtag(){dataLayer.push(arguments);}
          window.gtag = gtag;
          var consent = ${JSON.stringify(CONSENT_DEFAULT)};
          try {
            if (localStorage.getItem('${CONSENT_KEY}') === 'granted') {
              consent.analytics_storage = 'granted';
            }
          } catch (e) {}
          gtag('consent', 'default', consent);
          gtag('js', new Date());
          gtag('config', '${GA_ID}');
        `}
      </Script>
    </>
  );
}
