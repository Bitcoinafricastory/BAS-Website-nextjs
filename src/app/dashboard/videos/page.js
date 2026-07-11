'use client';

import CrudManager from '@/components/dashboard/CrudManager';

const config = {
  title: 'Bitcoin Video',
  collectionName: 'bitcoin_videos',
  orderField: 'createdAt',
  listPrimary: 'title',
  listSecondary: 'category',
  listImage: 'thumbnailUrl',
  fields: [
    { name: 'title', label: 'Video Title', type: 'text' },
    { name: 'category', label: 'Category', type: 'select', options: ['PROTOCOL', 'ECONOMICS', 'PRIVACY', 'MINING', 'LIGHTNING', 'ADOPTION'] },
    { name: 'duration', label: 'Duration', type: 'text', placeholder: 'e.g. 12:45' },
    { name: 'embedUrl', label: 'Embed URL', type: 'url', placeholder: 'https://youtube.com/embed/…' },
    { name: 'thumbnailUrl', label: 'Thumbnail', type: 'image' },
    { name: 'description', label: 'Description', type: 'textarea' },
  ],
};

export default function VideosPage() {
  return <CrudManager config={config} />;
}
