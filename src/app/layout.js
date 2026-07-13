import './globals.css';
import { Instrument_Serif, JetBrains_Mono } from 'next/font/google';
import Header from '@/components/Header';
import Footer from '@/components/Footer';
import AppShell from '@/components/AppShell';
import { organizationSchema, websiteSchema, jsonLdScript } from '@/lib/schema';

// Display faces used for the homepage hero (headline + mono data/labels).
// Scoped via CSS variables so they don't affect body copy elsewhere on the site.
const instrumentSerif = Instrument_Serif({
  subsets: ['latin'],
  weight: '400',
  style: ['normal', 'italic'],
  variable: '--font-instrument-serif',
  display: 'swap',
});

const jetbrainsMono = JetBrains_Mono({
  subsets: ['latin'],
  weight: ['400', '500', '600', '700'],
  variable: '--font-jetbrains-mono',
  display: 'swap',
});

// Vercel sets this automatically to this project's real production URL, whatever it currently is.
// During the migration, that's bas-website-nextjs.vercel.app — not bitcoinafricastory.com, which
// is still serving the old React site until cutover. Link-preview images need to resolve against
// wherever the site actually lives right now; canonical/sitemap/RSS below intentionally stay
// pointed at the final domain so that SEO groundwork isn't undone before cutover.
const currentSiteUrl = process.env.VERCEL_PROJECT_PRODUCTION_URL
  ? `https://${process.env.VERCEL_PROJECT_PRODUCTION_URL}`
  : 'https://bitcoinafricastory.com';

export const metadata = {
  metadataBase: new URL('https://bitcoinafricastory.com'),
  title: {
    default: 'Bitcoin Africa Story | Bitcoin Adoption, News & Stories from Africa',
    template: '%s | Bitcoin Africa Story',
  },
  description:
    'Bitcoin Africa Story is a trusted source of news, insights, and narratives on Bitcoin adoption, innovation, and impact across the African continent.',
  authors: [{ name: 'Bitcoin Africa Story' }],
  openGraph: {
    type: 'website',
    siteName: 'Bitcoin Africa Story',
    title: 'Bitcoin Africa Story - Bitcoin News, Education & Community in Africa',
    description:
      'Bitcoin Africa Story is a trusted source of news, insights, and narratives on Bitcoin adoption, innovation, and impact across the African continent.',
    images: [
      {
        url: `${currentSiteUrl}/assets/og-image.jpg`,
        width: 1200,
        height: 630,
        alt: 'Bitcoin Africa Story — Showing Africa\'s Bitcoin proof-of-work',
      },
    ],
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Bitcoin Africa Story - Bitcoin News, Education & Community in Africa',
    description:
      'Bitcoin Africa Story is a trusted source of news, insights, and narratives on Bitcoin adoption, innovation, and impact across the African continent.',
    images: [`${currentSiteUrl}/assets/og-image.jpg`],
  },
  icons: {
    icon: ['/favicon-32x32.png', '/favicon-192.png'],
    apple: '/favicon-192.png',
  },
  alternates: {
    types: {
      'application/rss+xml': [{ url: '/rss.xml', title: 'Bitcoin Africa Story RSS Feed' }],
    },
  },
};

export default function RootLayout({ children }) {
  return (
    <html lang="en" className={`${instrumentSerif.variable} ${jetbrainsMono.variable}`}>
      <head>
        <script type="application/ld+json" dangerouslySetInnerHTML={jsonLdScript(organizationSchema())} />
        <script type="application/ld+json" dangerouslySetInnerHTML={jsonLdScript(websiteSchema())} />
      </head>
      <body>
        <AppShell header={<Header />} footer={<Footer />}>
          {children}
        </AppShell>
      </body>
    </html>
  );
}
