// Shared conversion layer so the HTML page, the Markdown twin, and the JSON API
// all derive from the SAME post record. Nothing here re-queries the CMS — callers
// pass in the post they already fetched, which keeps the three representations
// from drifting apart.

import { stripHtml } from './article-content';

export const SITE_URL = 'https://bitcoinafricastory.com';
export const SITE_NAME = 'Bitcoin Africa Story';

/**
 * Convert the stored article HTML (Quill output) into readable Markdown.
 * Deliberately conservative: it handles the tags our editor actually emits
 * rather than trying to be a general-purpose HTML→MD engine.
 */
export function htmlToMarkdown(html) {
  if (!html) return '';
  let md = String(html);

  // Normalise block boundaries first so later regexes see clean separators.
  md = md
    .replace(/\r\n/g, '\n')
    .replace(/<\s*br\s*\/?\s*>/gi, '\n')
    .replace(/<\/(p|div|li|h[1-6]|blockquote|pre)>/gi, '\n\n');

  // Headings
  for (let level = 1; level <= 6; level += 1) {
    md = md.replace(
      new RegExp(`<h${level}[^>]*>([\\s\\S]*?)(?=\\n\\n|$)`, 'gi'),
      (_m, text) => `${'#'.repeat(level)} ${text.trim()}\n\n`
    );
  }

  // Links and images (images before links: an image inside a link would
  // otherwise get swallowed by the link pattern).
  md = md.replace(/<img[^>]*alt="([^"]*)"[^>]*src="([^"]+)"[^>]*>/gi, '![$1]($2)');
  md = md.replace(/<img[^>]*src="([^"]+)"[^>]*>/gi, '![]($1)');
  md = md.replace(/<a[^>]*href="([^"]+)"[^>]*>([\s\S]*?)<\/a>/gi, '[$2]($1)');

  // Inline emphasis
  md = md.replace(/<(strong|b)[^>]*>([\s\S]*?)<\/\1>/gi, '**$2**');
  md = md.replace(/<(em|i)[^>]*>([\s\S]*?)<\/\1>/gi, '_$2_');
  md = md.replace(/<code[^>]*>([\s\S]*?)<\/code>/gi, '`$1`');

  // List items — opening tag only; the closing tag became a blank line above.
  md = md.replace(/<li[^>]*>/gi, '- ');
  md = md.replace(/<blockquote[^>]*>/gi, '> ');

  // Drop every remaining tag, then decode the entities our content uses.
  md = md.replace(/<[^>]+>/g, '');
  md = md
    .replace(/&nbsp;/g, ' ')
    .replace(/&amp;/g, '&')
    .replace(/&lt;/g, '<')
    .replace(/&gt;/g, '>')
    .replace(/&quot;/g, '"')
    .replace(/&#39;|&apos;/g, "'")
    .replace(/&mdash;/g, '—')
    .replace(/&ndash;/g, '–')
    .replace(/\u2011/g, '-'); // undo the non-breaking hyphens we inject for HTML display

  // Collapse the blank-line runs the block replacements created.
  return md
    .split('\n')
    .map((line) => line.trimEnd())
    .join('\n')
    .replace(/\n{3,}/g, '\n\n')
    .trim();
}

export function wordCount(html) {
  const text = stripHtml(html || '');
  return text ? text.split(/\s+/).filter(Boolean).length : 0;
}

function toISODate(value) {
  if (!value) return undefined;
  const d = value?.seconds ? new Date(value.seconds * 1000) : new Date(value);
  return Number.isNaN(d.getTime()) ? undefined : d.toISOString();
}

// YAML values need quoting/escaping — a title containing a colon would
// otherwise produce invalid front matter.
function yamlString(value) {
  if (value === undefined || value === null || value === '') return undefined;
  return `"${String(value).replace(/"/g, '\\"').replace(/\n/g, ' ')}"`;
}

/**
 * Full Markdown twin of a post: YAML front matter + title + standfirst + body,
 * closing with attribution back to the canonical HTML URL.
 */
export function postToMarkdown(post) {
  if (!post) return '';
  const canonical = `${SITE_URL}/news/${post.slug}`;
  const keywords = Array.isArray(post.tags) ? post.tags.join(', ') : post.tags || '';

  const front = [
    ['title', yamlString(post.title)],
    ['description', yamlString(post.excerpt)],
    ['canonical', yamlString(canonical)],
    ['date_published', yamlString(toISODate(post.date || post.createdAt))],
    ['date_modified', yamlString(toISODate(post.updatedAt || post.date || post.createdAt))],
    ['author', yamlString(post.author)],
    ['category', yamlString(post.category)],
    ['keywords', yamlString(keywords)],
    ['word_count', wordCount(post.content)],
  ].filter(([, v]) => v !== undefined && v !== '');

  const body = htmlToMarkdown(post.content);

  return `---
${front.map(([k, v]) => `${k}: ${v}`).join('\n')}
---

# ${post.title}

${post.excerpt ? `${post.excerpt}\n\n` : ''}${body}

---

Source: [${SITE_NAME}](${canonical})

Quotation with attribution is welcome; full republication requires permission.
`;
}

/** Plain JSON shape for a post, used by the content API. */
export function postToJson(post, { includeMarkdown = false } = {}) {
  if (!post) return null;
  const canonical = `${SITE_URL}/news/${post.slug}`;
  return {
    slug: post.slug,
    title: post.title,
    description: post.excerpt || '',
    url: canonical,
    markdown_url: `${canonical}.md`,
    category: post.category || null,
    author: post.author || null,
    date_published: toISODate(post.date || post.createdAt) || null,
    date_modified: toISODate(post.updatedAt || post.date || post.createdAt) || null,
    keywords: Array.isArray(post.tags) ? post.tags : post.tags ? [post.tags] : [],
    image: post.image || null,
    word_count: wordCount(post.content),
    ...(includeMarkdown ? { markdown: postToMarkdown(post) } : {}),
  };
}

/** Headers shared by every public machine endpoint. */
export function machineHeaders(contentType) {
  return {
    'Content-Type': contentType,
    'Access-Control-Allow-Origin': '*',
    'Cache-Control': 'public, max-age=300, stale-while-revalidate=86400',
    'X-Robots-Tag': 'index, follow, max-snippet:-1',
  };
}
