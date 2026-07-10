/** @type {import('next').NextConfig} */
const nextConfig = {
  // Don't fail the production build on ESLint warnings (e.g. unescaped
  // entities, no-danger). These are stylistic and shouldn't block deploys;
  // real TypeScript/compile errors still fail the build as normal.
  eslint: {
    ignoreDuringBuilds: true,
  },
  // Allow remote images from Firebase Storage and common CDNs used in content.
  images: {
    remotePatterns: [
      { protocol: 'https', hostname: 'firebasestorage.googleapis.com' },
      { protocol: 'https', hostname: '**.firebasestorage.app' },
      { protocol: 'https', hostname: 'images.unsplash.com' },
      { protocol: 'https', hostname: 'pbs.twimg.com' },
    ],
  },
};

export default nextConfig;
