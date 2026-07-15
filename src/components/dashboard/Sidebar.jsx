'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import {
  LayoutDashboard, Newspaper, FileText, Calendar, Inbox, Globe,
  BookOpen, GraduationCap, Video, PlayCircle, Library, Heart, Users,
  Mail, Home, LogOut, X, Mic,
} from 'lucide-react';
import { useAuth } from '@/context/AuthContext';

// Reorganized into logical groups (improvement over the flat 14-item list),
// while keeping every original section and familiar names.
const navGroups = [
  {
    label: 'Overview',
    items: [
      { name: 'Dashboard', path: '/dashboard', icon: LayoutDashboard },
      { name: 'Analytics', path: '/dashboard/analytics', icon: LayoutDashboard },
    ],
  },
  {
    label: 'Editorial',
    items: [
      { name: 'News & Stories', path: '/dashboard/news', icon: Newspaper },
      { name: 'Submitted Stories', path: '/dashboard/submitted-stories', icon: Inbox },
      { name: 'Authors', path: '/dashboard/authors', icon: Users },
      { name: 'Podcast Episodes', path: '/dashboard/podcasts', icon: Mic },
    ],
  },
  {
    label: 'Events',
    items: [
      { name: 'Events Manager', path: '/dashboard/events', icon: Calendar },
      { name: 'Submitted Events', path: '/dashboard/submitted-events', icon: Inbox },
    ],
  },
  {
    label: 'Education',
    items: [
      { name: 'Edu Programs', path: '/dashboard/programs', icon: BookOpen },
      { name: 'Other Programs', path: '/dashboard/other-programs', icon: GraduationCap },
      { name: 'Bitcoin Videos', path: '/dashboard/videos', icon: Video },
      { name: 'Why Bitcoin Video', path: '/dashboard/why-video', icon: PlayCircle },
      { name: 'Bitcoin Resources', path: '/dashboard/resources', icon: Library },
    ],
  },
  {
    label: 'Community',
    items: [
      { name: 'Directory', path: '/dashboard/entities', icon: Globe },
      { name: 'Submitted Directory Entries', path: '/dashboard/submitted-entities', icon: Inbox },
      { name: 'X Testimonials', path: '/dashboard/testimonials', icon: Heart },
      { name: 'Education Testimonials', path: '/dashboard/edu-testimonials', icon: Users },
      { name: 'Newsletter', path: '/dashboard/newsletter', icon: Mail },
    ],
  },
];

function NavContent({ pathname, isActive, onClose, logout }) {
  return (
    <>
      <div className="px-6 py-5 border-b border-gray-800">
        <Link href="/dashboard" className="flex items-center gap-3 group">
          <div className="w-8 h-8 bg-yellow-500 flex items-center justify-center rounded-lg group-hover:rotate-12 transition-transform duration-300">
            <span className="font-black text-black">B</span>
          </div>
          <div>
            <div className="font-bold text-sm leading-tight">Bitcoin Africa Story</div>
            <div className="text-[10px] text-gray-500">Editorial Dashboard</div>
          </div>
        </Link>
      </div>

      <nav className="flex-1 overflow-y-auto px-3 py-4 space-y-6">
        {navGroups.map((group) => (
          <div key={group.label}>
            <div className="px-3 mb-2 text-[10px] font-bold text-gray-600 uppercase tracking-widest">{group.label}</div>
            <div className="space-y-1">
              {group.items.map((item) => {
                const Icon = item.icon;
                const active = isActive(item.path);
                return (
                  <Link
                    key={item.path}
                    href={item.path}
                    onClick={onClose}
                    className={`flex items-center gap-3 px-3 py-2.5 rounded-xl transition-all duration-200 text-sm ${
                      active ? 'bg-yellow-500 text-black font-semibold' : 'text-gray-400 hover:text-white hover:bg-white/5'
                    }`}
                  >
                    <Icon size={18} />
                    {item.name}
                  </Link>
                );
              })}
            </div>
          </div>
        ))}
      </nav>

      <div className="px-3 py-4 border-t border-gray-800 space-y-1">
        <Link href="/" className="flex items-center gap-3 px-3 py-2.5 rounded-xl text-gray-400 hover:text-white hover:bg-white/5 transition-all text-sm">
          <Home size={18} />
          View Site
        </Link>
        <button onClick={logout} className="w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-gray-400 hover:text-red-400 hover:bg-red-500/5 transition-all text-sm">
          <LogOut size={18} />
          Sign Out
        </button>
      </div>
    </>
  );
}

export default function Sidebar({ open, onClose }) {
  const pathname = usePathname();
  const { logout } = useAuth();

  const isActive = (path) => (path === '/dashboard' ? pathname === path : pathname === path || pathname.startsWith(path + '/'));

  return (
    <>
      {/* Desktop sidebar */}
      <aside className="hidden md:flex fixed inset-y-0 left-0 w-64 bg-[#0A0A0A] border-r border-gray-800 flex-col z-40">
        <NavContent pathname={pathname} isActive={isActive} onClose={onClose} logout={logout} />
      </aside>

      {/* Mobile drawer */}
      {open && (
        <>
          <div className="md:hidden fixed inset-0 bg-black/60 z-40" onClick={onClose} />
          <aside className="md:hidden fixed inset-y-0 left-0 w-64 bg-[#0A0A0A] border-r border-gray-800 flex flex-col z-50">
            <button onClick={onClose} className="absolute top-4 right-4 text-gray-400 hover:text-white z-10">
              <X size={20} />
            </button>
            <NavContent pathname={pathname} isActive={isActive} onClose={onClose} logout={logout} />
          </aside>
        </>
      )}
    </>
  );
}
