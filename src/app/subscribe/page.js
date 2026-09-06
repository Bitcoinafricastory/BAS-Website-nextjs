import Link from 'next/link';
import Image from 'next/image';
import { Radio, Award, Zap } from 'lucide-react';
import { getLatestNews } from '@/lib/news';
import SubscribeForm from '@/components/SubscribeForm';
import BlinkSubscribeWidget from '@/components/BlinkSubscribeWidget';

export const revalidate = 300;

export const metadata = {
  title: 'Subscribe',
  description:
    'Get every Bitcoin Africa Story article by email. Reporting on Bitcoin adoption, communities, merchants, and education across Africa.',
  alternates: { canonical: 'https://bitcoinafricastory.com/subscribe' },
};

function formatShortDate(value) {
  if (!value) return '';
  const d = new Date(value);
  if (Number.isNaN(d.getTime())) return '';
  return d.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
}

export default async function SubscribePage() {
  // Pulled live rather than hardcoded, so the preview always shows what we
  // actually published — it can't drift into looking staged.
  let recent = [];
  try {
    recent = await getLatestNews(3);
  } catch (err) {
    console.warn('subscribe: could not load recent articles', err);
  }

  return (
    <div className="pt-16 bg-black text-white min-h-screen">
      <section className="relative max-w-7xl mx-auto px-6 py-20 sm:py-28 overflow-hidden">
        <div className="pointer-events-none absolute -top-32 left-1/2 -translate-x-1/2 w-[560px] h-[560px] bg-yellow-500/[0.07] rounded-full blur-3xl" />

        {/* Bold, centered hero — one confident statement, not a wall of text */}
        <div className="relative max-w-2xl mx-auto text-center mb-16 sm:mb-20">
          <h1 className="text-4xl sm:text-5xl lg:text-6xl font-semibold leading-[1.08] tracking-tight mb-6">
            Our stories, <span className="text-yellow-500">in your inbox.</span>
          </h1>
          <p className="text-gray-400 text-lg sm:text-xl leading-relaxed">
            We report on Bitcoin across Africa &mdash; adoption, communities, merchants,
            education. Follow for free, or back the work directly with a recurring,
            sats-native membership.
          </p>
        </div>

        {/* Two large, evenly-weighted cards rather than two thin columns of
            small print — each one a destination in its own right. */}
        <div className="relative grid grid-cols-1 lg:grid-cols-2 gap-6 lg:gap-8 items-start">

          {/* Free path */}
          <div className="bg-[#0A0A0A] border border-white/10 rounded-2xl p-8 sm:p-10">
            <div className="flex items-center gap-2.5 mb-6">
              <span className="w-9 h-9 rounded-full bg-white/5 flex items-center justify-center">
                <Radio size={16} className="text-gray-400" />
              </span>
              <span className="text-xs font-medium uppercase tracking-widest text-gray-500">Free</span>
            </div>
            <h2 className="text-2xl sm:text-3xl font-semibold mb-3">Get every story by email</h2>
            <p className="text-gray-400 text-base leading-relaxed mb-8">
              No cost, no card. Unsubscribe whenever you want.
            </p>
            <SubscribeForm />

            {/* Inbox preview — a supporting detail, kept visually lighter
                than the main offer above it */}
            <div className="mt-10 pt-8 border-t border-white/[0.07]">
              <div className="flex items-center justify-between mb-4 font-mono-brand text-[10px] tracking-[0.09em] uppercase text-gray-600">
                <span>From Bitcoin Africa Story</span>
                <span>{recent.length} recent</span>
              </div>

              {recent.length === 0 ? (
                <p className="text-sm text-gray-600">Recent stories load here.</p>
              ) : (
                <div className="space-y-4">
                  {recent.map((post) => (
                    <div key={post.id} className="flex gap-3.5 items-start">
                      <span className="relative w-12 h-12 rounded-lg overflow-hidden flex-shrink-0 bg-white/5">
                        {post.image && (
                          <Image src={post.image} alt="" fill sizes="48px" className="object-cover" />
                        )}
                      </span>
                      <div className="min-w-0">
                        <p className="text-sm font-semibold leading-snug line-clamp-2">{post.title}</p>
                        <span className="font-mono-brand text-[10px] text-gray-600 mt-1 block">
                          {formatShortDate(post.date)}
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>

          {/* Paid path */}
          <div className="bg-[#0A0A0A] border border-yellow-500/20 rounded-2xl p-8 sm:p-10">
            <div className="flex items-center gap-2.5 mb-6">
              <span className="w-9 h-9 rounded-full bg-yellow-500/10 flex items-center justify-center">
                <Zap size={16} className="text-yellow-500" />
              </span>
              <span className="text-xs font-medium uppercase tracking-widest text-yellow-500">Go further</span>
            </div>
            <h2 className="text-2xl sm:text-3xl font-semibold mb-3">
              Become a <span className="text-yellow-500">paying member</span>
            </h2>
            <p className="text-gray-400 text-base leading-relaxed mb-6">
              Recurring support, paid in sats over Lightning &mdash; member-only updates and
              your name in the credits.
            </p>

            <ul className="space-y-3 mb-8">
              <li className="flex items-start gap-3 text-[15px] text-gray-300">
                <Award size={16} className="text-yellow-500 mt-0.5 flex-shrink-0" />
                Member-only updates, beyond what&rsquo;s on the free list
              </li>
              <li className="flex items-start gap-3 text-[15px] text-gray-300">
                <Zap size={16} className="text-yellow-500 mt-0.5 flex-shrink-0" />
                Paid natively in Bitcoin over Lightning &mdash; no card required
              </li>
            </ul>

            <BlinkSubscribeWidget />
          </div>
        </div>

        <p className="relative text-center text-gray-600 text-sm mt-14">
          Prefer a one-time gift instead?{' '}
          <Link href="/donate" className="text-yellow-500 hover:text-yellow-400 transition-colors">
            See where every sat goes
          </Link>
          .
        </p>
      </section>
    </div>
  );
}
