import { machineHeaders, SITE_URL, SITE_NAME } from '@/lib/machine-content';
import { SOCIAL_PROFILES } from '@/lib/schema';

export const revalidate = 3600;

// Publisher identity for agents. Every claim here must match what the About and
// Donate pages actually say — no invented stats, no invented affiliations.
export async function GET() {
  return Response.json(
    {
      name: SITE_NAME,
      alternateName: ['BAS'],
      url: SITE_URL,
      type: ['NewsMediaOrganization', 'EducationalOrganization'],
      description:
        'Independent media and education platform documenting Bitcoin adoption, innovation, and impact across the African continent.',
      foundingDate: '2024',
      foundingLocation: 'Nigeria',
      areaServed: 'Africa',
      knowsAbout: [
        'Bitcoin',
        'Lightning Network',
        'Bitcoin circular economies',
        'Financial inclusion',
        'Bitcoin education',
      ],
      independent: true,
      isExchange: false,
      sellsTokens: false,
      publishingPrinciples: `${SITE_URL}/about`,
      sameAs: SOCIAL_PROFILES,
      machineEndpoints: {
        llms: `${SITE_URL}/llms.txt`,
        content: `${SITE_URL}/api/content.json`,
        articles: `${SITE_URL}/api/articles.json`,
        directory: `${SITE_URL}/api/directory.json`,
        rss: `${SITE_URL}/rss.xml`,
        sitemap: `${SITE_URL}/sitemap.xml`,
      },
    },
    { headers: machineHeaders('application/json; charset=utf-8') }
  );
}
