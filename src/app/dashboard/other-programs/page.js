'use client';

import CrudManager from '@/components/dashboard/CrudManager';

const config = {
  title: 'Other Program',
  collectionName: 'other_programs',
  orderField: 'createdAt',
  listPrimary: 'title',
  listSecondary: 'desc',
  listImage: 'image',
  fields: [
    { name: 'title', label: 'Program Title', type: 'text' },
    { name: 'level', label: 'Level', type: 'select', options: ['BEGINNER', 'INTERMEDIATE', 'ADVANCED', 'EXPERT'] },
    { name: 'price', label: 'Price', type: 'text', placeholder: 'FREE' },
    { name: 'image', label: 'Cover Image', type: 'image' },
    { name: 'desc', label: 'Short Description (used on cards)', type: 'textarea', placeholder: 'What does this program do?' },
    { name: 'content', label: 'Full Program Details (optional, rich text)', type: 'richtext' },
    { name: 'link', label: 'Program Link', type: 'url', placeholder: 'https://…' },
  ],
};

export default function OtherProgramsPage() {
  return <CrudManager config={config} />;
}
