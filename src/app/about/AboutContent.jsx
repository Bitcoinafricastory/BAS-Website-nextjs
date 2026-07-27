'use client';

import { Calendar, Users, Target, Heart, ArrowRight, BookOpen } from 'lucide-react';
import Link from 'next/link';
import Image from 'next/image';
import { motion, useScroll, useTransform } from 'framer-motion';
import { useRef } from 'react';
import CountUp from '@/components/ui/CountUp';

const pillars = [
  {
    id: '01',
    title: 'Education',
    description:
      'Practical Bitcoin training for schools, youth, merchants, and communities — helping people understand and use Bitcoin confidently.',
  },
  {
    id: '02',
    title: 'Storytelling',
    description:
      'Real stories of Bitcoin adoption across Africa, highlighting the people, challenges, and progress in each community.',
  },
  {
    id: '03',
    title: 'Community Development',
    description:
      'Supporting communities in building sustainable Bitcoin circular economies through merchant onboarding, local spending, and hands-on guidance.',
  },
  {
    id: '04',
    title: 'Research and Insights',
    description:
      'Studying Bitcoin usage, community needs, adoption patterns, and emerging trends to guide our programs and share insights with the ecosystem.',
  },
];

const milestones = [
  { year: '2024', title: 'The Beginning', description: 'Started teaching Bitcoin to local communities in Nigeria.' },
  { year: '2024', title: 'First 100 Students', description: 'Reached our first 100 students across multiple cities' },
  { year: '2024', title: 'Growing Across Africa', description: 'Extended education programs to Ghana, Kenya, and South Africa' },
  { year: '2025', title: ' 300+ Community Members', description: 'Built a thriving network of students, learners, volunteers, and educators across Africa.' },
  { year: '2025', title: '6 Online Bitcoin Diplomas', description: 'Launched online Bitcoin learning programs to make education accessible to every African, anywhere.' },
  { year: '2025', title: '10+ Bitcoin Events', description: 'Hosted impactful events — from school sessions to classroom workshops, church outreach, youth hangouts, and community meetups.' },
  { year: '2025', title: 'Building Circular Economies', description: 'Launched initiatives like Bitcoin Ikorodu and continued scaling real Bitcoin adoption across African communities.' },
];

const fadeUp = {
  initial: { opacity: 0, y: 24 },
  whileInView: { opacity: 1, y: 0 },
  viewport: { once: true, margin: '-80px' },
  transition: { duration: 0.6, ease: [0.22, 1, 0.36, 1] },
};

