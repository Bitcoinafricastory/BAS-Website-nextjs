'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { Link2, Check } from 'lucide-react';

// Brand icons aren't shipped by lucide-react, so we inline them.
const XIcon = (props) => (
  <svg viewBox="0 0 24 24" width="15" height="15" fill="currentColor" aria-hidden="true" {...props}>
    <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z" />
  </svg>
);

const LinkedinIcon = (props) => (
  <svg viewBox="0 0 24 24" width="15" height="15" fill="currentColor" aria-hidden="true" {...props}>
    <path d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433a2.062 2.062 0 01-2.063-2.065 2.063 2.063 0 112.063 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z" />
  </svg>
);

/**
 * Sticky right-rail sidebar for article pages.
 *
 * Contains:
 *   - Scroll-spy TOC (active section highlights as user scrolls)
 *   - Share buttons (X, LinkedIn, copy link)
 *   - Category tag
 *
 * Hidden below xl breakpoint — the mobile TOC/share affordances live inline
 * in the article body itself.
 */
export default function ArticleSidebar({ headings = [], category, title, url }) {
  const [activeId, setActiveId] = useState('');
  const [copied, setCopied] = useState(false);

  // Highlight the heading currently in view. IntersectionObserver is the cheap,
  // correct way — a scroll listener would fire hundreds of times per second.
  useEffect(() => {
    if (!headings.length || typeof window === 'undefined') return;

    const observer = new IntersectionObserver(
      (entries) => {
        // Pick the entry closest to the top of the viewport that's currently
        // visible; that's the section the reader is on.
        const visible = entries
          .filter((e) => e.isIntersecting)
          .sort((a, b) => a.boundingClientRect.top - b.boundingClientRect.top);
        if (visible.length > 0) {
          setActiveId(visible[0].target.id);
        }
      },
      // Offset for the sticky header (h-16 = 64px) so a heading counts as
      // "active" the moment it clears the header, not when it hits the top.
      { rootMargin: '-80px 0px -66% 0px', threshold: 0 }
    );

    headings.forEach((h) => {
      const el = document.getElementById(h.id);
      if (el) observer.observe(el);
    });

    return () => observer.disconnect();
  }, [headings]);

  const shareUrl = url || (typeof window !== 'undefined' ? window.location.href : '');
  const shareText = title || '';

  const copyLink = async () => {
    try {
      await navigator.clipboard.writeText(shareUrl);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      // If clipboard API fails (older browsers, insecure context), fail quietly.
    }
  };

  return (
    <aside className="hidden xl:block xl:col-span-1">
      <div className="sticky top-24 space-y-8">
        {category && (
          <div>
            <p className="text-[10px] font-bold uppercase tracking-widest text-gray-500 mb-2">Category</p>
            <Link
              href={`/news?category=${encodeURIComponent(category)}`}
              className="inline-block text-sm font-semibold text-yellow-500 hover:underline"
            >
              {category}
            </Link>
          </div>
        )}

        {headings.length > 2 && (
          <nav aria-label="Article contents">
            <p className="text-[10px] font-bold uppercase tracking-widest text-gray-500 mb-3">In this article</p>
            <ul className="space-y-2 border-l border-gray-800">
              {headings.map((h) => (
                <li key={h.id} className={h.level === 'h3' ? 'pl-6' : 'pl-4'}>
                  <a
                    href={`#${h.id}`}
                    className={`block text-sm py-1 -ml-px border-l-2 pl-3 transition-colors ${
                      activeId === h.id
                        ? 'border-yellow-500 text-yellow-500 font-medium'
                        : 'border-transparent text-gray-400 hover:text-gray-100'
                    }`}
                  >
                    {h.text}
                  </a>
                </li>
              ))}
            </ul>
          </nav>
        )}

        <div>
          <p className="text-[10px] font-bold uppercase tracking-widest text-gray-500 mb-3">Share</p>
          <div className="flex items-center gap-2">
            <a
              href={`https://twitter.com/intent/tweet?text=${encodeURIComponent(shareText)}&url=${encodeURIComponent(shareUrl)}`}
              target="_blank"
              rel="noopener noreferrer"
              aria-label="Share on X"
              className="flex items-center justify-center w-9 h-9 rounded-full border border-gray-800 text-gray-400 hover:text-yellow-500 hover:border-yellow-500 transition-colors"
            >
              <XIcon />
            </a>
            <a
              href={`https://www.linkedin.com/sharing/share-offsite/?url=${encodeURIComponent(shareUrl)}`}
              target="_blank"
              rel="noopener noreferrer"
              aria-label="Share on LinkedIn"
              className="flex items-center justify-center w-9 h-9 rounded-full border border-gray-800 text-gray-400 hover:text-yellow-500 hover:border-yellow-500 transition-colors"
            >
              <LinkedinIcon />
            </a>
            <button
              type="button"
              onClick={copyLink}
              aria-label={copied ? 'Link copied' : 'Copy link'}
              className="flex items-center justify-center w-9 h-9 rounded-full border border-gray-800 text-gray-400 hover:text-yellow-500 hover:border-yellow-500 transition-colors"
            >
              {copied ? <Check size={15} className="text-yellow-500" /> : <Link2 size={15} />}
            </button>
          </div>
        </div>
      </div>
    </aside>
  );
}
