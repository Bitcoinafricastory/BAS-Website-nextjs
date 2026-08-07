import Link from 'next/link';
import { notFound } from 'next/navigation';
import { GraduationCap, Wrench, Wallet, ArrowUpRight, ArrowLeft } from 'lucide-react';
import { getResourceCategory, listableCategorySlugs } from '@/lib/resources-data';
import { breadcrumbSchema, jsonLdScript } from '@/lib/schema';
import Breadcrumbs from '@/components/Breadcrumbs';

const ICONS = { GraduationCap, Wrench, Wallet };
const SITE_URL = 'https://bitcoinafricastory.com';

export function generateStaticParams() {
  return listableCategorySlugs().map((category) => ({ category }));
}

export async function generateMetadata({ params }) {
  const { category: slug } = await params;
  const category = getResourceCategory(slug);
  if (!category) return {};
  return {
    title: `${category.title} — Bitcoin Resources`,
    description: category.blurb,
    alternates: { canonical: `${SITE_URL}/resources/${category.slug}` },
    openGraph: {
      title: `${category.title} — Bitcoin Resources`,
      description: category.blurb,
      url: `${SITE_URL}/resources/${category.slug}`,
      type: 'website',
    },
  };
}

export default async function ResourceCategoryPage({ params }) {
  const { category: slug } = await params;
  const category = getResourceCategory(slug);
  if (!category) notFound();

  const Icon = ICONS[category.icon] || GraduationCap;

  const breadcrumbs = [
    { name: 'Home', url: '/' },
    { name: 'Resources', url: '/resources' },
    { name: category.title },
  ];

  // ItemList schema — helps this category page surface for searches like
  // "bitcoin learning resources" and gives AI answer engines a clean list.
  const itemListSchema = {
    '@context': 'https://schema.org',
    '@type': 'ItemList',
    name: `${category.title} — Bitcoin Resources`,
    description: category.blurb,
    itemListElement: category.items.map((item, i) => ({
      '@type': 'ListItem',
      position: i + 1,
      name: item.name,
      description: item.description,
      url: item.url,
    })),
  };

  const schemas = [breadcrumbSchema(breadcrumbs), itemListSchema].filter(Boolean);

  return (
    <div className="pt-16 bg-black text-white min-h-screen">
      {schemas.map((schema, i) => (
        <script key={i} type="application/ld+json" dangerouslySetInnerHTML={jsonLdScript(schema)} />
      ))}

      <section className="max-w-4xl mx-auto px-6 py-16 sm:py-20">
        <Breadcrumbs items={breadcrumbs} className="mb-8" />

        <Link
          href="/resources"
          className="inline-flex items-center gap-1.5 text-sm text-gray-400 hover:text-yellow-500 transition-colors mb-8"
        >
          <ArrowLeft size={15} /> All resources
        </Link>

        <div className="flex items-center gap-4 mb-4">
          <div className="flex items-center justify-center rounded-xl border border-yellow-500/40 flex-shrink-0" style={{ width: '48px', height: '48px' }}>
            <Icon size={22} className="text-yellow-500" />
          </div>
          <h1 className="text-3xl sm:text-4xl font-semibold tracking-tight">{category.title}</h1>
        </div>
        <p className="text-gray-400 text-base sm:text-lg leading-relaxed max-w-2xl mb-10">
          {category.blurb}
        </p>

        <div className="space-y-3">
          {category.items.map((item) => (
            <a
              key={item.name}
              href={item.url}
              target="_blank"
              rel="noopener noreferrer"
              className="group flex items-start justify-between gap-5 p-5 bg-[#0A0A0A] border border-white/5 rounded-xl hover:border-yellow-500/50 transition-colors"
            >
              <div>
                <h3 className="text-base font-bold mb-1.5 group-hover:text-yellow-500 transition-colors">
                  {item.name}
                </h3>
                <p className="text-gray-400 text-sm leading-relaxed max-w-xl">{item.description}</p>
              </div>
              <ArrowUpRight
                size={20}
                className="text-gray-600 group-hover:text-yellow-500 flex-shrink-0 mt-0.5 transition-all group-hover:-translate-y-0.5 group-hover:translate-x-0.5"
              />
            </a>
          ))}
        </div>

        {category.disclaimer && (
          <div className="mt-8 p-6 bg-yellow-500/10 border border-yellow-500/30 rounded-xl">
            <p className="text-gray-300 text-sm leading-relaxed">
              <strong className="text-yellow-500">Not an endorsement:</strong>{' '}
              {category.disclaimer.replace(/^Not an endorsement:\s*/, '')}
            </p>
          </div>
        )}
      </section>
    </div>
  );
}
