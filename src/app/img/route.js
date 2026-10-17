import sharp from 'sharp';
import { ALLOWED_WIDTHS, RESIZABLE_HOSTS } from '@/lib/image-sizes.mjs';

// Image resizer used by the custom next/image loader (src/lib/image-loader.js).
//   /img?url=<encoded source>&w=<width>
// Returns the image at that width as WebP. The CDN caches every result, so
// each photo/width pair is resized once, not on every visit.
//
// Safety: only our own files and a short list of hosts are accepted, and only
// a fixed set of widths, so it can't be used as an open proxy or to fill the
// cache with endless variants. On any failure it redirects to the original.

const MAX_INPUT_BYTES = 20 * 1024 * 1024;
const QUALITY = 70;

function resolveSource(raw, origin) {
  if (!raw) return null;
  if (raw.startsWith('/') && !raw.startsWith('//')) {
    if (raw.startsWith('/img')) return null;
    return new URL(raw, origin);
  }
  try {
    const url = new URL(raw);
    if (url.protocol === 'https:' && RESIZABLE_HOSTS.includes(url.hostname)) return url;
  } catch {}
  return null;
}

export async function GET(request) {
  const { searchParams, origin } = new URL(request.url);
  const source = resolveSource(searchParams.get('url'), origin);
  const width = Number(searchParams.get('w'));
  if (!source || !ALLOWED_WIDTHS.includes(width)) {
    return new Response('Bad request', { status: 400 });
  }

  try {
    const upstream = await fetch(source, { signal: AbortSignal.timeout(15000) });
    if (!upstream.ok) throw new Error(`upstream ${upstream.status}`);
    const length = Number(upstream.headers.get('content-length') || 0);
    if (length > MAX_INPUT_BYTES) throw new Error('too large');
    const input = Buffer.from(await upstream.arrayBuffer());
    if (input.length > MAX_INPUT_BYTES) throw new Error('too large');

    const output = await sharp(input, { failOn: 'none' })
      .rotate()
      .resize({ width, withoutEnlargement: true })
      .webp({ quality: QUALITY })
      .toBuffer();

    return new Response(output, {
      headers: {
        'Content-Type': 'image/webp',
        'Content-Length': String(output.length),
        // Firebase URLs change when a photo is replaced, so a long cache is
        // safe for them. Our own files keep their name, so cache those less.
        'Cache-Control': source.origin === origin
          ? 'public, max-age=86400, s-maxage=2592000, stale-while-revalidate=86400'
          : 'public, max-age=31536000, s-maxage=31536000, immutable',
      },
    });
  } catch (err) {
    console.warn('img resize failed, redirecting to original:', source.href, err?.message);
    return Response.redirect(source.href, 302);
  }
}
