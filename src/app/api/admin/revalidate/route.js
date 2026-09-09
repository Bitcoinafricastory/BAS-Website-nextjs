import { NextResponse } from 'next/server';
import { revalidatePath } from 'next/cache';

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

const ADMIN_EMAILS = (process.env.ADMIN_EMAILS || '')
  .split(',')
  .map((e) => e.trim().toLowerCase())
  .filter(Boolean);

async function verifyIdToken(idToken) {
  if (!idToken) return null;
  const apiKey = process.env.NEXT_PUBLIC_FIREBASE_API_KEY;
  if (!apiKey) return null;
  try {
    const res = await fetch(
      `https://identitytoolkit.googleapis.com/v1/accounts:lookup?key=${apiKey}`,
      {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ idToken }),
      }
    );
    if (!res.ok) return null;
    const data = await res.json();
    return data?.users?.[0] || null;
  } catch {
    return null;
  }
}

function isAllowedAdmin(user) {
  if (!user?.email) return false;
  if (ADMIN_EMAILS.length === 0) {
    console.warn('ADMIN_EMAILS is not set — /api/admin/revalidate is allowing ANY authenticated Firebase user.');
    return true;
  }
  return ADMIN_EMAILS.includes(user.email.toLowerCase());
}

export async function POST(request) {
  let body;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: 'Invalid request body' }, { status: 400 });
  }

  const { idToken, slug } = body;

  const user = await verifyIdToken(idToken);
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  if (!isAllowedAdmin(user)) return NextResponse.json({ error: 'Forbidden' }, { status: 403 });

  // Pages that list articles, plus the article's own page. The layout purge
  // covers the footer's popular-posts list, which renders on every route.
  const paths = ['/', '/news', '/search'];
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

  return NextResponse.json({ revalidated });
}
