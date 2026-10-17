'use client';

// Loads the Firebase SDK in the browser only when a visitor actually submits a
// form (newsletter, story, event, directory entry).
//
// The SDK is about 190 KB compressed (650 KB of JavaScript). Importing it at
// the top of a public component put it on every page, because the newsletter
// form sits in the footer. On a 2G/3G connection that alone took several
// seconds to download before the page became usable. Loading it on submit
// costs the few visitors who submit a short wait, and saves every reader the
// download.

export async function loadFirestore() {
  const [{ db }, firestore] = await Promise.all([
    import('@/lib/firebase'),
    import('firebase/firestore'),
  ]);
  return { db, ...firestore };
}

export async function loadStorage() {
  const [{ storage }, storageSdk] = await Promise.all([
    import('@/lib/firebase'),
    import('firebase/storage'),
  ]);
  return { storage, ...storageSdk };
}
