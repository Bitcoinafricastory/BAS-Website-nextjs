'use client';

import { useState } from 'react';
import { db } from '@/lib/firebase';
import { collection, addDoc, serverTimestamp } from 'firebase/firestore';
import { LoaderCircle, CheckCircle2, Sparkles, AlertTriangle, X } from 'lucide-react';
import { ENTITY_TYPES, ENTITY_COUNTRIES, entityTypeLabel } from '@/lib/entityTypes';
import { slugifyEntity } from '@/lib/entities';
import EntityLinker from '@/components/dashboard/EntityLinker';

export default function EntityExtractionReview({ suggestions, degraded, reason, articleTitle, articleImage, onConfirm, onSkip }) {
  const [items, setItems] = useState(() =>
    suggestions.map((s) => ({
      ...s,
      slug: s.existingSlug,
      status: s.existingSlug ? 'linked' : 'pending',
      typeChoice: s.guessedType,
      country: s.guessedCountry || '',
      city: s.guessedCity || '',
      website: s.guessedWebsite || '',
      founder: s.guessedFounder || '',
      tags: (s.guessedTags || []).join(', '),
      creating: false,
    }))
  );
  const [manualSlugs, setManualSlugs] = useState([]);

  const updateItem = (i, patch) => setItems((prev) => prev.map((it, idx) => (idx === i ? { ...it, ...patch } : it)));

  const dismiss = (i) => updateItem(i, { status: 'dismissed' });

  const createAndLink = async (i) => {
    updateItem(i, { creating: true });
    const item = items[i];
    try {
      const slug = slugifyEntity(item.name);
      await addDoc(collection(db, 'entities'), {
        name: item.name,
        slug,
        type: item.typeChoice,
        description: item.reason || '',
        country: item.country || '',
        city: item.city || '',
        website: item.website || '',
        socialLinks: {},
        contactEmail: '',
        yearFounded: '',
        bitcoinFocus: '',
        founder: item.founder || '',
        logo: '',
        // Best available default — the model can't fetch a logo/photo from
        // nowhere, but the article's own featured image is a reasonable
        // placeholder cover until someone uploads something better.
        coverImage: articleImage || '',
        tags: item.tags ? item.tags.split(',').map((t) => t.trim()).filter(Boolean) : [],
        featured: false, relatedEntityIds: [], externalCoverage: [],
        badges: [{
          level: 'editorial_reviewed',
          dateEarned: new Date().toISOString().slice(0, 10),
          evidence: `Detected from published article: "${articleTitle}"`,
        }],
        createdAt: serverTimestamp(),
      });
      updateItem(i, { status: 'linked', slug, creating: false });
    } catch (err) {
      console.error('Could not create entity from suggestion:', err);
      updateItem(i, { creating: false });
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

                  <div className="grid grid-cols-2 gap-2 mb-2">
                    <select
                      value={it.typeChoice}
                      onChange={(e) => updateItem(i, { typeChoice: e.target.value })}
                      className="px-2 py-1.5 bg-black/40 border border-gray-800 rounded text-xs text-white focus:outline-none focus:border-yellow-500"
                    >
                      {ENTITY_TYPES.map((t) => <option key={t.value} value={t.value}>{t.label}</option>)}
                    </select>
                    <select
                      value={it.country}
                      onChange={(e) => updateItem(i, { country: e.target.value })}
                      className="px-2 py-1.5 bg-black/40 border border-gray-800 rounded text-xs text-white focus:outline-none focus:border-yellow-500"
                    >
                      <option value="">Country — not stated</option>
                      {ENTITY_COUNTRIES.map((c) => <option key={c} value={c}>{c}</option>)}
                    </select>
                    <input
                      value={it.city}
                      onChange={(e) => updateItem(i, { city: e.target.value })}
                      placeholder="City (optional)"
                      className="px-2 py-1.5 bg-black/40 border border-gray-800 rounded text-xs text-white placeholder-gray-600 focus:outline-none focus:border-yellow-500"
                    />
                    <input
                      value={it.founder}
                      onChange={(e) => updateItem(i, { founder: e.target.value })}
                      placeholder="Founder (optional)"
                      className="px-2 py-1.5 bg-black/40 border border-gray-800 rounded text-xs text-white placeholder-gray-600 focus:outline-none focus:border-yellow-500"
                    />
                    <input
                      value={it.website}
                      onChange={(e) => updateItem(i, { website: e.target.value })}
                      placeholder="Website (optional)"
                      className="col-span-2 px-2 py-1.5 bg-black/40 border border-gray-800 rounded text-xs text-white placeholder-gray-600 focus:outline-none focus:border-yellow-500"
                    />
                    <input
                      value={it.tags}
                      onChange={(e) => updateItem(i, { tags: e.target.value })}
                      placeholder="Tags, comma separated (optional)"
                      className="col-span-2 px-2 py-1.5 bg-black/40 border border-gray-800 rounded text-xs text-white placeholder-gray-600 focus:outline-none focus:border-yellow-500"
                    />
                  </div>

                  {articleImage && (
                    <p className="text-[11px] text-gray-500 mb-2">Cover image will default to this article&rsquo;s featured image.</p>
                  )}

                  <button
                    onClick={() => createAndLink(i)}
                    disabled={it.creating}
                    className="w-full px-3 py-1.5 bg-yellow-500 text-black text-xs font-bold rounded hover:bg-yellow-400 transition-colors disabled:opacity-50 flex items-center justify-center gap-1.5"
                  >
                    {it.creating ? <LoaderCircle className="animate-spin" size={12} /> : null}
                    Create profile
                  </button>
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
