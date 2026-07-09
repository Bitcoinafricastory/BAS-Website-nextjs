import { getLatestNews } from '@/lib/news';

export const revalidate = 300;

function resolveImageUrl(image) {
  if (!image) return null;
  return image.startsWith('http') ? image : `https://bitcoinafricastory.com${image}`;
}

export default async function HomePage() {
  const latest = await getLatestNews(6);

  return (
    <div className="pt-16 bg-black text-white min-h-screen">
      <section className="max-w-5xl mx-auto px-6 py-24 text-center">
        <h1 className="text-4xl md:text-6xl font-black mb-6">
          Bitcoin Africa <span className="text-yellow-500">Story</span>
        </h1>
        <p className="text-gray-400 text-lg max-w-2xl mx-auto">
          A trusted source of news, insights, and narratives on Bitcoin adoption,
          innovation, and impact across the African continent.
        </p>
      </section>

      <section className="max-w-7xl mx-auto px-6 pb-24">
        <h2 className="text-3xl font-bold mb-8">
          Latest <span className="text-yellow-500">News</span>
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {latest.map((post) => (
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
                <span className="text-xs font-semibold text-yellow-500 bg-yellow-500/10 px-3 py-1 rounded-full">
                  {post.category}
                </span>
                <h3 className="text-xl font-bold mt-3 group-hover:text-yellow-500 transition-colors duration-200">
                  {post.title}
                </h3>
              </div>
            </a>
          ))}
        </div>
      </section>
    </div>
  );
}
