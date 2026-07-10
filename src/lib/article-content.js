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

// Inject id attributes into h2/h3 so the TOC can link to them.
export function addHeadingIds(html) {
  if (!html) return html;
  return html.replace(/<(h2|h3)([^>]*)>([\s\S]*?)<\/\1>/gi, (full, tag, attrs, inner) => {
    if (/\bid=/.test(attrs)) return full;
    const text = stripHtml(inner);
    const id = text.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '');
    return `<${tag}${attrs} id="${id}">${inner}</${tag}>`;
  });
}
