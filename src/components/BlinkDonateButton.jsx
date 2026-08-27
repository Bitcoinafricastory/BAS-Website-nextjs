'use client';

import { useEffect, useId, useRef } from 'react';

const SCRIPT_SRC = 'https://blinkbitcoin.github.io/donation-button.blink.sv/js/blink-pay-button.js';

// The Blink widget is a third-party script. We load it once per page (not once
// per button) and keep a module-level promise so multiple buttons on the same
// page share the single load instead of racing each other.
let scriptPromise = null;

function loadBlinkScript() {
  if (typeof window === 'undefined') return Promise.resolve(false);
  if (window.BlinkPayButton) return Promise.resolve(true);
  if (scriptPromise) return scriptPromise;

  scriptPromise = new Promise((resolve) => {
    const existing = document.querySelector(`script[src="${SCRIPT_SRC}"]`);
    if (existing) {
      existing.addEventListener('load', () => resolve(true));
      existing.addEventListener('error', () => resolve(false));
      return;
    }
    const script = document.createElement('script');
    script.src = SCRIPT_SRC;
    script.async = true;
    script.onload = () => resolve(true);
    script.onerror = () => {
      // Blink's CDN is out of our control; if it fails we render nothing rather
      // than leaving a broken empty box in the middle of an article.
      console.warn('Blink donate button script failed to load');
      resolve(false);
    };
    document.body.appendChild(script);
  });

  return scriptPromise;
}

/**
 * Renders a Blink Lightning donation button.
 *
 * @param {string} username  Blink username receiving the sats. Falls back to the
 *                           publication account when a writer has none set.
 * @param {number} defaultAmount  Pre-filled amount in sats.
 */
export default function BlinkDonateButton({ username, defaultAmount = 1000 }) {
  const reactId = useId();
  // useId produces colons, which are invalid in a DOM id the widget looks up.
  const containerId = `blink-pay-${reactId.replace(/:/g, '')}`;
  const initialized = useRef(false);

  useEffect(() => {
    if (!username || initialized.current) return;
    let cancelled = false;

    loadBlinkScript().then((ok) => {
      if (!ok || cancelled || initialized.current) return;
      if (typeof window.BlinkPayButton === 'undefined') return;
      try {
        window.BlinkPayButton.init({
          username,
          containerId,
          themeMode: 'dark',
          language: 'en',
          defaultAmount,
          supportedCurrencies: [
            { code: 'sats', name: 'sats', isCrypto: true },
            { code: 'USD', name: 'USD', isCrypto: false },
          ],
          debug: false,
        });
        initialized.current = true;
      } catch (err) {
        console.warn('Blink donate button failed to initialise', err);
      }
    });

    return () => {
      cancelled = true;
    };
  }, [username, containerId, defaultAmount]);

  if (!username) return null;

  return <div id={containerId} className="blink-donate-button" />;
}
