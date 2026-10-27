// Who can see and change what in the dashboard.
//
// Three levels:
// - Owner: the addresses in ADMIN_EMAILS (server) / isAdmin() (security
//   rules). Everything, including deleting, Team, Activity, Analytics and
//   the newsletter list.
// - Editor: adds, edits and publishes in the sections the owner gives them.
// - Writer: same sections idea, but articles stay as drafts or go "In review"
//   for an owner or editor to publish. Elsewhere they add and edit like an
//   editor.
// Nobody but the owner can delete. The real enforcement is in
// firestore.rules / storage.rules and the server routes; this file drives the
// dashboard UI and must list the same collections as those rules.
// No Firebase imports, so it works on the server and in the browser.

export const ROLES = [
  { value: 'editor', label: 'Editor', hint: 'Adds, edits and publishes in their sections. Can’t delete.' },
  { value: 'writer', label: 'Writer', hint: 'Writes articles as drafts for review; adds and edits in their other sections. Can’t publish articles or delete.' },
];

export const SECTIONS = [
  { id: 'articles', label: 'Articles', hint: 'News & Stories, story submissions, image descriptions',
    paths: ['/dashboard/news', '/dashboard/submitted-stories', '/dashboard/image-descriptions'],
    collections: ['news', 'submitted_stories'] },
  { id: 'directory', label: 'Directory', hint: 'Directory profiles and directory submissions',
    paths: ['/dashboard/entities', '/dashboard/submitted-entities'],
    collections: ['entities', 'submittedEntities'] },
  { id: 'events', label: 'Events', hint: 'Events and event submissions',
    paths: ['/dashboard/events', '/dashboard/submitted-events'],
    collections: ['events', 'submittedEvents'] },
  { id: 'podcasts', label: 'Podcast episodes', paths: ['/dashboard/podcasts'], collections: ['podcasts'] },
  { id: 'faqs', label: 'FAQs', paths: ['/dashboard/faqs'], collections: ['faqs'] },
  { id: 'education', label: 'Education', hint: 'Programs, videos, Why Bitcoin video, resources',
    paths: ['/dashboard/programs', '/dashboard/other-programs', '/dashboard/videos', '/dashboard/why-video', '/dashboard/resources'],
    collections: ['education_programs', 'other_programs', 'bitcoin_videos', 'whyBitcoinVideo', 'bitcoin_resources'] },
  { id: 'testimonials', label: 'Testimonials', hint: 'X testimonials and education testimonials',
    paths: ['/dashboard/testimonials', '/dashboard/edu-testimonials'],
    collections: ['testimonials', 'educationTestimonials'] },
  { id: 'writers', label: 'Writer profiles', hint: 'The Authors page', paths: ['/dashboard/authors'], collections: ['authors'] },
];

export const SECTION_IDS = SECTIONS.map((s) => s.id);

// Pages only the owner sees.
export const OWNER_ONLY_PATHS = ['/dashboard/analytics', '/dashboard/newsletter', '/dashboard/team', '/dashboard/activity'];

// AI requests per staff member per day (UTC). The owner has no limit.
export const STAFF_AI_DAILY_LIMIT = 30;

const under = (path, base) => path === base || path.startsWith(base + '/');

export function sectionForPath(path) {
  return SECTIONS.find((s) => s.paths.some((p) => under(path, p)))?.id || null;
}

export function sectionForCollection(name) {
  return SECTIONS.find((s) => s.collections.includes(name))?.id || null;
}

/** access: { owner: boolean, role, sections: string[] } */
export function canUseSection(access, sectionId) {
  if (!access) return false;
  if (access.owner) return true;
  return !!sectionId && (access.sections || []).includes(sectionId);
}

export function canOpenPath(access, path) {
  if (!access) return false;
  if (access.owner) return true;
  if (path === '/dashboard') return true;
  if (OWNER_ONLY_PATHS.some((p) => under(path, p))) return false;
  const section = sectionForPath(path);
  return section ? canUseSection(access, section) : false;
}

/** Writers can't publish articles; owners and editors can. */
export function canPublishArticles(access) {
  return !!access && (access.owner || access.role === 'editor');
}

export function canDelete(access) {
  return !!access?.owner;
}

/** Today's date as the security rules see it: midnight UTC. */
export function aiUsageDay(date = new Date()) {
  return new Date(Date.UTC(date.getUTCFullYear(), date.getUTCMonth(), date.getUTCDate()));
}
