import './globals.css';
import { Montserrat, Poppins, Inter, Merriweather } from 'next/font/google';
import Header from '@/components/Header';
import Footer from '@/components/Footer';
import AppShell from '@/components/AppShell';
import { organizationSchema, websiteSchema, jsonLdScript } from '@/lib/schema';

// Brand font, applied site-wide (nav, body copy, cards, heroes, dashboard).
const montserrat = Montserrat({
  subsets: ['latin'],
  weight: ['400', '500', '600', '700', '800'],
  style: ['normal', 'italic'],
  variable: '--font-montserrat',
  display: 'swap',
});

// Additional fonts writers can pick from the article editor's font dropdown.
// One weight each to keep the bundle lean — writers rarely need bold/italic in
// their chosen body font since bold is applied via <strong>.
const poppins = Poppins({
  subsets: ['latin'],
  weight: '400',
  variable: '--font-poppins',
  display: 'swap',
});
const inter = Inter({
  subsets: ['latin'],
  weight: '400',
  variable: '--font-inter',
  display: 'swap',
});
const merriweather = Merriweather({
  subsets: ['latin'],
  weight: '400',
  variable: '--font-merriweather',
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
    'Bitcoin Africa Story is an independent media and education platform documenting Bitcoin adoption, innovation, and impact across the African continent.',
  authors: [{ name: 'Bitcoin Africa Story' }],
  openGraph: {
    type: 'website',
    siteName: 'Bitcoin Africa Story',
    title: 'Bitcoin Africa Story - Bitcoin News, Education & Community in Africa',
    description:
      'Bitcoin Africa Story is an independent media and education platform documenting Bitcoin adoption, innovation, and impact across the African continent.',
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
      'Bitcoin Africa Story is an independent media and education platform documenting Bitcoin adoption, innovation, and impact across the African continent.',
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
    <html lang="en" className={`${montserrat.variable} ${poppins.variable} ${inter.variable} ${merriweather.variable}`}>
      <head>
        <script type="application/ld+json" dangerouslySetInnerHTML={jsonLdScript(organizationSchema())} />
        <script type="application/ld+json" dangerouslySetInnerHTML={jsonLdScript(websiteSchema())} />
      </head>
      <body className={montserrat.className}>
        <AppShell header={<Header />} footer={<Footer />}>
          {children}
        </AppShell>
      </body>
    </html>
  );
}
