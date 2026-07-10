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
          <div className="w-full lg:w-2/3 text-center mt-12 md:mt-10 mx-auto">
            <div className="inline-block mb-6 px-4 py-2 bg-yellow-500/10 border border-yellow-500/30 rounded-full">
              <span className="text-yellow-500 text-sm font-semibold">Bringing Signal to the Noise</span>
            </div>

            <h1 className="text-4xl sm:text-6xl md:text-6xl lg:text-7xl md:font-extrabold mb-4 leading-tight">
              <span> Showing </span> <br className="sm:hidden" /> <span>Africa&rsquo;s </span> <br className="sm:hidden" /> <span> Bitcoin </span> <br /> <span className="text-[#FAD604]"> Proof-of-Work. </span>
            </h1>

            <p className="text-lg md:text-xl text-gray-300 mb-8 max-w-2xl mx-auto">
              Driving Bitcoin Adoption Through Education, Community Building, and Real Stories!
            </p>

            <div className="flex sm:flex-row mt-5 gap-3 justify-center mb-6 w-full max-w-lg mx-auto">
              <Link href="/news" className="inline-flex w-full sm:w-auto items-center justify-center px-4 py-4 sm:py-2.5 bg-yellow-500 text-black font-bold text-sm sm:text-base hover:bg-yellow-400 transition-all duration-200 hover:scale-105 shadow-lg hover:shadow-yellow-500/50">
                View Stories
                <ArrowRight className="ml-2" size={18} />
              </Link>
              <Link href="/education" className="inline-flex w-full sm:w-auto items-center justify-center px-4 py-4 sm:py-2.5 bg-transparent border-2 border-yellow-500 text-yellow-500 font-bold text-sm sm:text-base hover:bg-yellow-500 hover:text-black transition-all duration-200">
                Study Bitcoin
              </Link>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
