'use client';

import CrudManager from '@/components/dashboard/CrudManager';

const config = {
  title: 'Education Program',
  collectionName: 'education_programs',
  orderField: 'createdAt',
  listPrimary: 'title',
  listSecondary: 'desc',
  listImage: 'image',
  fields: [
    { name: 'title', label: 'Program Title', type: 'text', placeholder: 'e.g. Bitcoin Diploma' },
    { name: 'level', label: 'Level', type: 'select', options: ['BEGINNER', 'INTERMEDIATE', 'ADVANCED', 'EXPERT'] },
    { name: 'price', label: 'Price', type: 'text', placeholder: 'FREE' },
    { name: 'duration', label: 'Duration', type: 'text', placeholder: 'e.g. 6 weeks' },
    { name: 'image', label: 'Cover Image', type: 'image' },
    { name: 'desc', label: 'Short Description (used on cards)', type: 'textarea' },
    { name: 'content', label: 'Full Program Details (optional, rich text)', type: 'richtext' },
    { name: 'link', label: 'Enrolment Link', type: 'url', placeholder: 'https://…' },
  ],
};

export default function ProgramsPage() {
  return <CrudManager config={config} />;
}
