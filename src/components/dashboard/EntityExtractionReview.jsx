'use client';

import { useState } from 'react';
import { db } from '@/lib/firebase';
import { collection, addDoc, serverTimestamp } from 'firebase/firestore';
import { LoaderCircle, CheckCircle2, Sparkles, AlertTriangle, X } from 'lucide-react';
import { ENTITY_TYPES, entityTypeLabel } from '@/lib/entityTypes';
import { slugifyEntity } from '@/lib/entities';
import EntityLinker from '@/components/dashboard/EntityLinker';

export default function EntityExtractionReview({ suggestions, degraded, reason, articleTitle, onConfirm, onSkip }) {
  const [items, setItems] = useState(() =>
    suggestions.map((s) => ({
      ...s,
      slug: s.existingSlug,
      status: s.existingSlug ? 'linked' : 'pending',
      typeChoice: s.guessedType,
      creating: false,
    }))
  );
  const [manualSlugs, setManualSlugs] = useState([]);

  const dismiss = (i) => setItems((prev) => prev.map((it, idx) => (idx === i ? { ...it, status: 'dismissed' } : it)));

  const createAndLink = async (i) => {
    setItems((prev) => prev.map((it, idx) => (idx === i ? { ...it, creating: true } : it)));
    const item = items[i];
    try {
      const slug = slugifyEntity(item.name);
      await addDoc(collection(db, 'entities'), {
        name: item.name,
        slug,
        type: item.typeChoice,
        description: item.reason || '',
        country: '', city: '', website: '', socialLinks: {}, contactEmail: '',
        yearFounded: '', bitcoinFocus: '', founder: '', logo: '', coverImage: '',
        tags: [], featured: false, relatedEntityIds: [], externalCoverage: [],
        badges: [{
          level: 'editorial_reviewed',
          dateEarned: new Date().toISOString().slice(0, 10),
          evidence: `Detected from published article: "${articleTitle}"`,
        }],
        createdAt: serverTimestamp(),
      });
      setItems((prev) => prev.map((it, idx) => (idx === i ? { ...it, status: 'linked', slug, creating: false } : it)));
    } catch (err) {
      console.error('Could not create entity from suggestion:', err);
      setItems((prev) => prev.map((it, idx) => (idx === i ? { ...it, creating: false } : it)));
    }
  };

  const linked = items.filter((it) => it.status === 'linked');
  const pending = items.filter((it) => it.status === 'pending');

  const handleConfirm = () => {
    const slugs = Array.from(new Set([...linked.map((it) => it.slug), ...manualSlugs]));
    onConfirm(slugs);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm">
      <div className="bg-[#0A0A0A] border border-gray-800 rounded-2xl p-6 max-w-lg w-full max-h-[85vh] overflow-y-auto">
        <div className="flex items-center gap-2 mb-1">
          <Sparkles size={18} className="text-yellow-500" />
          <h3 className="text-lg font-bold">We found these in your article</h3>
        </div>
        <p className="text-gray-400 text-sm mb-4">Confirm which directory profiles this article should update.</p>

        {degraded && (
          <div className="flex items-start gap-2 bg-orange-500/10 border border-orange-500/30 rounded-lg px-3 py-2.5 mb-4">
            <AlertTriangle size={14} className="text-orange-400 flex-shrink-0 mt-0.5" />
            <p className="text-xs text-orange-300">
              AI extraction unavailable — showing name matches only. {reason}
            </p>
          </div>
        )}

        {linked.length > 0 && (
          <div className="space-y-2 mb-4">
            {items.map((it, i) => it.status !== 'linked' ? null : (
              <div key={i} className="flex items-center gap-3 bg-white/5 border border-gray-800 rounded-lg px-3 py-2.5">
                <CheckCircle2 size={16} className="text-green-400 flex-shrink-0" />
                <div className="flex-1 min-w-0">
                  <p className="text-sm text-white truncate">{it.name}</p>
                  <p className="text-xs text-gray-500">{entityTypeLabel(it.typeChoice)} · {it.existingSlug ? 'existing profile' : 'new profile created'}</p>
                </div>
                <button onClick={() => dismiss(i)} className="text-gray-500 hover:text-red-400 flex-shrink-0"><X size={14} /></button>
              </div>
            ))}
          </div>
        )}

        {pending.length > 0 && (
          <div className="mb-4">
            <p className="text-xs font-semibold text-yellow-500 mb-2 flex items-center gap-1.5">
              <Sparkles size={13} /> New — not in the directory yet
            </p>
            <div className="space-y-2">
              {items.map((it, i) => it.status !== 'pending' ? null : (
                <div key={i} className="bg-yellow-500/5 border border-yellow-500/20 rounded-lg px-3 py-2.5">
                  <div className="flex items-center gap-3 mb-2">
                    <div className="flex-1 min-w-0">
                      <p className="text-sm text-white truncate">{it.name}</p>
                      {it.reason && <p className="text-xs text-gray-500 truncate">{it.reason}</p>}
                    </div>
                    <button onClick={() => dismiss(i)} className="text-gray-500 hover:text-red-400 flex-shrink-0"><X size={14} /></button>
                  </div>
                  <div className="flex items-center gap-2">
                    <select
                      value={it.typeChoice}
                      onChange={(e) => setItems((prev) => prev.map((p, idx) => (idx === i ? { ...p, typeChoice: e.target.value } : p)))}
                      className="flex-1 px-2 py-1.5 bg-black/40 border border-gray-800 rounded text-xs text-white focus:outline-none focus:border-yellow-500"
                    >
                      {ENTITY_TYPES.map((t) => <option key={t.value} value={t.value}>{t.label}</option>)}
                    </select>
                    <button
                      onClick={() => createAndLink(i)}
                      disabled={it.creating}
                      className="flex-shrink-0 px-3 py-1.5 bg-yellow-500 text-black text-xs font-bold rounded hover:bg-yellow-400 transition-colors disabled:opacity-50 flex items-center gap-1.5"
                    >
                      {it.creating ? <LoaderCircle className="animate-spin" size={12} /> : null}
                      Create profile
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        <div className="border-t border-gray-800 pt-4 mb-4">
          <p className="text-xs font-semibold text-gray-400 mb-2">Search and add another profile</p>
          <EntityLinker value={manualSlugs} onChange={setManualSlugs} />
        </div>

        <div className="flex gap-3">
          <button onClick={handleConfirm} className="flex-1 px-4 py-2.5 bg-yellow-500 text-black font-bold rounded-lg hover:bg-yellow-400 transition-colors">
            Confirm and update profiles
          </button>
          <button onClick={onSkip} className="px-4 py-2.5 bg-white/5 border border-gray-800 rounded-lg hover:bg-white/10 transition-colors text-sm">
            Skip
          </button>
        </div>
      </div>
    </div>
  );
}
