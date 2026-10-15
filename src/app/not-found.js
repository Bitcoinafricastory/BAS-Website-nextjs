import Link from 'next/link';

export const metadata = {
  title: 'Page Not Found',
  robots: { index: false, follow: true },
};

// "The missing block": a Bitcoin coin on a chain whose last link has broken,
// next to a block showing 404 with one block missing from the row. The empty
// block pulses gently (disabled for people who prefer reduced motion).
function MissingBlock() {
  return (
    <svg
      viewBox="0 0 240 160"
      className="w-[170px] sm:w-[190px] h-auto mx-auto"
      aria-hidden="true"
      focusable="false"
    >
      {/* Coin */}
      <circle cx="58" cy="70" r="30" fill="#EAB308" />
      <rect x="51" y="50" width="3" height="7" rx="1" fill="#000" />
      <rect x="58" y="50" width="3" height="7" rx="1" fill="#000" />
      <rect x="51" y="83" width="3" height="7" rx="1" fill="#000" />
      <rect x="58" y="83" width="3" height="7" rx="1" fill="#000" />
      <text x="57" y="82" textAnchor="middle" fontSize="31" fontWeight="800" fill="#000">
        B
      </text>

      {/* Chain: one whole link, then a broken one */}
      <rect x="80" y="82" width="22" height="12" rx="6" fill="none" stroke="#EAB308" strokeWidth="3" />
      <path d="M120 82 h6 a6 6 0 0 1 0 12 h-6" fill="none" stroke="#EAB308" strokeWidth="3" strokeLinecap="round" />
      <path
        d="M106 78 l3 -4 M110 80 l4 -2 M106 98 l3 4 M110 96 l4 2"
        stroke="#6B7280"
        strokeWidth="1.6"
        strokeLinecap="round"
      />

      {/* Block */}
      <rect x="132" y="22" width="96" height="116" rx="10" fill="#141414" stroke="rgba(255,255,255,0.12)" />
      <text x="180" y="70" textAnchor="middle" fontSize="30" fontWeight="700" fill="#FFFFFF">
        404
      </text>
      <rect x="142" y="90" width="12" height="12" rx="2" fill="#EAB308" />
      <rect x="158" y="90" width="12" height="12" rx="2" fill="#EAB308" />
      <rect x="174" y="90" width="12" height="12" rx="2" fill="#EAB308" />
      <rect
        x="190.75"
        y="90.75"
        width="10.5"
        height="10.5"
        rx="2"
        fill="none"
        stroke="#EAB308"
        strokeWidth="1.5"
        strokeDasharray="3 2"
        className="motion-safe:animate-pulse"
      />
      <rect x="206" y="90" width="12" height="12" rx="2" fill="rgba(255,255,255,0.14)" />
      <rect x="146" y="116" width="68" height="4" rx="2" fill="rgba(255,255,255,0.08)" />
    </svg>
  );
}

export default function NotFound() {
  return (
    <div className="pt-16 bg-black text-white min-h-[75vh]">
      <div className="w-full max-w-md mx-auto px-6 pt-14 sm:pt-20 pb-20 text-center">
        <MissingBlock />

        <h1 className="mt-6 text-2xl sm:text-[28px] font-medium tracking-tight">Page not found</h1>
        <p className="mt-2 text-gray-400 text-sm sm:text-base leading-relaxed text-balance">
          The link may be broken, or the page has moved.
        </p>

        <div className="mt-6 flex flex-col items-center gap-4">
          <Link
            href="/"
            className="inline-flex items-center justify-center rounded-full border border-yellow-500 px-5 py-2 text-sm font-semibold text-yellow-500 transition-colors hover:bg-yellow-500 hover:text-black"
          >
            Back to home
          </Link>
          <Link
            href="/news"
            className="text-sm font-medium text-gray-300 underline-offset-4 transition-colors hover:text-white hover:underline"
          >
            Read the latest stories
          </Link>
        </div>
      </div>
    </div>
  );
}
