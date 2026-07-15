// Single source of truth for the African Bitcoin Directory's type system.
// Adding a new directory type (e.g. "Wallet") is a one-line edit here — the
// admin form, public filters, and badges all read from this file rather than
// hardcoding type-specific logic anywhere else.

export const ENTITY_TYPES = [
  { value: 'community', label: 'Community / Meetup', icon: 'users' },
  { value: 'circular_economy', label: 'Circular Economy', icon: 'refresh' },
  { value: 'organization', label: 'Organization', icon: 'building' },
  { value: 'company', label: 'Company', icon: 'briefcase' },
  { value: 'brand', label: 'Brand', icon: 'tag' },
  { value: 'project', label: 'Project', icon: 'cube' },
  { value: 'conference', label: 'Conference / Event', icon: 'calendar-event' },
  { value: 'developer', label: 'Developer / Infrastructure', icon: 'code' },
  { value: 'wallet', label: 'Wallet', icon: 'wallet' },
  { value: 'ngo', label: 'NGO / Nonprofit', icon: 'heart' },
  { value: 'podcast', label: 'Podcast', icon: 'microphone' },
  { value: 'publication', label: 'Publication / Media', icon: 'news' },
  { value: 'education', label: 'Educational Initiative', icon: 'book' },
  { value: 'person', label: 'Person', icon: 'user' },
];

export function entityTypeLabel(value) {
  return ENTITY_TYPES.find((t) => t.value === value)?.label || value;
}

export function entityTypeIcon(value) {
  return ENTITY_TYPES.find((t) => t.value === value)?.icon || 'building';
}

export const ENTITY_COUNTRIES = [
  'Pan-African / Multiple Countries',
  'Nigeria',
  'Kenya',
  'South Africa',
  'Ghana',
  'Zambia',
  'Zimbabwe',
  'Malawi',
  'Uganda',
  'Tanzania',
  'Ethiopia',
  'Senegal',
  'Ivory Coast',
  'Benin',
  'Togo',
  'Sudan',
  'Eritrea',
  'Rwanda',
  'Botswana',
  'Namibia',
  'Cameroon',
  'Egypt',
  'Morocco',
  'Other African Country',
];

// Badges are additive, not a ladder — an entity can hold several at once.
// `weight` is display-order only (highest shown on compact cards); it does
// NOT mean a higher badge implies the lower ones were also earned.
export const BADGE_LEVELS = [
  { value: 'field_verified', label: 'Field verified', weight: 5 },
  { value: 'reporter_verified', label: 'Reporter verified', weight: 4 },
  { value: 'interview_conducted', label: 'Interview conducted', weight: 3 },
  { value: 'editorial_reviewed', label: 'Editorial reviewed', weight: 2 },
  { value: 'community_submitted', label: 'Community submitted', weight: 1 },
];

export function badgeLabel(value) {
  return BADGE_LEVELS.find((b) => b.value === value)?.label || value;
}

export function badgeWeight(value) {
  return BADGE_LEVELS.find((b) => b.value === value)?.weight || 0;
}

// Sorts an entity's badges array (highest weight first) and returns
// { top, rest } so cards can render "Reporter verified +2" compactly.
export function summarizeBadges(badges = []) {
  const sorted = [...badges].sort((a, b) => badgeWeight(b.level) - badgeWeight(a.level));
  return { top: sorted[0] || null, rest: sorted.slice(1) };
}

// Types of items in an entity's manually-added `externalCoverage` list —
// things outside BAS's own content (third-party interviews, PDFs, videos).
// Coverage from BAS's own articles/podcasts is linked separately via
// `linkedEntityIds` on those documents (Stage 2), not stored here.
export const COVERAGE_TYPES = [
  'Interview',
  'Documentary / Video',
  'Research Report',
  'External Article',
  'Other',
];
