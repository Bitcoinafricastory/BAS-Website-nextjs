'use client';

import Script from 'next/script';

// BlinkSub's embed renders inside a cross-origin iframe with a hardcoded
// min-height, which can't be reliably overridden from outside (their script
// re-applies the height on every resize message). The practical fix is
// layout, not CSS: give this the full width of its container with nothing
// beside it, so a taller-than-content iframe reads as ordinary trailing
// space rather than an obvious mismatch against a shorter neighbouring
// column.
export default function BlinkSubscribeWidget() {
  return (
    <div>
      <div id="blink-sub" data-username="bitcoin_africa_story" />
      <p className="text-center text-[13px] text-gray-600 mt-4">
        Paid over Lightning. Cancel anytime from the same page you subscribe on.
      </p>
      <Script src="https://blink-subscriptions.vercel.app/embed.js" strategy="afterInteractive" />
    </div>
  );
}
