'use client';

import { useState, useEffect, useMemo } from 'react';
import { db } from '@/lib/firebase';
import { collection, onSnapshot, deleteDoc, doc } from 'firebase/firestore';
import { Search, Download, Trash2, LoaderCircle, Mail } from 'lucide-react';

export default function NewsletterPage() {
  const [subs, setSubs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [confirmDelete, setConfirmDelete] = useState(null);

  useEffect(() => {
    const unsub = onSnapshot(
      collection(db, 'newsletterSubscribers'),
      (snap) => {
        const list = snap.docs.map((d) => ({ id: d.id, ...d.data() }));
        list.sort((a, b) => {
          const ta = a.subscribedAt?.toDate?.()?.getTime() || 0;
          const tb = b.subscribedAt?.toDate?.()?.getTime() || 0;
          return tb - ta;
        });
        setSubs(list);
        setLoading(false);
      },
      (err) => { console.error(err); setLoading(false); }
    );
    return () => unsub();
  }, []);

  const filtered = useMemo(() => {
    if (!search) return subs;
    return subs.filter((s) => (s.email || '').toLowerCase().includes(search.toLowerCase()));
  }, [subs, search]);

  const exportCsv = () => {
    const rows = [['Email', 'Subscribed At']];
    subs.forEach((s) => {
      const date = s.subscribedAt?.toDate?.()?.toISOString() || '';
      rows.push([s.email || '', date]);
    });
    const csv = rows.map((r) => r.map((c) => `"${String(c).replace(/"/g, '""')}"`).join(',')).join('\n');
    const blob = new Blob([csv], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `newsletter-subscribers-${new Date().toISOString().split('T')[0]}.csv`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const remove = async (sub) => {
    setConfirmDelete(null);
    try { await deleteDoc(doc(db, 'newsletterSubscribers', sub.id)); } catch (e) { console.error(e); }
  };

  return (
    <div>
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 mb-8">
        <div>
          <h1 className="text-2xl font-bold">Newsletter Subscribers</h1>
          <p className="text-gray-400 text-sm mt-1">{subs.length} subscribers</p>
        </div>
        <button onClick={exportCsv} disabled={subs.length === 0} className="inline-flex items-center gap-2 px-5 py-3 bg-yellow-500 text-black font-bold rounded-xl hover:bg-yellow-400 transition-colors self-start disabled:opacity-50">
          <Download size={18} /> Export CSV
        </button>
      </div>

      <div className="relative mb-6">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500" size={18} />
        <input value={search} onChange={(e) => setSearch(e.target.value)} placeholder="Search by email…" className="w-full pl-10 pr-4 py-2.5 bg-[#0A0A0A] border border-gray-800 rounded-lg text-white placeholder-gray-600 focus:outline-none focus:border-yellow-500" />
      </div>

      {loading ? (
        <div className="flex items-center justify-center py-20"><LoaderCircle className="animate-spin text-yellow-500" size={28} /></div>
      ) : filtered.length === 0 ? (
        <div className="text-center py-20 bg-[#0A0A0A] border border-gray-800 rounded-2xl"><p className="text-gray-400">No subscribers yet.</p></div>
      ) : (
        <div className="bg-[#0A0A0A] border border-gray-800 rounded-2xl overflow-hidden">
          {filtered.map((sub, i) => (
            <div key={sub.id} className={`flex items-center gap-4 p-4 ${i !== filtered.length - 1 ? 'border-b border-gray-800' : ''}`}>
              <div className="w-9 h-9 rounded-full bg-yellow-500/10 flex items-center justify-center flex-shrink-0">
                <Mail className="text-yellow-500" size={16} />
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-white truncate">{sub.email}</p>
                <p className="text-xs text-gray-500">
                  {sub.subscribedAt?.toDate?.()?.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' }) || '—'}
                </p>
              </div>
              <button onClick={() => setConfirmDelete(sub)} className="w-9 h-9 rounded-lg flex items-center justify-center text-gray-400 hover:text-red-400 hover:bg-red-500/5 transition-colors flex-shrink-0">
                <Trash2 size={16} />
              </button>
            </div>
          ))}
        </div>
      )}

      {confirmDelete && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm">
          <div className="bg-[#0A0A0A] border border-gray-800 rounded-2xl p-6 max-w-md w-full">
            <h3 className="text-lg font-bold mb-2">Remove subscriber?</h3>
            <p className="text-gray-400 text-sm mb-6">{confirmDelete.email} will be removed from the list.</p>
            <div className="flex gap-3">
              <button onClick={() => remove(confirmDelete)} className="flex-1 px-4 py-2.5 bg-red-500 text-white font-bold rounded-lg hover:bg-red-400 transition-colors">Remove</button>
              <button onClick={() => setConfirmDelete(null)} className="flex-1 px-4 py-2.5 bg-white/5 border border-gray-800 rounded-lg hover:bg-white/10 transition-colors">Cancel</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
