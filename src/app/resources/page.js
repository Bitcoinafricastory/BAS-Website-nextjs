import ResourcesContent from './ResourcesContent';

export const metadata = {
  title: 'Bitcoin Tools & Resources',
  description:
    'Access curated Bitcoin guides, secure wallet recommendations, and technical learning resources for your Bitcoin journey in Africa.',
  alternates: { canonical: 'https://bitcoinafricastory.com/resources' },
};

export default function ResourcesPage() {
  return <ResourcesContent />;
}
