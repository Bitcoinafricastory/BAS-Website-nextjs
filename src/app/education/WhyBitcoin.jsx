'use client';
import Image from 'next/image';

import { useState } from 'react';
import { ChevronLeft, ChevronRight, Quote } from 'lucide-react';

export default function WhyBitcoin({ testimonials = [], videoData = null }) {
  const [active, setActive] = useState(0);

  const next = () => setActive((prev) => (prev === testimonials.length - 1 ? 0 : prev + 1));
  const prev = () => setActive((prev) => (prev === 0 ? testimonials.length - 1 : prev - 1));

  return (
    <section className="py-24 bg-black text-white overflow-hidden">
      <div className="max-w-6xl mx-auto px-6">
        <div className="text-center mb-16">
          <h2 className="text-4xl md:text-5xl font-bold mb-4">
            Why Study <span className="text-yellow-500">Bitcoin?</span>
          </h2>
          <p className="text-gray-400 max-w-2xl mx-auto">
            Discover how decentralized finance is reshaping the African landscape and empowering
            individuals with sound money principles.
          </p>
        </div>

        <div className="relative max-w-4xl mx-auto mb-24 group">
          <div className="absolute -inset-1 bg-gradient-to-r from-yellow-500/20 to-orange-500/20 blur-2xl opacity-50 group-hover:opacity-100 transition duration-1000" />
          <div className="relative aspect-video overflow-hidden border border-white/10 bg-white/5 shadow-2xl">
            {videoData && (videoData.embedUrl || videoData.videoId) ? (
              <iframe
                title="Bitcoin Education Video"
                src={videoData.embedUrl ? videoData.embedUrl : `https://www.youtube.com/embed/${videoData.videoId}`}
                className="w-full h-full"
                frameBorder="0"
                allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
                allowFullScreen
              />
            ) : (
              <div className="w-full h-full flex items-center justify-center">
                <p className="text-gray-400 text-lg text-center px-6">Please note: a video will be uploaded soon. Please check back later.</p>
              </div>
            )}
          </div>
        </div>

        <div className="text-center mb-10">
          <h3 className="text-3xl font-bold text-white">What Our Learners Are Saying!</h3>
        </div>

        {testimonials.length === 0 ? (
          <div className="text-center py-12">
            <p className="text-gray-400">No testimonials yet. Check back soon!</p>
          </div>
        ) : (
          <div className="relative max-w-5xl mx-auto">
            <div className="overflow-hidden">
              <div className="flex transition-transform duration-500 ease-in-out" style={{ transform: `translateX(calc(-${active * 100}%))` }}>
                {testimonials.map((t, i) => (
                  <div key={t.id} className="w-full flex-shrink-0 px-4 flex justify-center">
                    <div className={`relative p-8 rounded-3xl border transition-all duration-500 w-full max-w-lg bg-[#111111] ${i === active ? 'border-yellow-500 shadow-[0_0_20px_rgba(234,179,8,0.1)]' : 'border-white/5 opacity-40 scale-95'}`}>
                      <Quote className="absolute top-8 right-8 w-10 h-10 text-yellow-500/10" strokeWidth={3} />
                      <div className="flex items-center gap-4 mb-8">
                        {t.image && (
                          <Image
                            src={t.image}
                            alt={t.name}
                            width={56}
                            height={56}
                            className="w-14 h-14 rounded-full border-2 border-yellow-500 object-cover"
                          />
                        )}
                        <div>
                          <h4 className="font-bold text-lg leading-none">{t.name}</h4>
                          <p className="text-[10px] text-yellow-500 font-bold mt-1 tracking-widest">{t.role}</p>
                        </div>
                      </div>
                      <p className="text-gray-400 text-lg leading-relaxed italic">&ldquo;{t.text}&rdquo;</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            <div className="flex flex-col items-center mt-12 gap-6">
              <div className="flex gap-2">
                {testimonials.map((_, i) => (
                  <div key={i} className={`h-1.5 rounded-full transition-all duration-300 ${i === active ? 'w-10 bg-yellow-500' : 'w-2 bg-white/20'}`} />
                ))}
              </div>
              <div className="flex gap-4">
                <button onClick={prev} className="w-12 h-12 rounded-full border border-white/20 flex items-center justify-center hover:bg-yellow-500 hover:text-black hover:border-yellow-500 transition-all group">
                  <ChevronLeft className="w-5 h-5 transition-transform group-active:scale-90" />
                </button>
                <button onClick={next} className="w-12 h-12 rounded-full border border-white/20 flex items-center justify-center hover:bg-yellow-500 hover:text-black hover:border-yellow-500 transition-all group">
                  <ChevronRight className="w-5 h-5 transition-transform group-active:scale-90" />
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </section>
  );
}
