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
      {/* ===== MOBILE (< lg): overlay layout — text sits on the image, then a slim
           3-stat strip. Keeps the hero close to one screen so readers reach real
           content fast. Hidden on desktop. ===== */}
      <div className="lg:hidden">
        <div className="relative min-h-[460px] flex">
          <Image
            src="/assets/education.jpg"
            alt="Bitcoin education session"
            fill
            priority
            sizes="100vw"
            className="object-cover"
            style={{ objectPosition: '50% 40%' }}
          />
          {/* Strong bottom-weighted scrim so the white headline stays readable
              over the bright, busy parts of the photo. */}
          <div className="absolute inset-0 bg-[linear-gradient(180deg,rgba(0,0,0,0.55)_0%,rgba(0,0,0,0.72)_40%,rgba(0,0,0,0.97)_100%)]" />
          <div className="relative mt-auto px-6 pb-8 pt-24 w-full">
            <h1 className="font-semibold text-white text-[30px] leading-[1.08] tracking-tight mt-3 mb-4">
              Learn Bitcoin. <em className="italic text-yellow-500">Free</em>, at your own pace.
            </h1>
            <p className="text-gray-300 text-sm leading-relaxed mb-6">
              Practical Bitcoin education built for the African context.
            </p>
            <div className="flex gap-2.5">
              <button
                onClick={() => scrollToSection('education-programs')}
                className="flex-1 inline-flex items-center justify-center gap-1.5 bg-yellow-500 text-black font-medium text-sm px-3 py-3 hover:brightness-95 transition-all duration-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-yellow-500 focus-visible:ring-offset-2 focus-visible:ring-offset-black"
              >
                Programs
                <ArrowRight size={16} />
              </button>
              <button
                onClick={() => scrollToSection('bitcoin-resources')}
                className="flex-1 inline-flex items-center justify-center border border-gray-500 text-white font-medium text-sm px-3 py-3 hover:border-yellow-500 hover:text-yellow-500 transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-yellow-500 focus-visible:ring-offset-2 focus-visible:ring-offset-black"
              >
                Resources
              </button>
            </div>
          </div>
        </div>

        {/* Slim 3-stat strip — the three most meaningful numbers, condensed from
            the full six so the hero doesn't run long on mobile. */}
        <div className="grid grid-cols-3 border-t border-white/[0.08]">
          {[
            { label: 'Learners', value: 250, suffix: '+' },
            { label: 'Alumni', value: 100, suffix: '+' },
            { label: 'Countries', value: 10, suffix: '+' },
          ].map((stat, i) => (
            <div key={stat.label} className={`text-center py-4 px-2 ${i < 2 ? 'border-r border-gray-900' : ''}`}>
              <div className="text-lg font-bold text-white tracking-tight">
                <CountUp end={stat.value} suffix={stat.suffix} enableScrollSpy scrollSpyOnce />
              </div>
              <div className="text-[9px] uppercase tracking-widest font-bold text-gray-500 mt-1">{stat.label}</div>
            </div>
          ))}
        </div>
      </div>

      {/* ===== DESKTOP (lg+): original two-column layout, unchanged ===== */}
      <div className="hidden lg:grid max-w-7xl mx-auto grid-cols-[1.05fr_0.95fr]">
        {/* Copy column */}
        <div className="order-1 flex flex-col justify-center pl-6 pr-14 py-20 border-r border-white/[0.08]">

          <h1 className="font-semibold text-white text-[54px] leading-[1.05] tracking-tight mb-6 max-w-xl">
            Learn Bitcoin. <em className="italic text-yellow-500">Free</em>, at your own pace.
          </h1>

          <p className="text-gray-400 text-lg leading-relaxed max-w-md mb-10">
            Practical Bitcoin education built for the African context — from your first wallet to running a circular economy in your community.
          </p>

          <div className="flex flex-wrap items-center gap-8">
            <button
              onClick={() => scrollToSection('education-programs')}
              className="inline-flex items-center gap-2 bg-yellow-500 text-black font-medium text-sm sm:text-base px-5 py-3 sm:px-7 sm:py-4 hover:brightness-95 transition-all duration-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-yellow-500 focus-visible:ring-offset-2 focus-visible:ring-offset-black"
            >
              Explore Bitcoin Programs
              <ArrowRight size={18} />
            </button>
            <button
              onClick={() => scrollToSection('bitcoin-resources')}
              className="text-base font-medium text-gray-200 border-b border-gray-700 pb-1 hover:text-yellow-500 hover:border-yellow-500 transition-colors duration-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-yellow-500 focus-visible:ring-offset-2 focus-visible:ring-offset-black"
            >
              Explore Bitcoin Resources
            </button>
          </div>

          <div className="grid grid-cols-3 gap-x-6 gap-y-6 mt-12 pt-8 border-t border-white/[0.08] max-w-md">
            {stats.map((stat) => {
              const Icon = stat.icon;
              return (
                <div key={stat.label} className="group">
                  <div className="flex items-center gap-1.5 text-gray-500 mb-1.5 group-hover:text-yellow-500 transition-colors">
                    <Icon size={13} />
                    <span className="text-[9px] uppercase tracking-widest font-bold">{stat.label}</span>
                  </div>
                  <div className="text-xl font-bold text-white tracking-tight">
                    <CountUp end={stat.value} suffix={stat.suffix} enableScrollSpy scrollSpyOnce />
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Photo column */}
        <div className="order-2 relative self-stretch overflow-hidden">
          <Image
            src="/assets/education.jpg"
            alt="Bitcoin education session"
            fill
            priority
            sizes="45vw"
            className="object-cover"
            style={{ objectPosition: '50% 75%' }}
          />
          <div className="absolute inset-0 bg-[linear-gradient(90deg,rgba(0,0,0,0.85)_0%,rgba(0,0,0,0.25)_30%,rgba(0,0,0,0)_60%)]" />
        </div>
      </div>
    </section>
  );
}
