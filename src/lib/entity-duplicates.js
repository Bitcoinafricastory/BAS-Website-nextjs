// Finding and resolving duplicate directory profiles.
//
// Duplicates crept in because the three ways a profile is created (Add Entity,
// AI suggestions from an article, approving a public submission) never
// checked whether that name already existed. Two documents with the same slug
// both show in the directory listing and both go in the sitemap, while
// /directory/<slug> can only show one of them.
//
// Pure functions (no Firebase), so they run in the dashboard and on the
// server alike.

import { slugifyEntity } from './entities-slug.js';

const FIELDS = [
  'description', 'country', 'city', 'website', 'logo', 'coverImage', 'founder',
  'yearFounded', 'bitcoinFocus', 'contactEmail',
];

/** Rough "how filled in is this profile" score, to pick which copy to keep. */
export function completeness(entity = {}) {
  let score = 0;
  for (const f of FIELDS) if (String(entity[f] || '').trim()) score += 1;
  if ((entity.description || '').length > 200) score += 1;
  score += Math.min((entity.badges || []).length, 3);
  score += Math.min((entity.externalCoverage || []).length, 3);
  score += Math.min((entity.tags || []).length, 2);
  const social = entity.socialLinks || {};
  score += Object.values(social).filter((v) => String(v || '').trim()).length;
  return score;
}

function timeOf(entity) {
  const t = entity.updatedAt || entity.createdAt;
  if (!t) return 0;
  if (typeof t.toMillis === 'function') return t.toMillis();
  if (typeof t.seconds === 'number') return t.seconds * 1000;
  const ms = Date.parse(t);
  return Number.isNaN(ms) ? 0 : ms;
}

/** The copy to keep: most complete, then most recently edited. */
export function pickPrimary(entities) {
  return [...entities].sort((a, b) => completeness(b) - completeness(a) || timeOf(b) - timeOf(a))[0];
}

/** One profile per slug, keeping the most complete copy. Preserves order. */
export function dedupeBySlug(entities = []) {
  const groups = new Map();
  for (const e of entities) {
    const key = e.slug || slugifyEntity(e.name);
    if (!groups.has(key)) groups.set(key, []);
    groups.get(key).push(e);
  }
  const keep = new Set([...groups.values()].map((g) => pickPrimary(g)));
  return entities.filter((e) => keep.has(e));
}

/** "https://www.Blink.sv/" and "blink.sv" -> "blink.sv". Null when empty. */
export function websiteKey(value) {
  let s = String(value || '').trim().toLowerCase();
  if (!s) return null;
  s = s.replace(/^[a-z]+:\/\//, '').replace(/^www\./, '');
  s = s.split('#')[0].split('?')[0].replace(/\/+$/, '');
  return s || null;
}

/**
 * Groups of likely duplicates:
 *  - 'same-name': same slug (or same name once normalised). Almost certainly
 *    duplicates; only one can ever be shown at /directory/<slug>.
 *  - 'same-website': different names, same website. Often a duplicate
 *    ("Blink" and "Blink Wallet"), sometimes legitimately two profiles (a
 *    person and their project). Shown as "check".
 */
export function findDuplicateGroups(entities = []) {
  const bySlug = new Map();
  for (const e of entities) {
    const key = e.slug || slugifyEntity(e.name);
    if (!key) continue;
    if (!bySlug.has(key)) bySlug.set(key, []);
    bySlug.get(key).push(e);
  }
  const groups = [];
  const inSlugGroup = new Set();
  for (const [key, items] of bySlug) {
    if (items.length > 1) {
      groups.push({ reason: 'same-name', key, items, keep: pickPrimary(items) });
      items.forEach((e) => inSlugGroup.add(e));
    }
  }

  const bySite = new Map();
  for (const e of entities) {
    // A person often lists their project's site as their own ("Sabina Gitau"
    // and "Tando"), which isn't a duplicate, so people are left out here.
    if (e.type === 'person') continue;
    const key = websiteKey(e.website);
    if (!key) continue;
    if (!bySite.has(key)) bySite.set(key, []);
    bySite.get(key).push(e);
  }
  for (const [key, items] of bySite) {
    // Ignore groups that are entirely explained by a same-name group.
    const slugs = new Set(items.map((e) => e.slug || slugifyEntity(e.name)));
    if (items.length > 1 && slugs.size > 1) {
      groups.push({ reason: 'same-website', key, items, keep: pickPrimary(items) });
    }
  }
  return groups;
}
