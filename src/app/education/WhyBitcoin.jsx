'use client';
import Image from 'next/image';

import { useRef, useState } from 'react';
import { Quote, ArrowLeft, ArrowRight } from 'lucide-react';

export default function WhyBitcoin({ testimonials = [], videoData = null }) {
  const trackRef = useRef(null);
  const [activeIndex, setActiveIndex] = useState(0);

  const scrollByCard = (dir) => {
    const track = trackRef.current;
    if (!track) return;
    const card = track.querySelector('[data-card]');
    const step = card ? card.offsetWidth + 20 : track.clientWidth * 0.85;
    track.scrollBy({ left: dir * step, behavior: 'smooth' });
  };

  const onScroll = () => {
    const track = trackRef.current;
    if (!track) return;
    const card = track.querySelector('[data-card]');
    const step = card ? card.offsetWidth + 20 : 1;
    setActiveIndex(Math.round(track.scrollLeft / step));
  };

  return (
    <section className="py-16 sm:py-24 bg-black text-white overflow-hidden">
      <div className="max-w-6xl mx-auto px-6">
        <div className="text-center mb-10 sm:mb-16">
          <h2 className="text-2xl sm:text-4xl lg:text-5xl font-semibold mb-4">
            Why Study <span className="text-yellow-500">Bitcoin?</span>
          </h2>
          <p className="text-gray-400 text-sm sm:text-base max-w-2xl mx-auto">
            Discover how decentralized finance is reshaping the African landscape and empowering
            individuals with sound money principles.
          </p>
        </div>

        <div className="relative max-w-4xl mx-auto mb-16 sm:mb-24 group">
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
                <p className="text-gray-400 text-base sm:text-lg text-center px-6">Please note: a video will be uploaded soon. Please check back later.</p>
              </div>
            )}
          </div>
        </div>

        <div className="text-center mb-8 sm:mb-10">
          <h3 className="text-xl sm:text-3xl font-semibold text-white">What Our Learners Are Saying!</h3>
        </div>

        {testimonials.length === 0 ? (
          <div className="text-center py-12">
            <p className="text-gray-400">No testimonials yet. Check back soon!</p>
          </div>
        ) : (
          <div className="relative">
            <div
              ref={trackRef}
              onScroll={onScroll}
              className="flex gap-5 overflow-x-auto snap-x snap-mandatory scroll-px-4 px-4 pb-4 -mx-4 [scrollbar-width:none] [&::-webkit-scrollbar]:hidden"
            >
              {testimonials.map((t) => (
                <div key={t.id} data-card className="snap-start shrink-0 w-[86%] sm:w-[60%] lg:w-[calc(50%-10px)]">
                  <div className="relative h-full p-6 sm:p-7 rounded-2xl border border-white/10 bg-[#111111] hover:border-yellow-500/40 transition-colors duration-300">
                    <Quote className="absolute top-6 right-6 w-8 h-8 text-yellow-500/10" strokeWidth={3} />
                    <div className="flex items-center gap-3.5 mb-5">
                      {t.image && (
                        <Image
                          src={t.image}
                          alt={t.name}
                          width={44}
                          height={44}
                          className="w-11 h-11 rounded-full border-2 border-yellow-500 object-cover"
                        />
                      )}
                      <div>
                        <h4 className="font-medium text-[15px] leading-none">{t.name}</h4>
                        <p className="text-[10px] text-yellow-500 font-medium mt-1.5 tracking-widest">{t.role}</p>
                      </div>
                    </div>
                    <p className="text-gray-400 text-[15px] leading-relaxed italic line-clamp-6">&ldquo;{t.text}&rdquo;</p>
                  </div>
                </div>
              ))}
            </div>

            <div className="flex items-center justify-center gap-6 mt-8">
              <button onClick={() => scrollByCard(-1)} className="w-10 h-10 rounded-full border border-white/15 flex items-center justify-center hover:bg-yellow-500 hover:text-black hover:border-yellow-500 transition-all group" aria-label="Previous testimonials">
                <ArrowLeft className="w-4 h-4 transition-transform group-active:scale-90" />
              </button>
              <div className="flex gap-1.5">
                {testimonials.map((_, i) => (
                  <div key={i} className={`h-1.5 rounded-full transition-all duration-300 ${i === activeIndex ? 'w-6 bg-yellow-500' : 'w-1.5 bg-white/20'}`} />
                ))}
              </div>
              <button onClick={() => scrollByCard(1)} className="w-10 h-10 rounded-full border border-white/15 flex items-center justify-center hover:bg-yellow-500 hover:text-black hover:border-yellow-500 transition-all group" aria-label="Next testimonials">
                <ArrowRight className="w-4 h-4 transition-transform group-active:scale-90" />
              </button>
            </div>
          </div>
        )}
      </div>
    </section>
  );
}
