import { NextResponse } from 'next/server';

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

const ADMIN_EMAILS = (process.env.ADMIN_EMAILS || '')
  .split(',')
  .map((e) => e.trim().toLowerCase())
  .filter(Boolean);

async function verifyIdToken(idToken) {
  if (!idToken) return null;
  const apiKey = process.env.NEXT_PUBLIC_FIREBASE_API_KEY;
  if (!apiKey) return null;
  try {
    const res = await fetch(
      `https://identitytoolkit.googleapis.com/v1/accounts:lookup?key=${apiKey}`,
      {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ idToken }),
      }
    );
    if (!res.ok) return null;
    const data = await res.json();
    return data?.users?.[0] || null;
  } catch {
    return null;
  }
}

function isAllowedAdmin(user) {
  if (!user?.email) return false;
  if (ADMIN_EMAILS.length === 0) {
    console.warn('ADMIN_EMAILS is not set — /api/admin/ai is allowing ANY authenticated Firebase user.');
    return true;
  }
  return ADMIN_EMAILS.includes(user.email.toLowerCase());
}

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
- Never invent facts, numbers, names or quotes. Use only what the article states.`;

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

export async function POST(request) {
  let body;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: 'Invalid request body' }, { status: 400 });
  }

  const { idToken, task, payload } = body;

  const user = await verifyIdToken(idToken);
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  if (!isAllowedAdmin(user)) return NextResponse.json({ error: 'Forbidden' }, { status: 403 });

  const spec = TASKS[task];
  if (!spec) return NextResponse.json({ error: `Unknown task: ${task}` }, { status: 400 });

  const apiKey = process.env.ANTHROPIC_API_KEY;
  if (!apiKey) {
    return NextResponse.json(
      { error: 'AI is not configured on this deployment (missing ANTHROPIC_API_KEY).' },
      { status: 503 }
    );
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

  let response;
  try {
    response = await fetch('https://api.anthropic.com/v1/messages', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-api-key': apiKey,
        'anthropic-version': '2023-06-01',
      },
      body: JSON.stringify({
        model: 'claude-sonnet-4-6',
        max_tokens: 2048,
        messages: [{ role: 'user', content: prompt }],
      }),
    });
  } catch (err) {
    console.error('AI request failed:', err);
    return NextResponse.json({ error: 'Could not reach the AI service.' }, { status: 502 });
  }

  if (!response.ok) {
    const detail = await response.text().catch(() => '');
    console.error('Anthropic API error:', response.status, detail.slice(0, 500));
    return NextResponse.json(
      { error: `AI service returned ${response.status}.` },
      { status: 502 }
    );
  }

  const data = await response.json();
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
