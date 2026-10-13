"use client";

import { useEffect, useRef, useState, type CSSProperties } from "react";
import { ToothPerson } from "@/components/brand/pinwheel";
import { MinimalGlyph } from "@/components/ui/minimal-glyph";
import { TrackedExternalLink } from "@/components/tracking/tracked-links";
import { cn } from "@/lib/utils";

export type InstagramReel = {
  /** Full reel permalink, e.g. https://www.instagram.com/reel/ID/ */
  permalink: string;
  /** Short name used in the play button label. */
  label: string;
};

type InstagramEmbedSectionProps = {
  reels: InstagramReel[];
  className?: string;
  /** Tracking location for the "watch on Instagram" links. */
  location?: string;
};

declare global {
  interface Window {
    instgrm?: { Embeds?: { process?: () => void } };
  }
}

/** Load Instagram's embed script once, then upgrade any reel blockquotes. */
function loadInstagram() {
  if (document.getElementById("instagram-embed-script")) {
    window.instgrm?.Embeds?.process?.();
    return;
  }
  const script = document.createElement("script");
  script.id = "instagram-embed-script";
  script.src = "https://www.instagram.com/embed.js";
  script.async = true;
  script.onload = () => window.instgrm?.Embeds?.process?.();
  document.body.appendChild(script);
}

const posterTones = [
  { wash: "bg-lime-wash", tooth: "var(--ff-lime)", friend: "var(--ff-periwinkle)" },
  { wash: "bg-periwinkle-wash", tooth: "var(--ff-periwinkle)", friend: "var(--ff-blush)" },
];

function Reel({ reel, index, location }: { reel: InstagramReel; index: number; location: string }) {
  const [loaded, setLoaded] = useState(false);
  const frameRef = useRef<HTMLDivElement | null>(null);
  const tone = posterTones[index % posterTones.length];

  useEffect(() => {
    if (!loaded) return;
    loadInstagram();
    frameRef.current?.focus({ preventScroll: true });
  }, [loaded]);

  return (
    <li className="ff-straighten mx-auto w-full max-w-[22rem]" style={{ "--ff-tilt": index % 2 ? "3deg" : "-3deg", "--i": index } as CSSProperties}>
      <div className="rounded-3xl bg-night p-2 shadow-float">
        <div
          ref={frameRef}
          tabIndex={loaded ? -1 : undefined}
          aria-label={loaded ? `${reel.label} (Instagram reel)` : undefined}
          className="relative overflow-clip rounded-2xl bg-white focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-periwinkle"
        >
          {loaded ? (
            <blockquote
              className="instagram-media m-0! w-full! max-w-none! rounded-none! border-0! shadow-none!"
              data-instgrm-captioned=""
              data-instgrm-permalink={`${reel.permalink}?utm_source=ig_embed&utm_campaign=loading`}
              data-instgrm-version="14"
            >
              <TrackedExternalLink
                href={reel.permalink}
                target="_blank"
                rel="noreferrer"
                kind="social"
                provider="instagram"
                location={location}
                className="block p-6 text-sm font-semibold text-cobalt"
              >
                View this post on Instagram
              </TrackedExternalLink>
            </blockquote>
          ) : (
            <div className={cn("relative flex aspect-[4/3] flex-col p-5 md:aspect-[9/14] md:p-6", tone.wash)}>
              <div className="flex items-center justify-between gap-3">
                <span className="text-xs font-bold uppercase tracking-[0.14em] text-ink-soft">@famfirstsmile</span>
                <span className="rounded-full bg-white px-2.5 py-1 text-[0.7rem] font-bold uppercase tracking-[0.1em] text-ink ring-1 ring-ink/5">
                  Reel {index + 1}
                </span>
              </div>
              <p className="relative z-[1] mt-4 max-w-[11rem] font-display text-xl md:mt-5 md:max-w-[13rem] md:text-2xl font-semibold leading-tight text-ink">{reel.label}</p>
              <div aria-hidden="true" className="pointer-events-none absolute bottom-0 right-4 flex h-[58%] items-end justify-center gap-2 md:inset-x-0 md:right-auto md:h-[42%] md:gap-3">
                <ToothPerson color={tone.tooth} className="h-full w-auto -rotate-[5deg]" />
                <ToothPerson color={tone.friend} className="h-[62%] w-auto rotate-[8deg]" />
              </div>
              <button
                type="button"
                onClick={() => setLoaded(true)}
                className="group relative z-[1] mt-auto flex w-fit md:mt-6 items-center gap-3 rounded-full bg-ink py-2 pl-2 pr-5 text-sm font-semibold text-white shadow-float transition-colors hover:bg-cobalt focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
              >
                <span aria-hidden="true" className="grid size-9 place-items-center rounded-full bg-white text-ink transition-transform duration-300 group-hover:scale-110 motion-reduce:transition-none">
                  <MinimalGlyph name="play" className="size-4" />
                </span>
                <span>
                  Play reel<span className="sr-only"> {index + 1}: {reel.label}</span>
                </span>
              </button>
            </div>
          )}
        </div>
      </div>
      <p className="mt-3 flex items-center justify-between gap-3 px-1 text-xs text-ink-soft">
        <span>{loaded ? "Playing from Instagram" : "Loads from Instagram"}</span>
        <TrackedExternalLink
          href={reel.permalink}
          target="_blank"
          rel="noreferrer"
          kind="social"
          provider="instagram"
          location={location}
          className="ff-link inline-flex min-h-11 items-center"
        >
          Watch on Instagram<span className="sr-only"> (opens in a new tab)</span>
        </TrackedExternalLink>
      </p>
    </li>
  );
}

/**
 * Instagram reels behind a click-to-load poster. Instagram's embed script and
 * player only load after someone presses play, so the page stays light and
 * no third-party content loads on its own.
 */
export default function InstagramEmbedSection({ reels, className, location = "babys_first_visit_embed" }: InstagramEmbedSectionProps) {
  return (
    <ul className={cn("grid gap-8 md:grid-cols-2 md:gap-6", className)}>
      {reels.map((reel, index) => (
        <Reel key={reel.permalink} reel={reel} index={index} location={location} />
      ))}
    </ul>
  );
}
