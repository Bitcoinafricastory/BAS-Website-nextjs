import Link from 'next/link';
import Image from 'next/image';

// Inline brand marks — lucide-react doesn't ship LinkedIn/X icons.
const XIcon = () => (
  <svg viewBox="0 0 24 24" width="14" height="14" fill="currentColor" aria-hidden="true">
    <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z" />
  </svg>
);
const LinkedinIcon = () => (
  <svg viewBox="0 0 24 24" width="14" height="14" fill="currentColor" aria-hidden="true">
    <path d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433a2.062 2.062 0 01-2.063-2.065 2.063 2.063 0 112.063 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z" />
  </svg>
);

/**
 * End-of-article author card.
 *
 * Accepts a resolved author object. Falls back gracefully:
 *   - Legacy byline (no author record) → renders name + photo only, no profile link.
 *   - Linked author → full card, photo links to /authors/[slug].
 */
export default function AuthorFooter({ author }) {
  if (!author?.name) return null;

  const isLinked = !!author.slug && !author.isLegacy;
  const socials = [
    author.twitter && { href: author.twitter, label: 'X', icon: <XIcon /> },
    author.linkedin && { href: author.linkedin, label: 'LinkedIn', icon: <LinkedinIcon /> },
  ].filter(Boolean);

  return (
    <div className="mt-14 pt-10 border-t border-gray-800">
      <p className="text-[10px] font-bold uppercase tracking-widest text-gray-500 mb-4">Written by</p>
      <div className="flex gap-5 items-start">
        <div className="relative w-16 h-16 sm:w-20 sm:h-20 flex-shrink-0 rounded-full overflow-hidden bg-gray-800">
          {author.avatar && (
            isLinked ? (
              <Link href={`/authors/${author.slug}`} className="relative block w-full h-full">
                <Image src={author.avatar} alt={author.name} fill sizes="80px" className="object-cover" />
              </Link>
            ) : (
              <Image src={author.avatar} alt={author.name} fill sizes="80px" className="object-cover" />
            )
          )}
        </div>
        <div className="min-w-0 flex-1">
          {isLinked ? (
            <Link href={`/authors/${author.slug}`} className="text-lg font-bold text-white hover:text-yellow-500 transition-colors">
              {author.name}
            </Link>
          ) : (
            <span className="text-lg font-bold text-white">{author.name}</span>
          )}
          {author.role && <p className="text-sm text-gray-400 mt-0.5">{author.role}</p>}
          {author.bio && <p className="text-sm text-gray-400 leading-relaxed mt-3 max-w-2xl">{author.bio}</p>}
          {(socials.length > 0 || isLinked) && (
            <div className="flex items-center gap-4 mt-4">
              {socials.map((s) => (
                <a
                  key={s.label}
                  href={s.href}
                  target="_blank"
                  rel="noopener noreferrer"
                  aria-label={`${author.name} on ${s.label}`}
                  className="text-gray-500 hover:text-yellow-500 transition-colors"
                >
                  {s.icon}
                </a>
              ))}
              {isLinked && (
                <Link
                  href={`/authors/${author.slug}`}
                  className="text-xs font-semibold text-yellow-500 hover:underline"
                >
                  View all articles →
                </Link>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
