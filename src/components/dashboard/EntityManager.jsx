'use client';

import { useState, useEffect, useMemo } from 'react';
import { db, storage } from '@/lib/firebase';
import { collection, onSnapshot, addDoc, updateDoc, deleteDoc, doc, serverTimestamp } from 'firebase/firestore';
import { ref, uploadBytes, getDownloadURL, deleteObject } from 'firebase/storage';
import {
  PlusCircle, Search, Pencil, Trash2, ArrowLeft, LoaderCircle,
  CheckCircle2, AlertCircle, X, Plus,
} from 'lucide-react';
import ImageUploader from '@/components/dashboard/ImageUploader';
import {
  ENTITY_TYPES, ENTITY_COUNTRIES, BADGE_LEVELS, COVERAGE_TYPES, entityTypeLabel, badgeLabel,
} from '@/lib/entityTypes';
import { slugifyEntity } from '@/lib/entities';

const ENTITIES_COLLECTION = 'entities';

const EMPTY_FORM = {
  name: '', slug: '', type: ENTITY_TYPES[0].value, description: '',
  country: '', city: '', website: '', twitter: '', linkedin: '', telegram: '',
  contactEmail: '', yearFounded: '', bitcoinFocus: '', founder: '',
  logo: '', coverImage: '', tags: '', featured: false,
  relatedSlugs: '', badges: [], externalCoverage: [],
};

function Toast({ toast, onClose }) {
  useEffect(() => {
    if (!toast) return;
    const t = setTimeout(onClose, 3500);
    return () => clearTimeout(t);
  }, [toast, onClose]);
  if (!toast) return null;
  const isError = toast.type === 'error';
  return (
    <div className={`fixed bottom-6 right-6 z-[60] flex items-center gap-3 px-5 py-3 rounded-xl border shadow-2xl ${isError ? 'bg-red-950 border-red-800 text-red-200' : 'bg-green-950 border-green-800 text-green-200'}`}>
      {isError ? <AlertCircle size={18} /> : <CheckCircle2 size={18} />}
      <span className="text-sm font-medium">{toast.message}</span>
    </div>
  );
}

function Field({ label, children }) {
  return (
    <div>
      <label className="block text-sm font-medium text-gray-300 mb-2">{label}</label>
      {children}
    </div>
  );
}

const inputClass = 'w-full px-4 py-3 bg-black/40 border border-gray-800 rounded-lg text-white placeholder-gray-600 focus:outline-none focus:border-yellow-500';

