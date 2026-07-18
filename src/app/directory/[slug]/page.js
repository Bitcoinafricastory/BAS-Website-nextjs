import { notFound } from 'next/navigation';
import Link from 'next/link';
import Image from 'next/image';
import { getEntities, getEntityBySlug, getEntityCoverage } from '@/lib/entities';
import { directoryEntitySchema, breadcrumbSchema, jsonLdScript, SITE_URL, resolveImageUrl } from '@/lib/schema';
import { entityTypeLabel, summarizeBadges, badgeLabel } from '@/lib/entityTypes';
import Breadcrumbs from '@/components/Breadcrumbs';

export const revalidate = 300;

export async function generateStaticParams() {
  try {
    const entities = await getEntities();
    return entities.filter((e) => e.slug).map((e) => ({ slug: e.slug }));
  } catch (err) {
    console.warn('generateStaticParams (directory): could not fetch', err);
    return [];
  }
}

export async function generateMetadata({ params }) {
  const { slug } = await params;
  const entity = await getEntityBySlug(slug);
  if (!entity) return {};

  const pageUrl = `${SITE_URL}/directory/${entity.slug}`;
  const imageUrl = resolveImageUrl(entity.logo);

  return {
    title: `${entity.name} — ${entityTypeLabel(entity.type)}`,
    description: entity.description || `${entity.name} in the African Bitcoin Directory.`,
    alternates: { canonical: pageUrl },
    openGraph: {
      type: 'profile',
      url: pageUrl,
      title: entity.name,
      description: entity.description,
      images: imageUrl ? [imageUrl] : undefined,
      siteName: 'Bitcoin Africa Story',
    },
  };
}

