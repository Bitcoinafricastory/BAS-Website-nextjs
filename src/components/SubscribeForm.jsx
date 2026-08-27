'use client';

import { useState } from 'react';
import { db } from '@/lib/firebase';
import { collection, addDoc, serverTimestamp, query, where, getDocs } from 'firebase/firestore';
import { ArrowRight, LoaderCircle, Check } from 'lucide-react';

// Set this once your Substack is live, e.g. 'https://bitcoinafricastory.substack.com'
const SUBSTACK_URL = process.env.NEXT_PUBLIC_SUBSTACK_URL || '';

const AFRICAN_COUNTRIES = [
  'Nigeria', 'Kenya', 'Ghana', 'South Africa', 'Tanzania', 'Uganda', 'Zambia',
  'Malawi', 'Zimbabwe', 'Ethiopia', 'Rwanda', 'Senegal', 'Cameroon', "Côte d'Ivoire",
  'Morocco', 'Egypt', 'Botswana', 'Namibia', 'Mozambique', 'Other in Africa',
  'Outside Africa',
];

export default function SubscribeForm() {
  const [email, setEmail] = useState('');
  const [country, setCountry] = useState('');
  const [busy, setBusy] = useState(false);
  const [done, setDone] = useState(false);
  const [notice, setNotice] = useState('');

  // Two things happen on submit: the address is stored in our own Firestore
  // (so the list is ours regardless of what happens to any third party), and
  // the reader is handed to Substack, which sends the welcome email
  // immediately. Doing only the first would mean new subscribers hear nothing
  // until the next manual export; doing only the second would mean we never
  // own the relationship.
  const handleSubmit = async (e) => {
    e.preventDefault();
    const clean = email.toLowerCase().trim();
    if (!clean) return;

    setBusy(true);
    setNotice('');

    try {
      const q = query(collection(db, 'newsletterSubscribers'), where('email', '==', clean));
      const snap = await getDocs(q);
      if (snap.empty) {
        await addDoc(collection(db, 'newsletterSubscribers'), {
          email: clean,
          country: country || null,
          source: 'subscribe-page',
          subscribedAt: serverTimestamp(),
        });
      }
      setDone(true);
    } catch (err) {
      // A Firestore failure shouldn't block the reader from subscribing —
      // Substack is the channel that actually reaches them.
      console.error('Subscribe error:', err);
      setNotice('We had trouble saving that, but you can still finish on Substack.');
      setDone(true);
    } finally {
      setBusy(false);
    }
  };

  if (done) {
    const substackHref = SUBSTACK_URL
      ? `${SUBSTACK_URL}/subscribe?email=${encodeURIComponent(email.toLowerCase().trim())}`
      : null;

    return (
      <div className="bg-[#0A0A0A] border border-white/5 rounded-xl p-7 max-w-lg">
        <div className="flex items-center gap-2 text-yellow-500 mb-3">
          <Check size={18} />
          <span className="font-bold text-sm uppercase tracking-widest">One more step</span>
        </div>
        <h3 className="text-xl font-semibold mb-2">Confirm on Substack</h3>
        <p className="text-gray-400 text-sm leading-relaxed mb-6">
          We send the weekly email through Substack. Confirm there and your first issue
          lands this week.
        </p>
        {substackHref ? (
          <a
            href={substackHref}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-2 bg-yellow-500 text-black font-bold px-6 py-3.5 hover:brightness-95 transition-all"
          >
            Finish on Substack <ArrowRight size={17} />
          </a>
        ) : (
          <p className="text-gray-500 text-sm">
            You&rsquo;re on the list — we&rsquo;ll be in touch as soon as the newsletter goes live.
          </p>
        )}
        {notice && <p className="text-gray-500 text-xs mt-4">{notice}</p>}
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit} className="max-w-lg">
      <div className="flex flex-col sm:flex-row gap-0">
        <input
          type="email"
          required
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          placeholder="you@email.com"
          className="flex-1 bg-black border border-gray-800 text-white text-base px-4 py-4 focus:outline-none focus:border-yellow-500 transition-colors"
        />
        <button
          type="submit"
          disabled={busy}
          className="inline-flex items-center justify-center gap-2 bg-yellow-500 text-black font-bold text-base px-7 py-4 hover:brightness-95 transition-all disabled:opacity-60"
        >
          {busy ? <LoaderCircle size={17} className="animate-spin" /> : null}
          Subscribe
        </button>
      </div>

      <select
        value={country}
        onChange={(e) => setCountry(e.target.value)}
        className="mt-3 w-full sm:w-auto bg-black border border-gray-800 text-gray-300 text-base px-4 py-3 focus:outline-none focus:border-yellow-500 transition-colors"
      >
        <option value="">Where are you reading from? (optional)</option>
        {AFRICAN_COUNTRIES.map((c) => (
          <option key={c} value={c}>{c}</option>
        ))}
      </select>

      <p className="text-gray-500 text-xs mt-4 leading-relaxed">
        Free forever. The weekly email is delivered via Substack — you can unsubscribe any time.
      </p>
    </form>
  );
}
