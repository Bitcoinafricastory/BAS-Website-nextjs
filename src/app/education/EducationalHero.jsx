'use client';

import Image from 'next/image';
import { ArrowRight } from 'lucide-react';

export default function EducationalHero() {
  const scrollToSection = (id) => {
    const element = document.getElementById(id);
    if (element) {
      const offset = 80;
      const bodyRect = document.body.getBoundingClientRect().top;
      const elementRect = element.getBoundingClientRect().top;
      const elementPosition = elementRect - bodyRect;
      const offsetPosition = elementPosition - offset;
      window.scrollTo({ top: offsetPosition, behavior: 'smooth' });
    }
  };

  return (
    <section id="hero" className="relative bg-black">
      <div className="max-w-7xl mx-auto grid grid-cols-1 lg:grid-cols-[1.05fr_0.95fr] lg:min-h-[64vh]">
        {/* Copy column */}
        <div className="order-2 lg:order-1 flex flex-col justify-center px-6 sm:px-10 lg:pl-6 lg:pr-14 py-14 lg:py-20 border-b lg:border-b-0 lg:border-r border-gray-800">
          <span className="font-bold text-[11px] tracking-[0.18em] uppercase text-[#FAD604] mb-6">
            Free &middot; Self-paced &middot; Open to all
          </span>

          <h1 className="font-extrabold text-white text-[38px] sm:text-[48px] lg:text-[56px] leading-[1.05] tracking-tight mb-6 max-w-xl">
            Learn Bitcoin. <em className="italic text-[#FAD604]">Free</em>, at your own pace.
          </h1>

          <p className="text-gray-400 text-base sm:text-lg leading-relaxed max-w-md mb-10">
            Practical Bitcoin education built for the African context — from your first wallet to running a circular economy in your community.
          </p>

          <div className="flex flex-wrap items-center gap-6 sm:gap-8">
            <button
              onClick={() => scrollToSection('education-programs')}
              className="inline-flex items-center gap-2 bg-[#FAD604] text-black font-bold text-sm sm:text-base px-6 py-4 sm:px-7 hover:brightness-95 transition-all duration-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#FAD604] focus-visible:ring-offset-2 focus-visible:ring-offset-black"
            >
              Explore Bitcoin Programs
              <ArrowRight size={18} />
            </button>
            <button
              onClick={() => scrollToSection('bitcoin-resources')}
              className="text-sm sm:text-base font-semibold text-gray-200 border-b border-gray-700 pb-1 hover:text-[#FAD604] hover:border-[#FAD604] transition-colors duration-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#FAD604] focus-visible:ring-offset-2 focus-visible:ring-offset-black"
            >
              Explore Bitcoin Resources
            </button>
          </div>
        </div>

        {/* Photo column — shown bright, unobstructed; darkened only on the edge meeting the copy */}
        <div className="order-1 lg:order-2 relative min-h-[220px] sm:min-h-[300px] lg:min-h-0 overflow-hidden">
          <Image
            src="/assets/education.jpg"
            alt="Bitcoin education session"
            fill
            priority
            sizes="(min-width: 1024px) 45vw, 100vw"
            className="object-cover"
          />
          <div className="hidden lg:block absolute inset-0 bg-[linear-gradient(90deg,rgba(0,0,0,0.85)_0%,rgba(0,0,0,0.25)_30%,rgba(0,0,0,0)_60%)]" />
          <div className="lg:hidden absolute inset-0 bg-[linear-gradient(180deg,rgba(0,0,0,0.15)_0%,rgba(0,0,0,0.8)_100%)]" />
        </div>
      </div>
    </section>
  );
}
