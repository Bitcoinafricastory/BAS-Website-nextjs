import { notFound } from 'next/navigation';
import Link from 'next/link';
import Image from 'next/image';
import { ArrowLeft, Clock } from 'lucide-react';
import { getAllEducationPrograms, getEducationProgramById } from '@/lib/education';
import Breadcrumbs from '@/components/Breadcrumbs';
import { courseSchema, breadcrumbSchema, jsonLdScript, SITE_URL } from '@/lib/schema';

export const revalidate = 300;

export async function generateStaticParams() {
  try {
    const programs = await getAllEducationPrograms();
    return programs.map((p) => ({ id: p.id }));
  } catch (err) {
    console.warn('generateStaticParams (education program): could not fetch', err);
    return [];
  }
}

export async function generateMetadata({ params }) {
  const { id } = await params;
  const program = await getEducationProgramById(id);
  if (!program) return {};

  return {
    title: program.title,
    description: program.desc || `${program.title} — a free Bitcoin education program from Bitcoin Africa Story.`,
    alternates: { canonical: `${SITE_URL}/education/our-programs/${id}` },
  };
}

export default async function EducationProgramDetailsPage({ params }) {
  const { id } = await params;
  const program = await getEducationProgramById(id);
  if (!program) notFound();

  const crumbs = [
    { name: 'Home', url: `${SITE_URL}/` },
    { name: 'Education', url: `${SITE_URL}/education` },
    { name: program.title, url: `${SITE_URL}/education/our-programs/${id}` },
  ];

  return (
    <div className="min-h-screen bg-black text-white pt-24 pb-20">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={jsonLdScript(courseSchema({ ...program, description: program.desc }))}
      />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={jsonLdScript(breadcrumbSchema(crumbs))}
      />

      <div className="relative h-[300px] md:h-[400px] w-full overflow-hidden">
        {program.image ? (
          <>
            <Image src={program.image} alt={program.title} fill priority sizes="100vw" className="object-cover opacity-70" />
            <div className="absolute inset-0 bg-gradient-to-t from-black via-black/50 to-transparent" />
          </>
        ) : (
          <div className="w-full h-full bg-gray-900 border-b border-gray-800 flex items-center justify-center">
            <span className="text-gray-600 italic">No cover image</span>
          </div>
        )}

        <div className="absolute top-6 left-6 z-10">
          <Link href="/education" className="flex items-center gap-2 px-4 py-2 bg-black/50 hover:bg-black/70 backdrop-blur-sm rounded-full text-white transition-all border border-gray-700">
            <ArrowLeft size={18} />
            <span>Back</span>
          </Link>
        </div>
      </div>

      <div className="max-w-4xl mx-auto px-6 -mt-20 relative z-10">
        <Breadcrumbs
          items={[
            { name: 'Home', url: '/' },
            { name: 'Education', url: '/education' },
            { name: program.title },
          ]}
          className="mb-4"
        />
        <div className="bg-gray-900 border border-gray-800 rounded-2xl p-6 md:p-10 shadow-2xl">
          <div className="flex flex-wrap gap-2 mb-4">
            {program.level && (
              <span className="px-3 py-1 bg-yellow-500/10 text-yellow-500 text-xs font-bold uppercase tracking-wider rounded-full">
                {program.level}
              </span>
            )}
            {program.price && (
              <span className="px-3 py-1 bg-gray-800 text-gray-400 text-xs font-bold uppercase tracking-wider rounded-full">
                {program.price}
              </span>
            )}
            {program.duration && (
              <span className="flex items-center gap-1.5 px-3 py-1 bg-gray-800 text-gray-400 text-xs font-bold uppercase tracking-wider rounded-full">
                <Clock size={12} /> {program.duration}
              </span>
            )}
          </div>

          <h1 className="text-3xl md:text-5xl font-bold text-white mb-6 leading-tight">{program.title}</h1>

          {program.content ? (
            <div className="article-body mx-auto mb-8" dangerouslySetInnerHTML={{ __html: program.content }} />
          ) : program.desc ? (
            <div className="prose prose-invert prose-lg max-w-none text-gray-400 mb-8">
              <p className="whitespace-pre-wrap leading-relaxed">{program.desc}</p>
            </div>
          ) : null}

          {program.link && (
            <a
              href={program.link}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-block px-8 py-4 bg-yellow-500 hover:bg-yellow-400 text-black font-extrabold text-center rounded-lg transition-colors shadow-lg shadow-yellow-500/20"
            >
              Enrol Now
            </a>
          )}
        </div>
      </div>
    </div>
  );
}
