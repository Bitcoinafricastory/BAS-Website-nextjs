'use client';

import { Calendar, Users, Target, Heart, ArrowRight, BookOpen } from 'lucide-react';
import Link from 'next/link';
import Image from 'next/image';
import { motion } from 'framer-motion';
import CountUp from '@/components/ui/CountUp';

const milestones = [
  { year: '2024', title: 'The Beginning', description: 'Started teaching Bitcoin to local communities in Nigeria.' },
  { year: '2024', title: 'First 100 Students', description: 'Reached our first 100 students across multiple cities' },
  { year: '2024', title: 'Growing Across Africa', description: 'Extended education programs to Ghana, Kenya, and South Africa' },
  { year: '2025', title: ' 300+ Community Members', description: 'Built a thriving network of students, learners, volunteers, and educators across Africa.' },
  { year: '2025', title: '6 Online Bitcoin Diplomas', description: 'Launched online Bitcoin learning programs to make education accessible to every African, anywhere.' },
  { year: '2025', title: '10+ Bitcoin Events', description: 'Hosted impactful events — from school sessions to classroom workshops, church outreach, youth hangouts, and community meetups.' },
  { year: '2025', title: 'Building Circular Economies', description: 'Launched initiatives like Bitcoin Ikorodu and continued scaling real Bitcoin adoption across African communities.' },
];

