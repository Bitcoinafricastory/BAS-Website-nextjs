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
  const imageUrl = resolveImageUrl(entity.coverImage || entity.logo);

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

        <div className="flex gap-5 items-center mb-2">
          <div className="relative w-20 h-20 sm:w-24 sm:h-24 flex-shrink-0 bg-[#0A0A0A] border border-white/5 rounded-2xl overflow-hidden">
            {entity.logo && (
              <Image src={entity.logo} alt={entity.name} fill sizes="96px" className="object-contain p-3" />
            )}
          </div>
          <div className="min-w-0">
            <span className="inline-block text-[11px] font-bold uppercase tracking-widest text-yellow-500 bg-yellow-500/10 px-2.5 py-1 rounded-full mb-2">
              {entityTypeLabel(entity.type)}{entity.country ? ` · ${entity.country}` : ''}
            </span>
            <h1 className="text-2xl sm:text-3xl font-semibold leading-tight">{entity.name}</h1>
          </div>
        </div>

        {entity.description && (
          <p className="text-gray-400 text-sm sm:text-base leading-relaxed max-w-xl mt-5 mb-4">{entity.description}</p>
        )}

        <div className="flex flex-wrap gap-4 text-sm mb-8">
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

        {sortedBadges.length > 0 && (
          <div className="flex flex-wrap gap-2 mb-8">
            {sortedBadges.map((b, i) => (
              <span key={i} className="inline-flex items-center gap-2 bg-[#0A0A0A] border border-white/5 rounded-full px-4 py-2 text-xs font-semibold">
                <span className="w-1.5 h-1.5 rounded-full bg-yellow-500 flex-shrink-0" />
                {badgeLabel(b.level)}
                <span className="text-gray-500 font-normal">
                  {b.dateEarned}{b.evidence ? ` · ${b.evidence}` : ''}
                </span>
              </span>
            ))}
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
            <div className="grid grid-cols-[repeat(auto-fit,minmax(140px,1fr))] gap-px bg-white/5 border border-white/5 rounded-xl overflow-hidden mb-8">
              {stats.map((s) => (
                <div key={s.label} className="bg-[#0A0A0A] p-4">
                  <p className="text-[11px] text-gray-500 uppercase tracking-wide mb-1">{s.label}</p>
                  <p className="text-sm font-semibold">{s.value}</p>
                </div>
              ))}
            </div>
          );
        })()}

        {/* Automatic coverage from linked articles/podcasts, merged with manually-added
            external items (third-party interviews, reports, videos) — shown as a photo-card
            grid rather than list rows, so multiple pieces of coverage read like a mini archive. */}
        {coverage.length > 0 && (
          <div className="mb-8">
            <p className="text-xs font-bold uppercase tracking-widest text-gray-400 mb-3">
              Coverage · {coverage.length}
            </p>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
              {coverage.map((c, i) => {
                const content = (
                  <>
                    <div className="relative aspect-video bg-gray-800">
                      {c.image ? (
                        <Image src={c.image} alt="" fill sizes="(min-width: 640px) 50vw, 100vw" className="object-cover" />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center text-gray-500 text-xs font-bold uppercase">{c.type[0]}</div>
                      )}
                    </div>
                    <div className="p-3.5">
                      <span className="text-[10px] font-bold text-yellow-500 uppercase tracking-wide">{c.type}</span>
                      <p className="text-sm font-semibold leading-snug mt-1">{c.title}</p>
                      {c.date && <span className="text-xs text-gray-500 mt-1.5 block">{c.date}</span>}
                    </div>
                  </>
                );
                const className = 'block bg-[#0A0A0A] border border-white/5 rounded-xl overflow-hidden hover:border-yellow-500/40 transition-colors';
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
            <p className="text-xs font-bold uppercase tracking-widest text-gray-400 mb-3">Related</p>
            <div className="flex gap-2 overflow-x-auto pb-1">
              {relatedEntities.map((r) => (
                <Link key={r.slug} href={`/directory/${r.slug}`} className="flex-shrink-0 text-sm px-4 py-2 bg-[#0A0A0A] border border-white/5 rounded-full hover:border-yellow-500/50 hover:text-yellow-500 transition-colors whitespace-nowrap">
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
