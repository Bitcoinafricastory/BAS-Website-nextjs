'use client';

import Link from 'next/link';
import Image from 'next/image';
import { ArrowRight } from 'lucide-react';
import CountUp from 'react-countup';
import { motion } from 'framer-motion';

const stats = [
  { value: 41, suffix: '+', label: 'Stories Published' },
  { value: 500, suffix: '+', label: 'People Taught' },
  { value: 50, suffix: '+', label: 'Communities' },
  { value: 2, suffix: '+', label: 'Years On The Ground' },
];

const fadeUp = {
  hidden: { opacity: 0, y: 16 },
  show: (i = 0) => ({
    opacity: 1,
    y: 0,
    transition: { duration: 0.55, delay: 0.08 * i, ease: [0.22, 1, 0.36, 1] },
  }),
};

export default function Hero() {
  return (
    <section id="hero" className="relative bg-black">
      {/* ===== MOBILE / TABLET (< lg): lean, text-first hero. No full-bleed
           photo or stat block — just the headline, a short line of copy, and
           two calm CTAs, with a soft animated entrance. ===== */}
      <div className="lg:hidden relative overflow-hidden px-6 pt-16 pb-12">
        {/* Subtle ambient glow instead of a heavy hero photo — keeps the
            section light while still feeling designed, not empty. */}
        <div className="pointer-events-none absolute -top-24 -right-24 w-64 h-64 bg-yellow-500/10 rounded-full blur-3xl" />
        <div className="pointer-events-none absolute -bottom-16 -left-16 w-56 h-56 bg-yellow-500/5 rounded-full blur-3xl" />

        <motion.span
          initial="hidden"
          animate="show"
          custom={0}
          variants={fadeUp}
          className="relative block font-medium text-[11px] tracking-[0.18em] uppercase text-yellow-500 mb-5"
        >
          Reporting from the ground
        </motion.span>

        <motion.h1
          initial="hidden"
          animate="show"
          custom={1}
          variants={fadeUp}
          className="relative font-semibold text-white text-[32px] leading-[1.12] tracking-tight mb-4"
        >
          Showing Africa&rsquo;s Bitcoin{' '}
          <em className="italic text-yellow-500">proof&#8209;of&#8209;work.</em>
        </motion.h1>

        <motion.p
          initial="hidden"
          animate="show"
          custom={2}
          variants={fadeUp}
          className="relative text-gray-400 text-[15px] leading-relaxed mb-8 max-w-sm"
        >
          An independent media and education platform driving Bitcoin adoption across Africa.
        </motion.p>

        <motion.div
          initial="hidden"
          animate="show"
          custom={3}
          variants={fadeUp}
          className="relative flex items-center gap-5"
        >
          <Link
            href="/news"
            className="inline-flex items-center gap-2 bg-yellow-500 text-black font-medium text-sm px-5 py-3 hover:brightness-95 transition-all duration-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-yellow-500 focus-visible:ring-offset-2 focus-visible:ring-offset-black"
          >
            Read the Stories
            <ArrowRight size={16} />
          </Link>
          <Link
            href="/education"
            className="text-sm font-medium text-gray-300 border-b border-gray-700 pb-1 hover:text-yellow-500 hover:border-yellow-500 transition-colors duration-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-yellow-500 focus-visible:ring-offset-2 focus-visible:ring-offset-black"
          >
            Study Bitcoin
          </Link>
        </motion.div>
      </div>

      {/* ===== DESKTOP (lg+): original two-column photo + stats layout, unchanged ===== */}
      <div className="hidden lg:grid max-w-7xl mx-auto grid-cols-[1.05fr_0.95fr] lg:min-h-[78vh]">
        {/* Copy column */}
        <div className="order-1 flex flex-col justify-center pl-6 pr-14 py-20 border-r border-white/[0.08]">
          <span className="font-semibold text-[11px] tracking-[0.18em] uppercase text-yellow-500 mb-6">
            Est. 2024 &middot; Reporting from the ground
          </span>

          <h1 className="font-semibold text-white text-[62px] leading-[1.05] tracking-tight mb-6 max-w-xl">
            Showing Africa&rsquo;s Bitcoin{' '}
            <em className="italic text-yellow-500">proof&#8209;of&#8209;work.</em>
          </h1>

          <p className="text-gray-400 text-lg leading-relaxed max-w-md mb-10">
            An independent media and education platform driving Bitcoin adoption across Africa through education, community building, and real stories from the people living it.
          </p>

          <div className="flex flex-wrap items-center gap-8">
            <Link
              href="/news"
              className="inline-flex items-center gap-2 bg-yellow-500 text-black font-medium text-base px-7 py-4 hover:brightness-95 transition-all duration-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-yellow-500 focus-visible:ring-offset-2 focus-visible:ring-offset-black"
            >
              Read the Stories
              <ArrowRight size={18} />
            </Link>
            <Link
              href="/education"
              className="text-base font-medium text-gray-200 border-b border-gray-700 pb-1 hover:text-yellow-500 hover:border-yellow-500 transition-colors duration-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-yellow-500 focus-visible:ring-offset-2 focus-visible:ring-offset-black"
            >
              Study Bitcoin
            </Link>
          </div>
        </div>

        {/* Photo column — stats overlaid on a dark scrim at the bottom of the image */}
        <div className="order-2 relative overflow-hidden">
          <Image
            src="/assets/dontebg.jpg"
            alt="Bitcoin Africa Story community meetup"
            fill
            priority
            sizes="45vw"
            className="object-cover"
          />
          <div className="absolute inset-0 bg-[linear-gradient(90deg,rgba(0,0,0,0.85)_0%,rgba(0,0,0,0.25)_30%,rgba(0,0,0,0)_60%)]" />
          <div className="absolute inset-x-0 bottom-0 h-2/3 bg-gradient-to-t from-black via-black/70 to-transparent" />

          <div className="absolute bottom-0 left-0 right-0 grid grid-cols-2 gap-x-6 gap-y-5 px-8 py-8">
            {stats.map((stat) => (
              <div key={stat.label}>
                <div className="font-semibold text-white text-[26px] leading-none flex items-baseline gap-0.5">
                  <CountUp end={stat.value} duration={2} enableScrollSpy scrollSpyOnce />
                  <span className="text-yellow-500 text-base">{stat.suffix}</span>
                </div>
                <div className="font-medium text-[10px] tracking-[0.14em] uppercase text-gray-300 mt-1.5">
                  {stat.label}
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
