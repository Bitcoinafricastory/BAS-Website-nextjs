'use client';

import { useState, useRef } from 'react';
import Image from 'next/image';
import { motion, AnimatePresence, useScroll, useTransform } from 'framer-motion';
import { ShieldCheck, Server, ScrollText } from 'lucide-react';
import CountUp from '@/components/ui/CountUp';

const tabs = [
  { id: 'geyser', label: 'Geyser' },
  { id: 'btcpay', label: 'BTCPay Server' },
  { id: 'info', label: 'QR Code' },
];

const trustBadges = [
  { icon: ShieldCheck, label: '100% to programs' },
  { icon: Server, label: 'Self-hosted BTCPay' },
  { icon: ScrollText, label: 'Open ledger' },
];

const builtSoFar = [
  {
    image: '/assets/story.jpg',
    title: '6 Online Bitcoin Diplomas',
    description:
      'Funded by community donations, these programs made Bitcoin education accessible to anyone, anywhere in Africa.',
  },
  {
    image: '/assets/bitcoin-ikorodu-kids.png',
    title: 'Bitcoin Ikorodu Circular Economy',
    description:
      'Seed funding for merchant onboarding turned one neighborhood into a real, working Bitcoin economy.',
  },
  {
    image: '/assets/bas.jpg',
    title: '10+ Community Events',
    description:
      'School sessions, church outreach, and youth hangouts — all run by volunteers your donations support.',
  },
];

const ledger = [
  { idx: '01', title: 'Ops & Coordination', description: 'Platform, meetups, volunteer coordination, operations', pct: 40 },
  { idx: '02', title: 'Content & Education', description: 'Documentaries, tutorials, podcasts, stories, and more content', pct: 35 },
  { idx: '03', title: 'Community Support', description: 'Local chapters, alumni networks, community programs', pct: 25 },
];

const fadeUp = {
  initial: { opacity: 0, y: 24 },
  whileInView: { opacity: 1, y: 0 },
  viewport: { once: true, margin: '-80px' },
  transition: { duration: 0.6, ease: [0.22, 1, 0.36, 1] },
};

