import { NextResponse } from 'next/server';
import { getEntities } from '@/lib/entities';
import { ENTITY_TYPES, ENTITY_COUNTRIES } from '@/lib/entityTypes';

// Same public web API key already used by src/lib/firebase.js — this call
// only verifies that the caller has a valid, currently signed-in Firebase
// session (same login as /dashboard). It doesn't need a service account key.
const FIREBASE_WEB_API_KEY = 'AIzaSyCC_PkB6ku4wHa9cv9At49EBAqFEkLFTmY';

// Every account that has ever successfully signed in to Firebase Auth was,
// until now, treated as a trusted admin — there was no allowlist anywhere
// in the app. This checks the verified token's email against a list only
// you control server-side, so even a valid Firebase login from an
// unexpected account is rejected here.
const ADMIN_EMAILS = (process.env.ADMIN_EMAILS || '')
  .split(',')
  .map((e) => e.trim().toLowerCase())
  .filter(Boolean);

function isAllowedAdmin(user) {
  if (!user?.email) return false;
  // If ADMIN_EMAILS isn't set yet, fall back to "any authenticated user"
  // (today's behavior) rather than locking everyone out silently — but log
  // loudly so this doesn't stay unnoticed.
  if (ADMIN_EMAILS.length === 0) {
    console.warn('ADMIN_EMAILS is not set — /api/admin/entities/extract is allowing ANY authenticated Firebase user. Set ADMIN_EMAILS in Vercel to restrict this.');
    return true;
  }
  return ADMIN_EMAILS.includes(user.email.toLowerCase());
}

async function verifyIdToken(idToken) {
  if (!idToken) return null;
  try {
    const res = await fetch(
      `https://identitytoolkit.googleapis.com/v1/accounts:lookup?key=${FIREBASE_WEB_API_KEY}`,
      {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ idToken }),
      }
    );
    if (!res.ok) return null;
    const data = await res.json();
    return data.users?.[0] || null;
  } catch {
    return null;
  }
}

function normalize(name) {
  return String(name || '').toLowerCase().replace(/[^a-z0-9\s]/g, '').trim();
}

function findExistingMatch(name, entities) {
  const n = normalize(name);
  if (!n) return null;
  return (
    entities.find((e) => normalize(e.name) === n) ||
    entities.find((e) => normalize(e.name).includes(n) || n.includes(normalize(e.name)))
  );
}

// Fallback path: no AI, just check which existing entity names literally
// appear in the article text. Can't detect brand-new entities — that
// genuinely requires the model's judgment, not string matching — so this
// only ever returns matches against what's already in the directory.
function deterministicMatch(plainText, entities) {
  const lower = plainText.toLowerCase();
  return entities
    .filter((e) => e.name && lower.includes(e.name.toLowerCase()))
    .map((e) => ({
      name: e.name,
      guessedType: e.type,
      existingSlug: e.slug,
      isNew: false,
      reason: 'Name match in article text.',
    }));
}

function stripHtmlTags(html) {
  return String(html || '').replace(/<[^>]+>/g, ' ').replace(/\s+/g, ' ').trim();
}

