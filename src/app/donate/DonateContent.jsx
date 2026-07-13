'use client';

import { useState } from 'react';
import Image from 'next/image';
import { BookOpen, Users, Zap } from 'lucide-react';

export default function DonateContent() {
  const [activeTab, setActiveTab] = useState('geyser');

  return (
    <div className="mt-[110px]">
      <section id="hero" className="relative bg-black">
        <div className="max-w-7xl mx-auto grid grid-cols-1 lg:grid-cols-[1.05fr_0.95fr] lg:min-h-[56vh]">
          <div className="order-2 lg:order-1 flex flex-col justify-center px-6 sm:px-10 lg:pl-6 lg:pr-14 py-14 lg:py-16 border-b lg:border-b-0 lg:border-r border-gray-800">
            <span className="font-bold text-[11px] tracking-[0.18em] uppercase text-[#FAD604] mb-6">
              100% of donations fund the work
            </span>

            <h1 className="font-extrabold text-white text-[34px] sm:text-[44px] lg:text-[50px] leading-[1.05] tracking-tight mb-6 max-w-xl">
              Support Bitcoin adoption <em className="italic text-[#FAD604]">in Africa.</em>
            </h1>

            <p className="text-gray-400 text-base sm:text-lg leading-relaxed max-w-md">
              Your donation fuels grassroots training, community building, real adoption stories, and local circular economy projects. Help us grow Africa&rsquo;s Bitcoin proof-of-work.
            </p>
          </div>

          <div className="order-1 lg:order-2 relative min-h-[220px] sm:min-h-[300px] lg:min-h-0 overflow-hidden">
            <Image
              src="/assets/dontebg.jpg"
              alt="Bitcoin Africa Story community"
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

      <div className="max-w-6xl mx-auto px-6 py-12">
        <div className="bg-gray-900 border border-gray-800 overflow-hidden">
          <div className="flex flex-col md:flex-row md:items-center md:justify-between px-4 py-3 border-b border-gray-800">
            <nav role="tablist" className="flex flex-wrap gap-2">
              <button role="tab" aria-selected={activeTab === 'geyser'} onClick={() => setActiveTab('geyser')} className={`px-4 py-2 text-sm font-semibold ${activeTab === 'geyser' ? 'bg-yellow-500 text-black' : 'text-gray-300 hover:bg-gray-800'}`}>
                Geyser
              </button>
              <button role="tab" aria-selected={activeTab === 'btcpay'} onClick={() => setActiveTab('btcpay')} className={`px-4 py-2 text-sm font-semibold ${activeTab === 'btcpay' ? 'bg-yellow-500 text-black' : 'text-gray-300 hover:bg-gray-800'}`}>
                BTCPay Server
              </button>
              <button role="tab" aria-selected={activeTab === 'info'} onClick={() => setActiveTab('info')} className={`px-4 py-2 text-sm font-semibold ${activeTab === 'info' ? 'bg-yellow-500 text-black' : 'text-gray-300 hover:bg-gray-800'}`}>
                Static QR Codes
              </button>
            </nav>
          </div>

          <div className="p-6">
            {activeTab === 'geyser' && (
              <div className="flex flex-col items-center">
                <h2 className="text-xl font-bold mb-4">Geyser Donation Widget</h2>
                <p className="text-sm text-gray-400 mb-4 text-center">Support our ongoing Storytelling, Bitcoin education, circular economy, and Community Building Initiatives.</p>
                <div className="w-full flex justify-center">
                  <div className="w-full max-w-[400px]">
                    <iframe
                      src="https://geyser.fund/widget/project/bitcoinafricastory/contribution?view=compact&colorMode=light"
                      title="Geyser Project Contribution Widget"
                      style={{ width: '100%', minHeight: '264px', border: 'none', maxWidth: '400px', backgroundColor: 'transparent' }}
                    />
                  </div>
                </div>
              </div>
            )}

            {activeTab === 'btcpay' && (
              <div className="flex flex-col items-center">
                <h2 className="text-xl font-bold mb-4">BTCPay Server</h2>
                <p className="text-sm text-gray-400 mb-4 text-center">Pay directly with Bitcoin using our self-hosted BTCPay Server.</p>
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
              </div>
            )}

            {activeTab === 'info' && (
              <div className="flex flex-col items-center">
                <h2 className="text-xl font-bold mb-4">Static QR Code</h2>
                <p className="text-sm text-gray-400 mb-4 text-center">Scan the QR code below to donate.</p>
                <div className="w-full flex justify-center">
                  <Image
                    src="/assets/qrcode.jpg"
                    alt="Static QR Code for donations"
                    width={700}
                    height={700}
                    sizes="(min-width: 768px) 700px, 100vw"
                    className="w-full max-w-[700px] h-auto rounded-lg shadow-md p-4"
                  />
                </div>
              </div>
            )}
          </div>
        </div>
      </div>

      <section className="bg-black py-20 px-6">
        <div className="max-w-5xl mx-auto">
          <div className="text-center mb-16">
            <div className="inline-block px-4 py-1.5 rounded-full bg-yellow-500/10 border border-yellow-500/20 mb-6">
              <span className="text-yellow-500 text-sm font-bold tracking-widest uppercase">Transparency & Impact</span>
            </div>
            <h2 className="text-3xl md:text-5xl font-bold text-white mb-6">Where your sats go</h2>
            <p className="text-gray-400 max-w-2xl mx-auto text-lg leading-relaxed">
              All contributions are directly allocated to mission-critical operations. We maintain lean
              overheads to maximize impact on the ground.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="bg-gray-900 border border-gray-800 p-8 hover:border-yellow-500/30 transition-colors group">
              <div className="w-12 h-12 bg-gray-800 rounded-lg flex items-center justify-center mb-6 group-hover:bg-yellow-500 group-hover:text-black transition-colors">
                <Zap size={24} />
              </div>
              <h3 className="text-xl font-bold text-white mb-3">Ops & Coordination</h3>
              <p className="text-gray-400 text-sm leading-relaxed">
                Running the platform, organizing monthly meetups, and coordinating volunteers across 5+
                African cities.
              </p>
            </div>

            <div className="bg-gray-900 border border-gray-800 p-8 hover:border-yellow-500/30 transition-colors group">
              <div className="w-12 h-12 bg-gray-800 rounded-lg flex items-center justify-center mb-6 group-hover:bg-yellow-500 group-hover:text-black transition-colors">
                <BookOpen size={24} />
              </div>
              <h3 className="text-xl font-bold text-white mb-3">Content & Education</h3>
              <p className="text-gray-400 text-sm leading-relaxed">
                Producing high-quality documentaries, translating resources, and funding educational
                workshops for new users.
              </p>
            </div>

            <div className="bg-gray-900 border border-gray-800 p-8 hover:border-yellow-500/30 transition-colors group">
              <div className="w-12 h-12 bg-gray-800 rounded-lg flex items-center justify-center mb-6 group-hover:bg-yellow-500 group-hover:text-black transition-colors">
                <Users size={24} />
              </div>
              <h3 className="text-xl font-bold text-white mb-3">Community Support</h3>
              <p className="text-gray-400 text-sm leading-relaxed">
                Direct support for local chapters including Ikorodu, alumni networks, and university pilot
                programs.
              </p>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
