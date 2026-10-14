import { SITE_URL } from '@/lib/schema';

// IndexNow: tells Bing, Yandex, Naver, Seznam (and anything built on Bing's
// index, such as ChatGPT search and Copilot) about new or updated URLs the
// moment they change, instead of waiting for a crawl. Google does not use
// IndexNow; it still discovers pages via sitemap.xml.
//
// Setup: set INDEXNOW_KEY in Vercel (8–128 letters, digits or dashes, e.g. the
// output of `openssl rand -hex 16`). The key is public by design: it is served
// at /indexnow-key.txt so the engines can verify we own the site.

const ENDPOINT = 'https://api.indexnow.org/indexnow';
export const INDEXNOW_KEY_PATH = '/indexnow-key.txt';

export function indexNowKey() {
  const key = (process.env.INDEXNOW_KEY || '').trim();
  return /^[a-zA-Z0-9-]{8,128}$/.test(key) ? key : null;
}

/**
 * Submit absolute URLs on this site to IndexNow. Never throws: returns a small
 * result object so a failed ping can't break saving an article.
 */
export async function submitToIndexNow(urls) {
  const key = indexNowKey();
  if (!key) return { skipped: 'INDEXNOW_KEY not set' };

  const urlList = [...new Set(urls)].filter((u) => typeof u === 'string' && u.startsWith(SITE_URL));
  if (urlList.length === 0) return { skipped: 'no URLs on this site' };

  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), 5000);
  try {
    const res = await fetch(ENDPOINT, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json; charset=utf-8' },
      body: JSON.stringify({
        host: new URL(SITE_URL).host,
        key,
        keyLocation: `${SITE_URL}${INDEXNOW_KEY_PATH}`,
        urlList,
      }),
      signal: controller.signal,
      cache: 'no-store',
    });
    // 200 and 202 both mean accepted.
    return { status: res.status, submitted: urlList.length };
  } catch (err) {
    return { error: err?.name === 'AbortError' ? 'timeout' : String(err?.message || err) };
  } finally {
    clearTimeout(timer);
  }
}
