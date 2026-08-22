// Centralized schema.org / structured-data builders.
// Keeping these in one place means every page emits consistent, valid JSON-LD
// that Google, Bing, and AI answer engines (ChatGPT, Claude, Perplexity,
// Gemini) can parse reliably.

const SITE_URL = 'https://bitcoinafricastory.com';
const SITE_NAME = 'Bitcoin Africa Story';
const LOGO_URL = `${SITE_URL}/assets/BitcoinAfricaStoryLogo.png`;

export const SOCIAL_PROFILES = [
  'https://x.com/btcafricastory',
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
    // Stable @id so other schema nodes on the same page (NewsArticle,
    // PodcastSeries, VideoObject, WebSite) can reference this node by @id
    // instead of re-declaring the organization inline. Browsers/crawlers
    // resolve @id references across every JSON-LD <script> block present on
    // a rendered page, not just within one block.
    '@id': `${SITE_URL}/#organization`,
    // Both types are accurate: we publish news (NewsMediaOrganization) and run
    // free Bitcoin education programs (EducationalOrganization). Declaring both
    // is a stronger, more specific entity signal than the generic "Organization".
    '@type': ['NewsMediaOrganization', 'EducationalOrganization'],
    name: SITE_NAME,
    alternateName: 'BAS',
    url: SITE_URL,
    logo: { '@type': 'ImageObject', url: LOGO_URL },
    description:
      'Independent media and education platform documenting Bitcoin adoption, innovation, and impact across the African continent.',
    foundingDate: '2024',
    sameAs: SOCIAL_PROFILES,
    contactPoint: {
      '@type': 'ContactPoint',
      email: 'bitcoinafricastory@proton.me',
      contactType: 'editorial',
    },
    knowsAbout: [
      'Bitcoin',
      'Bitcoin adoption in Africa',
      'Bitcoin education',
      'Circular economies',
      'Lightning Network',
      'African fintech',
    ],
  };
}

