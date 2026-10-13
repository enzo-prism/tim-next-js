import type { CSSProperties, ReactNode } from "react";
import { cn } from "@/lib/utils";
import { TOOTH_BODY_PATH, TOOTH_HEAD } from "@/components/brand/tooth-shapes";

/*
 * Small vector scenes built from the logo's tooth-people, for the patient
 * guides. Everything is decorative (aria-hidden) and drawn in brand colors.
 */

const C = {
  ink: "var(--ff-ink)",
  paper: "var(--ff-paper)",
  periwinkle: "var(--ff-periwinkle)",
  periwinkleWash: "var(--ff-periwinkle-wash)",
  blush: "var(--ff-blush)",
  blushWash: "var(--ff-blush-wash)",
  lime: "var(--ff-lime)",
  limeWash: "var(--ff-lime-wash)",
  cloud: "var(--ff-cloud)",
  cobalt: "var(--ff-cobalt)",
  white: "#ffffff",
} as const;

/** A tooth-person standing with its feet at (x, y). */
function Tooth({
  x,
  y,
  scale = 1,
  rotate = 0,
  color,
  className,
  style,
}: {
  x: number;
  y: number;
  scale?: number;
  rotate?: number;
  color: string;
  className?: string;
  style?: CSSProperties;
}) {
  return (
    <g transform={`translate(${x} ${y}) rotate(${rotate}) scale(${scale}) translate(-50 -119)`} className={className} style={style}>
      <g fill={color} style={{ mixBlendMode: "multiply" }}>
        <path d={TOOTH_BODY_PATH} />
        <circle cx={TOOTH_HEAD.cx} cy={TOOTH_HEAD.cy} r={TOOTH_HEAD.r} />
      </g>
    </g>
  );
}

function Art({ viewBox, className, children }: { viewBox: string; className?: string; children: ReactNode }) {
  return (
    <svg viewBox={viewBox} className={cn("block h-auto w-full", className)} aria-hidden="true" focusable="false" style={{ isolation: "isolate" }}>
      {children}
    </svg>
  );
}

function Shadow({ cx, cy, rx }: { cx: number; cy: number; rx: number }) {
  return <ellipse cx={cx} cy={cy} rx={rx} ry={rx * 0.1} fill={C.ink} opacity={0.07} />;
}

function Bubble({ cx, cy, r }: { cx: number; cy: number; r: number }) {
  return (
    <g>
      <circle cx={cx} cy={cy} r={r} fill={C.white} stroke={C.ink} strokeOpacity={0.14} strokeWidth={1.5} />
      <circle cx={cx - r * 0.35} cy={cy - r * 0.35} r={r * 0.22} fill={C.ink} opacity={0.08} />
    </g>
  );
}

/** A tooth-person and a toothbrush, with a few bubbles. */
export function BrushingArt({ className }: { className?: string }) {
  return (
    <Art viewBox="0 0 320 240" className={className}>
      <Shadow cx={150} cy={216} rx={86} />
      <Tooth x={136} y={214} scale={1.12} rotate={-5} color={C.periwinkle} />
      <g transform="translate(236 84) rotate(26)">
        <rect x={-8} y={26} width={16} height={124} rx={8} fill={C.blush} />
        <rect x={-6} y={4} width={12} height={30} rx={5} fill={C.blush} />
        <rect x={-11} y={-34} width={22} height={44} rx={8} fill={C.white} stroke={C.ink} strokeWidth={2.5} />
        {[-26, -16, -6, 4].map((y) => (
          <line key={y} x1={-12} x2={-26} y1={y} y2={y} stroke={C.ink} strokeWidth={3} strokeLinecap="round" />
        ))}
        <path d="M-30 -34c-8 4-8 14 0 16c-8 4-6 14 2 14c-6 6 0 14 8 10" fill="none" stroke={C.lime} strokeWidth={9} strokeLinecap="round" strokeLinejoin="round" />
      </g>
      <Bubble cx={74} cy={72} r={11} />
      <Bubble cx={52} cy={112} r={6} />
      <Bubble cx={92} cy={40} r={5} />
      <Bubble cx={214} cy={196} r={8} />
      <Bubble cx={266} cy={182} r={5} />
    </Art>
  );
}

