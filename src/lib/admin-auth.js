import app from '@/lib/firebase';

// Shared admin check for server API routes.
//
// - Verifies a Firebase ID token with Google's Identity Toolkit.
// - The Firebase web API key is public by design; we read it from the
//   initialised Firebase app so the routes work even when
//   NEXT_PUBLIC_FIREBASE_API_KEY isn't set in Vercel. (It wasn't, which made
//   /api/admin/revalidate and /api/admin/ai reject every request.)
// - Fails CLOSED: if ADMIN_EMAILS is missing or empty, nobody is an admin.
//   ADMIN_EMAILS is a server-only variable and never reaches the browser.

const ADMIN_EMAILS = (process.env.ADMIN_EMAILS || '')
  .split(',')
  .map((e) => e.trim().toLowerCase())
  .filter(Boolean);

function firebaseApiKey() {
  return process.env.NEXT_PUBLIC_FIREBASE_API_KEY || app?.options?.apiKey || null;
}

/** Returns the Firebase user record for a valid ID token, or null. */
export async function verifyIdToken(idToken) {
  if (!idToken || typeof idToken !== 'string') return null;
  const apiKey = firebaseApiKey();
  if (!apiKey) return null;
  try {
    const res = await fetch(`https://identitytoolkit.googleapis.com/v1/accounts:lookup?key=${apiKey}`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ idToken }),
      cache: 'no-store',
    });
    if (!res.ok) return null;
    const data = await res.json();
    return data?.users?.[0] || null;
  } catch {
    return null;
  }
}

export function isAllowedAdmin(user) {
  if (!user?.email) return false;
  if (ADMIN_EMAILS.length === 0) {
    console.error('ADMIN_EMAILS is not set — denying all admin access. Set it in Vercel.');
    return false;
  }
  return ADMIN_EMAILS.includes(String(user.email).toLowerCase());
}
