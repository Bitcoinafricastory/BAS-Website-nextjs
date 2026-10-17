'use client';

import Image from 'next/image';

import { useRef, useState } from 'react';
import { ArrowLeft, ArrowRight, AtSign, Quote } from 'lucide-react';

export default function TestimonialCarousel({ testimonials = [] }) {
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

  if (!testimonials.length) return null;

  return (
    <div className="relative">
      {/* Snap-scroll row — 1 card on mobile, ~1.3 peeking on tablet, 3 on desktop.
          Native touch scroll on mobile, arrow buttons for pointer users. */}
      <div
        ref={trackRef}
        onScroll={onScroll}
        className="flex gap-5 overflow-x-auto snap-x snap-mandatory scroll-px-4 px-4 pb-4 -mx-4 [scrollbar-width:none] [&::-webkit-scrollbar]:hidden"
      >
        {testimonials.map((testimonial) => (
          <div
            key={testimonial.id}
            data-card
            className="snap-start shrink-0 w-[86%] sm:w-[60%] lg:w-[calc(33.333%-14px)]"
          >
            <div className="relative h-full p-6 sm:p-7 rounded-2xl border border-white/10 bg-[#111111] hover:border-yellow-500/40 transition-colors duration-300">
              <Quote className="absolute top-6 right-6 w-8 h-8 text-yellow-500/10" strokeWidth={3} />
              <a href={testimonial.twitterLink || '#'} target={testimonial.twitterLink ? '_blank' : '_self'} rel="noopener noreferrer" className={`block ${testimonial.twitterLink ? 'cursor-pointer' : 'cursor-default'}`}>
                <div className="flex items-center gap-3.5 mb-5">
                  <div className="w-11 h-11 rounded-full bg-gradient-to-br from-yellow-400 to-yellow-600 flex-shrink-0 flex items-center justify-center text-black font-semibold text-base shadow-lg overflow-hidden">
                    {testimonial.image ? (
                      <Image
                        src={testimonial.image}
                        alt={testimonial.name}
                        width={44}
                        height={44}
                        className="w-full h-full object-cover"
                      />
                    ) : (
                      testimonial.avatar || (testimonial.name ? testimonial.name[0] : 'U')
                    )}
                  </div>
                  <div>
                    <h4 className="font-medium text-[15px] leading-none text-white">{testimonial.name || 'Anonymous'}</h4>
                    <p className="text-[10px] text-yellow-500 font-medium mt-1.5 tracking-widest">{testimonial.role || testimonial.location || 'Movement Member'}</p>
                  </div>
                </div>
                <p className="text-gray-400 text-[15px] leading-relaxed italic mb-5 line-clamp-5">&ldquo;{testimonial.text || 'Success Story on X'}&rdquo;</p>
                {testimonial.twitterLink && (
                  <div className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-white/5 rounded-full border border-white/5 text-yellow-500 text-[11px] font-medium uppercase tracking-widest hover:bg-yellow-500 hover:text-black transition-all duration-300">
                    <AtSign size={12} />
                    Verify on X
                  </div>
                )}
              </a>
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
  );
}
