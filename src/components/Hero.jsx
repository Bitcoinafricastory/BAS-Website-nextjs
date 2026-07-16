'use client';

import Link from 'next/link';
import Image from 'next/image';
import { ArrowRight } from 'lucide-react';
import CountUp from 'react-countup';

const stats = [
  { value: 41, suffix: '+', label: 'Stories Published', sub: 'Original reporting' },
  { value: 500, suffix: '+', label: 'People Taught', sub: 'Free, in person' },
  { value: 50, suffix: '+', label: 'Communities', sub: 'Across the continent' },
  { value: 2, suffix: '+', label: 'Years On The Ground', sub: 'Since 2024' },
];

export default function Hero() {
  return (
    <section id="hero" className="relative bg-black">
      <div className="max-w-7xl mx-auto grid grid-cols-1 lg:grid-cols-[1.05fr_0.95fr] lg:min-h-[78vh]">
        {/* Copy column */}
        <div className="order-2 lg:order-1 flex flex-col justify-center px-6 sm:px-10 lg:pl-6 lg:pr-14 py-14 lg:py-20 border-b lg:border-b-0 lg:border-r border-gray-800">
          <span className="font-bold text-[11px] tracking-[0.18em] uppercase text-[#FAD604] mb-6">
            Est. 2024 &middot; Reporting from the ground
          </span>

          <h1 className="font-semibold text-white text-[38px] sm:text-[50px] lg:text-[62px] leading-[1.05] tracking-tight mb-6 max-w-xl">
            Showing Africa&rsquo;s Bitcoin{' '}
            <em className="italic text-[#FAD604]">proof&#8209;of&#8209;work.</em>
          </h1>

          <p className="text-gray-400 text-base sm:text-lg leading-relaxed max-w-md mb-10">
            Driving Bitcoin adoption across Africa through education, community building, and real stories from the people living it.
          </p>

          <div className="flex flex-wrap items-center gap-6 sm:gap-8">
            <Link
              href="/news"
              className="inline-flex items-center gap-2 bg-[#FAD604] text-black font-bold text-sm sm:text-base px-6 py-4 sm:px-7 hover:brightness-95 transition-all duration-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#FAD604] focus-visible:ring-offset-2 focus-visible:ring-offset-black"
            >
              Read the Stories
              <ArrowRight size={18} />
            </Link>
            <Link
              href="/education"
              className="text-sm sm:text-base font-semibold text-gray-200 border-b border-gray-700 pb-1 hover:text-[#FAD604] hover:border-[#FAD604] transition-colors duration-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#FAD604] focus-visible:ring-offset-2 focus-visible:ring-offset-black"
            >
              Study Bitcoin
            </Link>
          </div>
        </div>

        {/* Photo column — shown bright, unobstructed; darkened only on the edge meeting the copy */}
        <div className="order-1 lg:order-2 relative min-h-[260px] sm:min-h-[340px] lg:min-h-0 overflow-hidden">
          <Image
            src="/assets/dontebg.jpg"
            alt="Bitcoin Africa Story community meetup"
            fill
            priority
            sizes="(min-width: 1024px) 45vw, 100vw"
            className="object-cover"
          />
          {/* desktop: darken left edge only, where it meets the text column */}
          <div className="hidden lg:block absolute inset-0 bg-[linear-gradient(90deg,rgba(0,0,0,0.85)_0%,rgba(0,0,0,0.25)_30%,rgba(0,0,0,0)_60%)]" />
          {/* mobile/tablet: darken bottom edge, where it meets the copy below */}
          <div className="lg:hidden absolute inset-0 bg-[linear-gradient(180deg,rgba(0,0,0,0.15)_0%,rgba(0,0,0,0.8)_100%)]" />
        </div>
      </div>

      {/* Trust bar */}
      <div className="border-t border-gray-800 bg-gradient-to-b from-[#0a0a0a] to-black">
        <div className="max-w-7xl mx-auto grid grid-cols-2 lg:grid-cols-4">
          {stats.map((stat, i) => (
            <div
              key={stat.label}
              className={[
                'px-6 sm:px-8 py-7 border-gray-800',
                i % 2 === 1 ? 'border-l' : '',
                i !== 0 ? 'lg:border-l' : '',
                i >= 2 ? 'border-t lg:border-t-0' : '',
              ].join(' ')}
            >
              <div className="font-bold text-white text-[26px] sm:text-[30px] leading-none flex items-baseline gap-0.5">
                <CountUp end={stat.value} duration={2} enableScrollSpy scrollSpyOnce />
                <span className="text-[#FAD604] text-lg">{stat.suffix}</span>
              </div>
              <div className="font-bold text-[10px] tracking-[0.16em] uppercase text-gray-500 mt-3">
                {stat.label}
              </div>
              <div className="text-[11px] text-gray-600 mt-1">{stat.sub}</div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
