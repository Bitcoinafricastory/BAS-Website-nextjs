import Link from 'next/link';
import Image from 'next/image';
import { resolveImageUrl } from '@/lib/schema';
import { computeReadingTime } from '@/lib/article-content';

function formatDate(date) {
  if (!date) return '';
  return new Date(date).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
}

// Large hero card for the single Featured Story.
export function FeaturedCard({ post }) {
  if (!post) return null;
  const href = `/news/${post.slug || post.id}`;
  return (
    <Link href={href} className="group block relative overflow-hidden rounded-2xl border border-gray-800 hover:border-yellow-500/50 transition-all duration-500">
      <div className="aspect-[16/10] md:aspect-[21/9] overflow-hidden relative bg-gray-900">
        {resolveImageUrl(post.image) && (
          <Image
            src={resolveImageUrl(post.image)}
            alt={post.imageAlt || post.title}
            fill
            priority
            sizes="(min-width: 1280px) 1280px, 100vw"
            className="object-cover opacity-70 group-hover:opacity-90 group-hover:scale-105 transition-all duration-700"
          />
        )}
      </div>
      <div className="absolute inset-0 bg-gradient-to-t from-black via-black/60 to-transparent" />
      <div className="absolute bottom-0 left-0 right-0 p-6 md:p-10">
        <div className="flex items-center gap-3 mb-4">
          <span className="text-xs font-bold text-black bg-yellow-500 px-3 py-1.5 rounded-full uppercase tracking-wide">Featured</span>
          <span className="text-xs font-semibold text-yellow-500">{post.category}</span>
        </div>
        <h2 className="text-2xl md:text-4xl lg:text-5xl font-black mb-3 leading-tight group-hover:text-yellow-500 transition-colors max-w-4xl">
          {post.title}
        </h2>
        <p className="text-gray-300 text-sm md:text-base mb-4 max-w-2xl line-clamp-2">{post.excerpt}</p>
        <div className="flex flex-wrap items-center gap-x-3 gap-y-1 text-xs text-gray-400">
          <span>{post.author || post.authorName}</span>
          <span>·</span>
          <span>{formatDate(post.date)}</span>
          <span>·</span>
          <span>{computeReadingTime(post.content, post.readTime)}</span>
        </div>
      </div>
    </Link>
  );
}

// Standard grid card (Latest / Editor's Picks).
export function StoryCard({ post }) {
  if (!post) return null;
  const href = `/news/${post.slug || post.id}`;
  return (
    <Link href={href} className="group flex flex-col bg-gray-900 border border-gray-800 rounded-xl overflow-hidden hover:border-yellow-500 transition-all duration-300">
      <div className="aspect-video overflow-hidden relative bg-gray-800">
        {resolveImageUrl(post.image) && (
          <Image
            src={resolveImageUrl(post.image)}
            alt={post.imageAlt || post.title}
            fill
            sizes="(min-width: 1024px) 33vw, (min-width: 640px) 50vw, 100vw"
            className="object-cover group-hover:scale-110 transition-transform duration-300"
          />
        )}
        <span className="absolute top-3 left-3 text-[10px] font-bold text-black bg-yellow-500 px-2.5 py-1 rounded-full uppercase tracking-wide">{post.category}</span>
      </div>
      <div className="p-5 flex flex-col flex-grow">
        <h3 className="text-lg font-bold mb-2 group-hover:text-yellow-500 transition-colors duration-200 line-clamp-2">{post.title}</h3>
        <p className="text-gray-400 text-sm mb-4 line-clamp-2 flex-grow">{post.excerpt}</p>
        <div className="flex items-center justify-between text-xs text-gray-500 mt-auto">
          <span>{formatDate(post.date)}</span>
          <span>{computeReadingTime(post.content, post.readTime)}</span>
        </div>
      </div>
    </Link>
  );
}

// Numbered list item (Most Read / Trending sidebars).
export function RankedItem({ post, rank }) {
  if (!post) return null;
  const href = `/news/${post.slug || post.id}`;
  return (
    <Link href={href} className="group flex gap-4 items-start py-4 border-b border-gray-800 last:border-0">
      <span className="text-2xl font-black text-yellow-500/40 group-hover:text-yellow-500 transition-colors leading-none flex-shrink-0 w-8">
        {String(rank).padStart(2, '0')}
      </span>
      <div className="flex-1 min-w-0">
        <span className="text-[10px] font-bold text-yellow-500 uppercase tracking-wide">{post.category}</span>
        <h4 className="text-sm font-bold text-gray-200 group-hover:text-yellow-500 transition-colors line-clamp-2 mt-1">{post.title}</h4>
        <span className="text-xs text-gray-500 mt-1 block">{computeReadingTime(post.content, post.readTime)}</span>
      </div>
    </Link>
  );
}

// Horizontal card with thumbnail (Trending row).
export function HorizontalCard({ post }) {
  if (!post) return null;
  const href = `/news/${post.slug || post.id}`;
  return (
    <Link href={href} className="group flex gap-4 items-center bg-gray-900 border border-gray-800 rounded-xl overflow-hidden hover:border-yellow-500 transition-all duration-300 p-3">
      <div className="w-24 h-24 flex-shrink-0 overflow-hidden rounded-lg relative bg-gray-800">
        {resolveImageUrl(post.image) && (
          <Image
            src={resolveImageUrl(post.image)}
            alt={post.imageAlt || post.title}
            fill
            sizes="96px"
            className="object-cover group-hover:scale-110 transition-transform duration-300"
          />
        )}
      </div>
      <div className="flex-1 min-w-0">
        <span className="text-[10px] font-bold text-yellow-500 uppercase tracking-wide">{post.category}</span>
        <h4 className="text-sm font-bold text-gray-200 group-hover:text-yellow-500 transition-colors line-clamp-2 mt-1">{post.title}</h4>
        <div className="flex items-center gap-2 text-xs text-gray-500 mt-1">
          <span>{formatDate(post.date)}</span>
          <span>·</span>
          <span>{computeReadingTime(post.content, post.readTime)}</span>
        </div>
      </div>
    </Link>
  );
}
