// Explicitly welcoming AI/answer-engine crawlers alongside search engines.
// A bare `User-agent: *` already permits them, but several of these bots
// (Google-Extended, GPTBot, ClaudeBot, PerplexityBot…) are checked for by name
// and treating them explicitly makes our stance unambiguous: our journalism is
// meant to be readable and citable by answer engines, not walled off.
const AI_AND_SEARCH_CRAWLERS = [
  'Googlebot',
  'Google-Extended',
  'Bingbot',
  'GPTBot',
  'ChatGPT-User',
  'OAI-SearchBot',
  'ClaudeBot',
  'Claude-Web',
  'Anthropic-AI',
  'PerplexityBot',
  'Applebot',
  'Applebot-Extended',
  'CCBot',
];

// Search *result* URLs are infinite and low-value for the index; the /search
// landing page itself stays crawlable.
const DISALLOW = ['/admin', '/dashboard', '/search?'];

export default function robots() {
  return {
    rules: [
      {
        userAgent: '*',
        allow: '/',
        disallow: DISALLOW,
      },
      ...AI_AND_SEARCH_CRAWLERS.map((userAgent) => ({
        userAgent,
        allow: '/',
        disallow: DISALLOW,
      })),
    ],
    sitemap: [
      'https://bitcoinafricastory.com/sitemap.xml',
      'https://bitcoinafricastory.com/news-sitemap.xml',
      'https://bitcoinafricastory.com/video-sitemap.xml',
    ],
  };
}
