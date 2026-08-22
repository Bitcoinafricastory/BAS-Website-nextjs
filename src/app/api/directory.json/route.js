import { getEntities } from '@/lib/entities';
import { machineHeaders, SITE_URL } from '@/lib/machine-content';

export const revalidate = 300;

export async function GET() {
  const entities = await getEntities();

  return Response.json(
    {
      count: entities.length,
      entities: entities.map((e) => ({
        slug: e.slug,
        name: e.name,
        kind: e.type || null,
        country: e.country || null,
        summary: e.description || '',
        website: e.website || null,
        url: `${SITE_URL}/directory/${e.slug}`,
      })),
    },
    { headers: machineHeaders('application/json; charset=utf-8') }
  );
}