export default function EntityManager() {
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [view, setView] = useState('list');
  const [editing, setEditing] = useState(null);
  const [form, setForm] = useState(EMPTY_FORM);
  const [logoPreview, setLogoPreview] = useState('');
  const [coverPreview, setCoverPreview] = useState('');
  const [search, setSearch] = useState('');
  const [busy, setBusy] = useState(false);
  const [toast, setToast] = useState(null);
  const [confirmDelete, setConfirmDelete] = useState(null);

  const [badgeDraft, setBadgeDraft] = useState({ level: BADGE_LEVELS[BADGE_LEVELS.length - 1].value, dateEarned: '', evidence: '' });
  const [coverageDraft, setCoverageDraft] = useState({ type: COVERAGE_TYPES[0], title: '', url: '', date: '' });

  useEffect(() => {
    const unsub = onSnapshot(
      collection(db, ENTITIES_COLLECTION),
      (snap) => { setItems(snap.docs.map((d) => ({ id: d.id, ...d.data() }))); setLoading(false); },
      (err) => { console.error('entities snapshot', err); setLoading(false); }
    );
    return () => unsub();
  }, []);

  const notify = (type, message) => setToast({ type, message });

  const openNew = () => {
    setEditing(null);
    setForm(EMPTY_FORM);
    setLogoPreview('');
    setCoverPreview('');
    setBadgeDraft({ level: BADGE_LEVELS[BADGE_LEVELS.length - 1].value, dateEarned: '', evidence: '' });
    setCoverageDraft({ type: COVERAGE_TYPES[0], title: '', url: '', date: '' });
    setView('form');
  };

  const openEdit = (item) => {
    setEditing(item);
    setForm({
      ...EMPTY_FORM,
      ...item,
      twitter: item.socialLinks?.twitter || '',
      linkedin: item.socialLinks?.linkedin || '',
      telegram: item.socialLinks?.telegram || '',
      tags: Array.isArray(item.tags) ? item.tags.join(', ') : (item.tags || ''),
      relatedSlugs: Array.isArray(item.relatedEntityIds) ? item.relatedEntityIds.join(', ') : '',
      badges: item.badges || [],
      externalCoverage: item.externalCoverage || [],
    });
    setLogoPreview(item.logo || '');
    setCoverPreview(item.coverImage || '');
    setView('form');
  };

  const backToList = () => { setView('list'); setEditing(null); };

  const filtered = useMemo(() => {
    if (!search) return items;
    const s = search.toLowerCase();
    return items.filter((it) => JSON.stringify(it).toLowerCase().includes(s));
  }, [items, search]);

  const uploadIfFile = async (val, path) => {
    if (val instanceof Blob) {
      const sref = ref(storage, path);
      await uploadBytes(sref, val);
      return await getDownloadURL(sref);
    }
    return val;
  };

  const addBadge = () => {
    if (!badgeDraft.dateEarned) { notify('error', 'Set a date earned for this badge.'); return; }
    setForm((f) => ({ ...f, badges: [...f.badges, { ...badgeDraft }] }));
    setBadgeDraft({ level: BADGE_LEVELS[BADGE_LEVELS.length - 1].value, dateEarned: '', evidence: '' });
  };
  const removeBadge = (i) => setForm((f) => ({ ...f, badges: f.badges.filter((_, idx) => idx !== i) }));

  const addCoverage = () => {
    if (!coverageDraft.title || !coverageDraft.url) { notify('error', 'Coverage needs a title and a link.'); return; }
    setForm((f) => ({ ...f, externalCoverage: [...f.externalCoverage, { ...coverageDraft }] }));
    setCoverageDraft({ type: COVERAGE_TYPES[0], title: '', url: '', date: '' });
  };
  const removeCoverage = (i) => setForm((f) => ({ ...f, externalCoverage: f.externalCoverage.filter((_, idx) => idx !== i) }));

  const handleSave = async () => {
    if (!form.name.trim()) { notify('error', 'Name is required.'); return; }
    setBusy(true);
    try {
      const logoUrl = await uploadIfFile(form.logo, `${ENTITIES_COLLECTION}/logo_${Date.now()}`);
      const coverUrl = await uploadIfFile(form.coverImage, `${ENTITIES_COLLECTION}/cover_${Date.now()}`);
      const slug = editing?.slug || slugifyEntity(form.name);
      const payload = {
        name: form.name,
        slug,
        type: form.type,
        description: form.description,
        country: form.country,
        city: form.city,
        website: form.website,
        socialLinks: { twitter: form.twitter, linkedin: form.linkedin, telegram: form.telegram },
        contactEmail: form.contactEmail,
        yearFounded: form.yearFounded,
        bitcoinFocus: form.bitcoinFocus,
        founder: form.founder,
        logo: logoUrl,
        coverImage: coverUrl,
        tags: form.tags.split(',').map((t) => t.trim()).filter(Boolean),
        featured: !!form.featured,
        relatedEntityIds: form.relatedSlugs.split(',').map((t) => t.trim()).filter(Boolean),
        badges: form.badges,
        externalCoverage: form.externalCoverage,
      };
      if (editing) {
        await updateDoc(doc(db, ENTITIES_COLLECTION, editing.id), { ...payload, updatedAt: serverTimestamp() });
        notify('success', 'Entity updated.');
      } else {
        await addDoc(collection(db, ENTITIES_COLLECTION), { ...payload, createdAt: serverTimestamp() });
        notify('success', 'Entity added.');
      }
      backToList();
    } catch (err) {
      console.error('save error', err);
      notify('error', 'Save failed. Please try again.');
    } finally {
      setBusy(false);
    }
  };

  const doDelete = async (item) => {
    setConfirmDelete(null);
    try {
      for (const url of [item.logo, item.coverImage]) {
        if (url && typeof url === 'string' && url.includes('firebasestorage.googleapis.com')) {
          try { await deleteObject(ref(storage, url)); } catch (e) { console.warn('img delete skipped', e); }
        }
      }
      await deleteDoc(doc(db, ENTITIES_COLLECTION, item.id));
      notify('success', 'Entity deleted.');
    } catch (err) {
      notify('error', 'Delete failed.');
    }
  };

  if (view === 'form') {
    return (
      <div className="max-w-3xl">
        <button onClick={backToList} className="flex items-center gap-2 text-gray-400 hover:text-white mb-6 text-sm">
          <ArrowLeft size={16} /> Back
        </button>
        <h1 className="text-2xl font-bold mb-6">{editing ? 'Edit Entity' : 'Add Entity'}</h1>
        <div className="bg-[#0A0A0A] border border-gray-800 rounded-2xl p-6 space-y-5">

          <Field label="Name">
            <input className={inputClass} value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} placeholder="e.g. Bitcoin Ikorodu" />
            {!editing && form.name && <p className="text-xs text-gray-500 mt-1.5">Slug: /directory/{slugifyEntity(form.name)}</p>}
          </Field>

          <Field label="Type">
            <select className={inputClass} value={form.type} onChange={(e) => setForm({ ...form, type: e.target.value })}>
              {ENTITY_TYPES.map((t) => <option key={t.value} value={t.value}>{t.label}</option>)}
            </select>
          </Field>

          <Field label="Description">
            <textarea rows={3} className={`${inputClass} resize-none`} value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })} placeholder="What do they do?" />
          </Field>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
            <Field label="Country">
              <select className={inputClass} value={form.country} onChange={(e) => setForm({ ...form, country: e.target.value })}>
                <option value="">Select…</option>
                {ENTITY_COUNTRIES.map((c) => <option key={c} value={c}>{c}</option>)}
              </select>
            </Field>
            <Field label="City (optional)">
              <input className={inputClass} value={form.city} onChange={(e) => setForm({ ...form, city: e.target.value })} placeholder="e.g. Lagos" />
            </Field>
            <Field label="Website">
              <input type="url" className={inputClass} value={form.website} onChange={(e) => setForm({ ...form, website: e.target.value })} placeholder="https://…" />
            </Field>
            <Field label="Year founded">
              <input className={inputClass} value={form.yearFounded} onChange={(e) => setForm({ ...form, yearFounded: e.target.value })} placeholder="e.g. 2023" />
            </Field>
            <Field label="X / Twitter">
              <input className={inputClass} value={form.twitter} onChange={(e) => setForm({ ...form, twitter: e.target.value })} placeholder="https://x.com/…" />
            </Field>
            <Field label="LinkedIn">
              <input className={inputClass} value={form.linkedin} onChange={(e) => setForm({ ...form, linkedin: e.target.value })} placeholder="https://linkedin.com/…" />
            </Field>
            <Field label="Telegram">
              <input className={inputClass} value={form.telegram} onChange={(e) => setForm({ ...form, telegram: e.target.value })} placeholder="https://t.me/…" />
            </Field>
            <Field label="Public contact email (optional)">
              <input type="email" className={inputClass} value={form.contactEmail} onChange={(e) => setForm({ ...form, contactEmail: e.target.value })} placeholder="hello@org.com" />
            </Field>
            <Field label="Bitcoin focus">
              <input className={inputClass} value={form.bitcoinFocus} onChange={(e) => setForm({ ...form, bitcoinFocus: e.target.value })} placeholder="e.g. Merchant adoption" />
            </Field>
            <Field label="Founder (optional)">
              <input className={inputClass} value={form.founder} onChange={(e) => setForm({ ...form, founder: e.target.value })} placeholder="e.g. Nena Soro" />
            </Field>
          </div>

          <Field label="Tags (comma separated)">
            <input className={inputClass} value={form.tags} onChange={(e) => setForm({ ...form, tags: e.target.value })} placeholder="lightning, merchants, education" />
          </Field>

          <Field label="Related entities (comma separated slugs, optional)">
            <input className={inputClass} value={form.relatedSlugs} onChange={(e) => setForm({ ...form, relatedSlugs: e.target.value })} placeholder="machankura, nena-soro" />
          </Field>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">Logo</label>
              <ImageUploader value={form.logo} preview={logoPreview} aspect="aspect-square" onChange={(val, prev) => { setForm({ ...form, logo: val }); setLogoPreview(prev); }} />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">Cover image (optional)</label>
              <ImageUploader value={form.coverImage} preview={coverPreview} aspect="aspect-video" onChange={(val, prev) => { setForm({ ...form, coverImage: val }); setCoverPreview(prev); }} />
            </div>
          </div>

          <Field label="Featured on homepage">
            <select className={inputClass} value={form.featured ? 'yes' : 'no'} onChange={(e) => setForm({ ...form, featured: e.target.value === 'yes' })}>
              <option value="no">No</option>
              <option value="yes">Yes</option>
            </select>
          </Field>

          {/* Badges — additive, not a ladder. Each one records when and why it was earned. */}
          <div className="pt-2 border-t border-gray-800">
            <p className="text-sm font-semibold text-white mb-1 mt-4">Trust badges</p>
            <p className="text-xs text-gray-500 mb-3">Badges are independent — add every one this entity has actually earned.</p>
            {form.badges.length > 0 && (
              <div className="space-y-2 mb-3">
                {form.badges.map((b, i) => (
                  <div key={i} className="flex items-center gap-3 bg-black/30 border border-gray-800 rounded-lg px-3 py-2">
                    <span className="text-sm text-white flex-1">{badgeLabel(b.level)}</span>
                    <span className="text-xs text-gray-500">{b.dateEarned}</span>
                    {b.evidence && <span className="text-xs text-gray-500 truncate max-w-[140px]">{b.evidence}</span>}
                    <button onClick={() => removeBadge(i)} className="text-gray-500 hover:text-red-400"><X size={14} /></button>
                  </div>
                ))}
              </div>
            )}
            <div className="grid grid-cols-1 sm:grid-cols-[1fr_1fr_1fr_auto] gap-2">
              <select className={inputClass} value={badgeDraft.level} onChange={(e) => setBadgeDraft({ ...badgeDraft, level: e.target.value })}>
                {BADGE_LEVELS.map((b) => <option key={b.value} value={b.value}>{b.label}</option>)}
              </select>
              <input type="date" className={inputClass} value={badgeDraft.dateEarned} onChange={(e) => setBadgeDraft({ ...badgeDraft, dateEarned: e.target.value })} />
              <input className={inputClass} value={badgeDraft.evidence} onChange={(e) => setBadgeDraft({ ...badgeDraft, evidence: e.target.value })} placeholder="Evidence (optional)" />
              <button onClick={addBadge} className="px-4 py-3 bg-white/5 border border-gray-800 rounded-lg hover:bg-white/10 flex items-center justify-center"><Plus size={16} /></button>
            </div>
          </div>

          {/* External coverage — third-party interviews, reports, videos. BAS's own articles/podcasts link automatically. */}
          <div className="pt-2 border-t border-gray-800">
            <p className="text-sm font-semibold text-white mb-1 mt-4">External coverage</p>
            <p className="text-xs text-gray-500 mb-3">Third-party interviews, videos, or reports. BAS&rsquo;s own articles and podcasts link here automatically once published.</p>
            {form.externalCoverage.length > 0 && (
              <div className="space-y-2 mb-3">
                {form.externalCoverage.map((c, i) => (
                  <div key={i} className="flex items-center gap-3 bg-black/30 border border-gray-800 rounded-lg px-3 py-2">
                    <span className="text-xs text-yellow-500 flex-shrink-0">{c.type}</span>
                    <span className="text-sm text-white flex-1 truncate">{c.title}</span>
                    <span className="text-xs text-gray-500">{c.date}</span>
                    <button onClick={() => removeCoverage(i)} className="text-gray-500 hover:text-red-400"><X size={14} /></button>
                  </div>
                ))}
              </div>
            )}
            <div className="grid grid-cols-1 sm:grid-cols-[1fr_1fr_1fr_1fr_auto] gap-2">
              <select className={inputClass} value={coverageDraft.type} onChange={(e) => setCoverageDraft({ ...coverageDraft, type: e.target.value })}>
                {COVERAGE_TYPES.map((t) => <option key={t} value={t}>{t}</option>)}
              </select>
              <input className={inputClass} value={coverageDraft.title} onChange={(e) => setCoverageDraft({ ...coverageDraft, title: e.target.value })} placeholder="Title" />
              <input className={inputClass} value={coverageDraft.url} onChange={(e) => setCoverageDraft({ ...coverageDraft, url: e.target.value })} placeholder="URL" />
              <input type="date" className={inputClass} value={coverageDraft.date} onChange={(e) => setCoverageDraft({ ...coverageDraft, date: e.target.value })} />
              <button onClick={addCoverage} className="px-4 py-3 bg-white/5 border border-gray-800 rounded-lg hover:bg-white/10 flex items-center justify-center"><Plus size={16} /></button>
            </div>
          </div>

          <div className="flex gap-3 pt-4">
            <button onClick={handleSave} disabled={busy} className="flex-1 flex items-center justify-center gap-2 px-6 py-3 bg-yellow-500 text-black font-bold rounded-lg hover:bg-yellow-400 transition-colors disabled:opacity-50">
              {busy ? <LoaderCircle className="animate-spin" size={18} /> : null}
              {editing ? 'Update' : 'Add'}
            </button>
            <button onClick={backToList} className="px-6 py-3 bg-white/5 border border-gray-800 rounded-lg hover:bg-white/10 transition-colors">Cancel</button>
          </div>
        </div>
        <Toast toast={toast} onClose={() => setToast(null)} />
      </div>
    );
  }

  return (
    <div>
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 mb-8">
        <div>
          <h1 className="text-2xl font-bold">Directory</h1>
          <p className="text-gray-400 text-sm mt-1">{items.length} {items.length === 1 ? 'entity' : 'entities'}</p>
        </div>
        <button onClick={openNew} className="inline-flex items-center gap-2 px-5 py-3 bg-yellow-500 text-black font-bold rounded-xl hover:bg-yellow-400 transition-colors self-start">
          <PlusCircle size={18} /> Add Entity
        </button>
      </div>

      <div className="relative mb-6">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500" size={18} />
        <input value={search} onChange={(e) => setSearch(e.target.value)} placeholder="Search…" className="w-full pl-10 pr-4 py-2.5 bg-[#0A0A0A] border border-gray-800 rounded-lg text-white placeholder-gray-600 focus:outline-none focus:border-yellow-500" />
      </div>

      {loading ? (
        <div className="flex items-center justify-center py-20"><LoaderCircle className="animate-spin text-yellow-500" size={28} /></div>
      ) : filtered.length === 0 ? (
        <div className="text-center py-20 bg-[#0A0A0A] border border-gray-800 rounded-2xl"><p className="text-gray-400">No entities yet.</p></div>
      ) : (
        <div className="space-y-3">
          {filtered.map((item) => (
            <div key={item.id} className="flex items-center gap-4 bg-[#0A0A0A] border border-gray-800 rounded-xl p-3 hover:border-gray-700 transition-colors">
              <div className="w-14 h-14 rounded-lg overflow-hidden flex-shrink-0 bg-gray-900">
                {item.logo ? (
                  /* eslint-disable-next-line @next/next/no-img-element */
                  <img src={item.logo} alt="" className="w-full h-full object-cover" />
                ) : null}
              </div>
              <div className="flex-1 min-w-0">
                <h3 className="font-semibold text-white truncate">{item.name || '(untitled)'}</h3>
                <p className="text-xs text-gray-500 truncate">{entityTypeLabel(item.type)} · {item.country || 'No country set'}{item.featured ? ' · Featured' : ''}</p>
              </div>
              <div className="flex items-center gap-1 flex-shrink-0">
                <button onClick={() => openEdit(item)} className="w-9 h-9 rounded-lg flex items-center justify-center text-gray-400 hover:text-yellow-500 hover:bg-white/5 transition-colors"><Pencil size={16} /></button>
                <button onClick={() => setConfirmDelete(item)} className="w-9 h-9 rounded-lg flex items-center justify-center text-gray-400 hover:text-red-400 hover:bg-red-500/5 transition-colors"><Trash2 size={16} /></button>
              </div>
            </div>
          ))}
        </div>
      )}

      {confirmDelete && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm">
          <div className="bg-[#0A0A0A] border border-gray-800 rounded-2xl p-6 max-w-md w-full">
            <h3 className="text-lg font-bold mb-2">Delete this entity?</h3>
            <p className="text-gray-400 text-sm mb-6">This can&rsquo;t be undone.</p>
            <div className="flex gap-3">
              <button onClick={() => doDelete(confirmDelete)} className="flex-1 px-4 py-2.5 bg-red-500 text-white font-bold rounded-lg hover:bg-red-400 transition-colors">Delete</button>
              <button onClick={() => setConfirmDelete(null)} className="flex-1 px-4 py-2.5 bg-white/5 border border-gray-800 rounded-lg hover:bg-white/10 transition-colors">Cancel</button>
            </div>
          </div>
        </div>
      )}

      <Toast toast={toast} onClose={() => setToast(null)} />
    </div>
  );
}
