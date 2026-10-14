import { NextResponse } from 'next/server';
import { verifyIdToken, isAllowedAdmin } from '@/lib/admin-auth';

// Tells the dashboard whether the signed-in user is an admin. The allowlist
// lives only on the server (ADMIN_EMAILS), so the admin's address is never
// shipped in public JavaScript.
export async function POST(request) {
  let body;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ admin: false }, { status: 400 });
  }
  const user = await verifyIdToken(body?.idToken);
  if (!user) return NextResponse.json({ admin: false }, { status: 401 });
  if (!isAllowedAdmin(user)) return NextResponse.json({ admin: false }, { status: 403 });
  return NextResponse.json({ admin: true }, { headers: { 'Cache-Control': 'no-store' } });
}
