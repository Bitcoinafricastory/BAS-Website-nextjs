'use client';

import { useState, useEffect, useCallback } from 'react';
import { Save, Eye, X, LoaderCircle, FileText, CheckCircle2, Archive, Clock, Send } from 'lucide-react';
import { db, storage } from '@/lib/firebase';
import { collection, addDoc, updateDoc, doc, serverTimestamp } from 'firebase/firestore';
import { ref, uploadBytes, getDownloadURL } from 'firebase/storage';
import StoryEditor from '@/components/StoryEditor';
import ImageUploader from '@/components/dashboard/ImageUploader';
import SeoPanel from '@/components/dashboard/SeoPanel';
import AiTools from '@/components/dashboard/AiTools';
import { getActiveAuthors } from '@/lib/authors';

const CATEGORIES = ['Adoption', 'Regulations', 'Education', 'Technology', 'Economy', 'Security', 'Community'];

const STATUSES = [
  { value: 'draft', label: 'Draft', icon: FileText, color: 'text-gray-400 bg-gray-500/10 border-gray-500/30' },
  { value: 'review', label: 'In Review', icon: Clock, color: 'text-blue-400 bg-blue-500/10 border-blue-500/30' },
  { value: 'scheduled', label: 'Scheduled', icon: Clock, color: 'text-purple-400 bg-purple-500/10 border-purple-500/30' },
  { value: 'published', label: 'Published', icon: CheckCircle2, color: 'text-green-400 bg-green-500/10 border-green-500/30' },
  { value: 'archived', label: 'Archived', icon: Archive, color: 'text-orange-400 bg-orange-500/10 border-orange-500/30' },
];

const emptyForm = {
  title: '',
  slug: '',
  excerpt: '',
  content: '',
  category: 'Adoption',
  image: '',
  author: 'Bitcoin Educator',
  authorId: '',
  authorImage: '',
  authorLinkedIn: '',
  authorX: '',
  date: new Date().toISOString().split('T')[0],
  readTime: '5 min read',
  youtubeUrl: '',
  isPopular: false,
  isTopStory: false,
  status: 'draft',
  // SEO / AEO fields
  seoTitle: '',
  metaDescription: '',
  focusKeywords: '',
  canonicalUrl: '',
  imageAlt: '',
  tags: [],
  keyTakeaways: [],
  faqs: [],
};

const AUTOSAVE_KEY = 'bas_article_draft';

function loadInitialForm(editingPost) {
  if (editingPost) return editingPost;
  // Restore an in-progress draft from a previous session, if any.
  try {
    const saved = typeof window !== 'undefined' ? localStorage.getItem(AUTOSAVE_KEY) : null;
    if (saved) {
      const parsed = JSON.parse(saved);
      if (parsed && parsed.title) return { ...emptyForm, ...parsed };
    }
  } catch {}
  return emptyForm;
}

