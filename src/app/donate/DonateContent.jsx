"use client";

import { useState, useEffect, useRef } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { motion, AnimatePresence } from 'framer-motion';
import { ArrowRight, ArrowLeft } from 'lucide-react';
import CountUp from '@/components/ui/CountUp';

const tabs = [
  { id: 'geyser', label: 'Lightning' },
  { id: 'btcpay', label: 'BTCPay' },
  { id: 'info', label: 'QR code' },
];

// The four things contributions fund. Figures come from our published
// transparency report — every number here must match that document.
const buildTracks = (verifiedCount) => [
  {
    n: '01',
    tag: 'Education',
    title: 'Teaching people who go on to build',
    body: 'Seven Bitcoin Diploma cohorts, free to every student, run with My First Bitcoin. Alumni have started careers and launched their own projects across the continent.',
    image: '/assets/education.jpg',
    figs: [
      { v: 100, suffix: '+', k: 'Alumni' },
      { v: 10, suffix: '+', k: 'Careers' },
      { v: 10, suffix: '+', k: 'Projects' },
    ],
  },
  {
    n: '02',
    tag: 'Community',
    title: 'Building places where sats actually move',
    body: 'Bitcoin Ikorodu is a working circular economy — merchants onboarded, sats earned and spent locally. We run the meetups, school sessions, and church events that keep it growing.',
    image: '/assets/bitcoin-ikorodu-kids.png',
    figs: [
      { v: 13, suffix: '', k: 'Events' },
      { v: 4, suffix: '', k: 'Merchants' },
      { v: 350, suffix: '+', k: 'Attended' },
    ],
  },
  {
    n: '03',
    tag: 'Reporting',
    title: 'Bringing Bitcoin in Africa to you',
    body: 'We document the builders, communities, and merchants making Bitcoin work here — reported by people running a circular economy, not observing one.',
    image: '/assets/story.jpg',
    figs: [
      { v: 50, suffix: '+', k: 'Stories' },
      { v: 30, suffix: '+', k: 'Spaces' },
      { label: 'Free', k: 'To read' },
    ],
  },
  {
    n: '04',
    tag: 'Research',
    title: 'Mapping who is actually building',
    body: 'We verify and document the people, projects, and communities driving Bitcoin adoption across Africa — checked by our reporters, not scraped from a database.',
    image: '/assets/research.jpg',
    figs: [
      { v: verifiedCount, suffix: '', k: 'Verified entries' },
      { label: 'Public', k: 'Directory' },
      { label: 'Open', k: 'To all' },
    ],
  },
];

// Real allocation from the published ledger. Replaces the placeholder
// percentages that previously appeared here and did not reconcile with the
// spreadsheet we link to.
const LEDGER = [
  { label: 'Education & training', pct: 31, amount: 659 },
  { label: 'Transport & connectivity', pct: 22, amount: 460 },
  { label: 'Operations & admin', pct: 20, amount: 425 },
  { label: 'Community events', pct: 16, amount: 350 },
  { label: 'Merchant onboarding', pct: 6, amount: 130 },
  { label: 'Platform fees', pct: 5, amount: 101 },
];


const fadeUp = {
  initial: { opacity: 0, y: 22 },
  whileInView: { opacity: 1, y: 0 },
  viewport: { once: true, margin: '-80px' },
  transition: { duration: 0.65, ease: [0.22, 1, 0.36, 1] },
};

function TrackCard({ track, className = '' }) {
  return (
    <article className={`group relative overflow-hidden bg-[#111] flex flex-col justify-end ${className}`}>
      <Image
        src={track.image}
        alt=""
        fill
        sizes="(min-width: 960px) 33vw, 100vw"
        className="object-cover transition-transform duration-700 group-hover:scale-105"
      />
      <div className="absolute inset-0 bg-[linear-gradient(180deg,rgba(0,0,0,0.22)_0%,rgba(0,0,0,0.7)_50%,rgba(0,0,0,0.96)_100%)]" />
      <div className="relative p-7">
        <span className="font-mono-brand text-[10px] tracking-[0.14em] uppercase text-yellow-500">
          {track.n} · {track.tag}
        </span>
        <h3 className="text-xl font-semibold tracking-tight mt-3 mb-2.5 leading-tight">{track.title}</h3>
        <p className="text-[13.5px] text-gray-300 leading-relaxed">{track.body}</p>
        <div className="flex gap-5 mt-5 pt-4 border-t border-white/[0.17]">
          {track.figs.map((f) => (
            <div key={f.k}>
              <div className="font-mono-brand text-[19px] text-yellow-500 leading-none">
                {f.label ? f.label : <CountUp end={f.v} suffix={f.suffix} enableScrollSpy scrollSpyOnce />}
              </div>
              <div className="text-[9px] text-gray-400 mt-1.5 uppercase tracking-[0.08em]">{f.k}</div>
            </div>
          ))}
        </div>
      </div>
    </article>
  );
}

