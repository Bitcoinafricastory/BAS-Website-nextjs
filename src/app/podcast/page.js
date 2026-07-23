import Link from 'next/link';
import Image from 'next/image';
import { Play, Mic } from 'lucide-react';
import { getPodcastEpisodes } from '@/lib/news';
import { podcastListSchema, podcastSeriesSchema, breadcrumbSchema, jsonLdScript, resolveImageUrl, SITE_URL } from '@/lib/schema';
import Breadcrumbs from '@/components/Breadcrumbs';

export const revalidate = 300;

export const metadata = {
  title: 'The Podcast',
  description:
    'Real conversations with the merchants, builders, and communities putting Bitcoin to work across Africa — the Bitcoin Africa Story podcast.',
  alternates: { canonical: `${SITE_URL}/podcast` },
  openGraph: {
    title: 'The Bitcoin Africa Story Podcast',
    description: 'Conversations with the people building Bitcoin across Africa.',
    url: `${SITE_URL}/podcast`,
    siteName: 'Bitcoin Africa Story',
  },
};

export default async function PodcastPage() {
  const episodes = await getPodcastEpisodes();
  const [featured, ...rest] = episodes;

  const breadcrumbs = [
    { name: 'Home', url: SITE_URL },
    { name: 'Podcast', url: `${SITE_URL}/podcast` },
  ];
  const listSchema = podcastListSchema(episodes);
  const schemas = [breadcrumbSchema(breadcrumbs), podcastSeriesSchema(), listSchema].filter(Boolean);

  return (
    <div className="pt-24 pb-24 bg-black text-white min-h-screen">
      {schemas.map((schema, i) => (
        <script key={i} type="application/ld+json" dangerouslySetInnerHTML={jsonLdScript(schema)} />
      ))}

      <div className="max-w-6xl mx-auto px-6">
        <Breadcrumbs items={[{ name: 'Home', url: '/' }, { name: 'Podcast' }]} className="mb-6" />

        <div className="mb-10 max-w-xl">
          <h1 className="text-4xl md:text-5xl font-semibold leading-tight mb-4">
            Conversations from the <em className="italic text-yellow-500">ground.</em>
          </h1>
          <p className="text-gray-400 text-base sm:text-lg leading-relaxed">
            Real conversations with the merchants, builders, and communities putting Bitcoin to work across Africa.
          </p>
        </div>

        {episodes.length === 0 ? (
          <div className="bg-gray-900 border border-gray-800 rounded-2xl p-10 text-center">
            <div className="w-16 h-16 rounded-full bg-yellow-500/10 flex items-center justify-center mx-auto mb-4">
              <Mic className="text-yellow-500" size={28} />
            </div>
            <h2 className="text-xl font-bold mb-2">New episodes coming soon</h2>
            <p className="text-gray-400 max-w-lg mx-auto mb-6">
              In-depth conversations with builders, educators, and everyday Africans using Bitcoin.
            </p>
            <a href="https://youtube.com/@bitcoinafricastory" target="_blank" rel="noopener noreferrer" className="inline-block px-6 py-2.5 bg-yellow-500 text-black font-bold rounded-lg hover:bg-yellow-400 transition-colors">
              Watch on YouTube
            </a>
          </div>
        ) : (
          <>
            {/* Featured — most recent episode */}
            <a
              href={featured.url}
              target="_blank"
              rel="noopener noreferrer"
              className="group grid grid-cols-1 md:grid-cols-2 bg-gray-900 border border-gray-800 rounded-2xl overflow-hidden mb-14 hover:border-yellow-500/50 transition-colors"
            >
              <div className="relative aspect-square md:aspect-auto bg-black">
                {featured.image ? (
                  <Image
                    src={resolveImageUrl(featured.image)}
                    alt={featured.title}
                    fill
                    sizes="(min-width: 768px) 50vw, 100vw"
                    className="object-cover opacity-85 group-hover:opacity-100 transition-opacity"
                  />
                ) : (
                  <div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-yellow-500/10 to-transparent">
                    <Mic className="text-yellow-500/40" size={56} />
                  </div>
                )}
                <div className="absolute inset-0 flex items-center justify-center">
                  <div className="w-16 h-16 rounded-full bg-yellow-500 flex items-center justify-center group-hover:scale-110 transition-transform">
                    <Play className="text-black ml-1" size={26} fill="currentColor" />
                  </div>
                </div>
              </div>
              <div className="p-8 md:p-10 flex flex-col justify-center">
                <span className="text-yellow-500 text-xs font-extrabold uppercase tracking-widest mb-3">
                  Latest{featured.episodeNumber ? ` · Episode ${featured.episodeNumber}` : ''}
                </span>
                <h2 className="text-2xl font-bold leading-snug mb-3 group-hover:text-yellow-500 transition-colors">{featured.title}</h2>
                {featured.description && (
                  <p className="text-gray-400 text-sm leading-relaxed mb-5 line-clamp-3">{featured.description}</p>
                )}
                {featured.date && <span className="text-xs text-gray-500">{featured.date}</span>}
              </div>
            </a>

            {rest.length > 0 && (
              <>
                <h2 className="text-2xl font-bold mb-6">All episodes</h2>
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                  {rest.map((ep) => (
                    <a
                      key={ep.id}
                      href={ep.url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="group bg-gray-900 border border-gray-800 rounded-xl overflow-hidden hover:border-yellow-500 transition-all duration-300"
                    >
                      <div className="relative aspect-video bg-black">
                        {ep.image ? (
                          <Image
                            src={resolveImageUrl(ep.image)}
                            alt={ep.title}
                            fill
                            sizes="(min-width: 1024px) 33vw, (min-width: 640px) 50vw, 100vw"
                            className="object-cover opacity-75 group-hover:opacity-95 transition-opacity"
                          />
                        ) : (
                          <div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-yellow-500/10 to-transparent">
                            <Mic className="text-yellow-500/40" size={32} />
                          </div>
                        )}
                        <div className="absolute inset-0 flex items-center justify-center">
                          <div className="w-11 h-11 rounded-full bg-black/60 backdrop-blur-sm flex items-center justify-center group-hover:bg-yellow-500 transition-colors">
                            <Play size={16} className="text-white group-hover:text-black ml-0.5" fill="currentColor" />
                          </div>
                        </div>
                      </div>
                      <div className="p-5">
                        {ep.episodeNumber && <span className="text-[10px] font-bold text-yellow-500 uppercase tracking-wide">Episode {ep.episodeNumber}</span>}
                        <h3 className="font-bold mt-1 group-hover:text-yellow-500 transition-colors line-clamp-2 leading-snug">{ep.title}</h3>
                      </div>
                    </a>
                  ))}
                </div>
              </>
            )}
          </>
        )}
      </div>
    </div>
  );
}
