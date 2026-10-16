import sharp from 'sharp';
import { getNewsBySlug } from '@/lib/news';
import { resolveImageUrl } from '@/lib/schema';

/**
 * Serves an article's featured photo from our own domain with a descriptive
 * filename: /news/<slug>/<slug>.jpg.
 *
 * Why: the stored photo is a Firebase Storage link with a timestamp filename,
 * a ?token= query string and `cache-control: private`, which image search
 * rarely surfaces. This gives Google Images and Discover a public, cacheable,
 * full-width JPEG on bitcoinafricastory.com whose name describes the story.
 * (The cropped 1200x630 social card stays at /news/<slug>/og.jpg.)
 *
 * Any other filename under an article returns 404.
 */
const MAX_WIDTH = 1600; // Discover and large previews want >= 1200px wide.

export async function GET(request, { params }) {
  const { slug, file } = await params;
  if (file !== `${slug}.jpg`) return new Response('Not found', { status: 404 });

  let source = null;
  try {
    const post = await getNewsBySlug(slug);
    source = post?.image ? resolveImageUrl(post.image) : null;
    if (!source) return new Response('Not found', { status: 404 });

    const upstream = await fetch(source);
    if (!upstream.ok) throw new Error(`upstream ${upstream.status}`);
    const input = Buffer.from(await upstream.arrayBuffer());

    const output = await sharp(input)
      .rotate() // respect camera orientation
      .resize({ width: MAX_WIDTH, withoutEnlargement: true })
      .jpeg({ quality: 82, progressive: true, mozjpeg: true })
      .toBuffer();

    return new Response(output, {
      headers: {
        'Content-Type': 'image/jpeg',
        'Content-Length': String(output.length),
        'Cache-Control': 'public, max-age=86400, s-maxage=604800, stale-while-revalidate=86400',
      },
    });
  } catch (err) {
    console.warn(`article photo for ${slug} failed, falling back to original:`, err?.message);
    // Never show a broken image: fall back to the original file.
    if (source) return Response.redirect(source, 302);
    return new Response('Not found', { status: 404 });
  }
}
