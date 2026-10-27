import { NextResponse } from 'next/server';
import { getDashboardAccess } from '@/lib/admin-auth';

// Tells the dashboard who the signed-in person is: the owner (ADMIN_EMAILS,
// which never reaches the browser) or a staff member with a role and the
// sections they may use. Anyone else gets admin: false.
export async function POST(request) {
  let body;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ admin: false }, { status: 400 });
  }
  const access = await getDashboardAccess(body?.idToken);
  if (!access) return NextResponse.json({ admin: false }, { status: 403 });
  return NextResponse.json(
    { admin: true, owner: access.owner, role: access.role, sections: access.sections, email: access.email },
    { headers: { 'Cache-Control': 'no-store' } },
  );
}
