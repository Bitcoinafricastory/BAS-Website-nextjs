'use client';

import { useState } from 'react';
import { db } from '@/lib/firebase';
import { collection, addDoc, serverTimestamp, query, where, getDocs } from 'firebase/firestore';
import { ArrowRight, LoaderCircle, Check } from 'lucide-react';

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

  // The address goes into our own Firestore collection, which is the list of
  // record — it's exported to CSV from the dashboard and imported into
  // Substack manually when an issue goes out. There is deliberately no
  // second step for the reader: sending them to Substack to "confirm" would
  // be a dead end, since the sending list isn't populated from here in real
  // time.
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
      // If the write fails the address is genuinely lost, so say so plainly
      // rather than showing a success state that isn't true.
      console.error('Subscribe error:', err);
      setNotice("That didn't save — please try again in a moment.");
    } finally {
      setBusy(false);
    }
  };

  if (done) {
    return (
      <div className="text-center">
        <div className="inline-flex items-center justify-center w-12 h-12 rounded-full bg-yellow-500/10 mb-5">
          <Check size={22} className="text-yellow-500" />
        </div>
        <h3 className="text-xl sm:text-2xl font-semibold mb-3">You&rsquo;re on the list.</h3>
        <p className="text-gray-400 text-[15px] leading-relaxed max-w-sm mx-auto">
          The next story lands in your inbox. Nothing else to do.
        </p>
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit} className="w-full">
      {/* Single unified pill — input and button share one rounded container
          rather than reading as two separate rectangles butted together. */}
      <div className="flex items-center gap-2 bg-white/[0.04] border border-white/10 rounded-full p-1.5 focus-within:border-yellow-500/60 transition-colors">
        <input
          type="email"
          required
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          placeholder="you@email.com"
          className="flex-1 min-w-0 bg-transparent text-white text-[15px] px-5 py-3 placeholder:text-gray-500 focus:outline-none"
        />
        <button
          type="submit"
          disabled={busy}
          className="inline-flex items-center gap-2 bg-yellow-500 text-black font-medium text-[15px] px-6 py-3 rounded-full hover:brightness-95 transition-all disabled:opacity-60 whitespace-nowrap flex-shrink-0"
        >
          {busy ? <LoaderCircle size={16} className="animate-spin" /> : null}
          Subscribe
          {!busy && <ArrowRight size={16} />}
        </button>
      </div>

      {notice && (
        <p className="text-red-400 text-sm mt-3 text-center">{notice}</p>
      )}

      <select
        value={country}
        onChange={(e) => setCountry(e.target.value)}
        className="mt-3 w-full bg-transparent border border-white/10 rounded-full text-gray-400 text-sm px-5 py-2.5 focus:outline-none focus:border-yellow-500/60 transition-colors"
      >
        <option value="">Where are you reading from? (optional)</option>
        {AFRICAN_COUNTRIES.map((c) => (
          <option key={c} value={c}>{c}</option>
        ))}
      </select>
    </form>
  );
}
