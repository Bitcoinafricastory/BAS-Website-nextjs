import Link from 'next/link';
import Image from 'next/image';
import { getAllNews, getTestimonials } from '@/lib/news';
import { getEntities, selectFeaturedEntities } from '@/lib/entities';
import Hero from '@/components/Hero';
import Mission from '@/components/Mission';
import PostsGrid from '@/components/PostsGrid';
import TestimonialCarousel from '@/components/TestimonialCarousel';

export const revalidate = 300;

export default async function HomePage() {
  const [posts, entities, testimonials] = await Promise.all([
    getAllNews(),
    getEntities(),
    getTestimonials(),
  ]);
  const featuredEntities = selectFeaturedEntities(entities, 6);

  const groupedPosts = posts.slice(0).reverse().reduce((acc, post) => {
    const cat = post.category || 'Uncategorized';
    if (!acc[cat]) acc[cat] = [];
    acc[cat].push(post);
    return acc;
  }, {});
  const categoriesToShow = Object.keys(groupedPosts);

  return (
    <div className="pt-16">

      <Hero />

      <Mission />

      <section className="py-20 px-6">
        <div className="max-w-7xl mx-auto">
          <div className="flex flex-col md:flex-row md:justify-between md:items-end gap-4 mb-12">
            <div>
              <h2 className="text-4xl md:text-5xl font-bold mb-4">
                From Our News and <span className="text-yellow-500">Stories</span>
              </h2>
              <p className="text-xl text-gray-400">Latest insights on Bitcoin Movement and adoption in Africa</p>
            </div>
            <Link href="/news" className="hidden md:inline-flex items-center text-yellow-500 font-semibold hover:text-yellow-400 transition-colors duration-200">
              View All Posts →
            </Link>
          </div>

          {categoriesToShow.map((cat) => {
            const catPosts = (groupedPosts[cat] || []).slice(0, 3);
            if (catPosts.length === 0) return null;
            return (
              <div key={cat} className="mb-16">
                <h3 className="text-2xl md:text-3xl font-bold mb-8">{cat}</h3>
                <PostsGrid posts={catPosts} />
              </div>
            );
          })}

          <div className="text-center mt-8 md:hidden">
            <Link href="/news" className="inline-flex items-center text-yellow-500 font-semibold hover:text-yellow-400 transition-colors duration-200">
              View All Posts →
            </Link>
          </div>
        </div>
      </section>

      <section className="py-20 px-6 bg-gradient-to-b from-gray-900/30 to-transparent">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-4xl md:text-5xl font-bold mb-4">
              Success <span className="text-yellow-500">Stories</span>
            </h2>
            <p className="text-xl text-gray-400 max-w-2xl mx-auto">
              Hear from learners who transformed their financial futures with Bitcoin
            </p>
          </div>

          <TestimonialCarousel testimonials={testimonials} />
        </div>
      </section>

      <section className="py-20 px-6">
        <div className="max-w-6xl mx-auto">
          <div className="flex items-end justify-between mb-8">
            <div>
              <h2 className="text-2xl md:text-3xl font-bold text-white">Featured in the Directory</h2>
              <p className="text-sm text-gray-400 mt-2 max-w-xl">
                Communities, companies, projects, and people building Bitcoin across Africa — verified
                by our reporters, not scraped from a database.
              </p>
            </div>
            <Link href="/directory" className="hidden md:inline-flex items-center text-sm text-yellow-500 font-semibold hover:text-yellow-400 transition-colors flex-shrink-0">
              View Full Directory →
            </Link>
          </div>

          {featuredEntities.length === 0 ? (
            <div className="text-center py-12 bg-gray-900/50 border border-gray-800 rounded-xl">
              <p className="text-gray-400">No entities available yet.</p>
            </div>
          ) : (
            <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-6 gap-6 mb-8">
              {featuredEntities.map((entity, i) => {
                // 2 on mobile, 4 on tablet (sm+), 6 on desktop (lg+).
                const visibility = i < 2 ? '' : i < 4 ? 'hidden sm:flex' : 'hidden lg:flex';
                return (
                  <Link
                    key={entity.id}
                    href={`/directory/${entity.slug}`}
                    title={entity.name}
                    className={`flex-col items-center gap-3 group ${visibility || 'flex'}`}
                  >
                    <div className="relative w-full aspect-square bg-gray-900 border border-gray-800 rounded-xl overflow-hidden group-hover:border-yellow-500/50 transition-colors">
                      {entity.logo && (
                        <Image src={entity.logo} alt={entity.name} fill sizes="(min-width: 1024px) 200px, (min-width: 640px) 25vw, 45vw" className="object-contain p-5" />
                      )}
                    </div>
                    <p className="text-sm text-gray-400 text-center truncate w-full group-hover:text-gray-300 transition-colors">{entity.name}</p>
                  </Link>
                );
              })}
            </div>
          )}

          <div className="text-center md:hidden">
            <Link
              href="/directory"
              className="inline-flex items-center gap-2 text-sm font-bold text-black bg-yellow-500 px-6 py-3 hover:bg-yellow-400 transition-colors"
            >
              View Full Directory
            </Link>
          </div>
        </div>
      </section>
    </div>
  );
}
