import { getEntities } from '@/lib/entities';
import DonateContent from './DonateContent';

export const revalidate = 300;

export const metadata = {
  title: 'Support Bitcoin Africa | Donate to Our Mission',
  description:
    'Support Bitcoin education and adoption in Africa. Your donations fund grassroots training, events, and circular economy projects.',
  alternates: { canonical: 'https://bitcoinafricastory.com/donate' },
};

export default async function DonatePage() {
  // The Research card shows how many directory entries we've actually verified.
  // Fetched live rather than hardcoded so the figure can never drift out of
  // step with the directory itself.
  let verifiedCount = 0;
  try {
    const entities = await getEntities();
    verifiedCount = entities.length;
  } catch (err) {
    console.warn('donate: could not count directory entities', err);
  }

  return <DonateContent verifiedCount={verifiedCount} />;
}
