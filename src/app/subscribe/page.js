import Link from 'next/link';
import Image from 'next/image';
import { getLatestNews } from '@/lib/news';
import SubscribeForm from '@/components/SubscribeForm';

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
      <section className="max-w-6xl mx-auto px-6 py-16 sm:py-20">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 lg:gap-16 items-center">

          {/* Pitch */}
          <div>
            <h1 className="text-3xl sm:text-4xl lg:text-[46px] font-bold leading-[1.1] tracking-tight mb-5">
              Our stories, <span className="text-yellow-500">in your inbox.</span>
            </h1>
            <p className="text-gray-400 text-base leading-relaxed max-w-md mb-7">
              We report on Bitcoin across Africa &mdash; adoption, communities, merchants,
              education. Subscribe and the stories come to you.
            </p>
            <SubscribeForm />
          </div>

          {/* Inbox preview */}
          <div className="bg-[#0A0A0A] border border-white/[0.07]">
            <div className="flex items-center justify-between px-4 sm:px-5 py-3.5 border-b border-white/[0.07] font-mono-brand text-[10px] tracking-[0.09em] uppercase text-gray-600">
              <span>From Bitcoin Africa Story</span>
              <span>{recent.length} recent</span>
            </div>

            {recent.length === 0 ? (
              <p className="px-5 py-8 text-sm text-gray-600">Recent stories load here.</p>
            ) : (
              recent.map((post) => (
                <div
                  key={post.id}
                  className="flex gap-3.5 px-4 sm:px-5 py-4 border-b border-white/[0.07] last:border-b-0 items-start"
                >
                  <span className="relative w-[46px] h-[46px] rounded overflow-hidden flex-shrink-0 bg-white/5">
                    {post.image && (
                      <Image
                        src={post.image}
                        alt=""
                        fill
                        sizes="46px"
                        className="object-cover"
                      />
                    )}
                  </span>
                  <div className="min-w-0">
                    <p className="text-sm font-semibold leading-snug mb-1">{post.title}</p>
                    {post.excerpt && (
                      <p className="text-[12.5px] text-gray-600 leading-relaxed line-clamp-2">
                        {post.excerpt}
                      </p>
                    )}
                  </div>
                  <span className="ml-auto pl-2.5 font-mono-brand text-[10px] text-gray-600 whitespace-nowrap">
                    {formatShortDate(post.date)}
                  </span>
                </div>
              ))
            )}
          </div>
        </div>

        <p className="text-gray-600 text-sm mt-14">
          Prefer to support the work directly?{' '}
          <Link href="/donate" className="text-yellow-500 hover:text-yellow-400 transition-colors">
            See where every sat goes
          </Link>
          .
        </p>
      </section>
    </div>
  );
}
