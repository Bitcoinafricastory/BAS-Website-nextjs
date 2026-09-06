import { getPodcastEpisodes } from '@/lib/news';
import { getEducationData } from '@/lib/education';
import { SITE_URL } from '@/lib/schema';

export const revalidate = 3600;

function escapeXml(str) {
  if (!str) return '';
  return String(str)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&apos;');
}

function youtubeId(url) {
  if (!url) return null;
  const patterns = [/[?&]v=([\w-]{11})/, /youtu\.be\/([\w-]{11})/, /\/embed\/([\w-]{11})/, /\/shorts\/([\w-]{11})/];
  for (const re of patterns) {
    const m = url.match(re);
    if (m) return m[1];
  }
  return null;
}

// One <video:video> block per clip. Google requires a thumbnail, title,
// description, and a player or content URL — everything else is optional.
//
// IMPORTANT: these are the INNER blocks only. The sitemap spec requires each
// <url> entry to carry a unique <loc>; when several videos live on the same
// page (all our podcast episodes are on /podcast, all education clips on
// /education) they must be nested as multiple <video:video> children of a
// single <url>. Emitting one <url> per video produced duplicate <loc> values,
// which is invalid and caused Search Console to reject the whole file.
function videoBlock({ title, description, thumbnail, playerUrl }) {
  return `    <video:video>
      <video:thumbnail_loc>${escapeXml(thumbnail)}</video:thumbnail_loc>
      <video:title>${escapeXml(title)}</video:title>
      <video:description>${escapeXml((description || title || '').slice(0, 2048))}</video:description>
      <video:player_loc>${escapeXml(playerUrl)}</video:player_loc>
      <video:family_friendly>yes</video:family_friendly>
      <video:live>no</video:live>
    </video:video>`;
}

export async function GET() {
  // Keyed by page URL so multiple videos on the same page group into one
  // <url> entry rather than producing duplicate <loc> values.
  const byPage = new Map();
  const addVideo = (pageUrl, block) => {
    if (!byPage.has(pageUrl)) byPage.set(pageUrl, []);
    byPage.get(pageUrl).push(block);
  };

  // Podcast episodes (YouTube)
  try {
    const episodes = await getPodcastEpisodes();
    for (const ep of episodes || []) {
      const id = youtubeId(ep.url);
      if (!id) continue;
      addVideo(
        `${SITE_URL}/podcast`,
        videoBlock({
          title: ep.title,
          description: ep.description,
          thumbnail: ep.image?.startsWith('http') ? ep.image : `https://i.ytimg.com/vi/${id}/hqdefault.jpg`,
          playerUrl: `https://www.youtube.com/embed/${id}`,
        })
      );
    }
  } catch (err) {
    console.warn('video-sitemap: podcast fetch failed', err);
  }

  // Education videos (YouTube)
  try {
    const { videos } = await getEducationData();
    for (const v of videos || []) {
      const id = youtubeId(v.embedUrl);
      if (!id) continue;
      addVideo(
        `${SITE_URL}/education`,
        videoBlock({
          title: v.title,
          description: v.description,
          thumbnail: v.thumbnailUrl?.startsWith('http') ? v.thumbnailUrl : `https://i.ytimg.com/vi/${id}/hqdefault.jpg`,
          playerUrl: `https://www.youtube.com/embed/${id}`,
        })
      );
    }
  } catch (err) {
    console.warn('video-sitemap: education fetch failed', err);
  }

  const entries = [...byPage.entries()].map(
    ([pageUrl, blocks]) => `  <url>
    <loc>${escapeXml(pageUrl)}</loc>
${blocks.join('\n')}
  </url>`
  );

  const xml = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9" xmlns:video="http://www.google.com/schemas/sitemap-video/1.1">
${entries.join('\n')}
</urlset>`;

  return new Response(xml, {
    headers: {
      'Content-Type': 'application/xml; charset=utf-8',
      'Cache-Control': 'public, max-age=3600, s-maxage=3600',
    },
  });
}
