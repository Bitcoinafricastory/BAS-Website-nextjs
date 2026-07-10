// Centralized schema.org / structured-data builders.
// Keeping these in one place means every page emits consistent, valid JSON-LD
// that Google, Bing, and AI answer engines (ChatGPT, Claude, Perplexity,
// Gemini) can parse reliably.

const SITE_URL = 'https://bitcoinafricastory.com';
const SITE_NAME = 'Bitcoin Africa Story';
const LOGO_URL = `${SITE_URL}/assets/BitcoinAfricaStoryLogo.png`;

export const SOCIAL_PROFILES = [
  'https://x.com/story_bitcoin',
  'https://youtube.com/@bitcoinafricastory',
  'https://t.me/+KirVlW8gMMtlNDI8',
  'https://www.linkedin.com/company/bitcoin-africa-story/',
  'https://primal.net/p/nprofile1qqs0tmrphute79adfe4r3h8qdkdgqw3fz9244238x2ss53lmhft3jug4hhw4r',
];

export function resolveImageUrl(image) {
  if (!image) return null;
  return image.startsWith('http') ? image : `${SITE_URL}${image.startsWith('/') ? '' : '/'}${image}`;
}

export function organizationSchema() {
  return {
    '@context': 'https://schema.org',
    '@type': 'Organization',
    name: SITE_NAME,
    url: SITE_URL,
    logo: LOGO_URL,
    sameAs: SOCIAL_PROFILES,
  };
}

export function websiteSchema() {
  return {
    '@context': 'https://schema.org',
    '@type': 'WebSite',
    name: SITE_NAME,
    url: SITE_URL,
    potentialAction: {
      '@type': 'SearchAction',
      target: {
        '@type': 'EntryPoint',
        urlTemplate: `${SITE_URL}/news?q={search_term_string}`,
      },
      'query-input': 'required name=search_term_string',
    },
  };
}

export function breadcrumbSchema(items) {
  // items: [{ name, url }]
  return {
    '@context': 'https://schema.org',
    '@type': 'BreadcrumbList',
    itemListElement: items.map((item, i) => ({
      '@type': 'ListItem',
      position: i + 1,
      name: item.name,
      item: item.url,
    })),
  };
}

export function personSchema(name) {
  return {
    '@type': 'Person',
    name: name || SITE_NAME,
    url: `${SITE_URL}/about`,
  };
}

export function newsArticleSchema(post) {
  const pageUrl = `${SITE_URL}/news/${post.slug || post.id}`;
  const imageUrl = resolveImageUrl(post.image);
  const published = post.date ? new Date(post.date).toISOString() : new Date().toISOString();
  const modified = post.updatedAt ? new Date(post.updatedAt).toISOString() : published;

  return {
    '@context': 'https://schema.org',
    '@type': 'NewsArticle',
    headline: post.title,
    image: imageUrl ? [imageUrl] : undefined,
    datePublished: published,
    dateModified: modified,
    author: [personSchema(post.author || post.authorName)],
    publisher: {
      '@type': 'Organization',
      name: SITE_NAME,
      logo: { '@type': 'ImageObject', url: LOGO_URL },
    },
    description: post.excerpt,
    articleSection: post.category,
    mainEntityOfPage: { '@type': 'WebPage', '@id': pageUrl },
  };
}

export function faqSchema(faqs) {
  // faqs: [{ question, answer }]
  if (!faqs || faqs.length === 0) return null;
  return {
    '@context': 'https://schema.org',
    '@type': 'FAQPage',
    mainEntity: faqs.map((f) => ({
      '@type': 'Question',
      name: f.question,
      acceptedAnswer: { '@type': 'Answer', text: f.answer },
    })),
  };
}

export function podcastEpisodeSchema(episode) {
  return {
    '@context': 'https://schema.org',
    '@type': 'PodcastEpisode',
    name: episode.title,
    url: episode.url,
    datePublished: episode.date ? new Date(episode.date).toISOString() : undefined,
    description: episode.description,
    associatedMedia: episode.audioUrl
      ? { '@type': 'MediaObject', contentUrl: episode.audioUrl }
      : undefined,
    partOfSeries: {
      '@type': 'PodcastSeries',
      name: 'Bitcoin Africa Story Podcast',
      url: `${SITE_URL}/news`,
    },
  };
}

// Render helper: turns any schema object into a <script> tag payload.
export function jsonLdScript(schema) {
  return { __html: JSON.stringify(schema) };
}

export { SITE_URL, SITE_NAME, LOGO_URL };
