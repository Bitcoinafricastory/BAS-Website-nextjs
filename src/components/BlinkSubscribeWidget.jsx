'use client';

import Script from 'next/script';

// BlinkSub's own hosted script renders the actual subscribe/paywall UI into
// the div below — it's self-contained, so this component just needs to get
// both pieces onto the page correctly. `next/script` (rather than a plain
// <script> tag) is what makes that safe in Next.js: it dedupes the script if
// this component ever renders twice, and `afterInteractive` loads it once
// the page is already usable rather than blocking the initial render.
export default function BlinkSubscribeWidget() {
  return (
    <>
      <div id="blink-sub" data-username="bitcoin_africa_story" />
      <Script src="https://blink-subscriptions.vercel.app/embed.js" strategy="afterInteractive" />
    </>
  );
}
