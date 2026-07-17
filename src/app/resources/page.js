import { getPodcastEpisodes } from '@/lib/news';
import ResourcesContent from './ResourcesContent';

export const revalidate = 300;

export const metadata = {
  title: 'Bitcoin Tools & Resources',
  description:
    'Access curated Bitcoin guides, secure wallet recommendations, and technical learning resources for your Bitcoin journey in Africa.',
  alternates: { canonical: 'https://bitcoinafricastory.com/resources' },
};

export default async function ResourcesPage() {
  const episodes = await getPodcastEpisodes();
  return <ResourcesContent episodes={episodes.slice(0, 3)} />;
}
