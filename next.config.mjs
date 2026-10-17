import { DEVICE_SIZES, IMAGE_SIZES } from './src/lib/image-sizes.mjs';

/** @type {import('next').NextConfig} */
const nextConfig = {
  // Don't advertise the framework in an x-powered-by header.
  poweredByHeader: false,
  // Remote images.
  //
  // next/image THROWS a runtime error on any host not matched here, which would
  // break a live page. Editors paste image URLs from arbitrary news sites and
  // sources we can't predict, so a finite allowlist is guaranteed to fail
  // eventually. We allow any HTTPS host instead: we keep every optimization
  // benefit (AVIF/WebP, responsive resizing, lazy-loading) with no runtime
  // landmine. Images are still proxied and re-encoded by Next's optimizer —
  // they are never hot-linked directly into the page.
  //
  // Resizing is done by our own /img route through a custom loader (see
  // src/lib/image-loader.js), because Vercel's optimizer quota ran out.
  images: {
    loader: 'custom',
    loaderFile: './src/lib/image-loader.js',
    deviceSizes: DEVICE_SIZES,
    imageSizes: IMAGE_SIZES,
    formats: ['image/avif', 'image/webp'],
    remotePatterns: [
      { protocol: 'https', hostname: '**' },
    ],
  },
  // Baseline security headers on every response. A strict Content-Security-Policy
  // is deliberately NOT set here: the site loads Firebase, Google Analytics,
  // YouTube embeds and images from arbitrary HTTPS hosts, so a CSP needs to be
  // trialled in report-only mode first to avoid breaking pages.
  async headers() {
    return [
      {
        source: '/:path*',
        headers: [
          { key: 'Strict-Transport-Security', value: 'max-age=63072000; includeSubDomains; preload' },
          { key: 'X-Content-Type-Options', value: 'nosniff' },
          { key: 'X-Frame-Options', value: 'SAMEORIGIN' },
          { key: 'Referrer-Policy', value: 'strict-origin-when-cross-origin' },
          { key: 'Permissions-Policy', value: 'camera=(), microphone=(), geolocation=(), payment=()' },
        ],
      },
      {
        // Files in /public are served with no browser cache by default, so a
        // returning visitor re-checks the logo and photos on every page,
        // costing a round trip each (most of a second each on 2G). Cache for a
        // week; replace a file under a new name if it must change at once.
        source: '/assets/:path*',
        headers: [
          { key: 'Cache-Control', value: 'public, max-age=604800, stale-while-revalidate=2592000' },
        ],
      },
    ];
  },
  // Markdown twins: agents fetch /news/{slug}.md, which Next can't express as a
  // route folder (a dynamic segment can't carry a literal .md suffix), so the
  // public URL is rewritten onto the handler that generates it.
  async rewrites() {
    return [
      { source: '/news/:slug.md', destination: '/api/md/:slug' },
    ];
  },
};

export default nextConfig;