/** Two tooth-people with a strand of floss gliding between them. */
export function FlossingArt({ className }: { className?: string }) {
  return (
    <Art viewBox="0 0 320 240" className={className}>
      <Shadow cx={162} cy={216} rx={110} />
      <Tooth x={112} y={214} scale={1.02} rotate={-7} color={C.blush} />
      <path
        d="M56 176C62 116 118 70 160 112S236 214 292 140"
        fill="none"
        stroke={C.ink}
        strokeWidth={3}
        strokeLinecap="round"
      />
      <Tooth x={212} y={214} scale={1.02} rotate={7} color={C.lime} />
      <g transform="translate(30 168)">
        <rect width={52} height={44} rx={13} fill={C.cloud} />
        <rect y={0} width={52} height={14} rx={7} fill={C.periwinkle} />
        <circle cx={26} cy={7} r={3} fill={C.white} />
      </g>
      <circle cx={292} cy={140} r={5} fill={C.ink} />
    </Art>
  );
}

/** A tooth-person with an apple and a glass of water. */
export function NutritionArt({ className }: { className?: string }) {
  return (
    <Art viewBox="0 0 320 240" className={className}>
      <Shadow cx={168} cy={216} rx={120} />
      <g>
        <path d="M44 136h44l-6 78H50z" fill={C.white} stroke={C.ink} strokeWidth={2.5} strokeLinejoin="round" />
        <path d="M47.2 160h37.6l-4.4 51.5h-31z" fill={C.periwinkle} />
        <path d="M48 160c6 -5 12 5 18 0s12 5 18 0" fill="none" stroke={C.white} strokeWidth={2.5} strokeLinecap="round" />
        <path d="M74 128l14 -34" stroke={C.lime} strokeWidth={7} strokeLinecap="round" />
      </g>
      <Tooth x={152} y={214} scale={1.1} rotate={-3} color={C.lime} />
      <g transform="translate(250 150)">
        <path
          d="M0 -24C-20 -40 -48 -28 -46 4C-44 36 -22 60 -6 56C-2 55 2 55 6 56C22 60 44 36 46 4C48 -28 20 -40 0 -24Z"
          fill={C.blush}
        />
        <path d="M0 -24C2 -34 6 -42 10 -48" stroke={C.ink} strokeWidth={4} strokeLinecap="round" fill="none" />
        <path d="M10 -40c10 -14 26 -14 32 -10c-8 12 -22 16 -32 10z" fill={C.lime} />
        <ellipse cx={-22} cy={-6} rx={6} ry={10} fill={C.white} opacity={0.55} transform="rotate(20 -22 -6)" />
      </g>
    </Art>
  );
}

export type ComfortKind = "blanket" | "water" | "screen" | "hug";

/** Little scenes for the comfort cards on the new-patient guide. */
export function ComfortArt({ kind, className }: { kind: ComfortKind; className?: string }) {
  if (kind === "blanket") {
    return (
      <Art viewBox="0 0 120 120" className={className}>
        <Tooth x={60} y={114} scale={0.64} color={C.periwinkle} />
        <path d="M10 76c14 -10 28 8 50 -2s36 8 50 -2l4 42H6z" fill={C.lime} />
        <path d="M14 92c16 -6 30 6 46 0s30 6 48 -2M12 106c16 -6 32 6 48 0s30 6 50 -2" fill="none" stroke={C.ink} strokeOpacity={0.14} strokeWidth={3} strokeLinecap="round" />
      </Art>
    );
  }
  if (kind === "water") {
    return (
      <Art viewBox="0 0 120 120" className={className}>
        <path d="M70 34l18 -30" stroke={C.blush} strokeWidth={7} strokeLinecap="round" />
        <path d="M30 26h60l-8 88H38z" fill={C.white} stroke={C.ink} strokeWidth={3} strokeLinejoin="round" />
        <path d="M33.5 54h53l-5.5 57H39z" fill={C.periwinkle} />
        <path d="M35 54c8 -6 16 6 25 0s17 6 25 0" fill="none" stroke={C.white} strokeWidth={3} strokeLinecap="round" />
        <circle cx={50} cy={82} r={4} fill={C.white} opacity={0.7} />
        <circle cx={66} cy={96} r={3} fill={C.white} opacity={0.7} />
      </Art>
    );
  }
  if (kind === "screen") {
    return (
      <Art viewBox="0 0 120 120" className={className}>
        <rect x={12} y={20} width={96} height={68} rx={12} fill={C.ink} />
        <rect x={19} y={27} width={82} height={54} rx={7} fill={C.blush} />
        <circle cx={60} cy={54} r={15} fill={C.white} />
        <path d="M55 46l13 8l-13 8z" fill={C.ink} />
        <rect x={54} y={88} width={12} height={12} fill={C.ink} />
        <rect x={38} y={99} width={44} height={8} rx={4} fill={C.ink} />
      </Art>
    );
  }
  return (
    <Art viewBox="0 0 120 120" className={className}>
      <Tooth x={50} y={114} scale={0.62} rotate={-9} color={C.blush} />
      <Tooth x={72} y={114} scale={0.56} rotate={11} color={C.periwinkle} />
    </Art>
  );
}

