import './globals.css';
import { Montserrat, Poppins, Inter, Merriweather, Fraunces, JetBrains_Mono } from 'next/font/google';
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

// Editorial serif display face — used on the About page (headline, pull-quotes,
// pillar numerals) for a magazine feel distinct from the site-wide Montserrat.
const fraunces = Fraunces({
  subsets: ['latin'],
  weight: ['400', '500', '600'],
  style: ['normal', 'italic'],
  variable: '--font-fraunces',
  display: 'swap',
});

// Monospace face — used on the Donate page's Bitcoin-native styling
// (status bar, tx labels, ledger figures).
const jetbrainsMono = JetBrains_Mono({
  subsets: ['latin'],
  weight: ['400', '500', '600', '700'],
  variable: '--font-jetbrains-mono',
  display: 'swap',
});

// The domain cutover is done: this project serves www.bitcoinafricastory.com directly, so
// OG/Twitter images resolve against the real domain. This previously read
// VERCEL_PROJECT_PRODUCTION_URL as a migration workaround (pointing previews at the
// .vercel.app URL while the old site still held the domain) — that indirection is no longer
// needed and produced an unreliable absolute URL, which is why og:image stopped being emitted.
const currentSiteUrl = 'https://www.bitcoinafricastory.com';

export const metadata = {
  metadataBase: new URL('https://www.bitcoinafricastory.com'),
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
        alt: 'Bitcoin Africa Story — Documenting Bitcoin adoption across Africa',
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
    icon: ['/favicon-32x32.png', '/icon-192.png'],
    // Must be square: iOS applies its own rounded mask and does not letterbox.
    // This previously pointed at favicon-192.png, which is actually 112x152,
    // so a home-screen save came out cropped and off-centre.
    apple: '/apple-touch-icon.png',
  },
  manifest: '/manifest.json',
  alternates: {
    canonical: 'https://www.bitcoinafricastory.com',
    languages: {
      en: 'https://www.bitcoinafricastory.com',
      'x-default': 'https://www.bitcoinafricastory.com',
    },
    types: {
      'application/rss+xml': [{ url: '/rss.xml', title: 'Bitcoin Africa Story RSS Feed' }],
      'text/plain': [{ url: '/llms.txt', title: 'Bitcoin Africa Story for LLMs' }],
    },
  },
  // Lets Google show large image previews and untruncated snippets, which
  // materially improves how stories appear in search and Discover.
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      'max-image-preview': 'large',
      'max-snippet': -1,
      'max-video-preview': -1,
    },
  },
};

export default function RootLayout({ children }) {
  return (
    <html lang="en" className={`${montserrat.variable} ${poppins.variable} ${inter.variable} ${merriweather.variable} ${fraunces.variable} ${jetbrainsMono.variable}`}>
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
