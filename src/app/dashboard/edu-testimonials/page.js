'use client';

import CrudManager from '@/components/dashboard/CrudManager';

const config = {
  title: 'Education Testimonial',
  collectionName: 'educationTestimonials',
  listPrimary: 'name',
  listSecondary: 'text',
  listImage: 'image',
  fields: [
    { name: 'name', label: 'Name', type: 'text' },
    { name: 'role', label: 'Role', type: 'text', placeholder: 'e.g. Bitcoin Diploma Graduate' },
    { name: 'text', label: 'Testimonial', type: 'textarea' },
    { name: 'image', label: 'Photo', type: 'image', aspect: 'aspect-square' },
  ],
};

export default function EduTestimonialsPage() {
  return <CrudManager config={config} />;
}
