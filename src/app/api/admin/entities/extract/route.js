import { NextResponse } from 'next/server';
import { getEntities } from '@/lib/entities';
import { ENTITY_TYPES } from '@/lib/entityTypes';

// Same public web API key already used by src/lib/firebase.js — this call
// only verifies that the caller has a valid, currently signed-in Firebase
// session (same login as /dashboard). It doesn't need a service account key.
const FIREBASE_WEB_API_KEY = 'AIzaSyCC_PkB6ku4wHa9cv9At49EBAqFEkLFTmY';

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

Article title: ${title}
Article excerpt: ${excerpt}
Article category: ${category}
Article body (HTML tags already stripped, may be truncated): ${plainText.slice(0, 8000)}

List every specific, named entity this article is actually about or substantively discusses. For each, state whether its name matches one of the existing directory entries above (case-insensitive, allow for minor name variation) or whether it looks like something new to the directory.

Respond with ONLY a JSON array and no other text. Each item exactly like:
{"name": "string", "type": "one of the valid entity types", "matchesExisting": "the exact existing entry name it matches, or null", "reason": "one short sentence on why this belongs in the directory"}

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
        messages: [{ role: 'user', content: prompt }],
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
  const textBlock = data.content?.find((c) => c.type === 'text')?.text || '[]';

  let parsed;
  try {
    parsed = JSON.parse(textBlock.replace(/```json|```/g, '').trim());
    if (!Array.isArray(parsed)) throw new Error('not an array');
  } catch (err) {
    console.warn('Could not parse AI extraction response, falling back:', err.message);
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
    };
  });

  return NextResponse.json({ degraded: false, suggestions });
}
