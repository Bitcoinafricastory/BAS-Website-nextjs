import { collection, getDocs, getDoc, doc, query, orderBy } from 'firebase/firestore';
import { db } from './firebase';

const EVENTS_COLLECTION = 'events';

function serializeDates(data) {
  const out = { ...data };
  for (const key of Object.keys(out)) {
    const val = out[key];
    if (val && typeof val.toDate === 'function') out[key] = val.toDate().toISOString();
  }
  return out;
}

export async function getAllEvents() {
  try {
    const q = query(collection(db, EVENTS_COLLECTION), orderBy('createdAt', 'desc'));
    const snapshot = await getDocs(q);
    return snapshot.docs.map((d) => ({ id: d.id, ...serializeDates(d.data()) }));
  } catch (err) {
    console.warn('getAllEvents: could not fetch', err);
    return [];
  }
}

export async function getEventById(id) {
  try {
    const ref = doc(db, EVENTS_COLLECTION, id);
    const snap = await getDoc(ref);
    if (!snap.exists()) return null;
    return { id: snap.id, ...serializeDates(snap.data()) };
  } catch (err) {
    console.warn('getEventById: could not fetch', err);
    return null;
  }
}
