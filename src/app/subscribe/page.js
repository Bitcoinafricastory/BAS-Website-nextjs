import Link from 'next/link';
import { ArrowRight, Zap } from 'lucide-react';
import SubscribeForm from '@/components/SubscribeForm';

export const metadata = {
  title: 'Subscribe',
  description:
    'A weekly email on what is actually happening in African Bitcoin — adoption, communities, merchants, and the people building on the ground. Free to read.',
  alternates: { canonical: 'https://bitcoinafricastory.com/subscribe' },
};

const WHAT_YOU_GET = [
  {
    n: '01',
    title: 'The weekly digest',
    body: 'What moved in African Bitcoin — adoption, policy, merchants, communities. Curated by people paying attention, not scraped.',
  },
  {
    n: '02',
    title: 'Original reporting',
    body: 'Field reporting from circular economies, meetups, and the people actually running them.',
  },
  {
    n: '03',
    title: 'Written by practitioners',
    body: "We don't only cover this. We run a Bitcoin circular economy in Ikorodu and have taught 100+ alumni across Africa.",
  },
];

export default function SubscribePage() {
  return (
    <div className="pt-16 bg-black text-white min-h-screen">
      <section className="max-w-5xl mx-auto px-6 py-16 sm:py-20">
        <span className="font-bold text-[11px] tracking-[0.16em] uppercase text-yellow-500">
          Free weekly &middot; Paid optional
        </span>
        <h1 className="text-4xl sm:text-5xl lg:text-[52px] font-semibold leading-[1.06] tracking-tight mt-4 mb-5 max-w-[17ch]">
          What actually happened in <span className="text-yellow-500">African Bitcoin</span> this week.
        </h1>
        <p className="text-gray-400 text-base sm:text-lg leading-relaxed max-w-xl mb-9">
          One email, every week. The stories, the numbers, and the people building on the
          ground &mdash; written by people building here too.
        </p>

        <SubscribeForm />

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-14">
          {WHAT_YOU_GET.map((item) => (
            <div key={item.n} className="bg-[#0A0A0A] border border-white/5 rounded-xl p-6">
              <span className="text-[11px] font-bold tracking-[0.1em] text-yellow-500">{item.n}</span>
              <h3 className="text-base font-semibold mt-2.5 mb-1.5">{item.title}</h3>
              <p className="text-gray-400 text-sm leading-relaxed">{item.body}</p>
            </div>
          ))}
        </div>
      </section>

      <section className="max-w-5xl mx-auto px-6 py-16 border-t border-gray-900">
        <h2 className="text-2xl sm:text-3xl font-semibold tracking-tight mb-4">
          Why <span className="text-yellow-500">paid?</span>
        </h2>
        <p className="text-gray-400 text-base leading-relaxed max-w-2xl mb-3">
          Everything stays free to read. Paying is how this stays independent &mdash; no ads,
          no sponsors, no exchange behind us.
        </p>
        <p className="text-gray-400 text-base leading-relaxed max-w-2xl mb-8">
          Two years of reporting and education ran on $2,125 in total contributions, published
          line by line. When funding ran short we paused volunteer stipends and monthly meetups,
          and kept teaching anyway.
        </p>

        <div className="flex flex-col sm:flex-row gap-3 flex-wrap">
          <Link
            href="/donate"
            className="inline-flex items-center justify-center gap-2 border border-gray-700 text-gray-200 font-semibold px-6 py-3.5 hover:border-yellow-500 hover:text-yellow-500 transition-colors"
          >
            See where every sat went
            <ArrowRight size={17} />
          </Link>
          <Link
            href="/donate"
            className="inline-flex items-center justify-center gap-2 border border-gray-700 text-gray-200 font-semibold px-6 py-3.5 hover:border-yellow-500 hover:text-yellow-500 transition-colors"
          >
            <Zap size={16} />
            Support over Lightning
          </Link>
        </div>
        <p className="text-gray-500 text-xs mt-5">
          Prefer sats? Lightning support goes straight to the work &mdash; no card, no processor, no cut.
        </p>
      </section>
    </div>
  );
}
