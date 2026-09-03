'use client';

import { useEffect, useState } from 'react';
import { ChevronDown } from 'lucide-react';

/**
 * Mobile/tablet Table of Contents. Mirrors the desktop ArticleSidebar's TOC
 * (scroll-spy active highlighting, left-border rail, category label) but as
 * a collapsible card so it doesn't push the actual article below the fold
 * on a small screen. Hidden at xl+, where the sticky sidebar takes over.
 */
export default function ArticleTOC({ headings = [], category }) {
  const [activeId, setActiveId] = useState('');
  const [open, setOpen] = useState(false);

  useEffect(() => {
    if (!headings.length || typeof window === 'undefined') return;

    const observer = new IntersectionObserver(
      (entries) => {
        const visible = entries
          .filter((e) => e.isIntersecting)
          .sort((a, b) => a.boundingClientRect.top - b.boundingClientRect.top);
        if (visible.length > 0) setActiveId(visible[0].target.id);
      },
      { rootMargin: '-80px 0px -66% 0px', threshold: 0 }
    );

    headings.forEach((h) => {
      const el = document.getElementById(h.id);
      if (el) observer.observe(el);
    });

    return () => observer.disconnect();
  }, [headings]);

  if (headings.length <= 2) return null;

  return (
    <div className="xl:hidden mb-10 bg-[#0A0A0A] border border-white/5 rounded-xl overflow-hidden">
      <button
        type="button"
        onClick={() => setOpen((o) => !o)}
        aria-expanded={open}
        className="w-full flex items-center justify-between gap-4 p-5 text-left"
      >
        <div className="flex items-center gap-3 min-w-0">
          {category && (
            <span className="flex-shrink-0 text-[10px] font-medium text-yellow-500 uppercase tracking-widest">{category}</span>
          )}
          <span className="text-sm font-medium text-gray-200 truncate">In this article</span>
        </div>
        <ChevronDown size={16} className={`flex-shrink-0 text-gray-500 transition-transform duration-200 ${open ? 'rotate-180' : ''}`} />
      </button>

      {open && (
        <ul className="px-5 pb-5 pt-1 space-y-1 border-t border-white/5">
          {headings.map((h) => (
            <li key={h.id} className={h.level === 'h3' ? 'pl-4' : ''}>
              <a
                href={`#${h.id}`}
                onClick={() => setOpen(false)}
                className={`block text-sm py-1.5 pl-3 border-l-2 transition-colors ${
                  activeId === h.id
                    ? 'border-yellow-500 text-yellow-500 font-medium'
                    : 'border-white/10 text-gray-400 hover:text-gray-100 hover:border-white/30'
                }`}
              >
                {h.text}
              </a>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
