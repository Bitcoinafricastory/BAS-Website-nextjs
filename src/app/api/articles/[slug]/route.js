import { getNewsBySlug } from '@/lib/news';
import { postToJson, machineHeaders } from '@/lib/machine-content';

export const revalidate = 300;

export async function GET(request, { params }) {
  const { slug } = await params;
  const post = await getNewsBySlug(slug);

  if (!post) {
    return Response.json({ error: 'Not found' }, { status: 404 });
  }

  // Single-article responses include the markdown body so an agent can fetch
  // once instead of making a second request to the .md twin.
  return Response.json(postToJson(post, { includeMarkdown: true }), {
    headers: machineHeaders('application/json; charset=utf-8'),
  });
}
