import './globals.css';
import Header from '@/components/Header';
import Footer from '@/components/Footer';

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
    images: ['/assets/BASLOGOSmall.png'],
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Bitcoin Africa Story - Bitcoin News, Education & Community in Africa',
    description:
      'Bitcoin Africa Story is a trusted source of news, insights, and narratives on Bitcoin adoption, innovation, and impact across the African continent.',
    images: ['/assets/BASLOGOSmall.png'],
  },
  icons: {
    icon: ['/favicon-32x32.png', '/favicon-192.png'],
    apple: '/favicon-192.png',
  },
};

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body>
        <Header />
        {children}
        <Footer />
      </body>
    </html>
  );
}