export function websiteSchema() {
  return {
    '@context': 'https://schema.org',
    '@id': `${SITE_URL}/#website`,
    '@type': 'WebSite',
    name: SITE_NAME,
    url: SITE_URL,
    publisher: { '@id': `${SITE_URL}/#organization` },
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
  if (entity.coverImage || entity.logo) base.image = resolveImageUrl(entity.coverImage || entity.logo);
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

  const wordCount = post.content
    ? String(post.content).replace(/<[^>]*>/g, ' ').split(/\s+/).filter(Boolean).length
    : undefined;

  // Emit the article's tags as schema keywords — a direct signal that helps the
  // article surface when someone searches those terms.
  const keywords = Array.isArray(post.tags) && post.tags.length > 0
    ? post.tags.join(', ')
    : (typeof post.tags === 'string' && post.tags ? post.tags : undefined);

  return {
    '@context': 'https://schema.org',
    '@type': 'NewsArticle',
    headline: post.title,
    // ImageObject with declared dimensions rather than a bare URL — helps Google
    // pick the image for rich results and large-image treatment. 1200x630 is the
    // OG/social standard used as a sensible default (article images aren't stored
    // with real pixel dimensions).
    image: imageUrl
      ? [{ '@type': 'ImageObject', url: imageUrl, width: 1200, height: 630 }]
      : undefined,
    datePublished: published,
    dateModified: modified,
    author: [authorSchema],
    publisher: { '@id': `${SITE_URL}/#organization` },
    description: post.excerpt,
    articleSection: post.category,
    keywords,
    inLanguage: 'en',
    isAccessibleForFree: true,
    wordCount,
    // Tells voice assistants and AI answer engines which parts of the page are
    // the best candidates to read aloud as a spoken answer.
    speakable: {
      '@type': 'SpeakableSpecification',
      cssSelector: ['h1', '.article-body'],
    },
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

/** PodcastSeries — the series-level entity for the /podcast hub page. */
export function podcastSeriesSchema() {
  return {
    '@context': 'https://schema.org',
    '@type': 'PodcastSeries',
    name: 'Bitcoin Africa Story Podcast',
    url: `${SITE_URL}/podcast`,
    description:
      'Conversations with the merchants, builders, and communities putting Bitcoin to work across Africa.',
    publisher: { '@id': `${SITE_URL}/#organization` },
    inLanguage: 'en',
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
      url: `${SITE_URL}/podcast`,
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
    organizer: { '@id': `${SITE_URL}/#organization` },
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
    provider: { '@id': `${SITE_URL}/#organization` },
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
// Strips the @context key so a full schema object can be nested inside a
// list without repeating context declarations (invalid per JSON-LD).
function stripContext(schema) {
  if (!schema) return schema;
  const { '@context': _context, ...rest } = schema;
  return rest;
}

/**
 * CollectionPage + ItemList for the /directory hub. Tells crawlers and AI
 * engines what the directory contains as one structured unit, complementing
 * the per-entity schema already on each profile page.
 */
export function entityListSchema(entities = []) {
  if (entities.length === 0) return null;
  return {
    '@context': 'https://schema.org',
    '@type': 'CollectionPage',
    name: 'Bitcoin Africa Directory',
    description:
      'A directory of Bitcoin communities, organizations, and projects across Africa, verified by Bitcoin Africa Story reporters.',
    url: `${SITE_URL}/directory`,
    mainEntity: {
      '@type': 'ItemList',
      numberOfItems: entities.length,
      itemListElement: entities.map((entity, i) => ({
        '@type': 'ListItem',
        position: i + 1,
        item: stripContext(directoryEntitySchema(entity)),
      })),
    },
  };
}

/** ItemList of Event for the /events listing page. */
export function eventListSchema(events = []) {
  const withSchema = events.map((e) => eventSchema(e)).filter(Boolean);
  if (withSchema.length === 0) return null;
  return {
    '@context': 'https://schema.org',
    '@type': 'ItemList',
    name: 'Bitcoin Events in Africa',
    url: `${SITE_URL}/events`,
    numberOfItems: withSchema.length,
    itemListElement: withSchema.map((schema, i) => ({
      '@type': 'ListItem',
      position: i + 1,
      item: stripContext(schema),
    })),
  };
}

/** ItemList of Person for the /authors listing page. */
export function personListSchema(authors = []) {
  if (authors.length === 0) return null;
  return {
    '@context': 'https://schema.org',
    '@type': 'ItemList',
    name: 'Bitcoin Africa Story Writers',
    url: `${SITE_URL}/authors`,
    numberOfItems: authors.length,
    itemListElement: authors.map((author, i) => ({
      '@type': 'ListItem',
      position: i + 1,
      item: personSchema(author),
    })),
  };
}

/** AboutPage — the canonical "what is this organization" signal for AI engines. */
export function aboutPageSchema() {
  return {
    '@context': 'https://schema.org',
    '@type': 'AboutPage',
    name: `About ${SITE_NAME}`,
    url: `${SITE_URL}/about`,
    mainEntity: stripContext(organizationSchema()),
  };
}

/** ContactPage schema for /contact. */
export function contactPageSchema() {
  return {
    '@context': 'https://schema.org',
    '@type': 'ContactPage',
    name: `Contact ${SITE_NAME}`,
    url: `${SITE_URL}/contact`,
    mainEntity: stripContext(organizationSchema()),
  };
}

export function jsonLdScript(schema) {
  return { __html: JSON.stringify(schema) };
}

export { SITE_URL, SITE_NAME, LOGO_URL };

// ─────────────────────────────────────────────────────────────
// VideoObject schema — lets Google show a video thumbnail beside
// our result in normal search and consider the page for the Videos
// tab. Works for both the education videos (bitcoin_videos) and the
// podcast episodes, since both are YouTube-hosted.
// ─────────────────────────────────────────────────────────────

// Pull the YouTube video id out of any of the common URL shapes
// (watch?v=, youtu.be/, /embed/, /shorts/) so we can build canonical
// embed + thumbnail URLs even when the stored link varies.
function youtubeId(url) {
  if (!url) return null;
  const patterns = [
    /[?&]v=([\w-]{11})/,
    /youtu\.be\/([\w-]{11})/,
    /\/embed\/([\w-]{11})/,
    /\/shorts\/([\w-]{11})/,
  ];
  for (const re of patterns) {
    const m = url.match(re);
    if (m) return m[1];
  }
  return null;
}

// Convert "12:45" or "1:02:30" style durations into ISO-8601 (PT12M45S),
// which is what schema.org duration expects. Returns undefined if absent.
function isoDuration(raw) {
  if (!raw || typeof raw !== 'string') return undefined;
  const parts = raw.split(':').map((n) => parseInt(n, 10));
  if (parts.some(Number.isNaN)) return undefined;
  let h = 0, m = 0, s = 0;
  if (parts.length === 3) [h, m, s] = parts;
  else if (parts.length === 2) [m, s] = parts;
  else if (parts.length === 1) [s] = parts;
  else return undefined;
  return `PT${h ? `${h}H` : ''}${m ? `${m}M` : ''}${s ? `${s}S` : ''}` || undefined;
}

/**
 * VideoObject for an education video (bitcoin_videos record).
 * Falls back to YouTube's own thumbnail if no custom one was uploaded.
 */
export function educationVideoSchema(video, pageUrl = `${SITE_URL}/education`) {
  if (!video) return null;
  const id = youtubeId(video.embedUrl);
  const thumbnail = video.thumbnailUrl
    ? resolveImageUrl(video.thumbnailUrl)
    : (id ? `https://i.ytimg.com/vi/${id}/hqdefault.jpg` : undefined);
  return {
    '@context': 'https://schema.org',
    '@type': 'VideoObject',
    name: video.title,
    description: video.description || video.title,
    thumbnailUrl: thumbnail ? [thumbnail] : undefined,
    uploadDate: video.createdAt
      ? new Date(video.createdAt?.seconds ? video.createdAt.seconds * 1000 : video.createdAt).toISOString()
      : undefined,
    duration: isoDuration(video.duration),
    embedUrl: id ? `https://www.youtube.com/embed/${id}` : video.embedUrl,
    contentUrl: id ? `https://www.youtube.com/watch?v=${id}` : video.embedUrl,
    publisher: { '@id': `${SITE_URL}/#organization` },
    isFamilyFriendly: true,
    inLanguage: 'en',
    mainEntityOfPage: { '@type': 'WebPage', '@id': pageUrl },
  };
}

/**
 * VideoObject for a podcast episode (YouTube video). An episode can validly
 * carry both PodcastEpisode and VideoObject markup, so this runs alongside
 * the existing podcast schema rather than replacing it.
 */
export function podcastVideoSchema(episode) {
  if (!episode) return null;
  const id = youtubeId(episode.url);
  const thumbnail = episode.image
    ? resolveImageUrl(episode.image)
    : (id ? `https://i.ytimg.com/vi/${id}/hqdefault.jpg` : undefined);
  return {
    '@context': 'https://schema.org',
    '@type': 'VideoObject',
    name: episode.title,
    description: episode.description || episode.title,
    thumbnailUrl: thumbnail ? [thumbnail] : undefined,
    uploadDate: episode.date ? new Date(episode.date).toISOString() : undefined,
    embedUrl: id ? `https://www.youtube.com/embed/${id}` : episode.url,
    contentUrl: episode.url,
    publisher: { '@id': `${SITE_URL}/#organization` },
    isFamilyFriendly: true,
    inLanguage: 'en',
    mainEntityOfPage: { '@type': 'WebPage', '@id': `${SITE_URL}/podcast` },
  };
}
