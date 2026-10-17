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
const ARTICLE_PHOTO = /^\/news\/[^/?#]+\/[^/?#]+\.jpg$/;

export default function imageLoader({ src, width }) {
  if (!src || typeof src !== 'string') return src;
  if (/\.(svg|gif)(\?|$)/i.test(src)) return src;

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
    // data:, blob: or malformed: fall through
  }
  return src;
}
