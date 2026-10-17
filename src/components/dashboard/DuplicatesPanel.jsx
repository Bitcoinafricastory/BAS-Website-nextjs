'use client';

import { useEffect, useMemo, useState } from 'react';
import { collection, getDocs } from 'firebase/firestore';
import { db } from '@/lib/firebase';
import { findDuplicateGroups, completeness } from '@/lib/entity-duplicates';
import { entityTypeLabel } from '@/lib/entityTypes';
import { AlertTriangle, ChevronDown, Pencil, Trash2 } from 'lucide-react';

// Lists directory profiles that look like duplicates, with what you need to
// decide which to delete: how filled-in each copy is and how many articles
// and podcast episodes link to it (by slug).
export default function DuplicatesPanel({ items, onEdit, onDelete }) {
  const groups = useMemo(() => findDuplicateGroups(items), [items]);
  const [open, setOpen] = useState(true);
  const [links, setLinks] = useState(null);

  useEffect(() => {
    if (!groups.length) return;
    let cancelled = false;
    (async () => {
      const counts = {};
      for (const name of ['news', 'podcasts']) {
        try {
          const snap = await getDocs(collection(db, name));
          snap.forEach((d) => {
            for (const s of d.data().linkedEntityIds || []) counts[s] = (counts[s] || 0) + 1;
          });
        } catch (err) {
          console.warn(`link count: could not read ${name}`, err);
        }
      }
      if (!cancelled) setLinks(counts);
    })();
    return () => { cancelled = true; };
  }, [groups.length]);

  if (!groups.length) return null;

  // Different names mean different web addresses, so for website matches
  // keep the copy articles link to; otherwise the most complete one.
  const keepOf = (g) => {
    if (g.reason !== 'same-website' || !links) return g.keep;
    return [...g.items].sort((a, b) => (links[b.slug] || 0) - (links[a.slug] || 0) || completeness(b) - completeness(a))[0];
  };
  const certain = groups.filter((g) => g.reason === 'same-name').length;

  return (
    <div className="mb-6 bg-amber-500/5 border border-amber-500/30 rounded-2xl">
      <button onClick={() => setOpen((o) => !o)} className="w-full flex items-center gap-3 p-4 text-left">
        <AlertTriangle size={18} className="text-amber-400 flex-shrink-0" />
        <span className="flex-1 text-sm">
          <span className="font-semibold text-white">Possible duplicates: {groups.length}</span>
          <span className="text-gray-400"> · {certain} with the same name, {groups.length - certain} sharing a website</span>
        </span>
        <ChevronDown size={18} className={`text-gray-400 transition-transform ${open ? 'rotate-180' : ''}`} />
      </button>

      {open && (
        <div className="px-4 pb-4 space-y-4">
          <p className="text-xs text-gray-400 leading-relaxed">
            Keep the copy marked <span className="text-green-400 font-medium">Keep</span>, copy anything useful from the other into it, then delete the other.
            Same-name copies share one web address, so deleting the extra never breaks a link.
            For website matches, check they really are the same organisation, and keep the one articles link to.
          </p>
          {groups.map((g) => (
            <div key={`${g.reason}:${g.key}`} className="bg-black/30 border border-gray-800 rounded-xl p-3">
              <p className="text-[11px] uppercase tracking-wider text-gray-500 mb-2">
                {g.reason === 'same-name' ? 'Same name' : 'Same website (check)'} · <span className="normal-case tracking-normal">{g.key}</span>
              </p>
              <div className="space-y-2">
                {g.items.map((e) => {
                  const isKeep = e === keepOf(g);
                  const linked = links ? (links[e.slug] || 0) : null;
                  return (
                    <div key={e.id} className="flex items-center gap-3">
                      <div className="flex-1 min-w-0">
                        <p className="text-sm text-white truncate">
                          {e.name || '(untitled)'}
                          {isKeep && <span className="ml-2 text-[10px] font-semibold uppercase tracking-wider text-green-400">Keep</span>}
                        </p>
                        <p className="text-xs text-gray-400 truncate">
                          {entityTypeLabel(e.type)} · /directory/{e.slug} · detail score {completeness(e)}
                          {linked !== null && ` · linked from ${linked} ${linked === 1 ? 'story' : 'stories'}`}
                        </p>
                      </div>
                      <button onClick={() => onEdit(e)} title="Edit" className="w-8 h-8 rounded-lg flex items-center justify-center text-gray-400 hover:text-yellow-500 hover:bg-white/5"><Pencil size={15} /></button>
                      <button onClick={() => onDelete(e)} title="Delete" className="w-8 h-8 rounded-lg flex items-center justify-center text-gray-400 hover:text-red-400 hover:bg-red-500/5"><Trash2 size={15} /></button>
                    </div>
                  );
                })}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
