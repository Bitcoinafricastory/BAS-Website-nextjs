'use client';

import { useEffect, useMemo, useState } from 'react';
import { db, auth } from '@/lib/firebase';
import { collection, onSnapshot, updateDoc, doc, query, orderBy } from 'firebase/firestore';
import { announceChange } from '@/lib/announce-change';
import { resolveImageUrl } from '@/lib/schema';
import imageLoader from '@/lib/image-loader';
import { Sparkles, LoaderCircle, Check, ExternalLink, AlertCircle } from 'lucide-react';

// Image descriptions (alt text) for article photos, in one place.
// Google Images and screen readers read these. Older articles were published
// before the field existed, so this page lists the ones still missing it,
// lets Claude suggest one from the photo, and saves each with one click.

const isPublished = (p) => !p.status || p.status === 'published';

async function suggestAlt(post) {
  const idToken = await auth.currentUser?.getIdToken();
  const res = await fetch('/api/admin/ai', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ idToken, task: 'imageAlt', payload: { image: resolveImageUrl(post.image), title: post.title } }),
  });
  const data = await res.json().catch(() => ({}));
  if (!res.ok) throw new Error(data.error || `Request failed (${res.status})`);
  return data.result;
}

export default function ImageDescriptionsPage() {
  const [posts, setPosts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showAll, setShowAll] = useState(false);
  const [drafts, setDrafts] = useState({});
  const [busy, setBusy] = useState({});
  const [saved, setSaved] = useState({});
  const [errors, setErrors] = useState({});
  const [bulk, setBulk] = useState(null); // null | { done, total }
  const [bulkError, setBulkError] = useState('');

  useEffect(() => {
    const unsub = onSnapshot(
      query(collection(db, 'news'), orderBy('createdAt', 'desc')),
      (snap) => { setPosts(snap.docs.map((d) => ({ id: d.id, ...d.data() }))); setLoading(false); },
      (err) => { console.error('news snapshot', err); setLoading(false); }
    );
    return () => unsub();
  }, []);

  const withImage = useMemo(() => posts.filter((p) => resolveImageUrl(p.image)), [posts]);
  const missing = withImage.filter((p) => !String(p.imageAlt || '').trim());
  const shown = showAll ? withImage : withImage.filter((p) => !String(p.imageAlt || '').trim() || saved[p.id]);

  const setFor = (setter, id, value) => setter((m) => ({ ...m, [id]: value }));
  const valueOf = (p) => drafts[p.id] ?? p.imageAlt ?? '';

  const runSuggest = async (p) => {
    setFor(setBusy, p.id, 'ai');
    setFor(setErrors, p.id, '');
    try {
      const text = await suggestAlt(p);
      setFor(setDrafts, p.id, text);
      return true;
    } catch (err) {
      setFor(setErrors, p.id, err.message);
      return err.message;
    } finally {
      setFor(setBusy, p.id, null);
    }
  };

  const save = async (p) => {
    const text = valueOf(p).trim();
    if (!text) return;
    setFor(setBusy, p.id, 'save');
    setFor(setErrors, p.id, '');
    try {
      await updateDoc(doc(db, 'news', p.id), { imageAlt: text });
      setFor(setSaved, p.id, true);
      if (isPublished(p) && p.slug) announceChange([`/news/${p.slug}`]);
    } catch (err) {
      setFor(setErrors, p.id, 'Save failed. Please try again.');
    } finally {
      setFor(setBusy, p.id, null);
    }
  };

  // Suggest for every listed article that has no text yet, one at a time.
  // Stops at the first API problem (e.g. out of credit) rather than repeating it.
  const suggestAll = async () => {
    const queue = shown.filter((p) => !valueOf(p).trim());
    setBulkError('');
    setBulk({ done: 0, total: queue.length });
    for (let i = 0; i < queue.length; i++) {
      const outcome = await runSuggest(queue[i]);
      setBulk({ done: i + 1, total: queue.length });
      if (outcome !== true && !/Could not load this image/.test(outcome)) {
        setBulkError(outcome);
        break;
      }
    }
    setBulk(null);
  };

  const unsavedFilled = shown.filter((p) => drafts[p.id] && drafts[p.id].trim() !== (p.imageAlt || '').trim());
  const saveAll = async () => { for (const p of unsavedFilled) await save(p); };

  return (
    <div>
      <div className="flex flex-col md:flex-row md:items-end md:justify-between gap-4 mb-6">
        <div>
          <h1 className="text-2xl font-bold">Image Descriptions</h1>
          <p className="text-gray-400 text-sm mt-1">
            {loading ? 'Loading…' : `${withImage.length - missing.length} of ${withImage.length} article photos have a description. ${missing.length} to go.`}
          </p>
        </div>
        <div className="flex flex-wrap gap-2">
          <button onClick={suggestAll} disabled={!!bulk || loading || !shown.length}
            className="inline-flex items-center gap-2 px-4 py-2.5 bg-yellow-500 text-black text-sm font-medium rounded-xl hover:bg-yellow-400 disabled:opacity-50">
            {bulk ? <LoaderCircle size={16} className="animate-spin" /> : <Sparkles size={16} />}
            {bulk ? `Suggesting ${bulk.done}/${bulk.total}…` : 'Suggest for all empty'}
          </button>
          <button onClick={saveAll} disabled={!unsavedFilled.length}
            className="inline-flex items-center gap-2 px-4 py-2.5 bg-white/5 border border-gray-800 text-sm font-medium rounded-xl hover:bg-white/10 disabled:opacity-40">
            <Check size={16} /> Save all ({unsavedFilled.length})
          </button>
        </div>
      </div>

      <p className="text-xs text-gray-400 mb-4 leading-relaxed">
        Describe what is in the photo, not the headline: who is in it, doing what, where. Claude&rsquo;s suggestion looks at the photo itself; read it and fix names before saving.
      </p>
      {bulkError && (
        <p className="flex items-start gap-2 text-sm text-amber-300 bg-amber-500/10 border border-amber-500/30 rounded-lg px-3 py-2 mb-4">
          <AlertCircle size={16} className="mt-0.5 flex-shrink-0" /> Stopped: {bulkError}
        </p>
      )}
      <label className="inline-flex items-center gap-2 text-sm text-gray-400 mb-4 cursor-pointer">
        <input type="checkbox" checked={showAll} onChange={(e) => setShowAll(e.target.checked)} className="accent-yellow-500" />
        Also show articles that already have one
      </label>

      {loading ? (
        <div className="flex justify-center py-20"><LoaderCircle className="animate-spin text-yellow-500" size={28} /></div>
      ) : shown.length === 0 ? (
        <div className="text-center py-16 bg-[#0A0A0A] border border-gray-800 rounded-2xl text-gray-400">Every article photo has a description.</div>
      ) : (
        <div className="space-y-3">
          {shown.map((p) => {
            const src = resolveImageUrl(p.image);
            const value = valueOf(p);
            const changed = value.trim() !== (p.imageAlt || '').trim();
            return (
              <div key={p.id} className="flex flex-col sm:flex-row gap-4 bg-[#0A0A0A] border border-gray-800 rounded-xl p-3">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img src={imageLoader({ src, width: 256 })} alt="" loading="lazy" className="w-full sm:w-36 h-40 sm:h-24 object-cover rounded-lg bg-gray-900 flex-shrink-0" />
                <div className="flex-1 min-w-0">
                  <div className="flex items-start gap-2 mb-2">
                    <p className="flex-1 text-sm font-medium text-white line-clamp-2">{p.title || '(untitled)'}</p>
                    {!isPublished(p) && <span className="text-[10px] uppercase tracking-wider text-gray-400 border border-gray-700 rounded px-1.5 py-0.5">{p.status}</span>}
                    {isPublished(p) && p.slug && (
                      <a href={`/news/${p.slug}`} target="_blank" rel="noreferrer" title="Open article" className="text-gray-500 hover:text-yellow-500"><ExternalLink size={15} /></a>
                    )}
                  </div>
                  <div className="flex flex-col sm:flex-row gap-2">
                    <input
                      value={value}
                      maxLength={160}
                      onChange={(e) => { setFor(setDrafts, p.id, e.target.value); setFor(setSaved, p.id, false); }}
                      placeholder="e.g. Students at a Bitcoin workshop in Lusaka holding certificates"
                      className="flex-1 bg-black border border-gray-800 rounded-lg px-3 py-2 text-sm text-white placeholder-gray-600 focus:border-yellow-500 focus:outline-none"
                    />
                    <div className="flex gap-2">
                      <button onClick={() => runSuggest(p)} disabled={!!busy[p.id] || !!bulk}
                        className="inline-flex items-center gap-1.5 px-3 py-2 bg-white/5 border border-gray-800 rounded-lg text-xs font-medium hover:bg-white/10 disabled:opacity-50">
                        {busy[p.id] === 'ai' ? <LoaderCircle size={14} className="animate-spin" /> : <Sparkles size={14} className="text-yellow-500" />} Suggest
                      </button>
                      <button onClick={() => save(p)} disabled={!!busy[p.id] || !value.trim() || !changed}
                        className="inline-flex items-center gap-1.5 px-3 py-2 bg-yellow-500 text-black rounded-lg text-xs font-medium hover:bg-yellow-400 disabled:opacity-40">
                        {busy[p.id] === 'save' ? <LoaderCircle size={14} className="animate-spin" /> : <Check size={14} />}
                        {saved[p.id] && !changed ? 'Saved' : 'Save'}
                      </button>
                    </div>
                  </div>
                  {errors[p.id] && <p className="text-xs text-red-400 mt-1.5">{errors[p.id]}</p>}
                  <p className="text-[11px] text-gray-500 mt-1">{value.length}/125 recommended</p>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
