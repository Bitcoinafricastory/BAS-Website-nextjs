import { getAllNews } from '@/lib/news';
import { SITE_URL, SITE_NAME } from '@/lib/schema';

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
  const dated = posts.filter((post) => post.date);
  let recent = dated.filter((post) => new Date(post.date).getTime() >= cutoff);

  // A <urlset> with no <url> children is invalid — Search Console reports it
  // as "Missing XML tag" and the whole sitemap fails. Publishing gaps longer
  // than two days are completely normal, so fall back to the most recent
  // articles instead of emitting an empty document. Google ignores entries
  // outside its news window anyway; an over-inclusive sitemap is harmless,
  // an invalid one is not.
  if (recent.length === 0) {
    recent = dated
      .slice()
      .sort((a, b) => new Date(b.date) - new Date(a.date))
      .slice(0, 10);
  }

  const urls = recent
    .map((post) => {
      // The slug becomes a URL path segment and then XML text. Encoding it
      // handles slugs containing spaces or punctuation, and escaping handles
      // characters like & that would otherwise produce invalid XML.
      const slugPart = encodeURIComponent(post.slug || post.id);
      const url = `${SITE_URL}/news/${slugPart}`;
      const pubDate = new Date(post.date).toISOString();
      return `  <url>
    <loc>${escapeXml(url)}</loc>
    <news:news>
      <news:publication>
        <news:name>${escapeXml(SITE_NAME)}</news:name>
        <news:language>en</news:language>
      </news:publication>
      <news:publication_date>${pubDate}</news:publication_date>
      <news:title>${escapeXml(post.title)}</news:title>
    </news:news>
  </url>`;
    })
    .join('\n');

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
