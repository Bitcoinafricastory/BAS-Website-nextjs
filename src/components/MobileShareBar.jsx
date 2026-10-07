'use client';

import { useEffect, useState } from 'react';
import { Share2, Link2, Check } from 'lucide-react';

/**
 * Share row for phones and tablets.
 *
 * The desktop share buttons live in ArticleSidebar, which is hidden below the
 * xl breakpoint, so readers on mobile/tablet previously had no way to share.
 * This bar is shown only below xl (xl:hidden) so desktop never sees two.
 *
 * - "Share" opens the device's native share sheet when the browser supports it
 *   (most phones), which covers WhatsApp, Telegram, Messages, etc.
 * - WhatsApp / Telegram / X / LinkedIn are plain links as a fallback and for
 *   desktop-sized tablets without a native share sheet.
 */
export default function MobileShareBar({ title = '', url = '' }) {
  const [copied, setCopied] = useState(false);
  const [canNativeShare, setCanNativeShare] = useState(false);

  useEffect(() => {
    setCanNativeShare(typeof navigator !== 'undefined' && typeof navigator.share === 'function');
  }, []);

  const shareUrl = url || (typeof window !== 'undefined' ? window.location.href : '');
  const text = title || '';

  const nativeShare = async () => {
    try {
      await navigator.share({ title: text, url: shareUrl });
    } catch {
      // User dismissed the share sheet (AbortError) or it failed — nothing to do.
    }
  };

  const copyLink = async () => {
    try {
      await navigator.clipboard.writeText(shareUrl);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      // Clipboard API unavailable (older browsers / insecure context): fail quietly.
    }
  };

  const pill =
    'inline-flex items-center justify-center gap-2 min-h-[44px] px-4 rounded-full border border-white/10 text-sm font-medium text-gray-200 hover:text-yellow-500 hover:border-yellow-500 transition-colors';

  return (
    <div className="xl:hidden mt-10 pt-8 border-t border-white/[0.08] max-w-[68ch] mx-auto">
      <p className="text-[10px] font-bold uppercase tracking-widest text-gray-500 mb-3">Share this article</p>
      <div className="flex flex-wrap gap-2">
        {canNativeShare && (
          <button type="button" onClick={nativeShare} className={`${pill} bg-yellow-500 text-black border-yellow-500 hover:text-black hover:bg-yellow-400`}>
            <Share2 size={16} aria-hidden="true" />
            Share
          </button>
        )}
        <a
          href={`https://wa.me/?text=${encodeURIComponent(`${text} ${shareUrl}`.trim())}`}
          target="_blank"
          rel="noopener noreferrer"
          className={pill}
        >
          WhatsApp
        </a>
        <a
          href={`https://t.me/share/url?url=${encodeURIComponent(shareUrl)}&text=${encodeURIComponent(text)}`}
          target="_blank"
          rel="noopener noreferrer"
          className={pill}
        >
          Telegram
        </a>
        <a
          href={`https://twitter.com/intent/tweet?text=${encodeURIComponent(text)}&url=${encodeURIComponent(shareUrl)}`}
          target="_blank"
          rel="noopener noreferrer"
          aria-label="Share on X"
          className={pill}
        >
          X
        </a>
        <a
          href={`https://www.linkedin.com/sharing/share-offsite/?url=${encodeURIComponent(shareUrl)}`}
          target="_blank"
          rel="noopener noreferrer"
          className={pill}
        >
          LinkedIn
        </a>
        <button type="button" onClick={copyLink} className={pill} aria-label={copied ? 'Link copied' : 'Copy link'}>
          {copied ? <Check size={16} className="text-yellow-500" aria-hidden="true" /> : <Link2 size={16} aria-hidden="true" />}
          {copied ? 'Copied' : 'Copy link'}
        </button>
      </div>
    </div>
  );
}
