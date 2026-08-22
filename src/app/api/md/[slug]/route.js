import { getNewsBySlug } from '@/lib/news';
import { postToMarkdown, machineHeaders } from '@/lib/machine-content';

export const revalidate = 300;

// Backing handler for the public /news/{slug}.md URL. Next.js can't use a
// dynamic segment with a literal suffix ([slug].md), so next.config rewrites
// /news/:slug.md here while the public URL keeps the .md form agents expect.
export async function GET(request, { params }) {
  const { slug } = await params;
  const post = await getNewsBySlug(slug);

  if (!post) {
    return new Response('Not found\n', {
      status: 404,
      headers: { 'Content-Type': 'text/plain; charset=utf-8' },
    });
  }

  return new Response(postToMarkdown(post), {
    headers: machineHeaders('text/markdown; charset=utf-8'),
  });
}