export type FlossTool = "string" | "pick" | "water";

/** Little drawings of the three flossing tools. */
export function FlossToolArt({ kind, className }: { kind: FlossTool; className?: string }) {
  if (kind === "string") {
    return (
      <Art viewBox="0 0 96 96" className={className}>
        <path d="M48 30C60 18 78 22 84 10" fill="none" stroke={C.ink} strokeWidth={2.5} strokeLinecap="round" />
        <rect x={20} y={30} width={56} height={52} rx={16} fill={C.cloud} />
        <rect x={20} y={30} width={56} height={18} rx={9} fill={C.periwinkle} />
        <circle cx={48} cy={39} r={4} fill={C.white} />
        <rect x={32} y={58} width={32} height={6} rx={3} fill={C.white} opacity={0.8} />
      </Art>
    );
  }
  if (kind === "pick") {
    return (
      <Art viewBox="0 0 96 96" className={className}>
        <g transform="rotate(-28 48 48)">
          <rect x={44} y={40} width={10} height={50} rx={5} fill={C.blush} />
          <path d="M40 14v22a9 9 0 0 0 18 0V14" fill="none" stroke={C.blush} strokeWidth={9} strokeLinecap="round" />
          <line x1={40} y1={16} x2={58} y2={16} stroke={C.ink} strokeWidth={2.5} strokeLinecap="round" />
        </g>
      </Art>
    );
  }
  return (
    <Art viewBox="0 0 96 96" className={className}>
      <rect x={30} y={34} width={30} height={56} rx={14} fill={C.lime} />
      <rect x={38} y={48} width={14} height={8} rx={4} fill={C.white} />
      <path d="M45 34V22l14 -10" fill="none" stroke={C.ink} strokeWidth={4} strokeLinecap="round" strokeLinejoin="round" />
      <path d="M68 8c-3 5-3 8 0 10s6-2 3-10" fill={C.periwinkle} />
      <path d="M76 20c-2 3-2 5 0 6s4-1 2-6" fill={C.periwinkle} />
    </Art>
  );
}

/** The whole family in a row, tallest to smallest (or the reverse). */
export function FamilyRow({ className, sizes = [1, 0.9, 0.72, 0.58] }: { className?: string; sizes?: number[] }) {
  const colors = [C.periwinkle, C.blush, C.lime, C.cloud];
  let x = 0;
  const people = sizes.map((size, index) => {
    const width = 100 * size;
    const person = { x: x + width / 2, size, color: colors[index % colors.length] };
    x += width + 12;
    return person;
  });
  const total = x - 12;
  return (
    <Art viewBox={`-4 -40 ${total + 8} 164`} className={className}>
      {people.map((person, index) => (
        <Tooth key={index} x={person.x} y={120} scale={person.size} color={person.color} />
      ))}
    </Art>
  );
}

/** A single standing tooth-person sized by `scale`, for age cards. */
export function SizedTooth({ color, scale, className }: { color: string; scale: number; className?: string }) {
  return (
    <Art viewBox="-6 -40 112 164" className={className}>
      <Tooth x={50} y={120} scale={scale} color={color} />
    </Art>
  );
}

export const artColors = C;
