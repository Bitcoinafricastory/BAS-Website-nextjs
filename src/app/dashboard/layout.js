'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/context/AuthContext';
import Sidebar from '@/components/dashboard/Sidebar';
import Topbar from '@/components/dashboard/Topbar';
import { LoaderCircle } from 'lucide-react';

// UX-level guard only. This can be bypassed by anyone calling the Firestore
// client SDK directly from the browser console — the real enforcement has
// to live in Firestore's own security rules, which this app doesn't
// control from code. This just stops an unexpected-but-validly-signed-in
// account from seeing the dashboard UI at all. Keep this list in sync with
// ADMIN_EMAILS on the server and with Firestore rules.
const ADMIN_EMAILS = (process.env.NEXT_PUBLIC_ADMIN_EMAILS || '')
  .split(',')
  .map((e) => e.trim().toLowerCase())
  .filter(Boolean);

function isAllowedAdmin(user) {
  if (!user?.email) return false;
  if (ADMIN_EMAILS.length === 0) return true; // not configured yet — see note above
  return ADMIN_EMAILS.includes(user.email.toLowerCase());
}

export default function DashboardLayout({ children }) {
  const { user, loading } = useAuth();
  const router = useRouter();
  const [mobileOpen, setMobileOpen] = useState(false);
  const allowed = !loading && user && isAllowedAdmin(user);

  // Route guard: once auth state resolves, bounce unauthenticated or
  // not-on-the-allowlist users to login.
  useEffect(() => {
    if (!loading && !allowed) router.replace('/admin');
  }, [allowed, loading, router]);

  // While auth is resolving, or if we're about to redirect, show a spinner
  // rather than flashing protected content.
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
