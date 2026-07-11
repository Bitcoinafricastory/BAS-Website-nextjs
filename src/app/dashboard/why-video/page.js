'use client';

import { useState, useEffect } from 'react';
import { db } from '@/lib/firebase';
import { collection, getDocs, addDoc, updateDoc, doc, serverTimestamp } from 'firebase/firestore';
import { LoaderCircle, CheckCircle2, AlertCircle, Save } from 'lucide-react';

export default function WhyBitcoinVideoPage() {
  const [form, setForm] = useState({ title: '', embedUrl: '', videoId: '', thumbnailUrl: '' });
  const [docId, setDocId] = useState(null);
  const [loading, setLoading] = useState(true);
  const [busy, setBusy] = useState(false);
  const [toast, setToast] = useState(null);

  useEffect(() => {
    let cancelled = false;
    async function load() {
      try {
        const snap = await getDocs(collection(db, 'whyBitcoinVideo'));
        if (!cancelled && !snap.empty) {
          const d = snap.docs[0];
          setDocId(d.id);
          setForm({ title: '', embedUrl: '', videoId: '', thumbnailUrl: '', ...d.data() });
        }
      } catch (err) {
        console.error('load why-video', err);
      } finally {
        if (!cancelled) setLoading(false);
      }
    }
    load();
    return () => { cancelled = true; };
  }, []);

  useEffect(() => {
    if (!toast) return;
    const t = setTimeout(() => setToast(null), 3500);
    return () => clearTimeout(t);
  }, [toast]);

  const save = async () => {
    setBusy(true);
    try {
      if (docId) {
        await updateDoc(doc(db, 'whyBitcoinVideo', docId), { ...form, updatedAt: serverTimestamp() });
      } else {
        const created = await addDoc(collection(db, 'whyBitcoinVideo'), { ...form, createdAt: serverTimestamp() });
        setDocId(created.id);
      }
      setToast({ type: 'success', message: 'Video saved.' });
    } catch (err) {
      console.error(err);
      setToast({ type: 'error', message: 'Save failed.' });
    } finally {
      setBusy(false);
    }
  };

  if (loading) {
    return <div className="flex items-center justify-center py-20"><LoaderCircle className="animate-spin text-yellow-500" size={28} /></div>;
  }

  return (
    <div className="max-w-3xl">
      <h1 className="text-2xl font-bold mb-1">Why Bitcoin Video</h1>
      <p className="text-gray-400 text-sm mb-6">The featured video shown on the Education page.</p>

      <div className="bg-[#0A0A0A] border border-gray-800 rounded-2xl p-6 space-y-5">
        <div>
          <label className="block text-sm font-medium text-gray-300 mb-2">Title</label>
          <input value={form.title} onChange={(e) => setForm({ ...form, title: e.target.value })} className="w-full px-4 py-3 bg-black/40 border border-gray-800 rounded-lg text-white focus:outline-none focus:border-yellow-500" />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-300 mb-2">Embed URL</label>
          <input value={form.embedUrl} onChange={(e) => setForm({ ...form, embedUrl: e.target.value })} placeholder="https://www.youtube.com/embed/…" className="w-full px-4 py-3 bg-black/40 border border-gray-800 rounded-lg text-white placeholder-gray-600 focus:outline-none focus:border-yellow-500" />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-300 mb-2">Video ID <span className="text-gray-600">(optional alternative to embed URL)</span></label>
          <input value={form.videoId} onChange={(e) => setForm({ ...form, videoId: e.target.value })} placeholder="dQw4w9WgXcQ" className="w-full px-4 py-3 bg-black/40 border border-gray-800 rounded-lg text-white placeholder-gray-600 focus:outline-none focus:border-yellow-500" />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-300 mb-2">Thumbnail URL <span className="text-gray-600">(optional)</span></label>
          <input value={form.thumbnailUrl} onChange={(e) => setForm({ ...form, thumbnailUrl: e.target.value })} className="w-full px-4 py-3 bg-black/40 border border-gray-800 rounded-lg text-white focus:outline-none focus:border-yellow-500" />
        </div>

        {(form.embedUrl || form.videoId) && (
          <div className="aspect-video rounded-lg overflow-hidden border border-gray-800">
            <iframe src={form.embedUrl || `https://www.youtube.com/embed/${form.videoId}`} title="Preview" className="w-full h-full" allowFullScreen />
          </div>
        )}

        <button onClick={save} disabled={busy} className="w-full flex items-center justify-center gap-2 px-6 py-3 bg-yellow-500 text-black font-bold rounded-lg hover:bg-yellow-400 transition-colors disabled:opacity-50">
          {busy ? <LoaderCircle className="animate-spin" size={18} /> : <Save size={18} />}
          Save Video
        </button>
      </div>

      {toast && (
        <div className={`fixed bottom-6 right-6 z-[60] flex items-center gap-3 px-5 py-3 rounded-xl border shadow-2xl ${toast.type === 'error' ? 'bg-red-950 border-red-800 text-red-200' : 'bg-green-950 border-green-800 text-green-200'}`}>
          {toast.type === 'error' ? <AlertCircle size={18} /> : <CheckCircle2 size={18} />}
          <span className="text-sm font-medium">{toast.message}</span>
        </div>
      )}
    </div>
  );
}
