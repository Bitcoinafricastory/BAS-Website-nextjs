// One-off migration: copies documents from the old `communities` collection
// into the new universal `entities` collection under the new schema.
//
// This is NON-DESTRUCTIVE — it only reads `communities` and writes new
// documents to `entities`. Your original `communities` collection is left
// untouched, so this is safe to run more than once (it skips any community
// that's already been migrated, matched by slug).
//
// WHAT THIS SCRIPT CANNOT KNOW FOR YOU:
// Your old `communities` documents only ever had name/logo/link/description —
// there's no `type` or `country` to carry over. Every migrated entity is
// created with type "community" and no country set. Go through
// Dashboard -> Directory afterward and fix up the type/country for anything
// that isn't actually a plain community (e.g. Africa Bitcoin Conference
// should probably be "Conference / Event", Btrust probably "Developer /
// Infrastructure"). Same for badges: every migrated entity gets a single
// "Editorial reviewed" badge dated today, with a note that it was migrated —
// that's an honest starting point (you did curate these yourself in the old
// dashboard), not a claim that a reporter re-verified them today. Upgrade
// specific ones to Interview Conducted / Reporter Verified / Field Verified
// as you actually do that work.
//
// SETUP (one time):
//   1. cd into your project root (bas-nextjs)
//   2. Make sure `firebase` is already installed (it is, it's a dependency)
//   3. Run with your dashboard admin login:
//        ADMIN_EMAIL="you@example.com" ADMIN_PASSWORD="yourpassword" node scripts/migrate-communities-to-entities.mjs
//
// This uses the same Firebase Auth login as your dashboard (not a service
// account key) — it needs your admin credentials only because your
// Firestore security rules require an authenticated user to write, same as
// when you use Dashboard -> Directory yourself. Nothing is sent anywhere
// except directly to Firebase.

import { initializeApp } from 'firebase/app';
import { getAuth, signInWithEmailAndPassword } from 'firebase/auth';
import {
  getFirestore, collection, getDocs, query, where, addDoc, serverTimestamp,
} from 'firebase/firestore';

// Same public client config as src/lib/firebase.js — safe to inline here,
// governed by Firestore security rules rather than secrecy.
const firebaseConfig = {
  apiKey: 'AIzaSyCC_PkB6ku4wHa9cv9At49EBAqFEkLFTmY',
  authDomain: 'bas-website-75a3f.firebaseapp.com',
  projectId: 'bas-website-75a3f',
  storageBucket: 'bas-website-75a3f.firebasestorage.app',
  messagingSenderId: '479794328516',
  appId: '1:479794328516:web:aa54b7ad01090aa44c6a91',
  measurementId: 'G-GHQSRJ6MQH',
};

function slugify(name) {
  return String(name || '')
    .toLowerCase()
    .normalize('NFKD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/[^a-z0-9\s-]/g, '')
    .trim()
    .replace(/\s+/g, '-')
    .replace(/-+/g, '-');
}

async function main() {
  const email = process.env.ADMIN_EMAIL;
  const password = process.env.ADMIN_PASSWORD;

  if (!email || !password) {
    console.error('Missing credentials.\n\nRun it like this:\n  ADMIN_EMAIL="you@example.com" ADMIN_PASSWORD="yourpassword" node scripts/migrate-communities-to-entities.mjs\n\n(Use the same login you use for /dashboard.)');
    process.exit(1);
  }

  const app = initializeApp(firebaseConfig);
  const auth = getAuth(app);
  const db = getFirestore(app);

  console.log('Signing in...');
  await signInWithEmailAndPassword(auth, email, password);

  console.log('Reading existing communities...');
  const communitiesSnap = await getDocs(collection(db, 'communities'));
  if (communitiesSnap.empty) {
    console.log('No documents found in `communities` — nothing to migrate.');
    return;
  }
  console.log(`Found ${communitiesSnap.size} communities.`);

  const entitiesRef = collection(db, 'entities');
  const today = new Date().toISOString().slice(0, 10);

  let migrated = 0;
  let skipped = 0;

  for (const docSnap of communitiesSnap.docs) {
    const community = docSnap.data();
    const name = community.name || '(untitled)';
    const slug = slugify(name);

    if (!slug) {
      console.warn(`Skipping a document with no usable name (id: ${docSnap.id}).`);
      skipped++;
      continue;
    }

    // Idempotent: skip if this slug already exists in entities.
    const existing = await getDocs(query(entitiesRef, where('slug', '==', slug)));
    if (!existing.empty) {
      console.log(`Already migrated: ${name} — skipping.`);
      skipped++;
      continue;
    }

    const payload = {
      name,
      slug,
      type: 'community',
      description: community.description || '',
      country: '',
      city: '',
      website: community.link || '',
      socialLinks: {},
      contactEmail: '',
      yearFounded: '',
      bitcoinFocus: '',
      founder: '',
      logo: community.logo || '',
      coverImage: '',
      tags: [],
      featured: false,
      relatedEntityIds: [],
      externalCoverage: [],
      badges: [{
        level: 'editorial_reviewed',
        dateEarned: today,
        evidence: 'Migrated from the original Communities directory listing',
      }],
      createdAt: serverTimestamp(),
    };

    await addDoc(entitiesRef, payload);
    console.log(`Migrated: ${name} -> /directory/${slug}`);
    migrated++;
  }

  console.log(`\nDone. Migrated ${migrated}, skipped ${skipped} (already migrated or unusable).`);
  console.log('Now go to Dashboard -> Directory and fix up type/country for anything that isn\'t a plain community.');
  process.exit(0);
}

main().catch((err) => {
  console.error('Migration failed:', err.message || err);
  process.exit(1);
});
