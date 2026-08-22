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
      {/* Skip link: visually hidden until keyboard-focused, so the page looks
          unchanged but keyboard and screen-reader users can jump past the nav. */}
      {!isAdmin && (
        <a
          href="#main"
          className="sr-only focus:not-sr-only focus:absolute focus:top-2 focus:left-2 focus:z-[100] focus:bg-yellow-500 focus:text-black focus:px-4 focus:py-2 focus:font-semibold"
        >
          Skip to content
        </a>
      )}
      {!isAdmin && header}
      {isAdmin ? children : <main id="main">{children}</main>}
      {!isAdmin && footer}
    </AuthProvider>
  );
}
