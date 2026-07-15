'use client';

import { useState, useMemo } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { Search, CheckCircle2, ArrowUpRight, X } from 'lucide-react';
import { db } from '@/lib/firebase';
import { collection, addDoc, serverTimestamp } from 'firebase/firestore';
import {
  ENTITY_TYPES, ENTITY_COUNTRIES, BADGE_LEVELS, entityTypeLabel, badgeLabel, summarizeBadges,
} from '@/lib/entityTypes';

const UNSPECIFIED_COUNTRY = 'Unspecified / Pan-African';

export default function DirectoryExplorer({ entities }) {
  const [search, setSearch] = useState('');
  const [country, setCountry] = useState('All');
  const [type, setType] = useState('All');
  const [badgeFilter, setBadgeFilter] = useState('All');
  const [showForm, setShowForm] = useState(false);

  const countries = useMemo(() => {
    const set = new Set(entities.map((e) => e.country || UNSPECIFIED_COUNTRY));
    return ['All', ...Array.from(set).sort()];
  }, [entities]);

  const filtered = useMemo(() => {
    const s = search.trim().toLowerCase();
    return entities.filter((e) => {
      const matchesSearch = !s || e.name?.toLowerCase().includes(s) || e.description?.toLowerCase().includes(s);
      const matchesCountry = country === 'All' || (e.country || UNSPECIFIED_COUNTRY) === country;
      const matchesType = type === 'All' || e.type === type;
      const matchesBadge = badgeFilter === 'All' || (e.badges || []).some((b) => b.level === badgeFilter);
      return matchesSearch && matchesCountry && matchesType && matchesBadge;
    });
  }, [entities, search, country, type, badgeFilter]);

  return (
    <div>
      <div className="flex flex-wrap items-center gap-x-6 gap-y-2 mb-8 text-sm text-gray-400">
        <span><span className="text-white font-bold">{entities.length}</span> entities listed</span>
      </div>

      <div className="flex flex-col sm:flex-row gap-3 mb-8">
        <div className="relative flex-1">
          <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500" />
          <input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search the directory…"
            className="w-full pl-9 pr-4 py-2.5 bg-gray-900 border border-gray-800 rounded-lg text-sm text-white placeholder-gray-500 focus:outline-none focus:border-yellow-500"
          />
        </div>
        <select value={country} onChange={(e) => setCountry(e.target.value)} className="px-4 py-2.5 bg-gray-900 border border-gray-800 rounded-lg text-sm text-white focus:outline-none focus:border-yellow-500">
          {countries.map((c) => <option key={c} value={c}>{c === 'All' ? 'All Countries' : c}</option>)}
        </select>
        <select value={type} onChange={(e) => setType(e.target.value)} className="px-4 py-2.5 bg-gray-900 border border-gray-800 rounded-lg text-sm text-white focus:outline-none focus:border-yellow-500">
          <option value="All">All Types</option>
          {ENTITY_TYPES.map((t) => <option key={t.value} value={t.value}>{t.label}</option>)}
        </select>
        <select value={badgeFilter} onChange={(e) => setBadgeFilter(e.target.value)} className="px-4 py-2.5 bg-gray-900 border border-gray-800 rounded-lg text-sm text-white focus:outline-none focus:border-yellow-500">
          <option value="All">Any Verification Level</option>
          {BADGE_LEVELS.map((b) => <option key={b.value} value={b.value}>{b.label}</option>)}
        </select>
      </div>

      {filtered.length === 0 ? (
        <div className="py-16 text-center bg-gray-900/50 border border-gray-800 rounded-xl mb-12">
          <p className="text-gray-400">No entities match your filters.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5 mb-12">
          {filtered.map((e) => (
            <EntityCard key={e.id} entity={e} />
          ))}
        </div>
      )}

      <SubmitEntitySection open={showForm} onToggle={() => setShowForm((v) => !v)} />
    </div>
  );
}

