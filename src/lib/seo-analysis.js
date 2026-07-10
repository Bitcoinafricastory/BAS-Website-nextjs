// Real-time SEO + AEO analysis for the article editor.
// Pure functions — given the article form, return scores and specific,
// actionable checks. No external calls.

import { stripHtml, extractHeadings } from './article-content';

function countWords(text) {
  const t = (text || '').trim();
  return t ? t.split(/\s+/).length : 0;
}

function countSyllables(word) {
  word = word.toLowerCase().replace(/[^a-z]/g, '');
  if (word.length <= 3) return 1;
  word = word.replace(/(?:[^laeiouy]es|ed|[^laeiouy]e)$/, '').replace(/^y/, '');
  const m = word.match(/[aeiouy]{1,2}/g);
  return m ? m.length : 1;
}

// Flesch Reading Ease → 0-100 (higher = easier).
export function readabilityScore(content) {
  const text = stripHtml(content);
  const words = text ? text.split(/\s+/).filter(Boolean) : [];
  const sentences = text ? text.split(/[.!?]+/).filter((s) => s.trim().length > 0) : [];
  if (words.length === 0 || sentences.length === 0) return { score: 0, label: 'No content', grade: '—' };

  const syllables = words.reduce((sum, w) => sum + countSyllables(w), 0);
  const wordsPerSentence = words.length / sentences.length;
  const syllablesPerWord = syllables / words.length;
  let score = 206.835 - 1.015 * wordsPerSentence - 84.6 * syllablesPerWord;
  score = Math.max(0, Math.min(100, Math.round(score)));

  let label, grade;
  if (score >= 70) { label = 'Easy to read'; grade = 'A'; }
  else if (score >= 55) { label = 'Fairly readable'; grade = 'B'; }
  else if (score >= 40) { label = 'Moderately difficult'; grade = 'C'; }
  else { label = 'Difficult'; grade = 'D'; }

  return { score, label, grade };
}

