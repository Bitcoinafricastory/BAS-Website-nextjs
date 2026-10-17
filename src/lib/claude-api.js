// Shared Claude API call for the dashboard's AI tools.
//
// - Models are listed newest first. If Anthropic rejects one as unknown or
//   retired, the next is tried, so a model retirement degrades gracefully
//   instead of silently breaking the tools (Haiku 4.5 reached its earliest
//   retirement date on 15 Oct 2026).
// - Errors are turned into a plain sentence the dashboard can show. When the
//   account ran out of credit, editors only saw "AI service returned 400."

export const WRITING_MODELS = ['claude-sonnet-5-5', 'claude-sonnet-4-6'];
export const EXTRACTION_MODELS = ['claude-haiku-5-5', 'claude-haiku-4-5-20251001'];

function isModelUnavailable(status, text) {
  if (status === 404) return true;
  return status === 400 && /model/i.test(text) && /(not[_ ]found|invalid|retired|deprecated|does not exist|not supported)/i.test(text);
}

/**
 * Calls the Messages API, trying each model in turn.
 * Returns { ok: true, data, model } or { ok: false, status, message }.
 */
export async function callClaude({ apiKey, models, body }) {
  let last = { ok: false, status: 0, message: 'No model was tried.' };
  for (const model of models) {
    let response;
    try {
      response = await fetch('https://api.anthropic.com/v1/messages', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'x-api-key': apiKey,
          'anthropic-version': '2023-06-01',
        },
        body: JSON.stringify({ ...body, model }),
      });
    } catch (err) {
      console.error('Claude API unreachable:', err?.message);
      return { ok: false, status: 0, message: 'Could not reach the Claude API. Try again in a minute.' };
    }

    if (response.ok) return { ok: true, data: await response.json(), model };

    const text = await response.text().catch(() => '');
    console.error(`Claude API error (${model}):`, response.status, text.slice(0, 500));
    last = { ok: false, status: response.status, message: describeClaudeError(response.status, text) };
    if (!isModelUnavailable(response.status, text)) return last;
  }
  return last;
}

export function describeClaudeError(status, text = '') {
  if (/credit balance/i.test(text)) {
    return 'The Claude API account is out of credit. Top it up at console.anthropic.com → Billing.';
  }
  if (status === 401) return 'The Claude API key is invalid. Check ANTHROPIC_API_KEY in Vercel.';
  if (status === 403) return 'The Claude API key is not allowed to do this. Check its permissions in the Anthropic console.';
  if (status === 404 || isModelUnavailable(status, text)) return 'The Claude model used here is no longer available. Update the model list in src/lib/claude-api.js.';
  if (status === 429) return 'The Claude API rate limit was hit. Wait a minute and try again.';
  if (status === 529 || status === 503) return 'Claude is overloaded right now. Try again in a minute.';
  return `The Claude API returned an error (${status}).`;
}