function EntityCard({ entity }) {
  const { top, rest } = summarizeBadges(entity.badges);
  return (
    <div className="flex flex-col bg-gray-900 border border-gray-800 rounded-xl overflow-hidden hover:border-yellow-500/50 transition-colors">
      <Link href={`/directory/${entity.slug}`} className="flex items-center gap-4 p-5 border-b border-gray-800 hover:bg-white/5 transition-colors">
        <div className="relative w-14 h-14 flex-shrink-0 bg-gray-800 border border-gray-700 rounded-lg overflow-hidden">
          {entity.logo && (
            <Image src={entity.logo} alt={entity.name} fill sizes="56px" className="object-contain p-1.5" />
          )}
        </div>
        <div className="min-w-0">
          <h3 className="font-bold text-white truncate">{entity.name}</h3>
          <div className="flex flex-wrap gap-1.5 mt-1">
            <span className="text-[10px] text-gray-400 bg-gray-800 px-2 py-0.5 rounded-full">{entityTypeLabel(entity.type)}</span>
            {entity.country && <span className="text-[10px] text-gray-400 bg-gray-800 px-2 py-0.5 rounded-full">{entity.country}</span>}
          </div>
        </div>
      </Link>

      <div className="p-5 flex flex-col flex-grow">
        <div className="mb-3">
          {top ? (
            <span className="inline-flex items-center gap-1.5 text-xs font-semibold text-yellow-500">
              <CheckCircle2 size={13} /> {badgeLabel(top.level)}
              {rest.length > 0 && <span className="text-gray-500 font-normal">+{rest.length}</span>}
            </span>
          ) : (
            <span className="text-xs font-semibold text-gray-500">No badges yet</span>
          )}
        </div>
        {entity.description && (
          <p className="text-sm text-gray-400 leading-relaxed mb-4 line-clamp-3">{entity.description}</p>
        )}

        <div className="mt-auto flex flex-wrap items-center gap-4 pt-3">
          <Link href={`/directory/${entity.slug}`} className="inline-flex items-center gap-1 text-sm font-semibold text-yellow-500 hover:text-yellow-400 transition-colors">
            View profile <ArrowUpRight size={14} />
          </Link>
          {entity.website && (
            <a href={entity.website} target="_blank" rel="noopener noreferrer" className="inline-flex items-center gap-1 text-sm font-semibold text-white hover:text-yellow-500 transition-colors">
              Visit <ArrowUpRight size={14} />
            </a>
          )}
        </div>
      </div>
    </div>
  );
}

