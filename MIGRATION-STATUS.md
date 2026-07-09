# Bitcoin Africa Story — Next.js Migration (in progress)

This is a **separate project**, built in parallel with the live React site.
Nothing about the live site (bitcoinafricastory.com) has been touched.

## ✅ Done — the SEO/AEO-critical pages

- **`/news/[slug]`** — individual article pages. This was the whole point of
  the migration: articles are now rendered to real HTML on the server
  (`generateStaticParams` pre-builds every known article; `revalidate = 300`
  means new articles picked up automatically within 5 minutes of publishing,
  no manual redeploy needed). Each article gets its own real `<title>`,
  meta description, canonical URL, Open Graph tags, and NewsArticle JSON-LD —
  all present in the raw HTML this time, not injected later by JS.
- **`/news`** — article listing, server-rendered.
- **`/`** — simple home page with latest articles, server-rendered.
- **`/sitemap.xml`** — generated dynamically from Firestore, includes every
  article automatically (the old static sitemap only had 6 pages and zero
  articles).
- **`/robots.txt`** — points at the dynamic sitemap.
- Firebase reads happen server-side via `src/lib/news.js` (same collection/
  field names as the existing app: `news` collection, `slug`, `title`,
  `excerpt`, `content`, `image`, `author`, `date`, `category`, `readTime`).

## 🚧 Not yet ported (lower SEO priority, but needed before cutover)

- About, Donate, Contact, Education, Events, Community, Resources pages —
  currently only exist in the old React app. These matter less for SEO/AEO
  (they're not where your indexable content lives) but obviously need to
  exist before you can fully switch the domain over.
- **Admin dashboard** (`/admin`, `/dashboard/*`) — this is the internal
  publishing tool, not public-facing, so it's reasonable to keep running on
  the old React app indefinitely, or even leave it as a separate internal
  tool rather than porting it to Next.js at all.
- **Interactive features on articles** — likes, comments, view counters,
  share buttons. These were deliberately left out of the server-rendered
  article page for now (see the comment at the bottom of
  `src/app/news/[slug]/page.js`). They should come back as a small **Client
  Component** (e.g. `<PostInteractions postId={post.id} />`) mounted inside
  the page, so the article text/metadata stay server-rendered for crawlers
  while the interactive bits stay dynamic in the browser. This is a
  contained, well-understood piece of work, not a structural risk.
- Header/Footer navigation components — not yet added, so pages currently
  render without the site chrome.

## How to test it yourself

This sandbox has no network access to Firebase, so I could not fetch real
article data or verify the rendered output end-to-end. You (or Vercel) will
have normal internet access, so this should just work — but please verify
before trusting it:

```bash
cd bas-nextjs
npm install
npm run dev
# open http://localhost:3000/news/<a-real-slug-from-your-site>
# view-source: the page — you should see real <title>, real article text,
# and a <link rel="canonical"> pointing at that article's own URL.
```

## Suggested next steps

1. Push this to a **new GitHub repo** (don't merge into `BAS-Website`).
2. Import that repo as a **new Vercel project** — you'll get a free
   `*.vercel.app` preview URL immediately, or point a subdomain like
   `beta.bitcoinafricastory.com` at it for more realistic testing.
3. Verify articles render with real HTML (fetch the URL directly, or use
   Google's Rich Results Test / a "view source" check — not just opening it
   in a browser, since browsers execute JS either way).
4. Once confident, either:
   - Finish porting the remaining pages and interactive features, then
     switch DNS for the main domain, **or**
   - Cut over now for `/news/*` only (keep other routes on the old app via
     rewrites) if you want SEO wins sooner — this is a valid middle path,
     just ask if you want help wiring that up.
5. Keep the old React project live and untouched as a rollback option for a
   while after cutover.
