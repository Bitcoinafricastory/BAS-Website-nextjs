// AI editorial assistance service.
//
// Each tool calls /api/admin/ai (authenticated, server-side Anthropic call).
// If that fails for any reason — not configured, network error, article too
// short — the function falls back to a crude heuristic so the UI still does
// something rather than erroring. The heuristics are deliberately basic; they
// are a safety net, not the intended output.

import { stripHtml } from './article-content';
import { auth } from './firebase';

async function callAI(task, payload) {
  try {
    const idToken = await auth.currentUser?.getIdToken();
    if (!idToken) return null;

    const res = await fetch('/api/admin/ai', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        idToken,
        task,
        payload: {
          title: payload?.title,
          excerpt: payload?.excerpt,
          category: payload?.category,
          content: payload?.content,
        },
      }),
    });

    const data = await res.json();
    if (!res.ok) {
      // Surface the reason in the console — a silent null here is why the
      // stubbed version went unnoticed for so long.
      console.warn(`AI task "${task}" failed:`, data?.error || res.status);
      return null;
    }
    return data.result ?? null;
  } catch (err) {
    console.warn(`AI task "${task}" request failed:`, err);
    return null;
  }
}

function firstSentences(text, n = 2) {
  const sentences = (text || '').split(/(?<=[.!?])\s+/).filter(Boolean);
  return sentences.slice(0, n).join(' ');
}

export async function generateSummary(form) {
  const ai = await callAI('summary', form);
  if (ai) return ai;
  const body = stripHtml(form.content);
  return firstSentences(body, 3) || form.excerpt || 'Add article content to generate a summary.';
}

export async function generateMetaDescription(form) {
  const ai = await callAI('meta', form);
  if (ai) return ai;
  const base = form.excerpt || firstSentences(stripHtml(form.content), 1) || form.title || '';
  return base.slice(0, 155);
}

export async function suggestHeadlines(form) {
  const ai = await callAI('headlines', form);
  if (ai) return ai;
  const t = form.title || 'Bitcoin in Africa';
  const cat = form.category || 'Bitcoin';
  return [
    t,
    `How ${t} Is Changing ${cat} in Africa`,
    `${t}: What You Need to Know`,
    `The Real Story Behind ${t}`,
  ];
}

export async function generateFaqs(form) {
  const ai = await callAI('faq', form);
  if (ai) return ai;
  const topic = form.focusKeywords || form.title || 'this topic';
  return [
    { question: `What is ${topic}?`, answer: form.excerpt || `A concise explanation of ${topic}.` },
    { question: `Why does ${topic} matter for Africa?`, answer: 'Explain the local relevance and impact here.' },
    { question: `How can I get involved with ${topic}?`, answer: 'Point readers to next steps, resources, or community links.' },
  ];
}

export async function generateKeyTakeaways(form) {
  const ai = await callAI('takeaways', form);
  if (ai) return ai;
  const body = stripHtml(form.content);
  const sentences = body.split(/(?<=[.!?])\s+/).filter((s) => s.length > 40).slice(0, 3);
  return sentences.length ? sentences : ['Add article content to generate takeaways.'];
}

export async function generateSocialCaptions(form) {
  const ai = await callAI('social', form);
  if (ai) return ai;
  const t = form.title || 'New on Bitcoin Africa Story';
  const tag = '#Bitcoin #Africa';
  return {
    twitter: `${t} ${tag}`,
    linkedin: `${t}\n\n${form.excerpt || ''}\n\nRead more on Bitcoin Africa Story. ${tag}`,
  };
}

export async function recommendTags(form) {
  const ai = await callAI('tags', form);
  if (ai) return ai;
  const text = `${form.title} ${form.excerpt} ${stripHtml(form.content)}`.toLowerCase();
  const candidates = ['adoption', 'lightning', 'merchants', 'education', 'wallet', 'mining', 'policy', 'remittances', 'nigeria', 'kenya', 'south africa', 'ghana', 'circular economy', 'self-custody'];
  return candidates.filter((c) => text.includes(c)).slice(0, 6);
}
