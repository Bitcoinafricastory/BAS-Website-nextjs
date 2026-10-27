import { NextResponse } from 'next/server';
import { revalidatePath } from 'next/cache';
import { getDashboardAccess } from '@/lib/admin-auth';
import { submitToIndexNow } from '@/lib/indexnow';
import { SITE_URL } from '@/lib/schema';

// Admin-only: refresh the cache for changed public pages and announce them to
// IndexNow. Used for directory profiles, events, programs, authors and
// deletions (articles are handled by /api/admin/revalidate on save).
// Announcing a deleted URL is intended: engines recrawl it, see the 404 and
// drop it from their index.
export async function POST(request) {
  let body;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: 'Invalid request body' }, { status: 400 });
  }

  // Owner and staff: refreshing pages after an edit is safe for anyone who can edit.
  const access = await getDashboardAccess(body?.idToken);
  if (!access) return NextResponse.json({ error: 'Forbidden' }, { status: 403 });

  const paths = [...new Set(Array.isArray(body?.paths) ? body.paths : [])]
    .filter((p) => typeof p === 'string' && /^\/[^\s]*$/.test(p) && !p.startsWith('//') && p.length <= 300)
    .slice(0, 50);
  if (paths.length === 0) return NextResponse.json({ error: 'No valid paths' }, { status: 400 });

  for (const p of [...paths, '/sitemap.xml']) {
    try {
      revalidatePath(p);
    } catch (err) {
      console.warn(`Could not revalidate ${p}:`, err);
    }
  }

  const indexNow = await submitToIndexNow(paths.map((p) => `${SITE_URL}${p}`));
  if (indexNow.error || indexNow.status >= 400) console.warn('IndexNow submission failed:', indexNow);

  return NextResponse.json({ paths, indexNow });
}
