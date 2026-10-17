'use client';

import { RESIZABLE_HOSTS } from './image-sizes.mjs';

// Custom next/image loader. Vercel's built-in optimizer was switched off
// (every image marked `unoptimized`) after the plan's monthly quota ran out,
// so phones were downloading full-size originals: a 160 KB to 3 MB photo for
// an 80 px thumbnail. This sends each image through our own resizer instead,
// at the width the screen actually needs, as WebP.
//
// - Article photos (/news/<slug>/<slug>.jpg) keep their descriptive URL for
//   Google Images; only a ?w= width is added.
// - Firebase/YouTube images and large files in /public go through /img.
// - SVG, GIF, data: and blob: URLs, and other sites' images, are left alone.
//   For those we add a #w= fragment: browsers never send fragments, so the
//   file is fetched once as-is, but Next.js stops warning that the loader
//   "does not implement width".
const ARTICLE_PHOTO = /^\/news\/[^/?#]+\/[^/?#]+\.jpg$/;

export default function imageLoader({ src, width }) {
  if (!src || typeof src !== 'string') return src;
  if (/^(data|blob):/i.test(src)) return src;
  if (/\.(svg|gif)(\?|#|$)/i.test(src)) return asIs(src, width);

  if (ARTICLE_PHOTO.test(src)) return `${src}?w=${width}`;

  if (src.startsWith('/') && !src.startsWith('//')) {
    if (src.startsWith('/img')) return src;
    return `/img?url=${encodeURIComponent(src)}&w=${width}`;
  }

  try {
    const url = new URL(src);
    if (url.protocol === 'https:' && RESIZABLE_HOSTS.includes(url.hostname)) {
      return `/img?url=${encodeURIComponent(src)}&w=${width}`;
    }
  } catch {
    // malformed: fall through
  }
  return asIs(src, width);
}

function asIs(src, width) {
  return src.includes('#') ? src : `${src}#w=${width}`;
}
