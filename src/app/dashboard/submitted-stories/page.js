'use client';

import ModerationQueue from '@/components/dashboard/ModerationQueue';

const config = {
  title: 'Submitted Stories',
  sourceCollection: 'submitted_stories',
  targetCollection: 'news',
  primaryField: 'title',
  secondaryField: 'authorName',
  imageField: 'image',
  // Map the public submission shape onto the live `news` article shape.
  transform: (item) => ({
    title: item.title || '',
    slug: item.slug || (item.title || '').toLowerCase().replace(/[^a-z0-9\s-]/g, '').replace(/\s+/g, '-'),
    excerpt: item.excerpt || '',
    content: item.content || '',
    category: item.category || 'Community',
    image: item.image || '',
    author: item.authorName || 'Community Contributor',
    authorImage: item.authorImage || '',
    authorLinkedIn: item.authorLinkedIn || '',
    authorX: item.authorX || '',
    date: item.date || new Date().toISOString().split('T')[0],
    readTime: item.readTime || '5 min read',
    youtubeUrl: item.youtubeUrl || '',
    status: 'published',
    isPopular: false,
    isTopStory: false,
  }),
};

export default function SubmittedStoriesPage() {
  return <ModerationQueue config={config} />;
}
