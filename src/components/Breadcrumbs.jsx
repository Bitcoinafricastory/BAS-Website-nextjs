import Link from 'next/link';
import { ChevronRight } from 'lucide-react';

/**
 * Visible breadcrumb trail. Pair this with breadcrumbSchema() from @/lib/schema
 * so users and crawlers see the same hierarchy.
 *
 * items: [{ name, url }] — the last item is rendered as plain text (current page).
 */
export default function Breadcrumbs({ items = [], className = '' }) {
  if (!items || items.length === 0) return null;

  return (
    <nav aria-label="Breadcrumb" className={className}>
      <ol className="flex flex-wrap items-center gap-1.5 text-xs sm:text-sm text-gray-500">
        {items.map((item, i) => {
          const isLast = i === items.length - 1;
          return (
            <li key={item.url || item.name} className="flex items-center gap-1.5">
              {isLast || !item.url ? (
                <span className="text-gray-300 line-clamp-1" aria-current="page">
                  {item.name}
                </span>
              ) : (
                <Link
                  href={item.url}
                  className="hover:text-yellow-500 transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-yellow-500 focus-visible:ring-offset-2 focus-visible:ring-offset-black rounded-sm"
                >
                  {item.name}
                </Link>
              )}
              {!isLast && <ChevronRight size={14} className="text-gray-700 flex-shrink-0" />}
            </li>
          );
        })}
      </ol>
    </nav>
  );
}
