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
  const hasCover = Boolean(entity.coverImage);
  const hasLogo = Boolean(entity.logo);

  return (
    <div className="group flex flex-col bg-[#0A0A0A] border border-white/5 overflow-hidden hover:border-yellow-500/50 transition-colors duration-300">
      <Link href={`/directory/${entity.slug}`} className="block">
        <div className="relative h-[190px] overflow-hidden bg-gradient-to-br from-gray-900 to-black">
          {hasCover ? (
            <>
              <Image
                src={entity.coverImage}
                alt={entity.name}
                fill
                sizes="(min-width: 1024px) 33vw, (min-width: 640px) 50vw, 100vw"
                className="object-cover opacity-90 group-hover:opacity-100 group-hover:scale-105 transition-all duration-500"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/85 via-black/10 to-transparent" />
            </>
          ) : hasLogo ? (
            <div className="absolute inset-0 flex items-center justify-center p-10">
              <div className="relative w-full h-full">
                <Image src={entity.logo} alt={entity.name} fill sizes="240px" className="object-contain opacity-90" />
              </div>
            </div>
          ) : (
            <div className="absolute inset-0 flex items-center justify-center">
              <span className="font-black text-6xl text-white/10">{entity.name?.[0] || '?'}</span>
            </div>
          )}

          <span className="absolute top-3 right-3 max-w-[65%] px-2.5 py-1 bg-black/70 backdrop-blur-sm rounded-full text-[10px] font-semibold text-gray-200 uppercase tracking-wide truncate">
            {entityTypeLabel(entity.type)}
          </span>

          {hasCover && hasLogo && (
            <div className="absolute -bottom-8 left-5 w-20 h-20 rounded-xl bg-[#161616] border-4 border-[#0A0A0A] overflow-hidden flex items-center justify-center">
              <div className="relative w-full h-full">
                <Image src={entity.logo} alt="" fill sizes="80px" className="object-contain p-2" />
              </div>
            </div>
          )}
        </div>
      </Link>

      <div className={`p-5 flex flex-col flex-grow ${hasCover && hasLogo ? 'pt-11' : ''}`}>
        <h3 className="font-bold text-white text-lg mb-1 truncate">{entity.name}</h3>
        {entity.country && <p className="text-xs text-gray-500 mb-3">{entity.country}</p>}

        <div className="mb-3">
          {top ? (
            <span className="inline-flex items-center gap-1.5 text-xs font-semibold text-yellow-500">
              <CheckCircle2 size={13} /> {badgeLabel(top.level)}
              {rest.length > 0 && <span className="text-gray-500 font-normal">+{rest.length}</span>}
            </span>
          ) : (
            <span className="text-xs font-semibold text-gray-500">Not yet verified</span>
          )}
        </div>
        {entity.description && (
          <p className="text-sm text-gray-400 leading-relaxed mb-4 line-clamp-3">{entity.description}</p>
        )}

        <div className="mt-auto flex flex-wrap items-center gap-4 pt-3 border-t border-white/5">
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
