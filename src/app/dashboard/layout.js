'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/context/AuthContext';
import Sidebar from '@/components/dashboard/Sidebar';
import Topbar from '@/components/dashboard/Topbar';
import { LoaderCircle } from 'lucide-react';

// UX-level guard. The real enforcement is in Firestore/Storage security rules
// and the server API routes. Admin status is checked on the server via
// /api/admin/check, so the admin allowlist is never shipped to the browser.
// Fails closed: any error means no dashboard.

export default function DashboardLayout({ children }) {
  const { user, loading } = useAuth();
  const router = useRouter();
  const [mobileOpen, setMobileOpen] = useState(false);
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
        if (!cancelled) setAdminState(res.ok && data.admin === true ? 'allowed' : 'denied');
      } catch {
        if (!cancelled) setAdminState('denied');
      }
    })();
    return () => {
      cancelled = true;
    };
  }, [user, loading]);

  const allowed = !loading && !!user && adminState === 'allowed';

  // Route guard: bounce signed-out or non-admin users to login once known.
  useEffect(() => {
    if (!loading && adminState === 'denied') router.replace('/admin');
  }, [adminState, loading, router]);

  // While auth or the admin check is pending, or we're about to redirect,
  // show a spinner rather than flashing protected content.
  if (loading || !allowed) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[#050505] text-white">
        <LoaderCircle className="animate-spin text-yellow-500" size={32} />
      </div>
    );
  }

  return (
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
            <div className="max-w-6xl mx-auto">{children}</div>
          </main>
        </div>
      </div>
    </div>
  );
}
