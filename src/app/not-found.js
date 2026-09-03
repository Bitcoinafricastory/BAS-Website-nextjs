import Link from 'next/link';
import { ArrowRight, Search } from 'lucide-react';

export const metadata = {
  title: 'Page Not Found',
  robots: { index: false, follow: true },
};

export default function NotFound() {
  return (
    <div className="pt-16 bg-black text-white min-h-screen flex items-center">
      <div className="max-w-2xl mx-auto px-6 py-24 w-full">
        <span className="font-bold text-[11px] tracking-[0.18em] uppercase text-yellow-500">
          Error 404
        </span>
        <h1 className="text-4xl sm:text-5xl lg:text-[54px] font-semibold leading-[1.05] tracking-tight mt-4 mb-6">
          This page took a <span className="text-yellow-500">wrong turn.</span>
        </h1>
        <p className="text-gray-400 text-base sm:text-lg leading-relaxed max-w-md mb-10">
          The page you&rsquo;re looking for doesn&rsquo;t exist, moved, or the link was mistyped.
          Here are a few good places to pick back up.
        </p>

        <div className="flex flex-col sm:flex-row gap-3 mb-12">
          <Link
            href="/"
            className="inline-flex items-center justify-center gap-2 bg-yellow-500 text-black font-medium text-sm sm:text-base px-5 py-3 sm:px-6 sm:py-4 hover:brightness-95 transition-all focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-yellow-500 focus-visible:ring-offset-2 focus-visible:ring-offset-black"
          >
            Back to Home
            <ArrowRight size={18} />
          </Link>
          <Link
            href="/search"
            className="inline-flex items-center justify-center gap-2 border border-gray-700 text-gray-200 font-medium text-sm sm:text-base px-5 py-3 sm:px-6 sm:py-4 hover:border-yellow-500 hover:text-yellow-500 transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-yellow-500 focus-visible:ring-offset-2 focus-visible:ring-offset-black"
          >
            <Search size={16} />
            Search the site
          </Link>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
          {[
            { label: 'News', href: '/news' },
            { label: 'Education', href: '/education' },
            { label: 'Directory', href: '/directory' },
            { label: 'Podcast', href: '/podcast' },
          ].map((item) => (
            <Link
              key={item.href}
              href={item.href}
              className="px-4 py-3 bg-[#0A0A0A] border border-white/5 rounded-lg text-sm text-gray-300 text-center hover:border-yellow-500/50 hover:text-yellow-500 transition-colors"
            >
              {item.label}
            </Link>
          ))}
        </div>
      </div>
    </div>
  );
}
