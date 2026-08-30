"use client";

import { useEffect, useRef, useState } from "react";
import Image, { type StaticImageData } from "next/image";
import { MinimalGlyph } from "@/components/ui/minimal-glyph";
import { cn } from "@/lib/utils";

interface VideoFacadeProps {
  videoSrc: string;
  title: string;
  poster: StaticImageData | string;
  posterAlt: string;
  posterSizes?: string;
  posterQuality?: number;
  posterPriority?: boolean;
  posterFetchPriority?: "high" | "low" | "auto";
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
  posterQuality = 70,
  posterPriority = false,
  posterFetchPriority,
  playLabel = "Play video",
  className,
}: VideoFacadeProps) {
  const [isPlaying, setIsPlaying] = useState(false);
  const iframeRef = useRef<HTMLIFrameElement>(null);
  const playButtonRef = useRef<HTMLButtonElement>(null);
  const shouldRestoreFocusRef = useRef(false);

  useEffect(() => {
    if (isPlaying) {
      iframeRef.current?.focus();
      return;
    }

    if (shouldRestoreFocusRef.current) {
      shouldRestoreFocusRef.current = false;
      playButtonRef.current?.focus();
    }
  }, [isPlaying]);

  if (isPlaying) {
    return (
      <>
        <iframe
          ref={iframeRef}
          src={videoSrc}
          className={cn("absolute inset-0 h-full w-full border-0", className)}
          allow="autoplay; fullscreen; picture-in-picture; clipboard-write"
          title={title}
        />
        <button
          type="button"
          aria-label={`Close video: ${title}`}
          className="absolute right-3 top-3 z-10 inline-flex h-10 min-w-10 items-center justify-center gap-2 rounded-md bg-background/95 px-3 text-sm font-semibold text-primary shadow-sm ring-1 ring-border focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 forced-colors:focus-visible:outline-2 forced-colors:focus-visible:outline-offset-2 forced-colors:focus-visible:outline-[CanvasText]"
          onClick={() => {
            shouldRestoreFocusRef.current = true;
            setIsPlaying(false);
          }}
        >
          <MinimalGlyph name="close" className="h-4 w-4" />
          <span>Close</span>
        </button>
      </>
    );
  }

  return (
    <button
      ref={playButtonRef}
      type="button"
      onClick={() => setIsPlaying(true)}
      aria-label={`${playLabel}: ${title}`}
      className={cn(
        "group absolute inset-0 h-full w-full cursor-pointer focus:outline-none focus-visible:ring-2 focus-visible:ring-ring forced-colors:focus-visible:outline-2 forced-colors:focus-visible:outline-offset-[-2px] forced-colors:focus-visible:outline-[CanvasText]",
        className,
      )}
    >
      <Image
        src={poster}
        alt={posterAlt}
        fill
        sizes={posterSizes}
        quality={posterQuality}
        priority={posterPriority}
        fetchPriority={posterFetchPriority}
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
