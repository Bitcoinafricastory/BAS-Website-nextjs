import Link from 'next/link';
import Image from 'next/image';

/**
 * Compact author card for the /authors index grid.
 * Larger, more editorial variant lives on the profile page itself.
 */
export default function AuthorCard({ author }) {
  if (!author?.slug) return null;

  return (
    <Link
      href={`/authors/${author.slug}`}
      className="group flex gap-4 p-5 bg-gray-900/50 border border-gray-800 rounded-xl hover:border-yellow-500/40 hover:bg-gray-900 transition-all"
    >
      <div className="relative w-16 h-16 sm:w-20 sm:h-20 flex-shrink-0 rounded-full overflow-hidden bg-gray-800">
        {author.avatar && (
          <Image
            src={author.avatar}
            alt={author.name}
            fill
            sizes="80px"
            className="object-cover"
          />
        )}
      </div>
      <div className="min-w-0 flex-1">
        <h3 className="font-bold text-white group-hover:text-yellow-500 transition-colors">
          {author.name}
        </h3>
        {author.role && (
          <p className="text-sm text-gray-400 mt-0.5">{author.role}</p>
        )}
        {author.bio && (
          <p className="text-sm text-gray-500 mt-2 line-clamp-2">{author.bio}</p>
        )}
      </div>
    </Link>
  );
}