export default function DonateContent({ verifiedCount = 0 }) {
  const TRACKS = buildTracks(verifiedCount);
  const [activeTab, setActiveTab] = useState('geyser');
  const trackRef = useRef(null);
  const [atStart, setAtStart] = useState(true);
  const [atEnd, setAtEnd] = useState(false);

  const syncArrows = () => {
    const el = trackRef.current;
    if (!el) return;
    setAtStart(el.scrollLeft < 4);
    setAtEnd(el.scrollLeft > el.scrollWidth - el.clientWidth - 4);
  };

  useEffect(() => {
    syncArrows();
    window.addEventListener('resize', syncArrows);
    return () => window.removeEventListener('resize', syncArrows);
  }, []);

  const nudge = (dir) => {
    const el = trackRef.current;
    if (!el) return;
    const card = el.firstElementChild;
    el.scrollBy({ left: dir * ((card?.offsetWidth || 320) + 16), behavior: 'smooth' });
  };

  return (
    <div className="pt-16 bg-black text-white">

      {/* ═══ 1 · HERO ═══ */}
      <section className="max-w-[1140px] mx-auto px-6">
        <div className="grid grid-cols-1 lg:grid-cols-[1.04fr_0.96fr] items-stretch">
          <div className="flex flex-col justify-center py-12 lg:py-20 lg:pr-12 order-2 lg:order-1">
            <motion.h1 {...fadeUp} transition={{ ...fadeUp.transition, delay: 0.08 }}
              className="text-[31px] sm:text-4xl lg:text-[50px] font-semibold leading-[1.06] tracking-[-1.6px] mb-5">
              All of this was built on{' '}
              <span className="text-yellow-500">less than most people spend on coffee.</span>
            </motion.h1>
            <motion.p {...fadeUp} transition={{ ...fadeUp.transition, delay: 0.16 }}
              className="text-gray-400 text-base leading-relaxed max-w-xl">
              Seven Bitcoin Diploma cohorts. Over a hundred alumni across Africa. A neighbourhood in
              Ikorodu where sats change hands every day. Two years of unpaid work, and community
              funding you can audit to the last sat.
            </motion.p>
            <motion.div {...fadeUp} transition={{ ...fadeUp.transition, delay: 0.24 }}
              className="flex flex-wrap gap-3 mt-8">
              <a href="#give" className="inline-flex items-center gap-2 bg-yellow-500 text-black font-semibold px-5 py-3 sm:px-7 sm:py-4 hover:brightness-95 transition-all">
                Support the work <ArrowRight size={17} />
              </a>
              <a href="#ledger" className="inline-flex items-center gap-2 border border-white/15 text-gray-200 font-semibold px-5 py-3 sm:px-6 sm:py-4 hover:border-yellow-500 hover:text-yellow-500 transition-colors">
                See the ledger
              </a>
            </motion.div>
          </div>
          <div className="relative min-h-[260px] lg:min-h-[440px] order-1 lg:order-2 -mx-6 lg:mx-0">
            <Image src="/assets/dontebg.jpg" alt="Bitcoin Africa Story community" fill priority
              sizes="(min-width: 1024px) 48vw, 100vw" className="object-cover" />
          </div>
        </div>
      </section>

      {/* ═══ 2 · WHERE THE MONEY GOES ═══ */}
      <section className="max-w-[1140px] mx-auto px-6 py-20 border-t border-white/[0.08]">
        <motion.h2 {...fadeUp} className="text-[25px] sm:text-3xl lg:text-[36px] font-semibold tracking-[-1px] leading-[1.14] mb-4">
          What your contribution <span className="text-yellow-500">actually funds</span>
        </motion.h2>
        <motion.p {...fadeUp} className="text-gray-400 text-base leading-relaxed max-w-2xl">
          Four things, and nothing else. No advertising, no reach-buying, no sponsor deciding what we
          cover or where we work.
        </motion.p>

        {/* desktop carousel */}
        <div className="hidden lg:block mt-10">
          <div ref={trackRef} onScroll={syncArrows}
            className="flex gap-4 overflow-x-auto snap-x snap-mandatory [scrollbar-width:none] [&::-webkit-scrollbar]:hidden pb-1">
            {TRACKS.map((t) => (
              <TrackCard key={t.n} track={t} className="flex-[0_0_calc((100%-32px)/3)] min-h-[510px] snap-start" />
            ))}
          </div>
          <div className="flex items-center justify-end gap-2 mt-6">
            <button onClick={() => nudge(-1)} disabled={atStart} aria-label="Previous"
              className="w-[42px] h-[42px] border border-[#2b2b2b] flex items-center justify-center hover:border-yellow-500 hover:text-yellow-500 transition-colors disabled:opacity-30">
              <ArrowLeft size={16} />
            </button>
            <button onClick={() => nudge(1)} disabled={atEnd} aria-label="Next"
              className="w-[42px] h-[42px] border border-[#2b2b2b] flex items-center justify-center hover:border-yellow-500 hover:text-yellow-500 transition-colors disabled:opacity-30">
              <ArrowRight size={16} />
            </button>
          </div>
        </div>

        {/* mobile sticky stack — page scroll is untouched; each card simply
            pins while the next scrolls over it. */}
        <div className="lg:hidden mt-8 motion-reduce:!block">
          {TRACKS.map((t) => (
            <div key={t.n} className="h-[100svh] sticky top-0 flex items-center py-3.5 motion-reduce:h-auto motion-reduce:static motion-reduce:pb-4">
              <TrackCard track={t} className="w-full h-full motion-reduce:min-h-[440px]" />
            </div>
          ))}
        </div>

        <motion.p {...fadeUp} className="font-fraunces text-[22px] leading-[1.45] text-gray-100 max-w-[52ch] mt-11">
          Teaching creates builders. Community gives them somewhere to spend. Reporting puts them in
          front of the world. Research tells us where to go next.{' '}
          <em className="italic text-yellow-500">We fund all four from the same pot</em> — and publish
          every sat of it.
        </motion.p>
        <p className="font-mono-brand text-[10px] text-gray-600 tracking-[0.07em] uppercase mt-6">
          Figures from our published transparency report
        </p>
      </section>

      {/* ═══ 3 · THE ASK ═══ */}
      <section id="give" className="max-w-[1140px] mx-auto px-6 py-20 border-t border-white/[0.08]">
        <motion.div {...fadeUp} className="text-center max-w-2xl mx-auto mb-10">
          <h2 className="text-[25px] sm:text-3xl lg:text-[36px] font-semibold tracking-[-1px] leading-[1.14] mb-4">
            Add to the work
          </h2>
          <p className="text-gray-400 text-base leading-relaxed">
            There is no fundraising target here. Bitcoin adoption in Africa is not a project that
            finishes &mdash; this scales with what comes in.
          </p>
        </motion.div>

        <motion.div {...fadeUp} className="bg-[#0A0A0A] border border-white/[0.08] max-w-4xl mx-auto">
          <div className="p-2 border-b border-white/[0.08]">
            <nav role="tablist" className="flex gap-1 bg-black p-1 relative">
              {tabs.map((tab) => (
                <button
                  key={tab.id}
                  role="tab"
                  aria-selected={activeTab === tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={`relative flex-1 px-4 py-4 text-base sm:text-lg font-semibold transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-yellow-500 ${
                    activeTab === tab.id ? 'text-black' : 'text-gray-400 hover:text-gray-200'
                  }`}
                >
                  {activeTab === tab.id && (
                    <motion.span layoutId="donate-tab-fill" className="absolute inset-0 bg-yellow-500 -z-10"
                      transition={{ type: 'spring', bounce: 0.15, duration: 0.4 }} />
                  )}
                  {tab.label}
                </button>
              ))}
            </nav>
          </div>
            <div className="p-6 sm:p-12 lg:p-16">
            <AnimatePresence mode="wait">
              {activeTab === 'geyser' && (
                <motion.div
                  key="geyser"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  transition={{ duration: 0.25 }}
                  className="flex flex-col items-center"
                >
                  <p className="text-base sm:text-lg text-gray-400 mb-9 text-center max-w-lg">
                    Support our ongoing storytelling, Bitcoin education, circular economy, and community building initiatives.
                  </p>
                  <div className="w-full flex justify-center">
                    <div className="w-full max-w-[620px]">
                      <iframe
                        src="https://geyser.fund/widget/project/bitcoinafricastory/contribution?view=compact&colorMode=light"
                        title="Geyser Project Contribution Widget"
                        style={{ width: '100%', minHeight: '460px', border: 'none', maxWidth: '620px', backgroundColor: 'transparent' }}
                      />
                    </div>
                  </div>
                </motion.div>
              )}

              {activeTab === 'btcpay' && (
                <motion.div
                  key="btcpay"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  transition={{ duration: 0.25 }}
                  className="flex flex-col items-center"
                >
                  <p className="text-base sm:text-lg text-gray-400 mb-9 text-center max-w-lg">
                    Pay directly with Bitcoin using our self-hosted BTCPay Server — no third-party processor.
                  </p>
                  <style>{`
.btcpay-form { display: inline-flex; align-items: center; justify-content: center; }
.btcpay-form--inline { flex-direction: row; }
.btcpay-form--block { flex-direction: column; }
.btcpay-form--inline .submit { margin-left: 15px; }
.btcpay-form--block select { margin-bottom: 10px; }
.btcpay-form .btcpay-custom-container{ text-align: center; }
.btcpay-custom { display: flex; align-items: center; justify-content: center; }
.btcpay-form .plus-minus { cursor:pointer; font-size:25px; line-height: 25px; background: #DFE0E1; height: 30px; width: 45px; border:none; border-radius: 60px; margin: auto 5px; display: inline-flex; justify-content: center; }
.btcpay-form select { -moz-appearance: none; -webkit-appearance: none; appearance: none; color: currentColor; background: transparent; border:1px solid transparent; display: block; padding: 1px; margin-left: auto; margin-right: auto; font-size: 11px; cursor: pointer; }
.btcpay-form select:hover { border-color: #ccc; }
.btcpay-form option { color: #000; background: rgba(0,0,0,.1); }
.btcpay-input-price { -moz-appearance: textfield; border: none; box-shadow: none; text-align: center; font-size: 25px; margin: auto; border-radius: 5px; line-height: 35px; background: #fff; }
.btcpay-input-price::-webkit-outer-spin-button, .btcpay-input-price::-webkit-inner-spin-button { -webkit-appearance: none; margin: 0; }
                  `}</style>

                  <div className="flex justify-center scale-150 py-8">
                    <form method="POST" action="https://btcpay.ideasarelikeflames.org/api/v1/invoices" className="btcpay-form btcpay-form--block">
                      <input type="hidden" name="storeId" value="3dCgxFoFx9P8RaoetmngFa32H3PVXZRNykJgSat83fsc" />
                      <input type="hidden" name="currency" value="USD" />
                      <input type="image" className="submit" name="submit" src="https://btcpay.ideasarelikeflames.org/img/paybutton/pay.svg" style={{ width: '209px' }} alt="Pay with BTCPay Server, a Self-Hosted Bitcoin Payment Processor" />
                    </form>
                  </div>
                </motion.div>
              )}

              {activeTab === 'info' && (
                <motion.div
                  key="qr"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  transition={{ duration: 0.25 }}
                  className="flex flex-col items-center"
                >
                  <p className="text-base sm:text-lg text-gray-400 mb-9 text-center max-w-lg">
                    Scan the QR code below to donate directly.
                  </p>
                  <div className="w-full flex justify-center">
                    <Image
                      src="/assets/qrcode.jpg"
                      alt="Static QR Code for donations"
                      width={1600}
                      height={1600}
                      priority
                      sizes="(min-width: 1024px) 860px, 100vw"
                      className="w-full max-w-[860px] h-auto"
                    />
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
            </div>
        </motion.div>
      </section>

      {/* ═══ 4 · LEDGER ═══ */}
      <section id="ledger" className="max-w-[1140px] mx-auto px-6 py-20 border-t border-white/[0.08]">
        <motion.h2 {...fadeUp} className="text-[25px] sm:text-3xl lg:text-[36px] font-semibold tracking-[-1px] leading-[1.14] mb-4">
          Where every sat <span className="text-yellow-500">has gone</span>
        </motion.h2>
        <motion.p {...fadeUp} className="text-gray-400 text-base leading-relaxed max-w-2xl mb-7">
          May 2024 – December 2025, published line by line. Anyone can check it.
        </motion.p>

        {LEDGER.map((row, i) => (
          <motion.div
            key={row.label}
            initial={{ opacity: 0, y: 14 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: '-60px' }}
            transition={{ duration: 0.5, delay: i * 0.07, ease: [0.22, 1, 0.36, 1] }}
            className="relative grid grid-cols-[1fr_auto_auto] gap-6 py-3.5 border-b border-white/[0.08] items-baseline"
          >
            <motion.span
              className="absolute left-0 bottom-0 h-px bg-yellow-500"
              initial={{ width: 0 }}
              whileInView={{ width: `${row.pct}%` }}
              viewport={{ once: true }}
              transition={{ duration: 1, delay: 0.15 + i * 0.07, ease: [0.22, 1, 0.36, 1] }}
            />
            <span className="text-[14.5px]">{row.label}</span>
            <span className="font-mono-brand text-xs text-gray-500 text-right min-w-[40px]">{row.pct}%</span>
            <span className="font-mono-brand text-sm text-yellow-500 text-right min-w-[76px]">
              $<CountUp end={row.amount} enableScrollSpy scrollSpyOnce />
            </span>
          </motion.div>
        ))}

        <motion.div {...fadeUp} className="grid grid-cols-[1fr_auto_auto] gap-6 py-4 border-b-2 border-white/15 items-baseline">
          <span className="font-semibold text-[14.5px]">Total received</span>
          <span className="font-mono-brand text-xs text-gray-500 text-right min-w-[40px]">100%</span>
          <span className="font-mono-brand text-[15.5px] text-yellow-500 text-right min-w-[76px]">$2,125.43</span>
        </motion.div>

        <p className="text-[13.5px] text-gray-500 mt-5">
          Full line-item report:{' '}
          <a href="https://docs.google.com/spreadsheets/d/1I_9NWBWiHGnb11ncG-q0Et5-k0lKT6v9IFTBZQ8tdjM/edit?usp=sharing"
            target="_blank" rel="noopener noreferrer"
            className="text-yellow-500 border-b border-yellow-500/40 hover:border-yellow-500 transition-colors">Google Sheet</a>
          {' · '}
          <a href="https://geyser.fund/project/bitcoinafricastory/posts/view/5426"
            target="_blank" rel="noopener noreferrer"
            className="text-yellow-500 border-b border-yellow-500/40 hover:border-yellow-500 transition-colors">Geyser transparency post</a>
        </p>
      </section>

      {/* ═══ 5 · CLOSE ═══ */}
      <section className="max-w-[1140px] mx-auto px-6 py-24 border-t border-white/[0.08] text-center">
        <motion.h2 {...fadeUp} className="text-[25px] sm:text-3xl lg:text-[36px] font-semibold tracking-[-1px] leading-[1.14] mb-4 max-w-[20ch] mx-auto">
          Not ready to give? <span className="text-yellow-500">Read us instead.</span>
        </motion.h2>
        <motion.p {...fadeUp} className="text-gray-400 text-base leading-relaxed max-w-xl mx-auto mb-8">
          The reporting is free and always will be. Getting it in front of more people helps almost as much.
        </motion.p>
        <motion.div {...fadeUp} className="flex flex-wrap gap-3 justify-center">
          <a href="#give" className="inline-flex items-center gap-2 bg-yellow-500 text-black font-semibold px-5 py-3 sm:px-7 sm:py-4 hover:brightness-95 transition-all">
            Support the work <ArrowRight size={17} />
          </a>
          <Link href="/subscribe" className="inline-flex items-center gap-2 border border-white/15 text-gray-200 font-semibold px-5 py-3 sm:px-6 sm:py-4 hover:border-yellow-500 hover:text-yellow-500 transition-colors">
            Subscribe free
          </Link>
        </motion.div>
      </section>
    </div>
  );
}
