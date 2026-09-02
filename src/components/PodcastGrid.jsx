'use client';

import { useState } from 'react';
import Image from 'next/image';
import { Play, Mic } from 'lucide-react';
import { youtubeId } from '@/lib/schema';

// Plays a YouTube-hosted episode inline via the standard embed iframe,
// instead of sending the reader away to youtube.com. Falls back to the
// thumbnail (no id extractable) rather than breaking.
function InlinePlayer({ videoId, title }) {
  return (
    <div className="relative aspect-video bg-black">
      <iframe
        src={`https://www.youtube.com/embed/${videoId}?autoplay=1&rel=0`}
        title={title}
        allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
        allowFullScreen
        className="absolute inset-0 w-full h-full border-0"
      />
    </div>
  );
}

export function FeaturedEpisode({ episode }) {
  const [playing, setPlaying] = useState(false);
  const videoId = youtubeId(episode.url);

  if (playing && videoId) {
    return (
      <div className="bg-[#0A0A0A] border border-white/5 overflow-hidden mb-14">
        <InlinePlayer videoId={videoId} title={episode.title} />
        <div className="p-6 md:p-8">
          <span className="inline-block w-fit bg-yellow-500 text-black text-[10px] font-medium px-3 py-1 uppercase tracking-widest mb-3">
            Latest{episode.episodeNumber ? ` · Episode ${episode.episodeNumber}` : ''}
          </span>
          <h2 className="text-2xl font-semibold leading-snug">{episode.title}</h2>
        </div>
      </div>
    );
  }

  return (
    <button
      type="button"
      onClick={() => (videoId ? setPlaying(true) : window.open(episode.url, '_blank', 'noopener,noreferrer'))}
      className="group grid grid-cols-1 md:grid-cols-2 bg-[#0A0A0A] border border-white/5 overflow-hidden mb-14 hover:border-yellow-500/50 transition-all duration-500 text-left w-full"
    >
      <div className="relative aspect-square md:aspect-auto bg-black">
        {episode.image ? (
          <Image
            src={episode.image}
            alt={episode.title}
            fill
            sizes="(min-width: 768px) 50vw, 100vw"
            className="object-cover opacity-85 group-hover:opacity-100 transition-opacity"
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-yellow-500/10 to-transparent">
            <Mic className="text-yellow-500/40" size={56} />
          </div>
        )}
        <div className="absolute inset-0 flex items-center justify-center">
          <div className="w-16 h-16 rounded-full bg-yellow-500 flex items-center justify-center group-hover:scale-110 transition-transform">
            <Play className="text-black ml-1" size={26} fill="currentColor" />
          </div>
        </div>
      </div>
      <div className="p-8 md:p-10 flex flex-col justify-center">
        <span className="inline-block w-fit bg-yellow-500 text-black text-[10px] font-medium px-3 py-1 uppercase tracking-widest mb-4">
          Latest{episode.episodeNumber ? ` · Episode ${episode.episodeNumber}` : ''}
        </span>
        <h2 className="text-2xl font-semibold leading-snug mb-3 group-hover:text-yellow-500 transition-colors">{episode.title}</h2>
        {episode.description && (
          <p className="text-gray-400 text-sm leading-relaxed mb-5 line-clamp-3">{episode.description}</p>
        )}
        {episode.date && <span className="text-xs text-gray-400">{episode.date}</span>}
      </div>
    </button>
  );
}

export function EpisodeGrid({ episodes }) {
  const [playingId, setPlayingId] = useState(null);

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
      {episodes.map((ep) => {
        const videoId = youtubeId(ep.url);
        const isPlaying = playingId === ep.id && videoId;

        if (isPlaying) {
          return (
            <div key={ep.id} className="bg-[#0A0A0A] border border-yellow-500/50 overflow-hidden">
              <InlinePlayer videoId={videoId} title={ep.title} />
              <div className="p-5">
                <h3 className="font-medium mt-1 line-clamp-2 leading-snug">{ep.title}</h3>
              </div>
            </div>
          );
        }

        return (
          <button
            key={ep.id}
            type="button"
            onClick={() => (videoId ? setPlayingId(ep.id) : window.open(ep.url, '_blank', 'noopener,noreferrer'))}
            className="group bg-[#0A0A0A] border border-white/5 overflow-hidden hover:border-yellow-500/50 transition-all duration-500 text-left"
          >
            <div className="relative aspect-video bg-black">
              {ep.image ? (
                <Image
                  src={ep.image}
                  alt={ep.title}
                  fill
                  sizes="(min-width: 1024px) 33vw, (min-width: 640px) 50vw, 100vw"
                  className="object-cover opacity-75 group-hover:opacity-95 transition-opacity"
                />
              ) : (
                <div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-yellow-500/10 to-transparent">
                  <Mic className="text-yellow-500/40" size={32} />
                </div>
              )}
              <div className="absolute inset-0 flex items-center justify-center">
                <div className="w-11 h-11 rounded-full bg-black/60 backdrop-blur-sm flex items-center justify-center group-hover:bg-yellow-500 transition-colors">
                  <Play size={16} className="text-white group-hover:text-black ml-0.5" fill="currentColor" />
                </div>
              </div>
              {ep.episodeNumber && (
                <div className="absolute bottom-0 left-0">
                  <span className="inline-block bg-yellow-500 text-black text-[10px] font-medium px-3 py-1 uppercase tracking-widest">
                    Episode {ep.episodeNumber}
                  </span>
                </div>
              )}
            </div>
            <div className="p-5">
              <h3 className="font-medium mt-1 group-hover:text-yellow-500 transition-colors line-clamp-2 leading-snug">{ep.title}</h3>
            </div>
          </button>
        );
      })}
    </div>
  );
}
