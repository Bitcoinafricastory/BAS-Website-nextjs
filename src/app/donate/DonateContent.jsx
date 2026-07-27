'use client';

import { useState } from 'react';
import Image from 'next/image';
import { motion, AnimatePresence } from 'framer-motion';
import CountUp from '@/components/ui/CountUp';

const tabs = [
  { id: 'geyser', label: 'geyser' },
  { id: 'btcpay', label: 'btcpay' },
  { id: 'info', label: 'qr' },
];

const ledger = [
  {
    idx: '01',
    title: 'Ops & Coordination',
    description: 'Platform, meetups, volunteer coordination, operations',
    pct: 40,
  },
  {
    idx: '02',
    title: 'Content & Education',
    description: 'Documentaries, tutorials, podcasts, stories, and more content',
    pct: 35,
  },
  {
    idx: '03',
    title: 'Community Support',
    description: 'Local chapters, alumni networks, community programs',
    pct: 25,
  },
];

export default function DonateContent() {
  const [activeTab, setActiveTab] = useState('geyser');

  return (
    <div className="mt-[110px] font-mono-brand">
      {/* ===== Hero ===== */}
      <section className="max-w-[1000px] mx-auto px-6 sm:px-[6vw] pt-14 pb-10">
        <motion.h1
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="font-sans font-semibold text-white text-4xl sm:text-5xl lg:text-[54px] leading-[1.05] max-w-2xl"
        >
          Support Bitcoin adoption in Africa.
        </motion.h1>
        <motion.p
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.1 }}
          className="font-sans text-gray-400 max-w-xl mt-5 leading-relaxed text-sm sm:text-base"
        >
          Your donation fuels grassroots training, community building, real adoption stories, and local
          circular economy projects. Help us grow Africa&rsquo;s Bitcoin proof-of-work.
        </motion.p>
      </section>

      {/* ===== Donation block — full-width terminal ===== */}
      <section className="max-w-[1000px] mx-auto px-6 sm:px-[6vw]">
        <motion.div
          initial={{ opacity: 0, scale: 0.98 }}
          whileInView={{ opacity: 1, scale: 1 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
          className="border border-gray-800"
        >
          <nav role="tablist" className="flex relative">
            {tabs.map((tab) => (
              <button
                key={tab.id}
                role="tab"
                aria-selected={activeTab === tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`relative flex-1 py-4 sm:py-5 text-xs sm:text-sm tracking-wide transition-colors duration-200 border-r border-gray-800 last:border-r-0 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-yellow-500 focus-visible:z-10 ${
                  activeTab === tab.id ? 'text-black' : 'text-gray-500 hover:text-gray-300'
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

          <div className="p-8 sm:p-12">
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
                  <p className="font-sans text-sm text-gray-400 mb-6 text-center max-w-sm">
                    Support our ongoing storytelling, Bitcoin education, circular economy, and community
                    building initiatives.
                  </p>
                  <div className="w-full flex justify-center">
                    <div className="w-full max-w-[420px]">
                      <iframe
                        src="https://geyser.fund/widget/project/bitcoinafricastory/contribution?view=compact&colorMode=light"
                        title="Geyser Project Contribution Widget"
                        style={{ width: '100%', minHeight: '280px', border: 'none', maxWidth: '420px', backgroundColor: 'transparent' }}
                      />
                    </div>
                  </div>
                  <div className="font-sans text-gray-600 text-xs mt-4">Card, Lightning, or on-chain &mdash; your choice</div>
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
                  <p className="font-sans text-sm text-gray-400 mb-6 text-center max-w-sm">
                    Pay directly with Bitcoin using our self-hosted BTCPay Server &mdash; no third-party
                    processor.
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

                  <div className="flex justify-center">
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
                  <p className="font-sans text-sm text-gray-400 mb-6 text-center max-w-sm">
                    Scan the QR code below to donate directly.
                  </p>
                  <div className="w-full flex justify-center -mx-8 sm:-mx-12 px-4">
                    <Image
                      src="/assets/qrcode.jpg"
                      alt="Static QR Code for donations"
                      width={1200}
                      height={1200}
                      sizes="(min-width: 768px) 900px, 100vw"
                      className="w-full max-w-[900px] h-auto"
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
        <h2 className="font-sans text-2xl sm:text-3xl font-bold mb-10">Where your sats go</h2>

        {ledger.map((row, index) => (
          <motion.div
            key={row.idx}
            initial={{ opacity: 0, y: 18 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5, delay: index * 0.1 }}
            className="grid grid-cols-[36px_1fr_auto] sm:grid-cols-[56px_1fr_90px] gap-3 sm:gap-6 items-baseline py-6 sm:py-8 border-b border-gray-900"
          >
            <div className="text-gray-600 text-sm sm:text-base">{row.idx}</div>
            <div>
              <div className="font-sans font-semibold text-lg sm:text-xl">{row.title}</div>
              <div className="font-sans text-gray-500 text-sm sm:text-base mt-1.5 leading-relaxed">{row.description}</div>
            </div>
            <div className="text-yellow-500 text-xl sm:text-2xl font-semibold text-right">
              <CountUp end={row.pct} suffix="%" />
            </div>
          </motion.div>
        ))}
      </section>
    </div>
  );
}
