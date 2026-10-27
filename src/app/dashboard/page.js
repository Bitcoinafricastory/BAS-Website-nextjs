'use client';

import Link from 'next/link';
import { useEffect, useState } from 'react';
import { Newspaper, Calendar, Inbox, Mail, ArrowRight, PlusCircle, Clock } from 'lucide-react';
import { useAuth } from '@/context/AuthContext';
import { db } from '@/lib/firebase';
import { collection, getCountFromServer, query, where } from 'firebase/firestore';
import { useAccess } from '@/context/AccessContext';
import { SECTIONS } from '@/lib/staff-access';

function StatCard({ icon: Icon, label, value, href }) {
  return (
    <Link href={href} className="group bg-[#0A0A0A] border border-gray-800 rounded-2xl p-6 hover:border-yellow-500/50 transition-all">
      <div className="flex items-center justify-between mb-4">
        <div className="w-11 h-11 rounded-xl bg-yellow-500/10 flex items-center justify-center">
          <Icon className="text-yellow-500" size={22} />
        </div>
        <ArrowRight className="text-gray-600 group-hover:text-yellow-500 group-hover:translate-x-1 transition-all" size={18} />
      </div>
      <div className="text-3xl font-semibold">{value === null ? '—' : value}</div>
      <div className="text-sm text-gray-400 mt-1">{label}</div>
    </Link>
  );
}

export default function DashboardHome() {
  const { user } = useAuth();
  const { canOpen, canPublish, isOwner } = useAccess();
  const [counts, setCounts] = useState({ news: null, events: null, submittedStories: null, newsletter: null, review: null });

  useEffect(() => {
    let cancelled = false;
    async function loadCounts() {
      const safeCount = async (name) => {
        try {
          const snap = await getCountFromServer(name === 'review' ? query(collection(db, 'news'), where('status', '==', 'review')) : collection(db, name));
          return snap.data().count;
        } catch {
          return null;
        }
      };
      const [news, events, submittedStories, newsletter, review] = await Promise.all([
        safeCount('news'),
        safeCount('events'),
        safeCount('submitted_stories'),
        safeCount('newsletterSubscribers'),
        safeCount('review'),
      ]);
      if (!cancelled) setCounts({ news, events, submittedStories, newsletter, review });
    }
    loadCounts();
    return () => {
      cancelled = true;
    };
  }, []);

  const firstName = user?.email ? user.email.split('@')[0] : 'there';

  return (
    <div>
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 mb-8">
        <div>
          <h1 className="text-3xl font-semibold">Welcome back, <span className="text-yellow-500 capitalize">{firstName}</span></h1>
          <p className="text-gray-400 mt-1">Here&rsquo;s what&rsquo;s happening across your publication.</p>
        </div>
        {canOpen('/dashboard/news') && (
          <Link href="/dashboard/news" className="inline-flex items-center gap-2 px-4 py-2.5 bg-yellow-500 text-black font-medium rounded-xl hover:bg-yellow-400 transition-colors self-start">
            <PlusCircle size={18} />
            New Article
          </Link>
        )}
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5 mb-10">
        {canOpen('/dashboard/news') && <StatCard icon={Newspaper} label="Published Articles" value={counts.news} href="/dashboard/news" />}
        {canPublish && canOpen('/dashboard/news') && <StatCard icon={Clock} label="Articles waiting for review" value={counts.review} href="/dashboard/news" />}
        {canOpen('/dashboard/submitted-stories') && <StatCard icon={Inbox} label="Submitted Stories" value={counts.submittedStories} href="/dashboard/submitted-stories" />}
        {canOpen('/dashboard/events') && <StatCard icon={Calendar} label="Events" value={counts.events} href="/dashboard/events" />}
        {canOpen('/dashboard/newsletter') && <StatCard icon={Mail} label="Newsletter Subscribers" value={counts.newsletter} href="/dashboard/newsletter" />}
      </div>

      {!isOwner && (
        <div className="bg-[#0A0A0A] border border-gray-800 rounded-2xl p-6 mb-6">
          <h2 className="text-lg font-bold mb-4">Your sections</h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
            {SECTIONS.filter((sec) => canOpen(sec.paths[0])).map((sec) => (
              <Link key={sec.id} href={sec.paths[0]} className="p-4 rounded-xl bg-white/5 hover:bg-white/10 transition-colors">
                <span className="block text-sm font-medium">{sec.label}</span>
                {sec.hint && <span className="block text-xs text-gray-500 mt-0.5">{sec.hint}</span>}
              </Link>
            ))}
          </div>
        </div>
      )}

      <div className="bg-[#0A0A0A] border border-gray-800 rounded-2xl p-6">
        <h2 className="text-lg font-bold mb-4">Quick Actions</h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
          {canOpen('/dashboard/news') && (
            <Link href="/dashboard/news" className="flex items-center gap-3 p-4 rounded-xl bg-white/5 hover:bg-white/10 transition-colors">
              <Newspaper className="text-yellow-500" size={20} />
              <span className="text-sm font-medium">Write / manage articles</span>
            </Link>
          )}
          {canOpen('/dashboard/events') && (
            <Link href="/dashboard/events" className="flex items-center gap-3 p-4 rounded-xl bg-white/5 hover:bg-white/10 transition-colors">
              <Calendar className="text-yellow-500" size={20} />
              <span className="text-sm font-medium">Add an event</span>
            </Link>
          )}
          {canOpen('/dashboard/newsletter') && (
            <Link href="/dashboard/newsletter" className="flex items-center gap-3 p-4 rounded-xl bg-white/5 hover:bg-white/10 transition-colors">
              <Mail className="text-yellow-500" size={20} />
              <span className="text-sm font-medium">View subscribers</span>
            </Link>
          )}
        </div>
      </div>
    </div>
  );
}
