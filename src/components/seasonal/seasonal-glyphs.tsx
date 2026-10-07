import type { CSSProperties } from "react";

/*
 * Shared seasonal SVGs, safe to render from server and client components.
 * Colors come from the custom properties in seasonal.css.
 */

/** Friendly ghost-tooth: a molar crown whose roots become a ghost's hem. */
export function GhostTooth({ className = "" }: { className?: string }) {
  return (
    <svg viewBox="0 0 64 72" fill="none" aria-hidden="true" className={className}>
      <path
        d="M14 25c0-10.5 8-17 16-14.6 1 .3 1.6.6 2 .6s1-.3 2-.6C42 8 50 14.5 50 25v32.6c0 1.3-1.5 2-2.5 1.2l-3.3-2.7a2 2 0 0 0-2.5 0l-3.4 2.8a2 2 0 0 1-2.5 0l-3.5-2.8a2 2 0 0 0-2.5 0l-3.5 2.8a2 2 0 0 1-2.5 0l-3.4-2.8a2 2 0 0 0-2.5 0l-3.3 2.7c-1 .8-2.6.1-2.6-1.2V25Z"
        fill="#ffffff"
        stroke="var(--ffsc-ghost-line)"
        strokeWidth="2"
        strokeLinejoin="round"
      />
      <g className="ffsc-ghost-eyes">
        <ellipse cx="25.5" cy="31" rx="2.6" ry="3.4" fill="var(--ffsc-night-ink)" />
        <ellipse cx="38.5" cy="31" rx="2.6" ry="3.4" fill="var(--ffsc-night-ink)" />
      </g>
      <path d="M27.5 39.5c2.6 2.6 6.4 2.6 9 0" stroke="var(--ffsc-night-ink)" strokeWidth="2" strokeLinecap="round" />
      <circle cx="20.5" cy="37.5" r="2.6" fill="var(--ffsc-ghost-cheek)" />
      <circle cx="43.5" cy="37.5" r="2.6" fill="var(--ffsc-ghost-cheek)" />
    </svg>
  );
}

/** A jack-o'-lantern carved with a perfect, healthy smile. */
export function ToothGrinPumpkin({ className = "", style }: { className?: string; style?: CSSProperties }) {
  return (
    <svg viewBox="0 0 48 44" aria-hidden="true" className={className} style={style}>
      <path
        d="M22.4 9.6c-.2-3.3 1-6 3.6-7.6.9-.5 1.9.4 1.4 1.3-1 1.8-1.4 3.8-1.1 6.3Z"
        fill="var(--ffsc-pumpkin-stem)"
      />
      <ellipse cx="15" cy="26" rx="11" ry="14" fill="var(--ffsc-pumpkin-deep)" />
      <ellipse cx="33" cy="26" rx="11" ry="14" fill="var(--ffsc-pumpkin-deep)" />
      <ellipse cx="24" cy="26" rx="11.5" ry="15" fill="var(--ffsc-pumpkin)" />
      <path d="M24 11.5v29" stroke="var(--ffsc-pumpkin-deep)" strokeWidth="1.2" opacity="0.55" />
      <g className="ffsc-pumpkin-face">
        <path d="M14.6 23.6 18 18.4l3.4 5.2Z" />
        <path d="M26.6 23.6 30 18.4l3.4 5.2Z" />
        <path d="M13.5 28.2Q24 38.4 34.5 28.2 24 32.4 13.5 28.2Z" />
      </g>
      <g fill="#ffffff">
        <rect x="17.4" y="29.7" width="2.9" height="2.6" rx="0.7" />
        <rect x="20.9" y="30.2" width="2.9" height="2.8" rx="0.7" />
        <rect x="24.4" y="30.2" width="2.9" height="2.8" rx="0.7" />
        <rect x="27.9" y="29.7" width="2.9" height="2.6" rx="0.7" />
      </g>
    </svg>
  );
}

