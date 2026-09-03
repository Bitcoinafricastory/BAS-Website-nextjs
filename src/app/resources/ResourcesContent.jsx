import Link from 'next/link';
import { GraduationCap, Wrench, Wallet, Mic, Users, ShoppingBag, ArrowRight } from 'lucide-react';
import { RESOURCE_CATEGORIES } from '@/lib/resources-data';

const ICONS = { GraduationCap, Wrench, Wallet, Mic, Users, ShoppingBag };

function CategoryTile({ category }) {
  const Icon = ICONS[category.icon] || GraduationCap;
  const count =
    category.countLabel ||
    (Array.isArray(category.items)
      ? `${category.items.length} resource${category.items.length === 1 ? '' : 's'}`
      : category.soon
      ? 'Coming soon'
      : '');

  const inner = (
    <>
      <div className="group-hover:bg-yellow-500/20 group-hover:scale-110 flex items-center justify-center rounded-xl bg-yellow-500/10 w-12 h-12 sm:w-[52px] sm:h-[52px] mb-5 transition-all duration-300">
        <Icon size={22} className="text-yellow-500" />
      </div>
      <h3 className="text-base sm:text-lg font-semibold mb-1.5">{category.title}</h3>
      <p className="text-gray-400 text-sm leading-relaxed flex-1">{category.blurb}</p>
      <div className="flex items-center justify-between mt-4">
        <span className="text-xs text-gray-500">{count}</span>
        {!category.soon && (
          <span className="w-7 h-7 rounded-full bg-white/5 group-hover:bg-yellow-500 flex items-center justify-center transition-colors duration-300">
            <ArrowRight size={14} className="text-yellow-500 group-hover:text-black transition-colors duration-300" />
          </span>
        )}
      </div>
    </>
  );

  const base =
    'group flex flex-col p-6 sm:p-7 bg-[#0A0A0A] border border-white/5 rounded-2xl min-h-[170px] sm:min-h-[180px] transition-all duration-300';

  if (category.soon) {
    return <div className={`${base} opacity-50`}>{inner}</div>;
  }

  const href = category.href || `/resources/${category.slug}`;

  return (
    <Link href={href} className={`${base} hover:border-yellow-500/50 hover:-translate-y-1 hover:shadow-[0_16px_40px_-16px_rgba(234,179,8,0.25)]`}>
      {inner}
    </Link>
  );
}

export default function ResourcesContent() {
  return (
    <div className="pt-16">
      <section className="relative max-w-6xl mx-auto px-6 py-16 sm:py-20 overflow-hidden">
        <div className="pointer-events-none absolute -top-24 right-0 w-80 h-80 bg-yellow-500/10 rounded-full blur-3xl" />

        <h1 className="relative text-3xl sm:text-5xl lg:text-[54px] font-semibold leading-[1.1] tracking-tight mb-5">
          Bitcoin <span className="text-yellow-500">Resources</span>
        </h1>
        <p className="relative text-gray-400 text-base sm:text-lg leading-relaxed max-w-xl mb-10 sm:mb-12">
          A curated hub of the best Bitcoin material &mdash; organized by what you&rsquo;re looking for.
          Pick a category to dive in.
        </p>

        <div className="relative grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {RESOURCE_CATEGORIES.map((category) => (
            <CategoryTile key={category.slug} category={category} />
          ))}
        </div>
      </section>
    </div>
  );
}
