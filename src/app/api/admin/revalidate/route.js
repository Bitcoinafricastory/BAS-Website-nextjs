import { NextResponse } from 'next/server';
import { revalidatePath } from 'next/cache';
import { submitToIndexNow } from '@/lib/indexnow';
import { SITE_URL } from '@/lib/schema';
import { verifyIdToken, isAllowedAdmin } from '@/lib/admin-auth';

// Every public page sets `revalidate = 300`, so a newly published or edited
// article can take up to five minutes to show up on the homepage, /news, the
// footer's popular-posts list and its own URL. That delay makes the dashboard
// feel broken — the writer publishes, checks the site, sees nothing, and
// publishes again. This endpoint lets the editor purge the affected pages the
// moment a save succeeds.
//
// Auth mirrors /api/admin/entities/extract: a verified Firebase ID token whose
// email is on the server-side allowlist. Without that check, anyone could
// force repeated cache purges and hammer Firestore reads on a pay-as-you-go
// plan.

export async function POST(request) {
  let body;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: 'Invalid request body' }, { status: 400 });
  }

  const { idToken, slug, published, wasPublished } = body;

  const user = await verifyIdToken(idToken);
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  if (!isAllowedAdmin(user)) return NextResponse.json({ error: 'Forbidden' }, { status: 403 });

  // Pages that list articles, plus the article's own page. The layout purge
  // covers the footer's popular-posts list, which renders on every route.
  const paths = ['/', '/news', '/search', '/sitemap.xml'];
  if (slug) paths.push(`/news/${slug}`);

  const revalidated = [];
  for (const path of paths) {
    try {
      revalidatePath(path);
      revalidated.push(path);
    } catch (err) {
      console.warn(`Could not revalidate ${path}:`, err);
    }
  }

  // The footer appears on every page via the root layout, so its popular-posts
  // list needs a layout-level purge rather than a page-level one.
  try {
    revalidatePath('/', 'layout');
    revalidated.push('/ (layout)');
  } catch (err) {
    console.warn('Could not revalidate root layout:', err);
  }

  // Announce published articles to IndexNow (Bing and others) right away.
  // Never blocks the save: submitToIndexNow times out after 5s and never throws.
  let indexNow = null;
  if (slug && (published || wasPublished)) {
    indexNow = await submitToIndexNow([
      `${SITE_URL}/news/${encodeURIComponent(slug)}`,
      `${SITE_URL}/news`,
    ]);
    if (indexNow.error || indexNow.status >= 400) console.warn('IndexNow submission failed:', indexNow);
  }

  return NextResponse.json({ revalidated, indexNow });
}
