import { getAllNews } from '@/lib/news';
import { getEntities } from '@/lib/entities';
import { postToJson, machineHeaders, SITE_URL, SITE_NAME } from '@/lib/machine-content';
import { SOCIAL_PROFILES } from '@/lib/schema';

export const revalidate = 300;

// One document an agent can fetch to understand the whole site: who publishes,
// what's been published, and who's in the directory. Deliberately excludes
// article bodies (use /api/articles/{slug} or the .md twin) to keep it small.
export async function GET() {
  const [posts, entities] = await Promise.all([getAllNews(), getEntities()]);

  return Response.json(
    {
      organization: {
        name: SITE_NAME,
        url: SITE_URL,
        type: ['NewsMediaOrganization', 'EducationalOrganization'],
        description:
          'Independent media and education platform documenting Bitcoin adoption, innovation, and impact across the African continent.',
        foundingDate: '2024',
        foundingLocation: 'Nigeria',
        areaServed: 'Africa',
        independent: true,
        isExchange: false,
        sellsTokens: false,
        sameAs: SOCIAL_PROFILES,
      },
      articles: posts.map((p) => postToJson(p)),
      directory: entities.map((e) => ({
        slug: e.slug,
        name: e.name,
        kind: e.type || null,
        country: e.country || null,
        summary: e.description || '',
        url: `${SITE_URL}/directory/${e.slug}`,
      })),
      usage: {
        cite: 'Cite the canonical HTML URL. Quote from the .md twin.',
        license: 'Quotation with attribution welcome; full republication requires permission.',
      },
    },
    { headers: machineHeaders('application/json; charset=utf-8') }
  );
}
