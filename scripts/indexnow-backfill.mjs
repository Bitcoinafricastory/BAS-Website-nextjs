// One-time: announce every URL in the live sitemap to IndexNow.
// Run AFTER deploying with INDEXNOW_KEY set in Vercel:
//   INDEXNOW_KEY=<same key as Vercel> node scripts/indexnow-backfill.mjs
const SITE = 'https://www.bitcoinafricastory.com';
const key = (process.env.INDEXNOW_KEY || '').trim();
if (!key) {
  console.error('Set INDEXNOW_KEY to the same value as in Vercel.');
  process.exit(1);
}

const live = (await (await fetch(`${SITE}/indexnow-key.txt`)).text()).trim();
if (live !== key) {
  console.error('The key at /indexnow-key.txt does not match INDEXNOW_KEY. Set it in Vercel and redeploy first.');
  process.exit(1);
}

const xml = await (await fetch(`${SITE}/sitemap.xml`)).text();
const urls = [...xml.matchAll(/<loc>([^<]+)<\/loc>/g)].map((m) => m[1].trim().replace(/&amp;/g, '&'));
console.log(`Found ${urls.length} URLs in the sitemap.`);

const res = await fetch('https://api.indexnow.org/indexnow', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json; charset=utf-8' },
  body: JSON.stringify({ host: new URL(SITE).host, key, keyLocation: `${SITE}/indexnow-key.txt`, urlList: urls }),
});
console.log(`IndexNow responded: ${res.status} ${res.statusText} (200 or 202 = accepted)`);
