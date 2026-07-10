'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/context/AuthContext';
import { Lock, Mail, LoaderCircle } from 'lucide-react';

export default function AdminLoginPage() {
  const { login, user, loading } = useAuth();
  const router = useRouter();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState(null);
  const [busy, setBusy] = useState(false);

  // If already signed in, go straight to the dashboard.
  useEffect(() => {
    if (!loading && user) router.replace('/dashboard');
  }, [user, loading, router]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError(null);
    setBusy(true);
    try {
      await login(email, password);
      router.replace('/dashboard');
    } catch (err) {
      // Friendly message rather than raw Firebase error codes.
      const msg =
        err?.code === 'auth/invalid-credential' || err?.code === 'auth/wrong-password' || err?.code === 'auth/user-not-found'
          ? 'Incorrect email or password.'
          : err?.message || 'Sign in failed. Please try again.';
      setError(msg);
    } finally {
      setBusy(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-[#050505] text-white p-4 relative overflow-hidden">
      <div className="absolute -top-[10%] -left-[10%] w-[40%] h-[40%] bg-yellow-500/5 blur-[120px] rounded-full pointer-events-none" />
      <div className="absolute top-[60%] -right-[10%] w-[30%] h-[30%] bg-yellow-600/5 blur-[100px] rounded-full pointer-events-none" />

      <form onSubmit={handleSubmit} className="relative z-10 bg-[#0A0A0A] border border-gray-800 p-8 rounded-2xl w-full max-w-md shadow-2xl">
        <div className="flex items-center gap-3 mb-8">
          <div className="w-10 h-10 bg-yellow-500 flex items-center justify-center rounded-xl">
            <span className="font-black text-black text-lg">B</span>
          </div>
          <div>
            <h1 className="text-xl font-bold">Bitcoin Africa Story</h1>
            <p className="text-xs text-gray-500">Editorial Dashboard</p>
          </div>
        </div>

        <h2 className="text-2xl font-bold mb-1">Welcome back</h2>
        <p className="text-sm text-gray-400 mb-6">Sign in to manage your publication.</p>

        {error && (
          <div className="mb-4 p-3 bg-red-500/10 border border-red-500/30 rounded-lg text-red-300 text-sm">
            {error}
          </div>
        )}

        <label className="block text-sm font-medium text-gray-300 mb-2">Email</label>
        <div className="relative mb-4">
          <Mail className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500" size={18} />
          <input
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            type="email"
            required
            className="w-full pl-10 pr-4 py-3 rounded-lg bg-black/50 border border-gray-800 text-white placeholder-gray-500 focus:outline-none focus:border-yellow-500"
            placeholder="you@bitcoinafricastory.com"
          />
        </div>

        <label className="block text-sm font-medium text-gray-300 mb-2">Password</label>
        <div className="relative mb-6">
          <Lock className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500" size={18} />
          <input
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            type="password"
            required
            className="w-full pl-10 pr-4 py-3 rounded-lg bg-black/50 border border-gray-800 text-white placeholder-gray-500 focus:outline-none focus:border-yellow-500"
            placeholder="••••••••"
          />
        </div>

        <button
          type="submit"
          disabled={busy}
          className="w-full bg-yellow-500 text-black py-3 rounded-lg font-bold hover:bg-yellow-400 transition-colors flex items-center justify-center gap-2 disabled:opacity-60 disabled:cursor-not-allowed"
        >
          {busy ? (
            <>
              <LoaderCircle className="animate-spin" size={18} />
              Signing in…
            </>
          ) : (
            'Sign in'
          )}
        </button>
      </form>
    </div>
  );
}
