import { NextResponse } from 'next/server';
import sharp from 'sharp';
import { RESIZABLE_HOSTS } from '@/lib/image-sizes.mjs';
import { getDashboardAccess, consumeAiQuota } from '@/lib/admin-auth';
import { canUseSection, STAFF_AI_DAILY_LIMIT, aiUsageDay } from '@/lib/staff-access';
import { callClaude, WRITING_MODELS } from '@/lib/claude-api';

export const maxDuration = 30;

// Powers the dashboard's editorial tools. These were previously stubbed with
// crude heuristics — "key takeaways" simply took the first three sentences
// over 40 characters, which produced fragments, mid-sentence cut-offs and raw
// HTML entities. Each task below returns strict JSON so the client can use it
// without further cleaning.
//
// Auth mirrors /api/admin/entities/extract: a verified Firebase ID token whose
// email is on the server-side allowlist. Without it, anyone could burn the
// Anthropic budget.

// Strip tags AND decode entities. The old heuristic skipped decoding, which is
// why takeaways came out containing &#39; and &quot;. Block-level tags become
// newlines so a sentence never runs into the heading that follows it.
function htmlToText(html) {
  return String(html || '')
    .replace(/<\/(p|div|h[1-6]|li|blockquote|tr)>/gi, '\n')
    .replace(/<br\s*\/?>/gi, '\n')
    .replace(/<[^>]+>/g, ' ')
    .replace(/&nbsp;/gi, ' ')
    .replace(/&amp;/gi, '&')
    .replace(/&lt;/gi, '<')
    .replace(/&gt;/gi, '>')
    .replace(/&quot;/gi, '"')
    .replace(/&#39;|&apos;|&rsquo;/gi, "'")
    .replace(/&ldquo;|&rdquo;/gi, '"')
    .replace(/&mdash;/gi, '—')
    .replace(/&ndash;/gi, '–')
    .replace(/&hellip;/gi, '…')
    .replace(/&#(\d+);/g, (_, d) => String.fromCharCode(d))
    .replace(/[ \t]+/g, ' ')
    .replace(/\n{2,}/g, '\n')
    .trim();
}

const VOICE = `You write for Bitcoin Africa Story, an independent publication covering Bitcoin adoption across Africa.

House style:
- Plain, direct language. Short sentences. No hype, no marketing voice.
- Reporting, not promotion. Never write "revolutionary", "game-changing", "unlock", "empower".
- Name real people, organisations and places specifically.
- Sentence case. British or American spelling is fine, just be consistent with the article.
- Never invent facts, numbers, names or quotes. Use only what the article states.
- Output plain readable text. Use real characters — an apostrophe is ' and a quote is ", never "&#39;" or "&quot;". Never emit HTML tags or HTML entities of any kind.`;

const TASKS = {
  takeaways: {
    instruction: `Write 3-5 key takeaways for this article.

Each takeaway must:
- Be ONE complete, self-contained sentence a reader understands without the article.
- State a specific fact, finding or consequence — not a description of the article ("This article explains…") and not a question.
- Be 15-30 words.
- Never start mid-thought, never merge two unrelated ideas, never end with a heading or fragment.

Respond with ONLY a JSON array of strings. Example:
["Exonumia Africa launched Mantra on 9 September 2026 after years translating Bitcoin literature into African languages.", "..."]`,
    shape: 'array',
  },
  summary: {
    instruction: `Write a 2-3 sentence summary of this article for an editor's overview. State what happened and why it matters. Respond with ONLY a JSON object: {"result": "the summary"}`,
    shape: 'object',
  },
  meta: {
    instruction: `Write an SEO meta description: one sentence, 140-155 characters, describing what the reader will learn. No clickbait, no ellipsis padding. Respond with ONLY a JSON object: {"result": "the description"}`,
    shape: 'object',
  },
  headlines: {
    instruction: `Suggest 4 alternative headlines. Each should be specific and factual, under 70 characters, and avoid colons unless genuinely needed. Respond with ONLY a JSON array of strings.`,
    shape: 'array',
  },
  faq: {
    instruction: `Write 3-4 FAQs a reader would genuinely ask after this article. Answer each in 1-2 sentences using ONLY information the article provides. Respond with ONLY a JSON array: [{"question": "...", "answer": "..."}]`,
    shape: 'array',
  },
  tags: {
    instruction: `Suggest 4-6 short lowercase tags for this article. Use terms a reader would search for — places, organisations, technologies, themes. No hashtags, no generic words like "bitcoin" or "africa" that apply to every article on the site. Respond with ONLY a JSON array of strings.`,
    shape: 'array',
  },
  social: {
    instruction: `Write social captions. Respond with ONLY a JSON object: {"x": "under 260 chars, no hashtag spam", "linkedin": "2-3 sentences, professional", "nostr": "conversational, for a Bitcoin-native audience"}`,
    shape: 'object',
  },
};

// Image description (alt text) for an article photo. Claude looks at the
// photo itself; the title only helps it name the event or place.
const IMAGE_ALT_INSTRUCTION = `Write alt text for this news photo.

- Describe what is actually visible: who (by role, e.g. "students", "a speaker"), doing what, where if it's clear.
- Use the article title only to name the event, place or organisation when the photo clearly shows it. Never guess names of people.
- 8-20 words, under 125 characters. No "image of" or "photo of". No full stop at the end.
- If the image is a graphic, poster or logo, say so and give the main text on it.

Respond with ONLY a JSON object: {"result": "the alt text"}`;

async function loadImageForClaude(src, origin) {
  let url;
  try {
    url = src.startsWith('/') && !src.startsWith('//') ? new URL(src, origin) : new URL(src);
  } catch {
    return null;
  }
  const allowed = url.origin === origin || (url.protocol === 'https:' && (
    RESIZABLE_HOSTS.includes(url.hostname) || /(^|\.)bitcoinafricastory\.com$/.test(url.hostname)
  ));
  if (!allowed) return null;
  const res = await fetch(url, { signal: AbortSignal.timeout(20000) });
  if (!res.ok) return null;
  // Smaller and always JPEG: keeps the request fast and well under the API's
  // image size limit, whatever was uploaded.
  const jpeg = await sharp(Buffer.from(await res.arrayBuffer()), { failOn: 'none' })
    .rotate()
    .resize({ width: 1024, height: 1024, fit: 'inside', withoutEnlargement: true })
    .jpeg({ quality: 80 })
    .toBuffer();
  return jpeg.toString('base64');
}

async function describeImage({ apiKey, payload, origin }) {
  const src = String(payload?.image || '');
  if (!src) return NextResponse.json({ error: 'This article has no featured image.' }, { status: 400 });
  let data;
  try {
    data = await loadImageForClaude(src, origin);
  } catch (err) {
    console.warn('imageAlt: could not load image', err?.message);
  }
  if (!data) return NextResponse.json({ error: 'Could not load this image.' }, { status: 400 });

  const claude = await callClaude({
    apiKey,
    models: WRITING_MODELS,
    body: {
      // Newer models think before answering by default, and that thinking
      // counts towards max_tokens. 200 left no room for the answer itself.
      max_tokens: 2048,
      messages: [{
        role: 'user',
        content: [
          { type: 'image', source: { type: 'base64', media_type: 'image/jpeg', data } },
          { type: 'text', text: `${IMAGE_ALT_INSTRUCTION}\n\nArticle title: ${payload?.title || '(untitled)'}` },
        ],
      }],
    },
  });
  if (!claude.ok) return NextResponse.json({ error: claude.message }, { status: 502 });

  const raw = (claude.data.content || []).filter((c) => c.type === 'text').map((c) => c.text).join('\n');
  if (!raw.trim() && claude.data.stop_reason === 'max_tokens') {
    console.error('imageAlt: ran out of tokens before answering');
    return NextResponse.json({ error: 'AI ran out of room before answering. Try again.' }, { status: 502 });
  }
  const match = raw.match(/\{[\s\S]*\}/);
  try {
    const result = String(JSON.parse(match ? match[0] : raw).result || '').trim().replace(/\.$/, '');
    if (!result) throw new Error('empty');
    return NextResponse.json({ result: result.slice(0, 160) });
  } catch {
    console.error('imageAlt: unexpected response', raw.slice(0, 300));
    return NextResponse.json({ error: 'AI returned an unexpected response.' }, { status: 502 });
  }
}

export async function POST(request) {
  let body;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: 'Invalid request body' }, { status: 400 });
  }

  const { idToken, task, payload } = body;

  const access = await getDashboardAccess(idToken);
  if (!access) return NextResponse.json({ error: 'Your account doesn’t have dashboard access.' }, { status: 403 });
  if (!canUseSection(access, 'articles')) return NextResponse.json({ error: 'Your account doesn’t include Articles.' }, { status: 403 });

  const spec = TASKS[task];
  if (!spec && task !== 'imageAlt') return NextResponse.json({ error: `Unknown task: ${task}` }, { status: 400 });

  const apiKey = process.env.ANTHROPIC_API_KEY;
  if (!apiKey) {
    return NextResponse.json(
      { error: 'AI is not configured on this deployment (missing ANTHROPIC_API_KEY).' },
      { status: 503 }
    );
  }

  const quota = await consumeAiQuota(access, idToken, STAFF_AI_DAILY_LIMIT, aiUsageDay());
  if (!quota.ok) return NextResponse.json({ error: quota.error }, { status: 429 });

  if (task === 'imageAlt') {
    return describeImage({ apiKey, payload, origin: new URL(request.url).origin });
  }

  const text = htmlToText(payload?.content);
  if (text.length < 200) {
    return NextResponse.json(
      { error: 'Not enough article text yet — write a few paragraphs first.' },
      { status: 400 }
    );
  }

  const prompt = `${VOICE}

${spec.instruction}

---
Title: ${payload?.title || '(untitled)'}
Excerpt: ${payload?.excerpt || '(none)'}
Category: ${payload?.category || '(none)'}

Article body:
${text.slice(0, 12000)}
---`;

  const claude = await callClaude({
    apiKey,
    models: WRITING_MODELS,
    body: {
      max_tokens: 8192,
      messages: [{ role: 'user', content: prompt }],
    },
  });
  if (!claude.ok) {
    return NextResponse.json({ error: claude.message }, { status: 502 });
  }

  const data = claude.data;
  const raw = (data.content || []).filter((c) => c.type === 'text' && c.text).map((c) => c.text).join('\n');

  try {
    const cleaned = raw.replace(/```json|```/g, '').trim();
    let parsed;
    try {
      parsed = JSON.parse(cleaned);
    } catch {
      // Salvage the JSON from any surrounding prose rather than discarding a
      // good result.
      const open = spec.shape === 'array' ? '[' : '{';
      const close = spec.shape === 'array' ? ']' : '}';
      const start = cleaned.indexOf(open);
      const end = cleaned.lastIndexOf(close);
      if (start === -1 || end === -1 || end <= start) throw new Error('no JSON found');
      parsed = JSON.parse(cleaned.slice(start, end + 1));
    }

    // Object-shaped single-value tasks return { result }; unwrap for the client.
    const result = spec.shape === 'object' && parsed && typeof parsed === 'object' && 'result' in parsed
      ? parsed.result
      : parsed;

    return NextResponse.json({ result });
  } catch (err) {
    console.error('Could not parse AI response:', err.message, '| raw:', raw.slice(0, 500));
    return NextResponse.json({ error: 'AI returned an unexpected response.' }, { status: 502 });
  }
}
