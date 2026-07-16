import Link from 'next/link';
import { Search as SearchIcon, Calendar, Newspaper } from 'lucide-react';
import { getAllNews } from '@/lib/news';
import { getAllEvents } from '@/lib/events';
import { stripHtml } from '@/lib/article-content';
import { resolveImageUrl, SITE_URL } from '@/lib/schema';
import Breadcrumbs from '@/components/Breadcrumbs';
import SearchBox from '@/components/SearchBox';

export const revalidate = 300;

export async function generateMetadata({ searchParams }) {
  const { q } = await searchParams;
  const term = (q || '').trim();

  return {
    title: term ? `Search results for “${term}”` : 'Search',
    description: term
      ? `Search results for “${term}” across Bitcoin Africa Story news, stories, and events.`
      : 'Search Bitcoin Africa Story news, adoption stories, education, and events across Africa.',
    alternates: { canonical: `${SITE_URL}/search` },
    // Result pages shouldn't compete with real content in the index, but the
    // empty search page itself is a legitimate, indexable entry point.
    robots: term ? { index: false, follow: true } : undefined,
  };
}

function scoreMatch(haystack, term) {
  if (!haystack) return 0;
  const text = haystack.toLowerCase();
  if (!text.includes(term)) return 0;
  // Earlier + exact-ish matches rank higher.
  return text.startsWith(term) ? 3 : 1;
}

