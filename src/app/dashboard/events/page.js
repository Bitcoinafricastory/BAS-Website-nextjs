'use client';

import CrudManager from '@/components/dashboard/CrudManager';

const config = {
  title: 'Event',
  collectionName: 'events',
  orderField: 'createdAt',
  listPrimary: 'eventName',
  listSecondary: 'date',
  listImage: 'banner',
  fields: [
    { name: 'eventName', label: 'Event Name', type: 'text', placeholder: 'e.g. Lagos Bitcoin Meetup' },
    { name: 'banner', label: 'Event Banner', type: 'image' },
    { name: 'date', label: 'Date', type: 'text', placeholder: 'e.g. 2026-08-15' },
    { name: 'time', label: 'Time', type: 'text', placeholder: 'e.g. 6:00 PM' },
    { name: 'venue', label: 'Venue', type: 'text', placeholder: 'e.g. Innovation Hub' },
    { name: 'city', label: 'City', type: 'text', placeholder: 'e.g. Lagos' },
    { name: 'format', label: 'Format', type: 'select', options: ['in-person', 'virtual'] },
    { name: 'organiser', label: 'Organiser', type: 'text' },
    { name: 'description', label: 'Description', type: 'textarea' },
    { name: 'registrationUrl', label: 'Registration Link', type: 'url', placeholder: 'https://…' },
  ],
};

export default function EventsPage() {
  return <CrudManager config={config} />;
}
