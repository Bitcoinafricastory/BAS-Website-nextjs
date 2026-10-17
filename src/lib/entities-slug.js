// Kept in its own file (no Firebase import) so pure helpers such as
// entity-duplicates.js can use it on the server and in the dashboard.

/**
 * "Bitcoin Ikorodu" -> "bitcoin-ikorodu". Used by the admin form, AI
 * suggestions and submission approval so slugs are always generated the
 * same way.
 */
export function slugifyEntity(name) {
  return String(name || '')
    .toLowerCase()
    .normalize('NFKD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/[^a-z0-9\s-]/g, '')
    .trim()
    .replace(/\s+/g, '-')
    .replace(/-+/g, '-');
}
