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
function videoEntry({ pageUrl, title, description, thumbnail, playerUrl }) {
  return `  <url>
    <loc>${escapeXml(pageUrl)}</loc>
    <video:video>
      <video:thumbnail_loc>${escapeXml(thumbnail)}</video:thumbnail_loc>
      <video:title>${escapeXml(title)}</video:title>
      <video:description>${escapeXml((description || title || '').slice(0, 2048))}</video:description>
      <video:player_loc>${escapeXml(playerUrl)}</video:player_loc>
      <video:family_friendly>yes</video:family_friendly>
      <video:live>no</video:live>
    </video:video>
  </url>`;
}

export async function GET() {
  const entries = [];

  // Podcast episodes (YouTube)
  try {
    const episodes = await getPodcastEpisodes();
    for (const ep of episodes || []) {
      const id = youtubeId(ep.url);
      if (!id) continue;
      entries.push(
        videoEntry({
          pageUrl: `${SITE_URL}/podcast`,
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
      entries.push(
        videoEntry({
          pageUrl: `${SITE_URL}/education`,
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

  const xml = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9" xmlns:video="http://www.google.com/schemas/sitemap-video/1.1">
${entries.join('\n')}
</urlset>`;

  return new Response(xml, {
    headers: { 'Content-Type': 'application/xml' },
  });
}
