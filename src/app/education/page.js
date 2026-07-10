import { getEducationData } from '@/lib/education';
import EducationalHero from './EducationalHero';
import ProgramCard from './ProgramCard';
import WhyBitcoin from './WhyBitcoin';
import ProgramsSection from './ProgramsSection';
import OtherBitcoinPrograms from './OtherBitcoinPrograms';
import BitcoinVideos from './BitcoinVideos';
import BitcoinResources from './BitcoinResources';

export const revalidate = 300;

export const metadata = {
  title: 'Bitcoin Education Africa | Learn Bitcoin for Free',
  description:
    'Start your Bitcoin journey with our free educational programs, workshops, and resources tailored for the African context.',
  alternates: { canonical: 'https://bitcoinafricastory.com/education' },
};

export default async function EducationPage() {
  const { testimonials, videoData, programs, otherPrograms, videos, resources } = await getEducationData();

  return (
    <div className="pt-16">
      <EducationalHero />
      <ProgramCard />
      <WhyBitcoin testimonials={testimonials} videoData={videoData} />
      <ProgramsSection programs={programs} />
      <OtherBitcoinPrograms programs={otherPrograms} />
      <BitcoinVideos videos={videos} />
      <BitcoinResources resources={resources} />
    </div>
  );
}
