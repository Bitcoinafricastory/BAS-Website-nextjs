export default function robots() {
  return {
    rules: {
      userAgent: '*',
      allow: '/',
      // Search *result* URLs are infinite and low-value for the index; the
      // /search landing page itself stays crawlable.
      disallow: ['/admin', '/dashboard', '/search?'],
    },
    sitemap: [
      'https://bitcoinafricastory.com/sitemap.xml',
      'https://bitcoinafricastory.com/news-sitemap.xml',
    ],
  };
}
