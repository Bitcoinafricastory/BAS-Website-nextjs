import { getEntities } from '@/lib/entities';
import { SITE_URL, entityListSchema, breadcrumbSchema, jsonLdScript } from '@/lib/schema';
import Breadcrumbs from '@/components/Breadcrumbs';
import DirectoryExplorer from './DirectoryExplorer';

export const revalidate = 300;

export const metadata = {
  title: 'The African Bitcoin Directory',
  description:
    'Communities, companies, projects, conferences, developers, and people building Bitcoin across Africa — with real reporting behind every verified badge, not a scraped database.',
  alternates: { canonical: `${SITE_URL}/directory` },
};

export default async function DirectoryPage() {
  const entities = await getEntities();

  const schemas = [
    entityListSchema(entities),
    breadcrumbSchema([
      { name: 'Home', url: SITE_URL },
      { name: 'Directory', url: `${SITE_URL}/directory` },
    ]),
  ].filter(Boolean);

  return (
    <div className="min-h-screen pt-24 pb-24">
      {schemas.map((schema, i) => (
        <script key={i} type="application/ld+json" dangerouslySetInnerHTML={jsonLdScript(schema)} />
      ))}
      <div className="max-w-6xl mx-auto px-6">
        <Breadcrumbs items={[{ name: 'Home', url: '/' }, { name: 'Directory' }]} className="mb-6" />

        <h1 className="text-3xl md:text-5xl font-semibold mb-3">
          The African Bitcoin <span className="text-yellow-500">Directory</span>
        </h1>
        <p className="text-gray-400 mb-4 max-w-2xl text-base sm:text-lg leading-relaxed">
          Communities, companies, projects, conferences, developers, and people building Bitcoin
          across the continent. Every trust badge here means our reporters actually did the work —
          not that someone filled out a form.
        </p>

        <DirectoryExplorer entities={entities} />
      </div>
    </div>
  );
}
