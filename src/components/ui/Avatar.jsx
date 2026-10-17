'use client';

import { useState } from 'react';
import Image from 'next/image';

/**
 * Avatar that survives a dead image URL.
 *
 * Most avatars here point at externally-hosted images (X profile pictures in
 * particular). Those URLs rotate whenever someone changes their photo, so a
 * link that works today can 404 next month. Guarding on `src &&` only handles
 * a *missing* URL — this also handles a URL that exists but fails to load,
 * falling back to the person's initial rather than leaving a blank circle.
 *
 * @param {string} [src]   Image URL. Falls back to initials when absent.
 * @param {string} name    Used for alt text and the initial fallback.
 * @param {number} [size]  Rendered pixel size, for the `sizes` hint.
 */
export default function Avatar({ src, name = '', size = 80, className = '', priority = false }) {
  const [failed, setFailed] = useState(false);
  const initial = (name || '').trim().charAt(0).toUpperCase() || '?';
  const showImage = src && !failed;

  return (
    <div
      className={`relative overflow-hidden flex items-center justify-center bg-gradient-to-br from-yellow-500/25 to-yellow-700/15 ${className}`}
    >
      {showImage ? (
        <Image
          src={src}
          alt={name || 'Profile photo'}
          fill
          sizes={`${size}px`}
          priority={priority}
          className="object-cover"
          onError={() => setFailed(true)}
        />
      ) : (
        <span
          aria-hidden="true"
          className="font-semibold text-yellow-500/90 select-none"
          style={{ fontSize: Math.max(12, Math.round(size * 0.4)) }}
        >
          {initial}
        </span>
      )}
    </div>
  );
}