export default function ArticleEditor({ editingPost, onDone, onNotify }) {
  const [form, setForm] = useState(() => loadInitialForm(editingPost));
  const [imagePreview, setImagePreview] = useState(() => {
    if (editingPost?.image) return editingPost.image;
    const f = loadInitialForm(editingPost);
    return typeof f.image === 'string' ? f.image : '';
  });
  const [authors, setAuthors] = useState([]);
  const [slugTouched, setSlugTouched] = useState(!!editingPost);
  const [busy, setBusy] = useState(false);
  const [showPreview, setShowPreview] = useState(false);
  const [lastSaved, setLastSaved] = useState(null);
  const isEditing = !!editingPost;

  // Load active authors once for the picker.
  useEffect(() => {
    getActiveAuthors().then(setAuthors).catch((err) => {
      console.warn('Could not load authors for picker', err);
    });
  }, []);

  // Draft auto-save to localStorage (only for NEW articles, not edits).
  useEffect(() => {
    if (isEditing) return;
    const t = setTimeout(() => {
      try {
        const serializable = { ...form, image: typeof form.image === 'string' ? form.image : '', authorImage: typeof form.authorImage === 'string' ? form.authorImage : '' };
        localStorage.setItem(AUTOSAVE_KEY, JSON.stringify(serializable));
        setLastSaved(new Date());
      } catch {}
    }, 1200);
    return () => clearTimeout(t);
  }, [form, isEditing]);

  const update = (patch) => setForm((f) => ({ ...f, ...patch }));

  const handleTitle = (title) => {
    update({ title, ...(slugTouched ? {} : { slug: title.toLowerCase().trim().replace(/[^a-z0-9\s-]/g, '').replace(/\s+/g, '-') }) });
  };

  const uploadIfFile = useCallback(async (fileOrUrl, path) => {
    if (fileOrUrl instanceof Blob) {
      const storageRef = ref(storage, path);
      await uploadBytes(storageRef, fileOrUrl);
      return await getDownloadURL(storageRef);
    }
    return fileOrUrl;
  }, []);

  const handleSubmit = async (statusOverride) => {
    if (!form.title || !form.category || !form.excerpt) {
      onNotify?.('error', 'Please fill in title, category, and excerpt.');
      return;
    }
    setBusy(true);
    try {
      const imageUrl = await uploadIfFile(form.image, `news/featured_${Date.now()}`);
      const authorImageUrl = await uploadIfFile(form.authorImage, `authors/author_${Date.now()}`);

      const { id, _doc, ...rest } = form;
      const payload = {
        ...rest,
        image: imageUrl,
        authorImage: authorImageUrl,
        status: statusOverride || form.status,
        updatedAt: serverTimestamp(),
      };

      if (isEditing) {
        await updateDoc(doc(db, 'news', editingPost.id), payload);
        onNotify?.('success', 'Article updated successfully.');
      } else {
        if (!payload.image) {
          onNotify?.('error', 'Please provide a featured image.');
          setBusy(false);
          return;
        }
        await addDoc(collection(db, 'news'), { ...payload, createdAt: serverTimestamp() });
        onNotify?.('success', statusOverride === 'published' ? 'Article published and live!' : 'Article saved.');
        try { localStorage.removeItem(AUTOSAVE_KEY); } catch {}
      }
      onDone?.();
    } catch (err) {
      console.error('Save error:', err);
      onNotify?.('error', 'Something went wrong. Please try again.');
    } finally {
      setBusy(false);
    }
  };

  const currentStatus = STATUSES.find((s) => s.value === form.status) || STATUSES[0];

  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
      {/* Main editor column */}
      <div className="lg:col-span-2 space-y-6">
        <div className="bg-[#0A0A0A] border border-gray-800 rounded-2xl p-6">
          <input
            value={form.title}
            onChange={(e) => handleTitle(e.target.value)}
            placeholder="Article title…"
            className="w-full bg-transparent text-2xl md:text-3xl font-bold text-white placeholder-gray-700 focus:outline-none mb-4"
          />
          <div className="flex items-center gap-2 text-sm text-gray-500">
            <span className="text-gray-600">/news/</span>
            <input
              value={form.slug}
              onChange={(e) => { setSlugTouched(true); update({ slug: e.target.value }); }}
              placeholder="url-slug"
              className="flex-1 bg-transparent text-gray-400 focus:outline-none border-b border-transparent focus:border-gray-700"
            />
          </div>
        </div>

        <div className="bg-[#0A0A0A] border border-gray-800 rounded-2xl p-6">
          <label className="block text-sm font-medium text-gray-300 mb-2">Excerpt</label>
          <textarea
            value={form.excerpt}
            onChange={(e) => update({ excerpt: e.target.value })}
            rows={2}
            placeholder="A short summary shown in cards and search results…"
            className="w-full px-4 py-3 bg-black/40 border border-gray-800 rounded-lg text-white placeholder-gray-600 focus:outline-none focus:border-yellow-500 resize-none"
          />
        </div>

        <div className="bg-[#0A0A0A] border border-gray-800 rounded-2xl p-6">
          <label className="block text-sm font-medium text-gray-300 mb-3">Article Body</label>
          <StoryEditor value={form.content} onChange={(content) => update({ content })} dark />
        </div>

        <div className="bg-[#0A0A0A] border border-gray-800 rounded-2xl p-6">
          <ImageUploader
            label="Featured Image"
            value={form.image}
            preview={imagePreview}
            onChange={(val, prev) => { update({ image: val }); setImagePreview(prev); }}
          />
        </div>
      </div>

      {/* Sidebar: publish controls + metadata */}
      <div className="lg:col-span-1 space-y-6">
        {/* Publish box */}
        <div className="bg-[#0A0A0A] border border-gray-800 rounded-2xl p-6">
          <div className="flex items-center justify-between mb-4">
            <h3 className="font-bold">Publish</h3>
            <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold border ${currentStatus.color}`}>
              <currentStatus.icon size={12} />
              {currentStatus.label}
            </span>
          </div>

          <label className="block text-xs font-medium text-gray-400 mb-2">Status</label>
          <select
            value={form.status}
            onChange={(e) => update({ status: e.target.value })}
            className="w-full px-3 py-2.5 bg-black/40 border border-gray-800 rounded-lg text-white focus:outline-none focus:border-yellow-500 mb-4 text-sm"
          >
            {STATUSES.map((s) => (
              <option key={s.value} value={s.value}>{s.label}</option>
            ))}
          </select>

          {lastSaved && !isEditing && (
            <p className="text-xs text-gray-500 mb-4 flex items-center gap-1.5">
              <Save size={12} /> Draft auto-saved {lastSaved.toLocaleTimeString()}
            </p>
          )}

          <div className="space-y-2">
            <button onClick={() => setShowPreview(true)} className="w-full flex items-center justify-center gap-2 px-4 py-2.5 bg-white/5 hover:bg-white/10 border border-gray-800 rounded-lg text-sm font-medium transition-colors">
              <Eye size={16} /> Preview
            </button>
            <button onClick={() => handleSubmit('draft')} disabled={busy} className="w-full flex items-center justify-center gap-2 px-4 py-2.5 bg-white/5 hover:bg-white/10 border border-gray-800 rounded-lg text-sm font-medium transition-colors disabled:opacity-50">
              {busy ? <LoaderCircle className="animate-spin" size={16} /> : <FileText size={16} />} Save Draft
            </button>
            <button onClick={() => handleSubmit('published')} disabled={busy} className="w-full flex items-center justify-center gap-2 px-4 py-3 bg-yellow-500 text-black hover:bg-yellow-400 rounded-lg font-bold transition-colors disabled:opacity-50">
              {busy ? <LoaderCircle className="animate-spin" size={16} /> : <Send size={16} />} {isEditing ? 'Update & Publish' : 'Publish'}
            </button>
          </div>
        </div>

        {/* SEO / AEO panel */}
        <SeoPanel form={form} update={update} />

        {/* AI editorial tools */}
        <AiTools form={form} update={update} />

        {/* Metadata */}
        <div className="bg-[#0A0A0A] border border-gray-800 rounded-2xl p-6 space-y-4">
          <h3 className="font-bold">Article Details</h3>

          <div>
            <label className="block text-xs font-medium text-gray-400 mb-2">Category</label>
            <select value={form.category} onChange={(e) => update({ category: e.target.value })} className="w-full px-3 py-2.5 bg-black/40 border border-gray-800 rounded-lg text-white focus:outline-none focus:border-yellow-500 text-sm">
              {CATEGORIES.map((c) => <option key={c} value={c}>{c}</option>)}
            </select>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-medium text-gray-400 mb-2">Date</label>
              <input type="date" value={form.date} onChange={(e) => update({ date: e.target.value })} className="w-full px-3 py-2.5 bg-black/40 border border-gray-800 rounded-lg text-white focus:outline-none focus:border-yellow-500 text-sm" />
            </div>
            <div>
              <label className="block text-xs font-medium text-gray-400 mb-2">Read Time</label>
              <input value={form.readTime} onChange={(e) => update({ readTime: e.target.value })} placeholder="5 min read" className="w-full px-3 py-2.5 bg-black/40 border border-gray-800 rounded-lg text-white placeholder-gray-600 focus:outline-none focus:border-yellow-500 text-sm" />
            </div>
          </div>

          <div>
            <label className="block text-xs font-medium text-gray-400 mb-2">YouTube URL (optional)</label>
            <input value={form.youtubeUrl} onChange={(e) => update({ youtubeUrl: e.target.value })} placeholder="https://youtube.com/watch?v=…" className="w-full px-3 py-2.5 bg-black/40 border border-gray-800 rounded-lg text-white placeholder-gray-600 focus:outline-none focus:border-yellow-500 text-sm" />
          </div>

          <div className="flex flex-col gap-2 pt-2">
            <label className="flex items-center gap-2 text-sm text-gray-300 cursor-pointer">
              <input type="checkbox" checked={!!form.isPopular} onChange={(e) => update({ isPopular: e.target.checked })} className="accent-yellow-500 w-4 h-4" />
              Mark as Popular
            </label>
            <label className="flex items-center gap-2 text-sm text-gray-300 cursor-pointer">
              <input type="checkbox" checked={!!form.isTopStory} onChange={(e) => update({ isTopStory: e.target.checked })} className="accent-yellow-500 w-4 h-4" />
              Mark as Top Story
            </label>
          </div>
        </div>

        {/* Author */}
        <div className="bg-[#0A0A0A] border border-gray-800 rounded-2xl p-6 space-y-4">
          <h3 className="font-bold">Author</h3>
          <div>
            <label className="block text-xs font-medium text-gray-400 mb-2">Choose author</label>
            <select
              value={form.authorId || ''}
              onChange={(e) => {
                const chosen = authors.find((a) => a.id === e.target.value);
                if (!chosen) {
                  update({ authorId: '', author: '', authorImage: '', authorLinkedIn: '', authorX: '' });
                  return;
                }
                // Denormalize the author's current details onto the article so
                // legacy display code (which reads post.author, post.authorImage,
                // etc.) keeps working unchanged. The canonical link is authorId.
                update({
                  authorId: chosen.id,
                  author: chosen.name || '',
                  authorImage: chosen.avatar || '',
                  authorLinkedIn: chosen.linkedin || '',
                  authorX: chosen.twitter || '',
                });
              }}
              className="w-full px-3 py-2.5 bg-black/40 border border-gray-800 rounded-lg text-white focus:outline-none focus:border-yellow-500 text-sm"
            >
              <option value="">— Select an author —</option>
              {authors.map((a) => (
                <option key={a.id} value={a.id}>
                  {a.name}{a.role ? ` · ${a.role}` : ''}
                </option>
              ))}
            </select>
            <p className="text-xs text-gray-500 mt-2">
              Authors are managed in the{' '}
              <a href="/dashboard/authors" className="text-yellow-500 hover:underline">Authors section</a>.
              The chosen author&rsquo;s name, photo, and socials appear on the article automatically.
            </p>
          </div>
          {form.author && (
            <div className="flex items-center gap-3 p-3 bg-black/40 border border-gray-800 rounded-lg">
              {form.authorImage && (
                /* eslint-disable-next-line @next/next/no-img-element */
                <img src={form.authorImage} alt="" className="w-10 h-10 rounded-full object-cover" />
              )}
              <div className="min-w-0">
                <p className="text-sm text-white truncate">{form.author}</p>
                {form.authorId ? (
                  <p className="text-xs text-gray-500">Linked to author record</p>
                ) : (
                  <p className="text-xs text-orange-400">Legacy byline — not linked to an author profile</p>
                )}
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Preview modal */}
      {showPreview && (
        <div className="fixed inset-0 z-50 bg-black/90 backdrop-blur-sm overflow-y-auto p-4 md:p-8">
          <div className="max-w-3xl mx-auto bg-black border border-gray-800 rounded-2xl overflow-hidden">
            <div className="sticky top-0 bg-[#0A0A0A] border-b border-gray-800 px-6 py-4 flex items-center justify-between z-10">
              <span className="text-sm font-semibold text-gray-400">Preview</span>
              <button onClick={() => setShowPreview(false)} className="text-gray-400 hover:text-white"><X size={20} /></button>
            </div>
            <article className="p-6 md:p-10">
              <span className="inline-block text-xs font-semibold text-black bg-yellow-500 px-3 py-1.5 rounded-full">{form.category}</span>
              <h1 className="text-3xl md:text-4xl font-black mt-4 mb-3">{form.title || 'Untitled'}</h1>
              <div className="flex items-center gap-3 text-sm text-gray-400 mb-6">
                <span>{form.author}</span><span>·</span><span>{form.date}</span><span>·</span><span>{form.readTime}</span>
              </div>
              {imagePreview && (
                /* eslint-disable-next-line @next/next/no-img-element */
                <img src={imagePreview} alt={form.title} className="w-full rounded-xl mb-8" />
              )}
              <div className="article-body" dangerouslySetInnerHTML={{ __html: form.content }} />
            </article>
          </div>
        </div>
      )}
    </div>
  );
}
