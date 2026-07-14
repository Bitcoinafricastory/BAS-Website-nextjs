import { notFound } from 'next/navigation';
import Link from 'next/link';
import Image from 'next/image';
import { getNewsBySlug, getAllSlugs, getAllNews } from '@/lib/news';
import {
  newsArticleSchema,
  breadcrumbSchema,
  faqSchema,
  resolveImageUrl,
  jsonLdScript,
  SITE_URL,
} from '@/lib/schema';
import { computeReadingTime, deriveKeyTakeaways, getFaqs, addHeadingIds, extractHeadings } from '@/lib/article-content';
import { resolveArticleAuthor } from '@/lib/authors';
import ArticleSidebar from '@/components/ArticleSidebar';
import AuthorFooter from '@/components/AuthorFooter';

export const revalidate = 300;

export async function generateStaticParams() {
  try {
    const slugs = await getAllSlugs();
    return slugs.map((slug) => ({ slug }));
  } catch (err) {
    console.warn('generateStaticParams: could not fetch slugs', err);
    return [];
  }
}

export async function generateMetadata({ params }) {
  const { slug } = await params;
  const post = await getNewsBySlug(slug);
  if (!post) return {};

  const pageUrl = `${SITE_URL}/news/${post.slug || post.id}`;
  const imageUrl = resolveImageUrl(post.image);

  return {
    title: post.seoTitle || post.title,
    description: post.metaDescription || post.excerpt,
    keywords: post.focusKeywords || undefined,
    alternates: { canonical: post.canonicalUrl || pageUrl },
    authors: [{ name: post.author || post.authorName || 'Bitcoin Africa Story' }],
    openGraph: {
      type: 'article',
      url: pageUrl,
      title: post.seoTitle || post.title,
      description: post.metaDescription || post.excerpt,
      images: imageUrl ? [imageUrl] : undefined,
      siteName: 'Bitcoin Africa Story',
      publishedTime: post.date ? new Date(post.date).toISOString() : undefined,
      authors: [post.author || post.authorName || 'Bitcoin Africa Story'],
      section: post.category,
    },
    twitter: {
      card: 'summary_large_image',
      title: post.seoTitle || post.title,
      description: post.metaDescription || post.excerpt,
      images: imageUrl ? [imageUrl] : undefined,
    },
  };
}

