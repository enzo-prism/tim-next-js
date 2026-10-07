import type { CSSProperties } from "react";
import { activeSeason, buildSeasonScript } from "@/lib/seasonal";
import { SeasonPlay } from "@/components/seasonal/seasonal-client";
import { GhostTooth, ToothGrinPumpkin } from "@/components/seasonal/seasonal-glyphs";

/*
 * October seasonal art. Every piece is decorative, `aria-hidden`, hidden by
 * default (`.ffsc-season-only`), and only revealed by the <html
 * data-ffsc-season> attribute the head script sets before first paint.
 * Pumpkin colors live in seasonal.css and are confined to this folder by
 * scripts/check-minimal-design.mjs. See DESIGN.md "Seasonal Layer (October)".
 */

/**
 * Sets <html data-ffsc-season> before first paint while a season is active
 * (or previewed). Render inside the root layout's <head>.
 */
export function SeasonScript() {
  if (!activeSeason) return null;
  return (
    <script
      id="ffsc-season"
      dangerouslySetInnerHTML={{ __html: buildSeasonScript(activeSeason) }}
    />
  );
}

/** A pale "blue moon" disc with soft craters. */
function MoonDisc({ id }: { id: string }) {
  return (
    <svg viewBox="0 0 100 100" className="block size-full" aria-hidden="true">
      <defs>
        <radialGradient id={id} cx="38%" cy="34%" r="70%">
          <stop offset="0%" stopColor="#ffffff" />
          <stop offset="60%" stopColor="var(--ffsc-moon)" />
          <stop offset="100%" stopColor="var(--ffsc-moon-shade)" />
        </radialGradient>
      </defs>
      <circle cx="50" cy="50" r="48" fill={`url(#${id})`} />
      <g fill="var(--ffsc-moon-shade)" opacity="0.55">
        <circle cx="30" cy="58" r="8" />
        <circle cx="50" cy="76" r="5" />
        <circle cx="62" cy="34" r="4" />
      </g>
    </svg>
  );
}

/**
 * Where the moon sits relative to the dentist photo: peeking over its
 * top-right corner on desktop, tucked behind the thumbnail on phones.
 * Shared with the client bats so they lift off the moon's face.
 */
export const heroMoonBox = "-right-6 -top-6 size-12 lg:-right-16 lg:-top-16 lg:size-28";

/** Blue moon rising behind the dentist photo. Render before the photo. */
export function HeroMoon() {
  return (
    <div aria-hidden="true" className={`ffsc-season-only ffsc-moon pointer-events-none absolute ${heroMoonBox}`}>
      <MoonDisc id="ffsc-hero-moon" />
    </div>
  );
}

/** A ghost-tooth peeking out from behind the dentist photo (desktop only). */
export function HeroGhost() {
  return (
    <div aria-hidden="true" className="ffsc-season-only pointer-events-none absolute -left-12 bottom-14 w-16">
      <div className="hidden lg:block">
        <GhostTooth className="ffsc-ghost-peek block w-full" />
      </div>
    </div>
  );
}

/** "Happy Halloween" eyebrow above the hero headline. */
export function SeasonalGreeting() {
  return (
    <div className="ffsc-season-only mb-4">
      <p className="inline-flex items-center gap-2 rounded-full border border-border bg-card py-1 pl-1.5 pr-3 text-xs font-bold uppercase tracking-[0.08em] text-accent-foreground">
        <ToothGrinPumpkin className="h-5 w-5 shrink-0" />
        Happy Halloween from Los Gatos
      </p>
    </div>
  );
}

/** Small four-point star for the night-sky band. */
function Sparkle({ style }: { style: CSSProperties }) {
  return (
    <svg viewBox="0 0 10 10" aria-hidden="true" className="ffsc-star" style={style}>
      <path d="M5 0 6.1 3.9 10 5 6.1 6.1 5 10 3.9 6.1 0 5 3.9 3.9Z" fill="currentColor" />
    </svg>
  );
}

const stars: CSSProperties[] = [
  { top: "18%", left: "8%", width: 14, animationDelay: "0s" },
  { top: "62%", left: "5%", width: 9, animationDelay: "0.6s" },
  { top: "30%", left: "22%", width: 8, animationDelay: "1s" },
  { top: "78%", left: "17%", width: 11, animationDelay: "0.3s" },
  { top: "22%", right: "24%", width: 9, animationDelay: "0.8s" },
  { top: "70%", right: "9%", width: 13, animationDelay: "0.2s" },
  { top: "46%", right: "18%", width: 8, animationDelay: "1.1s" },
];

/** Crescent moon, stars, and a sleepy bat for the blue call-to-action band. */
export function NightSky() {
  return (
    <SeasonPlay className="ffsc-season-only ffsc-sky pointer-events-none absolute inset-0" ariaHidden>
      <svg
        viewBox="0 0 40 40"
        aria-hidden="true"
        className="ffsc-crescent absolute right-5 top-5 size-10 sm:right-12 sm:top-8 sm:size-14"
      >
        <path d="M27 4.5A16 16 0 1 0 35.5 31 13.2 13.2 0 1 1 27 4.5Z" fill="var(--ffsc-moon)" />
      </svg>
      {stars.map((style, index) => (
        <Sparkle key={index} style={style} />
      ))}
    </SeasonPlay>
  );
}

/** 404 seasonal art: the ghost-tooth floating in front of a blue moon. */
export function SeasonalNotFoundArt() {
  return (
    <div aria-hidden="true" className="ffsc-season-only mb-6">
      <div className="ffsc-porthole relative mx-auto grid size-36 place-items-center overflow-hidden rounded-full ring-4 ring-card">
        <GhostTooth className="ffsc-ghost-float relative w-16" />
      </div>
    </div>
  );
}

/** One-line seasonal aside for the 404 page. */
export function SeasonalNotFoundLine() {
  return (
    <p className="ffsc-season-only mb-4 text-sm font-semibold uppercase tracking-[0.08em] text-primary">
      Boo! This page floated away.
    </p>
  );
}
