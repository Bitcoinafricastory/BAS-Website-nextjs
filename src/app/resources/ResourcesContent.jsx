import Image from 'next/image';
import Link from 'next/link';
import { ExternalLink, ArrowUpRight, Play } from 'lucide-react';

const recommendedWallets = [
  { name: 'Blink', description: 'The Lightning wallet the Bitcoin Africa Story community actually uses day to day.', url: 'https://www.blink.sv', logo: '/assets/wallets/blink-logo.png' },
  { name: 'Sparrow', description: 'Desktop Bitcoin wallet for power users who want full control.', url: 'https://sparrowwallet.com', logo: '/assets/wallets/sparrow-logo.png' },
];

const foundationalLearning = [
  { name: 'The Bitcoin Whitepaper', description: "Satoshi Nakamoto's original paper — the theoretical foundation everything else builds on.", url: 'https://bitcoin.org/bitcoin.pdf' },
  { name: 'Learn Me A Bitcoin', description: 'Clear, visual breakdowns of how Bitcoin actually works, from first principles to technical detail.', url: 'https://learnmeabitcoin.com' },
  { name: "Jameson Lopp's Bitcoin Resources", description: 'A long-running, carefully curated list spanning beginner to expert-level material.', url: 'https://www.lopp.net/bitcoin-information.html' },
  { name: 'Mastering Bitcoin', description: "Andreas Antonopoulos's open-source reference book — the in-depth technical guide, free on GitHub.", url: 'https://github.com/bitcoinbook/bitcoinbook' },
];

const toolsAndDevelopers = [
  { name: 'mempool.space', description: 'Track real-time network fees, unconfirmed transactions, and the Lightning Network.', url: 'https://mempool.space' },
  { name: 'Bitcoin.org: Getting Started', description: 'Choosing a wallet and making your first Bitcoin payment, explained simply.', url: 'https://bitcoin.org/en/getting-started' },
  { name: 'Bitcoin Developer Documentation', description: 'Technical references and guides for building directly on the Bitcoin network.', url: 'https://developer.bitcoin.org' },
];

function ResourceRow({ resource }) {
  return (
    <a
      href={resource.url}
      target="_blank"
      rel="noopener noreferrer"
      className="group flex items-start justify-between gap-6 py-6 border-b border-gray-800 hover:bg-gray-900/40 transition-colors -mx-4 px-4"
    >
      <div>
        <h3 className="text-lg font-bold mb-1.5 group-hover:text-yellow-500 transition-colors">{resource.name}</h3>
        <p className="text-gray-400 text-sm max-w-xl">{resource.description}</p>
      </div>
      <ArrowUpRight size={20} className="text-gray-600 group-hover:text-yellow-500 flex-shrink-0 mt-1 transition-all group-hover:-translate-y-0.5 group-hover:translate-x-0.5" />
    </a>
  );
}

