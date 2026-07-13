/** @type {import('next').NextConfig} */
const nextConfig = {
  // Don't fail the production build on ESLint warnings (e.g. unescaped
  // entities, no-danger). These are stylistic and shouldn't block deploys;
  // real TypeScript/compile errors still fail the build as normal.
  eslint: {
    ignoreDuringBuilds: true,
  },
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
};

export default nextConfig;
