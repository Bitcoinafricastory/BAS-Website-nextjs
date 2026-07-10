import AboutContent from './AboutContent';

export const metadata = {
  title: 'About Us',
  description:
    'Learn about our mission to empower Africa through Bitcoin education, community building, and grassroots initiatives.',
  alternates: { canonical: 'https://bitcoinafricastory.com/about' },
};

export default function AboutPage() {
  return <AboutContent />;
}