function SubmitEntitySection({ open, onToggle }) {
  const [form, setForm] = useState({
    name: '', type: ENTITY_TYPES[0].value, country: '', city: '', website: '', logo: '', description: '', contactEmail: '',
  });
  const [busy, setBusy] = useState(false);
  const [notice, setNotice] = useState('');

  const handleChange = (field) => (e) => setForm((prev) => ({ ...prev, [field]: e.target.value }));

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!form.name.trim() || !form.description.trim()) return;
    setBusy(true);
    setNotice('');
    try {
      await addDoc(collection(db, 'submittedEntities'), {
        ...form,
        submittedAt: serverTimestamp(),
      });
      setNotice("Thanks! Our team will review this and reach out if we'd like to feature it.");
      setForm({ name: '', type: ENTITY_TYPES[0].value, country: '', city: '', website: '', logo: '', description: '', contactEmail: '' });
    } catch (err) {
      console.error('Entity submission error:', err);
      setNotice('Something went wrong. Please try again.');
    } finally {
      setBusy(false);
    }
  };

  return (
    <div className="border-t border-gray-800 pt-10">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-6">
        <div>
          <h2 className="text-xl font-bold text-white mb-1">Don&rsquo;t see it in the directory?</h2>
          <p className="text-gray-400 text-sm max-w-xl">
            Tell us your story. Every submission joins our coverage queue — badges get added as our
            reporters actually verify, interview, or visit.
          </p>
        </div>
        <button
          type="button"
          onClick={onToggle}
          className="flex-shrink-0 inline-flex items-center gap-2 px-5 py-3 bg-yellow-500 text-black font-bold rounded-lg hover:bg-yellow-400 transition-colors"
        >
          {open ? (<>Close <X size={16} /></>) : 'Tell Us Your Story'}
        </button>
      </div>

      {open && (
        <form onSubmit={handleSubmit} className="bg-gray-900 border border-gray-800 rounded-xl p-6 space-y-4">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-gray-400 mb-1.5">Name *</label>
              <input required value={form.name} onChange={handleChange('name')} placeholder="e.g. Bitcoin Ikorodu" className="w-full px-4 py-2.5 bg-black/40 border border-gray-800 rounded-lg text-white placeholder-gray-600 focus:outline-none focus:border-yellow-500" />
            </div>
            <div>
              <label className="block text-xs font-semibold text-gray-400 mb-1.5">Type</label>
              <select value={form.type} onChange={handleChange('type')} className="w-full px-4 py-2.5 bg-black/40 border border-gray-800 rounded-lg text-white focus:outline-none focus:border-yellow-500">
                {ENTITY_TYPES.map((t) => <option key={t.value} value={t.value}>{t.label}</option>)}
              </select>
            </div>
            <div>
              <label className="block text-xs font-semibold text-gray-400 mb-1.5">Country</label>
              <select value={form.country} onChange={handleChange('country')} className="w-full px-4 py-2.5 bg-black/40 border border-gray-800 rounded-lg text-white focus:outline-none focus:border-yellow-500">
                <option value="">Select…</option>
                {ENTITY_COUNTRIES.map((c) => <option key={c} value={c}>{c}</option>)}
              </select>
            </div>
            <div>
              <label className="block text-xs font-semibold text-gray-400 mb-1.5">Website / Social Link</label>
              <input type="url" value={form.website} onChange={handleChange('website')} placeholder="https://…" className="w-full px-4 py-2.5 bg-black/40 border border-gray-800 rounded-lg text-white placeholder-gray-600 focus:outline-none focus:border-yellow-500" />
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold text-gray-400 mb-1.5">Logo URL (optional)</label>
            <input type="url" value={form.logo} onChange={handleChange('logo')} placeholder="https://…/logo.png" className="w-full px-4 py-2.5 bg-black/40 border border-gray-800 rounded-lg text-white placeholder-gray-600 focus:outline-none focus:border-yellow-500" />
          </div>

          <div>
            <label className="block text-xs font-semibold text-gray-400 mb-1.5">Tell us the story *</label>
            <textarea required rows={4} value={form.description} onChange={handleChange('description')} placeholder="What is it, and what makes it worth our reporters' time?" className="w-full px-4 py-2.5 bg-black/40 border border-gray-800 rounded-lg text-white placeholder-gray-600 focus:outline-none focus:border-yellow-500 resize-none" />
          </div>

          <div>
            <label className="block text-xs font-semibold text-gray-400 mb-1.5">Contact Email (so we can reach out)</label>
            <input type="email" value={form.contactEmail} onChange={handleChange('contactEmail')} placeholder="you@example.com" className="w-full px-4 py-2.5 bg-black/40 border border-gray-800 rounded-lg text-white placeholder-gray-600 focus:outline-none focus:border-yellow-500" />
          </div>

          <button type="submit" disabled={busy} className="w-full sm:w-auto px-6 py-3 bg-yellow-500 text-black font-bold rounded-lg hover:bg-yellow-400 transition-colors disabled:opacity-50">
            {busy ? 'Submitting…' : 'Submit'}
          </button>
          {notice && <p className="text-sm text-yellow-400">{notice}</p>}
        </form>
      )}
    </div>
  );
}
