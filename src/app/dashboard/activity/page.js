'use client';

import { useEffect, useMemo, useState } from 'react';
import { collection, onSnapshot, query, orderBy, limit } from 'firebase/firestore';
import { db, auth } from '@/lib/firebase';
import { SECTIONS } from '@/lib/staff-access';
import { useAccess } from '@/context/AccessContext';
import { LoaderCircle, History } from 'lucide-react';

// Activity Log (owner only): who created, edited, published, approved or
// deleted what, newest first. Entries are written by the dashboard as people
// work and can't be edited or deleted by anyone (see firestore.rules).

const COLLECTION_LABELS = {
  news: 'Article',
  submitted_stories: 'Story submission',
  entities: 'Directory profile',
  submittedEntities: 'Directory submission',
  events: 'Event',
  submittedEvents: 'Event submission',
  podcasts: 'Podcast episode',
  faqs: 'FAQ',
  education_programs: 'Education program',
  other_programs: 'Other program',
  bitcoin_videos: 'Bitcoin video',
  whyBitcoinVideo: 'Why Bitcoin video',
  bitcoin_resources: 'Resource',
  testimonials: 'X testimonial',
  educationTestimonials: 'Education testimonial',
  authors: 'Writer profile',
  staff: 'Team',
};

const ACTION_COLOURS = {
  published: 'text-green-400',
  deleted: 'text-red-400',
  rejected: 'text-red-300',
  approved: 'text-green-300',
  'sent for review': 'text-blue-300',
  'access changed': 'text-yellow-400',
};

function when(ts) {
  const d = ts?.toDate ? ts.toDate() : null;
  if (!d) return 'just now';
  const mins = Math.round((Date.now() - d.getTime()) / 60000);
  if (mins < 1) return 'just now';
  if (mins < 60) return `${mins} min ago`;
  if (mins < 60 * 24) return `${Math.round(mins / 60)} h ago`;
  return d.toLocaleString('en-GB', { day: 'numeric', month: 'short', hour: '2-digit', minute: '2-digit' });
}

export default function ActivityPage() {
  const { isOwner } = useAccess();
  const [entries, setEntries] = useState([]);
  const [staff, setStaff] = useState({});
  const [loading, setLoading] = useState(true);
  const [person, setPerson] = useState('all');
  const [section, setSection] = useState('all');

  useEffect(() => {
    const q = query(collection(db, 'activityLog'), orderBy('at', 'desc'), limit(400));
    const unsub = onSnapshot(q, (snap) => {
      setEntries(snap.docs.map((d) => ({ id: d.id, ...d.data() })));
      setLoading(false);
    }, () => setLoading(false));
    const unsubStaff = onSnapshot(collection(db, 'staff'), (snap) => {
      setStaff(Object.fromEntries(snap.docs.map((d) => [d.id, d.data().name || d.id])));
    }, () => {});
    return () => { unsub(); unsubStaff(); };
  }, []);

  const people = useMemo(() => [...new Set(entries.map((e) => e.by))].sort(), [entries]);
  const shown = useMemo(() => entries.filter((e) => {
    if (person !== 'all' && e.by !== person) return false;
    if (section !== 'all') {
      const sec = SECTIONS.find((s) => s.id === section);
      if (!sec?.collections.includes(e.collection)) return false;
    }
    return true;
  }), [entries, person, section]);

  if (!isOwner) return null;

  const me = auth.currentUser?.email?.toLowerCase();
  const nameOf = (email) => (email === me ? 'You' : staff[email] || email || 'Unknown');

  return (
    <div>
      <div className="mb-8">
        <h1 className="text-2xl font-bold">Activity Log</h1>
        <p className="text-gray-400 text-sm mt-1">Every add, edit, publish, approval and deletion in the dashboard, newest first. Only you can see this.</p>
      </div>

      <div className="flex flex-col sm:flex-row gap-3 mb-6">
        <select value={person} onChange={(e) => setPerson(e.target.value)} className="px-4 py-2.5 bg-[#0A0A0A] border border-gray-800 rounded-lg text-white focus:outline-none focus:border-yellow-500">
          <option value="all">Everyone</option>
          {people.map((p) => <option key={p} value={p}>{nameOf(p)}</option>)}
        </select>
        <select value={section} onChange={(e) => setSection(e.target.value)} className="px-4 py-2.5 bg-[#0A0A0A] border border-gray-800 rounded-lg text-white focus:outline-none focus:border-yellow-500">
          <option value="all">All sections</option>
          {SECTIONS.map((s) => <option key={s.id} value={s.id}>{s.label}</option>)}
        </select>
      </div>

      {loading ? (
        <div className="flex items-center justify-center py-20"><LoaderCircle className="animate-spin text-yellow-500" size={28} /></div>
      ) : shown.length === 0 ? (
        <div className="text-center py-16 bg-[#0A0A0A] border border-gray-800 rounded-2xl">
          <History className="mx-auto text-gray-600 mb-3" size={28} />
          <p className="text-gray-300 font-medium">Nothing logged yet.</p>
          <p className="text-gray-500 text-sm mt-1">Changes made from now on will appear here.</p>
        </div>
      ) : (
        <div className="bg-[#0A0A0A] border border-gray-800 rounded-2xl divide-y divide-gray-800">
          {shown.map((e) => (
            <div key={e.id} className="flex flex-wrap items-baseline gap-x-3 gap-y-1 px-4 py-3 text-sm">
              <span className="text-gray-500 text-xs w-28 shrink-0">{when(e.at)}</span>
              <span className="font-medium text-white">{nameOf(e.by)}</span>
              <span className={ACTION_COLOURS[e.action] || 'text-gray-300'}>{e.action}</span>
              <span className="text-gray-500">{COLLECTION_LABELS[e.collection] || e.collection}</span>
              {e.title && <span className="text-gray-300 min-w-0 break-words">“{e.title}”</span>}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
