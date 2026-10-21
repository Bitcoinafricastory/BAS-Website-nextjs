import { NextResponse } from 'next/server';
import { lookup } from 'node:dns/promises';
import { isIP } from 'node:net';
import sharp from 'sharp';
import { verifyIdToken, isAllowedAdmin } from '@/lib/admin-auth';
import { callClaude, EXTRACTION_MODELS } from '@/lib/claude-api';

// "Fill from a link" on Dashboard > Events: paste an event page (Luma,
// Eventbrite, Meetup, the organiser's own site...) and get the form filled in.
// The page is read on the server, the details are pulled out by Claude, and
// the banner is downloaded and returned so it gets saved to our own storage
// rather than hot-linked from someone else's site.
export const maxDuration = 60;

const MAX_PAGE_BYTES = 3 * 1024 * 1024;
const MAX_IMAGE_BYTES = 10 * 1024 * 1024;
const UA = 'Mozilla/5.0 (compatible; BitcoinAfricaStoryBot/1.0; +https://www.bitcoinafricastory.com)';

// Admin-only, but still refuse to fetch anything on a private network.
function isPrivateAddress(ip) {
  if (isIP(ip) === 6) {
    const v = ip.toLowerCase();
    if (v.startsWith('::ffff:')) return isPrivateAddress(v.slice(7));
    return v === '::1' || v === '::' || v.startsWith('fc') || v.startsWith('fd') || v.startsWith('fe80');
  }
  const [a, b] = ip.split('.').map(Number);
  return a === 10 || a === 127 || a === 0 || (a === 169 && b === 254) || (a === 172 && b >= 16 && b <= 31)
    || (a === 192 && b === 168) || (a === 100 && b >= 64 && b <= 127) || a >= 224;
}

async function safeUrl(raw) {
  let url;
  try { url = new URL(String(raw || '').trim()); } catch { return null; }
  if (!['http:', 'https:'].includes(url.protocol)) return null;
  try {
    const addrs = await lookup(url.hostname, { all: true });
    if (!addrs.length || addrs.some((a) => isPrivateAddress(a.address))) return null;
  } catch {
    return null;
  }
  return url;
}

async function readLimited(res, max) {
  const reader = res.body?.getReader();
  if (!reader) return Buffer.alloc(0);
  const chunks = [];
  let size = 0;
  for (;;) {
    const { done, value } = await reader.read();
    if (done) break;
    size += value.length;
    if (size > max) { await reader.cancel(); break; }
    chunks.push(value);
  }
  return Buffer.concat(chunks.map((c) => Buffer.from(c)));
}

