import Link from 'next/link';
import Image from 'next/image';
import { getAllNews, getTestimonials } from '@/lib/news';
import { getEntities, selectFeaturedEntities } from '@/lib/entities';
import Hero from '@/components/Hero';
import Mission from '@/components/Mission';
import PostsGrid from '@/components/PostsGrid';
import TestimonialCarousel from '@/components/TestimonialCarousel';

export const revalidate = 300;

const features = [
  {
    id: '1',
    title: 'Education',
    description:
      'We provide practical Bitcoin training for schools, youth, merchants, and communities, helping people understand and use Bitcoin confidently.',
    image: '/assets/education.jpg',
  },
  {
    id: '2',
    title: 'Storytelling',
    description:
      'We document and share real stories of Bitcoin adoption across Africa, highlighting the people, challenges, and progress in each community.',
    image: '/assets/story.jpg',
  },
  {
    id: '3',
    title: 'Community Development ',
    description:
      'We support communities in building sustainable Bitcoin circular economies through merchant onboarding, local spending, and hands-on guidance.',
    image: '/assets/communities.jpg',
  },
  {
    id: '4',
    title: 'Research and Insights',
    description:
      'We study Bitcoin usage, community needs, adoption patterns, and emerging trends to guide our programs and share valuable insights with the ecosystem.',
    image: '/assets/research.jpg',
  },
];

export default async function HomePage() {
  const [posts, entities, testimonials] = await Promise.all([
    getAllNews(),
    getEntities(),
    getTestimonials(),
  ]);
  const featuredEntities = selectFeaturedEntities(entities, 9);

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

      <section className="py-20 px-6">
        <div className="max-w-7xl mx-auto">
          <div className="mb-16 max-w-2xl">
            <h2 className="text-4xl md:text-5xl font-bold mb-4">
              Pillars of <span className="text-yellow-500">Bitcoin Africa Story</span>
            </h2>
            <p className="text-xl text-gray-400">
              Discover how Bitcoin is transforming lives and creating opportunities across Africa
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {features.map((feature) => (
              <div key={feature.id} className="group relative overflow-hidden bg-gray-900 border border-gray-800 hover:border-yellow-500 transition-all duration-300 hover:scale-105">
                <div className="aspect-video overflow-hidden relative bg-gray-800">
                  {feature.image && (
                    <Image
                      src={feature.image}
                      alt={feature.title}
                      fill
                      sizes="(min-width: 1024px) 33vw, (min-width: 640px) 50vw, 100vw"
                      className="object-cover group-hover:scale-110 transition-transform duration-300"
                    />
                  )}
                </div>
                <div className="p-6">
                  <h3 className="text-2xl font-bold mb-3 text-yellow-500">{feature.title}</h3>
                  <p className="text-gray-400 leading-relaxed">{feature.description}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

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
            <div className="grid grid-cols-3 sm:grid-cols-6 lg:grid-cols-9 gap-4 mb-8">
              {featuredEntities.map((entity, i) => {
                // 3 on mobile, 6 on tablet (sm+), 9 on desktop (lg+).
                const visibility = i < 3 ? '' : i < 6 ? 'hidden sm:flex' : 'hidden lg:flex';
                return (
                  <Link
                    key={entity.id}
                    href={`/directory/${entity.slug}`}
                    title={entity.name}
                    className={`flex-col items-center gap-2 group ${visibility || 'flex'}`}
                  >
                    <div className="relative w-full aspect-square bg-gray-900 border border-gray-800 rounded-xl overflow-hidden group-hover:border-yellow-500/50 transition-colors">
                      {entity.logo && (
                        <Image src={entity.logo} alt={entity.name} fill sizes="120px" className="object-contain p-3" />
                      )}
                    </div>
                    <p className="text-[11px] text-gray-500 text-center truncate w-full group-hover:text-gray-300 transition-colors">{entity.name}</p>
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
