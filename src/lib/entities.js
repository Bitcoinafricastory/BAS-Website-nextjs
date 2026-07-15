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
export async function getEntityCoverage(slug) {
  try {
    const [newsSnap, podcastsSnap] = await Promise.all([
      getDocs(query(collection(db, 'news'), where('linkedEntityIds', 'array-contains', slug))),
      getDocs(query(collection(db, 'podcasts'), where('linkedEntityIds', 'array-contains', slug))),
    ]);

    const articles = newsSnap.docs.map((d) => {
      const data = serializeDates(d.data());
      return {
        type: 'Article',
        title: data.title,
        url: `/news/${data.slug || d.id}`,
        date: data.date || '',
        external: false,
      };
    });

    const episodes = podcastsSnap.docs.map((d) => {
      const data = serializeDates(d.data());
      return {
        type: 'Podcast Episode',
        title: data.title,
        url: data.url || '#',
        date: data.date || '',
        external: true,
      };
    });

    return [...articles, ...episodes].sort((a, b) => new Date(b.date || 0) - new Date(a.date || 0));
  } catch (err) {
    console.warn(`getEntityCoverage(${slug}): could not fetch`, err);
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
