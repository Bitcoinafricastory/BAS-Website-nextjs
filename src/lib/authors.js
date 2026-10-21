import { collection, getDocs, query, where, limit as fsLimit } from 'firebase/firestore';
import { db } from './firebase';
import { matchArticleAuthor } from './author-match';

const AUTHORS_COLLECTION = 'authors';

// Firestore Timestamp -> plain ISO string. Same shape as the news helper —
// safe to pass from Server Components to Client Components.
function serialize(data) {
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
 * Turn a display name into a URL-safe slug: "Destiny Smart" -> "destiny-smart".
 * Exported so the migration script and admin picker can preview slugs.
 */
export function slugify(name) {
  return String(name || '')
    .toLowerCase()
    .normalize('NFKD')
    .replace(/[\u0300-\u036f]/g, '')  // strip accents
    .replace(/[^a-z0-9\s-]/g, '')
    .trim()
    .replace(/\s+/g, '-')
    .replace(/-+/g, '-');
}

/** All authors (active + inactive), for the admin dashboard. */
export async function getAllAuthors() {
  try {
    const snap = await getDocs(collection(db, AUTHORS_COLLECTION));
    return snap.docs.map((d) => ({ id: d.id, ...serialize(d.data()) }));
  } catch (err) {
    console.warn('getAllAuthors: could not fetch', err);
    return [];
  }
}

/** Only active authors — for public pages and article-editor picker. */
export async function getActiveAuthors() {
  const all = await getAllAuthors();
  return all
    // isActive is stored as the string "active" or "inactive" by the CRUD form.
    // Treat missing/legacy docs as active by default.
    .filter((a) => a.isActive !== 'inactive')
    .sort((a, b) => (a.name || '').localeCompare(b.name || ''));
}

/** Single author by slug — for /authors/[slug] profile pages. */
export async function getAuthorBySlug(slug) {
  if (!slug) return null;
  try {
    const q = query(
      collection(db, AUTHORS_COLLECTION),
      where('slug', '==', slug),
      fsLimit(1),
    );
    const snap = await getDocs(q);
    if (snap.empty) return null;
    const doc = snap.docs[0];
    return { id: doc.id, ...serialize(doc.data()) };
  } catch (err) {
    console.warn(`getAuthorBySlug(${slug}): could not fetch`, err);
    return null;
  }
}

/**
 * Resolve an article's author, whether it was linked by ID or is still using
 * the legacy plain-string `author` field. Returns a normalized shape so the
 * article page never has to branch on data lineage.
 */
export async function resolveArticleAuthor(post) {
  if (!post) return null;

  // authorId first, then the byline name matched loosely (spacing, case).
  const legacyName = post.author || post.authorName;
  if (post.authorId || legacyName) {
    const found = matchArticleAuthor(post, await getAllAuthors());
    if (found) return found;
  }
  if (legacyName) {
    // No matching author record — return a minimal shape so the byline still renders.
    return { name: legacyName, isLegacy: true };
  }

  return null;
}
