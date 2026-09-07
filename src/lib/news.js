import { collection, getDocs, getDoc, doc, query, where, orderBy, limit as fsLimit } from 'firebase/firestore';
import { db } from './firebase';

const NEWS_COLLECTION = 'news';
const newsCollectionRef = collection(db, NEWS_COLLECTION);

async function fetchSimpleCollection(name) {
  try {
    const snap = await getDocs(collection(db, name));
    // Serialize any Firestore Timestamp fields to ISO strings — these documents
    // are passed straight from Server Components to Client Components, and
    // Timestamp objects (they carry a toJSON method) trigger a Next.js
    // "Only plain objects can be passed" runtime error otherwise.
    return snap.docs.map((d) => ({ id: d.id, ...serializeDates(d.data()) }));
  } catch (err) {
    console.warn(`fetchSimpleCollection(${name}): could not fetch`, err);
    return [];
  }
}

// Firestore Timestamp -> plain ISO string, so it's safe to pass from
// Server Components to Client Components and to JSON-LD.
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

export async function getTestimonials() {
  return fetchSimpleCollection('testimonials');
}

export async function getPodcastEpisodes() {
  const eps = await fetchSimpleCollection('podcasts');
  // Sort newest first if a date field exists.
  return eps.sort((a, b) => {
    const da = a.date ? new Date(a.date).getTime() : 0;
    const db = b.date ? new Date(b.date).getTime() : 0;
    return db - da;
  });
}

// An article is public unless it's explicitly been marked as something other
// than published. Filtering in code rather than in the Firestore query is
// deliberate: a `where('status','==','published')` query would silently drop
// every older article written before the status field existed, since Firestore
// cannot match documents that lack the field at all. Treating "no status" as
// published keeps the existing archive visible while still hiding drafts.
function isPublished(data) {
  return !data?.status || data.status === 'published';
}

export async function getAllNews() {
  const snapshot = await getDocs(query(newsCollectionRef, orderBy('date', 'desc')));
  return snapshot.docs
    .filter((d) => isPublished(d.data()))
    .map((d) => ({ id: d.id, ...serializeDates(d.data()) }));
}

export async function getLatestNews(count = 6) {
  // Over-fetch, then filter — drafts mixed into the ordered results would
  // otherwise eat into the requested count and return too few articles.
  const q = query(newsCollectionRef, orderBy('date', 'desc'), fsLimit(count * 3));
  const snapshot = await getDocs(q);
  return snapshot.docs
    .filter((d) => isPublished(d.data()))
    .slice(0, count)
    .map((d) => ({ id: d.id, ...serializeDates(d.data()) }));
}

export async function getNewsBySlug(slug) {
  const q = query(newsCollectionRef, where('slug', '==', slug), fsLimit(1));
  const snapshot = await getDocs(q);
  if (snapshot.empty) return null;
  const d = snapshot.docs[0];
  // A draft's URL should 404 rather than render, otherwise anyone with the
  // link (or a crawler that guessed it) can read unpublished work.
  if (!isPublished(d.data())) return null;
  return { id: d.id, ...serializeDates(d.data()) };
}

export async function getAllSlugs() {
  const snapshot = await getDocs(newsCollectionRef);
  return snapshot.docs
    .filter((d) => isPublished(d.data()))
    .map((d) => d.data().slug)
    .filter(Boolean);
}

/**
 * All articles written by a specific author. Falls back to matching by name
 * so pre-migration articles (no authorId yet) still show up on their author's
 * profile page as long as the byline string matches the author's name.
 */
export async function getArticlesByAuthor(author) {
  if (!author) return [];
  const all = await getAllNews();
  return all.filter((post) => {
    if (post.authorId && author.id) return post.authorId === author.id;
    if (author.name) return (post.author || post.authorName) === author.name;
    return false;
  });
}
