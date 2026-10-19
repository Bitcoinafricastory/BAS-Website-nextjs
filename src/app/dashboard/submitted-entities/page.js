'use client';

import ModerationQueue from '@/components/dashboard/ModerationQueue';
import { slugifyEntity, findEntitiesBySlug } from '@/lib/entities';
import { normalizeBlinkUsername, isValidBlinkUsername } from '@/lib/blink';

const cleanBlink = (v) => { const u = normalizeBlinkUsername(v); return isValidBlinkUsername(u) ? u : ''; };

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
  // Approving a business that's already listed used to create a second copy.
  beforeApprove: async (payload) => {
    const existing = await findEntitiesBySlug(payload.slug);
    return existing.length
      ? `“${existing[0].name}” is already in the directory. Reject this submission, or add its details to the existing profile.`
      : null;
  },
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
    blinkUsername: cleanBlink(item.blinkUsername),
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
