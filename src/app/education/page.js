import { getEducationData } from '@/lib/education';
import EducationalHero from './EducationalHero';
import ProgramCard from './ProgramCard';
import WhyBitcoin from './WhyBitcoin';
import ProgramsSection from './ProgramsSection';
import OtherBitcoinPrograms from './OtherBitcoinPrograms';
import BitcoinVideos from './BitcoinVideos';
import BitcoinResources from './BitcoinResources';
import { courseListSchema, jsonLdScript } from '@/lib/schema';

export const revalidate = 300;

export const metadata = {
  title: 'Bitcoin Education Africa | Learn Bitcoin for Free',
  description:
    'Start your Bitcoin journey with our free educational programs, workshops, and resources tailored for the African context.',
  alternates: { canonical: 'https://bitcoinafricastory.com/education' },
};

export default async function EducationPage() {
  const { testimonials, videoData, programs, otherPrograms, videos, resources } = await getEducationData();

  // Course schema from real program data — makes free programs eligible for
  // Google's course rich results and readable by AI answer engines.
  const coursesSchema = courseListSchema([...(programs || []), ...(otherPrograms || [])]);

  return (
    <div className="pt-16">
      {coursesSchema && (
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={jsonLdScript(coursesSchema)}
        />
      )}
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
