import Link from 'next/link';
import SubscribeForm from '@/components/SubscribeForm';
import BlinkSubscribeWidget from '@/components/BlinkSubscribeWidget';

export const revalidate = 300;

export const metadata = {
  title: 'Subscribe',
  description:
    'Get every Bitcoin Africa Story article by email. Reporting on Bitcoin adoption, communities, merchants, and education across Africa.',
  alternates: { canonical: 'https://bitcoinafricastory.com/subscribe' },
};

export default function SubscribePage() {
  return (
    <div className="pt-16 bg-black text-white min-h-screen">
      <section className="max-w-5xl mx-auto px-6 py-16 sm:py-24">

        {/* Free signup — one defined panel, centered: headline, short copy,
            unified pill form. */}
        <div className="bg-[#0A0A0A] border border-white/[0.07] rounded-[28px] px-6 sm:px-12 py-14 sm:py-20 text-center">
          <h1 className="text-3xl sm:text-5xl font-semibold leading-[1.1] tracking-tight mb-5 max-w-2xl mx-auto">
            Our stories, <span className="text-yellow-500">in your inbox.</span>
          </h1>
          <p className="text-gray-400 text-base sm:text-lg leading-relaxed max-w-lg mx-auto mb-9">
            Bitcoin across Africa &mdash; adoption, communities, merchants, education.
            Free, straight to your inbox.
          </p>

          <div className="max-w-xl mx-auto">
            <SubscribeForm />
          </div>
        </div>

        {/* Paid membership — the second ask, deliberately after the free
            one and visually quieter, so the page only makes one primary
            request at a time. */}
        <div className="mt-20 sm:mt-24">
          <div className="text-center max-w-lg mx-auto mb-10">
            <h2 className="text-2xl sm:text-3xl font-semibold leading-tight mb-4">
              Or fund the <span className="text-yellow-500">reporting</span>
            </h2>
            <p className="text-gray-400 text-base leading-relaxed">
              We&rsquo;re independent and reader-funded. A monthly membership pays for
              travel to the communities we cover, and the time to report properly.
            </p>
          </div>

          <BlinkSubscribeWidget />
        </div>

        <p className="text-center text-gray-600 text-sm mt-14">
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
