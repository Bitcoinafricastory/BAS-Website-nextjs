import Link from 'next/link';
import Image from 'next/image';
import { Zap } from 'lucide-react';
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
      <section className="relative max-w-3xl mx-auto px-6 py-20 sm:py-28 overflow-hidden">
        <div className="pointer-events-none absolute -top-32 left-1/2 -translate-x-1/2 w-[560px] h-[560px] bg-yellow-500/[0.07] rounded-full blur-3xl" />

        {/* Hero + email capture, centered — the page's single primary job. */}
        <div className="relative text-center">
          <h1 className="text-4xl sm:text-5xl lg:text-6xl font-semibold leading-[1.08] tracking-tight mb-6">
            Our stories, <span className="text-yellow-500">in your inbox.</span>
          </h1>
          <p className="text-gray-400 text-lg sm:text-xl leading-relaxed max-w-xl mx-auto mb-10">
            We report on Bitcoin across Africa &mdash; adoption, communities, merchants,
            education. Free, straight to your inbox.
          </p>

          <div className="max-w-md mx-auto text-left">
            <SubscribeForm />
          </div>
        </div>

        {/* Recent articles — proof of what actually arrives, kept light. */}
        {recent.length > 0 && (
          <div className="relative mt-16 sm:mt-20">
            <div className="flex items-center justify-between mb-5 font-mono-brand text-[10px] tracking-[0.09em] uppercase text-gray-600">
              <span>Recently published</span>
              <span>{recent.length} recent</span>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-5">
              {recent.map((post) => (
                <Link key={post.id} href={`/news/${post.slug || post.id}`} className="group">
                  <span className="relative block aspect-[16/10] rounded-lg overflow-hidden bg-white/5 mb-3">
                    {post.image && (
                      <Image src={post.image} alt="" fill sizes="(min-width:640px) 33vw, 100vw" className="object-cover group-hover:scale-105 transition-transform duration-300" />
                    )}
                  </span>
                  <p className="text-sm font-medium leading-snug line-clamp-2 group-hover:text-yellow-500 transition-colors">{post.title}</p>
                  <span className="font-mono-brand text-[10px] text-gray-600 mt-1.5 block">
                    {formatShortDate(post.date)}
                  </span>
                </Link>
              ))}
            </div>
          </div>
        )}

        {/* Paid membership — full width below, so nothing sits beside the
            widget. That's what actually prevents the height mismatch: the
            embed sets its own min-height and can't be shrunk reliably from
            outside the iframe, so it must never share a row with a shorter
            column. */}
        <div className="relative mt-20 sm:mt-24 pt-16 sm:pt-20 border-t border-white/[0.07]">
          <div className="text-center max-w-xl mx-auto mb-10">
            <div className="inline-flex items-center gap-2 mb-4">
              <span className="w-7 h-7 rounded-full bg-yellow-500/10 flex items-center justify-center">
                <Zap size={13} className="text-yellow-500" />
              </span>
              <span className="text-xs font-medium uppercase tracking-widest text-yellow-500">Go further</span>
            </div>
            <h2 className="text-2xl sm:text-3xl lg:text-4xl font-semibold leading-tight mb-4">
              Become a <span className="text-yellow-500">paying member</span>
            </h2>
            <p className="text-gray-400 text-base sm:text-lg leading-relaxed">
              Recurring support, paid in sats over Lightning &mdash; no card required.
              This is what keeps the reporting independent.
            </p>
          </div>

          <BlinkSubscribeWidget />
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
