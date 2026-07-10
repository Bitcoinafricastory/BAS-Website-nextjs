import { getAllNews } from '@/lib/news';
import NewsContent from './NewsContent';

export const revalidate = 300;

export const metadata = {
  title: 'Bitcoin News & Stories',
  description:
    'Stay updated with the latest Bitcoin news, adoption stories, and innovation spotlights from across the African continent.',
  alternates: { canonical: 'https://bitcoinafricastory.com/news' },
};

export default async function NewsListPage() {
  const posts = await getAllNews();
  return <NewsContent initialPosts={posts} />;
}
