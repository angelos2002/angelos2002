"use client";

import { useState } from "react";
import { Icon } from "./ui/Icon";
import { Photo } from "./ui/Photo";

export function VideoFacade({ youtubeId, mp4, poster, title }: { youtubeId?: string; mp4: string; poster: string; title: string }) {
  const [play, setPlay] = useState(false);
  return (
    <div className="glass relative aspect-video overflow-hidden">
      {play ? (
        youtubeId ? (
          <iframe
            className="absolute inset-0 h-full w-full"
            src={`https://www.youtube-nocookie.com/embed/${youtubeId}?autoplay=1&rel=0`}
            title={title}
            allow="autoplay; encrypted-media; picture-in-picture"
            allowFullScreen
          />
        ) : (
          <video className="absolute inset-0 h-full w-full object-cover" src={mp4} poster={poster} controls autoPlay playsInline />
        )
      ) : (
        <button type="button" onClick={() => setPlay(true)} className="group absolute inset-0" aria-label={title}>
          <Photo src={poster} alt="" className="absolute inset-0 h-full w-full" sizes="(min-width: 1024px) 1200px, 100vw" />
          <span className="absolute inset-0 bg-gradient-to-t from-ink/80 via-ink/20 to-transparent" />
          <span className="absolute left-1/2 top-1/2 grid h-20 w-20 -translate-x-1/2 -translate-y-1/2 place-items-center rounded-full bg-flame text-onaccent shadow-glow transition group-hover:scale-110">
            <Icon name="play" className="ml-1 h-8 w-8" fill="currentColor" />
          </span>
        </button>
      )}
    </div>
  );
}
