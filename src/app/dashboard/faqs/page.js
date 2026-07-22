'use client';

import CrudManager from '@/components/dashboard/CrudManager';

const config = {
  title: 'FAQ',
  collectionName: 'faqs',
  listPrimary: 'question',
  listSecondary: 'category',
  fields: [
    { name: 'category', label: 'Category', type: 'select', options: [
      'General', 'News & Stories', 'Education', 'Directory', 'Events', 'Podcast', 'Donations', 'Contributing',
    ] },
    { name: 'question', label: 'Question', type: 'text', placeholder: 'e.g. How do I submit a story?' },
    { name: 'answer', label: 'Answer (rich text)', type: 'richtext' },
    { name: 'order', label: 'Sort order (lower shows first, e.g. 1, 2, 3…)', type: 'text', placeholder: '1' },
  ],
};

export default function FAQsAdminPage() {
  return <CrudManager config={config} />;
}