export default async function SearchPage({ searchParams }) {
  const { q } = await searchParams;
  const term = (q || '').trim().toLowerCase();

  let articles = [];
  let events = [];

  if (term) {
    const [posts, allEvents] = await Promise.all([getAllNews(), getAllEvents()]);

    articles = posts
      .map((post) => {
        const score =
          scoreMatch(post.title, term) * 5 +
          scoreMatch(post.category, term) * 3 +
          scoreMatch(post.excerpt, term) * 2 +
          scoreMatch(Array.isArray(post.tags) ? post.tags.join(' ') : post.tags, term) * 2 +
          scoreMatch(stripHtml(post.content).slice(0, 2000), term);
        return { post, score };
      })
      .filter((r) => r.score > 0)
      .sort((a, b) => b.score - a.score)
      .map((r) => r.post);

    events = allEvents
      .map((event) => {
        const score =
          scoreMatch(event.eventName, term) * 5 +
          scoreMatch(event.city, term) * 3 +
          scoreMatch(event.venue, term) * 2 +
          scoreMatch(event.description, term);
        return { event, score };
      })
      .filter((r) => r.score > 0)
      .sort((a, b) => b.score - a.score)
      .map((r) => r.event);
  }

  const total = articles.length + events.length;

  return (
    <div className="min-h-screen pt-24 pb-24">
      <div className="max-w-5xl mx-auto px-6">
        <Breadcrumbs
          items={[{ name: 'Home', url: '/' }, { name: 'Search' }]}
          className="mb-6"
        />

        <h1 className="text-3xl md:text-5xl font-semibold mb-3">
          Search <span className="text-yellow-500">Bitcoin Africa Story</span>
        </h1>
        <p className="text-gray-400 mb-8">
          Find news, adoption stories, and events from across the continent.
        </p>

        <SearchBox initialQuery={q || ''} />

        {!term && (
          <div className="mt-16 text-center">
            <SearchIcon className="mx-auto text-gray-700 mb-4" size={48} />
            <p className="text-gray-400">Enter a search term to get started.</p>
            <div className="mt-8">
              <p className="text-xs font-bold uppercase tracking-widest text-gray-600 mb-4">
                Popular topics
              </p>
              <div className="flex flex-wrap justify-center gap-3">
                {['Adoption', 'Education', 'Community', 'Lightning', 'Mining', 'Regulations'].map((t) => (
                  <Link
                    key={t}
                    href={`/search?q=${encodeURIComponent(t.toLowerCase())}`}
                    className="px-4 py-2 bg-gray-900 border border-gray-800 rounded-full text-sm text-gray-300 hover:border-yellow-500 hover:text-yellow-500 transition-colors"
                  >
                    {t}
                  </Link>
                ))}
              </div>
            </div>
          </div>
        )}

        {term && (
          <>
            <p className="mt-8 mb-8 text-sm text-gray-500">
              <span className="text-yellow-500 font-bold">{total}</span>{' '}
              {total === 1 ? 'result' : 'results'} for{' '}
              <span className="text-white font-semibold">&ldquo;{q}&rdquo;</span>
            </p>

            {total === 0 && (
              <div className="py-16 text-center bg-gray-900/50 border border-gray-800 rounded-xl">
                <SearchIcon className="mx-auto text-gray-700 mb-4" size={40} />
                <p className="text-lg text-gray-300 font-medium mb-2">No results found</p>
                <p className="text-sm text-gray-500 mb-6">
                  Try a different term, or browse our latest coverage.
                </p>
                <div className="flex flex-wrap justify-center gap-3">
                  <Link href="/news" className="px-5 py-2.5 bg-yellow-500 text-black font-bold rounded-lg hover:brightness-95 transition-all">
                    Browse News
                  </Link>
                  <Link href="/events" className="px-5 py-2.5 border border-yellow-500 text-yellow-500 font-bold rounded-lg hover:bg-yellow-500 hover:text-black transition-colors">
                    Browse Events
                  </Link>
                </div>
              </div>
            )}

            {articles.length > 0 && (
              <section className="mb-14">
                <div className="flex items-center gap-2 mb-6">
                  <Newspaper size={18} className="text-yellow-500" />
                  <h2 className="text-xl font-bold">
                    News &amp; Stories{' '}
                    <span className="text-gray-600 font-normal">({articles.length})</span>
                  </h2>
                </div>
                <div className="space-y-4">
                  {articles.map((post) => (
                    <Link
                      key={post.id}
                      href={`/news/${post.slug || post.id}`}
                      className="group flex gap-5 p-4 bg-gray-900 border border-gray-800 rounded-xl hover:border-yellow-500/50 transition-colors"
                    >
                      {post.image && (
                        /* eslint-disable-next-line @next/next/no-img-element */
                        <img
                          src={resolveImageUrl(post.image)}
                          alt={post.imageAlt || post.title}
                          className="w-28 h-20 object-cover rounded-lg flex-shrink-0 hidden sm:block"
                        />
                      )}
                      <div className="min-w-0">
                        {post.category && (
                          <span className="text-[10px] font-bold uppercase tracking-widest text-yellow-500">
                            {post.category}
                          </span>
                        )}
                        <h3 className="font-bold mt-1 group-hover:text-yellow-500 transition-colors line-clamp-2">
                          {post.title}
                        </h3>
                        {post.excerpt && (
                          <p className="text-sm text-gray-500 mt-1 line-clamp-2">{post.excerpt}</p>
                        )}
                      </div>
                    </Link>
                  ))}
                </div>
              </section>
            )}

            {events.length > 0 && (
              <section>
                <div className="flex items-center gap-2 mb-6">
                  <Calendar size={18} className="text-yellow-500" />
                  <h2 className="text-xl font-bold">
                    Events <span className="text-gray-600 font-normal">({events.length})</span>
                  </h2>
                </div>
                <div className="space-y-4">
                  {events.map((event) => (
                    <Link
                      key={event.id}
                      href={`/events/${event.id}`}
                      className="group flex gap-5 p-4 bg-gray-900 border border-gray-800 rounded-xl hover:border-yellow-500/50 transition-colors"
                    >
                      <div className="min-w-0">
                        <span className="text-[10px] font-bold uppercase tracking-widest text-yellow-500">
                          {event.format === 'virtual' ? 'Online Event' : 'In-Person'}
                        </span>
                        <h3 className="font-bold mt-1 group-hover:text-yellow-500 transition-colors line-clamp-2">
                          {event.eventName}
                        </h3>
                        <p className="text-sm text-gray-500 mt-1">
                          {[event.date, event.city, event.venue].filter(Boolean).join(' · ')}
                        </p>
                      </div>
                    </Link>
                  ))}
                </div>
              </section>
            )}
          </>
        )}
      </div>
    </div>
  );
}
