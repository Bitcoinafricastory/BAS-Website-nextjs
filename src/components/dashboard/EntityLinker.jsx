'use client';

import { useState, useEffect, useMemo } from 'react';
import { X, Search } from 'lucide-react';
import { getEntities } from '@/lib/entities';
import { entityTypeLabel } from '@/lib/entityTypes';

/**
 * value: array of entity slugs (the stable identifier used everywhere else
 * entities are referenced — relatedEntityIds, coverage queries, etc.)
 * onChange: (nextSlugsArray) => void
 */
export default function EntityLinker({ value = [], onChange }) {
  const [entities, setEntities] = useState([]);
  const [search, setSearch] = useState('');
  const [open, setOpen] = useState(false);

  useEffect(() => {
    getEntities().then(setEntities).catch((err) => {
      console.warn('EntityLinker: could not load entities', err);
    });
  }, []);

  const selected = useMemo(
    () => value.map((slug) => entities.find((e) => e.slug === slug)).filter(Boolean),
    [value, entities]
  );

  const matches = useMemo(() => {
    if (!search.trim()) return [];
    const s = search.toLowerCase();
    return entities
      .filter((e) => !value.includes(e.slug) && e.name?.toLowerCase().includes(s))
      .slice(0, 8);
  }, [entities, search, value]);

  const add = (entity) => {
    onChange([...value, entity.slug]);
    setSearch('');
    setOpen(false);
  };
  const remove = (slug) => onChange(value.filter((s) => s !== slug));

  return (
    <div>
      {selected.length > 0 && (
        <div className="flex flex-wrap gap-2 mb-2">
          {selected.map((e) => (
            <span key={e.slug} className="inline-flex items-center gap-1.5 text-xs bg-black/40 border border-gray-800 rounded-full px-3 py-1.5">
              {e.name} <span className="text-gray-500">({entityTypeLabel(e.type)})</span>
              <button type="button" onClick={() => remove(e.slug)} className="text-gray-500 hover:text-red-400"><X size={12} /></button>
            </span>
          ))}
        </div>
      )}
      <div className="relative">
        <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500" />
        <input
          value={search}
          onChange={(e) => { setSearch(e.target.value); setOpen(true); }}
          onFocus={() => setOpen(true)}
          placeholder="Search the directory to link a profile…"
          className="w-full pl-8 pr-3 py-2.5 bg-black/40 border border-gray-800 rounded-lg text-white placeholder-gray-600 focus:outline-none focus:border-yellow-500 text-sm"
        />
        {open && matches.length > 0 && (
          <div className="absolute z-10 mt-1 w-full bg-[#111113] border border-gray-800 rounded-lg overflow-hidden max-h-56 overflow-y-auto">
            {matches.map((e) => (
              <button
                type="button"
                key={e.slug}
                onClick={() => add(e)}
                className="w-full text-left px-3 py-2 text-sm text-gray-200 hover:bg-white/5 hover:text-yellow-500 transition-colors"
              >
                {e.name} <span className="text-xs text-gray-500">({entityTypeLabel(e.type)})</span>
              </button>
            ))}
          </div>
        )}
      </div>
      <p className="text-xs text-gray-500 mt-2">
        Linked profiles show this in their Related Coverage automatically — no need to touch the directory separately.
      </p>
    </div>
  );
}
