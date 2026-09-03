'use client';
import Image from 'next/image';

import { useState } from 'react';
import { Clock, Layers, Play } from 'lucide-react';

function getEmbedUrl(url) {
  if (!url) return null;
  try {
    const u = url.trim();
    if (u.includes('youtube.com/embed') || u.includes('youtube-nocookie.com/embed')) return u;
    const watchMatch = u.match(/[?&]v=([\w-]+)/);
    if (watchMatch && watchMatch[1]) return `https://www.youtube.com/embed/${watchMatch[1]}`;
    const shortMatch = u.match(/youtu\.be\/(\w[-\w]*)/i);
    if (shortMatch && shortMatch[1]) return `https://www.youtube.com/embed/${shortMatch[1]}`;
    if (u.startsWith('http')) return u;
    return null;
  } catch {
    return null;
  }
}

export default function BitcoinVideos({ videos = [] }) {
  const [activeVideo, setActiveVideo] = useState(videos[0] || null);

  if (videos.length === 0) return null;

  const currentVideo = activeVideo || videos[0];
  const embedSrc = getEmbedUrl(currentVideo?.embedUrl);

  return (
    <section className="bg-black text-white py-16 sm:py-20 px-6">
      <div className="max-w-7xl mx-auto grid grid-cols-1 lg:grid-cols-[2fr_1fr] gap-10 lg:gap-12">
        {/* Player + details */}
        <div>
          <div className="relative aspect-video bg-[#0A0A0A] border border-white/10 overflow-hidden">
            {embedSrc ? (
              <iframe className="w-full h-full" src={`${embedSrc}${embedSrc.includes('?') ? '&' : '?'}autoplay=0&controls=1&modestbranding=1`} title={currentVideo.title} allowFullScreen />
            ) : (
              <div className="w-full h-full flex items-center justify-center">
                <p className="text-gray-400 text-sm text-center px-6">Invalid video URL. Please check the embed URL in the dashboard.</p>
              </div>
            )}
          </div>

          <div className="mt-6 sm:mt-8">
            <div className="flex items-center gap-2 mb-3 text-yellow-500 text-xs font-medium uppercase tracking-widest">
              <Layers className="w-3.5 h-3.5" />
              {currentVideo.category}
            </div>
            <h2 className="text-xl sm:text-2xl lg:text-3xl font-semibold leading-tight mb-4">{currentVideo.title}</h2>

            <div className="flex items-center gap-2 mb-5 text-gray-400 text-sm">
              <Clock className="w-4 h-4 text-yellow-500" />
              <span>{currentVideo.duration}</span>
            </div>

            {currentVideo.description && (
              <p className="text-gray-400 leading-relaxed max-w-2xl">{currentVideo.description}</p>
            )}
          </div>
        </div>

        {/* Curriculum */}
        <div>
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-sm font-semibold uppercase tracking-widest text-gray-400">Curriculum</h3>
            <span className="text-xs text-gray-500">{videos.length} {videos.length === 1 ? 'module' : 'modules'}</span>
          </div>

          <div className="flex lg:flex-col gap-3 lg:gap-2 overflow-x-auto lg:overflow-visible pb-2 lg:pb-0 -mx-6 lg:mx-0 px-6 lg:px-0 [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
            {videos.map((video) => {
              const isActive = currentVideo.id === video.id;
              return (
                <button
                  key={video.id}
                  onClick={() => setActiveVideo(video)}
                  className={`group flex-shrink-0 w-[240px] lg:w-full flex items-center gap-3 p-3 rounded-xl border text-left transition-colors duration-200 ${
                    isActive ? 'bg-yellow-500/10 border-yellow-500/40' : 'bg-[#0A0A0A] border-white/5 hover:border-white/15'
                  }`}
                >
                  <div className="relative w-16 h-16 flex-shrink-0 rounded-lg overflow-hidden bg-zinc-900">
                    {video.thumbnailUrl && (
                      <Image
                        src={video.thumbnailUrl}
                        alt=""
                        fill
                        sizes="64px"
                        className={`object-cover transition-opacity duration-300 ${isActive ? 'opacity-100' : 'opacity-70 group-hover:opacity-100'}`}
                      />
                    )}
                    {!isActive && (
                      <div className="absolute inset-0 flex items-center justify-center bg-black/20 group-hover:bg-black/0 transition-colors">
                        <Play size={16} className="text-white/80" fill="currentColor" />
                      </div>
                    )}
                  </div>
                  <div className="min-w-0">
                    <h4 className={`text-sm font-medium leading-snug line-clamp-2 ${isActive ? 'text-yellow-500' : 'text-gray-200'}`}>{video.title}</h4>
                    <div className="flex items-center gap-1.5 text-xs text-gray-500 mt-1">
                      <Clock className="w-3 h-3" />
                      {video.duration}
                    </div>
                  </div>
                </button>
              );
            })}
          </div>
        </div>
      </div>
    </section>
  );
}
