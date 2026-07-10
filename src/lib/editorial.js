// Editorial curation logic for the News hub.
//
// These functions derive editorial sections from the data we currently have.
// Each has a clearly-marked fallback that the admin panel can later replace
// with real signals:
//   - Featured:      post.isFeatured  → falls back to newest
//   - Editor's Picks: post.isEditorsPick → falls back to category variety
//   - Trending:      post.trendingScore / views → falls back to recent + varied
//   - Most Read:     post.views → falls back to a deterministic pseudo-order
//
// When those fields exist in Firestore, the explicit branch takes over
// automatically — no page changes needed.

function byNewest(a, b) {
  const da = a.date ? new Date(a.date).getTime() : 0;
  const db = b.date ? new Date(b.date).getTime() : 0;
  return db - da;
}

export function getFeatured(posts) {
  const flagged = posts.find((p) => p.isFeatured);
  if (flagged) return flagged;
  // Fallback: newest article with an image (looks best in a hero slot).
  const sorted = [...posts].sort(byNewest);
  return sorted.find((p) => p.image) || sorted[0] || null;
}

export function getLatest(posts, count = 6, excludeIds = []) {
  return [...posts]
    .sort(byNewest)
    .filter((p) => !excludeIds.includes(p.id))
    .slice(0, count);
}

export function getEditorsPicks(posts, count = 4, excludeIds = []) {
  const flagged = posts.filter((p) => p.isEditorsPick);
  if (flagged.length >= count) return flagged.slice(0, count);

  // Fallback: pick one strong article from each distinct category for variety.
  const seen = new Set();
  const picks = [];
  for (const post of [...posts].sort(byNewest)) {
    if (excludeIds.includes(post.id)) continue;
    const cat = post.category || 'Other';
    if (!seen.has(cat)) {
      seen.add(cat);
      picks.push(post);
    }
    if (picks.length >= count) break;
  }
  return picks;
}

export function getTrending(posts, count = 5, excludeIds = []) {
  const scored = posts.filter((p) => typeof p.trendingScore === 'number' || typeof p.views === 'number');
  if (scored.length >= count) {
    return [...scored]
      .sort((a, b) => (b.trendingScore || b.views || 0) - (a.trendingScore || a.views || 0))
      .filter((p) => !excludeIds.includes(p.id))
      .slice(0, count);
  }
  // Fallback: most recent, which are most likely to be "trending" now.
  return getLatest(posts, count, excludeIds);
}

export function getMostRead(posts, count = 5) {
  const withViews = posts.filter((p) => typeof p.views === 'number');
  if (withViews.length >= count) {
    return [...withViews].sort((a, b) => b.views - a.views).slice(0, count);
  }
  // Fallback: deterministic pseudo-ranking so the list is stable between
  // renders (not random), weighting slightly toward older, established posts.
  return [...posts]
    .sort((a, b) => {
      const ha = (a.id || '').split('').reduce((s, c) => s + c.charCodeAt(0), 0);
      const hb = (b.id || '').split('').reduce((s, c) => s + c.charCodeAt(0), 0);
      return hb - ha;
    })
    .slice(0, count);
}

export function getAllTags(posts) {
  const counts = {};
  for (const post of posts) {
    const tags = Array.isArray(post.tags) ? post.tags : [];
    for (const tag of tags) {
      counts[tag] = (counts[tag] || 0) + 1;
    }
    // Category also acts as a topic tag when explicit tags are absent.
    if (post.category) counts[post.category] = (counts[post.category] || 0) + 1;
  }
  return Object.entries(counts)
    .map(([name, count]) => ({ name, count }))
    .sort((a, b) => b.count - a.count);
}

export function getCategoryCounts(posts) {
  const counts = {};
  for (const post of posts) {
    const cat = post.category || 'Uncategorized';
    counts[cat] = (counts[cat] || 0) + 1;
  }
  return Object.entries(counts)
    .map(([name, count]) => ({ name, count }))
    .sort((a, b) => b.count - a.count);
}
