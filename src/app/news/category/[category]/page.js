import Link from 'next/link';
import { notFound } from 'next/navigation';
import { getAllNews } from '@/lib/news';
import PostsGrid from '@/components/PostsGrid';
import { breadcrumbSchema, jsonLdScript, SITE_URL } from '@/lib/schema';

export const revalidate = 300;

const KNOWN_CATEGORIES = ['Adoption', 'Regulations', 'Education', 'Technology', 'Economy', 'Security', 'Community'];

export async function generateStaticParams() {
  return KNOWN_CATEGORIES.map((category) => ({ category: category.toLowerCase() }));
}

function titleCase(slug) {
  return slug.charAt(0).toUpperCase() + slug.slice(1);
}

export async function generateMetadata({ params }) {
  const { category } = await params;
  const name = titleCase(category);
  return {
    title: `${name} News & Stories`,
    description: `The latest ${name.toLowerCase()} news, analysis, and Bitcoin adoption stories from across Africa — curated by Bitcoin Africa Story.`,
    alternates: { canonical: `${SITE_URL}/news/category/${category}` },
  };
}

export default async function CategoryPage({ params }) {
  const { category } = await params;
  const name = titleCase(category);

  const allNews = await getAllNews();
  const posts = allNews.filter((p) => (p.category || '').toLowerCase() === category.toLowerCase());

  if (posts.length === 0 && !KNOWN_CATEGORIES.map((c) => c.toLowerCase()).includes(category.toLowerCase())) {
    notFound();
  }

  const breadcrumbs = [
    { name: 'Home', url: SITE_URL },
    { name: 'News', url: `${SITE_URL}/news` },
    { name, url: `${SITE_URL}/news/category/${category}` },
  ];

  return (
    <div className="pt-16 bg-black text-white min-h-screen">
      <script type="application/ld+json" dangerouslySetInnerHTML={jsonLdScript(breadcrumbSchema(breadcrumbs))} />

      <div className="max-w-7xl mx-auto px-6 py-16">
        <nav aria-label="Breadcrumb" className="text-sm text-gray-400 flex flex-wrap gap-2 items-center mb-8">
          <Link href="/" className="hover:text-yellow-500">Home</Link>
          <span>/</span>
          <Link href="/news" className="hover:text-yellow-500">News</Link>
          <span>/</span>
          <span className="text-gray-200">{name}</span>
        </nav>

        <h1 className="text-4xl md:text-5xl font-semibold mb-4">
          {name} <span className="text-yellow-500">Stories</span>
        </h1>
        <p className="text-xl text-gray-400 mb-12">
          The latest {name.toLowerCase()} news and Bitcoin adoption stories from across Africa.
        </p>

        {posts.length === 0 ? (
          <p className="text-gray-400">No stories in this category yet. Check back soon.</p>
        ) : (
          <PostsGrid posts={posts} />
        )}

        <div className="mt-16 pt-8 border-t border-gray-800">
          <h2 className="text-sm font-bold text-gray-400 mb-4 uppercase tracking-wide">Browse Other Categories</h2>
          <div className="flex flex-wrap gap-3">
            {KNOWN_CATEGORIES.filter((c) => c.toLowerCase() !== category.toLowerCase()).map((c) => (
              <Link key={c} href={`/news/category/${c.toLowerCase()}`} className="px-4 py-2 bg-gray-900 border border-gray-800 rounded-full text-sm text-gray-300 hover:border-yellow-500 hover:text-yellow-500 transition-all">
                {c}
              </Link>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
