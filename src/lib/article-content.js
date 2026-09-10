// Helpers for deriving article metadata from content.
// These provide sensible defaults now; once the admin panel adds explicit
// fields (keyTakeaways, faqs, readingTime), those take precedence.

export function stripHtml(html) {
  if (!html) return '';
  return html
    .replace(/<style[^>]*>[\s\S]*?<\/style>/gi, ' ')
    .replace(/<script[^>]*>[\s\S]*?<\/script>/gi, ' ')
    .replace(/<[^>]+>/g, ' ')
    .replace(/&nbsp;/g, ' ')
    .replace(/&amp;/g, '&')
    .replace(/&lt;/g, '<')
    .replace(/&gt;/g, '>')
    .replace(/\s+/g, ' ')
    .trim();
}

export function computeReadingTime(content, explicit) {
  if (explicit) return explicit;
  const text = stripHtml(content);
  const words = text ? text.split(/\s+/).length : 0;
  const minutes = Math.max(1, Math.round(words / 220));
  return `${minutes} min read`;
}

// Pull the first N sentences as fallback "Key Takeaways" if the article
// doesn't define them explicitly. Editors can override in the admin panel.
// Stored editorial text (takeaways, FAQ questions/answers) is rendered as
// plain React text, not HTML — so any entity that made it into the stored
// string shows up literally as "&#39;" instead of an apostrophe. Older entries
// were generated from raw article HTML and carry these. Decoding here fixes
// every existing entry on render, with no need to regenerate anything.
export function decodeEntities(value) {
  if (typeof value !== 'string') return value;
  const pass = (s) =>
    s
      .replace(/&nbsp;/gi, ' ')
      .replace(/&quot;|&ldquo;|&rdquo;/gi, '"')
      .replace(/&#39;|&apos;|&rsquo;|&lsquo;/gi, "'")
      .replace(/&mdash;/gi, '—')
      .replace(/&ndash;/gi, '–')
      .replace(/&hellip;/gi, '…')
      .replace(/&lt;/gi, '<')
      .replace(/&gt;/gi, '>')
      .replace(/&#(\d+);/g, (_, d) => String.fromCharCode(Number(d)))
      .replace(/&#x([0-9a-f]+);/gi, (_, h) => String.fromCharCode(parseInt(h, 16)))
      .replace(/&amp;/gi, '&');

  // Two passes: content that was escaped twice arrives as "&amp;#39;", and a
  // single pass only unwraps it to "&#39;". Capped at two so a literal
  // ampersand a writer typed can't be endlessly re-interpreted.
  const once = pass(value);
  return (once.includes('&') ? pass(once) : once).trim();
}

export function deriveKeyTakeaways(post) {
  if (Array.isArray(post.keyTakeaways) && post.keyTakeaways.length) {
    return post.keyTakeaways.map(decodeEntities).filter(Boolean);
  }
  return [];
}

export function getFaqs(post) {
  if (Array.isArray(post.faqs) && post.faqs.length) {
    return post.faqs.map((f) =>
      typeof f === 'object' && f
        ? { ...f, question: decodeEntities(f.question), answer: decodeEntities(f.answer) }
        : decodeEntities(f)
    );
  }
  return [];
}

// Extract <h2>/<h3> headings from HTML content for a table of contents.
export function extractHeadings(html) {
  if (!html) return [];
  const headings = [];
  const regex = /<(h2|h3)[^>]*>([\s\S]*?)<\/\1>/gi;
  let match;
  while ((match = regex.exec(html)) !== null) {
    const level = match[1].toLowerCase();
    const text = stripHtml(match[2]);
    if (text) {
      const id = text.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '');
      headings.push({ level, text, id });
    }
  }
  return headings;
}

// Prevents browsers from splitting hyphenated compounds (e.g. "non-custodial",
// "human-readable", "mid-2026") across two lines. Browsers treat any hyphen
// sitting directly between two alphanumeric characters as a valid line-break
// point by default — this is normal typography, but our article column is
// narrow enough that it happens constantly and looks broken. Swapping the
// ASCII hyphen for a non-breaking hyphen (U+2011) keeps the whole compound
// together, while leaving spaced dashes ("2024 - 2025") untouched. Applied
// at render time so it covers content already saved, not just new writing.
//
// Only touches text between tags — never inside a tag itself — so hyphens in
// URLs (href="...my-page"), CSS classes (ql-font-sans-serif), or any other
// attribute are left completely untouched and links keep working.
// Rich-text paste (Word, Google Docs, etc.) frequently leaves behind stray
// non-breaking spaces — as the literal &nbsp; entity, or as the raw U+00A0
// character — scattered through otherwise ordinary prose. A non-breaking
// space is invisible but tells the browser "never break a line here," so a
// few of these silently glue several ordinary words into one giant unbreakable
// token. When that fake token doesn't fit a line, overflow-wrap has no choice
// but to cut it at an arbitrary character position — which is what produces
// seemingly-random mid-word splits like "in" -> "i"/"n" or "guessed" ->
// "guesse"/"d", unrelated to any hyphen or long word. Converting them back to
// ordinary breakable spaces (only in text content, never inside tags) fixes
// this at the source rather than fighting it with CSS.
export function normalizeNonBreakingSpaces(html) {
  if (!html) return html;
  return html.replace(/(<[^>]*>)|([^<]+)/g, (full, tag, text) => {
    if (tag) return tag;
    return text.replace(/&nbsp;/g, ' ').replace(/\u00A0/g, ' ');
  });
}

import sanitizeHtml from 'sanitize-html';

// Defense-in-depth against stored XSS. Article HTML is written by staff
// through the dashboard editor (Quill), not directly by the public — but
// nothing before this enforced that boundary in code, and every article
// page renders this HTML via dangerouslySetInnerHTML with no sanitization
// at all. A single pasted <script> tag, or a compromised/over-permissioned
// account, would execute in every reader's browser. This strips anything
// that isn't plain formatting, while allowing everything Quill's editor
// actually produces (headings, links, images, code blocks, embeds).
const ALLOWED_TAGS = [
  'p', 'br', 'strong', 'b', 'em', 'i', 'u', 's', 'span', 'a',
  'h1', 'h2', 'h3', 'h4', 'h5', 'h6',
  'ul', 'ol', 'li', 'blockquote', 'pre', 'code',
  'img', 'figure', 'figcaption', 'hr', 'sub', 'sup',
  'table', 'thead', 'tbody', 'tr', 'th', 'td', 'iframe',
];

const ALLOWED_ATTRIBUTES = {
  a: ['href', 'target', 'rel', 'class'],
  img: ['src', 'alt', 'width', 'height', 'class'],
  span: ['class', 'style'],
  p: ['class'],
  h1: ['id', 'class'], h2: ['id', 'class'], h3: ['id', 'class'],
  h4: ['id', 'class'], h5: ['id', 'class'], h6: ['id', 'class'],
  iframe: ['src', 'title', 'allow', 'allowfullscreen', 'frameborder', 'class'],
  code: ['class'],
  pre: ['class'],
  '*': [],
};

export function sanitizeArticleHtml(html) {
  if (!html) return html;
  return sanitizeHtml(html, {
    allowedTags: ALLOWED_TAGS,
    allowedAttributes: ALLOWED_ATTRIBUTES,
    // Quill sets inline font-family via style="" for its font picker — the
    // only inline style property actually needed. Anything else (e.g.
    // expression()-style legacy CSS attacks) is stripped.
    allowedStyles: {
      span: { 'font-family': [/^[a-zA-Z0-9\s,'"-]+$/] },
    },
    // Only allow embeds from YouTube — the one iframe source the site
    // actually uses (podcast/education videos). Blocks an iframe being
    // used to embed arbitrary attacker-controlled pages.
    allowedIframeHostnames: ['www.youtube.com', 'youtube.com', 'www.youtube-nocookie.com'],
    // Belt-and-braces: strip javascript: / data: URIs even inside allowed
    // attributes like href/src.
    allowedSchemes: ['http', 'https', 'mailto'],
    disallowedTagsMode: 'discard',
  });
}

export function preventHyphenBreaks(html) {
  if (!html) return html;
  return html.replace(/(<[^>]*>)|([^<]+)/g, (full, tag, text) => {
    if (tag) return tag;
    return text.replace(/([A-Za-z0-9])-([A-Za-z0-9])/g, '$1\u2011$2');
  });
}


export function addHeadingIds(html) {
  if (!html) return html;
  return html.replace(/<(h2|h3)([^>]*)>([\s\S]*?)<\/\1>/gi, (full, tag, attrs, inner) => {
    if (/\bid=/.test(attrs)) return full;
    const text = stripHtml(inner);
    const id = text.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '');
    return `<${tag}${attrs} id="${id}">${inner}</${tag}>`;
  });
}
