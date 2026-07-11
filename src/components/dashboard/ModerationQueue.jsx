'use client';

import { useState, useEffect } from 'react';
import { db } from '@/lib/firebase';
import { collection, onSnapshot, addDoc, deleteDoc, doc, serverTimestamp } from 'firebase/firestore';
import { Check, X, LoaderCircle, Eye, CheckCircle2, AlertCircle, Inbox } from 'lucide-react';

/**
 * config: {
 *   title, sourceCollection, targetCollection,
 *   primaryField, secondaryField, imageField,
 *   transform: (item) => payloadForTargetCollection
 * }
 */
export default function ModerationQueue({ config }) {
  const { title, sourceCollection, targetCollection, primaryField, secondaryField, imageField, transform } = config;
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [busyId, setBusyId] = useState(null);
  const [toast, setToast] = useState(null);
  const [viewing, setViewing] = useState(null);
  const [confirmReject, setConfirmReject] = useState(null);

  useEffect(() => {
    const unsub = onSnapshot(
      collection(db, sourceCollection),
      (snap) => { setItems(snap.docs.map((d) => ({ id: d.id, ...d.data() }))); setLoading(false); },
      (err) => { console.error(err); setLoading(false); }
    );
    return () => unsub();
  }, [sourceCollection]);

  useEffect(() => {
    if (!toast) return;
    const t = setTimeout(() => setToast(null), 3500);
    return () => clearTimeout(t);
  }, [toast]);

  const approve = async (item) => {
    setBusyId(item.id);
    try {
      const { id, submittedAt, status, ...rest } = item;
      const payload = transform ? transform(rest) : rest;
      await addDoc(collection(db, targetCollection), { ...payload, createdAt: serverTimestamp() });
      await deleteDoc(doc(db, sourceCollection, item.id));
      setToast({ type: 'success', message: 'Approved and published.' });
      setViewing(null);
    } catch (err) {
      console.error('approve error', err);
      setToast({ type: 'error', message: 'Approval failed.' });
    } finally {
      setBusyId(null);
    }
  };

  const reject = async (item) => {
    setConfirmReject(null);
    setBusyId(item.id);
    try {
      await deleteDoc(doc(db, sourceCollection, item.id));
      setToast({ type: 'success', message: 'Submission rejected.' });
      setViewing(null);
    } catch (err) {
      setToast({ type: 'error', message: 'Reject failed.' });
    } finally {
      setBusyId(null);
    }
  };

  return (
    <div>
      <div className="mb-8">
        <h1 className="text-2xl font-bold">{title}</h1>
        <p className="text-gray-400 text-sm mt-1">{items.length} awaiting review</p>
      </div>

      {loading ? (
        <div className="flex items-center justify-center py-20"><LoaderCircle className="animate-spin text-yellow-500" size={28} /></div>
      ) : items.length === 0 ? (
        <div className="text-center py-20 bg-[#0A0A0A] border border-gray-800 rounded-2xl">
          <Inbox className="mx-auto text-gray-700 mb-3" size={40} />
          <p className="text-gray-400">Nothing awaiting review.</p>
        </div>
      ) : (
        <div className="space-y-3">
          {items.map((item) => (
            <div key={item.id} className="flex items-center gap-4 bg-[#0A0A0A] border border-gray-800 rounded-xl p-4">
              {imageField && (
                <div className="w-16 h-16 rounded-lg overflow-hidden flex-shrink-0 bg-gray-900">
                  {item[imageField] ? (
                    /* eslint-disable-next-line @next/next/no-img-element */
                    <img src={item[imageField]} alt="" className="w-full h-full object-cover" />
                  ) : null}
                </div>
              )}
              <div className="flex-1 min-w-0">
                <h3 className="font-semibold text-white truncate">{item[primaryField] || '(untitled)'}</h3>
                {secondaryField && <p className="text-xs text-gray-500 truncate">{item[secondaryField]}</p>}
              </div>
              <div className="flex items-center gap-2 flex-shrink-0">
                <button onClick={() => setViewing(item)} className="px-3 py-2 rounded-lg text-gray-400 hover:text-white hover:bg-white/5 transition-colors flex items-center gap-1.5 text-sm">
                  <Eye size={15} /> Review
                </button>
                <button onClick={() => approve(item)} disabled={busyId === item.id} className="px-3 py-2 rounded-lg bg-green-500/10 text-green-400 border border-green-500/30 hover:bg-green-500/20 transition-colors flex items-center gap-1.5 text-sm disabled:opacity-50">
                  {busyId === item.id ? <LoaderCircle className="animate-spin" size={15} /> : <Check size={15} />} Approve
                </button>
                <button onClick={() => setConfirmReject(item)} disabled={busyId === item.id} className="px-3 py-2 rounded-lg bg-red-500/10 text-red-400 border border-red-500/30 hover:bg-red-500/20 transition-colors flex items-center gap-1.5 text-sm disabled:opacity-50">
                  <X size={15} /> Reject
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Review modal */}
      {viewing && (
        <div className="fixed inset-0 z-50 bg-black/90 backdrop-blur-sm overflow-y-auto p-4 md:p-8">
          <div className="max-w-3xl mx-auto bg-[#0A0A0A] border border-gray-800 rounded-2xl overflow-hidden">
            <div className="sticky top-0 bg-[#0A0A0A] border-b border-gray-800 px-6 py-4 flex items-center justify-between z-10">
              <span className="text-sm font-semibold text-gray-400">Review submission</span>
              <button onClick={() => setViewing(null)} className="text-gray-400 hover:text-white"><X size={20} /></button>
            </div>
            <div className="p-6 space-y-4">
              {Object.entries(viewing)
                .filter(([k]) => !['id', 'submittedAt', 'status'].includes(k))
                .map(([k, v]) => (
                  <div key={k}>
                    <div className="text-xs font-bold text-gray-500 uppercase tracking-wide mb-1">{k}</div>
                    {typeof v === 'string' && (v.startsWith('http') && /\.(jpg|jpeg|png|webp|gif)/i.test(v)) ? (
                      /* eslint-disable-next-line @next/next/no-img-element */
                      <img src={v} alt="" className="max-h-56 rounded-lg border border-gray-800" />
                    ) : typeof v === 'string' && v.includes('<') ? (
                      <div className="prose prose-invert prose-sm max-w-none bg-black/40 p-4 rounded-lg" dangerouslySetInnerHTML={{ __html: v }} />
                    ) : (
                      <p className="text-gray-300 text-sm break-words">{String(v?.toDate ? v.toDate().toLocaleString() : v)}</p>
                    )}
                  </div>
                ))}
            </div>
            <div className="sticky bottom-0 bg-[#0A0A0A] border-t border-gray-800 px-6 py-4 flex gap-3">
              <button onClick={() => approve(viewing)} disabled={busyId === viewing.id} className="flex-1 px-4 py-3 bg-green-500 text-white font-bold rounded-lg hover:bg-green-400 transition-colors disabled:opacity-50 flex items-center justify-center gap-2">
                {busyId === viewing.id ? <LoaderCircle className="animate-spin" size={16} /> : <Check size={16} />} Approve &amp; Publish
              </button>
              <button onClick={() => setConfirmReject(viewing)} className="flex-1 px-4 py-3 bg-red-500/10 text-red-400 border border-red-500/30 font-bold rounded-lg hover:bg-red-500/20 transition-colors">Reject</button>
            </div>
          </div>
        </div>
      )}

      {confirmReject && (
        <div className="fixed inset-0 z-[55] flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm">
          <div className="bg-[#0A0A0A] border border-gray-800 rounded-2xl p-6 max-w-md w-full">
            <h3 className="text-lg font-bold mb-2">Reject this submission?</h3>
            <p className="text-gray-400 text-sm mb-6">It will be permanently deleted and won&rsquo;t be published.</p>
            <div className="flex gap-3">
              <button onClick={() => reject(confirmReject)} className="flex-1 px-4 py-2.5 bg-red-500 text-white font-bold rounded-lg hover:bg-red-400 transition-colors">Reject</button>
              <button onClick={() => setConfirmReject(null)} className="flex-1 px-4 py-2.5 bg-white/5 border border-gray-800 rounded-lg hover:bg-white/10 transition-colors">Cancel</button>
            </div>
          </div>
        </div>
      )}

      {toast && (
        <div className={`fixed bottom-6 right-6 z-[60] flex items-center gap-3 px-5 py-3 rounded-xl border shadow-2xl ${toast.type === 'error' ? 'bg-red-950 border-red-800 text-red-200' : 'bg-green-950 border-green-800 text-green-200'}`}>
          {toast.type === 'error' ? <AlertCircle size={18} /> : <CheckCircle2 size={18} />}
          <span className="text-sm font-medium">{toast.message}</span>
        </div>
      )}
    </div>
  );
}
