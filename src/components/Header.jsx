'use client';

import Link from 'next/link';
import Image from 'next/image';
import { usePathname } from 'next/navigation';
import { useState } from 'react';
import { Menu, X, Search } from 'lucide-react';

const navLinks = [
  { name: 'Home', path: '/' },
  { name: 'News ', path: '/news' },
  { name: 'Education', path: '/education' },
  { name: 'Events', path: '/events' },
  { name: 'Contact', path: '/contact' },
  { name: 'About', path: '/about' },
  { name: 'Donate', path: '/donate' },
];

export default function Header() {
  const [isOpen, setIsOpen] = useState(false);
  const pathname = usePathname();

  const isActive = (path) => pathname === path;

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

          <div className="hidden md:flex items-center space-x-8">
            {navLinks.map((link) => (
              <Link
                key={link.path}
                href={link.path}
                className={`text-sm font-medium transition-colors duration-200 relative group ${
                  link.name === 'Donate'
                    ? 'bg-yellow-500 text-black px-3 py-2 shadow-lg'
                    : isActive(link.path)
                    ? 'text-yellow-500'
                    : 'text-gray-300 hover:text-yellow-500'
                }`}
              >
                {link.name}
                <span
                  className={`absolute -bottom-1 left-0 h-0.5 bg-yellow-500 transition-all duration-200 ${
                    link.name === 'Donate'
                      ? 'hidden'
                      : isActive(link.path)
                      ? 'w-full'
                      : 'w-0 group-hover:w-full'
                  }`}
                />
              </Link>
            ))}

            <Link
              href="/search"
              aria-label="Search"
              className={`transition-colors duration-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-yellow-500 focus-visible:ring-offset-2 focus-visible:ring-offset-black rounded-sm ${
                isActive('/search') ? 'text-yellow-500' : 'text-gray-300 hover:text-yellow-500'
              }`}
            >
              <Search size={18} />
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
          <div className="md:hidden mt-4 pb-4 space-y-3 relative z-50 bg-black/80 backdrop-blur-sm rounded-lg p-4">
            {navLinks.map((link) => (
              <Link
                key={link.path}
                href={link.path}
                onClick={() => setIsOpen(false)}
                className={`block px-4 py-2 text-sm font-medium transition-colors duration-200 ${
                  link.name === 'Donate'
                    ? 'bg-yellow-500 text-black shadow-lg'
                    : isActive(link.path)
                    ? 'text-yellow-500 bg-yellow-500/10'
                    : 'text-gray-300 hover:text-yellow-500 hover:bg-yellow-500/5'
                }`}
              >
                {link.name}
              </Link>
            ))}

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
          </div>
        )}
      </nav>
    </header>
  );
}
