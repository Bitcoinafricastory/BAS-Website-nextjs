'use client';

import { useState, useEffect, useMemo } from 'react';
import { db, storage } from '@/lib/firebase';
import { collection, onSnapshot, deleteDoc, doc, query, orderBy } from 'firebase/firestore';
import { ref, deleteObject } from 'firebase/storage';
import { PlusCircle, Search, Pencil, Trash2, ArrowLeft, LoaderCircle, CheckCircle2, AlertCircle } from 'lucide-react';
import ArticleEditor from '@/components/dashboard/ArticleEditor';

const STATUS_BADGE = {
  draft: 'text-gray-400 bg-gray-500/10 border-gray-500/30',
  review: 'text-blue-400 bg-blue-500/10 border-blue-500/30',
  scheduled: 'text-purple-400 bg-purple-500/10 border-purple-500/30',
  published: 'text-green-400 bg-green-500/10 border-green-500/30',
  archived: 'text-orange-400 bg-orange-500/10 border-orange-500/30',
};

function Toast({ toast, onClose }) {
  useEffect(() => {
    if (!toast) return;
    const t = setTimeout(onClose, 4000);
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

export default function NewsManager() {
  const [posts, setPosts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [view, setView] = useState('list'); // 'list' | 'editor'
  const [editingPost, setEditingPost] = useState(null);
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [toast, setToast] = useState(null);
  const [confirmDelete, setConfirmDelete] = useState(null);

  useEffect(() => {
    const q = query(collection(db, 'news'), orderBy('createdAt', 'desc'));
    const unsub = onSnapshot(
      q,
      (snap) => {
        setPosts(snap.docs.map((d) => ({ id: d.id, ...d.data() })));
        setLoading(false);
      },
      (err) => {
        console.error('news snapshot error', err);
        setLoading(false);
      }
    );
    return () => unsub();
  }, []);

  const notify = (type, message) => setToast({ type, message });

  const filtered = useMemo(() => {
    return posts.filter((p) => {
      const matchesSearch = !search || (p.title || '').toLowerCase().includes(search.toLowerCase()) || (p.excerpt || '').toLowerCase().includes(search.toLowerCase());
      const matchesStatus = statusFilter === 'all' || (p.status || 'published') === statusFilter;
      return matchesSearch && matchesStatus;
    });
  }, [posts, search, statusFilter]);

  const openNew = () => { setEditingPost(null); setView('editor'); };
  const openEdit = (post) => { setEditingPost(post); setView('editor'); };
  const backToList = () => { setView('list'); setEditingPost(null); };

  const doDelete = async (post) => {
    setConfirmDelete(null);
    try {
      const deleteStorageFile = async (url) => {
        if (url && url.includes('firebasestorage.googleapis.com')) {
          try { await deleteObject(ref(storage, url)); } catch (e) { console.warn('storage delete skipped', e); }
        }
      };
      await deleteStorageFile(post.image);
      await deleteStorageFile(post.authorImage);
      await deleteDoc(doc(db, 'news', post.id));
      notify('success', 'Article deleted.');
    } catch (err) {
      notify('error', 'Delete failed: ' + (err.message || 'unknown'));
    }
  };

  if (view === 'editor') {
    return (
      <div>
        <button onClick={backToList} className="flex items-center gap-2 text-gray-400 hover:text-white mb-6 text-sm">
          <ArrowLeft size={16} /> Back to all articles
        </button>
        <h1 className="text-2xl font-bold mb-6">{editingPost ? 'Edit Article' : 'New Article'}</h1>
        <ArticleEditor editingPost={editingPost} onDone={backToList} onNotify={notify} />
        <Toast toast={toast} onClose={() => setToast(null)} />
      </div>
    );
  }

  return (
    <div>
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 mb-8">
        <div>
          <h1 className="text-2xl font-bold">News &amp; Stories</h1>
          <p className="text-gray-400 text-sm mt-1">{posts.length} articles</p>
        </div>
        <button onClick={openNew} className="inline-flex items-center gap-2 px-5 py-3 bg-yellow-500 text-black font-bold rounded-xl hover:bg-yellow-400 transition-colors self-start">
          <PlusCircle size={18} /> New Article
        </button>
      </div>

      {/* Search + filter */}
      <div className="flex flex-col sm:flex-row gap-3 mb-6">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500" size={18} />
          <input value={search} onChange={(e) => setSearch(e.target.value)} placeholder="Search articles…" className="w-full pl-10 pr-4 py-2.5 bg-[#0A0A0A] border border-gray-800 rounded-lg text-white placeholder-gray-600 focus:outline-none focus:border-yellow-500" />
        </div>
        <select value={statusFilter} onChange={(e) => setStatusFilter(e.target.value)} className="px-4 py-2.5 bg-[#0A0A0A] border border-gray-800 rounded-lg text-white focus:outline-none focus:border-yellow-500 text-sm">
          <option value="all">All statuses</option>
          <option value="draft">Draft</option>
          <option value="review">In Review</option>
          <option value="scheduled">Scheduled</option>
          <option value="published">Published</option>
          <option value="archived">Archived</option>
        </select>
      </div>

      {loading ? (
        <div className="flex items-center justify-center py-20"><LoaderCircle className="animate-spin text-yellow-500" size={28} /></div>
      ) : filtered.length === 0 ? (
        <div className="text-center py-20 bg-[#0A0A0A] border border-gray-800 rounded-2xl">
          <p className="text-gray-400">No articles found.</p>
        </div>
      ) : (
        <div className="space-y-3">
          {filtered.map((post) => (
            <div key={post.id} className="group flex items-center gap-4 bg-[#0A0A0A] border border-gray-800 rounded-xl p-3 hover:border-gray-700 transition-colors">
              <div className="w-16 h-16 rounded-lg overflow-hidden flex-shrink-0 bg-gray-900">
                {post.image ? (
                  /* eslint-disable-next-line @next/next/no-img-element */
                  <img src={post.image} alt="" className="w-full h-full object-cover" />
                ) : null}
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 mb-1">
                  <span className={`inline-block px-2 py-0.5 rounded-full text-[10px] font-semibold border ${STATUS_BADGE[post.status || 'published']}`}>
                    {(post.status || 'published').toUpperCase()}
                  </span>
                  <span className="text-[10px] text-yellow-500 font-semibold uppercase">{post.category}</span>
                </div>
                <h3 className="font-semibold text-white truncate">{post.title}</h3>
                <p className="text-xs text-gray-500 truncate">{post.date} · {post.author}</p>
              </div>
              <div className="flex items-center gap-1 flex-shrink-0">
                <button onClick={() => openEdit(post)} className="w-9 h-9 rounded-lg flex items-center justify-center text-gray-400 hover:text-yellow-500 hover:bg-white/5 transition-colors" title="Edit">
                  <Pencil size={16} />
                </button>
                <button onClick={() => setConfirmDelete(post)} className="w-9 h-9 rounded-lg flex items-center justify-center text-gray-400 hover:text-red-400 hover:bg-red-500/5 transition-colors" title="Delete">
                  <Trash2 size={16} />
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Delete confirmation */}
      {confirmDelete && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm">
          <div className="bg-[#0A0A0A] border border-gray-800 rounded-2xl p-6 max-w-md w-full">
            <h3 className="text-lg font-bold mb-2">Delete article?</h3>
            <p className="text-gray-400 text-sm mb-6">&ldquo;{confirmDelete.title}&rdquo; will be permanently removed, along with its images. This can&rsquo;t be undone.</p>
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
