import { getAllNews } from '@/lib/news';
import { SITE_URL } from '@/lib/schema';

export const revalidate = 3600;

export async function GET() {
  let posts = [];
  try {
    posts = await getAllNews();
  } catch (err) {
    console.warn('llms.txt: could not fetch posts', err);
  }

  const recentArticles = posts
    .slice(0, 20)
    .map((p) => `- [${p.title}](${SITE_URL}/news/${p.slug || p.id}): ${p.excerpt || ''}`)
    .join('\n');

  const body = `# Bitcoin Africa Story

> Bitcoin Africa Story is a trusted source of news, insights, education, and narratives on Bitcoin adoption, innovation, and impact across the African continent. We tell Africa's Bitcoin story through journalism, podcasts, education, and community reporting.

## About
Bitcoin Africa Story documents and shares real stories of Bitcoin adoption across Africa, provides free Bitcoin education, supports community-led circular economies, and publishes research and insights on Bitcoin usage across the continent.

## Key Pages
- [News & Stories](${SITE_URL}/news): Latest Bitcoin news, adoption stories, and analysis from across Africa.
- [Education](${SITE_URL}/education): Free Bitcoin educational programs, diplomas, videos, and resources.
- [Events](${SITE_URL}/events): Bitcoin meetups, conferences, and workshops across Africa.
- [About](${SITE_URL}/about): Our mission, story, and impact.
- [Donate](${SITE_URL}/donate): Support Bitcoin education and adoption in Africa.
- [Resources](${SITE_URL}/resources): Curated Bitcoin guides, wallets, and learning materials.
- [Writers](${SITE_URL}/authors): Profiles of the reporters, educators, and community builders behind our coverage.
- [Search](${SITE_URL}/search?q=): Search all news, stories, and events. Append a query, e.g. /search?q=lightning

## Recent Articles
${recentArticles}

## Feeds
- RSS: ${SITE_URL}/rss.xml
- Sitemap: ${SITE_URL}/sitemap.xml
- News Sitemap: ${SITE_URL}/news-sitemap.xml
`;

  return new Response(body, {
    headers: {
      'Content-Type': 'text/plain; charset=utf-8',
      'Cache-Control': 'public, max-age=3600, s-maxage=3600',
    },
  });
}
