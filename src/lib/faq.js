import { collection, getDocs, query, orderBy } from 'firebase/firestore';
import { db } from './firebase';

function serializeDates(data) {
  const out = { ...data };
  for (const key of Object.keys(out)) {
    const val = out[key];
    if (val && typeof val.toDate === 'function') out[key] = val.toDate().toISOString();
  }
  return out;
}

const CATEGORY_ORDER = [
  'General',
  'News & Stories',
  'Education',
  'Directory',
  'Events',
  'Podcast',
  'Donations',
  'Contributing',
];

export async function getFAQs() {
  try {
    const q = query(collection(db, 'faqs'), orderBy('order', 'asc'));
    const snap = await getDocs(q);
    const faqs = snap.docs.map((d) => ({ id: d.id, ...serializeDates(d.data()) }));

    const grouped = {};
    for (const faq of faqs) {
      const cat = faq.category || 'General';
      if (!grouped[cat]) grouped[cat] = [];
      grouped[cat].push(faq);
    }

    const orderedCategories = [
      ...CATEGORY_ORDER.filter((c) => grouped[c]),
      ...Object.keys(grouped).filter((c) => !CATEGORY_ORDER.includes(c)),
    ];

    return orderedCategories.map((category) => ({ category, items: grouped[category] }));
  } catch (err) {
    console.warn('getFAQs: could not fetch', err);
    return [];
  }
}

export async function getAllFAQsFlat() {
  try {
    const q = query(collection(db, 'faqs'), orderBy('order', 'asc'));
    const snap = await getDocs(q);
    return snap.docs.map((d) => ({ id: d.id, ...serializeDates(d.data()) }));
  } catch (err) {
    console.warn('getAllFAQsFlat: could not fetch', err);
    return [];
  }
}
