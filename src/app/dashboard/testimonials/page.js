'use client';

import CrudManager from '@/components/dashboard/CrudManager';

const config = {
  title: 'Testimonial',
  collectionName: 'testimonials',
  listPrimary: 'name',
  listSecondary: 'text',
  listImage: 'image',
  fields: [
    { name: 'name', label: 'Name', type: 'text', placeholder: 'e.g. Amara O.' },
    { name: 'role', label: 'Role / Location', type: 'text', placeholder: 'e.g. Lagos, Nigeria' },
    { name: 'text', label: 'Testimonial', type: 'textarea' },
    { name: 'image', label: 'Photo', type: 'image', aspect: 'aspect-square' },
    { name: 'twitterLink', label: 'X / Twitter Link', type: 'url', placeholder: 'https://x.com/…' },
  ],
};

export default function TestimonialsPage() {
  return <CrudManager config={config} />;
}
