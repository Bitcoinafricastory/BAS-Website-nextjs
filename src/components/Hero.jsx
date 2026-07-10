import Link from 'next/link';
import { ArrowRight } from 'lucide-react';

export default function Hero() {
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

      <div className="relative z-10 max-w-7xl mx-auto px-6 w-full">
        <div className="flex flex-col lg:flex-row items-start gap-8 lg:gap-16">
          <div className="w-full lg:w-1/2 text-left mt-12 md:mt-10 lg:text-left">
            <div className="hidden sm:inline-block mb-6 px-4 py-2 bg-yellow-500/10 border border-yellow-500/30 rounded-full">
              <span className="text-yellow-500 text-sm font-semibold">Bringing Signal to the Noise</span>
            </div>

            <h1 className="text-5xl sm:text-7xl md:text-6xl lg:text-7xl md:font-extrabold mb-4 leading-tight">
              <span> Showing </span> <br className="sm:hidden" /> <span>Africa&rsquo;s </span> <br className="sm:hidden" /> <span> Bitcoin </span> <br /> <span className="text-[#FAD604]"> Proof-of-Work. </span>
            </h1>

            <p className="text-lg md:text-xl text-gray-300 mb-8 max-w-2xl">
              Driving Bitcoin Adoption Through Education, Community Building, and Real Stories!
            </p>

            <div className="flex sm:flex-row mt-5 gap-3 justify-start mb-6 w-full max-w-lg">
              <Link href="/news" className="inline-flex w-full sm:w-auto items-center justify-center px-4 py-4 sm:py-2.5 bg-yellow-500 text-black font-bold text-sm sm:text-base hover:bg-yellow-400 transition-all duration-200 hover:scale-105 shadow-lg hover:shadow-yellow-500/50">
                View Stories
                <ArrowRight className="ml-2" size={18} />
              </Link>
              <Link href="/education" className="inline-flex w-full sm:w-auto items-center justify-center px-4 py-4 sm:py-2.5 bg-transparent border-2 border-yellow-500 text-yellow-500 font-bold text-sm sm:text-base hover:bg-yellow-500 hover:text-black transition-all duration-200">
                Study Bitcoin
              </Link>
            </div>
          </div>

          <div className="w-full hidden lg:w-1/2 lg:flex items-center justify-center">
            <div className="relative w-[460px] h-[300px] lg:w-[520px] lg:h-[360px]">
              <div className="absolute right-0 top-0 w-[320px] h-[240px] lg:w-[360px] lg:h-[270px] rounded-2xl overflow-hidden border border-gray-800 shadow-lg">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img src="https://images.unsplash.com/photo-1529333166437-7750a6dd5a70?w=1000&q=80" alt="student-1" className="w-full h-full object-cover grayscale-[10%]" />
              </div>
              <div className="absolute left-0 bottom-[-70px] w-[300px] h-[260px] lg:w-[340px] lg:h-[300px] rounded-2xl overflow-hidden border border-gray-800 shadow-xl transform -translate-y-6 lg:-translate-y-8">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img src="https://images.unsplash.com/photo-1551836022-d5d88e9218df?w=1000&q=80" alt="student-2" className="w-full h-full object-cover grayscale-[10%]" />
              </div>
              <div className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 w-[212px] h-[212px] lg:w-[232px] lg:h-[232px] rounded-xl overflow-hidden border-2 border-yellow-500 shadow-md bg-gradient-to-tr from-yellow-500/10 to-transparent flex items-center justify-center">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img src="https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?w=800&q=80" alt="student-3" className="w-full h-full object-cover rounded-lg filter grayscale-[10%]" />
              </div>
              <div className="absolute -left-6 -top-6 w-6 h-6 rounded-full bg-yellow-500/80 blur-sm" aria-hidden="true" />
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
