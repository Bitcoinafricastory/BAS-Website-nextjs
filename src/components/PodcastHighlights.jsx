import Link from 'next/link';
import { Mic, Play } from 'lucide-react';
import { resolveImageUrl } from '@/lib/schema';

export default function PodcastHighlights({ episodes = [] }) {
  const hasEpisodes = episodes.length > 0;

  return (
    <section className="py-16 px-6 bg-gradient-to-b from-gray-900/40 to-transparent">
      <div className="max-w-7xl mx-auto">
        <div className="flex items-center gap-3 mb-8">
          <div className="w-10 h-10 rounded-xl bg-yellow-500/10 border border-yellow-500/20 flex items-center justify-center">
            <Mic className="text-yellow-500" size={20} />
          </div>
          <div>
            <h2 className="text-2xl md:text-3xl font-bold">
              Podcast <span className="text-yellow-500">Highlights</span>
            </h2>
            <p className="text-sm text-gray-400">Conversations shaping Africa&rsquo;s Bitcoin story</p>
          </div>
        </div>

        {hasEpisodes ? (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {episodes.slice(0, 3).map((ep) => {
              const Wrapper = ep.url ? 'a' : 'div';
              const props = ep.url ? { href: ep.url, target: '_blank', rel: 'noopener noreferrer' } : {};
              return (
                <Wrapper key={ep.id} {...props} className="group bg-gray-900 border border-gray-800 rounded-xl overflow-hidden hover:border-yellow-500 transition-all duration-300">
                  <div className="aspect-video overflow-hidden relative bg-black">
                    {ep.image ? (
                      /* eslint-disable-next-line @next/next/no-img-element */
                      <img src={resolveImageUrl(ep.image)} alt={ep.title} className="w-full h-full object-cover opacity-70 group-hover:opacity-90 transition-opacity" />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-yellow-500/10 to-transparent">
                        <Mic className="text-yellow-500/40" size={48} />
                      </div>
                    )}
                    <div className="absolute inset-0 flex items-center justify-center">
                      <div className="w-14 h-14 rounded-full bg-yellow-500/90 flex items-center justify-center group-hover:scale-110 transition-transform">
                        <Play className="text-black ml-1" size={24} fill="currentColor" />
                      </div>
                    </div>
                  </div>
                  <div className="p-5">
                    {ep.episodeNumber && <span className="text-[10px] font-bold text-yellow-500 uppercase tracking-wide">Episode {ep.episodeNumber}</span>}
                    <h3 className="text-lg font-bold mt-1 group-hover:text-yellow-500 transition-colors line-clamp-2">{ep.title}</h3>
                    {ep.description && <p className="text-gray-400 text-sm mt-2 line-clamp-2">{ep.description}</p>}
                  </div>
                </Wrapper>
              );
            })}
          </div>
        ) : (
          // Clean placeholder until podcast episodes are wired into Firestore.
          <div className="bg-gray-900 border border-gray-800 rounded-2xl p-10 text-center">
            <div className="w-16 h-16 rounded-full bg-yellow-500/10 flex items-center justify-center mx-auto mb-4">
              <Mic className="text-yellow-500" size={28} />
            </div>
            <h3 className="text-xl font-bold mb-2">The Bitcoin Africa Story Podcast</h3>
            <p className="text-gray-400 max-w-lg mx-auto mb-6">
              In-depth conversations with builders, educators, and everyday Africans using Bitcoin. New
              episodes coming soon.
            </p>
            <div className="flex flex-wrap items-center justify-center gap-3">
              <a href="https://youtube.com/@bitcoinafricastory" target="_blank" rel="noopener noreferrer" className="px-6 py-2.5 bg-yellow-500 text-black font-bold rounded-lg hover:bg-yellow-400 transition-colors">
                Watch on YouTube
              </a>
              <Link href="/education" className="px-6 py-2.5 border border-yellow-500 text-yellow-500 font-bold rounded-lg hover:bg-yellow-500 hover:text-black transition-colors">
                Explore Education
              </Link>
            </div>
          </div>
        )}
      </div>
    </section>
  );
}
