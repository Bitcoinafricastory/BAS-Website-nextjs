'use client';

import Image from 'next/image';
import { ArrowRight, Users, GraduationCap, Briefcase, Globe, Zap, User } from 'lucide-react';
import CountUp from 'react-countup';

const stats = [
  { label: 'Registrations', value: 250, suffix: '+', icon: Users },
  { label: 'Alumni', value: 100, suffix: '+', icon: GraduationCap },
  { label: 'Careers', value: 15, suffix: '+', icon: Briefcase },
  { label: 'Countries', value: 10, suffix: '+', icon: Globe },
  { label: 'Sats Rewarded', value: 150, suffix: 'K', icon: Zap },
  { label: 'Educators', value: 30, suffix: '+', icon: User },
];

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
      <div className="max-w-7xl mx-auto grid grid-cols-1 lg:grid-cols-[1.05fr_0.95fr]">
        {/* Copy column */}
        <div className="order-2 lg:order-1 flex flex-col justify-center px-6 sm:px-10 lg:pl-6 lg:pr-14 py-14 lg:py-20 border-b lg:border-b-0 lg:border-r border-gray-800">
          <span className="font-bold text-[11px] tracking-[0.18em] uppercase text-yellow-500 mb-6">
            Free &middot; Self-paced &middot; Open to all
          </span>

          <h1 className="font-semibold text-white text-[38px] sm:text-[48px] lg:text-[56px] leading-[1.05] tracking-tight mb-6 max-w-xl">
            Learn Bitcoin. <em className="italic text-yellow-500">Free</em>, at your own pace.
          </h1>

          <p className="text-gray-400 text-base sm:text-lg leading-relaxed max-w-md mb-10">
            Practical Bitcoin education built for the African context — from your first wallet to running a circular economy in your community.
          </p>

          <div className="flex flex-wrap items-center gap-6 sm:gap-8">
            <button
              onClick={() => scrollToSection('education-programs')}
              className="inline-flex items-center gap-2 bg-yellow-500 text-black font-bold text-sm sm:text-base px-6 py-4 sm:px-7 hover:brightness-95 transition-all duration-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-yellow-500 focus-visible:ring-offset-2 focus-visible:ring-offset-black"
            >
              Explore Bitcoin Programs
              <ArrowRight size={18} />
            </button>
            <button
              onClick={() => scrollToSection('bitcoin-resources')}
              className="text-sm sm:text-base font-semibold text-gray-200 border-b border-gray-700 pb-1 hover:text-yellow-500 hover:border-yellow-500 transition-colors duration-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-yellow-500 focus-visible:ring-offset-2 focus-visible:ring-offset-black"
            >
              Explore Bitcoin Resources
            </button>
          </div>

          <div className="grid grid-cols-3 gap-x-6 gap-y-6 mt-12 pt-8 border-t border-gray-800 max-w-md">
            {stats.map((stat) => {
              const Icon = stat.icon;
              return (
                <div key={stat.label} className="group">
                  <div className="flex items-center gap-1.5 text-gray-500 mb-1.5 group-hover:text-yellow-500 transition-colors">
                    <Icon size={13} />
                    <span className="text-[9px] uppercase tracking-widest font-bold">{stat.label}</span>
                  </div>
                  <div className="text-lg sm:text-xl font-bold text-white tracking-tight">
                    <CountUp end={stat.value} suffix={stat.suffix} enableScrollSpy scrollSpyOnce />
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Photo column — cropped to bias toward the people, not the ceiling above them;
            height now matches the copy column's real content height instead of stretching taller */}
        <div className="order-1 lg:order-2 relative min-h-[220px] sm:min-h-[300px] lg:min-h-0 self-stretch overflow-hidden">
          <Image
            src="/assets/education.jpg"
            alt="Bitcoin education session"
            fill
            priority
            sizes="(min-width: 1024px) 45vw, 100vw"
            className="object-cover"
            style={{ objectPosition: '50% 75%' }}
          />
          <div className="hidden lg:block absolute inset-0 bg-[linear-gradient(90deg,rgba(0,0,0,0.85)_0%,rgba(0,0,0,0.25)_30%,rgba(0,0,0,0)_60%)]" />
          <div className="lg:hidden absolute inset-0 bg-[linear-gradient(180deg,rgba(0,0,0,0.15)_0%,rgba(0,0,0,0.8)_100%)]" />
        </div>
      </div>
    </section>
  );
}
