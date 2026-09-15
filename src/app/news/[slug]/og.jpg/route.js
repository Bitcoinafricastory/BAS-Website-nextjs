import sharp from 'sharp';
import { getNewsBySlug } from '@/lib/news';
import { resolveImageUrl } from '@/lib/schema';

export const revalidate = 86400;

/**
 * Serves each article's social preview image from our own domain, resized and
 * re-encoded to something every scraper will accept.
 *
 * Why this is needed: pointing og:image straight at the Firebase Storage URL
 * works for Telegram and Twitter but not WhatsApp. WhatsApp's scraper is
 * unusually strict — it wants a small file, and it is known to struggle with
 * URLs that carry query strings and have no file extension. A Firebase URL
 * looks like:
 *
 *   .../o/news%2Ffeatured_1789226272107?alt=media&token=f7225cbf-...
 *
 * which has a percent-encoded path, two query parameters, and no extension.
 *
 * This route gives it the opposite: https://.../news/<slug>/og.jpg — clean
 * path, real extension, served as image/jpeg, 1200x630, and small.
 */

// WhatsApp reportedly skips preview images much above ~300KB, so target well
// under that. 1200x630 at quality 72 lands around 80-150KB for a photo.
const OG_WIDTH = 1200;
const OG_HEIGHT = 630;
const OG_QUALITY = 72;

export async function GET(request, { params }) {
  const { slug } = await params;

  try {
    const post = await getNewsBySlug(slug);
    const source = post?.image ? resolveImageUrl(post.image) : null;

    if (!source) {
      // No featured image — redirect to the site-wide default rather than
      // returning an error, so the share still shows something branded.
      return Response.redirect(new URL('/assets/og-image.jpg', request.url), 302);
    }

    const upstream = await fetch(source);
    if (!upstream.ok) throw new Error(`upstream ${upstream.status}`);
    const input = Buffer.from(await upstream.arrayBuffer());

    const output = await sharp(input)
      // `cover` crops to the exact 1.91:1 ratio social cards expect, rather
      // than letterboxing with bars.
      .resize(OG_WIDTH, OG_HEIGHT, { fit: 'cover', position: 'attention' })
      .jpeg({ quality: OG_QUALITY, progressive: true, mozjpeg: true })
      .toBuffer();

    return new Response(output, {
      headers: {
        'Content-Type': 'image/jpeg',
        'Content-Length': String(output.length),
        // Long cache: the image for a given article rarely changes, and
        // scrapers re-request it often.
        'Cache-Control': 'public, max-age=86400, s-maxage=604800, immutable',
      },
    });
  } catch (err) {
    console.warn(`og image for ${slug} failed, falling back:`, err.message);
    return Response.redirect(new URL('/assets/og-image.jpg', request.url), 302);
  }
}
