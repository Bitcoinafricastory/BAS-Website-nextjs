import Image from 'next/image';
import Link from 'next/link';
import { ArrowUpRight } from 'lucide-react';

export default function OtherBitcoinPrograms({ programs = [] }) {
  if (programs.length === 0) return null;

  return (
    <section className="py-24 bg-black text-white">
      <div className="max-w-7xl mx-auto px-6">
        <div className="mb-16">
          <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-lg bg-yellow-500 text-black text-[10px] font-medium uppercase tracking-widest mb-6">
            OTHER BITCOIN EDUCATION PROGRAMS
          </div>
          <h2 className="text-3xl sm:text-4xl lg:text-5xl font-semibold mb-4">
            Other Bitcoin <span className="text-yellow-500">Programs</span>
          </h2>
          <p className="text-gray-400 text-lg max-w-2xl">
            Explore more Bitcoin Educational Program across and beyond Africa.
          </p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {programs.map((program) => (
            <Link
              key={program.id}
              href={`/education/programs/${program.id}`}
              className="group relative flex flex-col bg-[#0A0A0A] overflow-hidden border border-white/5 hover:border-yellow-500/50 transition-all duration-500 min-h-[420px]"
            >
              <div className="relative h-[240px] overflow-hidden">
                {program.image && (
                  <Image
                    src={program.image}
                    alt={program.title}
                    fill
                    sizes="(min-width: 768px) 33vw, 100vw"
                    className="object-cover opacity-90 transition-transform duration-700 group-hover:scale-110 group-hover:opacity-100"
                  />
                )}
                <div className="absolute bottom-0 left-0">
                  <span className={`inline-block px-3 py-1 text-[10px] font-medium ${program.level === 'EXPERT' ? 'bg-black text-white border-t border-r border-white/20' : 'bg-yellow-500 text-black'}`}>
                    {program.level} | {program.price}
                  </span>
                </div>
              </div>
              <div className="p-6 flex flex-col flex-grow">
                <h3 className="text-lg font-semibold mb-3 line-clamp-2 leading-tight group-hover:text-yellow-500 transition-colors uppercase tracking-tight">{program.title}</h3>
                <p className="text-gray-400 text-sm mb-6 line-clamp-3 leading-relaxed">{program.desc}</p>
                <div className="mt-auto pt-4 border-t border-white/5">
                  <span className="group/btn flex items-center gap-2 text-[10px] font-medium text-yellow-500 group-hover:text-white transition-colors uppercase tracking-widest">
                    View details
                    <span className="w-4 h-4 rounded-full bg-yellow-500/10 flex items-center justify-center group-hover:bg-yellow-500 group-hover:text-black transition-colors duration-200">
                      <ArrowUpRight className="w-2.5 h-2.5" />
                    </span>
                  </span>
                </div>
              </div>
            </Link>
          ))}
        </div>
      </div>
    </section>
  );
}