export async function POST(request) {
  let body;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: 'Invalid request body' }, { status: 400 });
  }

  const { title = '', excerpt = '', content = '', category = '', idToken } = body;

  const user = await verifyIdToken(idToken);
  if (!user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }
  if (!isAllowedAdmin(user)) {
    return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
  }

  const entities = await getEntities();
  const plainText = `${title}\n${excerpt}\n${stripHtmlTags(content)}`;

  const apiKey = process.env.ANTHROPIC_API_KEY;
  if (!apiKey) {
    return NextResponse.json({
      degraded: true,
      reason: 'AI extraction is not configured on this deployment (missing ANTHROPIC_API_KEY).',
      suggestions: deterministicMatch(plainText, entities),
    });
  }

  const entityList = entities.map((e) => `${e.name} (${e.type})`).join(', ') || 'none yet';
  const typeList = ENTITY_TYPES.map((t) => t.value).join(', ');

  const prompt = `You help a Bitcoin news site in Africa tag its articles with the specific communities, organizations, companies, projects, conferences, developer groups, podcasts, publications, or people the article substantively covers — not passing mentions.

Existing directory entries, as "name (type)": ${entityList}

Valid entity types: ${typeList}
Valid countries: ${ENTITY_COUNTRIES.join(', ')}

Article title: ${title}
Article excerpt: ${excerpt}
Article category: ${category}
Article body (HTML tags already stripped, may be truncated): ${plainText.slice(0, 8000)}

List every specific, named entity this article is actually about or substantively discusses. For each, state whether its name matches one of the existing directory entries above (case-insensitive, allow for minor name variation) or whether it looks like something new to the directory.

For anything that looks NEW (no existing match), also pull out country, city, website, founder, and 2-4 short lowercase tags — but ONLY values the article text actually states. Leave a field empty ("" or []) rather than guessing or inventing something the article doesn't say. Never invent a website URL — only include one if it's literally written in the article text.

Respond with ONLY a JSON array and no other text. Each item exactly like:
{"name": "string", "type": "one of the valid entity types", "matchesExisting": "the exact existing entry name it matches, or null", "reason": "one short sentence on why this belongs in the directory", "country": "one of the valid countries, or empty string if not stated", "city": "string or empty", "website": "string or empty", "founder": "string or empty", "tags": ["short", "lowercase", "tags"]}

If nothing qualifies, respond with an empty array: []`;

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
        model: 'claude-haiku-4-5-20251001',
        max_tokens: 1024,
        messages: [
          { role: 'user', content: prompt },
          // Prefilling the assistant turn with an opening bracket forces the
          // reply to continue as a JSON array rather than starting with prose
          // like "Here are the entities I found:". That preamble was breaking
          // JSON.parse, so every call silently fell back to plain name
          // matching — which is why obvious mentions were never suggested.
          { role: 'assistant', content: '[' },
        ],
      }),
    });
  } catch (err) {
    console.warn('Anthropic API unreachable, falling back to name matching:', err.message);
    return NextResponse.json({
      degraded: true,
      reason: 'AI extraction is temporarily unreachable.',
      suggestions: deterministicMatch(plainText, entities),
    });
  }

  if (!response.ok) {
    console.warn('Anthropic API error, falling back to name matching:', response.status);
    return NextResponse.json({
      degraded: true,
      reason: response.status === 429
        ? 'AI extraction is rate-limited right now.'
        : 'AI extraction is temporarily unavailable.',
      suggestions: deterministicMatch(plainText, entities),
    });
  }

  const data = await response.json();
  const rawText = data.content?.find((c) => c.type === 'text')?.text || '';

  // The assistant turn was prefilled with '[', so the reply continues from
  // there and the opening bracket is not echoed back — reattach it.
  const textBlock = `[${rawText}`;

  let parsed;
  try {
    const cleaned = textBlock.replace(/```json|```/g, '').trim();
    try {
      parsed = JSON.parse(cleaned);
    } catch {
      // Salvage the array if anything still surrounds it. Discarding a good
      // result because of a stray sentence is worse than a slightly loose parse.
      const start = cleaned.indexOf('[');
      const end = cleaned.lastIndexOf(']');
      if (start === -1 || end === -1 || end <= start) throw new Error('no JSON array found');
      parsed = JSON.parse(cleaned.slice(start, end + 1));
    }
    if (!Array.isArray(parsed)) throw new Error('not an array');
  } catch (err) {
    // Log the actual text — without it this failure is undiagnosable from
    // the outside, which is exactly why it went unnoticed.
    console.warn('Could not parse AI extraction response, falling back:', err.message, '| raw:', rawText.slice(0, 500));
    return NextResponse.json({
      degraded: true,
      reason: 'AI extraction returned an unexpected response.',
      suggestions: deterministicMatch(plainText, entities),
    });
  }

  const suggestions = parsed.map((item) => {
    const matched = item.matchesExisting
      ? entities.find((e) => normalize(e.name) === normalize(item.matchesExisting))
      : findExistingMatch(item.name, entities);
    return {
      name: item.name,
      guessedType: ENTITY_TYPES.some((t) => t.value === item.type) ? item.type : 'organization',
      existingSlug: matched?.slug || null,
      reason: item.reason || '',
      isNew: !matched,
      // Prefill data — only populated by the model when the article actually
      // states it. Editors can still edit any of this before creating.
      guessedCountry: ENTITY_COUNTRIES.includes(item.country) ? item.country : '',
      guessedCity: item.city || '',
      guessedWebsite: item.website || '',
      guessedFounder: item.founder || '',
      guessedTags: Array.isArray(item.tags) ? item.tags.filter((t) => typeof t === 'string').slice(0, 6) : [],
    };
  });

  return NextResponse.json({ degraded: false, suggestions });
}