const decode = (s) => String(s || '')
  .replace(/&nbsp;/gi, ' ').replace(/&amp;/gi, '&').replace(/&lt;/gi, '<').replace(/&gt;/gi, '>')
  .replace(/&quot;/gi, '"').replace(/&#0*39;|&apos;/gi, "'")
  .replace(/&#(\d+);/g, (_, n) => String.fromCodePoint(+n))
  .replace(/&#x([0-9a-f]+);/gi, (_, n) => String.fromCodePoint(parseInt(n, 16)));

function meta(html, key) {
  const re = new RegExp(`<meta[^>]+(?:property|name)=["']${key}["'][^>]*>`, 'i');
  const tag = html.match(re)?.[0];
  return tag ? decode(tag.match(/content=["']([^"']*)["']/i)?.[1] || '') : '';
}

// Structured event data, which most event sites publish for Google.
function jsonLdEvents(html) {
  const out = [];
  for (const m of html.matchAll(/<script[^>]+application\/ld\+json[^>]*>([\s\S]*?)<\/script>/gi)) {
    try {
      const data = JSON.parse(m[1].trim());
      const walk = (node) => {
        if (!node || typeof node !== 'object') return;
        if (Array.isArray(node)) { node.forEach(walk); return; }
        const type = [].concat(node['@type'] || []).join(' ');
        if (/Event/i.test(type)) out.push(node);
        if (node['@graph']) walk(node['@graph']);
      };
      walk(data);
    } catch { /* ignore malformed blocks */ }
  }
  return out;
}

function pageText(html) {
  return decode(html
    .replace(/<(script|style|noscript|svg|template)[\s\S]*?<\/\1>/gi, ' ')
    .replace(/<\/(p|div|h[1-6]|li|section|article|br|tr)>/gi, '\n')
    .replace(/<br\s*\/?>/gi, '\n')
    .replace(/<[^>]+>/g, ' '))
    .replace(/[ \t\f\v]+/g, ' ')
    .replace(/\n\s*\n+/g, '\n')
    .trim();
}

function pickImage(events, html, base) {
  const fromLd = events.map((e) => [].concat(e.image || [])[0]).find(Boolean);
  const candidate = (typeof fromLd === 'object' ? fromLd?.url : fromLd) || meta(html, 'og:image') || meta(html, 'twitter:image');
  if (!candidate) return '';
  try { return new URL(candidate, base).toString(); } catch { return ''; }
}

async function fetchBanner(imageUrl) {
  const url = await safeUrl(imageUrl);
  if (!url) return null;
  try {
    const res = await fetch(url, { headers: { 'User-Agent': UA }, signal: AbortSignal.timeout(15000) });
    if (!res.ok) return null;
    const buf = await readLimited(res, MAX_IMAGE_BYTES);
    const webp = await sharp(buf, { failOn: 'none' })
      .rotate()
      .resize({ width: 1600, withoutEnlargement: true })
      .webp({ quality: 82 })
      .toBuffer();
    return `data:image/webp;base64,${webp.toString('base64')}`;
  } catch (err) {
    console.warn('event-autofill: banner download failed', err?.message);
    return null;
  }
}

const INSTRUCTION = `You are filling in an event listing for Bitcoin Africa Story's events calendar from the event page below.

Return ONLY a JSON object with these keys (use "" when the page doesn't say):
{
  "eventName": "the event's name, as the organiser writes it",
  "date": "start date as YYYY-MM-DD",
  "time": "start time as written for attendees, e.g. 6:00 PM WAT; include the time zone if the page gives one",
  "venue": "venue name and/or street address; \\"Online\\" for virtual events",
  "city": "city only (\\"\\" for online events)",
  "format": "in-person" or "virtual" (use "in-person" for hybrid events),
  "organiser": "organising group or company",
  "description": "2-3 plain sentences in your own words: what it is, who it's for, what happens. No hype, no emoji",
  "registrationUrl": "the link people use to register or get tickets; the page's own URL if that's where they register"
}

Rules: only use what the page says. Never guess a date, time or venue. If the year is missing, use the next upcoming occurrence after TODAY.`;

export async function POST(request) {
  let body;
  try { body = await request.json(); } catch { return NextResponse.json({ error: 'Invalid request body' }, { status: 400 }); }

  const user = await verifyIdToken(body?.idToken);
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  if (!isAllowedAdmin(user)) return NextResponse.json({ error: 'Forbidden' }, { status: 403 });

  const apiKey = process.env.ANTHROPIC_API_KEY;
  if (!apiKey) return NextResponse.json({ error: 'AI is not configured on this deployment (missing ANTHROPIC_API_KEY).' }, { status: 503 });

  const url = await safeUrl(body?.url);
  if (!url) return NextResponse.json({ error: 'That doesn’t look like a public web link. Paste the full event URL, starting with https://' }, { status: 400 });

  let html = '';
  let finalUrl = url.toString();
  try {
    const res = await fetch(url, {
      headers: { 'User-Agent': UA, Accept: 'text/html,application/xhtml+xml' },
      redirect: 'follow',
      signal: AbortSignal.timeout(20000),
    });
    finalUrl = res.url || finalUrl;
    if (!res.ok) {
      return NextResponse.json({ error: `The event page answered with an error (${res.status}). Check the link opens in a browser without logging in.` }, { status: 502 });
    }
    html = (await readLimited(res, MAX_PAGE_BYTES)).toString('utf8');
  } catch (err) {
    console.warn('event-autofill: page fetch failed', err?.message);
    return NextResponse.json({ error: 'Couldn’t open that page. It may be down, very slow, or blocking automated visits.' }, { status: 502 });
  }

  const events = jsonLdEvents(html);
  const text = pageText(html);
  const og = {
    title: meta(html, 'og:title') || decode(html.match(/<title[^>]*>([\s\S]*?)<\/title>/i)?.[1] || ''),
    description: meta(html, 'og:description') || meta(html, 'description'),
  };
  if (!events.length && text.length < 80 && !og.title) {
    return NextResponse.json({ error: 'That page has almost no readable text (it may need a login, like X or Instagram). Try the event’s Luma, Eventbrite or website link.' }, { status: 422 });
  }

  const today = new Date().toISOString().slice(0, 10);
  const prompt = `${INSTRUCTION}

TODAY: ${today}
PAGE URL: ${finalUrl}
PAGE TITLE: ${og.title}
PAGE SUMMARY: ${og.description}
STRUCTURED EVENT DATA: ${events.length ? JSON.stringify(events).slice(0, 6000) : '(none)'}

PAGE TEXT:
${text.slice(0, 14000)}`;

  const claude = await callClaude({
    apiKey,
    models: EXTRACTION_MODELS,
    // Room for the model's thinking as well as the answer.
    body: { max_tokens: 8000, messages: [{ role: 'user', content: prompt }] },
  });
  if (!claude.ok) return NextResponse.json({ error: claude.message }, { status: 502 });

  const raw = (claude.data.content || []).filter((c) => c.type === 'text').map((c) => c.text).join('\n');
  let fields;
  try {
    const m = raw.replace(/```json|```/g, '').match(/\{[\s\S]*\}/);
    fields = JSON.parse(m ? m[0] : raw);
  } catch {
    console.error('event-autofill: unexpected AI response', claude.data.stop_reason, raw.slice(0, 300));
    return NextResponse.json({ error: 'AI couldn’t read the event details from that page. Try again, or fill the form by hand.' }, { status: 502 });
  }

  const clean = (v, max = 300) => String(v ?? '').replace(/\s+/g, ' ').trim().slice(0, max);
  const out = {
    eventName: clean(fields.eventName, 160),
    date: /^\d{4}-\d{2}-\d{2}$/.test(clean(fields.date)) ? clean(fields.date) : '',
    time: clean(fields.time, 60),
    venue: clean(fields.venue, 200),
    city: clean(fields.city, 80),
    format: clean(fields.format) === 'virtual' ? 'virtual' : 'in-person',
    organiser: clean(fields.organiser, 120),
    description: clean(fields.description, 900),
    registrationUrl: /^https?:\/\//i.test(clean(fields.registrationUrl)) ? clean(fields.registrationUrl, 500) : finalUrl,
  };

  const banner = await fetchBanner(pickImage(events, html, finalUrl));
  return NextResponse.json({ fields: out, banner });
}
