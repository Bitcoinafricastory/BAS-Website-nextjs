'use client';

import { useState } from 'react';
import { db } from '@/lib/firebase';
import { collection, addDoc, serverTimestamp, query, where, getDocs } from 'firebase/firestore';

export default function NewsletterSignup() {
  const [email, setEmail] = useState('');
  const [busy, setBusy] = useState(false);
  const [notice, setNotice] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!email.trim()) return;
    setBusy(true);
    setNotice('');
    try {
      const q = query(collection(db, 'newsletterSubscribers'), where('email', '==', email.toLowerCase().trim()));
      const snap = await getDocs(q);
      if (!snap.empty) {
        setNotice("You're already subscribed!");
        setBusy(false);
        return;
      }
      await addDoc(collection(db, 'newsletterSubscribers'), {
        email: email.toLowerCase().trim(),
        subscribedAt: serverTimestamp(),
      });
      setNotice('Subscribed! Welcome to the movement.');
      setEmail('');
    } catch (err) {
      console.error('Newsletter error:', err);
      setNotice('Something went wrong. Please try again.');
    } finally {
      setBusy(false);
    }
  };

  return (
    <div className="bg-gradient-to-r from-yellow-500/10 to-yellow-600/5 border border-yellow-500/30 rounded-2xl p-8 md:p-12 text-center">
      <h2 className="text-2xl md:text-3xl font-bold mb-3">
        Never Miss a <span className="text-yellow-500">Story</span>
      </h2>
      <p className="text-gray-300 mb-6 max-w-2xl mx-auto text-sm md:text-base">
        Get the best of Bitcoin Africa Story — adoption stories, education, and analysis — delivered to
        your inbox.
      </p>
      <form onSubmit={handleSubmit} className="flex flex-col sm:flex-row gap-3 max-w-lg mx-auto">
        <input
          type="email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          placeholder="Enter your email"
          required
          disabled={busy}
          className="flex-1 px-5 py-3 bg-gray-900 border border-gray-700 rounded-lg text-white focus:outline-none focus:border-yellow-500"
        />
        <button
          type="submit"
          disabled={busy}
          className="px-8 py-3 bg-yellow-500 text-black font-bold rounded-lg hover:bg-yellow-400 transition-colors hover:scale-105 disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {busy ? 'Subscribing…' : 'Subscribe'}
        </button>
      </form>
      {notice && <p className="mt-4 text-sm text-yellow-400">{notice}</p>}
    </div>
  );
}
