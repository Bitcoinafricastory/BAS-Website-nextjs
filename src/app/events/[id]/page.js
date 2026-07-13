import { notFound } from 'next/navigation';
import Link from 'next/link';
import Image from 'next/image';
import { ArrowLeft, Calendar, MapPin, Clock } from 'lucide-react';
import { getEventById } from '@/lib/events';
import Breadcrumbs from '@/components/Breadcrumbs';
import { eventSchema, breadcrumbSchema, jsonLdScript, SITE_URL } from '@/lib/schema';

export const revalidate = 300;

export async function generateMetadata({ params }) {
  const { id } = await params;
  const event = await getEventById(id);
  if (!event) return {};

  return {
    title: event.eventName,
    description: event.description || `${event.eventName} — a Bitcoin event hosted by Bitcoin Africa Story.`,
    alternates: { canonical: `https://bitcoinafricastory.com/events/${id}` },
  };
}

export default async function EventDetailsPage({ params }) {
  const { id } = await params;
  const event = await getEventById(id);
  if (!event) notFound();

  const crumbs = [
    { name: 'Home', url: `${SITE_URL}/` },
    { name: 'Events', url: `${SITE_URL}/events` },
    { name: event.eventName, url: `${SITE_URL}/events/${id}` },
  ];

  return (
    <div className="min-h-screen bg-black text-white pt-24 pb-20">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={jsonLdScript(eventSchema({ ...event, id }))}
      />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={jsonLdScript(breadcrumbSchema(crumbs))}
      />
      <div className="relative h-[300px] md:h-[400px] w-full overflow-hidden">
        {event.banner ? (
          <>
            <Image
              src={event.banner}
              alt={event.eventName}
              fill
              priority
              sizes="100vw"
              className="object-cover"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-black via-black/50 to-transparent" />
          </>
        ) : (
          <div className="w-full h-full bg-gray-900 border-b border-gray-800 flex items-center justify-center">
            <span className="text-gray-600 italic">No Banner Image</span>
          </div>
        )}

        <div className="absolute top-6 left-6 z-10">
          <Link href="/events" className="flex items-center gap-2 px-4 py-2 bg-black/50 hover:bg-black/70 backdrop-blur-sm rounded-full text-white transition-all border border-gray-700">
            <ArrowLeft size={18} />
            <span>Back</span>
          </Link>
        </div>
      </div>

      <div className="max-w-5xl mx-auto px-6 -mt-20 relative z-10">
        <Breadcrumbs
          items={[
            { name: 'Home', url: '/' },
            { name: 'Events', url: '/events' },
            { name: event.eventName },
          ]}
          className="mb-4"
        />
        <div className="bg-gray-900 border border-gray-800 rounded-2xl p-6 md:p-10 shadow-2xl">
          <div className="flex flex-col md:flex-row gap-8 justify-between items-start">
            <div className="flex-1">
              <div className="flex flex-wrap gap-2 mb-4">
                <span className="px-3 py-1 bg-yellow-500/10 text-yellow-500 text-xs font-bold uppercase tracking-wider rounded-full">
                  {event.format === 'virtual' ? 'Virtual Event' : 'In-Person Event'}
                </span>
                {event.city && (
                  <span className="px-3 py-1 bg-gray-800 text-gray-400 text-xs font-bold uppercase tracking-wider rounded-full">{event.city}</span>
                )}
              </div>

              <h1 className="text-3xl md:text-5xl font-bold text-white mb-6 leading-tight">{event.eventName}</h1>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-gray-300 mb-8">
                <div className="flex items-center gap-3 p-3 bg-black/30 rounded-lg border border-gray-800">
                  <div className="w-10 h-10 rounded-full bg-yellow-500/10 flex items-center justify-center text-yellow-500">
                    <Calendar size={20} />
                  </div>
                  <div>
                    <div className="text-xs text-gray-500 uppercase font-semibold">Date</div>
                    <div>{event.date}</div>
                  </div>
                </div>

                <div className="flex items-center gap-3 p-3 bg-black/30 rounded-lg border border-gray-800">
                  <div className="w-10 h-10 rounded-full bg-yellow-500/10 flex items-center justify-center text-yellow-500">
                    <Clock size={20} />
                  </div>
                  <div>
                    <div className="text-xs text-gray-500 uppercase font-semibold">Time</div>
                    <div>{event.time || 'TBA'}</div>
                  </div>
                </div>

                <div className="flex items-center gap-3 p-3 bg-black/30 rounded-lg border border-gray-800 sm:col-span-2">
                  <div className="w-10 h-10 rounded-full bg-yellow-500/10 flex items-center justify-center text-yellow-500">
                    <MapPin size={20} />
                  </div>
                  <div>
                    <div className="text-xs text-gray-500 uppercase font-semibold">Location</div>
                    <div>{event.venue || event.location || 'Online'}</div>
                  </div>
                </div>
              </div>
            </div>

            <div className="w-full md:w-80 shrink-0 space-y-4">
              <div className="p-6 bg-black/50 border border-gray-800 rounded-xl">
                <h3 className="text-lg font-bold text-white mb-4">Organized by</h3>
                <p className="text-yellow-500 font-medium text-lg mb-6">{event.organiser || 'Bitcoin Africa Community'}</p>

                {event.registrationUrl ? (
                  <a href={event.registrationUrl} target="_blank" rel="noreferrer" className="block w-full py-4 bg-yellow-500 hover:bg-yellow-400 text-black font-extrabold text-center rounded-lg transition-colors shadow-lg shadow-yellow-500/20">
                    REGISTER NOW
                  </a>
                ) : (
                  <button disabled className="block w-full py-4 bg-gray-800 text-gray-500 font-bold text-center rounded-lg cursor-not-allowed">
                    Registration Closed
                  </button>
                )}
              </div>
            </div>
          </div>

          <div className="mt-12 pt-10 border-t border-gray-800">
            <h3 className="text-2xl font-bold text-white mb-6">About this Event</h3>
            <div className="prose prose-invert prose-lg max-w-none text-gray-400">
              <p className="whitespace-pre-wrap leading-relaxed">{event.description || event.details || 'No description provided for this event.'}</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
