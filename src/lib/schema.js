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
        urlTemplate: `${SITE_URL}/search?q={search_term_string}`,
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

export function eventSchema(event) {
  if (!event) return null;
  const pageUrl = `${SITE_URL}/events/${event.id}`;
  const isVirtual = event.format === 'virtual';

  // Firestore stores date as e.g. "2026-02-04" and time as free text ("6:00 PM").
  // Schema.org wants ISO-8601; fall back to date-only if time isn't parseable.
  let startDate;
  if (event.date) {
    const parsed = new Date(`${event.date} ${event.time || ''}`.trim());
    startDate = Number.isNaN(parsed.getTime())
      ? new Date(event.date).toISOString()
      : parsed.toISOString();
  }

  const location = isVirtual
    ? {
        '@type': 'VirtualLocation',
        url: event.registrationUrl || pageUrl,
      }
    : {
        '@type': 'Place',
        name: event.venue || event.city || 'Venue to be announced',
        address: {
          '@type': 'PostalAddress',
          streetAddress: event.address || undefined,
          addressLocality: event.city || undefined,
          addressCountry: 'NG',
        },
      };

  return {
    '@context': 'https://schema.org',
    '@type': 'Event',
    name: event.eventName,
    description: event.description,
    startDate,
    eventAttendanceMode: isVirtual
      ? 'https://schema.org/OnlineEventAttendanceMode'
      : 'https://schema.org/OfflineEventAttendanceMode',
    eventStatus: 'https://schema.org/EventScheduled',
    location,
    image: event.banner ? [resolveImageUrl(event.banner)] : undefined,
    url: pageUrl,
    organizer: {
      '@type': 'Organization',
      name: SITE_NAME,
      url: SITE_URL,
    },
    offers: event.registrationUrl
      ? {
          '@type': 'Offer',
          url: event.registrationUrl,
          price: '0',
          priceCurrency: 'NGN',
          availability: 'https://schema.org/InStock',
        }
      : undefined,
  };
}

export function courseSchema(program) {
  if (!program) return null;
  return {
    '@type': 'Course',
    name: program.title,
    description: program.description,
    url: program.link || `${SITE_URL}/education`,
    provider: {
      '@type': 'Organization',
      name: SITE_NAME,
      url: SITE_URL,
    },
    isAccessibleForFree: true,
    inLanguage: 'en',
  };
}

// Wraps a list of Course schemas for the Education page.
export function courseListSchema(programs) {
  const courses = (programs || []).map(courseSchema).filter(Boolean);
  if (courses.length === 0) return null;
  return {
    '@context': 'https://schema.org',
    '@type': 'ItemList',
    name: 'Free Bitcoin Education Programs',
    itemListElement: courses.map((course, i) => ({
      '@type': 'ListItem',
      position: i + 1,
      item: course,
    })),
  };
}

// Wraps podcast episodes as an ItemList for the News page.
export function podcastListSchema(episodes) {
  const eps = (episodes || []).map((ep) => {
    const schema = podcastEpisodeSchema(ep);
    delete schema['@context'];
    return schema;
  });
  if (eps.length === 0) return null;
  return {
    '@context': 'https://schema.org',
    '@type': 'ItemList',
    name: 'Bitcoin Africa Story Podcast Episodes',
    itemListElement: eps.map((ep, i) => ({
      '@type': 'ListItem',
      position: i + 1,
      item: ep,
    })),
  };
}

// Render helper: turns any schema object into a <script> tag payload.
export function jsonLdScript(schema) {
  return { __html: JSON.stringify(schema) };
}

export { SITE_URL, SITE_NAME, LOGO_URL };
