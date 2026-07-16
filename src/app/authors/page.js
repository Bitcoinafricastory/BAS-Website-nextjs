import { getActiveAuthors } from '@/lib/authors';
import { SITE_URL } from '@/lib/schema';
import AuthorCard from '@/components/AuthorCard';
import Breadcrumbs from '@/components/Breadcrumbs';

export const revalidate = 300;

export const metadata = {
  title: 'Our Writers',
  description:
    'Meet the writers behind Bitcoin Africa Story — reporters, educators, and community builders covering Bitcoin adoption across the African continent.',
  alternates: { canonical: `${SITE_URL}/authors` },
};

export default async function AuthorsPage() {
  const authors = await getActiveAuthors();

  return (
    <div className="min-h-screen pt-24 pb-24">
      <div className="max-w-5xl mx-auto px-6">
        <Breadcrumbs items={[{ name: 'Home', url: '/' }, { name: 'Writers' }]} className="mb-6" />

        <h1 className="text-3xl md:text-5xl font-semibold mb-3">
          Our <span className="text-yellow-500">Writers</span>
        </h1>
        <p className="text-gray-400 mb-12 max-w-2xl text-base sm:text-lg leading-relaxed">
          The reporters, educators, and community builders behind Bitcoin Africa Story&rsquo;s
          coverage of Bitcoin adoption across the continent.
        </p>

        {authors.length === 0 ? (
          <div className="py-16 text-center bg-gray-900/50 border border-gray-800 rounded-xl">
            <p className="text-gray-400">No writers yet — check back soon.</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {authors.map((a) => (
              <AuthorCard key={a.id} author={a} />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
