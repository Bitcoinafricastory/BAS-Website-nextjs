/**
 * PILLAR PAGES — topic hub configuration.
 *
 * Each entry here becomes a live pillar page at /<slug>, rendered by the
 * shared PillarPage component. The page assembles itself from real data:
 * directory entities matching `entityTypes`, plus articles matching
 * `articleCategories` OR linked (via linkedEntityIds) to any of the pillar's
 * entities. Stats in the hero are computed live from the same data.
 *
 * ── HOW TO ADD A NEW PILLAR ─────────────────────────────────────────────
 * 1. Copy an existing config object below and give it a unique `slug`.
 * 2. Hand-write the `intro` and the `answerBox` copy. Never template this —
 *    the answer box is the paragraph search engines and AI assistants will
 *    quote, so it deserves real editorial care.
 * 3. Set `entityTypes` (which directory entity types belong on this pillar)
 *    and `articleCategories` (which news categories count as coverage).
 * 4. That's it — the route, metadata, schema, and sitemap entry all derive
 *    from this file automatically.
 *
 * BEFORE launching a pillar, make sure the content exists to fill it:
 * a pillar with one entity and two articles reads as thin content and does
 * more SEO harm than good. Rule of thumb: 3+ entities or 5+ articles.
 * ────────────────────────────────────────────────────────────────────────
 */

export const PILLARS = [
  {
    slug: 'bitcoin-circular-economies',
    eyebrow: 'Topic Hub',
    // Title renders as: `${title} ${accent}` with the accent in gold italics.
    title: 'Bitcoin Circular',
    accent: 'Economies',
    metaTitle: 'Bitcoin Circular Economies in Africa',
    intro:
      'Communities across the continent where Bitcoin is earned, spent, and saved daily — documented on the ground by our reporters.',
    answerBox: {
      question: 'What is a Bitcoin circular economy?',
      answer:
        'A local economy where Bitcoin circulates as everyday money — residents earn it through work, spend it at neighborhood merchants, and save in it — rather than converting in and out of local currency. Africa is home to some of the most developed examples in the world.',
    },
    entityTypes: ['community'],
    articleCategories: ['Adoption', 'Economy'],
    entitiesHeading: { eyebrow: 'The communities', title: "Where it's happening" },
    coverageHeading: { eyebrow: 'Coverage', title: 'Latest stories on circular economies' },
    cta: {
      text: "Running a circular economy we haven't covered yet? We want to document it.",
      label: 'Tell us your story',
      href: '/contact',
    },
  },
];

export function getPillarBySlug(slug) {
  return PILLARS.find((p) => p.slug === slug) || null;
}
