import { getAllNews } from '@/lib/news';
import { getAllEvents } from '@/lib/events';
import { getActiveAuthors } from '@/lib/authors';
import { getEntities } from '@/lib/entities';
import { getAllEducationPrograms, getAllOtherPrograms } from '@/lib/education';

export const revalidate = 300;

const staticRoutes = [
  { path: '/', priority: 1.0, changeFrequency: 'daily' },
  { path: '/news', priority: 0.9, changeFrequency: 'daily' },
  { path: '/directory', priority: 0.85, changeFrequency: 'daily' },
  { path: '/podcast', priority: 0.75, changeFrequency: 'weekly' },
  { path: '/faq', priority: 0.7, changeFrequency: 'monthly' },
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
  const base = 'https://bitcoinafricastory.com';

  let articleEntries = [];
  let eventEntries = [];
  try {
    const posts = await getAllNews();
    articleEntries = posts.map((post) => ({
      url: `${base}/news/${post.slug || post.id}`,
      lastModified: post.date ? new Date(post.date) : new Date(),
      changeFrequency: 'weekly',
      priority: 0.85,
    }));
  } catch (err) {
    console.warn('sitemap: could not fetch articles', err);
  }

  try {
    const events = await getAllEvents();
    eventEntries = events.map((event) => ({
      url: `${base}/events/${event.id}`,
      lastModified: new Date(),
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
        url: `${base}/authors/${a.slug}`,
        lastModified: new Date(),
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
        url: `${base}/directory/${e.slug}`,
        lastModified: new Date(),
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
        lastModified: new Date(),
        changeFrequency: 'monthly',
        priority: 0.6,
      })),
      ...otherPrograms.map((p) => ({
        url: `${base}/education/programs/${p.id}`,
        lastModified: new Date(),
        changeFrequency: 'monthly',
        priority: 0.55,
      })),
    ];
  } catch (err) {
    console.warn('sitemap: could not fetch education programs', err);
  }

  const staticEntries = staticRoutes.map((r) => ({
    url: `${base}${r.path}`,
    lastModified: new Date(),
    changeFrequency: r.changeFrequency,
    priority: r.priority,
  }));

  const categoryEntries = CATEGORIES.map((c) => ({
    url: `${base}/news/category/${c}`,
    lastModified: new Date(),
    changeFrequency: 'weekly',
    priority: 0.7,
  }));

  return [...staticEntries, ...categoryEntries, ...articleEntries, ...eventEntries, ...authorEntries, ...entityEntries, ...programEntries];
}
