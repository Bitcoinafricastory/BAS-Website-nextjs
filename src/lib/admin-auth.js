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

// ---------------------------------------------------------------------------
// Staff access (Team page). Owners are the ADMIN_EMAILS addresses. Anyone
// else needs an active document in the private `staff` collection, keyed by
// their lower-case email: { role: 'editor' | 'writer', sections: [...],
// active: true }. The server reads it through Firestore's REST API with the
// person's own ID token, so the security rules decide (a person can read only
// their own staff document) and no service-account key is needed.

function firestoreBase() {
  const projectId = process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID || app?.options?.projectId;
  return projectId ? `https://firestore.googleapis.com/v1/projects/${projectId}/databases/(default)/documents` : null;
}

function fromFirestoreValue(v) {
  if (!v || typeof v !== 'object') return undefined;
  if ('stringValue' in v) return v.stringValue;
  if ('booleanValue' in v) return v.booleanValue;
  if ('integerValue' in v) return Number(v.integerValue);
  if ('doubleValue' in v) return v.doubleValue;
  if ('arrayValue' in v) return (v.arrayValue.values || []).map(fromFirestoreValue);
  if ('nullValue' in v) return null;
  if ('timestampValue' in v) return v.timestampValue;
  return undefined;
}

async function readOwnDoc(path, idToken) {
  const base = firestoreBase();
  if (!base) return { ok: false };
  try {
    const res = await fetch(`${base}/${path}`, { headers: { Authorization: `Bearer ${idToken}` }, cache: 'no-store' });
    if (res.status === 404) return { ok: true, doc: null };
    if (!res.ok) return { ok: false, status: res.status };
    const json = await res.json();
    const fields = Object.fromEntries(Object.entries(json.fields || {}).map(([k, v]) => [k, fromFirestoreValue(v)]));
    return { ok: true, doc: fields, updateTime: json.updateTime };
  } catch {
    return { ok: false };
  }
}

/**
 * Who is this, and what may they do? Returns null when the token is invalid
 * or the person has no dashboard access.
 * { user, email, owner, role: 'owner'|'editor'|'writer', sections: string[] }
 */
export async function getDashboardAccess(idToken) {
  const user = await verifyIdToken(idToken);
  if (!user?.email) return null;
  const email = String(user.email).toLowerCase();
  if (isAllowedAdmin(user)) return { user, email, owner: true, role: 'owner', sections: [] };
  const { doc } = await readOwnDoc(`staff/${encodeURIComponent(email)}`, idToken);
  if (!doc || doc.active === false || !['editor', 'writer'].includes(doc.role)) return null;
  return { user, email, owner: false, role: doc.role, sections: Array.isArray(doc.sections) ? doc.sections : [] };
}

/**
 * Counts one AI request against a staff member's daily allowance. The
 * counter lives in `aiUsage/<email>` as { day, count }; the security rules
 * only let a person raise today's count by exactly 1 (or start a new day at
 * 1), so the limit can't be reset from the browser. Owners are never limited.
 * Returns { ok: true } or { ok: false, error }.
 */
export async function consumeAiQuota(access, idToken, limit, day) {
  if (access?.owner) return { ok: true };
  const base = firestoreBase();
  if (!base) return { ok: false, error: 'AI usage could not be checked.' };
  const path = `aiUsage/${encodeURIComponent(access.email)}`;
  const current = await readOwnDoc(path, idToken);
  if (!current.ok) return { ok: false, error: 'AI usage could not be checked. Try again.' };
  const sameDay = current.doc?.day && new Date(current.doc.day).getTime() === day.getTime();
  const count = sameDay ? Number(current.doc.count || 0) : 0;
  if (count >= limit) {
    return { ok: false, error: `You’ve used today’s ${limit} AI requests. The limit resets at midnight UTC (1am Lagos).` };
  }
  const body = JSON.stringify({ fields: {
    count: { integerValue: String(count + 1) },
    email: { stringValue: access.email },
    day: { timestampValue: day.toISOString() },
  } });
  const headers = { Authorization: `Bearer ${idToken}`, 'Content-Type': 'application/json' };
  const url = current.doc
    ? `${base}/${path}?updateMask.fieldPaths=count&updateMask.fieldPaths=email&updateMask.fieldPaths=day&currentDocument.updateTime=${encodeURIComponent(current.updateTime)}`
    : `${base}/${path}?currentDocument.exists=false`;
  try {
    const res = await fetch(url, { method: 'PATCH', headers, body });
    if (!res.ok) return { ok: false, error: 'AI usage could not be recorded. Try again.' };
  } catch {
    return { ok: false, error: 'AI usage could not be recorded. Try again.' };
  }
  return { ok: true };
}
