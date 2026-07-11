'use client';

import { useState, useEffect, useMemo } from 'react';
import { db } from '@/lib/firebase';
import { collection, getDocs } from 'firebase/firestore';
import { LoaderCircle, Newspaper, Calendar, Users, Mail, TrendingUp, BarChart3 } from 'lucide-react';

function StatTile({ icon: Icon, label, value }) {
  return (
    <div className="bg-[#0A0A0A] border border-gray-800 rounded-2xl p-6">
      <div className="w-10 h-10 rounded-xl bg-yellow-500/10 flex items-center justify-center mb-4">
        <Icon className="text-yellow-500" size={20} />
      </div>
      <div className="text-3xl font-black">{value}</div>
      <div className="text-sm text-gray-400 mt-1">{label}</div>
    </div>
  );
}

export default function AnalyticsPage() {
  const [data, setData] = useState({ news: [], events: [], subs: [], communities: [] });
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
      const [news, events, subs, communities] = await Promise.all([
        fetchAll('news'), fetchAll('events'), fetchAll('newsletterSubscribers'), fetchAll('communities'),
      ]);
      if (!cancelled) { setData({ news, events, subs, communities }); setLoading(false); }
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

  const authorBreakdown = useMemo(() => {
    const counts = {};
    data.news.forEach((p) => {
      const a = p.author || 'Unknown';
      counts[a] = (counts[a] || 0) + 1;
    });
    return Object.entries(counts)
      .map(([name, count]) => ({ name, count }))
      .sort((a, b) => b.count - a.count)
      .slice(0, 6);
  }, [data.news]);

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
            <div className="space-y-2">
              {authorBreakdown.map((a) => (
                <div key={a.name} className="flex items-center justify-between text-sm py-1.5 border-b border-gray-800 last:border-0">
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
