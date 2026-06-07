import * as React from "react";

import { cn } from "@/lib/utils";

const functionalGlyphs = {
  "arrow-left": "←",
  "arrow-right": "→",
  "arrow-up-right": "↗",
  check: "✓",
  "check-circle": "✓",
  circle: "•",
  dot: "•",
  close: "×",
  expand: "↗",
  "external-link": "↗",
  "grip-vertical": "⋮",
  menu: "☰",
  "more-horizontal": "…",
  "panel-left": "☰",
  search: "⌕",
} as const;

const pathGlyphs = {
  "chevron-down": "M5 7.5l5 5 5-5",
  "chevron-left": "M12.5 5l-5 5 5 5",
  "chevron-right": "M7.5 5l5 5-5 5",
  "chevron-up": "M5 12.5l5-5 5 5",
} as const;

type FunctionalGlyphName = keyof typeof functionalGlyphs;
type PathGlyphName = keyof typeof pathGlyphs;

export interface MinimalGlyphProps extends React.HTMLAttributes<HTMLSpanElement> {
  name: string;
}

function isFunctionalGlyph(name: string): name is FunctionalGlyphName {
  return name in functionalGlyphs;
}

function isPathGlyph(name: string): name is PathGlyphName {
  return name in pathGlyphs;
}

export function MinimalGlyph({ name, className, ...props }: MinimalGlyphProps) {
  if (!isFunctionalGlyph(name) && !isPathGlyph(name)) return null;
  const usesPathGlyph = isPathGlyph(name);

  return (
    <span
      aria-hidden="true"
      className={cn(
        "inline-flex shrink-0 select-none items-center justify-center text-current leading-none",
        usesPathGlyph && "h-4 w-4",
        className,
      )}
      {...props}
    >
      {usesPathGlyph ? (
        <svg
          viewBox="0 0 20 20"
          fill="none"
          className="h-full w-full"
          focusable="false"
        >
          <path
            d={pathGlyphs[name]}
            stroke="currentColor"
            strokeWidth="1.8"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
        </svg>
      ) : (
        functionalGlyphs[name]
      )}
    </span>
  );
}
