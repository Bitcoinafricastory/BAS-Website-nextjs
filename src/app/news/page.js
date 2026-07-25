import { getAllNews } from '@/lib/news';

export const revalidate = 300;

export const metadata = {
  title: 'News',
  description:
    'The latest Bitcoin news, adoption stories, and analysis from across Africa — from Bitcoin Africa Story.',
  alternates: { canonical: 'https://bitcoinafricastory.com/news' },
};

function resolveImageUrl(image) {
  if (!image) return null;
  return image.startsWith('http') ? image : `https://bitcoinafricastory.com${image}`;
}

export default async function NewsListPage() {
  const posts = await getAllNews();

  return (
    <div className="pt-16 bg-black text-white min-h-screen">
      <div className="max-w-7xl mx-auto px-6 py-16">
        <h1 className="text-4xl md:text-5xl font-black mb-12">
          Latest <span className="text-yellow-500">News</span>
        </h1>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {posts.map((post) => (
            <a
              key={post.id}
              href={`/news/${post.slug || post.id}`}
              className="group bg-gray-900 border border-gray-800 rounded-xl overflow-hidden hover:border-yellow-500 transition-all duration-300"
            >
              {post.image && (
                <div className="aspect-video overflow-hidden">
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img
                    src={resolveImageUrl(post.image)}
                    alt={post.title}
                    className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-300"
                  />
                </div>
              )}
              <div className="p-6">
                <div className="flex items-center justify-between mb-3">
                  <span className="text-xs font-semibold text-yellow-500 bg-yellow-500/10 px-3 py-1 rounded-full">
                    {post.category}
                  </span>
                  <span className="text-xs text-gray-400">{post.readTime}</span>
                </div>
                <h2 className="text-xl font-bold mb-2 group-hover:text-yellow-500 transition-colors duration-200">
                  {post.title}
                </h2>
                <p className="text-gray-400 text-sm line-clamp-3">{post.excerpt}</p>
              </div>
            </a>
          ))}
        </div>
      </div>
    </div>
  );
}
