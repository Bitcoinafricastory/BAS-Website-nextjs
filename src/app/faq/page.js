import { getFAQs, getAllFAQsFlat } from '@/lib/faq';
import { faqSchema, breadcrumbSchema, jsonLdScript, SITE_URL } from '@/lib/schema';
import Breadcrumbs from '@/components/Breadcrumbs';
import FAQAccordion from '@/components/FAQAccordion';

export const revalidate = 300;

export const metadata = {
  title: 'Frequently Asked Questions',
  description:
    "Answers to common questions about Bitcoin Africa Story, an independent media and education platform — our news coverage, education programs, directory, events, podcast, and how to get involved.",
  alternates: { canonical: `${SITE_URL}/faq` },
};

export default async function FAQPage() {
  const [groups, flatFaqs] = await Promise.all([getFAQs(), getAllFAQsFlat()]);

  const breadcrumbs = [
    { name: 'Home', url: SITE_URL },
    { name: 'FAQ', url: `${SITE_URL}/faq` },
  ];
  const schemas = [breadcrumbSchema(breadcrumbs), faqSchema(flatFaqs)].filter(Boolean);

  return (
    <div className="pt-24 pb-24 bg-black text-white min-h-screen">
      {schemas.map((schema, i) => (
        <script key={i} type="application/ld+json" dangerouslySetInnerHTML={jsonLdScript(schema)} />
      ))}

      <div className="max-w-3xl mx-auto px-6">
        <Breadcrumbs items={[{ name: 'Home', url: '/' }, { name: 'FAQ' }]} className="mb-6" />

        <div className="mb-14">
          <span className="font-bold text-[11px] tracking-[0.18em] uppercase text-yellow-500 mb-5 inline-block">
            Help Center
          </span>
          <h1 className="text-4xl md:text-5xl font-semibold mb-4">Frequently Asked Questions</h1>
          <p className="text-gray-400 text-base sm:text-lg max-w-lg">
            Answers about our news coverage, education programs, directory, events, podcast, and how to get involved.
          </p>
        </div>

        {groups.length === 0 ? (
          <div className="bg-gray-900/50 border border-gray-800 rounded-2xl p-10 text-center">
            <p className="text-gray-400">Questions are being added — check back soon.</p>
          </div>
        ) : (
          <FAQAccordion groups={groups} />
        )}

        <div className="mt-16 pt-10 border-t border-gray-800 text-center">
          <p className="text-gray-400 mb-4">Didn&rsquo;t find what you&rsquo;re looking for?</p>
          <a
            href="/contact"
            className="inline-block px-7 py-3.5 bg-yellow-500 text-black font-bold rounded-lg hover:bg-yellow-400 transition-colors"
          >
            Contact Us
          </a>
        </div>
      </div>
    </div>
  );
}
