import { AuthProvider } from '@/context/AuthContext';

// Sign-in state is only needed on /admin and /dashboard, so the Firebase SDK
// loads there and not on public pages.
export default function AdminLayout({ children }) {
  return <AuthProvider>{children}</AuthProvider>;
}
