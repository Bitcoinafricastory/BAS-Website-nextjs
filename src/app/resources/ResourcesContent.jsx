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
      <div className="flex items-center justify-center rounded-xl border border-yellow-500/40 mb-5" style={{ width: '52px', height: '52px' }}>
        <Icon size={24} className="text-yellow-500" />
      </div>
      <h3 className="text-lg font-bold mb-1.5">{category.title}</h3>
      <p className="text-gray-400 text-sm leading-relaxed flex-1">{category.blurb}</p>
      <div className="flex items-center justify-between mt-4">
        <span className="text-xs text-gray-500">{count}</span>
        {!category.soon && <ArrowRight size={16} className="text-yellow-500" />}
      </div>
    </>
  );

  const base =
    'flex flex-col p-7 bg-[#0A0A0A] border border-white/5 rounded-2xl min-h-[180px] transition-all duration-200';

  if (category.soon) {
    return <div className={`${base} opacity-50`}>{inner}</div>;
  }

  const href = category.href || `/resources/${category.slug}`;

  return (
    <Link href={href} className={`${base} hover:border-yellow-500/50 hover:-translate-y-1`}>
      {inner}
    </Link>
  );
}

export default function ResourcesContent() {
  return (
    <div className="pt-16">
      <section className="max-w-6xl mx-auto px-6 py-16 sm:py-20">
        <h1 className="text-4xl sm:text-5xl lg:text-[54px] font-semibold leading-[1.05] tracking-tight mb-5">
          Bitcoin <span className="text-yellow-500">Resources</span>
        </h1>
        <p className="text-gray-400 text-base sm:text-lg leading-relaxed max-w-xl mb-12">
          A curated hub of the best Bitcoin material &mdash; organized by what you&rsquo;re looking for.
          Pick a category to dive in.
        </p>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {RESOURCE_CATEGORIES.map((category) => (
            <CategoryTile key={category.slug} category={category} />
          ))}
        </div>
      </section>
    </div>
  );
}
