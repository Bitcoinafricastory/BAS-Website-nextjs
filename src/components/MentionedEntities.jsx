import Link from 'next/link';
import Image from 'next/image';
import { ArrowRight } from 'lucide-react';
import { entityTypeLabel } from '@/lib/entityTypes';
import { resolveImageUrl } from '@/lib/schema';

/**
 * "Mentioned in this story" — renders the directory entities an article's
 * linkedEntityIds point at, closing the article -> entity internal-linking
 * loop (entity profiles already link back via their Coverage section).
 * Renders nothing when an article has no linked entities.
 */
export default function MentionedEntities({ entities = [] }) {
  if (!entities.length) return null;

  return (
    <section className="mt-14 pt-8 border-t border-gray-800">
      <span className="font-bold text-[11px] tracking-[0.18em] uppercase text-yellow-500 mb-4 inline-block">
        Mentioned in this story
      </span>
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
        {entities.map((entity) => {
          const logoUrl = resolveImageUrl(entity.logo);
          const meta = [entityTypeLabel(entity.type), entity.country].filter(Boolean).join(' · ');
          return (
            <Link
              key={entity.slug}
              href={`/directory/${entity.slug}`}
              className="group flex items-center gap-3 p-3.5 bg-gray-900/50 border border-gray-800 rounded-xl hover:border-yellow-500 transition-colors duration-200"
            >
              <div className="relative w-11 h-11 rounded-lg bg-[#161616] border border-gray-800 overflow-hidden flex items-center justify-center flex-shrink-0">
                {logoUrl ? (
                  <Image src={logoUrl} alt={entity.name} fill sizes="44px" className="object-cover" />
                ) : (
                  <span className="font-black text-white/25 text-lg">{entity.name?.[0] || '?'}</span>
                )}
              </div>
              <div className="min-w-0">
                <div className="font-semibold text-[15px] leading-tight truncate">{entity.name}</div>
                {meta && <div className="text-xs text-gray-400 mt-0.5 truncate">{meta}</div>}
              </div>
              <ArrowRight
                size={16}
                className="ml-auto flex-shrink-0 text-gray-600 group-hover:text-yellow-500 transition-colors"
              />
            </Link>
          );
        })}
      </div>
    </section>
  );
}
