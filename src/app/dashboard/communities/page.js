'use client';

import CrudManager from '@/components/dashboard/CrudManager';

const config = {
  title: 'Community',
  collectionName: 'communities',
  listPrimary: 'name',
  listSecondary: 'description',
  listImage: 'logo',
  fields: [
    { name: 'name', label: 'Community Name', type: 'text', placeholder: 'e.g. Bitcoin Ikorodu' },
    { name: 'logo', label: 'Logo', type: 'image', aspect: 'aspect-square' },
    { name: 'link', label: 'Website / Link', type: 'url', placeholder: 'https://…' },
    { name: 'description', label: 'Description', type: 'textarea', placeholder: 'What does this community do?' },
  ],
};

export default function CommunitiesPage() {
  return <CrudManager config={config} />;
}
