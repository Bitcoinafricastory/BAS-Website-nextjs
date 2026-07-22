// One-off seed: writes the starter FAQ content directly into the `faqs`
// collection that the new /faq page and Dashboard -> FAQs both read from.
//
// SAFE TO RE-RUN — it checks for an existing FAQ with the same question
// before writing, so running this twice won't create duplicates. If you
// edit a question's text afterward in the dashboard, re-running this won't
// touch your edit (it only adds what's missing, never overwrites).
//
// SETUP (one time):
//   1. cd into your project root (bas-nextjs)
//   2. Run with your dashboard admin login:
//        ADMIN_EMAIL="you@example.com" ADMIN_PASSWORD="yourpassword" node scripts/seed-faqs.mjs
//
// After this runs, everything is already live on /faq — but it's not
// locked in. Go to Dashboard -> FAQs any time to edit, reorder, add, or
// remove questions, exactly like any other content on the site.

import { initializeApp } from 'firebase/app';
import { getAuth, signInWithEmailAndPassword } from 'firebase/auth';
import {
  getFirestore, collection, getDocs, addDoc, serverTimestamp,
} from 'firebase/firestore';

// Same public client config as src/lib/firebase.js — safe to inline here,
// governed by Firestore security rules rather than secrecy.
const firebaseConfig = {
  apiKey: 'AIzaSyCC_PkB6ku4wHa9cv9At49EBAqFEkLFTmY',
  authDomain: 'bas-website-75a3f.firebaseapp.com',
  projectId: 'bas-website-75a3f',
  storageBucket: 'bas-website-75a3f.firebasestorage.app',
  messagingSenderId: '479794328516',
  appId: '1:479794328516:web:aa54b7ad01090aa44c6a91',
  measurementId: 'G-GHQSRJ6MQH',
};

