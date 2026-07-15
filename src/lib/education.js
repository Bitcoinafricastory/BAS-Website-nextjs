import { collection, getDocs, query, orderBy, doc, getDoc } from 'firebase/firestore';
import { db } from './firebase';

function serializeDates(data) {
  const out = { ...data };
  for (const key of Object.keys(out)) {
    const val = out[key];
    if (val && typeof val.toDate === 'function') out[key] = val.toDate().toISOString();
  }
  return out;
}

async function fetchCollection(name, orderField) {
  try {
    const ref = collection(db, name);
    const q = orderField ? query(ref, orderBy(orderField, 'desc')) : ref;
    const snap = await getDocs(q);
    return snap.docs.map((d) => ({ id: d.id, ...serializeDates(d.data()) }));
  } catch (err) {
    console.warn(`fetchCollection(${name}): could not fetch`, err);
    return [];
  }
}

export async function getAllOtherPrograms() {
  return fetchCollection('other_programs', 'createdAt');
}

export async function getOtherProgramById(id) {
  try {
    const snap = await getDoc(doc(db, 'other_programs', id));
    if (!snap.exists()) return null;
    return { id: snap.id, ...serializeDates(snap.data()) };
  } catch (err) {
    console.warn(`getOtherProgramById(${id}): could not fetch`, err);
    return null;
  }
}

export async function getEducationData() {
  const [testimonials, whyBitcoinVideo, programs, otherPrograms, videos, resources] = await Promise.all([
    fetchCollection('educationTestimonials'),
    fetchCollection('whyBitcoinVideo'),
    fetchCollection('education_programs', 'createdAt'),
    fetchCollection('other_programs', 'createdAt'),
    fetchCollection('bitcoin_videos', 'createdAt'),
    fetchCollection('bitcoin_resources', 'createdAt'),
  ]);

  return {
    testimonials,
    videoData: whyBitcoinVideo[0] || null,
    programs,
    otherPrograms,
    videos,
    resources,
  };
}