export default function AboutContent() {
  return (
    <div className="pt-16">
      <section id="hero" className="relative bg-black">
        <div className="max-w-7xl mx-auto grid grid-cols-1 lg:grid-cols-[1.05fr_0.95fr] lg:min-h-[70vh]">
          <div className="order-2 lg:order-1 flex flex-col justify-center px-6 sm:px-10 lg:pl-6 lg:pr-14 py-14 lg:py-20 border-b lg:border-b-0 lg:border-r border-gray-800">
            <span className="font-bold text-[11px] tracking-[0.18em] uppercase text-yellow-500 mb-6">
              Since 2024 &middot; Operating across Africa
            </span>

            <h1 className="font-semibold text-white text-[36px] sm:text-[46px] lg:text-[54px] leading-[1.05] tracking-tight mb-6 max-w-xl">
              Empowering Africa through <em className="italic text-yellow-500">Bitcoin.</em>
            </h1>

            <p className="text-gray-400 text-base sm:text-lg leading-relaxed max-w-md mb-10">
              Our journey began with a simple belief: everyone deserves access to financial freedom.
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
            <Image
              src="/assets/aboutus.png"
              alt="Bitcoin Africa Story classroom"
              fill
              priority
              sizes="(min-width: 1024px) 45vw, 100vw"
              className="object-cover"
            />
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

      <section className="py-20 px-6">
        <div className="max-w-6xl mx-auto">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 items-center">
            <div>
              <h2 className="text-4xl font-bold mb-6">
                Our <span className="text-yellow-500">Story</span>
              </h2>
              <div className="space-y-4 text-lg text-gray-300 leading-relaxed">
                <h5>From One Question to a Continental Movement</h5>
                <h5>Bitcoin Africa Story started with a question:</h5>
                <p>&ldquo;Why are so many Africans still excluded from financial opportunities when Bitcoin exists?&rdquo;</p>
                <p>
                  That question sparked a journey — from small, informal meetups in Nigeria to a growing
                  pan-African network of learners, merchants, educators, youths, and creators discovering
                  Bitcoin together.
                </p>
                <p>
                  Through collaboration with Bitcoin initiatives across the continent. We&rsquo;ve seen the impact
                  firsthand: When Africans understand Bitcoin, everything changes.
                </p>
                <p>
                  Today, Bitcoin Africa Story stands at the intersection of education, community empowerment,
                  storytelling, and circular economy building. We&rsquo;re helping people not only learn Bitcoin,
                  but use it in their daily lives.
                </p>
              </div>
            </div>

            <div className="space-y-6">
              <Image
                src="/assets/communities.jpg"
                alt="Community"
                width={2100}
                height={1500}
                sizes="(min-width: 1024px) 50vw, 100vw"
                className="w-full h-auto shadow-2xl"
              />
              <div className="grid grid-cols-2 gap-6">
                <div className="p-6 bg-gray-900 border border-gray-800">
                  <div className="text-3xl font-bold text-yellow-500 mb-2"><CountUp end={2} suffix="+" /></div>
                  <div className="text-gray-400">Years of Teaching</div>
                </div>
                <div className="p-6 bg-gray-900 border border-gray-800">
                  <div className="text-3xl font-bold text-yellow-500 mb-2"><CountUp end={500} suffix="+" /></div>
                  <div className="text-gray-400">Lives Changed</div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      <section className="py-20 px-6 bg-gradient-to-b from-transparent via-gray-900/30 to-transparent">
        <div className="max-w-6xl mx-auto">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            <div className="p-10 bg-gray-900 border border-gray-800">
              <div className="w-16 h-16 bg-yellow-500/10 rounded-full flex items-center justify-center mb-6">
                <Target className="text-yellow-500" size={32} />
              </div>
              <h2 className="text-3xl font-bold mb-4">
                Our <span className="text-yellow-500">Mission</span>
              </h2>
              <p className="text-lg text-gray-300 leading-relaxed">
                To accelerate Bitcoin adoption in Africa through education, community empowerment,
                grassroots initiatives, and storytelling all aimed at making Bitcoin practical for
                everyday Africans.
              </p>
            </div>

            <div className="p-10 bg-gray-900 border border-gray-800">
              <div className="w-16 h-16 bg-yellow-500/10 rounded-full flex items-center justify-center mb-6">
                <Heart className="text-yellow-500" size={32} />
              </div>
              <h2 className="text-3xl font-bold mb-4">
                Our <span className="text-yellow-500">Vision</span>
              </h2>
              <p className="text-lg text-gray-300 leading-relaxed">
                To build a financially empowered Africa where individuals, families, and communities
                understand Bitcoin, use Bitcoin, and benefit from its freedom, transparency, and
                opportunity.
              </p>
            </div>
          </div>
        </div>
      </section>

      <section className="py-20 px-6">
        <div className="max-w-5xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-4xl md:text-5xl font-bold mb-4">
              Our <span className="text-yellow-500">Journey</span>
            </h2>
            <p className="text-xl text-gray-400">Milestones on the Road to Africa&rsquo;s Bitcoin Future</p>
          </div>

          <div className="relative">
            <div className="absolute left-8 md:left-1/2 top-0 bottom-0 w-0.5 bg-yellow-500/30" />
            <div className="space-y-12">
              {milestones.map((milestone, index) => (
                <motion.div
                  key={index}
                  initial={{ opacity: 0, y: 50 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.6, delay: index * 0.2 }}
                  viewport={{ once: true }}
                  className={`relative flex items-center ${index % 2 === 0 ? 'md:flex-row' : 'md:flex-row-reverse'}`}
                >
                  <div className="absolute left-8 md:left-1/2 w-4 h-4 bg-yellow-500 border-4 border-black transform -translate-x-1/2" />
                  <div className={`w-full md:w-1/2 ${index % 2 === 0 ? 'md:pr-12 pl-16 md:pl-0' : 'md:pl-12 pl-16 md:pl-0'}`}>
                    <div className="p-6 bg-gray-900 border border-gray-800 hover:border-yellow-500 transition-colors duration-300">
                      <div className="flex items-center mb-3">
                        <Calendar className="text-yellow-500 mr-2" size={20} />
                        <span className="text-yellow-500 font-bold">{milestone.year}</span>
                      </div>
                      <h3 className="text-xl font-bold mb-2">{milestone.title}</h3>
                      <p className="text-gray-400">{milestone.description}</p>
                    </div>
                  </div>
                </motion.div>
              ))}
            </div>
          </div>
        </div>
      </section>

      <section className="py-20 px-6 bg-gradient-to-b from-gray-900/30 to-transparent">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-4xl md:text-5xl font-bold mb-4">
              Our <span className="text-yellow-500">Values</span>
            </h2>
            <p className="text-xl text-gray-400">The principles that guide everything we do</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="p-8 bg-gray-900 border border-gray-800 text-center hover:border-yellow-500 transition-colors duration-300">
              <div className="w-16 h-16 bg-yellow-500/10 rounded-full flex items-center justify-center mx-auto mb-6">
                <Users className="text-yellow-500" size={32} />
              </div>
              <h3 className="text-2xl font-bold mb-4">Community First</h3>
              <p className="text-gray-400 leading-relaxed">
                Bitcoin adoption grows from the grassroots — through people, not institutions.
              </p>
            </div>

            <div className="p-8 bg-gray-900 border border-gray-800 text-center hover:border-yellow-500 transition-colors duration-300">
              <div className="w-16 h-16 bg-yellow-500/10 rounded-full flex items-center justify-center mx-auto mb-6">
                <Target className="text-yellow-500" size={32} />
              </div>
              <h3 className="text-2xl font-bold mb-4">Education Excellence</h3>
              <p className="text-gray-400 leading-relaxed">
                We prioritize accuracy, clarity, and accessibility in every lesson and resource.
              </p>
            </div>

            <div className="p-8 bg-gray-900 border border-gray-800 text-center hover:border-yellow-500 transition-colors duration-300">
              <div className="w-16 h-16 bg-yellow-500/10 rounded-full flex items-center justify-center mx-auto mb-6">
                <Heart className="text-yellow-500" size={32} />
              </div>
              <h3 className="text-2xl font-bold mb-4">Empowerment</h3>
              <p className="text-gray-400 leading-relaxed">
                We equip people with tools for independence, not dependency.
              </p>
            </div>
          </div>
        </div>
      </section>

      <section className="py-24 px-6 relative overflow-hidden">
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[800px] bg-yellow-500/5 blur-[120px] rounded-full -z-10" />

        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-16">
            <motion.div initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} className="inline-block mb-4 px-4 py-2 bg-yellow-500/10 border border-yellow-500/20 rounded-full">
              <span className="text-yellow-500 text-sm font-bold uppercase tracking-widest">Join The Movement</span>
            </motion.div>
            <motion.h2 initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ delay: 0.1 }} className="text-4xl md:text-5xl font-semibold mb-6 text-white">
              Ready to Shape the <br className="hidden md:block" />
              <span className="text-yellow-500">Future of Africa?</span>
            </motion.h2>
            <motion.p initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ delay: 0.2 }} className="text-xl text-gray-400 max-w-2xl mx-auto">
              Whether you&rsquo;re a beginner or a builder, there&rsquo;s a place for you in the Bitcoin revolution.
            </motion.p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <motion.div initial={{ opacity: 0, y: 30 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} className="group bg-gray-900/50 border border-white/5 p-8 hover:border-yellow-500/30 transition-all duration-500 flex flex-col h-full">
              <div className="w-14 h-14 bg-yellow-500/10 rounded-2xl flex items-center justify-center mb-6 group-hover:scale-110 transition-transform">
                <BookOpen className="text-yellow-500" size={28} />
              </div>
              <h3 className="text-2xl font-bold text-white mb-4">Learn Bitcoin</h3>
              <p className="text-gray-400 mb-8 flex-grow leading-relaxed">
                Start your journey with our free comprehensive Bitcoin programs. Master the fundamentals of sound money.
              </p>
              <Link href="/education" className="inline-flex items-center text-yellow-500 font-bold hover:gap-3 transition-all">
                Get Started <ArrowRight className="ml-2" size={20} />
              </Link>
            </motion.div>

            <motion.div initial={{ opacity: 0, y: 30 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ delay: 0.1 }} className="group bg-gray-900/50 border border-white/5 p-8 hover:border-yellow-500/30 transition-all duration-500 flex flex-col h-full">
              <div className="w-14 h-14 bg-yellow-500/10 rounded-2xl flex items-center justify-center mb-6 group-hover:scale-110 transition-transform">
                <Heart className="text-yellow-500" size={28} />
              </div>
              <h3 className="text-2xl font-bold text-white mb-4">Support Our Work</h3>
              <p className="text-gray-400 mb-8 flex-grow leading-relaxed">
                Your contributions help us reach more communities and provide free Bitcoin education across Africa.
              </p>
              <Link href="/donate" className="inline-flex items-center text-yellow-500 font-bold hover:gap-3 transition-all">
                Donate Now <ArrowRight className="ml-2" size={20} />
              </Link>
            </motion.div>

            <motion.div initial={{ opacity: 0, y: 30 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ delay: 0.2 }} className="group bg-gray-900/50 border border-white/5 p-8 hover:border-yellow-500/30 transition-all duration-500 flex flex-col h-full">
              <div className="w-14 h-14 bg-yellow-500/10 rounded-2xl flex items-center justify-center mb-6 group-hover:scale-110 transition-transform">
                <Users className="text-yellow-500" size={28} />
              </div>
              <h3 className="text-2xl font-bold text-white mb-4">Join Our Events</h3>
              <p className="text-gray-400 mb-8 flex-grow leading-relaxed">
                Connect with local Bitcoiners. Discover meetups, workshops, and conferences happening near you.
              </p>
              <Link href="/events" className="inline-flex items-center text-yellow-500 font-bold hover:gap-3 transition-all">
                Find Meetups <ArrowRight className="ml-2" size={20} />
              </Link>
            </motion.div>
          </div>
        </div>
      </section>
    </div>
  );
}