const FAQS = [
  // ── General ──────────────────────────────────────────────────────────
  {
    category: 'General', order: '1',
    question: 'What is Bitcoin Africa Story?',
    answer: "<p>Bitcoin Africa Story is an independent media and education platform documenting Bitcoin adoption across Africa — through original journalism, a verified directory of communities and organizations, free education programs, event listings, and a podcast featuring the people actually building Bitcoin's presence on the continent.</p>",
  },
  {
    category: 'General', order: '2',
    question: 'Is Bitcoin Africa Story affiliated with any specific company or exchange?',
    answer: "<p>No. We're an independent media and education outlet. We accept Bitcoin donations and community support to fund our work, and we're open to paid partnerships and sponsored coverage with companies. That said, our Directory listings reflect our own reporters' verification work, not paid placement.</p>",
  },
  {
    category: 'General', order: '3',
    question: 'How can I get in touch with the team?',
    answer: '<p>Use the Contact page — it opens a pre-filled email to <a href="mailto:bitcoinafricastory@proton.me">bitcoinafricastory@proton.me</a> in your own email app.</p>',
  },

  // ── News & Stories ───────────────────────────────────────────────────
  {
    category: 'News & Stories', order: '1',
    question: 'How often do you publish new stories?',
    answer: '<p>We publish as real, reported stories come in rather than on a fixed schedule — check the News page for the latest, or subscribe to our newsletter to get new stories in your inbox.</p>',
  },
  {
    category: 'News & Stories', order: '2',
    question: 'Can I republish or quote your articles?',
    answer: '<p>You\'re welcome to share links to our content. If you\'d like to republish, reproduce, or adapt our work beyond a short quote, contact us first at <a href="mailto:bitcoinafricastory@proton.me">bitcoinafricastory@proton.me</a>. See our <a href="/terms">Terms of Use</a> for full details.</p>',
  },
  {
    category: 'News & Stories', order: '3',
    question: 'How do I submit my own Bitcoin adoption story?',
    answer: '<p>Head to the News page and use the "Share Your Bitcoin Story" section near the bottom — fill out the short form and our reporters will review it before anything goes live.</p>',
  },

  // ── Education ────────────────────────────────────────────────────────
  {
    category: 'Education', order: '1',
    question: 'Is your Bitcoin education actually free?',
    answer: '<p>Yes — every program listed under Education, including the Bitcoin Diploma, is free to join.</p>',
  },
  {
    category: 'Education', order: '2',
    question: 'Do I need any prior knowledge of Bitcoin to start?',
    answer: '<p>No. Our programs are built for complete beginners through to more advanced learners — start with the Bitcoin Whitepaper program if you\'re brand new, or explore the other listed programs based on your level.</p>',
  },
  {
    category: 'Education', order: '3',
    question: 'I run a Bitcoin education program — can it be listed on your site?',
    answer: '<p>Yes — see the "Other Bitcoin Programs" section on the Education page, and reach out via Contact to have your program considered.</p>',
  },

  // ── Directory ────────────────────────────────────────────────────────
  {
    category: 'Directory', order: '1',
    question: 'How does a community or organization get listed in the Directory?',
    answer: '<p>Our reporters verify every listing before it goes live — this isn\'t a self-serve submission form that publishes instantly. Use the "Tell Us Your Story" option on the Directory page to be considered, or reach out via Contact.</p>',
  },
  {
    category: 'Directory', order: '2',
    question: 'What do the verification badges on Directory profiles mean?',
    answer: '<p>Each badge reflects real work our reporters did — from an editorial review of public information up to a direct interview or field visit. Badges are additive, not a strict ladder, and a profile can carry more than one. Check the "Verification" section on any profile page for specifics.</p>',
  },
  {
    category: 'Directory', order: '3',
    question: 'Does a Directory listing mean you endorse that organization?',
    answer: "<p>No. A listing reflects that we verified the information shown — it's not a guarantee or endorsement of the organization's legitimacy or trustworthiness. Always do your own research before sending funds to any organization, listed or not.</p>",
  },

  // ── Events ───────────────────────────────────────────────────────────
  {
    category: 'Events', order: '1',
    question: 'How do I get my Bitcoin event listed?',
    answer: '<p>Use the "Hosting a Bitcoin event in Africa?" section at the bottom of the Events page to submit it for review.</p>',
  },
  {
    category: 'Events', order: '2',
    question: 'Do you organize these events yourselves?',
    answer: "<p>No — we list events hosted by communities and organizations across Africa's Bitcoin ecosystem. Registration and event details are handled directly by each event's own organizer.</p>",
  },

  // ── Podcast ──────────────────────────────────────────────────────────
  {
    category: 'Podcast', order: '1',
    question: 'Where can I listen to the podcast?',
    answer: '<p>All episodes are on our <a href="/podcast">Podcast page</a>, with each one linking out to YouTube.</p>',
  },
  {
    category: 'Podcast', order: '2',
    question: 'Can I suggest a guest or topic for the podcast?',
    answer: '<p>Yes — reach out via Contact with your suggestion.</p>',
  },

  // ── Donations ────────────────────────────────────────────────────────
  {
    category: 'Donations', order: '1',
    question: 'How can I support Bitcoin Africa Story?',
    answer: '<p>Visit our <a href="/donate">Donate page</a> — we accept Bitcoin and Lightning payments directly.</p>',
  },
  {
    category: 'Donations', order: '2',
    question: 'Do you accept fiat currency donations?',
    answer: '<p>Currently, donations are Bitcoin/Lightning only, processed through BTCPay Server.</p>',
  },

  // ── Contributing ─────────────────────────────────────────────────────
  {
    category: 'Contributing', order: '1',
    question: 'Can I write for Bitcoin Africa Story?',
    answer: "<p>Reach out via Contact with a bit about yourself and what you'd like to cover — we're always open to hearing from people close to the stories we tell.</p>",
  },
  {
    category: 'Contributing', order: '2',
    question: 'I found an error in one of your articles — how do I report it?',
    answer: '<p>Email us at <a href="mailto:bitcoinafricastory@proton.me">bitcoinafricastory@proton.me</a> with the article link and what needs correcting. We take accuracy seriously and will fix genuine errors promptly.</p>',
  },
];

async function main() {
  const email = process.env.ADMIN_EMAIL;
  const password = process.env.ADMIN_PASSWORD;

  if (!email || !password) {
    console.error('Missing credentials.\n\nRun it like this:\n  ADMIN_EMAIL="you@example.com" ADMIN_PASSWORD="yourpassword" node scripts/seed-faqs.mjs\n\n(Use the same login you use for /dashboard.)');
    process.exit(1);
  }

  const app = initializeApp(firebaseConfig);
  const auth = getAuth(app);
  const db = getFirestore(app);

  console.log('Signing in...');
  await signInWithEmailAndPassword(auth, email, password);

  console.log('Checking for existing FAQs...');
  const existingSnap = await getDocs(collection(db, 'faqs'));
  const existingQuestions = new Set(existingSnap.docs.map((d) => (d.data().question || '').trim().toLowerCase()));
  console.log(`Found ${existingSnap.size} existing FAQ(s).`);

  const faqsRef = collection(db, 'faqs');
  let added = 0;
  let skipped = 0;

  for (const faq of FAQS) {
    if (existingQuestions.has(faq.question.trim().toLowerCase())) {
      skipped += 1;
      continue;
    }

    await addDoc(faqsRef, {
      category: faq.category,
      question: faq.question,
      answer: faq.answer,
      order: faq.order,
      createdAt: serverTimestamp(),
    });
    added += 1;
    console.log(`  Added: [${faq.category}] ${faq.question}`);
  }

  console.log(`\nDone. Added ${added} new FAQ(s), skipped ${skipped} that already existed.`);
  console.log('Visit /faq to see it live, or Dashboard -> FAQs to edit anything.');
}

main().catch((err) => {
  console.error('\nSomething went wrong:', err.message);
  process.exit(1);
});
