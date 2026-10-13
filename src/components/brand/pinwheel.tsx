import type { CSSProperties } from "react";
import { cn } from "@/lib/utils";
import { BRAND_TOOTH_COLORS, TOOTH_BODY_PATH, TOOTH_HEAD } from "./tooth-shapes";

type PinwheelProps = {
  className?: string;
  /** "load": the four teeth gather on page load. "view": they gather as the pinwheel scrolls into view. */
  gather?: "load" | "view";
  /** Rotate a quarter turn as the page (or the pinwheel itself) scrolls. */
  spin?: "page" | "view";
  /** Quarter-turn on hover of the closest link/button/.group parent. */
  hover?: boolean;
  /** Multiply blend gives the logo's overlap tint. Turn off on dark backgrounds. */
  blend?: boolean;
  /** Delay (ms) before the load-in gather starts. */
  delay?: number;
  /** Accessible name. Omit for decorative use (the default). */
  title?: string;
};

// Where each tooth's body sits relative to the pinwheel centre, before the
// quarter-turn rotation (taken from the logo artwork).
const BODY_OFFSET = { x: -102.4, y: -103.5 };
// How far (in viewBox units) each tooth starts from its resting spot when gathering.
const GATHER_FROM = [
  { x: -46, y: -40 },
  { x: 40, y: -46 },
  { x: 46, y: 40 },
  { x: -40, y: 46 },
];

/**
 * The logo's four tooth-people hugging in a pinwheel, drawn as vectors so it
 * can move: the teeth gather in, spin with scroll, or turn on hover.
 */
export function Pinwheel({ className, gather, spin, hover, blend = true, delay = 0, title }: PinwheelProps) {
  return (
    <svg
      viewBox="-140 -140 280 280"
      className={cn(
        "ff-pinwheel block",
        gather === "load" && "ff-pinwheel-gather",
        gather === "view" && "ff-pinwheel-gather-view",
        spin === "page" && "ff-spin-page",
        spin === "view" && "ff-spin-scroll",
        hover && "ff-pinwheel-hover",
        className,
      )}
      style={{ "--d": delay, isolation: "isolate" } as CSSProperties}
      role={title ? "img" : undefined}
      aria-hidden={title ? undefined : true}
      focusable="false"
    >
      {title ? <title>{title}</title> : null}
      {BRAND_TOOTH_COLORS.map((color, k) => (
        <g
          key={color}
          className="ff-tooth-wrap"
          style={{ "--k": k, "--gx": `${GATHER_FROM[k].x}px`, "--gy": `${GATHER_FROM[k].y}px` } as CSSProperties}
        >
          <g
            className="ff-tooth"
            transform={`rotate(${k * 90}) translate(${BODY_OFFSET.x} ${BODY_OFFSET.y})`}
            fill={color}
            style={blend ? undefined : { mixBlendMode: "normal" }}
          >
            <path d={TOOTH_BODY_PATH} />
            <circle cx={TOOTH_HEAD.cx} cy={TOOTH_HEAD.cy} r={TOOTH_HEAD.r} />
          </g>
        </g>
      ))}
    </svg>
  );
}

/** One standing tooth-person, for bullets, stickers, and the family line-up. */
export function ToothPerson({
  className,
  color = "var(--ff-periwinkle)",
  style,
}: {
  className?: string;
  color?: string;
  style?: CSSProperties;
}) {
  return (
    <svg viewBox="-2 -37 104 160" className={cn("block", className)} style={style} aria-hidden="true" focusable="false">
      <g fill={color}>
        <path d={TOOTH_BODY_PATH} />
        <circle cx={TOOTH_HEAD.cx} cy={TOOTH_HEAD.cy} r={TOOTH_HEAD.r} />
      </g>
    </svg>
  );
}

/** Four little "heads" in the brand colors, used as an eyebrow mark. */
export function BrandDots({ className }: { className?: string }) {
  return (
    <span aria-hidden="true" className={cn("ff-eyebrow-dots", className)}>
      <i className="bg-periwinkle" />
      <i className="bg-blush" />
      <i className="bg-lime" />
      <i className="bg-cloud ring-1 ring-ink/10" />
    </span>
  );
}
