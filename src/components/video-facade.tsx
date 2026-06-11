"use client";

import { useState } from "react";
import Image, { type StaticImageData } from "next/image";
import { MinimalGlyph } from "@/components/ui/minimal-glyph";
import { cn } from "@/lib/utils";

interface VideoFacadeProps {
  videoSrc: string;
  title: string;
  poster: StaticImageData | string;
  posterAlt: string;
  posterSizes?: string;
  posterPriority?: boolean;
  playLabel?: string;
  className?: string;
}

/**
 * Click-to-play facade for embedded video players. The heavy player iframe
 * (and its video stream) is only loaded after the visitor opts in, so it
 * never competes with initial page load.
 */
export default function VideoFacade({
  videoSrc,
  title,
  poster,
  posterAlt,
  posterSizes,
  posterPriority = false,
  playLabel = "Play video",
  className,
}: VideoFacadeProps) {
  const [isPlaying, setIsPlaying] = useState(false);

  if (isPlaying) {
    return (
      <iframe
        src={videoSrc}
        className={cn("absolute inset-0 h-full w-full border-0", className)}
        allow="autoplay; fullscreen; picture-in-picture; clipboard-write"
        title={title}
      />
    );
  }

  return (
    <button
      type="button"
      onClick={() => setIsPlaying(true)}
      aria-label={`${playLabel}: ${title}`}
      className={cn(
        "group absolute inset-0 h-full w-full cursor-pointer focus:outline-none focus-visible:ring-2 focus-visible:ring-ring",
        className,
      )}
    >
      <Image
        src={poster}
        alt={posterAlt}
        fill
        sizes={posterSizes}
        priority={posterPriority}
        className="object-cover"
      />
      <span className="absolute inset-0 bg-accent-foreground/20 transition-colors group-hover:bg-accent-foreground/30" />
      <span className="absolute inset-0 flex flex-col items-center justify-center gap-3">
        <span className="flex h-14 w-14 items-center justify-center rounded-full bg-white/95 text-primary shadow-sm ring-1 ring-border transition-transform group-hover:scale-105">
          <MinimalGlyph name="play" className="h-6 w-6 translate-x-0.5" />
        </span>
        <span className="rounded-full bg-white/95 px-3 py-1 text-xs font-semibold uppercase tracking-[0.08em] text-primary shadow-sm">
          {playLabel}
        </span>
      </span>
    </button>
  );
}
