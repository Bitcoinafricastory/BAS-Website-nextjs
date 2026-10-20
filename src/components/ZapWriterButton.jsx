'use client';

import { useEffect, useRef, useState } from 'react';
import { Zap } from 'lucide-react';

/**
 * Floating "Zap the writer" button for articles.
 *
 * The tip box sits at the end of the article, so most readers never see it.
 * This button appears once the reader is into the article, and takes them
 * straight to the tip box. It hides while the tip box is on screen.
 *
 * It opens with its label, then shrinks to the bolt after a few seconds so it
 * doesn't sit over the text. Hovering (or focusing) shows the label again.
 */
export default function ZapWriterButton({ targetId = 'tip-writer', writerName = '' }) {
  const [visible, setVisible] = useState(false);
  const [expanded, setExpanded] = useState(true);
  const targetOnScreen = useRef(false);
  const introduced = useRef(false);

  const firstName = writerName.trim().split(/\s+/)[0];
  const label = firstName ? `Zap ${firstName}` : 'Zap the writer';

  useEffect(() => {
    const target = document.getElementById(targetId);
    if (!target) return undefined;

    const update = () => setVisible(window.scrollY > 600 && !targetOnScreen.current);
    const io = new IntersectionObserver(([entry]) => {
      targetOnScreen.current = entry.isIntersecting;
      update();
    });
    io.observe(target);
    window.addEventListener('scroll', update, { passive: true });
    update();
    return () => {
      io.disconnect();
      window.removeEventListener('scroll', update);
    };
  }, [targetId]);

  // Show the label the first time it appears, then collapse to the icon.
  useEffect(() => {
    if (!visible || introduced.current) return undefined;
    introduced.current = true;
    const t = setTimeout(() => setExpanded(false), 5000);
    return () => clearTimeout(t);
  }, [visible]);

  const goToTip = () => {
    const target = document.getElementById(targetId);
    if (!target) return;
    const reduce = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    target.scrollIntoView({ behavior: reduce ? 'auto' : 'smooth', block: 'center' });
    target.focus({ preventScroll: true });
    target.classList.remove('zap-flash');
    // Restart the highlight animation even if it ran before.
    void target.offsetWidth;
    target.classList.add('zap-flash');
    setTimeout(() => target.classList.remove('zap-flash'), 1800);
  };

  return (
    <button
      type="button"
      onClick={goToTip}
      aria-label={`${label}: send sats over Lightning`}
      tabIndex={visible ? 0 : -1}
      aria-hidden={!visible}
      className={`zap-fab group fixed z-40 right-4 sm:right-6 bottom-[calc(1rem+env(safe-area-inset-bottom))] sm:bottom-6
        inline-flex items-center h-12 rounded-full bg-yellow-500 text-black font-semibold text-sm
        shadow-lg shadow-black/40 hover:bg-yellow-400 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-yellow-500
        transition-all duration-300 ease-out
        ${visible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-4 pointer-events-none'}`}
    >
      <span className="zap-fab-bolt grid place-items-center w-12 h-12 shrink-0">
        <Zap size={20} fill="currentColor" strokeWidth={1.5} aria-hidden="true" />
      </span>
      <span
        className={`overflow-hidden whitespace-nowrap transition-all duration-300 ease-out
          group-hover:max-w-[12rem] group-hover:pr-5 group-hover:opacity-100
          group-focus-visible:max-w-[12rem] group-focus-visible:pr-5 group-focus-visible:opacity-100
          ${expanded ? 'max-w-[12rem] pr-5 opacity-100' : 'max-w-0 pr-0 opacity-0'}`}
      >
        {label}
      </span>
    </button>
  );
}
