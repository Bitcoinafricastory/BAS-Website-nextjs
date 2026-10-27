import { NextResponse } from 'next/server';
import { unstable_cache } from 'next/cache';
import { searchSite, bestSnippet } from '@/lib/site-search';
import { callClaude, EXTRACTION_MODELS } from '@/lib/claude-api';
import { SITE_URL } from '@/lib/schema';

// "Ask Bitcoin Africa Story": the AI answer at the top of the search page.
// It answers only from our own articles and directory, cites them, and says
// so when they don't cover the question. Public, so it is kept cheap and
// hard to abuse: a small model, short answers, the same question answered
// once per six hours from cache, and a per-visitor rate limit.
export const maxDuration = 30;

const MAX_QUESTION = 200;
const RATE = { windowMs: 10 * 60 * 1000, max: 12 };
const hits = new Map(); // ip -> [timestamps]; per server instance, best effort

function rateLimited(ip) {
  const now = Date.now();
  const recent = (hits.get(ip) || []).filter((t) => now - t < RATE.windowMs);
  recent.push(now);
  hits.set(ip, recent);
  if (hits.size > 5000) hits.clear();
  return recent.length > RATE.max;
}

const INSTRUCTION = `You are the voice of Bitcoin Africa Story, answering a reader's question the way one of our reporters would if they bumped into them at a meetup: warm, direct and specific. We report from the ground, so our answers sound like people who were there, not like a search engine.

HOW TO WRITE
- Lead with the answer in the first sentence. No preamble, no restating the question.
- Be concrete: real names, places, numbers and dates from the material. "About 100 people in rural Burundi" beats "many users".
- Say where it happened and when we reported it ("when we visited Kibera in March 2026", "as of our October 2026 story"), so the reader knows how fresh it is.
- Plain words a newcomer understands. If you use a term like USSD, Lightning or circular economy, explain it in a few words the first time.
- Sound like a person: short sentences, contractions, active voice. Use "we" for Bitcoin Africa Story.
- 2 to 5 sentences, or two short paragraphs for a "how" or "why" question. No lists, no headings.
- End with one natural next step when it helps: the story to read, the profile to visit, the event to attend. Don't sell.
- Never write: "In summary", "It's worth noting", "delve", "landscape", "game-changer", "revolutionize", "In conclusion", "As an AI", exclamation marks, or emoji.

FACTS AND CITATIONS
- Use ONLY the numbered material below: our own articles, directory profiles and events. Don't add outside knowledge, even if you think it's true.
- Put a citation right after each fact it supports, like [1] or [2][3]. Only cite numbers that are listed.
- If the material doesn't answer the question, say so in one honest sentence ("We haven't covered that yet."), then point to the closest thing we have covered, if anything.
- No price predictions, investment or trading advice. If asked, say we don't give financial advice and point to our education stories if any are listed.
- Answer in the language the reader used.
- Don't mention "sources", "context" or "the material"; just answer and cite.

EXAMPLE (an invented project, to show the style only; never reuse anything from it)
Question: what is sats village
Answer: Sats Village is a small circular economy in a fishing town on Lake Example, where about 40 traders accept bitcoin for fish, airtime and school fees [1]. A circular economy just means people earn and spend bitcoin locally instead of cashing out straight away. When we visited in May 2026, most payments went through Lightning, a faster layer on top of Bitcoin, using phones the traders already owned [1][2]. Our visit story is the best place to start [1].

Reply with only the answer text.`;

async function answer(question) {
  const { articles, entities, events, terms } = await searchSite(question);
  const sources = [
    ...articles.slice(0, 5).map((a) => ({
      type: 'article', title: a.title, url: `/news/${a.slug}`, date: a.date, author: a.author,
      text: `${a.excerpt}\n${bestSnippet(a.text, terms, 1600)}`,
    })),
    ...entities.slice(0, 3).map((e) => ({
      type: 'directory', title: e.name, url: `/directory/${e.slug}`,
      text: `${[e.type, e.city, e.country].filter(Boolean).join(', ')}. ${e.description}`,
    })),
    ...events.slice(0, 2).map((e) => ({
      type: 'event', title: e.eventName, url: `/events/${e.id}`, date: e.date,
      text: `${[e.date, e.city, e.venue].filter(Boolean).join(' · ')}. ${e.description}`,
    })),
  ];
  if (!sources.length) return { answer: null, sources: [] };

  const list = sources.map((s, i) => {
    const meta = [s.date && `published ${s.date}`, s.author && `by ${s.author}`].filter(Boolean).join(', ');
    return `[${i + 1}] ${s.type.toUpperCase()}: ${s.title}${meta ? ` (${meta})` : ''}\n${s.text}`;
  }).join('\n\n');
  const today = new Date().toISOString().slice(0, 10);
  const claude = await callClaude({
    apiKey: process.env.ANTHROPIC_API_KEY,
    models: EXTRACTION_MODELS,
    body: {
      // Room for the model's thinking; the answer itself is short.
      max_tokens: 3000,
      messages: [{ role: 'user', content: `${INSTRUCTION}\n\nTODAY: ${today}\n\nMATERIAL:\n${list}\n\nQUESTION: ${question}` }],
    },
  });
  if (!claude.ok) throw new Error(claude.message);
  const text = (claude.data.content || []).filter((c) => c.type === 'text').map((c) => c.text).join('\n').trim();
  if (!text) throw new Error('empty answer');
  return {
    answer: text.replace(/\n{3,}/g, '\n\n').slice(0, 1800),
    sources: sources.map(({ type, title, url }, i) => ({ n: i + 1, type, title, url })),
  };
}

const cachedAnswer = unstable_cache(answer, ['ask-answer-v2'], { revalidate: 6 * 60 * 60 });

export async function POST(request) {
  if (!process.env.ANTHROPIC_API_KEY) return NextResponse.json({ answer: null, error: 'unavailable' }, { status: 503 });
  let body;
  try { body = await request.json(); } catch { return NextResponse.json({ error: 'Invalid request' }, { status: 400 }); }

  const question = String(body?.q || '').replace(/\s+/g, ' ').trim();
  if (question.length < 2 || question.length > MAX_QUESTION) {
    return NextResponse.json({ error: `Ask in ${MAX_QUESTION} characters or fewer.` }, { status: 400 });
  }
  // Only our own pages may call this.
  const origin = request.headers.get('origin');
  if (origin && origin !== SITE_URL && !/^https:\/\/([a-z0-9-]+\.)*bitcoinafricastory\.com$/.test(origin)
    && !/^https:\/\/[a-z0-9-]+\.vercel\.app$/.test(origin) && !origin.startsWith('http://localhost')) {
    return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
  }
  const ip = (request.headers.get('x-forwarded-for') || '').split(',')[0].trim() || 'unknown';
  if (rateLimited(ip)) {
    return NextResponse.json({ error: 'You’re asking quickly. Wait a few minutes and try again.' }, { status: 429 });
  }

  try {
    // Same question (ignoring case and spacing) is answered once per six hours.
    const result = await cachedAnswer(question.toLowerCase().replace(/[?.!]+$/, ''));
    return NextResponse.json(result, { headers: { 'Cache-Control': 'no-store' } });
  } catch (err) {
    console.error('ask: failed', err?.message);
    return NextResponse.json({ answer: null, error: 'The AI answer isn’t available right now.' }, { status: 502 });
  }
}
