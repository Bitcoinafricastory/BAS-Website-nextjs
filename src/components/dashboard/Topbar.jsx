'use client';

import { Menu } from 'lucide-react';
import { useAuth } from '@/context/AuthContext';

export default function Topbar({ onMenuClick }) {
  const { user } = useAuth();

  return (
    <header className="sticky top-0 z-30 bg-[#050505]/90 backdrop-blur-sm border-b border-gray-800">
      <div className="flex items-center justify-between px-4 md:px-8 py-4">
        <button onClick={onMenuClick} className="md:hidden text-gray-400 hover:text-white" aria-label="Open menu">
          <Menu size={22} />
        </button>

        <div className="hidden md:block" />

        <div className="flex items-center gap-3">
          {user?.email && <span className="text-sm text-gray-400 hidden sm:inline">{user.email}</span>}
          <div className="w-9 h-9 rounded-full bg-yellow-500 flex items-center justify-center text-black font-bold text-sm">
            {user?.email ? user.email[0].toUpperCase() : 'A'}
          </div>
        </div>
      </div>
    </header>
  );
}
