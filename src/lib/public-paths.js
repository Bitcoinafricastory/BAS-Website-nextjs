// Which public pages show a given Firestore document. Used to tell search
// engines (IndexNow) and our own cache (revalidatePath) what changed when the
// dashboard adds, edits or deletes something.

const enc = (v) => encodeURIComponent(String(v));

export function publicPathsFor(collectionName, item = {}) {
  const id = item.id;
  const slug = item.slug;
  switch (collectionName) {
    case 'news':
      return [(slug || id) && `/news/${enc(slug || id)}`, '/news', '/'].filter(Boolean);
    case 'events':
      return [id && `/events/${enc(id)}`, '/events'].filter(Boolean);
    case 'entities':
      return [slug && `/directory/${enc(slug)}`, '/directory'].filter(Boolean);
    case 'authors':
      return [slug && `/authors/${enc(slug)}`, '/authors'].filter(Boolean);
    case 'education_programs':
      return [id && `/education/our-programs/${enc(id)}`, '/education'].filter(Boolean);
    case 'other_programs':
      return [id && `/education/programs/${enc(id)}`, '/education'].filter(Boolean);
    case 'podcasts':
      return ['/podcast'];
    case 'faqs':
      return ['/faq'];
    case 'testimonials':
      return ['/'];
    case 'educationTestimonials':
    case 'bitcoin_videos':
    case 'whyBitcoinVideo':
      return ['/education'];
    case 'bitcoin_resources':
      return ['/resources'];
    default:
      return [];
  }
}
