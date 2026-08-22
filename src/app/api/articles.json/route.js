import { getAllNews } from '@/lib/news';
import { postToJson, machineHeaders } from '@/lib/machine-content';

export const revalidate = 300;

export async function GET(request) {
  const { searchParams } = new URL(request.url);
  const category = searchParams.get('category');

  let posts = await getAllNews();
  if (category) {
    const wanted = category.toLowerCase();
    posts = posts.filter((p) => (p.category || '').toLowerCase() === wanted);
  }

  return Response.json(
    { count: posts.length, articles: posts.map((p) => postToJson(p)) },
    { headers: machineHeaders('application/json; charset=utf-8') }
  );
}