// Returns { score, checks: [{ id, label, status: 'pass'|'warn'|'fail', hint }] }
export function seoAnalysis(form) {
  const checks = [];
  const bodyText = stripHtml(form.content);
  const bodyWords = countWords(bodyText);
  const title = form.seoTitle || form.title || '';
  const metaDesc = form.metaDescription || form.excerpt || '';
  const focus = (form.focusKeywords || '').toLowerCase().trim();

  // Title length
  if (!title) checks.push({ id: 'title', label: 'SEO title', status: 'fail', hint: 'Add a title.' });
  else if (title.length < 30) checks.push({ id: 'title', label: 'SEO title length', status: 'warn', hint: 'Title is short — aim for 50-60 characters.' });
  else if (title.length > 60) checks.push({ id: 'title', label: 'SEO title length', status: 'warn', hint: 'Title over 60 chars may be truncated in search results.' });
  else checks.push({ id: 'title', label: 'SEO title length', status: 'pass', hint: 'Good length.' });

  // Meta description
  if (!metaDesc) checks.push({ id: 'meta', label: 'Meta description', status: 'fail', hint: 'Add a meta description or excerpt.' });
  else if (metaDesc.length < 120) checks.push({ id: 'meta', label: 'Meta description length', status: 'warn', hint: 'Description is short — aim for 140-160 characters.' });
  else if (metaDesc.length > 160) checks.push({ id: 'meta', label: 'Meta description length', status: 'warn', hint: 'Over 160 chars may be truncated.' });
  else checks.push({ id: 'meta', label: 'Meta description length', status: 'pass', hint: 'Good length.' });

  // Slug
  if (!form.slug) checks.push({ id: 'slug', label: 'URL slug', status: 'fail', hint: 'Add a URL slug.' });
  else if (form.slug.length > 75) checks.push({ id: 'slug', label: 'URL slug', status: 'warn', hint: 'Slug is long — shorter is better for sharing.' });
  else checks.push({ id: 'slug', label: 'URL slug', status: 'pass', hint: 'Clean slug.' });

  // Focus keyword usage
  if (!focus) {
    checks.push({ id: 'focus', label: 'Focus keyword', status: 'warn', hint: 'Set a focus keyword to guide optimization.' });
  } else {
    const inTitle = title.toLowerCase().includes(focus);
    const inMeta = metaDesc.toLowerCase().includes(focus);
    const inBody = bodyText.toLowerCase().includes(focus);
    if (inTitle && inBody) checks.push({ id: 'focus', label: 'Focus keyword usage', status: 'pass', hint: 'Keyword appears in title and body.' });
    else if (inBody || inTitle || inMeta) checks.push({ id: 'focus', label: 'Focus keyword usage', status: 'warn', hint: `Use "${focus}" in the title, body, and meta description.` });
    else checks.push({ id: 'focus', label: 'Focus keyword usage', status: 'fail', hint: `"${focus}" doesn't appear in the article.` });
  }

  // Content length
  if (bodyWords === 0) checks.push({ id: 'length', label: 'Content length', status: 'fail', hint: 'Article body is empty.' });
  else if (bodyWords < 300) checks.push({ id: 'length', label: 'Content length', status: 'warn', hint: `${bodyWords} words — aim for 600+ for depth and ranking.` });
  else checks.push({ id: 'length', label: 'Content length', status: 'pass', hint: `${bodyWords} words.` });

  // Featured image + alt
  if (!form.image) checks.push({ id: 'image', label: 'Featured image', status: 'fail', hint: 'Add a featured image.' });
  else if (!form.imageAlt) checks.push({ id: 'image', label: 'Image alt text', status: 'warn', hint: 'Add alt text for accessibility and image SEO.' });
  else checks.push({ id: 'image', label: 'Image alt text', status: 'pass', hint: 'Alt text set.' });

  // Heading hierarchy
  const headings = extractHeadings(form.content);
  if (bodyWords > 300 && headings.length === 0) checks.push({ id: 'headings', label: 'Heading structure', status: 'warn', hint: 'Add H2/H3 subheadings to structure the article.' });
  else if (headings.length > 0) checks.push({ id: 'headings', label: 'Heading structure', status: 'pass', hint: `${headings.length} subheadings.` });
  else checks.push({ id: 'headings', label: 'Heading structure', status: 'warn', hint: 'Consider adding subheadings.' });

  // Score = weighted pass ratio
  const weights = { pass: 1, warn: 0.5, fail: 0 };
  const total = checks.reduce((s, c) => s + weights[c.status], 0);
  const score = Math.round((total / checks.length) * 100);

  return { score, checks };
}

// AEO-specific recommendations (answer-engine optimization).
export function aeoRecommendations(form) {
  const recs = [];
  const bodyText = stripHtml(form.content);
  const hasFaqs = Array.isArray(form.faqs) && form.faqs.length > 0;
  const hasTakeaways = Array.isArray(form.keyTakeaways) && form.keyTakeaways.length > 0;
  const headings = extractHeadings(form.content);

  if (!hasTakeaways) recs.push({ id: 'takeaways', label: 'Add Key Takeaways', hint: 'A bullet summary helps AI engines quote your article accurately.', status: 'todo' });
  else recs.push({ id: 'takeaways', label: 'Key Takeaways present', hint: `${form.keyTakeaways.length} takeaways.`, status: 'done' });

  if (!hasFaqs) recs.push({ id: 'faq', label: 'Add an FAQ section', hint: 'Question/answer pairs are heavily cited by ChatGPT, Perplexity, and Google AI.', status: 'todo' });
  else recs.push({ id: 'faq', label: 'FAQ present', hint: `${form.faqs.length} questions — emits FAQ schema.`, status: 'done' });

  const questionHeadings = headings.filter((h) => /\?$/.test(h.text) || /^(how|what|why|when|where|who|can|is|are|does)\b/i.test(h.text));
  if (questionHeadings.length === 0 && headings.length > 0) {
    recs.push({ id: 'q-headings', label: 'Use question-style headings', hint: 'Headings phrased as questions match how people ask AI assistants.', status: 'todo' });
  }

  if (bodyText.length > 0 && bodyText.length < 400) {
    recs.push({ id: 'depth', label: 'Add more depth', hint: 'AI engines favor comprehensive, specific answers over thin content.', status: 'todo' });
  }

  return recs;
}
