import Image from 'next/image';
import { ArrowUpRight } from 'lucide-react';

export default function BitcoinResources({ resources = [] }) {
  if (resources.length === 0) return null;

  return (
    <section id="bitcoin-resources" className="bg-black text-white py-16">
      <div className="container mx-auto px-6">
        <div className="mb-6">
          <div className="inline-block bg-yellow-400 text-black text-xs font-semibold px-3 py-1 rounded-sm">BITCOIN RESOURCES</div>
        </div>

        <div className="mb-6 max-w-3xl text-gray-300 text-sm">
          <p>
            A curated selection of Bitcoin resources — whitepapers, tools, maps and community projects to
            help you explore further.
          </p>
        </div>

        {/* Mobile/tablet: horizontal snap carousel, natural card height instead
            of a forced 400px minimum that left empty space under short copy. */}
        <div className="flex lg:hidden gap-5 overflow-x-auto snap-x snap-mandatory scroll-px-6 px-6 -mx-6 pb-2 [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
          {resources.map((r) => {
            const CardWrapper = r.link ? 'a' : 'article';
            const extraProps = r.link ? { href: r.link, target: '_blank', rel: 'noopener noreferrer' } : {};
            return (
              <CardWrapper key={r.id} {...extraProps} className="snap-start shrink-0 w-[82%] sm:w-[46%] group relative flex flex-col bg-[#0A0A0A] border border-white/5 hover:border-yellow-500/50 transition-all duration-500 cursor-pointer">
                <div className="relative h-[160px] overflow-hidden bg-yellow-100/5">
                  {r.imageSrc ? (
                    <Image
                      src={r.imageSrc}
                      alt={r.imageAlt || r.title}
                      fill
                      sizes="82vw"
                      className="object-cover opacity-80 transition-transform duration-700 group-hover:scale-110 group-hover:opacity-100"
                    />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center bg-yellow-900/20">
                      <span className="text-xs font-medium text-center text-yellow-500">{r.title.toUpperCase()}</span>
                    </div>
                  )}
                </div>
                <div className="p-5 flex flex-col flex-grow">
                  <h4 className="text-base font-semibold mb-2 line-clamp-2 leading-tight group-hover:text-yellow-500 transition-colors uppercase text-white tracking-tight">{r.title}</h4>
                  <p className="text-gray-400 text-sm mb-4 line-clamp-3 leading-relaxed">{r.subtitle}</p>
                  <div className="mt-auto pt-3 border-t border-white/5">
                    <span className="flex items-center gap-2 text-[10px] font-medium text-yellow-500 group-hover:text-white transition-colors uppercase tracking-widest">
                      ACCESS RESOURCE
                      <ArrowUpRight className="w-3 h-3 transition-transform group-hover:-translate-y-0.5 group-hover:translate-x-0.5" />
                    </span>
                  </div>
                </div>
              </CardWrapper>
            );
          })}
        </div>

        {/* Desktop: static grid */}
        <div className="hidden lg:grid lg:grid-cols-4 gap-6">
          {resources.map((r) => {
            const CardWrapper = r.link ? 'a' : 'article';
            const extraProps = r.link ? { href: r.link, target: '_blank', rel: 'noopener noreferrer' } : {};
            return (
              <CardWrapper key={r.id} {...extraProps} className="group relative flex flex-col bg-[#0A0A0A] border border-white/5 hover:border-yellow-500/50 transition-all duration-500 min-h-[400px] cursor-pointer">
                <div className="relative h-[200px] overflow-hidden bg-yellow-100/5">
                  {r.imageSrc ? (
                    <Image
                      src={r.imageSrc}
                      alt={r.imageAlt || r.title}
                      fill
                      sizes="33vw"
                      className="object-cover opacity-80 transition-transform duration-700 group-hover:scale-110 group-hover:opacity-100"
                    />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center bg-yellow-900/20">
                      <span className="text-xs font-medium text-center text-yellow-500">{r.title.toUpperCase()}</span>
                    </div>
                  )}
                </div>
                <div className="p-6 flex flex-col flex-grow">
                  <h4 className="text-lg font-semibold mb-2 line-clamp-2 leading-tight group-hover:text-yellow-500 transition-colors uppercase text-white tracking-tight">{r.title}</h4>
                  <p className="text-gray-400 text-sm mb-6 line-clamp-3 leading-relaxed">{r.subtitle}</p>
                  <div className="mt-auto pt-4 border-t border-white/5">
                    <span className="flex items-center gap-2 text-[10px] font-medium text-yellow-500 group-hover:text-white transition-colors uppercase tracking-widest">
                      ACCESS RESOURCE
                      <ArrowUpRight className="w-3 h-3 transition-transform group-hover:-translate-y-0.5 group-hover:translate-x-0.5" />
                    </span>
                  </div>
                </div>
              </CardWrapper>
            );
          })}
        </div>
      </div>
    </section>
  );
}
