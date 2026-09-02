import Link from 'next/link';
import Avatar from '@/components/ui/Avatar';

/**
 * Compact author card for the /authors index grid.
 * Larger, more editorial variant lives on the profile page itself.
 */
export default function AuthorCard({ author }) {
  if (!author?.slug) return null;

  return (
    <Link
      href={`/authors/${author.slug}`}
      className="group flex gap-4 p-5 bg-[#0A0A0A] border border-white/5 rounded-xl hover:border-yellow-500/40 hover:bg-[#0A0A0A] transition-all"
    >
      <Avatar
        src={author.avatar}
        name={author.name}
        size={80}
        className="w-16 h-16 sm:w-20 sm:h-20 flex-shrink-0 rounded-full"
      />
      <div className="min-w-0 flex-1">
        <h3 className="font-semibold text-white group-hover:text-yellow-500 transition-colors">
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