export default async function BlogPostPage({ params }) {
  const { slug } = await params;
  const post = await getNewsBySlug(slug);
  if (!post) notFound();

  const pageUrl = `${SITE_URL}/news/${post.slug || post.id}`;
  const imageUrl = resolveImageUrl(post.image);
  const readingTime = computeReadingTime(post.content, post.readTime);
  const keyTakeaways = deriveKeyTakeaways(post);
  const faqs = getFaqs(post);
  const contentWithIds = addHeadingIds(post.content);
  const headings = extractHeadings(post.content);

  const allNews = await getAllNews();
  const relatedPosts = allNews
    .filter((p) => p.id !== post.id && p.category === post.category)
    .slice(0, 3);

  // Resolve full author record (handles both authorId-linked articles and
  // legacy string bylines). Powers the footer card and Person schema.
  const author = await resolveArticleAuthor(post);

  const breadcrumbs = [
    { name: 'Home', url: SITE_URL },
    { name: 'News', url: `${SITE_URL}/news` },
    { name: post.category || 'Story', url: `${SITE_URL}/news?category=${encodeURIComponent(post.category || '')}` },
    { name: post.title, url: pageUrl },
  ];

  const schemas = [
    newsArticleSchema(post, author),
    breadcrumbSchema(breadcrumbs),
    faqSchema(faqs),
  ].filter(Boolean);

  return (
    <div className="pt-16 bg-black text-white min-h-screen">
      {schemas.map((schema, i) => (
        <script key={i} type="application/ld+json" dangerouslySetInnerHTML={jsonLdScript(schema)} />
      ))}

      <div className="max-w-3xl xl:max-w-6xl mx-auto px-6 py-8 xl:pr-6">
        {/* Visible breadcrumb trail (matches breadcrumb schema, aids internal linking) */}
        <nav aria-label="Breadcrumb" className="text-sm text-gray-400 flex flex-wrap gap-2 items-center">
          <Link href="/" className="hover:text-yellow-500">Home</Link>
          <span>/</span>
          <Link href="/news" className="hover:text-yellow-500">News</Link>
          {post.category && (
            <>
              <span>/</span>
              <Link href={`/news?category=${encodeURIComponent(post.category)}`} className="hover:text-yellow-500">{post.category}</Link>
            </>
          )}
        </nav>
      </div>

      <div className="max-w-3xl xl:max-w-6xl mx-auto px-6 pb-20 xl:grid xl:grid-cols-[minmax(0,1fr)_280px] xl:gap-16">
        <article className="min-w-0">
          <div className="mb-6">
            <span className="inline-block text-sm font-semibold text-black bg-yellow-500 px-4 py-2 rounded-full">
              {post.category}
            </span>
          </div>

          <h1 className="text-3xl md:text-5xl font-black mb-6 leading-tight">{post.title}</h1>

          <div className="flex flex-wrap items-center gap-x-4 gap-y-2 text-sm text-gray-400 mb-8">
            {author?.slug && !author.isLegacy ? (
              <Link href={`/authors/${author.slug}`} className="hover:text-yellow-500 transition-colors">
                {author.name}
              </Link>
            ) : (
              <span>{post.author || post.authorName}</span>
            )}
            <span>·</span>
            <span>{post.date ? new Date(post.date).toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' }) : ''}</span>
            <span>·</span>
            <span>{readingTime}</span>
          </div>

          {imageUrl && (
            <div className="mb-10 rounded-xl overflow-hidden">
              <Image
                src={imageUrl}
                alt={post.imageAlt || post.title}
                width={1200}
                height={675}
                priority
                sizes="(min-width: 1280px) 720px, (min-width: 1024px) 1024px, 100vw"
                className="w-full h-auto"
              />
            </div>
          )}

          {/* Key Takeaways — AEO-friendly summary block that answer engines love */}
          {keyTakeaways.length > 0 && (
            <div className="mb-10 p-6 bg-yellow-500/5 border border-yellow-500/20 rounded-xl">
              <h2 className="text-lg font-bold text-yellow-500 mb-4 uppercase tracking-wide">Key Takeaways</h2>
              <ul className="space-y-2">
                {keyTakeaways.map((t, i) => (
                  <li key={i} className="flex gap-3 text-gray-200">
                    <span className="text-yellow-500 flex-shrink-0">▸</span>
                    <span>{t}</span>
                  </li>
                ))}
              </ul>
            </div>
          )}

          {/* Inline Table of Contents — shown only up to lg; on xl+ the sticky
              sidebar TOC replaces it so the reader doesn't see two. */}
          {headings.length > 2 && (
            <div className="xl:hidden mb-10 p-6 bg-gray-900 border border-gray-800 rounded-xl">
              <h2 className="text-sm font-bold text-gray-400 mb-3 uppercase tracking-wide">In This Article</h2>
              <ul className="space-y-2">
                {headings.map((h, i) => (
                  <li key={i} className={h.level === 'h3' ? 'ml-4' : ''}>
                    <a href={`#${h.id}`} className="text-gray-300 hover:text-yellow-500 text-sm">{h.text}</a>
                  </li>
                ))}
              </ul>
            </div>
          )}

          <div
            className="article-body mx-auto"
            dangerouslySetInnerHTML={{ __html: contentWithIds }}
          />

          <AuthorFooter author={author} />

          {/* FAQ section — rendered visibly AND emitted as FAQPage schema above */}
          {faqs.length > 0 && (
            <div className="mt-12 pt-12 border-t border-gray-800">
              <h2 className="text-3xl font-bold mb-8">Frequently Asked <span className="text-yellow-500">Questions</span></h2>
              <div className="space-y-6">
                {faqs.map((f, i) => (
                  <div key={i} className="p-6 bg-gray-900 border border-gray-800 rounded-xl">
                    <h3 className="text-lg font-bold mb-2">{f.question}</h3>
                    <p className="text-gray-400 leading-relaxed">{f.answer}</p>
                  </div>
                ))}
              </div>
            </div>
          )}
        </article>

        <ArticleSidebar
          headings={headings}
          category={post.category}
          title={post.title}
          // Share links must resolve against the site that's ACTUALLY serving
          // this article, not metadataBase. During the domain migration,
          // metadataBase (bitcoinafricastory.com) still points at the old React
          // site with its own OG tags, so sharing that URL yields the old
          // logo preview. VERCEL_PROJECT_PRODUCTION_URL is the current
          // deployment's real URL; fall back to metadataBase after cutover.
          url={`${
            process.env.VERCEL_PROJECT_PRODUCTION_URL
              ? `https://${process.env.VERCEL_PROJECT_PRODUCTION_URL}`
              : SITE_URL
          }/news/${post.slug || slug}`}
        />
      </div>

      {relatedPosts.length > 0 && (
        <section className="max-w-3xl xl:max-w-6xl mx-auto px-6 pb-20">
          <div className="pt-12 mt-4 border-t border-gray-800">
            <h2 className="text-3xl font-bold mb-8">
              Related <span className="text-yellow-500">Articles</span>
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
              {relatedPosts.map((relatedPost) => (
                <Link
                  key={relatedPost.id}
                  href={`/news/${relatedPost.slug || relatedPost.id}`}
                  className="group bg-gray-900 border border-gray-800 rounded-xl overflow-hidden hover:border-yellow-500 transition-all duration-300"
                >
                  <div className="aspect-video overflow-hidden relative bg-gray-800">
                    {resolveImageUrl(relatedPost.image) && (
                      <Image
                        src={resolveImageUrl(relatedPost.image)}
                        alt={relatedPost.imageAlt || relatedPost.title}
                        fill
                        sizes="(min-width: 768px) 33vw, 100vw"
                        className="object-cover group-hover:scale-110 transition-transform duration-300"
                      />
                    )}
                  </div>
                  <div className="p-6">
                    <div className="flex items-center justify-between mb-3">
                      <span className="text-xs font-semibold text-yellow-500 bg-yellow-500/10 px-3 py-1 rounded-full">
                        {relatedPost.category}
                      </span>
                      <span className="text-xs text-gray-400">{computeReadingTime(relatedPost.content, relatedPost.readTime)}</span>
                    </div>
                    <h3 className="text-xl font-bold mb-2 group-hover:text-yellow-500 transition-colors duration-200">
                      {relatedPost.title}
                    </h3>
                  </div>
                </Link>
              ))}
            </div>
          </div>
        </section>
      )}
    </div>
  );
}
