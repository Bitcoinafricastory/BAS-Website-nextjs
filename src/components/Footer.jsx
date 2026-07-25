import Link from 'next/link';
import { getAllNews } from '@/lib/news';

function PostCard({ title, author, image, link }) {
  return (
    <Link href={link} className="flex items-start space-x-3 group">
      <div className="flex-shrink-0 w-16 h-16 sm:w-20 sm:h-20 overflow-hidden rounded-md border border-gray-700">
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          src={image}
          alt={title}
          className="w-full h-full object-cover group-hover:opacity-75 transition-opacity duration-200"
        />
      </div>
      <div className="flex-1">
        <p className="text-gray-200 text-sm leading-snug group-hover:text-yellow-500 transition-colors duration-200">
          {title}
        </p>
        <p className="text-gray-500 text-xs mt-1">
          BY <span className="font-medium">{author}</span>
        </p>
      </div>
    </Link>
  );
}

export default async function Footer() {
  let news = [];
  try {
    news = await getAllNews();
  } catch (err) {
    console.warn('Footer: could not fetch news', err);
  }

  const counts = {};
  news.forEach((post) => {
    if (post.category) counts[post.category] = (counts[post.category] || 0) + 1;
  });
  const categories = Object.entries(counts)
    .map(([name, count]) => ({ name, count }))
    .sort((a, b) => b.count - a.count)
    .slice(0, 8);

  const popularList = news.filter((p) => p.isPopular).slice(0, 6);
  const topList = news.filter((p) => p.isTopStory).slice(0, 6);

  return (
    <footer className="bg-black border-t-8 border-yellow-500">
      <div className="max-w-7xl mx-auto px-6 py-12">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-10 lg:gap-16">
          <div className="space-y-6">
            <h2 className="text-lg font-bold text-yellow-500 uppercase tracking-wider">Popular Posts</h2>
            <div className="space-y-4">
              {popularList.length === 0 ? (
                <p className="text-gray-500 italic text-sm">Popular posts will be uploaded soon.</p>
              ) : (
                popularList.map((post) => (
                  <PostCard
                    key={post.id}
                    title={post.title}
                    author={post.author}
                    image={post.image}
                    link={`/news/${post.slug || post.id}`}
                  />
                ))
              )}
            </div>
          </div>

          <div className="space-y-6">
            <h2 className="text-lg font-bold text-yellow-500 uppercase tracking-wider">Top Stories</h2>
            <div className="space-y-4">
              {topList.length === 0 ? (
                <p className="text-gray-500 italic text-sm">Top stories will be uploaded soon.</p>
              ) : (
                topList.map((post) => (
                  <PostCard
                    key={post.id + 'ts'}
                    title={post.title}
                    author={post.author}
                    image={post.image}
                    link={`/news/${post.slug || post.id}`}
                  />
                ))
              )}
            </div>
          </div>

          <div className="space-y-6">
            <h2 className="text-lg font-bold text-yellow-500 uppercase tracking-wider">Categories</h2>
            <ul className="space-y-2">
              {categories.length === 0 ? (
                <p className="text-gray-500 italic text-sm">No categories found.</p>
              ) : (
                categories.map((category) => (
                  <li key={category.name} className="flex items-center justify-between py-1">
                    <Link
                      href={`/news?category=${category.name}`}
                      className="text-white text-base font-medium uppercase hover:text-yellow-500 cursor-pointer transition-colors duration-200"
                    >
                      {category.name}
                    </Link>
                    <span className="text-white">{category.count}</span>
                  </li>
                ))
              )}
            </ul>
          </div>
        </div>

        <div className="mt-[130px] grid grid-cols-1 md:grid-cols-3 gap-[50px] items-start">
          <div className="flex justify-start">
            <Link href="/">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src="/assets/BASlogo.png" alt="Bitcoin Africa Story" className="w-[100%] md:w-[200px]" />
            </Link>
          </div>

          <div className="text-center md:text-left md:mt-[30px]">
            <h3 className="text-lg font-bold text-white mb-2 uppercase">About Us</h3>
            <p className="text-gray-400 text-sm max-w-sm mx-auto md:mx-0">
              Bitcoin Africa Story is a trusted source of news, insights, and narratives focused on
              Bitcoin adoption, innovation, and impact around Bitcoin adoption across the African
              continent.
            </p>
          </div>

          <div className="text-center md:text-left md:mt-[20px]">
            <h3 className="text-lg font-bold text-white mb-2 uppercase">Follow Us</h3>
            <div className="flex flex-wrap gap-4 justify-center md:justify-start text-sm">
              <a href="https://x.com/story_bitcoin" target="_blank" rel="noopener noreferrer" className="text-gray-400 hover:text-yellow-500 transition-colors duration-200">X (Twitter)</a>
              <span className="text-gray-600">·</span>
              <a href="https://youtube.com/@bitcoinafricastory" target="_blank" rel="noopener noreferrer" className="text-gray-400 hover:text-yellow-500 transition-colors duration-200">YouTube</a>
              <span className="text-gray-600">·</span>
              <a href="https://t.me/+KirVlW8gMMtlNDI8" target="_blank" rel="noopener noreferrer" className="text-gray-400 hover:text-yellow-500 transition-colors duration-200">Telegram</a>
              <span className="text-gray-600">·</span>
              <a href="https://www.linkedin.com/company/bitcoin-africa-story/" target="_blank" rel="noopener noreferrer" className="text-gray-400 hover:text-yellow-500 transition-colors duration-200">LinkedIn</a>
              <span className="text-gray-600">·</span>
              <a href="https://primal.net/p/nprofile1qqs0tmrphute79adfe4r3h8qdkdgqw3fz9244238x2ss53lmhft3jug4hhw4r" target="_blank" rel="noopener noreferrer" className="text-gray-400 hover:text-yellow-500 transition-colors duration-200">Nostr</a>
            </div>

            <div className="mt-8 pt-6 text-center md:text-left text-sm">
              <ul className="flex md:flex-wrap space-x-4 text-white">
                <li><Link href="/about" className="hover:text-yellow-500 uppercase">ABOUT US</Link></li>
                <li><Link href="/terms" className="hover:text-yellow-500 uppercase">TERM OF USE</Link></li>
                <li><Link href="/privacy" className="hover:text-yellow-500 uppercase">PRIVACY POLICY</Link></li>
              </ul>
              <p className="mt-2 text-xs text-gray-500">© Bitcoin Africa Story, 2026. All Rights Reserved.</p>
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
}