export default async function DirectoryProfilePage({ params }) {
  const { slug } = await params;
  const entity = await getEntityBySlug(slug);
  if (!entity) notFound();

  const allEntities = await getEntities();
  const relatedEntities = (entity.relatedEntityIds || [])
    .map((s) => allEntities.find((e) => e.slug === s))
    .filter(Boolean);

  const autoCoverage = await getEntityCoverage(entity.slug);
  const manualCoverage = (entity.externalCoverage || []).map((c) => ({ ...c, external: true }));
  const coverage = [...autoCoverage, ...manualCoverage].sort(
    (a, b) => new Date(b.date || 0) - new Date(a.date || 0)
  );

  // Sort by weight, highest first — reuse summarizeBadges' ordering logic directly.
  const { top: topBadge, rest: restBadges } = summarizeBadges(entity.badges);
  const sortedBadges = topBadge ? [topBadge, ...restBadges] : [];

  const breadcrumbs = [
    { name: 'Home', url: SITE_URL },
    { name: 'Directory', url: `${SITE_URL}/directory` },
    { name: entity.name, url: `${SITE_URL}/directory/${entity.slug}` },
  ];

  const schemas = [directoryEntitySchema(entity), breadcrumbSchema(breadcrumbs)];

  return (
    <div className="pt-24 pb-24 bg-black text-white min-h-screen">
      {schemas.map((schema, i) => (
        <script key={i} type="application/ld+json" dangerouslySetInnerHTML={jsonLdScript(schema)} />
      ))}

      <div className="max-w-4xl mx-auto px-6">
        <Breadcrumbs items={breadcrumbs.map((b) => ({ name: b.name, url: b.url === SITE_URL ? '/' : b.url.replace(SITE_URL, '') }))} className="mb-6" />

        {entity.coverImage ? (
          <div className="relative h-[280px] rounded-2xl overflow-hidden mb-14">
            <Image src={entity.coverImage} alt={entity.name} fill sizes="(min-width: 1024px) 800px, 100vw" className="object-cover" />
            <div className="absolute inset-0 bg-gradient-to-t from-black via-black/50 to-black/10" />
            <div className="absolute left-0 right-0 bottom-0 px-6 sm:px-8 pb-6 flex items-end gap-5">
              {entity.logo && (
                <div className="relative w-24 h-24 sm:w-28 sm:h-28 flex-shrink-0 bg-[#161616] border-4 border-black rounded-2xl overflow-hidden -mb-14">
                  <Image src={entity.logo} alt={entity.name} fill sizes="112px" className="object-contain p-3" />
                </div>
              )}
              <div className="min-w-0 pb-1">
                <span className="inline-block text-[11px] font-bold uppercase tracking-widest text-yellow-500 bg-yellow-500/10 px-2.5 py-1 rounded-full mb-2">
                  {entityTypeLabel(entity.type)}{entity.country ? ` · ${entity.country}` : ''}
                </span>
                <h1 className="text-2xl sm:text-3xl font-semibold leading-tight">{entity.name}</h1>
              </div>
            </div>
          </div>
        ) : (
          <div className="border-b border-gray-800 pb-6 mb-6">
            <p className="text-xs font-bold uppercase tracking-widest text-yellow-500 mb-3">
              {entityTypeLabel(entity.type)}{entity.country ? ` · ${entity.country}` : ''}
            </p>
            <div className="flex gap-5 items-center mb-4">
              <div className="relative w-24 h-24 flex-shrink-0 bg-gray-900 border border-gray-800 rounded-2xl overflow-hidden">
                {entity.logo && (
                  <Image src={entity.logo} alt={entity.name} fill sizes="96px" className="object-contain p-3" />
                )}
              </div>
              <div className="min-w-0">
                <h1 className="text-2xl sm:text-3xl font-semibold mb-2 leading-tight">{entity.name}</h1>
              </div>
            </div>
          </div>
        )}

        <div className="border-b border-gray-800 pb-6 mb-6">
          {entity.description && (
            <p className="text-gray-400 text-sm sm:text-base leading-relaxed max-w-xl mb-4">{entity.description}</p>
          )}
          <div className="flex flex-wrap gap-4 text-sm">
            {entity.website && (
              <a href={entity.website} target="_blank" rel="noopener noreferrer" className="font-semibold hover:text-yellow-500 transition-colors">{entity.website.replace(/^https?:\/\//, '')}</a>
            )}
            {entity.socialLinks?.twitter && (
              <a href={entity.socialLinks.twitter} target="_blank" rel="noopener noreferrer" className="text-gray-400 hover:text-yellow-500 transition-colors">X / Twitter</a>
            )}
            {entity.socialLinks?.linkedin && (
              <a href={entity.socialLinks.linkedin} target="_blank" rel="noopener noreferrer" className="text-gray-400 hover:text-yellow-500 transition-colors">LinkedIn</a>
            )}
            {entity.socialLinks?.telegram && (
              <a href={entity.socialLinks.telegram} target="_blank" rel="noopener noreferrer" className="text-gray-400 hover:text-yellow-500 transition-colors">Telegram</a>
            )}
            {entity.contactEmail && (
              <a href={`mailto:${entity.contactEmail}`} className="text-gray-400 hover:text-yellow-500 transition-colors">{entity.contactEmail}</a>
            )}
          </div>
        </div>

        {sortedBadges.length > 0 && (
          <div className="mb-8">
            <p className="text-xs font-bold uppercase tracking-widest text-gray-500 mb-3">Verification</p>
            <div className="space-y-2">
              {sortedBadges.map((b, i) => (
                <div key={i} className="flex items-center gap-3 bg-gray-900 border border-gray-800 rounded-xl px-4 py-3">
                  <span className="w-2 h-2 rounded-full bg-yellow-500 flex-shrink-0" />
                  <span className="text-sm font-semibold flex-1">{badgeLabel(b.level)}</span>
                  <span className="text-xs text-gray-500">
                    {b.dateEarned}{b.evidence ? ` · ${b.evidence}` : ''}
                  </span>
                </div>
              ))}
            </div>
          </div>
        )}

        {(() => {
          const stats = [
            entity.yearFounded && { label: 'Founded', value: entity.yearFounded },
            entity.bitcoinFocus && { label: 'Focus', value: entity.bitcoinFocus },
            entity.founder && { label: 'Founder', value: entity.founder },
          ].filter(Boolean);
          if (stats.length === 0) return null;
          return (
            <div className="grid grid-cols-[repeat(auto-fit,minmax(140px,1fr))] gap-px bg-gray-800 border border-gray-800 rounded-xl overflow-hidden mb-8">
              {stats.map((s) => (
                <div key={s.label} className="bg-gray-900 p-4">
                  <p className="text-[11px] text-gray-500 mb-1">{s.label}</p>
                  <p className="text-sm font-semibold">{s.value}</p>
                </div>
              ))}
            </div>
          );
        })()}

        {/* Automatic coverage from linked articles/podcasts, merged with manually-added
            external items (third-party interviews, reports, videos) — now shown with
            real thumbnails instead of a bare text row. */}
        {coverage.length > 0 && (
          <div className="mb-8">
            <p className="text-xs font-bold uppercase tracking-widest text-gray-500 mb-3">
              Coverage · {coverage.length}
            </p>
            <div className="space-y-2.5">
              {coverage.map((c, i) => {
                const content = (
                  <>
                    <div className="relative w-20 h-14 sm:w-24 sm:h-16 flex-shrink-0 rounded-lg overflow-hidden bg-gray-800">
                      {c.image ? (
                        <Image src={c.image} alt="" fill sizes="96px" className="object-cover" />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center text-gray-700 text-xs font-bold uppercase">{c.type[0]}</div>
                      )}
                    </div>
                    <div className="min-w-0 flex-1">
                      <span className="text-[10px] font-bold text-yellow-500 uppercase tracking-wide">{c.type}</span>
                      <p className="text-sm font-medium truncate">{c.title}</p>
                      {c.date && <span className="text-xs text-gray-500">{c.date}</span>}
                    </div>
                  </>
                );
                const className = 'flex items-center gap-4 bg-gray-900 border border-gray-800 rounded-xl p-3 hover:border-yellow-500/50 transition-colors';
                return c.external ? (
                  <a key={i} href={c.url} target="_blank" rel="noopener noreferrer" className={className}>{content}</a>
                ) : (
                  <Link key={i} href={c.url} className={className}>{content}</Link>
                );
              })}
            </div>
          </div>
        )}

        {relatedEntities.length > 0 && (
          <div>
            <p className="text-xs font-bold uppercase tracking-widest text-gray-500 mb-3">Related</p>
            <div className="flex flex-wrap gap-2">
              {relatedEntities.map((r) => (
                <Link key={r.slug} href={`/directory/${r.slug}`} className="text-sm px-4 py-2 bg-gray-900 border border-gray-800 rounded-full hover:border-yellow-500 hover:text-yellow-500 transition-colors">
                  {r.name} <span className="text-gray-500">({entityTypeLabel(r.type)})</span>
                </Link>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
