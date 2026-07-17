'use client';

import { BookOpen, Shield, ExternalLink, FileCode2, Wrench } from 'lucide-react';

const recommendedWallets = [
  { name: 'BlueWallet', description: 'User-friendly mobile Bitcoin wallet', url: 'https://bluewallet.io' },
  { name: 'Muun', description: 'Simple and secure Bitcoin wallet', url: 'https://muun.com' },
  { name: 'Sparrow', description: 'Desktop Bitcoin wallet for power users', url: 'https://sparrowwallet.com' },
];

const foundationalLearning = [
  { name: 'The Bitcoin Whitepaper', description: "Satoshi Nakamoto's original paper — the theoretical foundation everything else builds on.", url: 'https://bitcoin.org/bitcoin.pdf' },
  { name: 'Learn Me A Bitcoin', description: 'Clear, visual breakdowns of how Bitcoin actually works, from first principles to technical detail.', url: 'https://learnmeabitcoin.com' },
  { name: "Jameson Lopp's Bitcoin Resources", description: 'A long-running, carefully curated list spanning beginner to expert-level material.', url: 'https://www.lopp.net/bitcoin-information.html' },
  { name: 'Mastering Bitcoin', description: "Andreas Antonopoulos's open-source reference book — the in-depth technical guide, free on GitHub.", url: 'https://github.com/bitcoinbook/bitcoinbook' },
];

const toolsAndTracking = [
  { name: 'mempool.space', description: 'Track real-time network fees, unconfirmed transactions, and the Lightning Network.', url: 'https://mempool.space' },
  { name: 'Bitcoin.org: Getting Started', description: 'Choosing a wallet and making your first Bitcoin payment, explained simply.', url: 'https://bitcoin.org/en/getting-started' },
];

const developerResources = [
  { name: 'Bitcoin Developer Documentation', description: 'Technical references and guides for building directly on the Bitcoin network.', url: 'https://developer.bitcoin.org' },
];

function ResourceCard({ resource, Icon }) {
  return (
    <a
      href={resource.url}
      target="_blank"
      rel="noopener noreferrer"
      className="group p-8 bg-gray-900 border border-gray-800 rounded-xl hover:border-yellow-500 transition-all duration-300 flex flex-col"
    >
      <div className="w-14 h-14 bg-yellow-500/10 rounded-lg flex items-center justify-center mb-6">
        <Icon className="text-yellow-500" size={28} />
      </div>
      <h3 className="text-xl font-bold mb-3 group-hover:text-yellow-500 transition-colors duration-200">{resource.name}</h3>
      <p className="text-gray-400 mb-4 flex-grow">{resource.description}</p>
      <span className="inline-flex items-center text-yellow-500 font-semibold">
        Visit Site
        <ExternalLink size={16} className="ml-2 group-hover:translate-x-1 transition-transform duration-200" />
      </span>
    </a>
  );
}

export default function ResourcesContent() {
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

      <section className="py-16 px-6">
        <div className="max-w-6xl mx-auto">
          <div className="mb-12">
            <h2 className="text-4xl font-bold mb-4">
              Foundational <span className="text-yellow-500">Learning</span>
            </h2>
            <p className="text-lg text-gray-400">Start here — from the original whitepaper to the definitive technical reference</p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {foundationalLearning.map((resource) => (
              <ResourceCard key={resource.name} resource={resource} Icon={BookOpen} />
            ))}
          </div>
        </div>
      </section>

      <section className="py-16 px-6 bg-gradient-to-b from-transparent via-gray-900/30 to-transparent">
        <div className="max-w-6xl mx-auto">
          <div className="mb-12">
            <h2 className="text-4xl font-bold mb-4">
              Tools &amp; <span className="text-yellow-500">Tracking</span>
            </h2>
            <p className="text-lg text-gray-400">Live network data and practical guides for actually using Bitcoin</p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {toolsAndTracking.map((resource) => (
              <ResourceCard key={resource.name} resource={resource} Icon={Wrench} />
            ))}
          </div>
        </div>
      </section>

      <section className="py-16 px-6">
        <div className="max-w-6xl mx-auto">
          <div className="mb-12">
            <h2 className="text-4xl font-bold mb-4">
              For <span className="text-yellow-500">Developers</span>
            </h2>
            <p className="text-lg text-gray-400">Building on Bitcoin? Start with the official technical documentation</p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {developerResources.map((resource) => (
              <ResourceCard key={resource.name} resource={resource} Icon={FileCode2} />
            ))}
          </div>
        </div>
      </section>

      <section className="py-16 px-6 bg-gradient-to-b from-transparent via-gray-900/30 to-transparent">
        <div className="max-w-6xl mx-auto">
          <div className="mb-12">
            <h2 className="text-4xl font-bold mb-4">
              Recommended <span className="text-yellow-500">Wallets</span>
            </h2>
            <p className="text-lg text-gray-400">Secure and trusted Bitcoin wallets for storing your funds</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {recommendedWallets.map((wallet) => (
              <div key={wallet.name} className="p-8 bg-gray-900 border border-gray-800 rounded-xl hover:border-yellow-500 transition-all duration-300 text-center">
                <div className="w-16 h-16 bg-yellow-500/10 rounded-full flex items-center justify-center mx-auto mb-6">
                  <Shield className="text-yellow-500" size={32} />
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

          <div className="mt-8 p-6 bg-yellow-500/10 border border-yellow-500/30 rounded-xl">
            <p className="text-gray-300 text-center">
              <strong className="text-yellow-500">Security Tip:</strong> Always download wallets from
              official websites. Never share your seed phrase with anyone, and always keep backups in a
              secure location.
            </p>
          </div>
        </div>
      </section>

      <section className="py-16 px-6">
        <div className="max-w-4xl mx-auto text-center">
          <h2 className="text-4xl font-bold mb-6">
            Video <span className="text-yellow-500">Tutorials</span>
          </h2>
          <p className="text-lg text-gray-400 mb-8">Visual guides and tutorials to help you understand Bitcoin concepts</p>
          <div className="aspect-video bg-gray-900 border border-gray-800 rounded-xl flex items-center justify-center">
            <p className="text-gray-500">Video tutorials coming soon</p>
          </div>
        </div>
      </section>

      <section className="py-20 px-6">
        <div className="max-w-4xl mx-auto text-center">
          <div className="bg-gradient-to-r from-yellow-500/10 to-yellow-600/10 border border-yellow-500/30 rounded-2xl p-12">
            <h2 className="text-3xl md:text-4xl font-bold mb-4">Need More Help?</h2>
            <p className="text-lg text-gray-300 mb-8 max-w-2xl mx-auto">
              Have questions or need personalized guidance? Reach out to us and we&rsquo;ll help you on your
              Bitcoin journey.
            </p>
            <a href="/contact" className="inline-block px-8 py-4 bg-yellow-500 text-black font-bold text-lg rounded-lg hover:bg-yellow-400 transition-all duration-200 hover:scale-105">
              Contact Us
            </a>
          </div>
        </div>
      </section>
    </div>
  );
}
