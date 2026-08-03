'use client';

import { useEffect } from 'react';
import Link from 'next/link';
import { ArrowRight, RotateCw } from 'lucide-react';

export default function Error({ error, reset }) {
  useEffect(() => {
    // Surface the error for logging/monitoring without exposing details to users.
    console.error('App error boundary caught:', error);
  }, [error]);

  return (
    <div className="pt-16 bg-black text-white min-h-screen flex items-center">
      <div className="max-w-2xl mx-auto px-6 py-24 w-full">
        <span className="font-bold text-[11px] tracking-[0.18em] uppercase text-yellow-500">
          Something went wrong
        </span>
        <h1 className="text-4xl sm:text-5xl lg:text-[54px] font-semibold leading-[1.05] tracking-tight mt-4 mb-6">
          We hit an <span className="text-yellow-500">unexpected error.</span>
        </h1>
        <p className="text-gray-400 text-base sm:text-lg leading-relaxed max-w-md mb-10">
          Sorry about that. Trying again often clears it. If it keeps happening, head back home
          and we&rsquo;ll get you moving.
        </p>

        <div className="flex flex-col sm:flex-row gap-3">
          <button
            onClick={() => reset()}
            className="inline-flex items-center justify-center gap-2 bg-yellow-500 text-black font-bold text-sm sm:text-base px-6 py-4 hover:brightness-95 transition-all focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-yellow-500 focus-visible:ring-offset-2 focus-visible:ring-offset-black"
          >
            <RotateCw size={16} />
            Try again
          </button>
          <Link
            href="/"
            className="inline-flex items-center justify-center gap-2 border border-gray-700 text-gray-200 font-semibold text-sm sm:text-base px-6 py-4 hover:border-yellow-500 hover:text-yellow-500 transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-yellow-500 focus-visible:ring-offset-2 focus-visible:ring-offset-black"
          >
            Back to Home
            <ArrowRight size={18} />
          </Link>
        </div>
      </div>
    </div>
  );
}
