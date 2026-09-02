import { Mic } from 'lucide-react';
import { getPodcastEpisodes } from '@/lib/news';
import { podcastListSchema, podcastSeriesSchema, breadcrumbSchema, jsonLdScript, resolveImageUrl, SITE_URL, podcastVideoSchema } from '@/lib/schema';
import Breadcrumbs from '@/components/Breadcrumbs';
import { FeaturedEpisode, EpisodeGrid } from '@/components/PodcastGrid';

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
  const rawEpisodes = await getPodcastEpisodes();
  const episodes = rawEpisodes.map((ep) => ({ ...ep, image: ep.image ? resolveImageUrl(ep.image) : null }));
  const [featured, ...rest] = episodes;

  const breadcrumbs = [
    { name: 'Home', url: SITE_URL },
    { name: 'Podcast', url: `${SITE_URL}/podcast` },
  ];
  const listSchema = podcastListSchema(episodes);
  const videoSchemas = episodes.map((ep) => podcastVideoSchema(ep));
  const schemas = [breadcrumbSchema(breadcrumbs), podcastSeriesSchema(), listSchema, ...videoSchemas].filter(Boolean);

  return (
    <div className="pt-24 pb-24 bg-black text-white min-h-screen">
      {schemas.map((schema, i) => (
        <script key={i} type="application/ld+json" dangerouslySetInnerHTML={jsonLdScript(schema)} />
      ))}

      <div className="max-w-6xl mx-auto px-6">
        <Breadcrumbs items={[{ name: 'Home', url: '/' }, { name: 'Podcast' }]} className="mb-6" />

        <div className="mb-10 max-w-xl">
          <h1 className="text-4xl sm:text-5xl lg:text-[54px] font-semibold leading-tight mb-4">
            Conversations from the <em className="italic text-yellow-500">ground.</em>
          </h1>
          <p className="text-gray-400 text-base sm:text-lg leading-relaxed">
            Real conversations with the merchants, builders, and communities putting Bitcoin to work across Africa.
          </p>
        </div>

        {episodes.length === 0 ? (
          <div className="bg-[#0A0A0A] border border-white/5 p-10 text-center">
            <div className="w-16 h-16 rounded-full bg-yellow-500/10 flex items-center justify-center mx-auto mb-4">
              <Mic className="text-yellow-500" size={28} />
            </div>
            <h2 className="text-xl font-semibold mb-2">New episodes coming soon</h2>
            <p className="text-gray-400 max-w-lg mx-auto mb-6">
              In-depth conversations with builders, educators, and everyday Africans using Bitcoin.
            </p>
            <a href="https://youtube.com/@bitcoinafricastory" target="_blank" rel="noopener noreferrer" className="inline-block px-6 py-2.5 bg-yellow-500 text-black font-semibold rounded-lg hover:bg-yellow-400 transition-colors">
              Watch on YouTube
            </a>
          </div>
        ) : (
          <>
            <FeaturedEpisode episode={featured} />

            {rest.length > 0 && (
              <>
                <h2 className="text-2xl font-semibold mb-6">All episodes</h2>
                <EpisodeGrid episodes={rest} />
              </>
            )}
          </>
        )}
      </div>
    </div>
  );
}
