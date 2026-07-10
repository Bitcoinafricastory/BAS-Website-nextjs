import Link from 'next/link';
import { getAllNews, getPodcastEpisodes } from '@/lib/news';
import {
  getFeatured,
  getLatest,
  getEditorsPicks,
  getTrending,
  getMostRead,
  getAllTags,
  getCategoryCounts,
} from '@/lib/editorial';
import { FeaturedCard, StoryCard, RankedItem, HorizontalCard } from '@/components/ArticleCards';
import NewsletterSignup from '@/components/NewsletterSignup';
import PodcastHighlights from '@/components/PodcastHighlights';
import NewsExplorer from './NewsExplorer';
import { SITE_URL } from '@/lib/schema';

export const revalidate = 300;

export const metadata = {
  title: 'Bitcoin News & Stories',
  description:
    'The editorial home of Bitcoin Africa Story — featured stories, trending analysis, and the latest Bitcoin adoption news from across the African continent.',
  alternates: { canonical: `${SITE_URL}/news` },
};

function SectionHeading({ eyebrow, title, href }) {
  return (
    <div className="flex items-end justify-between mb-6">
      <div>
        {eyebrow && <span className="text-xs font-bold text-yellow-500 uppercase tracking-widest">{eyebrow}</span>}
        <h2 className="text-2xl md:text-3xl font-bold mt-1">{title}</h2>
      </div>
      {href && (
        <Link href={href} className="hidden md:inline-flex items-center text-sm text-yellow-500 font-semibold hover:text-yellow-400 transition-colors">
          View all →
        </Link>
      )}
    </div>
  );
}

export default async function NewsPage() {
  const [posts, podcastEpisodes] = await Promise.all([getAllNews(), getPodcastEpisodes()]);

  const featured = getFeatured(posts);
  const featuredId = featured ? [featured.id] : [];

  const latest = getLatest(posts, 6, featuredId);
  const editorsPicks = getEditorsPicks(posts, 4, featuredId);
  const trending = getTrending(posts, 4, featuredId);
  const mostRead = getMostRead(posts, 5);
  const tags = getAllTags(posts).slice(0, 16);
  const categories = getCategoryCounts(posts);

  return (
    <div className="pt-16 bg-black text-white">
      {/* ===== Featured Story ===== */}
      <section className="max-w-7xl mx-auto px-6 pt-12 pb-8">
        <div className="mb-8">
          <h1 className="text-4xl md:text-5xl font-black">
            The Pulse of <span className="text-yellow-500">Bitcoin in Africa</span>
          </h1>
          <p className="text-gray-400 mt-3 max-w-2xl">
            Spotlighting innovation, grassroots adoption, policy developments, and the people using Bitcoin
            to build financial freedom.
          </p>
        </div>
        <FeaturedCard post={featured} />
      </section>

      {/* ===== Latest + Most Read sidebar ===== */}
      <section className="max-w-7xl mx-auto px-6 py-12">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-10">
          <div className="lg:col-span-2">
            <SectionHeading eyebrow="Fresh off the press" title="Latest Stories" href="/news/category/adoption" />
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
              {latest.map((post) => (
                <StoryCard key={post.id} post={post} />
              ))}
            </div>
          </div>

          <aside className="lg:col-span-1">
            <SectionHeading eyebrow="Reader favorites" title="Most Read" />
            <div className="bg-gray-900/50 border border-gray-800 rounded-xl px-5">
              {mostRead.map((post, i) => (
                <RankedItem key={post.id} post={post} rank={i + 1} />
              ))}
            </div>

            {/* Categories block */}
            <div className="mt-8">
              <SectionHeading eyebrow="Browse" title="Categories" />
              <div className="flex flex-wrap gap-2">
                {categories.map((cat) => (
                  <Link
                    key={cat.name}
                    href={`/news/category/${cat.name.toLowerCase()}`}
                    className="inline-flex items-center gap-2 px-3 py-1.5 bg-gray-900 border border-gray-800 rounded-full text-sm text-gray-300 hover:border-yellow-500 hover:text-yellow-500 transition-all"
                  >
                    {cat.name}
                    <span className="text-xs text-gray-500">{cat.count}</span>
                  </Link>
                ))}
              </div>
            </div>
          </aside>
        </div>
      </section>

      {/* ===== Editor's Picks ===== */}
      {editorsPicks.length > 0 && (
        <section className="max-w-7xl mx-auto px-6 py-12 border-t border-gray-800">
          <SectionHeading eyebrow="Handpicked by our team" title="Editor's Picks" />
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {editorsPicks.map((post) => (
              <StoryCard key={post.id} post={post} />
            ))}
          </div>
        </section>
      )}

      {/* ===== Trending ===== */}
      {trending.length > 0 && (
        <section className="max-w-7xl mx-auto px-6 py-12 border-t border-gray-800">
          <SectionHeading eyebrow="What people are reading now" title="Trending Stories" />
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {trending.map((post) => (
              <HorizontalCard key={post.id} post={post} />
            ))}
          </div>
        </section>
      )}

      {/* ===== Podcast Highlights ===== */}
      <PodcastHighlights episodes={podcastEpisodes} />

      {/* ===== Topic Tags ===== */}
      {tags.length > 0 && (
        <section className="max-w-7xl mx-auto px-6 py-12 border-t border-gray-800">
          <SectionHeading eyebrow="Explore by topic" title="Topics & Tags" />
          <div className="flex flex-wrap gap-3">
            {tags.map((tag) => (
              <Link
                key={tag.name}
                href={`/news/category/${tag.name.toLowerCase()}`}
                className="px-4 py-2 bg-gray-900 border border-gray-800 rounded-lg text-sm text-gray-300 hover:border-yellow-500 hover:text-yellow-500 transition-all"
              >
                #{tag.name}
              </Link>
            ))}
          </div>
        </section>
      )}

      {/* ===== Newsletter ===== */}
      <section className="max-w-7xl mx-auto px-6 py-12">
        <NewsletterSignup />
      </section>

      {/* ===== Full archive: category filter + submit story (client) ===== */}
      <section className="max-w-7xl mx-auto px-6 py-12 border-t border-gray-800">
        <SectionHeading eyebrow="The full archive" title="All Stories" />
        <NewsExplorer initialPosts={posts} />
      </section>
    </div>
  );
}
