import { collection, getDocs, getDoc, doc, query, where, orderBy, limit as fsLimit } from 'firebase/firestore';
import { db } from './firebase';

const NEWS_COLLECTION = 'news';
const newsCollectionRef = collection(db, NEWS_COLLECTION);

async function fetchSimpleCollection(name) {
  try {
    const snap = await getDocs(collection(db, name));
    return snap.docs.map((d) => ({ id: d.id, ...d.data() }));
  } catch (err) {
    console.warn(`fetchSimpleCollection(${name}): could not fetch`, err);
    return [];
  }
}

export async function getCommunities() {
  return fetchSimpleCollection('communities');
}

export async function getTestimonials() {
  return fetchSimpleCollection('testimonials');
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

export async function getAllNews() {
  const snapshot = await getDocs(query(newsCollectionRef, orderBy('date', 'desc')));
  return snapshot.docs.map((d) => ({ id: d.id, ...serializeDates(d.data()) }));
}

export async function getLatestNews(count = 6) {
  const q = query(newsCollectionRef, orderBy('date', 'desc'), fsLimit(count));
  const snapshot = await getDocs(q);
  return snapshot.docs.map((d) => ({ id: d.id, ...serializeDates(d.data()) }));
}

export async function getNewsBySlug(slug) {
  const q = query(newsCollectionRef, where('slug', '==', slug), fsLimit(1));
  const snapshot = await getDocs(q);
  if (snapshot.empty) return null;
  const d = snapshot.docs[0];
  return { id: d.id, ...serializeDates(d.data()) };
}

export async function getAllSlugs() {
  const snapshot = await getDocs(newsCollectionRef);
  return snapshot.docs
    .map((d) => d.data().slug)
    .filter(Boolean);
}
