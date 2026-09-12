import { collection, getDocs, query, where, getDoc, doc } from 'firebase/firestore';
import { db } from './firebase';
import { summarizeBadges, badgeWeight } from './entityTypes';

const ENTITIES_COLLECTION = 'entities';
const entitiesCollectionRef = collection(db, ENTITIES_COLLECTION);

// Same Timestamp-safe serialization used by news.js / authors.js — keeps
// Server -> Client Component boundaries from throwing on Firestore Timestamps.
function serializeDates(data) {
  const out = { ...data };
  for (const key of Object.keys(out)) {
    const val = out[key];
    if (val && typeof val.toDate === 'function') {
      out[key] = val.toDate().toISOString();
    }
  }
  return out;
}

/**
 * "Bitcoin Ikorodu" -> "bitcoin-ikorodu". Exported so the admin form and any
 * future migration script can preview/generate slugs consistently.
 */
/**
 * Make a stored website value safe to use in href.
 *
 * Entity websites are often saved as a bare domain ("gorilla-sats.com") —
 * either typed that way or returned that way by the AI extractor. A bare
 * domain in an href is treated as a RELATIVE path, so the link resolved to
 * bitcoinafricastory.com/gorilla-sats.com and 404'd. Around 16 directory
 * entries were pointing at dead internal URLs because of this.
 *
 * Returns null for values that can't be made into a sensible external link,
 * so callers can hide the link rather than render a broken one.
 */
