import { getAllNews } from '@/lib/news';
import { SITE_URL, SITE_NAME, articlePublishedAt } from '@/lib/schema';

export const revalidate = 300;

function escapeXml(str) {
  if (!str) return '';
  return str
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&apos;');
}

export async function GET() {
  let posts = [];
  try {
    posts = await getAllNews();
  } catch (err) {
    console.warn('news-sitemap: could not fetch posts', err);
  }

  // Google News sitemap should only include articles from the last 2 days.
  const cutoff = Date.now() - 1000 * 60 * 60 * 48;
  // Real publish time (not midnight) — see articlePublishedAt.
  const dated = posts
    .map((post) => ({ post, published: articlePublishedAt(post) }))
    .filter((x) => x.published);
  const recent = dated.filter((x) => x.published.getTime() >= cutoff);

  // Google: list only articles from the last two days; for older ones,
  // "remove the URL or strip the <news:news> block". A <urlset> with no <url>
  // children fails sitemap validation in Search Console, so when nothing is
  // fresh we list the latest few articles as plain URLs WITHOUT news tags —
  // accurate (nothing is claimed as fresh news) and never an empty file.
  const fallback =
    recent.length === 0
      ? dated
          .slice()
          .sort((a, b) => b.published - a.published)
          .slice(0, 10)
      : [];

  const articleUrl = (post) =>
    // The slug becomes a URL path segment and then XML text. Encoding it
    // handles slugs containing spaces or punctuation, and escaping handles
    // characters like & that would otherwise produce invalid XML.
    `${SITE_URL}/news/${encodeURIComponent(post.slug || post.id)}`;

  const newsEntries = recent.map(({ post, published }) => `  <url>
    <loc>${escapeXml(articleUrl(post))}</loc>
    <news:news>
      <news:publication>
        <news:name>${escapeXml(SITE_NAME)}</news:name>
        <news:language>en</news:language>
      </news:publication>
      <news:publication_date>${published.toISOString()}</news:publication_date>
      <news:title>${escapeXml(post.title)}</news:title>
    </news:news>
  </url>`);

  const plainEntries = fallback.map(({ post }) => `  <url>
    <loc>${escapeXml(articleUrl(post))}</loc>
  </url>`);

  const urls = [...newsEntries, ...plainEntries].join('\n');

  const xml = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9" xmlns:news="http://www.google.com/schemas/sitemap-news/0.9">
${urls}
</urlset>`;

  return new Response(xml, {
    headers: {
      'Content-Type': 'application/xml; charset=utf-8',
      'Cache-Control': 'public, max-age=300, s-maxage=300',
    },
  });
}
