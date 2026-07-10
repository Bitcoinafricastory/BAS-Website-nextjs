'use client';

import { ArrowRight } from 'lucide-react';

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
    <section id="hero" className="relative flex items-center overflow-hidden">
      <div
        className="absolute inset-0 z-0"
        style={{
          backgroundImage: "url('/assets/basbg.jpg')",
          backgroundRepeat: 'no-repeat',
          backgroundSize: 'cover',
          backgroundPosition: 'center',
        }}
      >
        <div className="absolute inset-0 bg-black/80" />
        <div className="absolute inset-0 bg-gradient-to-b from-black/50 via-transparent to-black" />
      </div>

      <div className="relative z-10 max-w-7xl mx-auto px-6 pb-[20px] w-full">
        <div className="flex flex-col items-center gap-8 text-center">
          <div className="w-full lg:w-2/3 mt-12 md:mt-10">
            <div className="hidden sm:inline-block mb-6 px-4 py-2 bg-yellow-500/10 border border-yellow-500/30 rounded-full">
              <span className="text-yellow-500 text-sm font-semibold">Learn From Anywhere In The World</span>
            </div>

            <div className="space-y-2">
              <h1 className="text-5xl sm:text-7xl md:text-6xl lg:text-7xl md:font-extrabold leading-tight">
                Study <span className="text-[#FAD604]">Bitcoin.</span>
                <br />
                Study Freedom!
              </h1>
            </div>

            <p className="text-lg mt-5 md:text-xl text-gray-300 mb-8 max-w-2xl mx-auto">
              Everything you need to start your Bitcoin journey. Guides, tools, and trusted resources to
              help you learn and grow.
            </p>

            <div className="flex sm:flex-row gap-3 mt-5 justify-center mb-6 w-full max-w-lg mx-auto">
              <button
                onClick={() => scrollToSection('education-programs')}
                className="inline-flex w-full sm:w-auto items-center justify-center px-2 py-2 sm:py-2.5 bg-yellow-500 text-black font-bold text-sm sm:text-base hover:bg-yellow-400 transition-all duration-200 hover:scale-105 shadow-lg hover:shadow-yellow-500/50"
              >
                Explore Bitcoin Programs
                <ArrowRight className="ml-2" size={18} />
              </button>
              <button
                onClick={() => scrollToSection('bitcoin-resources')}
                className="inline-flex w-full sm:w-auto items-center justify-center px-4 py-2 sm:py-2.5 bg-transparent border-2 border-yellow-500 text-yellow-500 font-bold text-sm sm:text-base hover:bg-yellow-500 hover:text-black transition-all duration-200"
              >
                Explore Bitcoin Resources
              </button>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
