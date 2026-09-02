import Link from 'next/link';
import Image from 'next/image';

// Editorial "magazine" layout for the homepage: one large lead story plus a
// stacked list of smaller headline+thumbnail rows, in the spirit of a
// print/digital magazine front section rather than a uniform card grid.
// Used only on the homepage — /news and other listings keep PostsGrid.
export default function MagazinePostsGrid({ posts = [] }) {
  if (!posts.length) return null;
  const [featured, ...rest] = posts;

  const formatDate = (d) =>
    d ? new Date(d).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' }) : '';

  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 lg:gap-8">
      {/* Lead story */}
      <Link
        href={`/news/${featured.slug || featured.id}`}
        className="lg:col-span-2 group block bg-[#0A0A0A] border border-white/5 overflow-hidden hover:border-yellow-500/50 transition-colors duration-300"
      >
        <div className="relative aspect-[16/10] sm:aspect-[16/9] overflow-hidden bg-gray-800">
          {featured.image && (
            <Image
              src={featured.image}
              alt={featured.title}
              fill
              sizes="(min-width: 1024px) 66vw, 100vw"
              className="object-cover group-hover:scale-105 transition-transform duration-500"
            />
          )}
          <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/10 to-transparent" />
        </div>
        <div className="p-6 sm:p-7">
          <span className="text-[11px] font-medium text-yellow-500 uppercase tracking-widest">{featured.category}</span>
          <h3 className="text-2xl sm:text-3xl font-semibold leading-snug mt-2.5 mb-3 group-hover:text-yellow-500 transition-colors">
            {featured.title}
          </h3>
          {featured.excerpt && (
            <p className="text-gray-400 text-sm sm:text-[15px] leading-relaxed mb-4 line-clamp-2">{featured.excerpt}</p>
          )}
          <div className="flex items-center gap-3 text-xs text-gray-500">
            <span>{formatDate(featured.date)}</span>
            {featured.readTime && (
              <>
                <span className="w-1 h-1 rounded-full bg-gray-600" />
                <span>{featured.readTime}</span>
              </>
            )}
          </div>
        </div>
      </Link>

      {/* Secondary headlines — compact thumbnail + text rows */}
      <div className="flex flex-col divide-y divide-white/5 lg:border-l lg:border-white/5 lg:pl-8">
        {rest.map((post) => (
          <Link
            key={post.id}
            href={`/news/${post.slug || post.id}`}
            className="group flex gap-4 items-start py-4 first:pt-0 last:pb-0"
          >
            <div className="relative w-20 h-20 sm:w-24 sm:h-24 flex-shrink-0 overflow-hidden bg-gray-800">
              {post.image && (
                <Image
                  src={post.image}
                  alt={post.title}
                  fill
                  sizes="96px"
                  className="object-cover group-hover:scale-105 transition-transform duration-300"
                />
              )}
            </div>
            <div className="min-w-0">
              <span className="text-[10px] font-medium text-yellow-500 uppercase tracking-widest">{post.category}</span>
              <h4 className="font-medium text-[15px] leading-snug mt-1.5 line-clamp-3 group-hover:text-yellow-500 transition-colors">
                {post.title}
              </h4>
              <span className="text-xs text-gray-500 mt-1.5 block">{formatDate(post.date)}</span>
            </div>
          </Link>
        ))}
      </div>
    </div>
  );
}
