'use client';

import CrudManager from '@/components/dashboard/CrudManager';

const config = {
  title: 'Author',
  collectionName: 'authors',
  listPrimary: 'name',
  listSecondary: 'role',
  listImage: 'avatar',
  fields: [
    { name: 'name', label: 'Full Name', type: 'text', placeholder: 'e.g. Destiny Smart' },
    { name: 'slug', label: 'URL Slug', type: 'text', placeholder: 'e.g. destiny-smart (letters, numbers, hyphens only)' },
    { name: 'role', label: 'Role', type: 'text', placeholder: 'e.g. Founder & Editor' },
    { name: 'location', label: 'Location', type: 'text', placeholder: 'e.g. Lagos, Nigeria' },
    { name: 'bio', label: 'Bio', type: 'textarea', placeholder: 'Short biographical paragraph shown on their profile and at the end of every article they write.' },
    { name: 'avatar', label: 'Portrait Photo', type: 'image', aspect: 'aspect-square' },
    { name: 'twitter', label: 'X / Twitter URL', type: 'url', placeholder: 'https://x.com/username' },
    { name: 'linkedin', label: 'LinkedIn URL', type: 'url', placeholder: 'https://linkedin.com/in/username' },
    { name: 'nostr', label: 'Nostr npub', type: 'text', placeholder: 'npub1…' },
    { name: 'website', label: 'Personal Website', type: 'url', placeholder: 'https://…' },
    { name: 'email', label: 'Public Email', type: 'text', placeholder: 'writer@example.com (leave blank to hide)' },
    {
      name: 'isActive',
      label: 'Status',
      type: 'select',
      options: ['active', 'inactive'],
    },
  ],
};

export default function AuthorsPage() {
  return <CrudManager config={config} />;
}
