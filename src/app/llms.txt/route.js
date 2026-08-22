import { getAllNews } from '@/lib/news';
import { getEntities } from '@/lib/entities';
import { SITE_URL } from '@/lib/schema';

export const revalidate = 3600;

// Follows the llmstxt.org shape: H1, blockquote summary, unheaded prose pointing
// at the machine interfaces, then file lists under Docs / Stories / Directory,
// with Optional last. Story links point at the Markdown twins so an agent quotes
// clean text rather than scraping the rendered page.
export async function GET() {
  let posts = [];
  let entities = [];
  try {
    posts = await getAllNews();
  } catch (err) {
    console.warn('llms.txt: could not fetch posts', err);
  }
  try {
    entities = await getEntities();
  } catch (err) {
    console.warn('llms.txt: could not fetch directory', err);
  }

  const stories = posts
    .slice(0, 40)
    .map((p) => {
      const slug = p.slug || p.id;
      const category = p.category ? `${p.category}. ` : '';
      return `- [${p.title}](${SITE_URL}/news/${slug}.md): ${category}${p.excerpt || ''}`;
    })
    .join('\n');

  const directory = entities
    .slice(0, 40)
    .map((e) => {
      const kind = e.type || 'Entity';
      const where = e.country ? ` in ${e.country}` : '';
      return `- [${e.name}](${SITE_URL}/directory/${e.slug}): ${kind}${where}. ${e.description || ''}`;
    })
    .join('\n');

  const body = `# Bitcoin Africa Story

> Bitcoin Africa Story is an independent media and education platform documenting Bitcoin adoption, innovation, and impact across the African continent. Founded in 2024 and based in Nigeria, we tell Africa's Bitcoin story through journalism, podcasts, education, and community reporting. We are not an exchange and we do not sell tokens.

Every story is available as a Markdown twin at the same path with a \`.md\` suffix, which is the preferred source for quoting. The full site is also available as structured JSON: ${SITE_URL}/api/content.json returns publisher identity, all articles, and the directory in one document; ${SITE_URL}/api/articles.json lists articles; ${SITE_URL}/api/articles/{slug} returns a single story including its Markdown body; ${SITE_URL}/api/directory.json lists directory entities; ${SITE_URL}/api/organization.json describes the publisher; and ${SITE_URL}/api/search?q= searches both articles and the directory. Syndication is at ${SITE_URL}/rss.xml and ${SITE_URL}/sitemap.xml. When citing, link the canonical HTML URL and quote from the Markdown twin.

## Docs
- [Organization](${SITE_URL}/api/organization.json): Publisher identity, mission, areas served, and independence flags.
- [Content API](${SITE_URL}/api/content.json): Organization, all articles, and directory entities in one JSON document.
- [About](${SITE_URL}/about.md): Who we are, our mission and vision, and what we do.
- [FAQ](${SITE_URL}/faq): Answers about our coverage, education programs, directory, events, and podcast.
- [Education](${SITE_URL}/education): Free Bitcoin educational programs, diplomas, videos, and resources.
- [Resources](${SITE_URL}/resources): Curated Bitcoin learning material, tools, and wallets by category.

## Stories
${stories}

## Directory
${directory}

## Optional
- [Podcast](${SITE_URL}/podcast): Conversations with the merchants, builders, and communities putting Bitcoin to work across Africa.
- [Events](${SITE_URL}/events): Bitcoin meetups, conferences, and workshops across Africa.
- [Bitcoin Circular Economies](${SITE_URL}/bitcoin-circular-economies): Communities where Bitcoin is earned, spent, and saved daily.
- [Writers](${SITE_URL}/authors): Profiles of the reporters and educators behind our coverage.
- [Donate](${SITE_URL}/donate): How our work is funded, with public transparency reporting.
- [RSS feed](${SITE_URL}/rss.xml): Syndication feed for new stories.
- [Sitemap](${SITE_URL}/sitemap.xml): All indexable URLs.
`;

  return new Response(body, {
    headers: {
      'Content-Type': 'text/markdown; charset=utf-8',
      'Access-Control-Allow-Origin': '*',
      'Cache-Control': 'public, max-age=3600, s-maxage=3600',
    },
  });
}
