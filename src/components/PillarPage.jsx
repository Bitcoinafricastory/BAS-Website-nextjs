import Link from 'next/link';
import Image from 'next/image';
import { resolveImageUrl } from '@/lib/schema';

/**
 * Shared pillar-page layout. Purely presentational: receives a pillar config
 * plus already-filtered entities and articles, renders the approved hub
 * design. All pillar pages share this component so they stay consistent —
 * per-pillar identity lives entirely in the config (src/lib/pillars.js).
 */
export default function PillarPage({ pillar, entities = [], articles = [] }) {
  const countries = new Set(entities.map((e) => e.country).filter(Boolean));

  return (
    <div className="min-h-screen pt-16 pb-4 bg-black text-white">
      {/* Hero */}
      <section className="py-16 px-6 bg-gradient-to-b from-gray-900/30 to-transparent">
        <div className="max-w-6xl mx-auto">
          <h1 className="text-4xl sm:text-5xl lg:text-[54px] font-semibold leading-[1.08] tracking-tight mb-5 max-w-2xl">
            {pillar.title} <em className="italic text-yellow-500">{pillar.accent}</em> in Africa
          </h1>
          <p className="text-gray-400 text-base sm:text-lg leading-relaxed max-w-xl">{pillar.intro}</p>

          <div className="flex gap-8 mt-8">
            <div>
              <div className="font-black text-2xl text-yellow-500">{entities.length}</div>
              <div className="text-[11px] uppercase tracking-wider text-gray-400 mt-0.5">Communities</div>
            </div>
            <div>
              <div className="font-black text-2xl text-yellow-500">{articles.length}</div>
              <div className="text-[11px] uppercase tracking-wider text-gray-400 mt-0.5">Stories</div>
            </div>
            <div>
              <div className="font-black text-2xl text-yellow-500">{countries.size}</div>
              <div className="text-[11px] uppercase tracking-wider text-gray-400 mt-0.5">Countries</div>
            </div>
          </div>
        </div>
      </section>

      {/* Answer box — the citable core */}
      <section className="px-6">
        <div
          className="max-w-6xl mx-auto border border-yellow-500/25 rounded-2xl p-6 sm:p-7"
          style={{ background: 'linear-gradient(135deg, rgba(234,179,8,0.07), transparent 65%)' }}
        >
          <p className="text-gray-300 text-[15.5px] leading-relaxed">
            <strong className="text-white">{pillar.answerBox.question}</strong>{' '}
            {pillar.answerBox.answer}
          </p>
        </div>
      </section>

      {/* Entities */}
      {entities.length > 0 && (
        <section className="px-6 pt-12">
          <div className="max-w-6xl mx-auto">
            <h2 className="text-2xl font-bold mt-2 mb-6">{pillar.entitiesHeading.title}</h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
              {entities.map((entity) => {
                const coverUrl = resolveImageUrl(entity.coverImage);
                const logoUrl = resolveImageUrl(entity.logo);
                return (
                  <Link
                    key={entity.slug}
                    href={`/directory/${entity.slug}`}
                    className="group bg-gray-900/50 border border-gray-800 rounded-2xl overflow-hidden hover:border-yellow-500/50 transition-colors"
                  >
                    <div className="relative h-[110px] bg-[#101408]">
                      {coverUrl && (
                        <Image src={coverUrl} alt="" fill sizes="400px" className="object-cover opacity-80" />
                      )}
                      <div className="absolute -bottom-4 left-4 w-12 h-12 rounded-xl bg-[#161616] border-[3px] border-[#0A0A0A] overflow-hidden flex items-center justify-center">
                        {logoUrl ? (
                          <Image src={logoUrl} alt={entity.name} fill sizes="48px" className="object-cover" />
                        ) : (
                          <span className="font-black text-white/30">{entity.name?.[0] || '?'}</span>
                        )}
                      </div>
                    </div>
                    <div className="pt-7 px-4 pb-4">
                      <div className="font-bold text-base group-hover:text-yellow-500 transition-colors">
                        {entity.name}
                      </div>
                      <div className="text-xs text-gray-400 mt-0.5 mb-2">
                        {[entity.city, entity.country].filter(Boolean).join(' · ')}
                      </div>
                      {entity.description && (
                        <p className="text-[13.5px] text-gray-400 leading-snug line-clamp-2">
                          {entity.description}
                        </p>
                      )}
                    </div>
                  </Link>
                );
              })}
            </div>
          </div>
        </section>
      )}

      {/* Coverage */}
      {articles.length > 0 && (
        <section className="px-6 pt-12">
          <div className="max-w-6xl mx-auto">
            <h2 className="text-2xl font-bold mt-2 mb-4">{pillar.coverageHeading.title}</h2>
            <div>
              {articles.map((post, i) => {
                const thumb = resolveImageUrl(post.image);
                return (
                  <Link
                    key={post.slug || post.id}
                    href={`/news/${post.slug || post.id}`}
                    className={`group flex gap-4 items-center py-3.5 ${
                      i < articles.length - 1 ? 'border-b border-gray-800' : ''
                    }`}
                  >
                    <div className="relative w-[88px] h-[60px] rounded-lg overflow-hidden bg-gray-900 flex-shrink-0">
                      {thumb && <Image src={thumb} alt="" fill sizes="88px" className="object-cover" />}
                    </div>
                    <div className="min-w-0">
                      <div className="font-semibold text-[15.5px] leading-snug group-hover:text-yellow-500 transition-colors">
                        {post.title}
                      </div>
                      <div className="text-xs text-gray-400 mt-1">
                        {[post.author, post.category].filter(Boolean).join(' · ')}
                      </div>
                    </div>
                  </Link>
                );
              })}
            </div>
          </div>
        </section>
      )}

      {/* CTA */}
      <section className="px-6 py-12">
        <div className="max-w-6xl mx-auto bg-gray-900/50 border border-gray-800 rounded-2xl px-6 py-5 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <p className="text-gray-400 text-[14.5px]">{pillar.cta.text}</p>
          <Link
            href={pillar.cta.href}
            className="inline-block w-fit px-5 py-2.5 bg-yellow-500 text-black font-bold text-sm rounded-lg hover:bg-yellow-400 transition-colors whitespace-nowrap"
          >
            {pillar.cta.label}
          </Link>
        </div>
      </section>
    </div>
  );
}
