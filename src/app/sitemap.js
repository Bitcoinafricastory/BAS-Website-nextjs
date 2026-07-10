import { getAllNews } from '@/lib/news';
import { getAllEvents } from '@/lib/events';

export const revalidate = 300;

const staticRoutes = [
  { path: '/', priority: 1.0, changeFrequency: 'daily' },
  { path: '/news', priority: 0.9, changeFrequency: 'daily' },
  { path: '/donate', priority: 0.7, changeFrequency: 'monthly' },
  { path: '/contact', priority: 0.6, changeFrequency: 'monthly' },
  { path: '/events', priority: 0.8, changeFrequency: 'weekly' },
  { path: '/education', priority: 0.8, changeFrequency: 'weekly' },
  { path: '/about', priority: 0.7, changeFrequency: 'monthly' },
  { path: '/resources', priority: 0.7, changeFrequency: 'weekly' },
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

  return [...staticEntries, ...categoryEntries, ...articleEntries, ...eventEntries];
}
