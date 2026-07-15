'use client';

import { useState, useEffect, useMemo } from 'react';
import { db, storage } from '@/lib/firebase';
import { collection, onSnapshot, addDoc, updateDoc, deleteDoc, doc, serverTimestamp, query, orderBy } from 'firebase/firestore';
import { ref, uploadBytes, getDownloadURL, deleteObject } from 'firebase/storage';
import { PlusCircle, Search, Pencil, Trash2, ArrowLeft, LoaderCircle, CheckCircle2, AlertCircle, X } from 'lucide-react';
import ImageUploader from '@/components/dashboard/ImageUploader';
import EntityLinker from '@/components/dashboard/EntityLinker';
import StoryEditor from '@/components/StoryEditor';

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

/**
 * config: {
 *   title, collectionName, orderField (optional),
 *   fields: [{ name, label, type: 'text'|'textarea'|'url'|'select'|'image', options?, placeholder?, imageField? }],
 *   listPrimary: fieldName (main text in list),
 *   listSecondary: fieldName (subtitle),
 *   listImage: fieldName (thumbnail),
 * }
 */
export default function CrudManager({ config }) {
  const { title, collectionName, orderField, fields, listPrimary, listSecondary, listImage } = config;
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [view, setView] = useState('list');
  const [editing, setEditing] = useState(null);
  const [form, setForm] = useState({});
  const [previews, setPreviews] = useState({});
  const [search, setSearch] = useState('');
  const [busy, setBusy] = useState(false);
  const [toast, setToast] = useState(null);
  const [confirmDelete, setConfirmDelete] = useState(null);

  useEffect(() => {
    const ref2 = collection(db, collectionName);
    const q = orderField ? query(ref2, orderBy(orderField, 'desc')) : ref2;
    const unsub = onSnapshot(
      q,
      (snap) => { setItems(snap.docs.map((d) => ({ id: d.id, ...d.data() }))); setLoading(false); },
      (err) => { console.error(`${collectionName} snapshot`, err); setLoading(false); }
    );
    return () => unsub();
  }, [collectionName, orderField]);

  const notify = (type, message) => setToast({ type, message });

  const emptyForm = useMemo(() => {
    const f = {};
    fields.forEach((fld) => {
      if (fld.type === 'select') f[fld.name] = fld.options?.[0] || '';
      else if (fld.type === 'entities') f[fld.name] = [];
      else f[fld.name] = '';
    });
    return f;
  }, [fields]);

  const openNew = () => { setEditing(null); setForm(emptyForm); setPreviews({}); setView('form'); };
  const openEdit = (item) => {
    setEditing(item);
    setForm(item);
    const p = {};
    fields.filter((f) => f.type === 'image').forEach((f) => { p[f.name] = item[f.name] || ''; });
    setPreviews(p);
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

  const handleSave = async () => {
    // Required check: first field is treated as required.
    if (!form[fields[0].name]) { notify('error', `${fields[0].label} is required.`); return; }
    setBusy(true);
    try {
      const payload = { ...form };
      // Upload any image fields that are Blobs.
      for (const fld of fields.filter((f) => f.type === 'image')) {
        payload[fld.name] = await uploadIfFile(form[fld.name], `${collectionName}/${fld.name}_${Date.now()}`);
      }
      const { id, ...clean } = payload;
      if (editing) {
        await updateDoc(doc(db, collectionName, editing.id), { ...clean, updatedAt: serverTimestamp() });
        notify('success', `${title} updated.`);
      } else {
        await addDoc(collection(db, collectionName), { ...clean, createdAt: serverTimestamp() });
        notify('success', `${title} added.`);
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
      for (const fld of fields.filter((f) => f.type === 'image')) {
        const url = item[fld.name];
        if (url && typeof url === 'string' && url.includes('firebasestorage.googleapis.com')) {
          try { await deleteObject(ref(storage, url)); } catch (e) { console.warn('img delete skipped', e); }
        }
      }
      await deleteDoc(doc(db, collectionName, item.id));
      notify('success', `${title} deleted.`);
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
        <h1 className="text-2xl font-bold mb-6">{editing ? `Edit ${title}` : `Add ${title}`}</h1>
        <div className="bg-[#0A0A0A] border border-gray-800 rounded-2xl p-6 space-y-5">
          {fields.map((fld) => (
            <div key={fld.name}>
              {fld.type !== 'image' && <label className="block text-sm font-medium text-gray-300 mb-2">{fld.label}</label>}
              {fld.type === 'textarea' ? (
                <textarea value={form[fld.name] || ''} onChange={(e) => setForm({ ...form, [fld.name]: e.target.value })} rows={3} placeholder={fld.placeholder} className="w-full px-4 py-3 bg-black/40 border border-gray-800 rounded-lg text-white placeholder-gray-600 focus:outline-none focus:border-yellow-500 resize-none" />
              ) : fld.type === 'select' ? (
                <select value={form[fld.name] || ''} onChange={(e) => setForm({ ...form, [fld.name]: e.target.value })} className="w-full px-4 py-3 bg-black/40 border border-gray-800 rounded-lg text-white focus:outline-none focus:border-yellow-500">
                  {fld.options.map((o) => <option key={o} value={o}>{o}</option>)}
                </select>
              ) : fld.type === 'image' ? (
                <ImageUploader label={fld.label} value={form[fld.name]} preview={previews[fld.name]} aspect={fld.aspect || 'aspect-video'} onChange={(val, prev) => { setForm({ ...form, [fld.name]: val }); setPreviews({ ...previews, [fld.name]: prev }); }} />
              ) : fld.type === 'entities' ? (
                <EntityLinker value={form[fld.name] || []} onChange={(vals) => setForm({ ...form, [fld.name]: vals })} />
              ) : fld.type === 'richtext' ? (
                <StoryEditor value={form[fld.name] || ''} onChange={(html) => setForm({ ...form, [fld.name]: html })} dark />
              ) : (
                <input type={fld.type === 'url' ? 'url' : 'text'} value={form[fld.name] || ''} onChange={(e) => setForm({ ...form, [fld.name]: e.target.value })} placeholder={fld.placeholder} className="w-full px-4 py-3 bg-black/40 border border-gray-800 rounded-lg text-white placeholder-gray-600 focus:outline-none focus:border-yellow-500" />
              )}
            </div>
          ))}
          <div className="flex gap-3 pt-2">
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
          <h1 className="text-2xl font-bold">{title}</h1>
          <p className="text-gray-400 text-sm mt-1">{items.length} {items.length === 1 ? 'item' : 'items'}</p>
        </div>
        <button onClick={openNew} className="inline-flex items-center gap-2 px-5 py-3 bg-yellow-500 text-black font-bold rounded-xl hover:bg-yellow-400 transition-colors self-start">
          <PlusCircle size={18} /> Add {title}
        </button>
      </div>

      <div className="relative mb-6">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500" size={18} />
        <input value={search} onChange={(e) => setSearch(e.target.value)} placeholder="Search…" className="w-full pl-10 pr-4 py-2.5 bg-[#0A0A0A] border border-gray-800 rounded-lg text-white placeholder-gray-600 focus:outline-none focus:border-yellow-500" />
      </div>

      {loading ? (
        <div className="flex items-center justify-center py-20"><LoaderCircle className="animate-spin text-yellow-500" size={28} /></div>
      ) : filtered.length === 0 ? (
        <div className="text-center py-20 bg-[#0A0A0A] border border-gray-800 rounded-2xl"><p className="text-gray-400">No items yet.</p></div>
      ) : (
        <div className="space-y-3">
          {filtered.map((item) => (
            <div key={item.id} className="flex items-center gap-4 bg-[#0A0A0A] border border-gray-800 rounded-xl p-3 hover:border-gray-700 transition-colors">
              {listImage && (
                <div className="w-14 h-14 rounded-lg overflow-hidden flex-shrink-0 bg-gray-900">
                  {item[listImage] ? (
                    /* eslint-disable-next-line @next/next/no-img-element */
                    <img src={item[listImage]} alt="" className="w-full h-full object-cover" />
                  ) : null}
                </div>
              )}
              <div className="flex-1 min-w-0">
                <h3 className="font-semibold text-white truncate">{item[listPrimary] || '(untitled)'}</h3>
                {listSecondary && <p className="text-xs text-gray-500 truncate">{item[listSecondary]}</p>}
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
            <h3 className="text-lg font-bold mb-2">Delete this item?</h3>
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
