import Link from 'next/link';
import { ArrowRight, BookOpen, Users, Mic, TrendingUp } from 'lucide-react';

export default function Mission() {
  return (
    <section className="py-20 px-6 bg-gradient-to-b from-transparent to-gray-900/30">
      <div className="max-w-6xl mx-auto">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
          <div>
            <div className="hidden sm:inline-block mb-4 px-3 py-1 bg-yellow-500/10 border border-yellow-500/30 rounded-full">
              <span className="text-yellow-500 text-sm font-semibold">Our Mission</span>
            </div>
            <h2 className="text-4xl md:text-5xl font-semibold mb-6">
              Spreading Bitcoin Adoption Across <span className="text-yellow-500">Africa</span>
            </h2>
            <p className="text-lg text-gray-300 mb-6 leading-relaxed">
              To accelerate Bitcoin adoption in Africa through education, community empowerment,
              grassroots initiatives, and storytelling all aimed at making Bitcoin practical for everyday
              Africans.
            </p>
            <Link href="/about" className="inline-flex items-center text-yellow-500 font-semibold hover:text-yellow-400 transition-colors duration-200">
              Read Our Full Story
              <ArrowRight className="ml-2" size={20} />
            </Link>
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-4">
              <div className="p-6 bg-[#0A0A0A] border border-white/5 hover:border-yellow-500/50 transition-colors duration-300">
                <BookOpen className="text-yellow-500 mb-3" size={32} />
                <h3 className="text-lg font-semibold mb-2">Education</h3>
                <p className="text-sm text-gray-400">Practical Bitcoin training for schools, youth, and merchants</p>
              </div>
              <div className="p-6 bg-[#0A0A0A] border border-white/5 hover:border-yellow-500/50 transition-colors duration-300">
                <Mic className="text-yellow-500 mb-3" size={32} />
                <h3 className="text-lg font-semibold mb-2">Storytelling</h3>
                <p className="text-sm text-gray-400">Real stories of Bitcoin adoption across Africa</p>
              </div>
            </div>
            <div className="space-y-4 mt-0 sm:mt-8">
              <div className="p-6 bg-[#0A0A0A] border border-white/5 hover:border-yellow-500/50 transition-colors duration-300">
                <Users className="text-yellow-500 mb-3" size={32} />
                <h3 className="text-lg font-semibold mb-2">Community Development</h3>
                <p className="text-sm text-gray-400">Building sustainable Bitcoin circular economies</p>
              </div>
              <div className="p-6 bg-[#0A0A0A] border border-white/5 hover:border-yellow-500/50 transition-colors duration-300">
                <TrendingUp className="text-yellow-500 mb-3" size={32} />
                <h3 className="text-lg font-semibold mb-2">Research and Insights</h3>
                <p className="text-sm text-gray-400">Studying adoption patterns to guide our programs</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
