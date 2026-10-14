import { indexNowKey } from '@/lib/indexnow';

// Serves the IndexNow key so search engines can verify site ownership.
// Returns 404 until INDEXNOW_KEY is set in the environment.
export function GET() {
  const key = indexNowKey();
  if (!key) return new Response('Not found', { status: 404 });
  return new Response(key, { headers: { 'Content-Type': 'text/plain; charset=utf-8' } });
}
