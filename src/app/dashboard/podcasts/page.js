'use client';

import CrudManager from '@/components/dashboard/CrudManager';

const config = {
  title: 'Podcast Episode',
  collectionName: 'podcasts',
  listPrimary: 'title',
  listSecondary: 'description',
  listImage: 'image',
  fields: [
    { name: 'title', label: 'Episode Title', type: 'text', placeholder: 'e.g. Bitcoin Africa Story Podcast with Tumelo Hika' },
    { name: 'episodeNumber', label: 'Episode Number', type: 'text', placeholder: 'e.g. 2' },
    { name: 'description', label: 'Description', type: 'textarea' },
    { name: 'image', label: 'Thumbnail', type: 'image', aspect: 'aspect-video' },
    { name: 'url', label: 'YouTube Link', type: 'url', placeholder: 'https://www.youtube.com/watch?v=…' },
    { name: 'date', label: 'Publish Date', type: 'text', placeholder: 'e.g. 2026-05-12' },
    { name: 'linkedEntityIds', label: 'Linked Directory Profiles', type: 'entities' },
  ],
};

export default function PodcastsPage() {
  return <CrudManager config={config} />;
}
