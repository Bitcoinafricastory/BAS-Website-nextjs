'use client';

import { useState, useEffect, useMemo } from 'react';
import Link from 'next/link';
import { db } from '@/lib/firebase';
import { collection, getDocs, doc, writeBatch } from 'firebase/firestore';
import { matchArticleAuthor, normalizeName } from '@/lib/author-match';
import { announceChange } from '@/lib/announce-change';
import { publicPathsFor } from '@/lib/public-paths';
import { LoaderCircle, Newspaper, Calendar, Users, Mail, TrendingUp, BarChart3, Link2 } from 'lucide-react';

function StatTile({ icon: Icon, label, value }) {
  return (
    <div className="bg-[#0A0A0A] border border-gray-800 rounded-2xl p-6">
      <div className="w-10 h-10 rounded-xl bg-yellow-500/10 flex items-center justify-center mb-4">
        <Icon className="text-yellow-500" size={20} />
      </div>
      <div className="text-3xl font-semibold">{value}</div>
      <div className="text-sm text-gray-400 mt-1">{label}</div>
    </div>
  );
}

export default function AnalyticsPage() {
  const [data, setData] = useState({ news: [], events: [], subs: [], communities: [], authors: [] });
  const [linking, setLinking] = useState(false);
  const [linkNote, setLinkNote] = useState('');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let cancelled = false;
    async function load() {
      const fetchAll = async (name) => {
        try {
          const snap = await getDocs(collection(db, name));
          return snap.docs.map((d) => ({ id: d.id, ...d.data() }));
        } catch {
          return [];
        }
      };
      const [news, events, subs, communities, authors] = await Promise.all([
        fetchAll('news'), fetchAll('events'), fetchAll('newsletterSubscribers'), fetchAll('communities'), fetchAll('authors'),
      ]);
      if (!cancelled) { setData({ news, events, subs, communities, authors }); setLoading(false); }
    }
    load();
    return () => { cancelled = true; };
  }, []);

  const categoryBreakdown = useMemo(() => {
    const counts = {};
    data.news.forEach((p) => {
      const c = p.category || 'Uncategorized';
      counts[c] = (counts[c] || 0) + 1;
    });
    const total = data.news.length || 1;
    return Object.entries(counts)
      .map(([name, count]) => ({ name, count, pct: Math.round((count / total) * 100) }))
      .sort((a, b) => b.count - a.count);
  }, [data.news]);

  const statusBreakdown = useMemo(() => {
    const counts = {};
    data.news.forEach((p) => {
      const s = p.status || 'published';
      counts[s] = (counts[s] || 0) + 1;
    });
    return Object.entries(counts).map(([name, count]) => ({ name, count }));
  }, [data.news]);

  // One writer can end up with two profiles of the same name. Treat them as
  // one: the active profile with the most linked articles is the real one.
  const { profileFor, duplicateNames } = useMemo(() => {
    const linkedCount = (a) => data.news.filter((p) => p.authorId === a.id).length;
    const byName = new Map();
    data.authors.forEach((a) => {
      const k = normalizeName(a.name);
      if (!k) return;
      byName.set(k, [...(byName.get(k) || []), a]);
    });
    const canonical = new Map();
    const dupes = [];
    byName.forEach((list, k) => {
      const ranked = [...list].sort((a, b) =>
        (a.isActive === 'inactive') - (b.isActive === 'inactive') || linkedCount(b) - linkedCount(a) || (b.slug ? 1 : 0) - (a.slug ? 1 : 0));
      canonical.set(k, ranked[0]);
      if (list.length > 1) dupes.push(ranked[0].name);
    });
    const lookup = (post) => {
      const matched = matchArticleAuthor(post, data.authors);
      return matched ? canonical.get(normalizeName(matched.name)) || matched : null;
    };
    return { profileFor: lookup, duplicateNames: dupes };
  }, [data.news, data.authors]);

  // Group by writer profile, not by the exact byline text: the same writer
  // typed with different spacing or case used to show up twice.
  const authorBreakdown = useMemo(() => {
    const groups = new Map();
    data.news.forEach((p) => {
      const profile = profileFor(p);
      const raw = String(p.author || p.authorName || '').replace(/\s+/g, ' ').trim();
      const key = profile ? `id:${profile.id}` : `name:${normalizeName(raw) || 'unknown'}`;
      const g = groups.get(key) || { key, name: profile?.name || raw || 'Unknown', count: 0 };
      g.count += 1;
      groups.set(key, g);
    });
    return [...groups.values()].sort((a, b) => b.count - a.count).slice(0, 6);
  }, [data.news, profileFor]);

  // Articles whose byline matches a writer profile but aren't linked to it
  // (no authorId, a duplicate or outdated one, or a slightly different name).
  const unlinked = useMemo(() => data.news
    .map((p) => ({ post: p, profile: profileFor(p) }))
    .filter(({ post, profile }) => profile && (post.authorId !== profile.id || post.author !== profile.name)),
  [data.news, profileFor]);

  const linkArticles = async () => {
    setLinking(true);
    setLinkNote('');
    try {
      const changed = [];
      for (let i = 0; i < unlinked.length; i += 400) {
        const batch = writeBatch(db);
        unlinked.slice(i, i + 400).forEach(({ post, profile }) => {
          // Same fields the article editor fills in when you pick an author.
          const patch = {
            authorId: profile.id,
            author: profile.name || '',
            authorImage: profile.avatar || post.authorImage || '',
            authorLinkedIn: profile.linkedin || post.authorLinkedIn || '',
            authorX: profile.twitter || post.authorX || '',
          };
          batch.update(doc(db, 'news', post.id), patch);
          changed.push({ ...post, ...patch });
        });
        await batch.commit();
      }
      const byId = new Map(changed.map((p) => [p.id, p]));
      setData((d) => ({ ...d, news: d.news.map((p) => byId.get(p.id) || p) }));
      const paths = changed.filter((p) => !p.status || p.status === 'published').flatMap((p) => publicPathsFor('news', p));
      const profiles = [...new Set(changed.map((p) => data.authors.find((a) => a.id === p.authorId)?.slug).filter(Boolean))];
      announceChange([...paths, '/authors', ...profiles.map((s) => `/authors/${s}`)]);
      setLinkNote(`Linked ${changed.length} article${changed.length === 1 ? '' : 's'} to their writer profile.`);
    } catch (err) {
      setLinkNote('Could not link the articles: ' + (err?.message || 'unknown error'));
    } finally {
      setLinking(false);
    }
  };

  if (loading) {
    return <div className="flex items-center justify-center py-20"><LoaderCircle className="animate-spin text-yellow-500" size={28} /></div>;
  }

  return (
    <div>
      <div className="mb-8">
        <h1 className="text-2xl font-bold">Analytics</h1>
        <p className="text-gray-400 text-sm mt-1">Content overview across your publication.</p>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5 mb-8">
        <StatTile icon={Newspaper} label="Total Articles" value={data.news.length} />
        <StatTile icon={Calendar} label="Events" value={data.events.length} />
        <StatTile icon={Mail} label="Subscribers" value={data.subs.length} />
        <StatTile icon={Users} label="Communities" value={data.communities.length} />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Category breakdown */}
        <div className="bg-[#0A0A0A] border border-gray-800 rounded-2xl p-6">
          <div className="flex items-center gap-2 mb-5">
            <BarChart3 className="text-yellow-500" size={18} />
            <h2 className="font-bold">Articles by Category</h2>
          </div>
          <div className="space-y-3">
            {categoryBreakdown.map((c) => (
              <div key={c.name}>
                <div className="flex items-center justify-between text-sm mb-1">
                  <span className="text-gray-300">{c.name}</span>
                  <span className="text-gray-500">{c.count}</span>
                </div>
                <div className="h-2 bg-gray-900 rounded-full overflow-hidden">
                  <div className="h-full bg-yellow-500 rounded-full transition-all" style={{ width: `${c.pct}%` }} />
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Status + authors */}
        <div className="space-y-6">
          <div className="bg-[#0A0A0A] border border-gray-800 rounded-2xl p-6">
            <div className="flex items-center gap-2 mb-5">
              <TrendingUp className="text-yellow-500" size={18} />
              <h2 className="font-bold">Publishing Status</h2>
            </div>
            <div className="flex flex-wrap gap-3">
              {statusBreakdown.map((s) => (
                <div key={s.name} className="px-4 py-2 bg-white/5 border border-gray-800 rounded-lg">
                  <div className="text-lg font-bold">{s.count}</div>
                  <div className="text-xs text-gray-500 capitalize">{s.name}</div>
                </div>
              ))}
            </div>
          </div>

          <div className="bg-[#0A0A0A] border border-gray-800 rounded-2xl p-6">
            <div className="flex items-center gap-2 mb-5">
              <Users className="text-yellow-500" size={18} />
              <h2 className="font-bold">Top Authors</h2>
            </div>
            {unlinked.length > 0 && (
              <div className="mb-4 p-3 rounded-xl bg-yellow-500/10 border border-yellow-500/30 text-sm">
                <p className="text-gray-200 mb-2">
                  {unlinked.length} article{unlinked.length === 1 ? ' isn’t' : 's aren’t'} linked to the writer&rsquo;s profile, so {unlinked.length === 1 ? 'it' : 'they'} can be missing from their profile page.
                </p>
                <button
                  type="button"
                  onClick={linkArticles}
                  disabled={linking}
                  className="inline-flex items-center gap-2 px-3 py-1.5 rounded-lg bg-yellow-500 text-black font-semibold hover:bg-yellow-400 disabled:opacity-60"
                >
                  {linking ? <LoaderCircle size={14} className="animate-spin" /> : <Link2 size={14} />}
                  {linking ? 'Linking…' : 'Link them now'}
                </button>
              </div>
            )}
            {linkNote && <p className="mb-4 text-sm text-gray-400">{linkNote}</p>}
            {duplicateNames.length > 0 && (
              <p className="mb-4 text-sm text-gray-400">
                You have more than one writer profile for {duplicateNames.join(', ')}. Articles are linked to the main one; once
                that&rsquo;s done, delete the extra profile in <Link href="/dashboard/authors" className="text-yellow-500 hover:underline">Authors</Link>.
              </p>
            )}
            <div className="space-y-2">
              {authorBreakdown.map((a) => (
                <div key={a.key} className="flex items-center justify-between text-sm py-1.5 border-b border-gray-800 last:border-0">
                  <span className="text-gray-300">{a.name}</span>
                  <span className="text-yellow-500 font-semibold">{a.count}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
