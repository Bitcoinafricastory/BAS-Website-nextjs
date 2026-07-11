'use client';

import ModerationQueue from '@/components/dashboard/ModerationQueue';

const config = {
  title: 'Submitted Events',
  sourceCollection: 'submittedEvents',
  targetCollection: 'events',
  primaryField: 'eventName',
  secondaryField: 'date',
  imageField: 'banner',
  transform: (item) => ({
    eventName: item.eventName || '',
    banner: item.banner || '',
    date: item.date || '',
    time: item.time || '',
    venue: item.venue || '',
    address: item.address || '',
    city: item.city || '',
    format: item.format || 'in-person',
    organiser: item.organiser || '',
    description: item.description || '',
    registrationUrl: item.registrationUrl || '',
  }),
};

export default function SubmittedEventsPage() {
  return <ModerationQueue config={config} />;
}
