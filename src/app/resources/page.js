import ResourcesContent from './ResourcesContent';

export const metadata = {
  title: 'Bitcoin Resources',
  description:
    'A curated hub of the best Bitcoin learning material, tools, and wallets — organized by category for your Bitcoin journey in Africa.',
  alternates: { canonical: 'https://bitcoinafricastory.com/resources' },
};

export default function ResourcesPage() {
  return <ResourcesContent />;
}
