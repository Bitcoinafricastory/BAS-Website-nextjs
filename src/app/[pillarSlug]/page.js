import { notFound } from 'next/navigation';
import { PILLARS, getPillarBySlug } from '@/lib/pillars';
import { getEntities } from '@/lib/entities';
import { getAllNews } from '@/lib/news';
import { SITE_URL, breadcrumbSchema, jsonLdScript } from '@/lib/schema';
import PillarPage from '@/components/PillarPage';

export const revalidate = 300;

// Only slugs registered in src/lib/pillars.js resolve; everything else 404s.
export const dynamicParams = false;

export function generateStaticParams() {
  return PILLARS.map((p) => ({ pillarSlug: p.slug }));
}

export async function generateMetadata({ params }) {
  const { pillarSlug } = await params;
  const pillar = getPillarBySlug(pillarSlug);
  if (!pillar) return {};
  return {
    title: pillar.metaTitle,
    description: `${pillar.answerBox.question} ${pillar.answerBox.answer}`.slice(0, 158),
    alternates: { canonical: `${SITE_URL}/${pillar.slug}` },
  };
}

function pillarCollectionSchema(pillar, entities, articles) {
  return {
    '@context': 'https://schema.org',
    '@type': 'CollectionPage',
    name: `${pillar.metaTitle}`,
    description: pillar.intro,
    url: `${SITE_URL}/${pillar.slug}`,
    mainEntity: {
      '@type': 'ItemList',
      numberOfItems: entities.length + articles.length,
      itemListElement: [
        ...entities.map((e, i) => ({
          '@type': 'ListItem',
          position: i + 1,
          url: `${SITE_URL}/directory/${e.slug}`,
          name: e.name,
        })),
        ...articles.map((a, i) => ({
          '@type': 'ListItem',
          position: entities.length + i + 1,
          url: `${SITE_URL}/news/${a.slug || a.id}`,
          name: a.title,
        })),
      ],
    },
  };
}

export default async function Pillar({ params }) {
  const { pillarSlug } = await params;
  const pillar = getPillarBySlug(pillarSlug);
  if (!pillar) notFound();

  const [allEntities, allNews] = await Promise.all([getEntities(), getAllNews()]);

  const entities = allEntities.filter((e) => pillar.entityTypes.includes(e.type));
  const entitySlugs = new Set(entities.map((e) => e.slug));

  // Coverage = category match OR linked (via linkedEntityIds) to a pillar entity.
  const articles = allNews
    .filter(
      (a) =>
        pillar.articleCategories.includes(a.category) ||
        (a.linkedEntityIds || []).some((s) => entitySlugs.has(s))
    )
    .slice(0, 8);

  const schemas = [
    pillarCollectionSchema(pillar, entities, articles),
    breadcrumbSchema([
      { name: 'Home', url: SITE_URL },
      { name: pillar.metaTitle, url: `${SITE_URL}/${pillar.slug}` },
    ]),
  ];

  return (
    <>
      {schemas.map((schema, i) => (
        <script key={i} type="application/ld+json" dangerouslySetInnerHTML={jsonLdScript(schema)} />
      ))}
      <PillarPage pillar={pillar} entities={entities} articles={articles} />
    </>
  );
}
