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

const INSTRUCTION = `You answer readers' questions for Bitcoin Africa Story, a publication covering Bitcoin adoption, education and communities across Africa.

Answer using ONLY the numbered sources below, which are our own articles, directory profiles and events.
- 2 to 5 short sentences in plain, friendly English (or in the reader's language if they wrote in another one).
- After each fact, cite its source like [1] or [2][3]. Never cite a number that isn't listed.
- If the sources don't answer the question, say in one sentence that we haven't covered that yet, and mention the closest thing we have covered, if any.
- No investment, price or trading advice. If asked, say we don't give financial advice and point to our education content.
- Don't mention "sources" or "the context"; just answer and cite.

Reply with only the answer text.`;

async function answer(question) {
  const { articles, entities, events, terms } = await searchSite(question);
  const sources = [
    ...articles.slice(0, 5).map((a) => ({
      type: 'article', title: a.title, url: `/news/${a.slug}`, date: a.date,
      text: `${a.excerpt}\n${bestSnippet(a.text, terms, 1400)}`,
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

  const list = sources.map((s, i) => `[${i + 1}] ${s.type.toUpperCase()}: ${s.title}${s.date ? ` (${s.date})` : ''}\n${s.text}`).join('\n\n');
  const claude = await callClaude({
    apiKey: process.env.ANTHROPIC_API_KEY,
    models: EXTRACTION_MODELS,
    body: {
      // Room for the model's thinking; the answer itself is short.
      max_tokens: 3000,
      messages: [{ role: 'user', content: `${INSTRUCTION}\n\nSOURCES:\n${list}\n\nQUESTION: ${question}` }],
    },
  });
  if (!claude.ok) throw new Error(claude.message);
  const text = (claude.data.content || []).filter((c) => c.type === 'text').map((c) => c.text).join('\n').trim();
  if (!text) throw new Error('empty answer');
  return {
    answer: text.slice(0, 1500),
    sources: sources.map(({ type, title, url }, i) => ({ n: i + 1, type, title, url })),
  };
}

const cachedAnswer = unstable_cache(answer, ['ask-answer-v1'], { revalidate: 6 * 60 * 60 });

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
