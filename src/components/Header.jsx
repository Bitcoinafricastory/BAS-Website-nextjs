'use client';

import Link from 'next/link';
import Image from 'next/image';
import { usePathname } from 'next/navigation';
import { useState, useRef, useEffect } from 'react';
import { Menu, X, Search, ChevronDown, Newspaper, GraduationCap, Calendar, Globe, Mic } from 'lucide-react';

// Primary destinations — always visible on desktop. Home is intentionally
// absent: the logo links home (universal convention), as do the breadcrumbs
// on every content page.
const primaryLinks = [
  { name: 'News', path: '/news' },
  { name: 'Education', path: '/education' },
  { name: 'Events', path: '/events' },
];

// Secondary destinations — collapsed under a "More" dropdown on desktop.
const moreLinks = [
  { name: 'Writers', path: '/authors' },
  { name: 'Directory', path: '/directory' },
  { name: 'Podcast', path: '/podcast' },
  { name: 'Resources', path: '/resources' },
  { name: 'FAQ', path: '/faq' },
  { name: 'About', path: '/about' },
  { name: 'Contact', path: '/contact' },
];

// Mobile drawer — deliberately trimmed to the five core sections (plus the
// Search and Donate rows below). Secondary pages stay reachable via the
// footer on every page; keeping the drawer short is the point.
const mobileLinks = [
  { name: 'News', path: '/news', icon: Newspaper },
  { name: 'Education', path: '/education', icon: GraduationCap },
  { name: 'Events', path: '/events', icon: Calendar },
  { name: 'Directory', path: '/directory', icon: Globe },
  { name: 'Podcast', path: '/podcast', icon: Mic },
];

export default function Header() {
  const [isOpen, setIsOpen] = useState(false);
  const [moreOpen, setMoreOpen] = useState(false);
  const moreRef = useRef(null);
  const pathname = usePathname();

  const isActive = (path) => pathname === path;

  // Close the More dropdown when clicking outside (mouse-leave handles hover users;
  // this covers keyboard/touch users who opened it via click).
  useEffect(() => {
    if (!moreOpen) return;
    const handler = (e) => {
      if (moreRef.current && !moreRef.current.contains(e.target)) {
        setMoreOpen(false);
      }
    };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, [moreOpen]);

  return (
    <header className="fixed top-0 left-0 right-0 z-50 bg-black/95 backdrop-blur-sm border-b border-gray-800">
      {isOpen && (
        <div
          className="fixed inset-0 bg-black/60 z-40"
          onClick={() => setIsOpen(false)}
          aria-hidden="true"
        />
      )}

      <nav className="max-w-7xl mx-auto px-6 pb-4 pt-[10px]">
        <div className="flex items-center justify-between">
          <Link href="/" className="flex items-center group">
            <Image
              src="/assets/BitcoinAfricaStoryLogo.png"
              alt="Bitcoin Africa Story"
              width={100}
              height={50}
              priority
              className="w-[100px] h-[50px] object-contain"
            />
          </Link>

          <div className="hidden md:flex items-center space-x-6 lg:space-x-8">
            {primaryLinks.map((link) => (
              <Link
                key={link.path}
                href={link.path}
                className={`text-sm font-medium transition-colors duration-200 relative group ${
                  isActive(link.path) ? 'text-yellow-500' : 'text-gray-300 hover:text-yellow-500'
                }`}
              >
                {link.name}
                <span
                  className={`absolute -bottom-1 left-0 h-0.5 bg-yellow-500 transition-all duration-200 ${
                    isActive(link.path) ? 'w-full' : 'w-0 group-hover:w-full'
                  }`}
                />
              </Link>
            ))}

            {/* "More" dropdown for secondary destinations */}
            <div
              ref={moreRef}
              className="relative"
              onMouseEnter={() => setMoreOpen(true)}
              onMouseLeave={() => setMoreOpen(false)}
            >
              <button
                type="button"
                onClick={() => setMoreOpen((v) => !v)}
                aria-expanded={moreOpen}
                aria-haspopup="true"
                className={`flex items-center gap-1 text-sm font-medium transition-colors duration-200 ${
                  moreLinks.some((l) => isActive(l.path)) ? 'text-yellow-500' : 'text-gray-300 hover:text-yellow-500'
                }`}
              >
                More
                <ChevronDown size={14} className={`transition-transform duration-200 ${moreOpen ? 'rotate-180' : ''}`} />
              </button>
              {moreOpen && (
                <div
                  className="absolute right-0 top-full pt-3 w-48"
                  role="menu"
                >
                  <div className="bg-[#111113] border border-gray-800 rounded-lg shadow-xl overflow-hidden py-2">
                    {moreLinks.map((link) => (
                      <Link
                        key={link.path}
                        href={link.path}
                        role="menuitem"
                        onClick={() => setMoreOpen(false)}
                        className={`block px-4 py-2 text-sm transition-colors ${
                          isActive(link.path)
                            ? 'text-yellow-500 bg-yellow-500/10'
                            : 'text-gray-300 hover:text-yellow-500 hover:bg-white/5'
                        }`}
                      >
                        {link.name}
                      </Link>
                    ))}
                  </div>
                </div>
              )}
            </div>

            <Link
              href="/search"
              aria-label="Search"
              className={`transition-colors duration-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-yellow-500 focus-visible:ring-offset-2 focus-visible:ring-offset-black rounded-sm ${
                isActive('/search') ? 'text-yellow-500' : 'text-gray-300 hover:text-yellow-500'
              }`}
            >
              <Search size={18} />
            </Link>

            <Link
              href="/donate"
              className={`text-sm font-bold px-4 py-2 shadow-lg transition-colors duration-200 ${
                isActive('/donate')
                  ? 'bg-yellow-400 text-black'
                  : 'bg-yellow-500 text-black hover:bg-yellow-400'
              }`}
            >
              Donate
            </Link>
          </div>

          <button
            onClick={() => setIsOpen(!isOpen)}
            className="md:hidden text-white hover:text-yellow-500 transition-colors duration-200"
            aria-label="Toggle menu"
          >
            {isOpen ? <X size={24} /> : <Menu size={24} />}
          </button>
        </div>

        {isOpen && (
          <div className="md:hidden mt-4 pb-4 space-y-1 relative z-50 bg-black/80 backdrop-blur-sm rounded-lg p-4">
            {mobileLinks.map((link) => {
              const Icon = link.icon;
              return (
                <Link
                  key={link.path}
                  href={link.path}
                  onClick={() => setIsOpen(false)}
                  className={`flex items-center gap-2 px-4 py-2 text-sm font-medium transition-colors duration-200 ${
                    isActive(link.path)
                      ? 'text-yellow-500 bg-yellow-500/10'
                      : 'text-gray-300 hover:text-yellow-500 hover:bg-yellow-500/5'
                  }`}
                >
                  <Icon size={16} />
                  {link.name}
                </Link>
              );
            })}

            <Link
              href="/search"
              onClick={() => setIsOpen(false)}
              className={`flex items-center gap-2 px-4 py-2 text-sm font-medium transition-colors duration-200 ${
                isActive('/search')
                  ? 'text-yellow-500 bg-yellow-500/10'
                  : 'text-gray-300 hover:text-yellow-500 hover:bg-yellow-500/5'
              }`}
            >
              <Search size={16} />
              Search
            </Link>

            <Link
              href="/donate"
              onClick={() => setIsOpen(false)}
              className="block px-4 py-2 text-sm font-bold text-black bg-yellow-500 mt-2"
            >
              Donate
            </Link>
          </div>
        )}
      </nav>
    </header>
  );
}
