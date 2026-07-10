'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/context/AuthContext';
import Sidebar from '@/components/dashboard/Sidebar';
import Topbar from '@/components/dashboard/Topbar';
import { LoaderCircle } from 'lucide-react';

export default function DashboardLayout({ children }) {
  const { user, loading } = useAuth();
  const router = useRouter();
  const [mobileOpen, setMobileOpen] = useState(false);

  // Route guard: once auth state resolves, bounce unauthenticated users to login.
  useEffect(() => {
    if (!loading && !user) router.replace('/admin');
  }, [user, loading, router]);

  // While auth is resolving, or if we're about to redirect, show a spinner
  // rather than flashing protected content.
  if (loading || !user) {
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
