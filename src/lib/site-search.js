import { unstable_cache } from 'next/cache';
import { getAllNews } from '@/lib/news';
import { getAllEvents } from '@/lib/events';
import { getEntities } from '@/lib/entities';
import { stripHtml } from '@/lib/article-content';

// Search across articles, the directory and events.
//
// The old search only matched the whole query as one phrase, so a question
// like "how does Rurbit work" found nothing. This splits the query into
// keywords, scores every item on how many it contains and where (title,
// tags, summary, body), and gives a bonus for the exact phrase. The same
// results feed the AI answer at the top of the search page.

const STOPWORDS = new Set(`a an and are as at be been but by can could did do does doing for from had has have how i if in into is it its
me my of on or our so than that the their them then there these they this to too us was we were what when where which who whom why will
with would you your about after before also any each more most other some such just tell show give find please bitcoin btc africa african
story stories news work works working use used using get make made new latest best like know need want much many there here really`.split(/\s+/));

export function queryTerms(q) {
  const words = String(q || '').toLowerCase().normalize('NFKD').replace(/[̀-ͯ]/g, '')
    .split(/[^a-z0-9]+/).filter((w) => w.length >= 2 && !STOPWORDS.has(w));
  const unique = [...new Set(words)].slice(0, 8);
  // "bitcoin" and "africa" are stopwords because nearly every page has them,
  // but a search for just those should still return something.
  return unique.length ? unique : String(q || '').toLowerCase().split(/[^a-z0-9]+/).filter((w) => w.length >= 2).slice(0, 3);
}

const fold = (s) => String(s || '').toLowerCase().normalize('NFKD').replace(/[̀-ͯ]/g, '');
const count = (text, term) => {
  if (!text) return 0;
  let n = 0;
  let i = text.indexOf(term);
  while (i !== -1 && n < 20) { n += 1; i = text.indexOf(term, i + term.length); }
  return n;
};

// Cached for five minutes so a search doesn't read every document each time.
// Body text is capped to keep the cached index small.
const loadIndex = unstable_cache(async () => {
  const [posts, events, entities] = await Promise.all([getAllNews(), getAllEvents(), getEntities()]);
  return {
    articles: posts.map((p) => ({
      id: p.id, slug: p.slug || p.id, title: p.title || '', excerpt: p.excerpt || '', category: p.category || '',
      tags: Array.isArray(p.tags) ? p.tags.join(' ') : String(p.tags || ''), image: p.image || '', imageAlt: p.imageAlt || '',
      date: p.date || '', author: p.author || p.authorName || '', text: stripHtml(p.content || '').slice(0, 9000),
    })),
    events: events.map((e) => ({
      id: e.id, eventName: e.eventName || '', city: e.city || '', venue: e.venue || '', date: e.date || '',
      format: e.format || '', organiser: e.organiser || '', description: String(e.description || '').slice(0, 1500),
    })),
    entities: entities.filter((e) => e.slug).map((e) => ({
      slug: e.slug, name: e.name || '', type: e.type || '', country: e.country || '', city: e.city || '',
      website: e.website || '', description: String(e.description || '').slice(0, 1500),
    })),
  };
}, ['site-search-index-v1'], { revalidate: 300 });

function scoreFields(fields, terms, phrase) {
  let score = 0;
  let matched = 0;
  for (const t of terms) {
    let hit = false;
    for (const [text, weight] of fields) {
      const n = count(text, t);
      if (n) { score += weight * Math.min(n, 4); hit = true; }
    }
    if (hit) matched += 1;
  }
  if (phrase && phrase.includes(' ')) {
    for (const [text, weight] of fields) if (text.includes(phrase)) score += weight * 4;
  }
  return { score, matched };
}

function rank(items, fieldsOf, terms, phrase) {
  const scored = items.map((item) => ({ item, ...scoreFields(fieldsOf(item), terms, phrase) }));
  // When some items contain every keyword, leave out ones that only share a
  // word or two; otherwise accept items with at least half of them.
  const best = Math.max(0, ...scored.map((r) => r.matched));
  const need = best === terms.length && terms.length >= 2
    ? terms.length - (terms.length >= 4 ? 1 : 0)
    : Math.max(1, Math.ceil(terms.length / 2));
  return scored
    .filter((r) => r.matched >= need && r.score > 0)
    .sort((a, b) => b.matched - a.matched || b.score - a.score)
    .map((r) => r.item);
}

/** { articles, events, entities, terms } for a search query. */
export async function searchSite(q) {
  const terms = queryTerms(q);
  if (!terms.length) return { articles: [], events: [], entities: [], terms };
  const phrase = fold(q).replace(/[^a-z0-9]+/g, ' ').trim();
  const index = await loadIndex();
  const articles = rank(index.articles, (a) => [
    [fold(a.title), 8], [fold(a.tags), 4], [fold(a.category), 3], [fold(a.excerpt), 3], [fold(a.text), 1],
  ], terms, phrase);
  const entities = rank(index.entities, (e) => [
    [fold(e.name), 8], [fold(`${e.type} ${e.country} ${e.city}`), 3], [fold(e.description), 2],
  ], terms, phrase);
  const events = rank(index.events, (e) => [
    [fold(e.eventName), 8], [fold(`${e.city} ${e.venue} ${e.organiser}`), 3], [fold(e.description), 1],
  ], terms, phrase);
  return { articles, events, entities, terms };
}

/** The part of a long text that mentions the most search terms. */
export function bestSnippet(text, terms, size = 1400) {
  const src = String(text || '');
  if (src.length <= size) return src;
  const lower = fold(src);
  let best = 0;
  let bestScore = -1;
  for (let start = 0; start < src.length - size / 2; start += Math.floor(size / 3)) {
    const window = lower.slice(start, start + size);
    const s = terms.reduce((n, t) => n + (window.includes(t) ? 2 : 0) + Math.min(count(window, t), 3), 0);
    if (s > bestScore) { bestScore = s; best = start; }
  }
  const from = best === 0 ? 0 : src.lastIndexOf(' ', best) + 1;
  return (from > 0 ? '… ' : '') + src.slice(from, from + size).trim() + (from + size < src.length ? ' …' : '');
}
