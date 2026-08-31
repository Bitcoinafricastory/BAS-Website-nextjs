/** @type {import('next').NextConfig} */
const nextConfig = {
  // Remote images.
  //
  // next/image THROWS a runtime error on any host not matched here, which would
  // break a live page. Editors paste image URLs from arbitrary news sites and
  // sources we can't predict, so a finite allowlist is guaranteed to fail
  // eventually. We allow any HTTPS host instead: we keep every optimization
  // benefit (AVIF/WebP, responsive resizing, lazy-loading) with no runtime
  // landmine. Images are still proxied and re-encoded by Next's optimizer —
  // they are never hot-linked directly into the page.
  images: {
    formats: ['image/avif', 'image/webp'],
    remotePatterns: [
      { protocol: 'https', hostname: '**' },
    ],
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
