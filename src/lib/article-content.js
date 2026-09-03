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
export function deriveKeyTakeaways(post) {
  if (Array.isArray(post.keyTakeaways) && post.keyTakeaways.length) {
    return post.keyTakeaways;
  }
  return [];
}

export function getFaqs(post) {
  if (Array.isArray(post.faqs) && post.faqs.length) return post.faqs;
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
