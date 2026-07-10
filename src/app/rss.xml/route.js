import { getAllNews } from '@/lib/news';
import { stripHtml } from '@/lib/article-content';
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
    console.warn('rss: could not fetch posts', err);
  }

  const items = posts
    .slice(0, 50)
    .map((post) => {
      const url = `${SITE_URL}/news/${post.slug || post.id}`;
      const desc = post.excerpt || stripHtml(post.content).slice(0, 300);
      const pubDate = post.date ? new Date(post.date).toUTCString() : new Date().toUTCString();
      return `    <item>
      <title>${escapeXml(post.title)}</title>
      <link>${url}</link>
      <guid isPermaLink="true">${url}</guid>
      <description>${escapeXml(desc)}</description>
      <category>${escapeXml(post.category || 'News')}</category>
      <dc:creator>${escapeXml(post.author || post.authorName || SITE_NAME)}</dc:creator>
      <pubDate>${pubDate}</pubDate>
    </item>`;
    })
    .join('\n');

  const xml = `<?xml version="1.0" encoding="UTF-8"?>
<rss version="2.0" xmlns:dc="http://purl.org/dc/elements/1.1/" xmlns:atom="http://www.w3.org/2005/Atom">
  <channel>
    <title>${escapeXml(SITE_NAME)}</title>
    <link>${SITE_URL}</link>
    <description>Bitcoin news, adoption stories, and analysis from across Africa.</description>
    <language>en</language>
    <atom:link href="${SITE_URL}/rss.xml" rel="self" type="application/rss+xml" />
${items}
  </channel>
</rss>`;

  return new Response(xml, {
    headers: {
      'Content-Type': 'application/rss+xml; charset=utf-8',
      'Cache-Control': 'public, max-age=300, s-maxage=300',
    },
  });
}
