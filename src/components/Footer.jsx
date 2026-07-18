import Link from 'next/link';
import Image from 'next/image';
import { getAllNews } from '@/lib/news';
import NewsletterSignup from './NewsletterSignup';

// Inline brand marks — lucide-react doesn't ship these outlined social/brand icons.
const XIcon = () => (
  <svg viewBox="0 0 24 24" width="16" height="16" fill="currentColor" aria-hidden="true">
    <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z" />
  </svg>
);
const YoutubeIcon = () => (
  <svg viewBox="0 0 24 24" width="16" height="16" fill="currentColor" aria-hidden="true">
    <path d="M23.498 6.186a3.016 3.016 0 00-2.122-2.136C19.505 3.545 12 3.545 12 3.545s-7.505 0-9.377.505A3.017 3.017 0 00.502 6.186C0 8.07 0 12 0 12s0 3.93.502 5.814a3.016 3.016 0 002.122 2.136c1.871.505 9.376.505 9.376.505s7.505 0 9.377-.505a3.015 3.015 0 002.122-2.136C24 15.93 24 12 24 12s0-3.93-.502-5.814zM9.545 15.568V8.432L15.818 12l-6.273 3.568z" />
  </svg>
);
const LinkedinIcon = () => (
  <svg viewBox="0 0 24 24" width="16" height="16" fill="currentColor" aria-hidden="true">
    <path d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433a2.062 2.062 0 01-2.063-2.065 2.063 2.063 0 112.063 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z" />
  </svg>
);
const TelegramIcon = () => (
  <svg viewBox="0 0 24 24" width="16" height="16" fill="currentColor" aria-hidden="true">
    <path d="M22.05 2.53a1.94 1.94 0 00-1.98-.2L1.7 9.9c-1.1.44-1.1 1.98.02 2.4l4.7 1.75 1.8 5.79c.24.76 1.2.99 1.78.44l2.6-2.47 4.55 3.36c.85.63 2.07.18 2.3-.85l3.4-15.7a1.94 1.94 0 00-.8-2.1zM8.9 14.1l-1.1-3.6L17.6 5.3c.2-.12.4.14.22.3L8.9 14.1zm.98 4.9l-.65-2.1 1.83-1.75 1.4 4.3-2.58-.45z" />
  </svg>
);
const NostrIcon = () => (
  <svg viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="currentColor" strokeWidth="1.8" aria-hidden="true">
    <circle cx="6" cy="7" r="2.3" />
    <circle cx="18" cy="7" r="2.3" />
    <circle cx="12" cy="17" r="2.3" />
    <path d="M8 8.5L10.3 15M16 8.5L13.7 15" strokeLinecap="round" />
  </svg>
);

const socialLinks = [
  { href: 'https://x.com/story_bitcoin', label: 'X (Twitter)', icon: <XIcon /> },
  { href: 'https://youtube.com/@bitcoinafricastory', label: 'YouTube', icon: <YoutubeIcon /> },
  { href: 'https://www.linkedin.com/company/bitcoin-africa-story/', label: 'LinkedIn', icon: <LinkedinIcon /> },
  { href: 'https://t.me/+KirVlW8gMMtlNDI8', label: 'Telegram', icon: <TelegramIcon /> },
  {
    href: 'https://primal.net/p/nprofile1qqs0tmrphute79adfe4r3h8qdkdgqw3fz9244238x2ss53lmhft3jug4hhw4r',
    label: 'Nostr',
    icon: <NostrIcon />,
  },
];

const sectionLinks = [
  { label: 'News & Stories', href: '/news' },
  { label: 'Education', href: '/education' },
  { label: 'Events', href: '/events' },
  { label: 'Podcast', href: '/podcast' },
  { label: 'Directory', href: '/directory' },
  { label: 'Resources', href: '/resources' },
];

const companyLinks = [
  { label: 'About', href: '/about' },
  { label: 'Writers', href: '/authors' },
  { label: 'Contact', href: '/contact' },
  { label: 'Donate', href: '/donate' },
  { label: 'Search', href: '/search' },
];

const moreLinks = [
  { label: 'RSS Feed', href: '/rss.xml' },
  { label: 'News Sitemap', href: '/news-sitemap.xml' },
  { label: 'Privacy Policy', href: '/privacy' },
  { label: 'Terms of Use', href: '/terms' },
];

function PostCard({ title, author, image, link }) {
  return (
    <Link href={link} className="flex items-start space-x-3 group">
      <div className="relative flex-shrink-0 w-16 h-16 sm:w-20 sm:h-20 overflow-hidden rounded-md border border-gray-700 bg-gray-800">
        {image && (
          <Image
            src={image}
            alt={title}
            fill
            sizes="80px"
            className="object-cover group-hover:opacity-75 transition-opacity duration-200"
          />
        )}
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

        <div className="mt-14 pt-12 border-t border-gray-800 grid grid-cols-2 sm:grid-cols-2 md:grid-cols-4 gap-x-8 gap-y-10">
          <div className="col-span-2 md:col-span-1 space-y-4">
            <Link href="/" className="inline-block">
              <Image
                src="/assets/BitcoinAfricaStoryLogo.png"
                alt="Bitcoin Africa Story"
                width={160}
                height={48}
                className="h-10 w-auto"
              />
            </Link>
            <p className="text-gray-400 text-sm leading-relaxed max-w-xs">
              Bitcoin Africa Story is a trusted source of news, insights, and narratives on Bitcoin
              adoption across the African continent.
            </p>
            <NewsletterSignup variant="compact" />
          </div>

          <div>
            <h3 className="text-xs font-bold text-white uppercase tracking-widest mb-4">Sections</h3>
            <ul className="space-y-3">
              {sectionLinks.map((link) => (
                <li key={link.label}>
                  <Link href={link.href} className="text-gray-400 text-sm hover:text-yellow-500 transition-colors duration-200">
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          <div>
            <h3 className="text-xs font-bold text-white uppercase tracking-widest mb-4">Company</h3>
            <ul className="space-y-3">
              {companyLinks.map((link) => (
                <li key={link.label}>
                  <Link href={link.href} className="text-gray-400 text-sm hover:text-yellow-500 transition-colors duration-200">
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          <div>
            <h3 className="text-xs font-bold text-white uppercase tracking-widest mb-4">Follow &amp; More</h3>
            <ul className="space-y-3">
              {moreLinks.map((link) => (
                <li key={link.label}>
                  <Link href={link.href} className="text-gray-400 text-sm hover:text-yellow-500 transition-colors duration-200">
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>
        </div>

        <div className="mt-10 pt-6 border-t border-gray-800 flex flex-col-reverse sm:flex-row items-center justify-between gap-4">
          <p className="text-gray-500 text-xs text-center sm:text-left">
            © {new Date().getFullYear()} Bitcoin Africa Story. All rights reserved.
          </p>
          <div className="flex items-center gap-3">
            {socialLinks.map((s) => (
              <a
                key={s.label}
                href={s.href}
                target="_blank"
                rel="noopener noreferrer"
                aria-label={s.label}
                className="w-9 h-9 flex items-center justify-center rounded-full border border-gray-700 text-gray-400 hover:text-yellow-500 hover:border-yellow-500 transition-colors duration-200"
              >
                {s.icon}
              </a>
            ))}
          </div>
        </div>
      </div>
    </footer>
  );
}
