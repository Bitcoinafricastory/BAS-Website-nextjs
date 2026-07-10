'use client';

import { usePathname } from 'next/navigation';
import { AuthProvider } from '@/context/AuthContext';

// Receives the server-rendered header/footer as props and decides whether to
// show them. Admin routes (/admin, /dashboard/*) render without site chrome.
export default function AppShell({ header, footer, children }) {
  const pathname = usePathname();
  const isAdmin = pathname === '/admin' || (pathname && pathname.startsWith('/dashboard'));

  return (
    <AuthProvider>
      {!isAdmin && header}
      {children}
      {!isAdmin && footer}
    </AuthProvider>
  );
}
