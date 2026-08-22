import { getAllNews } from '@/lib/news';
import { getEntities } from '@/lib/entities';
import { postToJson, machineHeaders, SITE_URL } from '@/lib/machine-content';

export const revalidate = 300;

export async function GET(request) {
  const { searchParams } = new URL(request.url);
  const q = (searchParams.get('q') || '').trim().toLowerCase();

  if (!q) {
    return Response.json(
      { query: '', articles: [], directory: [], note: 'Pass ?q= to search.' },
      { headers: machineHeaders('application/json; charset=utf-8') }
    );
  }

  const [posts, entities] = await Promise.all([getAllNews(), getEntities()]);

  const articles = posts
    .filter((p) =>
      [p.title, p.excerpt, p.category, Array.isArray(p.tags) ? p.tags.join(' ') : p.tags]
        .filter(Boolean)
        .join(' ')
        .toLowerCase()
        .includes(q)
    )
    .map((p) => postToJson(p));

  const directory = entities
    .filter((e) =>
      [e.name, e.description, e.country, e.type].filter(Boolean).join(' ').toLowerCase().includes(q)
    )
    .map((e) => ({
      slug: e.slug,
      name: e.name,
      kind: e.type || null,
      country: e.country || null,
      url: `${SITE_URL}/directory/${e.slug}`,
    }));

  return Response.json(
    { query: q, articles, directory },
    { headers: machineHeaders('application/json; charset=utf-8') }
  );
}