export function normalizeWebsiteUrl(value) {
  const raw = String(value || '').trim();
  if (!raw) return null;
  // Already absolute, or a protocol we shouldn't rewrite.
  if (/^https?:\/\//i.test(raw)) return raw;
  if (/^(mailto|tel):/i.test(raw)) return raw;
  // Protocol-relative.
  if (raw.startsWith('//')) return `https:${raw}`;
  // Reject anything that isn't plausibly a domain — a stray note or a path
  // fragment shouldn't become a link at all.
  if (!/^[a-z0-9][a-z0-9.-]*\.[a-z]{2,}(\/|$|\?)/i.test(raw.replace(/^\//, ''))) return null;
  return `https://${raw.replace(/^\//, '')}`;
}

export function slugifyEntity(name) {
  return String(name || '')
    .toLowerCase()
    .normalize('NFKD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/[^a-z0-9\s-]/g, '')
    .trim()
    .replace(/\s+/g, '-')
    .replace(/-+/g, '-');
}

export async function getEntities() {
  try {
    const snap = await getDocs(entitiesCollectionRef);
    return snap.docs.map((d) => ({ id: d.id, ...serializeDates(d.data()) }));
  } catch (err) {
    console.warn('getEntities: could not fetch', err);
    return [];
  }
}

/**
 * BAS's own coverage of an entity — articles and podcast episodes that an
 * editor explicitly linked (via the "Linked Directory Profiles" picker in
 * their respective editors). This is what makes Related Coverage populate
 * itself: editors link content once, while writing, and every profile that
 * content touches updates automatically. Separate from `externalCoverage`,
 * which is for things outside BAS's own content (third-party interviews,
 * PDFs, videos) added directly on the entity.
 */
// Accent-folded, punctuation-stripped comparison text. "Bitcoin Bénin" and
// "Bitcoin Benin" must be treated as the same string, or Francophone names
// never match.
function foldText(value) {
  return String(value || '')
    .replace(/<[^>]+>/g, ' ')
    // Decode BEFORE folding. Stripping entities first turned "B&eacute;nin"
    // into "b nin", so accented names silently failed to match.
    .replace(/&nbsp;/gi, ' ')
    .replace(/&amp;/gi, '&')
    .replace(/&quot;|&ldquo;|&rdquo;/gi, '"')
    .replace(/&#39;|&apos;|&rsquo;/gi, "'")
    .replace(/&([aeiouyn])(acute|grave|circ|uml|tilde|cedil);/gi, '$1')
    .replace(/&ccedil;/gi, 'c')
    .replace(/&#(\d+);/g, (_, d) => String.fromCharCode(d))
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/&[a-z]+;/gi, ' ')
    .replace(/[^a-z0-9]+/g, ' ')
    .trim();
}

// Whether `name` appears in `haystack` as whole words, so "Tando" doesn't
// match "Tandoori" and "Flash" doesn't match "flashing".
function mentionsName(haystack, name) {
  const n = foldText(name);
  // Very short names ("BAS", "Bit") produce too many false positives to trust
  // as automatic matches — those still work via an explicit editor link.
  if (n.length < 4) return false;
  return new RegExp(`(^| )${n.replace(/ /g, ' ')}( |$)`).test(haystack);
}

/**
 * Coverage shown on a directory profile.
 *
 * Two sources, merged:
 *   1. Explicit links — articles where an editor confirmed this entity via the
 *      entity-linker (linkedEntityIds).
 *   2. Name mentions — any published article whose title, excerpt or body
 *      names this entity.
 *
 * Source 2 is what makes the directory actually useful: an organisation named
 * across ten articles now shows all ten on its profile, retroactively, with no
 * per-article tagging. Previously only explicitly-linked pieces appeared, so
 * most profiles looked empty despite being covered repeatedly.
 *
 * Matching is whole-word and accent-insensitive, and skips names under four
 * characters where false positives would outweigh the benefit.
 */
export async function getEntityCoverage(slug, entityName) {
  try {
    const [newsSnap, podcastsSnap, allNewsSnap] = await Promise.all([
      getDocs(query(collection(db, 'news'), where('linkedEntityIds', 'array-contains', slug))),
      getDocs(query(collection(db, 'podcasts'), where('linkedEntityIds', 'array-contains', slug))),
      // Only needed for name matching; skipped entirely when there's no usable name.
      entityName ? getDocs(collection(db, 'news')) : Promise.resolve({ docs: [] }),
    ]);

    const toArticle = (d) => {
      const data = serializeDates(d.data());
      return {
        type: 'Article',
        title: data.title,
        url: `/news/${data.slug || d.id}`,
        date: data.date || '',
        image: data.image || null,
        external: false,
      };
    };

    const linked = newsSnap.docs.map(toArticle);

    // Name-matched articles, excluding drafts — an unpublished piece must not
    // surface on a public profile.
    const mentioned = entityName
      ? allNewsSnap.docs
          .filter((d) => {
            const data = d.data();
            if (data.status && data.status !== 'published') return false;
            const haystack = foldText(
              `${data.title || ''} ${data.excerpt || ''} ${data.content || ''}`
            );
            return mentionsName(haystack, entityName);
          })
          .map(toArticle)
      : [];

    const episodes = podcastsSnap.docs.map((d) => {
      const data = serializeDates(d.data());
      return {
        type: 'Podcast Episode',
        title: data.title,
        url: data.url || '#',
        date: data.date || '',
        image: data.image || null,
        external: true,
      };
    });

    // Dedupe by URL — an article can be both explicitly linked and mentioned.
    const seen = new Set();
    const merged = [...linked, ...mentioned, ...episodes].filter((item) => {
      if (!item.url || seen.has(item.url)) return false;
      seen.add(item.url);
      return true;
    });

    return merged.sort((a, b) => new Date(b.date || 0) - new Date(a.date || 0));
  } catch (err) {
    console.warn(`getEntityCoverage(${slug}): could not fetch`, err);
    return [];
  }
}

/**
 * Batch-resolve entities for an article's linkedEntityIds. One collection
 * fetch, then filtered/ordered to match the article's list — fine at the
 * directory's current size, and the callsite doesn't change if this later
 * becomes a real `in` query.
 */
export async function getEntitiesBySlugs(slugs = []) {
  if (!slugs.length) return [];
  try {
    const all = await getEntities();
    const bySlug = new Map(all.map((e) => [e.slug, e]));
    return slugs.map((s) => bySlug.get(s)).filter(Boolean);
  } catch (err) {
    console.warn('getEntitiesBySlugs: could not fetch', err);
    return [];
  }
}

export async function getEntityBySlug(slug) {
  try {
    const snap = await getDocs(query(entitiesCollectionRef, where('slug', '==', slug)));
    if (snap.empty) return null;
    const d = snap.docs[0];
    return { id: d.id, ...serializeDates(d.data()) };
  } catch (err) {
    console.warn(`getEntityBySlug(${slug}): could not fetch`, err);
    return null;
  }
}

export async function getEntityById(id) {
  try {
    const snap = await getDoc(doc(db, ENTITIES_COLLECTION, id));
    if (!snap.exists()) return null;
    return { id: snap.id, ...serializeDates(snap.data()) };
  } catch (err) {
    console.warn(`getEntityById(${id}): could not fetch`, err);
    return null;
  }
}

/**
 * Selects the homepage's "Featured in the Directory" set: manually-flagged
 * entities first, then auto-filled by highest badge weight so the section
 * is never sparse just because editors haven't flagged enough yet.
 */
export function selectFeaturedEntities(entities, max = 9) {
  const featured = entities.filter((e) => e.featured);
  const rest = entities
    .filter((e) => !e.featured)
    .sort((a, b) => {
      const aWeight = summarizeBadges(a.badges).top ? badgeWeight(summarizeBadges(a.badges).top.level) : 0;
      const bWeight = summarizeBadges(b.badges).top ? badgeWeight(summarizeBadges(b.badges).top.level) : 0;
      return bWeight - aWeight;
    });
  return [...featured, ...rest].slice(0, max);
}
