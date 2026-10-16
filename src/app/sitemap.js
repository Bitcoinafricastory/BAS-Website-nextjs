import { getAllNews } from '@/lib/news';
import { getAllEvents } from '@/lib/events';
import { getActiveAuthors } from '@/lib/authors';
import { getEntities } from '@/lib/entities';
import { getAllEducationPrograms, getAllOtherPrograms } from '@/lib/education';
import { PILLARS } from '@/lib/pillars';
import { listableCategorySlugs } from '@/lib/resources-data';
import { articlePhotoUrl } from '@/lib/schema';

// Next writes <image:loc> verbatim, without XML-escaping. Firebase Storage URLs
// contain '&' (…?alt=media&token=…), and a raw '&' makes the whole sitemap
// invalid XML — so escape here.
const xmlEscape = (str) =>
  String(str)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&apos;');

// Accurate <lastmod> values. Google and Bing only trust lastmod when it is
// consistently accurate, so: use a document's real last-edited date, and
// leave lastmod out entirely when we don't know it. (Previously most entries
// said "changed right now" on every request, which teaches crawlers to ignore
// the signal.)
function toDate(value) {
  if (!value) return undefined;
  if (value instanceof Date) return Number.isNaN(value.getTime()) ? undefined : value;
  if (typeof value.toDate === 'function') return value.toDate();
  if (typeof value === 'object' && typeof value.seconds === 'number') return new Date(value.seconds * 1000);
  const d = new Date(value);
  return Number.isNaN(d.getTime()) ? undefined : d;
}
const lastEdited = (item) => toDate(item?.updatedAt) || toDate(item?.createdAt);

export const revalidate = 300;

const staticRoutes = [
  ...PILLARS.map((p) => ({ path: `/${p.slug}`, priority: 0.85, changeFrequency: 'weekly' })),
  { path: '/', priority: 1.0, changeFrequency: 'daily' },
  { path: '/news', priority: 0.9, changeFrequency: 'daily' },
  { path: '/directory', priority: 0.85, changeFrequency: 'daily' },
  { path: '/podcast', priority: 0.75, changeFrequency: 'weekly' },
  { path: '/faq', priority: 0.7, changeFrequency: 'monthly' },
  { path: '/subscribe', priority: 0.85, changeFrequency: 'monthly' },
  { path: '/donate', priority: 0.7, changeFrequency: 'monthly' },
  { path: '/contact', priority: 0.6, changeFrequency: 'monthly' },
  { path: '/events', priority: 0.8, changeFrequency: 'weekly' },
  { path: '/education', priority: 0.8, changeFrequency: 'weekly' },
  { path: '/about', priority: 0.7, changeFrequency: 'monthly' },
  { path: '/resources', priority: 0.7, changeFrequency: 'weekly' },
  { path: '/authors', priority: 0.7, changeFrequency: 'weekly' },
  { path: '/search', priority: 0.4, changeFrequency: 'monthly' },
  { path: '/privacy', priority: 0.2, changeFrequency: 'yearly' },
  { path: '/terms', priority: 0.2, changeFrequency: 'yearly' },
];

const CATEGORIES = ['adoption', 'regulations', 'education', 'technology', 'economy', 'security', 'community'];

export default async function sitemap() {
  const base = 'https://www.bitcoinafricastory.com';

  let articleEntries = [];
  let eventEntries = [];
  try {
    const posts = await getAllNews();
    articleEntries = posts.map((post) => ({
      // Encode: a slug containing spaces or punctuation would otherwise
      // produce a URL that isn't valid in a sitemap.
      url: `${base}/news/${encodeURIComponent(post.slug || post.id)}`,
      lastModified: toDate(post.updatedAt) || toDate(post.date),
      changeFrequency: 'weekly',
      priority: 0.85,
      // Image sitemap entry: tells Google which image belongs to this article,
      // so the featured photo is the one associated with it in Google Images.
      ...(articlePhotoUrl(post) ? { images: [xmlEscape(articlePhotoUrl(post))] } : {}),
    }));
  } catch (err) {
    console.warn('sitemap: could not fetch articles', err);
  }

  try {
    const events = await getAllEvents();
    eventEntries = events.map((event) => ({
      url: `${base}/events/${event.id}`,
      lastModified: lastEdited(event),
      changeFrequency: 'weekly',
      priority: 0.6,
    }));
  } catch (err) {
    console.warn('sitemap: could not fetch events', err);
  }

  let authorEntries = [];
  try {
    const authors = await getActiveAuthors();
    authorEntries = authors
      .filter((a) => a.slug)
      .map((a) => ({
        url: `${base}/authors/${encodeURIComponent(a.slug)}`,
        lastModified: lastEdited(a),
        changeFrequency: 'weekly',
        priority: 0.65,
      }));
  } catch (err) {
    console.warn('sitemap: could not fetch authors', err);
  }

  let entityEntries = [];
  try {
    const entities = await getEntities();
    entityEntries = entities
      .filter((e) => e.slug)
      .map((e) => ({
        url: `${base}/directory/${encodeURIComponent(e.slug)}`,
        lastModified: lastEdited(e),
        changeFrequency: 'weekly',
        priority: 0.65,
      }));
  } catch (err) {
    console.warn('sitemap: could not fetch directory entities', err);
  }

  let programEntries = [];
  try {
    const [ownPrograms, otherPrograms] = await Promise.all([getAllEducationPrograms(), getAllOtherPrograms()]);
    programEntries = [
      ...ownPrograms.map((p) => ({
        url: `${base}/education/our-programs/${p.id}`,
        lastModified: lastEdited(p),
        changeFrequency: 'monthly',
        priority: 0.6,
      })),
      ...otherPrograms.map((p) => ({
        url: `${base}/education/programs/${p.id}`,
        lastModified: lastEdited(p),
        changeFrequency: 'monthly',
        priority: 0.55,
      })),
    ];
  } catch (err) {
    console.warn('sitemap: could not fetch education programs', err);
  }

  // Pages that list articles change when the newest article changes.
  const newestArticle = articleEntries
    .map((e) => e.lastModified)
    .filter(Boolean)
    .sort((a, b) => b - a)[0];
  const ARTICLE_LISTING_PATHS = new Set(['/', '/news']);

  const staticEntries = staticRoutes.map((r) => ({
    url: `${base}${r.path}`,
    lastModified: ARTICLE_LISTING_PATHS.has(r.path) ? newestArticle : undefined,
    changeFrequency: r.changeFrequency,
    priority: r.priority,
  }));

  const categoryEntries = CATEGORIES.map((c) => ({
    url: `${base}/news/category/${c}`,
    lastModified: newestArticle,
    changeFrequency: 'weekly',
    priority: 0.7,
  }));

  // Resource category pages (/resources/learning, /tools, /wallets). Derived from
  // the same list that generates the pages, so adding a category in
  // resources-data.js automatically lists it here instead of silently going
  // undiscovered.
  const resourceCategoryEntries = listableCategorySlugs().map((slug) => ({
    url: `${base}/resources/${slug}`,
    changeFrequency: 'monthly',
    priority: 0.65,
  }));

  return [
    ...staticEntries,
    ...categoryEntries,
    ...resourceCategoryEntries,
    ...articleEntries,
    ...eventEntries,
    ...authorEntries,
    ...entityEntries,
    ...programEntries,
  ];
}
