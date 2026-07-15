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

/**
 * Structured data for a directory profile page (/directory/[slug]).
 * Emits Person schema for entity type "person", Organization for everything
 * else — both are valid schema.org types search engines and AI answer
 * engines already understand, so each profile can rank independently.
 */
export function directoryEntitySchema(entity) {
  const pageUrl = `${SITE_URL}/directory/${entity.slug}`;
  const sameAs = [entity.website, entity.socialLinks?.twitter, entity.socialLinks?.linkedin, entity.socialLinks?.telegram]
    .filter(Boolean);

  const base = {
    '@context': 'https://schema.org',
    '@type': entity.type === 'person' ? 'Person' : 'Organization',
    name: entity.name,
    url: pageUrl,
  };
  if (entity.description) base.description = entity.description;
  if (entity.logo) base.image = resolveImageUrl(entity.logo);
  if (sameAs.length > 0) base.sameAs = sameAs;
  if (entity.country) base.areaServed = entity.country;
  if (entity.type !== 'person' && entity.yearFounded) base.foundingDate = String(entity.yearFounded);
  return base;
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

/**
 * Person schema — accepts either a plain name string (legacy bylines) or a
 * full author object with slug/bio/socials/avatar.
 *
 * When given a full author, emits url pointing at their /authors/[slug] page
 * plus sameAs for their public socials, which is what E-E-A-T signals depend on.
 */
export function personSchema(author) {
  if (!author) {
    return { '@type': 'Person', name: SITE_NAME, url: `${SITE_URL}/about` };
  }

  if (typeof author === 'string') {
    return { '@type': 'Person', name: author, url: `${SITE_URL}/about` };
  }

  const sameAs = [author.twitter, author.linkedin, author.website]
    .filter(Boolean);

  const schema = {
    '@type': 'Person',
    name: author.name,
    url: author.slug ? `${SITE_URL}/authors/${author.slug}` : `${SITE_URL}/about`,
  };
  if (author.role) schema.jobTitle = author.role;
  if (author.bio) schema.description = author.bio;
  if (author.avatar) schema.image = resolveImageUrl(author.avatar);
  if (sameAs.length > 0) schema.sameAs = sameAs;
  return schema;
}

export function newsArticleSchema(post, author) {
  const pageUrl = `${SITE_URL}/news/${post.slug || post.id}`;
  const imageUrl = resolveImageUrl(post.image);
  const published = post.date ? new Date(post.date).toISOString() : new Date().toISOString();
  const modified = post.updatedAt ? new Date(post.updatedAt).toISOString() : published;

  // Prefer a resolved author object; fall back to the legacy string byline.
  const authorSchema = author
    ? personSchema(author)
    : personSchema(post.author || post.authorName);

  return {
    '@context': 'https://schema.org',
    '@type': 'NewsArticle',
    headline: post.title,
    image: imageUrl ? [imageUrl] : undefined,
    datePublished: published,
    dateModified: modified,
    author: [authorSchema],
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

/**
 * ProfilePage schema for /authors/[slug]. Wraps the Person and links to all
 * of their published articles so Google understands the page is an author hub.
 */
export function authorProfileSchema(author, articles = []) {
  if (!author) return null;
  const personObj = personSchema(author);
  delete personObj['@context'];

  return {
    '@context': 'https://schema.org',
    '@type': 'ProfilePage',
    mainEntity: personObj,
    hasPart: articles.slice(0, 20).map((a) => ({
      '@type': 'NewsArticle',
      headline: a.title,
      url: `${SITE_URL}/news/${a.slug || a.id}`,
      datePublished: a.date ? new Date(a.date).toISOString() : undefined,
    })),
  };
}

// Render helper: turns any schema object into a <script> tag payload.
export function jsonLdScript(schema) {
  return { __html: JSON.stringify(schema) };
}

export { SITE_URL, SITE_NAME, LOGO_URL };
