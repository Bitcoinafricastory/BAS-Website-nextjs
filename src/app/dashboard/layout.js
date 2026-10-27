'use client';

import { useState, useEffect } from 'react';
import { useRouter, usePathname } from 'next/navigation';
import Link from 'next/link';
import { AuthProvider, useAuth } from '@/context/AuthContext';
import { AccessProvider } from '@/context/AccessContext';
import { canOpenPath } from '@/lib/staff-access';
import Sidebar from '@/components/dashboard/Sidebar';
import Topbar from '@/components/dashboard/Topbar';
import { LoaderCircle, Lock } from 'lucide-react';

// UX-level guard. The real enforcement is in Firestore/Storage security rules
// and the server API routes. Admin status is checked on the server via
// /api/admin/check, so the admin allowlist is never shipped to the browser.
// The same check returns a staff member's role and sections, which decide
// which pages they can open. Fails closed: any error means no dashboard.

export default function DashboardLayout({ children }) {
  return (
    <AuthProvider>
      <DashboardShell>{children}</DashboardShell>
    </AuthProvider>
  );
}

function DashboardShell({ children }) {
  const { user, loading, logout } = useAuth();
  const router = useRouter();
  const pathname = usePathname();
  const [mobileOpen, setMobileOpen] = useState(false);
  const [access, setAccess] = useState(null);
  // 'checking' until the server answers; then 'allowed' or 'denied'.
  const [adminState, setAdminState] = useState('checking');

  useEffect(() => {
    if (loading) return;
    if (!user) {
      setAdminState('denied');
      return;
    }
    let cancelled = false;
    (async () => {
      try {
        const idToken = await user.getIdToken();
        const res = await fetch('/api/admin/check', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ idToken }),
        });
        const data = await res.json().catch(() => ({}));
        if (cancelled) return;
        const ok = res.ok && data.admin === true;
        if (ok) setAccess({ owner: !!data.owner, role: data.role, sections: data.sections || [], email: data.email });
        setAdminState(ok ? 'allowed' : 'denied');
      } catch {
        if (!cancelled) setAdminState('denied');
      }
    })();
    return () => {
      cancelled = true;
    };
  }, [user, loading]);

  const allowed = !loading && !!user && adminState === 'allowed';

  // Route guard: bounce signed-out people to the login page. Someone signed
  // in without access (or whose access was removed) sees a message instead;
  // sending them to /admin would bounce straight back here.
  useEffect(() => {
    if (!loading && !user && adminState === 'denied') router.replace('/admin');
  }, [adminState, loading, user, router]);

  if (!loading && user && adminState === 'denied') {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[#050505] text-white p-4">
        <div className="max-w-md w-full text-center bg-[#0A0A0A] border border-gray-800 rounded-2xl p-8">
          <div className="w-12 h-12 mx-auto mb-4 rounded-xl bg-yellow-500/10 grid place-items-center"><Lock className="text-yellow-500" size={22} /></div>
          <h1 className="text-lg font-bold mb-2">No dashboard access</h1>
          <p className="text-sm text-gray-400 mb-6">{user.email} isn&rsquo;t on the team, or its access was removed. Ask the site owner if you think this is a mistake.</p>
          <button onClick={() => logout().then(() => router.replace('/admin'))} className="px-5 py-2.5 bg-yellow-500 text-black font-medium rounded-lg hover:bg-yellow-400">Sign out</button>
        </div>
      </div>
    );
  }

  // While auth or the admin check is pending, or we're about to redirect,
  // show a spinner rather than flashing protected content.
  if (loading || !allowed) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[#050505] text-white">
        <LoaderCircle className="animate-spin text-yellow-500" size={32} />
      </div>
    );
  }

  const pageAllowed = canOpenPath(access, pathname);

  return (
    <AccessProvider access={access}>
    <div className="min-h-screen bg-[#050505] text-white">
      <div className="fixed inset-0 overflow-hidden pointer-events-none">
        <div className="absolute -top-[10%] -left-[10%] w-[40%] h-[40%] bg-yellow-500/5 blur-[120px] rounded-full" />
        <div className="absolute top-[60%] -right-[10%] w-[30%] h-[30%] bg-yellow-600/5 blur-[100px] rounded-full" />
      </div>

      <div className="relative z-10">
        <Sidebar open={mobileOpen} onClose={() => setMobileOpen(false)} />
        <div className="md:pl-64 flex flex-col min-h-screen">
          <Topbar onMenuClick={() => setMobileOpen((prev) => !prev)} />
          <main className="flex-1 p-4 md:p-8 lg:p-10">
            <div className="max-w-6xl mx-auto">
              {pageAllowed ? children : (
                <div className="max-w-md mx-auto mt-16 text-center bg-[#0A0A0A] border border-gray-800 rounded-2xl p-8">
                  <div className="w-12 h-12 mx-auto mb-4 rounded-xl bg-yellow-500/10 grid place-items-center"><Lock className="text-yellow-500" size={22} /></div>
                  <h1 className="text-lg font-bold mb-2">This page isn&rsquo;t part of your access</h1>
                  <p className="text-sm text-gray-400 mb-6">Ask the site owner to add this section to your account if you need it.</p>
                  <Link href="/dashboard" className="inline-flex px-5 py-2.5 bg-yellow-500 text-black font-medium rounded-lg hover:bg-yellow-400">Back to dashboard</Link>
                </div>
              )}
            </div>
          </main>
        </div>
      </div>
    </div>
    </AccessProvider>
  );
}
