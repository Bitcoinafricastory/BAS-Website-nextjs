'use client';

import CrudManager from '@/components/dashboard/CrudManager';

const config = {
  title: 'Bitcoin Resource',
  collectionName: 'bitcoin_resources',
  orderField: 'createdAt',
  listPrimary: 'title',
  listSecondary: 'subtitle',
  listImage: 'imageSrc',
  fields: [
    { name: 'title', label: 'Resource Title', type: 'text' },
    { name: 'subtitle', label: 'Subtitle / Description', type: 'textarea' },
    { name: 'imageSrc', label: 'Image', type: 'image' },
    { name: 'imageAlt', label: 'Image Alt Text', type: 'text', placeholder: 'Describe the image' },
    { name: 'link', label: 'Resource Link', type: 'url', placeholder: 'https://…' },
  ],
};

export default function ResourcesPage() {
  return <CrudManager config={config} />;
}
