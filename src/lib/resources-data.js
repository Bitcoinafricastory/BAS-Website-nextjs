// Single source of truth for the Resources hub and each category page.
//
// Two kinds of categories:
//  - Internal listing categories (Learning, Tools, Wallets): have their own
//    /resources/[slug] page that lists the `items` below. Each is its own
//    indexable page — good for SEO (e.g. ranks for "bitcoin learning resources").
//  - Pointer categories (Podcast): no duplicate listing; the tile links straight
//    to an existing canonical page (/podcast) that already owns that content and
//    its schema. Avoids duplicate-content splitting of ranking signals.
//  - "Soon" categories: shown greyed-out on the hub to signal what's coming,
//    with no link yet.

export const RESOURCE_CATEGORIES = [
  {
    slug: 'learning',
    title: 'Learning',
    icon: 'GraduationCap',
    blurb:
      'The whitepaper, guides, and books to understand Bitcoin from first principles to deep technical detail.',
    items: [
      {
        name: 'The Bitcoin Whitepaper',
        description:
          "Satoshi Nakamoto's original paper — the theoretical foundation everything else builds on.",
        url: 'https://bitcoin.org/bitcoin.pdf',
      },
      {
        name: 'Learn Me A Bitcoin',
        description:
          'Clear, visual breakdowns of how Bitcoin actually works, from first principles to technical detail.',
        url: 'https://learnmeabitcoin.com',
      },
      {
        name: "Jameson Lopp's Bitcoin Resources",
        description:
          'A long-running, carefully curated list spanning beginner to expert-level material.',
        url: 'https://www.lopp.net/bitcoin-information.html',
      },
      {
        name: 'Mastering Bitcoin',
        description:
          "Andreas Antonopoulos's open-source reference book — the in-depth technical guide, free on GitHub.",
        url: 'https://github.com/bitcoinbook/bitcoinbook',
      },
    ],
  },
  {
    slug: 'tools',
    title: 'Tools & Developers',
    icon: 'Wrench',
    blurb:
      'Explorers, network dashboards, and developer documentation for building on Bitcoin.',
    items: [
      {
        name: 'mempool.space',
        description:
          'Track real-time network fees, unconfirmed transactions, and the Lightning Network.',
        url: 'https://mempool.space',
      },
      {
        name: 'Bitcoin.org: Getting Started',
        description:
          'Choosing a wallet and making your first Bitcoin payment, explained simply.',
        url: 'https://bitcoin.org/en/getting-started',
      },
      {
        name: 'Bitcoin Developer Documentation',
        description:
          'Technical references and guides for building directly on the Bitcoin network.',
        url: 'https://developer.bitcoin.org',
      },
    ],
  },
  {
    slug: 'wallets',
    title: 'Wallets',
    icon: 'Wallet',
    blurb:
      'Wallet options community members use, from everyday Lightning payments to desktop self-custody.',
    disclaimer:
      'Not an endorsement: Bitcoin Africa Story is not affiliated with, sponsored by, or responsible for any wallet listed here. Always do your own research, download wallets only from official sources, never share your seed phrase with anyone, and keep backups in a secure location.',
    items: [
      {
        name: 'Blink',
        description:
          'The everyday Bitcoin wallet. A reliable and secure Bitcoin payments experience for all.',
        url: 'https://www.blink.sv',
      },
      {
        name: 'Sparrow',
        description: 'A desktop Bitcoin wallet some community members use for self-custody.',
        url: 'https://sparrowwallet.com',
      },
    ],
  },
  // Pointer categories — link to canonical pages rather than duplicating content.
  {
    slug: 'podcast',
    title: 'Podcast',
    icon: 'Mic',
    blurb: 'Conversations with the people building Bitcoin across Africa.',
    href: '/podcast',
    countLabel: 'Our show',
  },
  {
    slug: 'events',
    title: 'Events',
    icon: 'Users',
    blurb: 'Bitcoin meetups, conferences, and community events across Africa.',
    href: '/events',
    countLabel: 'See all',
  },
  // Coming-soon placeholders — greyed out, no link, so the hub reads as a
  // complete directory while categories fill in over time.
  { slug: 'spend', title: 'Spend Bitcoin', icon: 'ShoppingBag', blurb: 'Merchants and services accepting Bitcoin.', soon: true },
];

export function getResourceCategory(slug) {
  return RESOURCE_CATEGORIES.find((c) => c.slug === slug && Array.isArray(c.items)) || null;
}

// Only categories that have their own internal listing page.
export function listableCategorySlugs() {
  return RESOURCE_CATEGORIES.filter((c) => Array.isArray(c.items)).map((c) => c.slug);
}