export default function AboutContent() {
  const heroRef = useRef(null);
  const { scrollYProgress: heroScroll } = useScroll({
    target: heroRef,
    offset: ['start start', 'end start'],
  });
  const heroImageY = useTransform(heroScroll, [0, 1], ['0%', '18%']);

  return (
    <div className="pt-16">
      {/* ===== Hero ===== */}
      <section id="hero" ref={heroRef} className="relative bg-black">
        <div className="max-w-7xl mx-auto grid grid-cols-1 lg:grid-cols-[1.05fr_0.95fr] lg:min-h-[70vh]">
          <div className="order-2 lg:order-1 flex flex-col justify-center px-6 sm:px-10 lg:pl-6 lg:pr-14 py-14 lg:py-20 border-b lg:border-b-0 lg:border-r border-gray-800">
            <span className="font-bold text-[11px] tracking-[0.18em] uppercase text-yellow-500 mb-6">
              Since 2024 &middot; Operating across Africa
            </span>

            <h1 className="font-fraunces italic font-medium text-white text-4xl sm:text-5xl lg:text-[56px] leading-[1.08] tracking-tight mb-6 max-w-xl">
              Empowering Africa through <span className="not-italic font-semibold text-yellow-500">Bitcoin.</span>
            </h1>

            <p className="text-gray-400 text-base sm:text-lg leading-relaxed max-w-md mb-10">
              Our journey began with a simple belief: everyone deserves access to financial freedom.
              Bitcoin Africa Story is an independent media and education platform — not affiliated with
              any exchange or company.
            </p>

            <div className="flex flex-wrap items-center gap-6 sm:gap-8">
              <Link
                href="/donate"
                className="inline-flex items-center gap-2 bg-yellow-500 text-black font-bold text-sm sm:text-base px-6 py-4 sm:px-7 hover:brightness-95 transition-all duration-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-yellow-500 focus-visible:ring-offset-2 focus-visible:ring-offset-black"
              >
                Donate
                <ArrowRight size={18} />
              </Link>
              <Link
                href="/contact"
                className="text-sm sm:text-base font-semibold text-gray-200 border-b border-gray-700 pb-1 hover:text-yellow-500 hover:border-yellow-500 transition-colors duration-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-yellow-500 focus-visible:ring-offset-2 focus-visible:ring-offset-black"
              >
                Contact Us
              </Link>
            </div>
          </div>

          <div className="order-1 lg:order-2 relative min-h-[380px] sm:min-h-[440px] lg:min-h-0 overflow-hidden">
            <motion.div style={{ y: heroImageY }} className="absolute inset-0 -top-[10%] h-[120%]">
              <Image
                src="/assets/aboutus.png"
                alt="Bitcoin Africa Story classroom"
                fill
                priority
                sizes="(min-width: 1024px) 45vw, 100vw"
                className="object-cover"
              />
            </motion.div>
            <div className="hidden lg:block absolute inset-0 bg-[linear-gradient(90deg,rgba(0,0,0,0.85)_0%,rgba(0,0,0,0.25)_30%,rgba(0,0,0,0)_60%)]" />
            <div className="lg:hidden absolute inset-0 bg-[linear-gradient(180deg,rgba(0,0,0,0.15)_0%,rgba(0,0,0,0)_35%)]" />
            <div className="absolute inset-x-0 bottom-0 h-2/3 bg-gradient-to-t from-black via-black/70 to-transparent" />

            <div className="absolute bottom-0 left-0 right-0 grid grid-cols-2 gap-x-6 gap-y-5 px-6 sm:px-8 py-6 sm:py-8">
              {[
                { value: 2, suffix: '+', label: 'Years Teaching' },
                { value: 500, suffix: '+', label: 'Lives Changed' },
                { value: 50, suffix: '+', label: 'Communities' },
                { value: 100, suffix: '%', label: 'Free Education' },
              ].map((stat) => (
                <div key={stat.label}>
                  <div className="font-bold text-white text-[22px] sm:text-[26px] leading-none">
                    <CountUp end={stat.value} suffix={stat.suffix} />
                  </div>
                  <div className="font-semibold text-[10px] tracking-[0.14em] uppercase text-gray-300 mt-1.5">
                    {stat.label}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* ===== Pull-quote ===== */}
      <section className="py-20 sm:py-24 px-6 border-t border-b border-gray-800">
        <div className="max-w-4xl mx-auto">
          <motion.p
            {...fadeUp}
            className="font-fraunces italic font-medium text-2xl sm:text-3xl lg:text-[40px] leading-[1.35] text-gray-100"
          >
            <span className="text-yellow-500">&ldquo;</span>Why are so many Africans still excluded from
            financial opportunities when Bitcoin exists?<span className="text-yellow-500">&rdquo;</span>
          </motion.p>
          <motion.p
            {...fadeUp}
            transition={{ delay: 0.15 }}
            className="mt-6 text-xs font-semibold tracking-[0.14em] uppercase text-gray-500"
          >
            The question that started it all — 2024
          </motion.p>
        </div>
      </section>

      {/* ===== Story row 1 ===== */}
      <section className="py-20 px-6">
        <div className="max-w-6xl mx-auto">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 items-center">
            <div>
              <motion.h2 {...fadeUp} className="font-fraunces text-2xl md:text-3xl font-semibold mb-6">
                From One Question to a <span className="text-yellow-500">Continental Movement</span>
              </motion.h2>
              <div className="space-y-4 text-lg text-gray-300 leading-relaxed">
                {[
                  <p key="p1">
                    That question sparked a journey — from small, informal meetups in Nigeria to a growing
                    pan-African network of learners, merchants, educators, youths, and creators discovering
                    Bitcoin together.
                  </p>,
                  <p key="p2">
                    Through collaboration with Bitcoin initiatives across the continent, we&rsquo;ve seen the
                    impact firsthand: when Africans understand Bitcoin, everything changes.
                  </p>,
                ].map((node, index) => (
                  <motion.div
                    key={node.key}
                    initial={{ opacity: 0, y: 16 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true, margin: '-80px' }}
                    transition={{ duration: 0.5, delay: index * 0.1 }}
                  >
                    {node}
                  </motion.div>
                ))}
              </div>
            </div>

            <motion.div
              initial={{ opacity: 0, scale: 0.97 }}
              whileInView={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.7 }}
              viewport={{ once: true, margin: '-80px' }}
            >
              <Image
                src="/assets/communities.jpg"
                alt="Community"
                width={2100}
                height={1500}
                sizes="(min-width: 1024px) 50vw, 100vw"
                className="w-full h-auto shadow-2xl"
              />
            </motion.div>
          </div>
        </div>
      </section>

      {/* ===== Story row 2 (reversed) ===== */}
      <section className="py-20 px-6">
        <div className="max-w-6xl mx-auto">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 items-center">
            <motion.div
              initial={{ opacity: 0, scale: 0.97 }}
              whileInView={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.7 }}
              viewport={{ once: true, margin: '-80px' }}
              className="order-2 lg:order-1"
            >
              <Image
                src="/assets/education.jpg"
                alt="Community workshop"
                width={2100}
                height={1500}
                sizes="(min-width: 1024px) 50vw, 100vw"
                className="w-full h-auto shadow-2xl"
              />
            </motion.div>

            <div className="order-1 lg:order-2">
              <motion.h2 {...fadeUp} className="font-fraunces text-2xl md:text-3xl font-semibold mb-6">
                What We <span className="text-yellow-500">Stand On</span>
              </motion.h2>
              <motion.p
                initial={{ opacity: 0, y: 16 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, margin: '-80px' }}
                className="text-lg text-gray-300 leading-relaxed"
              >
                Today, Bitcoin Africa Story stands at the intersection of education, community empowerment,
                storytelling, and circular economy building. We&rsquo;re helping people not only learn Bitcoin,
                but use it in their daily lives.
              </motion.p>
            </div>
          </div>
        </div>
      </section>

      {/* ===== Mission / Vision ===== */}
      <section className="py-20 px-6 bg-gradient-to-b from-transparent via-gray-900/30 to-transparent">
        <div className="max-w-6xl mx-auto">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            <motion.div {...fadeUp} className="p-10 bg-gray-900 border border-gray-800">
              <div className="w-16 h-16 bg-yellow-500/10 rounded-full flex items-center justify-center mb-6">
                <Target className="text-yellow-500" size={32} />
              </div>
              <h2 className="font-fraunces text-3xl font-semibold mb-4">
                Our <span className="text-yellow-500">Mission</span>
              </h2>
              <p className="text-lg text-gray-300 leading-relaxed">
                To accelerate Bitcoin adoption in Africa through education, community empowerment,
                grassroots initiatives, and storytelling all aimed at making Bitcoin practical for
                everyday Africans.
              </p>
            </motion.div>

            <motion.div {...fadeUp} transition={{ delay: 0.1 }} className="p-10 bg-gray-900 border border-gray-800">
              <div className="w-16 h-16 bg-yellow-500/10 rounded-full flex items-center justify-center mb-6">
                <Heart className="text-yellow-500" size={32} />
              </div>
              <h2 className="font-fraunces text-3xl font-semibold mb-4">
                Our <span className="text-yellow-500">Vision</span>
              </h2>
              <p className="text-lg text-gray-300 leading-relaxed">
                To build a financially empowered Africa where individuals, families, and communities
                understand Bitcoin, use Bitcoin, and benefit from its freedom, transparency, and
                opportunity.
              </p>
            </motion.div>
          </div>
        </div>
      </section>

      {/* ===== Pillars — editorial numbered strip ===== */}
      <section className="py-20 px-6">
        <div className="max-w-7xl mx-auto">
          <motion.div {...fadeUp} className="mb-12 max-w-2xl">
            <h2 className="font-fraunces text-2xl md:text-3xl font-semibold mb-4">
              Four pillars, <span className="text-yellow-500">one story</span>
            </h2>
            <p className="text-lg text-gray-400">
              Discover how Bitcoin is transforming lives and creating opportunities across Africa
            </p>
          </motion.div>

          <div className="flex gap-5 overflow-x-auto pb-4 -mx-6 px-6 snap-x snap-mandatory scrollbar-thin">
            {pillars.map((pillar, index) => (
              <motion.div
                key={pillar.id}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, margin: '-80px' }}
                transition={{ duration: 0.5, delay: index * 0.08 }}
                className="min-w-[270px] sm:min-w-[300px] snap-start bg-gray-900 border border-gray-800 hover:border-yellow-500 transition-colors duration-300 p-8"
              >
                <div className="font-fraunces italic text-gray-700 text-4xl mb-4">{pillar.id}</div>
                <h3 className="text-xl font-bold mb-3 text-yellow-500">{pillar.title}</h3>
                <p className="text-gray-400 leading-relaxed">{pillar.description}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* ===== Journey ===== */}
      <section className="py-20 px-6">
        <div className="max-w-4xl mx-auto">
          <motion.div {...fadeUp} className="mb-16">
            <h2 className="font-fraunces text-2xl md:text-3xl font-semibold mb-4">
              Milestones on the <span className="text-yellow-500">Road</span>
            </h2>
            <p className="text-lg text-gray-400">To Africa&rsquo;s Bitcoin Future</p>
          </motion.div>

          <div className="relative border-l border-gray-800 ml-4">
            {milestones.map((milestone, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: index * 0.08 }}
                viewport={{ once: true, margin: '-80px' }}
                className="relative pl-10 pb-12 last:pb-0"
              >
                <div className="absolute -left-[15px] top-0 w-[30px] h-[30px] rounded-full bg-black border border-yellow-500 text-yellow-500 flex items-center justify-center text-xs font-bold">
                  {index + 1}
                </div>
                <span className="text-yellow-500 text-xs font-bold tracking-[0.1em]">{milestone.year}</span>
                <h3 className="text-xl font-bold mt-1 mb-2">{milestone.title}</h3>
                <p className="text-gray-400 leading-relaxed max-w-lg">{milestone.description}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* ===== Values — asymmetric bento ===== */}
      <section className="py-20 px-6 bg-gradient-to-b from-gray-900/30 to-transparent">
        <div className="max-w-6xl mx-auto">
          <motion.div {...fadeUp} className="mb-12">
            <span className="text-xs font-bold tracking-[0.14em] uppercase text-gray-500">Our Values</span>
            <h2 className="font-fraunces text-2xl md:text-3xl font-semibold mt-3">
              The principles that guide <span className="text-yellow-500">everything we do</span>
            </h2>
          </motion.div>

          <div className="grid grid-cols-1 md:grid-cols-[1.3fr_1fr] md:grid-rows-2 gap-5">
            <motion.div
              {...fadeUp}
              className="md:row-span-2 relative overflow-hidden bg-gray-900 border border-gray-800 hover:border-yellow-500 transition-colors duration-300 p-10 flex flex-col justify-end min-h-[280px]"
            >
              <span className="font-fraunces absolute top-6 right-7 text-[90px] leading-none font-bold text-gray-800/80 select-none">01</span>
              <Users className="text-yellow-500 mb-4 relative" size={30} />
              <h3 className="text-2xl font-bold mb-3 relative">Community First</h3>
              <p className="text-gray-400 leading-relaxed relative max-w-sm">
                Bitcoin adoption grows from the grassroots — through people, not institutions.
              </p>
            </motion.div>

            <motion.div
              {...fadeUp}
              transition={{ delay: 0.1 }}
              className="relative overflow-hidden bg-gray-900 border border-gray-800 hover:border-yellow-500 transition-colors duration-300 p-8"
            >
              <span className="font-fraunces absolute top-4 right-5 text-5xl leading-none font-bold text-gray-800/80 select-none">02</span>
              <Target className="text-yellow-500 mb-4 relative" size={26} />
              <h3 className="text-xl font-bold mb-2 relative">Education Excellence</h3>
              <p className="text-gray-400 leading-relaxed relative text-sm">
                We prioritize accuracy, clarity, and accessibility in every lesson and resource.
              </p>
            </motion.div>

            <motion.div
              {...fadeUp}
              transition={{ delay: 0.2 }}
              className="relative overflow-hidden bg-gray-900 border border-gray-800 hover:border-yellow-500 transition-colors duration-300 p-8"
            >
              <span className="font-fraunces absolute top-4 right-5 text-5xl leading-none font-bold text-gray-800/80 select-none">03</span>
              <Heart className="text-yellow-500 mb-4 relative" size={26} />
              <h3 className="text-xl font-bold mb-2 relative">Empowerment</h3>
              <p className="text-gray-400 leading-relaxed relative text-sm">
                We equip people with tools for independence, not dependency.
              </p>
            </motion.div>
          </div>
        </div>
      </section>

      {/* ===== CTA — photo banner with pill rows ===== */}
      <section className="py-24 px-6 relative overflow-hidden">
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[800px] bg-yellow-500/5 blur-[120px] rounded-full -z-10" />

        <motion.div
          {...fadeUp}
          className="max-w-6xl mx-auto bg-gray-900 border border-gray-800 grid grid-cols-1 lg:grid-cols-[1fr_1.2fr] overflow-hidden"
        >
          <div className="relative min-h-[280px] lg:min-h-[440px]">
            <Image
              src="/assets/story.jpg"
              alt="Bitcoin Africa Story community"
              fill
              sizes="(min-width: 1024px) 40vw, 100vw"
              className="object-cover"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-black via-black/20 to-transparent lg:bg-gradient-to-r lg:from-transparent lg:via-transparent lg:to-black/10" />
          </div>

          <div className="p-8 sm:p-12 lg:p-14 flex flex-col justify-center">
            <span className="text-yellow-500 text-xs font-bold uppercase tracking-widest mb-4">Join The Movement</span>
            <h2 className="font-fraunces text-3xl sm:text-4xl font-semibold mb-4 text-white leading-tight">
              Ready to shape the <span className="text-yellow-500">future of Africa?</span>
            </h2>
            <p className="text-gray-400 mb-8 max-w-md leading-relaxed">
              Whether you&rsquo;re a beginner or a builder, there&rsquo;s a place for you in the Bitcoin revolution.
            </p>

            <div className="flex flex-col gap-3">
              <Link
                href="/education"
                className="group flex items-center justify-between px-6 py-4 bg-black border border-gray-700 hover:border-yellow-500 transition-colors duration-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-yellow-500"
              >
                <span className="flex items-center gap-3 font-semibold text-gray-100 group-hover:text-yellow-500 transition-colors">
                  <BookOpen size={18} className="text-yellow-500" /> Learn Bitcoin
                </span>
                <ArrowRight size={18} className="text-gray-600 group-hover:text-yellow-500 group-hover:translate-x-1 transition-all" />
              </Link>
              <Link
                href="/donate"
                className="group flex items-center justify-between px-6 py-4 bg-black border border-gray-700 hover:border-yellow-500 transition-colors duration-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-yellow-500"
              >
                <span className="flex items-center gap-3 font-semibold text-gray-100 group-hover:text-yellow-500 transition-colors">
                  <Heart size={18} className="text-yellow-500" /> Support Our Work
                </span>
                <ArrowRight size={18} className="text-gray-600 group-hover:text-yellow-500 group-hover:translate-x-1 transition-all" />
              </Link>
              <Link
                href="/events"
                className="group flex items-center justify-between px-6 py-4 bg-black border border-gray-700 hover:border-yellow-500 transition-colors duration-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-yellow-500"
              >
                <span className="flex items-center gap-3 font-semibold text-gray-100 group-hover:text-yellow-500 transition-colors">
                  <Users size={18} className="text-yellow-500" /> Join Our Events
                </span>
                <ArrowRight size={18} className="text-gray-600 group-hover:text-yellow-500 group-hover:translate-x-1 transition-all" />
              </Link>
            </div>
          </div>
        </motion.div>
      </section>
    </div>
  );
}
