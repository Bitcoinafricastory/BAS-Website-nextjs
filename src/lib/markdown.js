// Converts a stored post into a Markdown "twin" of the HTML article.
//
// Why this exists: AI agents and answer engines parse Markdown far more
// reliably than they parse rendered React. Serving the *same facts* as clean
// Markdown means an agent quoting us gets the real text and the real canonical
// URL, instead of scraping markup and guessing. The HTML page stays the
// canonical source — the Markdown twin always points back to it.
//
// Rule: never put anything here that isn't on the visible page. Same content,
// different serialization.

const SITE_URL = 'https://bitcoinafricastory.com';
const SITE_NAME = 'Bitcoin Africa Story';

// Minimal, dependency-free HTML → Markdown. Our article bodies come from the
// editor as a constrained subset (headings, paragraphs, lists, links, blockquotes,
// images, bold/italic, code), so a full parser would be overkill.
export function htmlToMarkdown(html) {
  if (!html) return '';
  let md = String(html);

  // Normalize non-breaking hyphens we inject for line-break control back to
  // plain hyphens — that's a rendering concern, not part of the text.
  md = md.replace(/\u2011/g, '-');

  md = md
    // Block-level elements first
    .replace(/<h1[^>]*>([\s\S]*?)<\/h1>/gi, (_, t) => `\n# ${inline(t)}\n`)
    .replace(/<h2[^>]*>([\s\S]*?)<\/h2>/gi, (_, t) => `\n## ${inline(t)}\n`)
    .replace(/<h3[^>]*>([\s\S]*?)<\/h3>/gi, (_, t) => `\n### ${inline(t)}\n`)
    .replace(/<h4[^>]*>([\s\S]*?)<\/h4>/gi, (_, t) => `\n#### ${inline(t)}\n`)
    .replace(/<blockquote[^>]*>([\s\S]*?)<\/blockquote>/gi, (_, t) =>
      `\n${inline(t).trim().split('\n').map((l) => `> ${l}`).join('\n')}\n`
    )
    .replace(/<pre[^>]*>([\s\S]*?)<\/pre>/gi, (_, t) => `\n\`\`\`\n${decode(stripTags(t))}\n\`\`\`\n`)
    .replace(/<li[^>]*>([\s\S]*?)<\/li>/gi, (_, t) => `- ${inline(t)}\n`)
    .replace(/<\/(ul|ol)>/gi, '\n')
    .replace(/<(ul|ol)[^>]*>/gi, '\n')
    .replace(/<p[^>]*>([\s\S]*?)<\/p>/gi, (_, t) => `\n${inline(t)}\n`)
    .replace(/<br\s*\/?>/gi, '\n')
    .replace(/<hr\s*\/?>/gi, '\n---\n');

  md = inline(md);
  md = stripTags(md);
  md = decode(md);

  // Collapse runaway blank lines from block conversion.
  return md.replace(/\n{3,}/g, '\n\n').trim();
}

// Inline formatting that can appear inside blocks.
function inline(s) {
  return String(s)
    .replace(/<img[^>]*alt="([^"]*)"[^>]*src="([^"]*)"[^>]*>/gi, (_, alt, src) => `![${alt}](${src})`)
    .replace(/<img[^>]*src="([^"]*)"[^>]*alt="([^"]*)"[^>]*>/gi, (_, src, alt) => `![${alt}](${src})`)
    .replace(/<img[^>]*src="([^"]*)"[^>]*>/gi, (_, src) => `![](${src})`)
    .replace(/<a[^>]*href="([^"]*)"[^>]*>([\s\S]*?)<\/a>/gi, (_, href, t) => `[${stripTags(t)}](${href})`)
    .replace(/<(strong|b)[^>]*>([\s\S]*?)<\/\1>/gi, (_, __, t) => `**${stripTags(t)}**`)
    .replace(/<(em|i)[^>]*>([\s\S]*?)<\/\1>/gi, (_, __, t) => `*${stripTags(t)}*`)
    .replace(/<code[^>]*>([\s\S]*?)<\/code>/gi, (_, t) => `\`${stripTags(t)}\``);
}

function stripTags(s) {
  return String(s).replace(/<[^>]*>/g, '');
}

function decode(s) {
  return String(s)
    .replace(/&nbsp;/g, ' ')
    .replace(/&amp;/g, '&')
    .replace(/&lt;/g, '<')
    .replace(/&gt;/g, '>')
    .replace(/&quot;/g, '"')
    .replace(/&#39;|&apos;/g, "'")
    .replace(/&mdash;/g, '—')
    .replace(/&ndash;/g, '–')
    .replace(/&rsquo;/g, '\u2019')
    .replace(/&lsquo;/g, '\u2018')
    .replace(/&hellip;/g, '…');
}

// YAML front matter values must be quote-safe.
function yamlString(value) {
  if (value === undefined || value === null || value === '') return null;
  return `"${String(value).replace(/"/g, '\\"').replace(/\n/g, ' ').trim()}"`;
}

function toIsoDate(value) {
  if (!value) return null;
  const d = value?.seconds ? new Date(value.seconds * 1000) : new Date(value);
  return Number.isNaN(d.getTime()) ? null : d.toISOString();
}

/**
 * Full Markdown twin of a news post, including YAML front matter whose
 * `canonical` always points at the HTML page (so citations land on the real
 * article, not the .md file).
 */
export function postToMarkdown(post, author) {
  const canonical = `${SITE_URL}/news/${post.slug}`;
  const body = htmlToMarkdown(post.content);
  const wordCount = body.split(/\s+/).filter(Boolean).length;

  const keywords = Array.isArray(post.tags)
    ? post.tags.join(', ')
    : typeof post.tags === 'string'
    ? post.tags
    : null;

  const frontMatter = [
    ['title', yamlString(post.title)],
    ['description', yamlString(post.excerpt)],
    ['canonical', yamlString(canonical)],
    ['date_published', yamlString(toIsoDate(post.publishedAt || post.date || post.createdAt))],
    ['date_modified', yamlString(toIsoDate(post.updatedAt || post.publishedAt || post.date))],
    ['author', yamlString(author?.name || post.author)],
    ['category', yamlString(post.category)],
    ['keywords', yamlString(keywords)],
    ['word_count', wordCount || null],
  ]
    .filter(([, v]) => v !== null && v !== undefined)
    .map(([k, v]) => `${k}: ${v}`)
    .join('\n');

  const parts = [`---\n${frontMatter}\n---`, `\n# ${post.title}\n`];

  if (post.excerpt) parts.push(`${post.excerpt}\n`);
  if (body) parts.push(`${body}\n`);

  parts.push(
    `\n---\n\nSource: [${SITE_NAME}](${canonical})\n\n` +
      `Published by ${SITE_NAME}. Quotation with attribution is welcome; ` +
      `full republication requires permission.\n`
  );

  return parts.join('\n');
}
