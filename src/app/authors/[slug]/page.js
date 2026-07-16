import { notFound } from 'next/navigation';
import Link from 'next/link';
import Image from 'next/image';
import { getAuthorBySlug, getActiveAuthors } from '@/lib/authors';
import { getArticlesByAuthor } from '@/lib/news';
import { authorProfileSchema, breadcrumbSchema, resolveImageUrl, jsonLdScript, SITE_URL } from '@/lib/schema';
import Breadcrumbs from '@/components/Breadcrumbs';

export const revalidate = 300;

// Inline brand marks (lucide-react doesn't ship LinkedIn/X).
const XIcon = () => (
  <svg viewBox="0 0 24 24" width="16" height="16" fill="currentColor" aria-hidden="true">
    <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z" />
  </svg>
);
const LinkedinIcon = () => (
  <svg viewBox="0 0 24 24" width="16" height="16" fill="currentColor" aria-hidden="true">
    <path d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433a2.062 2.062 0 01-2.063-2.065 2.063 2.063 0 112.063 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z" />
  </svg>
);
const GlobeIcon = () => (
  <svg viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
    <circle cx="12" cy="12" r="10" /><path d="M2 12h20M12 2a15.3 15.3 0 010 20M12 2a15.3 15.3 0 000 20" />
  </svg>
);

export async function generateStaticParams() {
  const authors = await getActiveAuthors();
  return authors.map((a) => ({ slug: a.slug })).filter((p) => p.slug);
}

export async function generateMetadata({ params }) {
  const { slug } = await params;
  const author = await getAuthorBySlug(slug);
  if (!author) return { title: 'Writer not found' };

  const description = author.bio
    || `Articles by ${author.name}${author.role ? `, ${author.role}` : ''} at Bitcoin Africa Story.`;

  return {
    title: author.name,
    description,
    alternates: { canonical: `${SITE_URL}/authors/${author.slug}` },
    openGraph: {
      type: 'profile',
      title: `${author.name} — Bitcoin Africa Story`,
      description,
      images: author.avatar ? [{ url: resolveImageUrl(author.avatar) }] : undefined,
    },
  };
}

export default async function AuthorProfilePage({ params }) {
  const { slug } = await params;
  const author = await getAuthorBySlug(slug);
  if (!author) notFound();

  const articles = await getArticlesByAuthor(author);
  articles.sort((a, b) => (b.date || '').localeCompare(a.date || ''));

  const crumbs = [
    { name: 'Home', url: `${SITE_URL}/` },
    { name: 'Writers', url: `${SITE_URL}/authors` },
    { name: author.name, url: `${SITE_URL}/authors/${author.slug}` },
  ];

  const socials = [
    author.twitter && { href: author.twitter, label: 'X', icon: <XIcon /> },
    author.linkedin && { href: author.linkedin, label: 'LinkedIn', icon: <LinkedinIcon /> },
    author.website && { href: author.website, label: 'Website', icon: <GlobeIcon /> },
  ].filter(Boolean);

  return (
    <div className="min-h-screen pt-24 pb-24">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={jsonLdScript(authorProfileSchema(author, articles))}
      />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={jsonLdScript(breadcrumbSchema(crumbs))}
      />

      <div className="max-w-5xl mx-auto px-6">
        <Breadcrumbs
          items={[{ name: 'Home', url: '/' }, { name: 'Writers', url: '/authors' }, { name: author.name }]}
          className="mb-8"
        />

        <div className="flex flex-col sm:flex-row gap-8 items-start mb-16">
          <div className="relative w-32 h-32 sm:w-40 sm:h-40 flex-shrink-0 rounded-full overflow-hidden bg-gray-800">
            {author.avatar && (
              <Image
                src={author.avatar}
                alt={author.name}
                fill
                sizes="160px"
                priority
                className="object-cover"
              />
            )}
          </div>
          <div className="min-w-0 flex-1">
            <h1 className="text-3xl md:text-5xl font-semibold mb-2">{author.name}</h1>
            {(author.role || author.location) && (
              <p className="text-gray-400 text-base sm:text-lg mb-6">
                {author.role}
                {author.role && author.location ? ' · ' : ''}
                {author.location}
              </p>
            )}
            {author.bio && (
              <p className="text-gray-300 text-base sm:text-lg leading-relaxed max-w-2xl mb-6">
                {author.bio}
              </p>
            )}
            {socials.length > 0 && (
              <div className="flex items-center gap-4">
                {socials.map((s) => (
                  <a
                    key={s.label}
                    href={s.href}
                    target="_blank"
                    rel="noopener noreferrer"
                    aria-label={`${author.name} on ${s.label}`}
                    className="flex items-center justify-center w-10 h-10 rounded-full border border-gray-800 text-gray-400 hover:text-yellow-500 hover:border-yellow-500 transition-colors"
                  >
                    {s.icon}
                  </a>
                ))}
              </div>
            )}
          </div>
        </div>

        <div className="border-t border-gray-800 pt-12">
          <div className="flex items-baseline justify-between mb-8">
            <h2 className="text-2xl md:text-3xl font-bold">
              Articles by <span className="text-yellow-500">{author.name.split(' ')[0]}</span>
            </h2>
            <span className="text-sm text-gray-500">
              {articles.length} {articles.length === 1 ? 'article' : 'articles'}
            </span>
          </div>

          {articles.length === 0 ? (
            <p className="text-gray-500">No published articles yet.</p>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {articles.map((post) => (
                <Link
                  key={post.id}
                  href={`/news/${post.slug || post.id}`}
                  className="group bg-gray-900 border border-gray-800 rounded-xl overflow-hidden hover:border-yellow-500/50 transition-colors"
                >
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
                  </div>
                  <div className="p-5">
                    {post.category && (
                      <span className="text-[10px] font-bold uppercase tracking-widest text-yellow-500">
                        {post.category}
                      </span>
                    )}
                    <h3 className="font-bold mt-2 group-hover:text-yellow-500 transition-colors line-clamp-2">
                      {post.title}
                    </h3>
                    {post.date && (
                      <p className="text-xs text-gray-500 mt-3">
                        {new Date(post.date).toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' })}
                      </p>
                    )}
                  </div>
                </Link>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
