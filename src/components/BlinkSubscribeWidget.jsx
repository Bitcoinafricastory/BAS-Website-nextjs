'use client';

import Script from 'next/script';
import { Zap } from 'lucide-react';

// BlinkSub's own hosted script renders the actual subscribe/paywall UI
// inside a cross-origin iframe — there's no theming hook (only
// data-username), so its internal colors/typography can't be changed from
// here. This now sits inside the parent "paying member" card on the
// subscribe page, so it only needs a light divider + helper line, not its
// own full bordered box — nesting two cards inside each other reads as
// heavier and more boxed-in than a single clear container.
export default function BlinkSubscribeWidget() {
  return (
    <div>
      <div className="flex items-center gap-2.5 pb-4 mb-2 border-b border-white/[0.07]">
        <Zap size={13} className="text-yellow-500 flex-shrink-0" />
        <p className="text-[13px] text-gray-500">
          Paid over Lightning. Cancel anytime from the same page you subscribe on.
        </p>
      </div>
      <div id="blink-sub" data-username="bitcoin_africa_story" />
      <Script src="https://blink-subscriptions.vercel.app/embed.js" strategy="afterInteractive" />
    </div>
  );
}
