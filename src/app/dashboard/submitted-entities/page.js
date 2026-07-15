'use client';

import ModerationQueue from '@/components/dashboard/ModerationQueue';
import { slugifyEntity } from '@/lib/entities';

const config = {
  title: 'Submitted Directory Entries',
  sourceCollection: 'submittedEntities',
  targetCollection: 'entities',
  primaryField: 'name',
  secondaryField: 'country',
  imageField: 'logo',
  // Approving here only publishes the listing with a Community Submitted
  // badge — it never claims editorial review happened. Additional badges
  // (Editorial Reviewed, Interview Conducted, etc.) get added later in
  // Directory once someone on the team actually does that work.
  transform: (item) => ({
    name: item.name || '',
    slug: slugifyEntity(item.name || ''),
    type: item.type || 'community',
    logo: item.logo || '',
    website: item.link || item.website || '',
    description: item.description || '',
    country: item.country || '',
    city: item.city || '',
    socialLinks: {},
    contactEmail: '',
    yearFounded: '',
    bitcoinFocus: '',
    founder: '',
    coverImage: '',
    tags: [],
    featured: false,
    relatedEntityIds: [],
    externalCoverage: [],
    badges: [{
      level: 'community_submitted',
      dateEarned: new Date().toISOString().slice(0, 10),
      evidence: 'Public submission form',
    }],
  }),
};

export default function SubmittedEntitiesPage() {
  return <ModerationQueue config={config} />;
}
