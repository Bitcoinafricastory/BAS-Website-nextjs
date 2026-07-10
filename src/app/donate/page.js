import DonateContent from './DonateContent';

export const metadata = {
  title: 'Support Bitcoin Africa | Donate to Our Mission',
  description:
    'Support Bitcoin education and adoption in Africa. Your donations fund grassroots training, events, and circular economy projects.',
  alternates: { canonical: 'https://bitcoinafricastory.com/donate' },
};

export default function DonatePage() {
  return <DonateContent />;
}