export default function ResourcesContent({ episodes = [] }) {
  return (
    <div className="pt-16">
      <section className="py-20 px-6 bg-gradient-to-b from-gray-900/30 to-transparent">
        <div className="max-w-4xl mx-auto text-center">
          <div className="hidden sm:inline-block mb-6 px-4 py-2 bg-yellow-500/10 border border-yellow-500/30 rounded-full">
            <span className="text-yellow-500 text-sm font-semibold">Learning Resources</span>
          </div>
          <h1 className="text-5xl md:text-6xl font-semibold mb-6">
            Bitcoin <span className="text-yellow-500">Resources</span>
          </h1>
          <p className="text-xl text-gray-300 leading-relaxed">
            Everything you need to start your Bitcoin journey. Guides, tools, and trusted resources to
            help you learn and grow.
          </p>
        </div>
      </section>

      {/* Editorial reference list — deliberately not another card grid, so this section reads
          like a curated bibliography rather than a fifth identical box of icons. */}
      <section className="py-16 px-6">
        <div className="max-w-4xl mx-auto">
          <div className="mb-8">
            <h2 className="text-4xl font-bold mb-4">
              Foundational <span className="text-yellow-500">Learning</span>
            </h2>
            <p className="text-lg text-gray-400">Start here — from the original whitepaper to the definitive technical reference</p>
          </div>
          <div>
            {foundationalLearning.map((resource) => (
              <ResourceRow key={resource.name} resource={resource} />
            ))}
          </div>
        </div>
      </section>

      {/* Podcast — real episodes, real thumbnails, replacing the old empty
          "video tutorials coming soon" placeholder. */}
      {episodes.length > 0 && (
        <section className="py-16 px-6 bg-gradient-to-b from-transparent via-gray-900/30 to-transparent">
          <div className="max-w-6xl mx-auto">
            <div className="mb-12 flex items-end justify-between flex-wrap gap-4">
              <div>
                <h2 className="text-4xl font-bold mb-4">
                  The <span className="text-yellow-500">Podcast</span>
                </h2>
                <p className="text-lg text-gray-400">Conversations with the people building Bitcoin across Africa</p>
              </div>
              <Link href="/podcast" className="inline-flex items-center gap-2 text-yellow-500 font-semibold hover:text-yellow-400 transition-colors">
                All episodes <ArrowUpRight size={16} />
              </Link>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {episodes.map((ep) => (
                <a key={ep.id} href={ep.url} target="_blank" rel="noopener noreferrer" className="group block bg-gray-900 border border-gray-800 rounded-xl overflow-hidden hover:border-yellow-500 transition-all duration-300">
                  <div className="relative aspect-video bg-gray-800">
                    {ep.image && (
                      <Image src={ep.image} alt={ep.title} fill sizes="(min-width: 768px) 33vw, 100vw" className="object-cover opacity-80 group-hover:opacity-100 transition-opacity" />
                    )}
                    <div className="absolute inset-0 flex items-center justify-center">
                      <div className="w-12 h-12 rounded-full bg-black/60 backdrop-blur-sm flex items-center justify-center group-hover:bg-yellow-500 transition-colors">
                        <Play size={18} className="text-white group-hover:text-black ml-0.5" fill="currentColor" />
                      </div>
                    </div>
                  </div>
                  <div className="p-5">
                    {ep.episodeNumber && <p className="text-xs font-bold text-yellow-500 uppercase tracking-wide mb-1.5">Episode {ep.episodeNumber}</p>}
                    <h3 className="font-bold group-hover:text-yellow-500 transition-colors line-clamp-2 leading-snug">{ep.title}</h3>
                  </div>
                </a>
              ))}
            </div>
          </div>
        </section>
      )}

      {/* Tools, tracking, and developer references — same editorial row treatment as
          Foundational Learning, so the page doesn't fall back into box-after-box. */}
      <section className="py-16 px-6">
        <div className="max-w-4xl mx-auto">
          <div className="mb-8">
            <h2 className="text-4xl font-bold mb-4">
              Tools &amp; <span className="text-yellow-500">Development</span>
            </h2>
            <p className="text-lg text-gray-400">Live network data and technical references for using and building on Bitcoin</p>
          </div>
          <div>
            {toolsAndDevelopers.map((resource) => (
              <ResourceRow key={resource.name} resource={resource} />
            ))}
          </div>
        </div>
      </section>

      <section className="py-16 px-6 bg-gradient-to-b from-transparent via-gray-900/30 to-transparent">
        <div className="max-w-4xl mx-auto">
          <div className="mb-12">
            <h2 className="text-4xl font-bold mb-4">
              Recommended <span className="text-yellow-500">Wallets</span>
            </h2>
            <p className="text-lg text-gray-400">The two wallets our community actually uses and trusts</p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
            {recommendedWallets.map((wallet) => (
              <div key={wallet.name} className="p-8 bg-gray-900 border border-gray-800 rounded-xl hover:border-yellow-500 transition-all duration-300 text-center">
                <div className="relative w-full h-16 mb-6">
                  <Image src={wallet.logo} alt={`${wallet.name} logo`} fill sizes="200px" className="object-contain" />
                </div>
                <h3 className="text-xl font-bold mb-3">{wallet.name}</h3>
                <p className="text-gray-400 mb-6">{wallet.description}</p>
                <a href={wallet.url} target="_blank" rel="noopener noreferrer" className="inline-flex items-center text-yellow-500 font-semibold hover:text-yellow-400 transition-colors duration-200">
                  Visit Website
                  <ExternalLink size={16} className="ml-2" />
                </a>
              </div>
            ))}
          </div>

          <div className="mt-8 p-6 bg-yellow-500/10 border border-yellow-500/30 rounded-xl max-w-4xl">
            <p className="text-gray-300 text-center">
              <strong className="text-yellow-500">Security Tip:</strong> Always download wallets from
              official websites. Never share your seed phrase with anyone, and always keep backups in a
              secure location.
            </p>
          </div>
        </div>
      </section>

      {/* Contact CTA — full-bleed with a flowing diagonal gradient sweep instead of yet
          another bordered rounded box (that pattern already repeats for Security Tip above);
          asymmetric layout so it doesn't just read as "centered text in a container" again. */}
      <section className="relative py-24 px-6 overflow-hidden border-t border-gray-800">
        <div
          className="pointer-events-none absolute inset-0 opacity-20"
          style={{ background: 'radial-gradient(ellipse 60% 80% at 15% 50%, #eab308, transparent 70%)' }}
          aria-hidden="true"
        />
        <div className="relative max-w-6xl mx-auto flex flex-col md:flex-row items-center md:items-end justify-between gap-8">
          <div className="max-w-xl">
            <span className="inline-block text-yellow-500 text-xs font-bold uppercase tracking-widest mb-4">Still have questions?</span>
            <h2 className="text-3xl md:text-4xl font-bold mb-4">Need more help?</h2>
            <p className="text-lg text-gray-300">
              Reach out and we&rsquo;ll help you on your Bitcoin journey — no question too basic.
            </p>
          </div>
          <a
            href="/contact"
            className="flex-shrink-0 inline-flex items-center gap-2 px-8 py-4 bg-yellow-500 text-black font-bold text-lg rounded-lg hover:bg-yellow-400 hover:gap-3 transition-all duration-200"
          >
            Contact Us <ArrowUpRight size={20} />
          </a>
        </div>
      </section>
    </div>
  );
}
