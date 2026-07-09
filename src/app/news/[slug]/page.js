import { notFound } from 'next/navigation';
import { getNewsBySlug, getAllSlugs, getAllNews } from '@/lib/news';

// Re-check for new/updated articles every 5 minutes without a full redeploy.
export const revalidate = 300;

// Pre-render every known article at build time (real HTML for every article,
// no crawler ever hits a blank page).
export async function generateStaticParams() {
  try {
    const slugs = await getAllSlugs();
    return slugs.map((slug) => ({ slug }));
  } catch (err) {
    // If Firestore is unreachable at build time, fall back to on-demand
    // rendering for all slugs rather than failing the whole build.
    console.warn('generateStaticParams: could not fetch slugs', err);
    return [];
  }
}

function resolveImageUrl(image) {
  if (!image) return null;
  return image.startsWith('http') ? image : `https://bitcoinafricastory.com${image}`;
}

export async function generateMetadata({ params }) {
  const { slug } = await params;
  const post = await getNewsBySlug(slug);
  if (!post) return {};

  const pageUrl = `https://bitcoinafricastory.com/news/${post.slug || post.id}`;
  const imageUrl = resolveImageUrl(post.image);

  return {
    title: post.title,
    description: post.excerpt,
    alternates: { canonical: pageUrl },
    openGraph: {
      type: 'article',
      url: pageUrl,
      title: post.title,
      description: post.excerpt,
      images: imageUrl ? [imageUrl] : undefined,
      siteName: 'Bitcoin Africa Story',
    },
    twitter: {
      card: 'summary_large_image',
      title: post.title,
      description: post.excerpt,
      images: imageUrl ? [imageUrl] : undefined,
    },
  };
}

export default async function BlogPostPage({ params }) {
  const { slug } = await params;
  const post = await getNewsBySlug(slug);
  if (!post) notFound();

  const pageUrl = `https://bitcoinafricastory.com/news/${post.slug || post.id}`;
  const imageUrl = resolveImageUrl(post.image);

  const [allNews] = await Promise.all([getAllNews()]);
  const relatedPosts = allNews
    .filter((p) => p.id !== post.id && p.category === post.category)
    .slice(0, 3);

  const jsonLd = {
    '@context': 'https://schema.org',
    '@type': 'NewsArticle',
    headline: post.title,
    image: imageUrl ? [imageUrl] : undefined,
    datePublished: post.date ? new Date(post.date).toISOString() : new Date().toISOString(),
    author: [{ '@type': 'Person', name: post.author || 'Bitcoin Africa Story', url: 'https://bitcoinafricastory.com/about' }],
    publisher: {
      '@type': 'Organization',
      name: 'Bitcoin Africa Story',
      logo: { '@type': 'ImageObject', url: 'https://bitcoinafricastory.com/assets/BitcoinAfricaStoryLogo.png' },
    },
    description: post.excerpt,
    mainEntityOfPage: pageUrl,
  };

  return (
    <div className="pt-16 bg-black text-white min-h-screen">
      <script
        type="application/ld+json"
        // eslint-disable-next-line react/no-danger
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />

      <div className="max-w-5xl mx-auto px-6 py-8">
        <a href="/news" className="inline-flex items-center text-gray-400 hover:text-yellow-500 transition-colors duration-200">
          ← Back to Blog
        </a>
      </div>

      <article className="max-w-5xl mx-auto px-6 pb-20">
        <div className="mb-6">
          <span className="inline-block text-sm font-semibold text-black bg-yellow-500 px-4 py-2 rounded-full">
            {post.category}
          </span>
        </div>

        <h1 className="text-3xl md:text-5xl font-black mb-6 leading-tight">{post.title}</h1>

        <div className="flex items-center gap-4 text-sm text-gray-400 mb-8">
          <span>{post.author}</span>
          <span>·</span>
          <span>{post.date ? new Date(post.date).toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' }) : ''}</span>
          {post.readTime && (
            <>
              <span>·</span>
              <span>{post.readTime}</span>
            </>
          )}
        </div>

        {imageUrl && (
          <div className="mb-10 rounded-xl overflow-hidden">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src={imageUrl} alt={post.title} className="w-full h-auto" />
          </div>
        )}

        <div
          className="prose prose-invert max-w-none prose-headings:font-bold prose-a:text-yellow-500"
          // eslint-disable-next-line react/no-danger
          dangerouslySetInnerHTML={{ __html: post.content }}
        />

        {relatedPosts.length > 0 && (
          <div className="pt-12 mt-12 border-t border-gray-800">
            <h2 className="text-3xl font-bold mb-8">
              Related <span className="text-yellow-500">Articles</span>
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
              {relatedPosts.map((relatedPost) => (
                <a
                  key={relatedPost.id}
                  href={`/news/${relatedPost.slug}`}
                  className="group bg-gray-900 border border-gray-800 rounded-xl overflow-hidden hover:border-yellow-500 transition-all duration-300"
                >
                  <div className="aspect-video overflow-hidden">
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img
                      src={resolveImageUrl(relatedPost.image)}
                      alt={relatedPost.title}
                      className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-300"
                    />
                  </div>
                  <div className="p-6">
                    <div className="flex items-center justify-between mb-3">
                      <span className="text-xs font-semibold text-yellow-500 bg-yellow-500/10 px-3 py-1 rounded-full">
                        {relatedPost.category}
                      </span>
                      <span className="text-xs text-gray-400">{relatedPost.readTime}</span>
                    </div>
                    <h3 className="text-xl font-bold mb-2 group-hover:text-yellow-500 transition-colors duration-200">
                      {relatedPost.title}
                    </h3>
                  </div>
                </a>
              ))}
            </div>
          </div>
        )}
      </article>

      {/*
        NOTE: Interactive bits from the original page (like/comment/share
        buttons, view counters) are intentionally left out of this
        server-rendered core. They should be added back as a small Client
        Component (e.g. <PostInteractions postId={post.id} />) mounted
        inside this page, so the article text/metadata stay server-rendered
        while likes/comments stay dynamic in the browser.
      */}
    </div>
  );
}
