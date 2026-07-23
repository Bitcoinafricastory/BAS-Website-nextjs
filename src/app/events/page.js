import { getAllEvents } from '@/lib/events';
import { eventListSchema, jsonLdScript } from '@/lib/schema';
import EventsContent from './EventsContent';

export const revalidate = 300;

export const metadata = {
  title: 'Bitcoin Events in Africa',
  description:
    'Discover and participate in Bitcoin meetups, conferences, and workshops across Africa. Join the circular economy movement.',
  alternates: { canonical: 'https://bitcoinafricastory.com/events' },
};

export default async function EventsPage() {
  const events = await getAllEvents();
  const listSchema = eventListSchema(events);
  return (
    <>
      {listSchema && (
        <script type="application/ld+json" dangerouslySetInnerHTML={jsonLdScript(listSchema)} />
      )}
      <EventsContent initialEvents={events} />
    </>
  );
}
