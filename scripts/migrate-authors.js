#!/usr/bin/env node
/**
 * migrate-authors.js
 *
 * One-time migration to turn inline author fields on each article into a
 * proper `authors` collection with `authorId` back-references. Idempotent —
 * safe to re-run.
 *
 * Usage:
 *   1. Download a Firebase Admin service account JSON from:
 *      Firebase Console → Project Settings → Service Accounts → Generate new private key
 *   2. Save it locally as `service-account.json` in the project root.
 *      (Add it to .gitignore — never commit it.)
 *   3. Run: node scripts/migrate-authors.js
 *
 * What it does:
 *   - Reads every article in `news`
 *   - Groups them by author name
 *   - For each unique author name that doesn't have an author doc yet, prompts
 *     you to confirm the slug and creates a minimal author record
 *   - Backfills `authorId` on every article that matched
 *   - Prints a summary of what changed
 *
 * What it does NOT do:
 *   - Overwrite existing author documents
 *   - Overwrite articles that already have `authorId` set
 *   - Delete the legacy `author`/`authorImage`/`authorLinkedIn`/`authorX`
 *     fields from articles (those stay as denormalized snapshot for backward
 *     compat until you decide to remove them)
 */

const admin = require('firebase-admin');
const readline = require('readline');
const path = require('path');
const fs = require('fs');

const SERVICE_ACCOUNT_PATH = path.join(process.cwd(), 'service-account.json');

if (!fs.existsSync(SERVICE_ACCOUNT_PATH)) {
  console.error('\nservice-account.json not found in project root.');
  console.error('Download it from Firebase Console → Project Settings → Service Accounts.\n');
  process.exit(1);
}

admin.initializeApp({
  credential: admin.credential.cert(require(SERVICE_ACCOUNT_PATH)),
});

const db = admin.firestore();

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

function prompt(question) {
  const rl = readline.createInterface({ input: process.stdin, output: process.stdout });
  return new Promise((resolve) => rl.question(question, (a) => { rl.close(); resolve(a.trim()); }));
}

async function main() {
  console.log('\n▸ Fetching all articles from `news`...');
  const newsSnap = await db.collection('news').get();
  console.log(`  Found ${newsSnap.size} articles.`);

  console.log('\n▸ Fetching existing authors...');
  const authorsSnap = await db.collection('authors').get();
  const existingBySlug = new Map();
  const existingByName = new Map();
  authorsSnap.forEach((doc) => {
    const d = doc.data();
    if (d.slug) existingBySlug.set(d.slug, { id: doc.id, ...d });
    if (d.name) existingByName.set(d.name, { id: doc.id, ...d });
  });
  console.log(`  Found ${authorsSnap.size} existing author records.`);

  // Group articles by their current author string.
  const bylines = new Map();
  newsSnap.forEach((doc) => {
    const d = doc.data();
    const name = d.author || d.authorName || '';
    if (!name) return;
    if (!bylines.has(name)) bylines.set(name, []);
    bylines.get(name).push({ id: doc.id, ...d });
  });

  console.log(`\n▸ Found ${bylines.size} unique bylines:`);
  for (const [name, articles] of bylines) {
    console.log(`  • ${name} — ${articles.length} articles`);
  }

  // For each byline, ensure an author record exists.
  const bylineToAuthorId = new Map();
  for (const [name, articles] of bylines) {
    const existing = existingByName.get(name);
    if (existing) {
      console.log(`\n✓ ${name} → already linked (${existing.id})`);
      bylineToAuthorId.set(name, existing.id);
      continue;
    }

    const suggestedSlug = slugify(name);
    console.log(`\n${name} — no author record yet.`);
    const slugAnswer = await prompt(`  Slug [${suggestedSlug}]: `);
    const slug = (slugAnswer || suggestedSlug).trim();

    if (existingBySlug.has(slug)) {
      console.log(`  Slug "${slug}" already exists; linking articles to that record.`);
      bylineToAuthorId.set(name, existingBySlug.get(slug).id);
      continue;
    }

    // Pull denormalized data from the first article as a starting point.
    const sample = articles[0];
    const doc = await db.collection('authors').add({
      name,
      slug,
      role: '',
      bio: '',
      avatar: sample.authorImage || '',
      linkedin: sample.authorLinkedIn || '',
      twitter: sample.authorX || '',
      nostr: '',
      website: '',
      email: '',
      location: '',
      isActive: 'active',
      createdAt: admin.firestore.FieldValue.serverTimestamp(),
      migratedAt: admin.firestore.FieldValue.serverTimestamp(),
    });
    console.log(`  → created author ${doc.id} (slug: ${slug})`);
    bylineToAuthorId.set(name, doc.id);
    existingBySlug.set(slug, { id: doc.id, name, slug });
  }

  // Backfill authorId on every article that doesn't already have one.
  console.log('\n▸ Backfilling authorId on articles...');
  let updated = 0;
  let skipped = 0;
  const batch = db.batch();
  let batchCount = 0;

  for (const [name, articles] of bylines) {
    const authorId = bylineToAuthorId.get(name);
    if (!authorId) continue;
    for (const article of articles) {
      if (article.authorId) { skipped++; continue; }
      batch.update(db.collection('news').doc(article.id), { authorId });
      batchCount++;
      updated++;
      if (batchCount === 400) {
        await batch.commit();
        batchCount = 0;
      }
    }
  }
  if (batchCount > 0) await batch.commit();

  console.log(`\n✓ Migration complete.`);
  console.log(`  Articles updated: ${updated}`);
  console.log(`  Articles skipped (already linked): ${skipped}`);
  console.log(`\nNext step: visit /dashboard/authors and fill in each author's bio, role, and socials.\n`);
}

main().catch((err) => {
  console.error('\nMigration failed:', err);
  process.exit(1);
});