export default function DonateContent() {
  const [activeTab, setActiveTab] = useState('geyser');
  const heroRef = useRef(null);
  const { scrollYProgress: heroScroll } = useScroll({ target: heroRef, offset: ['start start', 'end start'] });
  const heroImageY = useTransform(heroScroll, [0, 1], ['0%', '18%']);

  return (
    <div className="pt-16">
      {/* ===== Hero — real photo, split layout ===== */}
      <section ref={heroRef} className="relative bg-black">
        <div className="max-w-7xl mx-auto grid grid-cols-1 lg:grid-cols-[1.05fr_0.95fr] lg:min-h-[62vh]">
          <div className="order-2 lg:order-1 flex flex-col justify-center px-6 sm:px-10 lg:pl-6 lg:pr-14 py-14 lg:py-16 border-b lg:border-b-0 lg:border-r border-gray-800">
            <motion.h1
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6 }}
              className="font-semibold text-white text-4xl sm:text-5xl lg:text-[54px] leading-[1.05] tracking-tight mb-6 max-w-xl"
            >
              Support Bitcoin adoption <span className="text-yellow-500">in Africa.</span>
            </motion.h1>

            <motion.p
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.1 }}
              className="text-gray-400 text-base sm:text-lg leading-relaxed max-w-md mb-8"
            >
              Your donation fuels grassroots training, community building, real adoption stories, and
              local circular economy projects across Africa.
            </motion.p>

            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.2 }}
              className="flex flex-wrap gap-3"
            >
              {trustBadges.map(({ icon: Icon, label }) => (
                <span
                  key={label}
                  className="inline-flex items-center gap-2 text-xs font-semibold text-gray-300 bg-gray-900 border border-gray-800 px-3 py-2"
                >
                  <Icon size={14} className="text-yellow-500" />
                  {label}
                </span>
              ))}
            </motion.div>
          </div>

          <div className="order-1 lg:order-2 relative min-h-[280px] sm:min-h-[360px] lg:min-h-0 overflow-hidden">
            <motion.div style={{ y: heroImageY }} className="absolute inset-0 -top-[10%] h-[120%]">
              <Image
                src="/assets/dontebg.jpg"
                alt="Bitcoin Africa Story community"
                fill
                priority
                sizes="(min-width: 1024px) 45vw, 100vw"
                className="object-cover grayscale contrast-125"
              />
            </motion.div>
            <div className="hidden lg:block absolute inset-0 bg-[linear-gradient(90deg,rgba(0,0,0,0.85)_0%,rgba(0,0,0,0.25)_30%,rgba(0,0,0,0)_60%)]" />
            <div className="lg:hidden absolute inset-0 bg-[linear-gradient(180deg,rgba(0,0,0,0.15)_0%,rgba(0,0,0,0.8)_100%)]" />
          </div>
        </div>
      </section>

      {/* ===== What past donations built — photo poster cards ===== */}
      <section className="py-20 px-6 border-t border-gray-800">
        <div className="max-w-6xl mx-auto">
          <motion.h2 {...fadeUp} className="text-2xl md:text-3xl font-bold mb-12 text-center">
            What your donation <span className="text-yellow-500">already built</span>
          </motion.h2>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-5">
            {builtSoFar.map((item, index) => (
              <motion.div
                key={item.title}
                initial={{ opacity: 0, y: 24 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, margin: '-80px' }}
                transition={{ duration: 0.6, delay: index * 0.1, ease: [0.22, 1, 0.36, 1] }}
                className="relative aspect-[3/4] overflow-hidden group"
              >
                <Image
                  src={item.image}
                  alt={item.title}
                  fill
                  sizes="(min-width: 640px) 33vw, 100vw"
                  className="object-cover transition-transform duration-700 group-hover:scale-105"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black via-black/50 to-transparent" />
                <div className="absolute bottom-0 left-0 right-0 p-6">
                  <h3 className="text-lg font-bold mb-2 text-white">{item.title}</h3>
                  <p className="text-gray-300 text-sm leading-relaxed">{item.description}</p>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* ===== Donation card ===== */}
      <section className="py-16 px-6">
        <motion.div {...fadeUp} className="max-w-2xl mx-auto bg-gray-900 border border-gray-800">
          <div className="p-2 border-b border-gray-800">
            <nav role="tablist" className="flex gap-1 bg-black p-1 relative">
              {tabs.map((tab) => (
                <button
                  key={tab.id}
                  role="tab"
                  aria-selected={activeTab === tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={`relative flex-1 px-4 py-3.5 text-base font-semibold transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-yellow-500 ${
                    activeTab === tab.id ? 'text-black' : 'text-gray-400 hover:text-gray-200'
                  }`}
                >
                  {activeTab === tab.id && (
                    <motion.span
                      layoutId="donate-tab-fill"
                      className="absolute inset-0 bg-yellow-500 -z-10"
                      transition={{ type: 'spring', bounce: 0.15, duration: 0.4 }}
                    />
                  )}
                  {tab.label}
                </button>
              ))}
            </nav>
          </div>

          <div className="p-10 sm:p-14">
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
                  <p className="text-base text-gray-400 mb-8 text-center max-w-md">
                    Support our ongoing storytelling, Bitcoin education, circular economy, and community building initiatives.
                  </p>
                  <div className="w-full flex justify-center">
                    <div className="w-full max-w-[480px]">
                      <iframe
                        src="https://geyser.fund/widget/project/bitcoinafricastory/contribution?view=compact&colorMode=light"
                        title="Geyser Project Contribution Widget"
                        style={{ width: '100%', minHeight: '320px', border: 'none', maxWidth: '480px', backgroundColor: 'transparent' }}
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
                  <p className="text-base text-gray-400 mb-8 text-center max-w-md">
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

                  <div className="flex justify-center scale-125 py-4">
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
                  <p className="text-base text-gray-400 mb-8 text-center max-w-md">
                    Scan the QR code below to donate directly.
                  </p>
                  <div className="w-full flex justify-center -mx-10 sm:-mx-14 px-4">
                    <Image
                      src="/assets/qrcode.jpg"
                      alt="Static QR Code for donations"
                      width={1200}
                      height={1200}
                      sizes="(min-width: 768px) 1000px, 100vw"
                      className="w-full max-w-[1000px] h-auto"
                    />
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </motion.div>
      </section>

      {/* ===== Ledger — where your sats go ===== */}
      <section className="max-w-[1000px] mx-auto px-6 sm:px-[6vw] py-20">
        <motion.h2 {...fadeUp} className="text-2xl sm:text-3xl font-bold mb-10">
          Where your sats go
        </motion.h2>

        {ledger.map((row, index) => (
          <motion.div
            key={row.idx}
            initial={{ opacity: 0, y: 18 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: '-80px' }}
            transition={{ duration: 0.5, delay: index * 0.1, ease: [0.22, 1, 0.36, 1] }}
            className="grid grid-cols-[36px_1fr_auto] sm:grid-cols-[56px_1fr_90px] gap-3 sm:gap-6 items-baseline py-6 sm:py-8 border-b border-gray-900"
          >
            <div className="text-gray-600 text-sm sm:text-base">{row.idx}</div>
            <div>
              <div className="font-semibold text-lg sm:text-xl">{row.title}</div>
              <div className="text-gray-500 text-sm sm:text-base mt-1.5 leading-relaxed">{row.description}</div>
            </div>
            <div className="text-yellow-500 text-xl sm:text-2xl font-semibold text-right">
              <CountUp end={row.pct} suffix="%" />
            </div>
          </motion.div>
        ))}
      </section>

      {/* ===== Proof-of-Work — real, documented numbers ===== */}
      <section className="max-w-[1000px] mx-auto px-6 sm:px-[6vw] py-20 border-t border-gray-800">
        <motion.div {...fadeUp}>
          <h2 className="text-2xl sm:text-3xl font-bold mb-4">
            We&rsquo;ve built this with almost nothing. <span className="text-yellow-500">Help us build more.</span>
          </h2>
          <p className="text-gray-400 text-base sm:text-lg leading-relaxed max-w-2xl">
            Bitcoin Africa Story has run for two years on volunteer time and $2,125 in total donations
            received between May 2024 and December 2025. Every number below is documented, not estimated.
          </p>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: '-80px' }}
          transition={{ duration: 0.6, delay: 0.1, ease: [0.22, 1, 0.36, 1] }}
          className="bg-gray-900 border-l-2 border-yellow-500 px-8 py-8 mt-10"
        >
          <p className="italic text-lg sm:text-xl leading-relaxed">
            &ldquo;We&rsquo;ve bootstrapped this phase with little to no support so far &mdash; pausing stipends and
            meetups when funding ran out, but never pausing the work itself.&rdquo;
          </p>
        </motion.div>

        <div className="grid grid-cols-2 sm:grid-cols-4 gap-px bg-gray-800 border border-gray-800 mt-10">
          {[
            { value: 7, suffix: '', label: 'Diploma cohorts' },
            { value: 100, suffix: '+', label: 'Alumni' },
            { value: 5, suffix: '', label: 'Podcast episodes' },
            { value: 350, suffix: '+', label: 'Event attendance' },
          ].map((stat, index) => (
            <motion.div
              key={stat.label}
              initial={{ opacity: 0, y: 16 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: '-80px' }}
              transition={{ duration: 0.5, delay: index * 0.08 }}
              className="bg-black px-5 py-7 text-center"
            >
              <div className="text-2xl sm:text-3xl font-bold text-yellow-500">
                <CountUp end={stat.value} suffix={stat.suffix} />
              </div>
              <div className="text-xs sm:text-sm text-gray-500 mt-2 leading-snug">{stat.label}</div>
            </motion.div>
          ))}
        </div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: '-80px' }}
          transition={{ duration: 0.6, delay: 0.2, ease: [0.22, 1, 0.36, 1] }}
          className="flex flex-col sm:flex-row gap-4 mt-10"
        >
          <a
            href="https://docs.google.com/spreadsheets/d/1I_9NWBWiHGnb11ncG-q0Et5-k0lKT6v9IFTBZQ8tdjM/edit?usp=sharing"
            target="_blank"
            rel="noopener noreferrer"
            className="flex-1 flex items-center justify-between gap-4 px-6 py-5 bg-gray-900 border border-gray-800 hover:border-yellow-500 transition-colors duration-200"
          >
            <div>
              <div className="font-semibold">Full transparency spreadsheet</div>
              <div className="text-gray-500 text-sm mt-1">Every donation, every allocation</div>
            </div>
            <span className="text-yellow-500 text-xl">&rarr;</span>
          </a>
          <a
            href="https://geyser.fund/project/bitcoinafricastory/posts/view/5426"
            target="_blank"
            rel="noopener noreferrer"
            className="flex-1 flex items-center justify-between gap-4 px-6 py-5 bg-gray-900 border border-gray-800 hover:border-yellow-500 transition-colors duration-200"
          >
            <div>
              <div className="font-semibold">Geyser transparency post</div>
              <div className="text-gray-500 text-sm mt-1">The complete original write-up</div>
            </div>
            <span className="text-yellow-500 text-xl">&rarr;</span>
          </a>
        </motion.div>
      </section>
    </div>
  );
}
