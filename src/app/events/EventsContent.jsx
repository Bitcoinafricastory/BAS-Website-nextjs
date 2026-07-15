'use client';

import { useState, useMemo } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { ArrowRight, Search, Box, Ticket, X as CloseIcon, Save } from 'lucide-react';
import { db, storage } from '@/lib/firebase';
import { collection, addDoc, serverTimestamp } from 'firebase/firestore';
import { getStorage, ref, uploadBytes, getDownloadURL } from 'firebase/storage';

// "2026-06-17" -> { day: 17, month: 'JUN' }. Falls back gracefully since this
// field is free text in the admin form, not guaranteed to be a strict date.
function parseEventDate(dateStr) {
  if (!dateStr) return { day: '–', month: '' };
  const d = new Date(dateStr);
  if (Number.isNaN(d.getTime())) return { day: dateStr, month: '' };
  return {
    day: d.getDate(),
    month: d.toLocaleDateString('en-US', { month: 'short' }).toUpperCase(),
  };
}

export default function EventsContent({ initialEvents = [] }) {
  const [events] = useState(initialEvents);
  const [search, setSearch] = useState('');
  const [showSubmitModal, setShowSubmitModal] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [notice, setNotice] = useState('');
  const [submitFormData, setSubmitFormData] = useState({
    eventName: '',
    venue: '',
    address: '',
    date: '',
    time: '',
    description: '',
    banner: '',
    registrationUrl: '',
  });
  const [imageMode, setImageMode] = useState('url');
  const [imagePreview, setImagePreview] = useState('');

  const filtered = useMemo(() => {
    if (!search) return events;
    const s = search.trim().toLowerCase();
    return events.filter((e) => (
      (e.eventName && e.eventName.toLowerCase().includes(s)) ||
      (e.organiser && e.organiser.toLowerCase().includes(s)) ||
      (e.tags && e.tags.join(' ').toLowerCase().includes(s)) ||
      (e.city && e.city.toLowerCase().includes(s))
    ));
  }, [events, search]);

  const compressImage = (file, maxWidth = 1200) => new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.readAsDataURL(file);
    reader.onload = (event) => {
      const img = new Image();
      img.src = event.target.result;
      img.onload = () => {
        const canvas = document.createElement('canvas');
        let width = img.width;
        let height = img.height;
        if (width > maxWidth) {
          height = (maxWidth / width) * height;
          width = maxWidth;
        }
        canvas.width = width;
        canvas.height = height;
        const ctx = canvas.getContext('2d');
        ctx.drawImage(img, 0, 0, width, height);
        canvas.toBlob((blob) => resolve(blob), 'image/jpeg', 0.8);
      };
      img.onerror = reject;
    };
    reader.onerror = reject;
  });

  const handleFileChange = async (e) => {
    const file = e.target.files && e.target.files[0];
    if (!file) return;
    try {
      setSubmitting(true);
      const compressedBlob = await compressImage(file);
      setSubmitFormData((prev) => ({ ...prev, banner: compressedBlob }));
      setImagePreview(URL.createObjectURL(compressedBlob));
    } catch (err) {
      console.error('Image compression error', err);
    } finally {
      setSubmitting(false);
    }
  };

  const resetForm = () => {
    setSubmitFormData({ eventName: '', venue: '', address: '', date: '', time: '', description: '', banner: '', registrationUrl: '' });
    setImagePreview('');
  };

  const handleSubmitEvent = async (e) => {
    e.preventDefault();
    setSubmitting(true);
    setNotice('');
    try {
      let bannerUrl = submitFormData.banner;
      if (bannerUrl instanceof Blob) {
        const storageInstance = storage || getStorage();
        const storageRef = ref(storageInstance, `submittedEvents/banner_${Date.now()}`);
        await uploadBytes(storageRef, bannerUrl);
        bannerUrl = await getDownloadURL(storageRef);
      }

      await addDoc(collection(db, 'submittedEvents'), {
        eventName: submitFormData.eventName,
        venue: submitFormData.venue,
        address: submitFormData.address,
        date: submitFormData.date,
        time: submitFormData.time,
        description: submitFormData.description,
        banner: bannerUrl || '',
        registrationUrl: submitFormData.registrationUrl || '',
        submittedAt: serverTimestamp(),
        status: 'pending',
      });

      resetForm();
      setShowSubmitModal(false);
      setNotice('Event submitted successfully! Our team will review it shortly.');
    } catch (err) {
      console.error('Error submitting event:', err);
      setNotice('Failed to submit event. Please try again.');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="mt-[75px] pb-32">
      <section id="hero" className="relative bg-black">
        <div className="max-w-7xl mx-auto grid grid-cols-1 lg:grid-cols-[1.05fr_0.95fr] lg:min-h-[52vh]">
          <div className="order-2 lg:order-1 flex flex-col justify-center px-6 sm:px-10 lg:pl-6 lg:pr-14 py-14 lg:py-16 border-b lg:border-b-0 lg:border-r border-gray-800">
            <span className="font-bold text-[11px] tracking-[0.18em] uppercase text-[#FAD604] mb-6">
              Your network is your networth
            </span>
            <h1 className="font-extrabold text-white text-[34px] sm:text-[44px] lg:text-[50px] leading-[1.05] tracking-tight mb-6 max-w-xl">
              Bitcoin events <em className="italic text-[#FAD604]">across Africa.</em>
            </h1>
            <p className="text-gray-400 text-base sm:text-lg leading-relaxed max-w-md">
              Discover meetups, conferences, workshops, and grassroots Bitcoin gatherings shaping Africa&rsquo;s Bitcoin circular economy.
            </p>
          </div>
          <div className="order-1 lg:order-2 relative min-h-[220px] sm:min-h-[300px] lg:min-h-0 overflow-hidden">
            <Image
              src="/assets/communities.jpg"
              alt="Bitcoin community gathering"
              fill
              priority
              sizes="(min-width: 1024px) 45vw, 100vw"
              className="object-cover"
            />
            <div className="hidden lg:block absolute inset-0 bg-[linear-gradient(90deg,rgba(0,0,0,0.85)_0%,rgba(0,0,0,0.25)_30%,rgba(0,0,0,0)_60%)]" />
            <div className="lg:hidden absolute inset-0 bg-[linear-gradient(180deg,rgba(0,0,0,0.15)_0%,rgba(0,0,0,0.8)_100%)]" />
          </div>
        </div>
      </section>

      <div id="events" className="max-w-7xl mx-auto px-6 mt-16">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 mb-10">
          <div className="relative flex-1 max-w-2xl group">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-500 group-focus-within:text-yellow-500 transition-colors" size={20} />
            <input
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search by event, organiser, city or tag..."
              className="w-full pl-12 pr-4 py-4 bg-gray-900 border border-gray-800 text-gray-200 focus:outline-none focus:border-yellow-500/50 focus:ring-4 focus:ring-yellow-500/10 transition-all placeholder:text-gray-600"
            />
          </div>
          <div className="flex items-center gap-2 px-4 py-2 bg-yellow-500/10 border border-yellow-500/20 rounded-xl">
            <span className="text-yellow-500 font-black text-lg">{filtered.length}</span>
            <span className="text-gray-400 text-xs font-bold uppercase tracking-widest">Events Found</span>
          </div>
        </div>

        {filtered.length === 0 ? (
          <div className="py-24 text-center bg-gray-900/50 border border-gray-800">
            <Box className="mx-auto text-gray-700 mb-4" size={48} />
            <p className="text-xl text-gray-400 font-medium">No events found matching your search</p>
            <button onClick={() => setSearch('')} className="mt-4 text-yellow-500 hover:text-yellow-400 font-bold transition-colors">Clear all filters</button>
          </div>
        ) : (
          <div className="flex flex-col border-t border-gray-800">
            {filtered.map((e) => {
              const { day, month } = parseEventDate(e.date);
              return (
                <div key={e.id} className="group flex items-center gap-4 sm:gap-5 py-5 border-b border-gray-800">
                  <Link href={`/events/${e.id}`} className="flex items-center gap-4 sm:gap-5 flex-1 min-w-0">
                    <div className="relative w-14 h-14 sm:w-16 sm:h-16 rounded-lg overflow-hidden flex-shrink-0 bg-gray-900 border border-gray-800">
                      {e.banner ? (
                        <Image src={e.banner} alt={e.eventName} fill sizes="64px" className="object-cover" />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center"><Ticket size={20} className="text-gray-700" /></div>
                      )}
                    </div>
                    <div className="flex-shrink-0 w-12 text-center">
                      <p className="text-[10px] font-bold text-yellow-500 uppercase tracking-wide">{month}</p>
                      <p className="text-xl font-black text-white leading-none mt-0.5">{day}</p>
                    </div>
                    <div className="flex-1 min-w-0">
                      <h4 className="text-base sm:text-lg font-bold text-white group-hover:text-yellow-500 transition-colors truncate">{e.eventName}</h4>
                      <p className="text-xs text-gray-500 truncate mt-1">
                        {e.time ? `${e.time} · ` : ''}
                        {e.city ? `${e.city}, ` : ''}{e.venue || ''}
                        {' · '}{e.format === 'virtual' ? 'Online' : 'In-person'}
                      </p>
                    </div>
                  </Link>
                  {e.registrationUrl ? (
                    <a
                      href={e.registrationUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="flex-shrink-0 px-4 sm:px-5 py-2 bg-yellow-500 text-black rounded-lg font-bold text-xs uppercase tracking-wide hover:bg-yellow-400 transition-colors"
                    >
                      Register
                    </a>
                  ) : (
                    <Link href={`/events/${e.id}`} className="flex-shrink-0 w-8 h-8 rounded-full bg-gray-800 flex items-center justify-center group-hover:bg-yellow-500 group-hover:text-black transition-all">
                      <ArrowRight size={16} />
                    </Link>
                  )}
                </div>
              );
            })}
          </div>
        )}
      </div>

      <div className="max-w-7xl mx-auto mt-12 px-6">
        <div className="border-t border-gray-800 pt-10">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
            <div>
              <h2 className="text-xl font-bold text-white mb-1">Hosting a Bitcoin event in Africa?</h2>
              <p className="text-gray-400 text-sm max-w-xl">
                Add your event to our directory to reach thousands of builders, educators, and
                enthusiasts across the continent.
              </p>
            </div>
            <button
              onClick={() => setShowSubmitModal(true)}
              className="flex-shrink-0 px-6 py-3 bg-yellow-500 text-black font-bold rounded-lg hover:bg-yellow-400 transition-colors"
            >
              Submit Your Event
            </button>
          </div>
          {notice && <p className="text-sm text-yellow-400 mt-4">{notice}</p>}
          <p className="text-gray-500 text-xs mt-6">
            Or join the community on{' '}
            <a href="https://t.me/+KirVlW8gMMtlNDI8" target="_blank" rel="noreferrer" className="text-yellow-500 hover:underline">Telegram</a>
            {' '}or{' '}
            <a href="https://chat.whatsapp.com/Ckny9TqxoWDJJ6MQlX5VpL" target="_blank" rel="noreferrer" className="text-yellow-500 hover:underline">WhatsApp</a>.
          </p>
        </div>
      </div>

      {showSubmitModal && (
        <div className="fixed inset-0 z-[999] flex items-center justify-center p-4 bg-black/90 backdrop-blur-xl">
          <div className="relative bg-[#0A0A0A] border border-white/10 rounded-3xl w-full max-w-3xl max-h-[90vh] overflow-y-auto">
            <div className="sticky top-0 bg-[#0A0A0A] border-b border-white/10 p-6 flex items-center justify-between z-10">
              <div>
                <h2 className="text-2xl font-bold text-white">Submit Your Event</h2>
                <p className="text-sm text-gray-400 mt-1">Share your Bitcoin event with the community</p>
              </div>
              <button onClick={() => { setShowSubmitModal(false); resetForm(); }} className="p-2 hover:bg-white/5 rounded-full transition-colors">
                <CloseIcon size={24} className="text-gray-400" />
              </button>
            </div>

            <form onSubmit={handleSubmitEvent} className="p-6 space-y-6">
              <div>
                <label className="block text-sm font-medium text-white mb-2">Event Name *</label>
                <input type="text" value={submitFormData.eventName} onChange={(e) => setSubmitFormData((prev) => ({ ...prev, eventName: e.target.value }))} required className="w-full px-4 py-3 bg-white/5 border border-white/10 text-white rounded-lg focus:border-yellow-500 focus:outline-none placeholder-gray-500" placeholder="e.g., Lagos Bitcoin Meetup" />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-white mb-2">Venue Name *</label>
                  <input type="text" value={submitFormData.venue} onChange={(e) => setSubmitFormData((prev) => ({ ...prev, venue: e.target.value }))} required className="w-full px-4 py-3 bg-white/5 border border-white/10 text-white rounded-lg focus:border-yellow-500 focus:outline-none placeholder-gray-500" placeholder="e.g., Innovation Hub" />
                </div>
                <div>
                  <label className="block text-sm font-medium text-white mb-2">Physical Address *</label>
                  <input type="text" value={submitFormData.address} onChange={(e) => setSubmitFormData((prev) => ({ ...prev, address: e.target.value }))} required className="w-full px-4 py-3 bg-white/5 border border-white/10 text-white rounded-lg focus:border-yellow-500 focus:outline-none placeholder-gray-500" placeholder="e.g., 123 Freedom Way" />
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-white mb-2">Date *</label>
                  <input type="date" value={submitFormData.date} onChange={(e) => setSubmitFormData((prev) => ({ ...prev, date: e.target.value }))} required className="w-full px-4 py-3 bg-white/5 border border-white/10 text-white rounded-lg focus:border-yellow-500 focus:outline-none" />
                </div>
                <div>
                  <label className="block text-sm font-medium text-white mb-2">Time *</label>
                  <input type="text" value={submitFormData.time} onChange={(e) => setSubmitFormData((prev) => ({ ...prev, time: e.target.value }))} required placeholder="e.g., 6:00 PM" className="w-full px-4 py-3 bg-white/5 border border-white/10 text-white rounded-lg focus:border-yellow-500 focus:outline-none placeholder-gray-500" />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-white mb-2">Event Description *</label>
                <textarea value={submitFormData.description} onChange={(e) => setSubmitFormData((prev) => ({ ...prev, description: e.target.value }))} required rows="4" className="w-full px-4 py-3 bg-white/5 border border-white/10 text-white rounded-lg focus:border-yellow-500 focus:outline-none resize-none placeholder-gray-500" placeholder="Tell everyone what this event is about..." />
              </div>

              <div>
                <label className="block text-sm font-medium text-white mb-2">Event Banner Image *</label>
                <div className="flex gap-2 mb-4">
                  <button type="button" onClick={() => setImageMode('url')} className={`flex-1 py-2 px-4 rounded-lg text-sm font-medium transition-all ${imageMode === 'url' ? 'bg-yellow-500 text-black' : 'bg-gray-700 text-gray-400'}`}>URL</button>
                  <button type="button" onClick={() => setImageMode('file')} className={`flex-1 py-2 px-4 rounded-lg text-sm font-medium transition-all ${imageMode === 'file' ? 'bg-yellow-500 text-black' : 'bg-gray-700 text-gray-400'}`}>Upload</button>
                </div>

                {imageMode === 'url' ? (
                  <input type="url" value={submitFormData.banner instanceof Blob ? '' : submitFormData.banner} onChange={(e) => setSubmitFormData((prev) => ({ ...prev, banner: e.target.value }))} required className="w-full px-4 py-3 bg-white/5 border border-white/10 text-white rounded-lg focus:border-yellow-500 focus:outline-none placeholder-gray-500" placeholder="https://example.com/banner.jpg" />
                ) : (
                  <input type="file" onChange={handleFileChange} accept="image/*" className="w-full px-4 py-3 bg-white/5 border border-white/10 text-white rounded-lg focus:border-yellow-500 focus:outline-none file:mr-4 file:py-2 file:px-4 file:rounded-md file:border-0 file:bg-yellow-500 file:text-black file:cursor-pointer" />
                )}

                {imagePreview && (
                  <div className="mt-4 rounded-lg overflow-hidden border border-white/10 h-32">
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img src={imagePreview} className="w-full h-full object-cover" alt="Preview" />
                  </div>
                )}
              </div>

              <div>
                <label className="block text-sm font-medium text-white mb-2">Registration Link (Optional)</label>
                <input type="url" value={submitFormData.registrationUrl} onChange={(e) => setSubmitFormData((prev) => ({ ...prev, registrationUrl: e.target.value }))} className="w-full px-4 py-3 bg-white/5 border border-white/10 text-white rounded-lg focus:border-yellow-500 focus:outline-none placeholder-gray-500" placeholder="https://register.example.com/your-event" />
              </div>

              <div className="flex gap-3 pt-4">
                <button type="submit" disabled={submitting} className="flex-1 flex items-center justify-center gap-2 px-6 py-3 bg-yellow-500 text-black font-bold rounded-xl hover:bg-yellow-400 disabled:opacity-50 disabled:cursor-not-allowed transition-all">
                  <Save size={18} />
                  {submitting ? 'Submitting...' : 'Submit Event'}
                </button>
                <button type="button" onClick={() => setShowSubmitModal(false)} className="px-6 py-3 bg-gray-800 text-white font-bold rounded-xl hover:bg-gray-700 transition-all">
                  Cancel
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
