import AboutContent from './AboutContent';
import { aboutPageSchema, jsonLdScript } from '@/lib/schema';

export const metadata = {
  title: 'About Us',
  description:
    'Learn about our mission to empower Africa through Bitcoin education, community building, and grassroots initiatives.',
  alternates: { canonical: 'https://bitcoinafricastory.com/about' },
};

export default function AboutPage() {
  return (
    <>
      <script type="application/ld+json" dangerouslySetInnerHTML={jsonLdScript(aboutPageSchema())} />
      <AboutContent />
    </>
  );
}
