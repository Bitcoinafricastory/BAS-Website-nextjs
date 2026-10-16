import { auth } from '@/lib/firebase';

// Fire-and-forget: tell the server which public pages changed so it can
// refresh its cache and notify IndexNow (Bing, ChatGPT search, Copilot).
// Never throws and never blocks the dashboard: a failed announcement just
// means search engines find the change on their next normal crawl.
export function announceChange(paths) {
  const list = [...new Set((paths || []).filter((p) => typeof p === 'string' && p.startsWith('/')))];
  if (list.length === 0) return;
  (async () => {
    try {
      const idToken = await auth.currentUser?.getIdToken();
      if (!idToken) return;
      await fetch('/api/admin/indexnow', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ idToken, paths: list }),
      });
    } catch (err) {
      console.warn('announceChange failed:', err);
    }
  })();
}
