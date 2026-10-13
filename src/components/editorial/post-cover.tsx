import type { ReactNode } from "react";
import { cn } from "@/lib/utils";
import { TOOTH_BODY_PATH, TOOTH_HEAD } from "@/components/brand/tooth-shapes";
import { getAllBlogPosts } from "@/content/blog";
import { getEditorialTheme, seedFromSlug, type CoverKind } from "./editorial-theme";

/*
 * Generated cover art for blog articles (there are no article photos): a soft
 * category-colored panel with a small tooth-people scene. Children's articles
 * get lime families, prevention gets bubbles on a cloud wash, alignment lines
 * three friends up on blush, jaw pain gets a sleepy moon, and sports jumps.
 * Figures hop on hover of the closest `.group` (motion-safe only).
 */

const C = {
  periwinkle: "var(--ff-periwinkle)",
  blush: "var(--ff-blush)",
  lime: "var(--ff-lime)",
  cloud: "var(--ff-cloud)",
  ink: "var(--ff-ink)",
};

const washVar: Record<CoverKind, string> = {
  kids: "var(--ff-lime-wash)",
  prevention: "var(--ff-cloud-wash)",
  alignment: "var(--ff-blush-wash)",
  jaw: "var(--ff-periwinkle-wash)",
  sports: "var(--ff-periwinkle-wash)",
};

const hop =
  "transition-[translate,rotate] duration-500 ease-[var(--ease-spring)] [transform-box:fill-box] [transform-origin:50%_100%] motion-reduce:transition-none";

/** A standing tooth-person with its feet at (x, y). */
function Figure({
  x,
  y = 236,
  s = 1,
  r = 0,
  fill,
  className,
  shine = false,
}: {
  x: number;
  y?: number;
  s?: number;
  r?: number;
  fill: string;
  className?: string;
  shine?: boolean;
}) {
  return (
    <g transform={`translate(${x} ${y})`}>
      <g className={cn(hop, className)}>
        <g transform={`rotate(${r}) scale(${s}) translate(-50 -120)`} fill={fill}>
          <path d={TOOTH_BODY_PATH} />
          <circle cx={TOOTH_HEAD.cx} cy={TOOTH_HEAD.cy} r={TOOTH_HEAD.r} />
          {shine ? (
            <path d="M19 28C20 18 27 12 38 10.5" fill="none" stroke="#fff" strokeWidth={7} strokeLinecap="round" opacity={0.85} />
          ) : null}
        </g>
      </g>
    </g>
  );
}

function Ball({ cx, cy, r, fill, seam, className }: { cx: number; cy: number; r: number; fill: string; seam: string; className?: string }) {
  return (
    <g className={cn(hop, "[transform-origin:50%_50%]", className)}>
      <circle cx={cx} cy={cy} r={r} fill={fill} />
      <path
        d={`M${cx - r * 0.92} ${cy - r * 0.2}C${cx - r * 0.3} ${cy + r * 0.25} ${cx + r * 0.35} ${cy + r * 0.25} ${cx + r * 0.92} ${cy - r * 0.25}`}
        fill="none"
        stroke={seam}
        strokeWidth={3}
        strokeLinecap="round"
      />
    </g>
  );
}

function Bubble({ cx, cy, r, stroke, className }: { cx: number; cy: number; r: number; stroke: string; className?: string }) {
  return (
    <circle
      cx={cx}
      cy={cy}
      r={r}
      fill="#fff"
      stroke={stroke}
      strokeWidth={3}
      className={cn("transition-[translate] duration-700 ease-[var(--ease-out-soft)] motion-reduce:transition-none", className)}
    />
  );
}

function Scene({ kind, variant, white }: { kind: CoverKind; variant: number; white: boolean }) {
  // On a white surface the "light" accents use the category wash instead of white.
  const light = white ? washVar[kind] : "#fff";
  const hill = <ellipse cx={200} cy={294} rx={300} ry={72} fill={light} fillOpacity={white ? 1 : 0.7} />;
  let art: ReactNode;

  switch (kind) {
    case "kids": {
      const v = variant % 4;
      if (v === 0) {
        art = (
          <>
            <circle cx={318} cy={66} r={70} fill={C.lime} fillOpacity={0.45} />
            {hill}
            <Figure x={168} s={0.92} fill={C.lime} className="group-hover:rotate-[-4deg]" />
            <Figure x={262} s={0.55} r={6} fill={C.blush} className="delay-75 group-hover:-translate-y-4 group-hover:rotate-[-6deg]" />
          </>
        );
      } else if (v === 1) {
        art = (
          <>
            <circle cx={84} cy={58} r={62} fill={C.lime} fillOpacity={0.45} />
            {hill}
            <Figure x={120} s={0.84} r={-5} fill={C.periwinkle} className="group-hover:rotate-[3deg]" />
            <Figure x={284} s={0.8} r={5} fill={C.blush} className="group-hover:rotate-[-3deg]" />
            <Figure x={203} s={0.56} fill={C.lime} className="delay-75 group-hover:-translate-y-5" />
          </>
        );
      } else if (v === 2) {
        art = (
          <>
            <circle cx={322} cy={60} r={66} fill={C.lime} fillOpacity={0.45} />
            {hill}
            <Figure x={138} s={0.62} r={-8} fill={C.lime} className="group-hover:rotate-[4deg]" />
            <Figure x={270} s={0.58} r={7} fill={C.periwinkle} className="delay-100 group-hover:rotate-[-4deg]" />
            <Ball cx={205} cy={198} r={17} fill={C.blush} seam="#fff" className="group-hover:-translate-y-6 group-hover:rotate-[160deg]" />
          </>
        );
      } else {
        art = (
          <>
            <circle cx={86} cy={64} r={60} fill={C.lime} fillOpacity={0.45} />
            {hill}
            <Figure x={118} s={0.48} fill={C.blush} className="group-hover:-translate-y-4" />
            <Figure x={196} s={0.64} fill={C.lime} className="delay-75 group-hover:-translate-y-4" />
            <Figure x={288} s={0.84} fill={C.periwinkle} className="delay-150 group-hover:-translate-y-4" />
          </>
        );
      }
      break;
    }
    case "prevention": {
      const v = variant % 2;
      art = (
        <>
          <circle cx={v ? 86 : 320} cy={64} r={62} fill={C.cloud} fillOpacity={white ? 0.7 : 1} />
          {hill}
          {v === 0 ? (
            <Figure x={196} s={0.95} fill={C.periwinkle} shine className="group-hover:rotate-[-4deg]" />
          ) : (
            <>
              <Figure x={160} s={0.86} fill={C.periwinkle} shine className="group-hover:rotate-[-4deg]" />
              <Figure x={252} s={0.54} fill={C.lime} className="delay-75 group-hover:-translate-y-4" />
            </>
          )}
          <Bubble cx={v ? 300 : 292} cy={96} r={15} stroke={C.periwinkle} className="group-hover:-translate-y-3" />
          <Bubble cx={v ? 334 : 320} cy={146} r={9} stroke={C.periwinkle} className="delay-75 group-hover:-translate-y-4" />
          <Bubble cx={v ? 304 : 286} cy={176} r={6} stroke={C.periwinkle} className="delay-150 group-hover:-translate-y-5" />
          <Bubble cx={102} cy={v ? 150 : 116} r={11} stroke={C.periwinkle} className="delay-100 group-hover:-translate-y-3" />
          <Bubble cx={124} cy={v ? 108 : 74} r={6} stroke={C.periwinkle} className="group-hover:-translate-y-4" />
        </>
      );
      break;
    }
    case "alignment": {
      const tiltRight = variant % 2 === 1;
      art = (
        <>
          <circle cx={tiltRight ? 84 : 324} cy={58} r={64} fill={C.blush} fillOpacity={0.5} />
          {hill}
          <path d="M64 120H336" stroke={white ? C.blush : "#fff"} strokeWidth={4} strokeLinecap="round" strokeDasharray="2 12" />
          <Figure x={120} s={0.7} fill={C.blush} />
          <Figure
            x={200}
            s={0.7}
            fill={C.periwinkle}
            className={tiltRight ? undefined : "rotate-[-13deg] group-hover:rotate-0"}
          />
          <Figure x={280} s={0.7} fill={C.lime} className={tiltRight ? "rotate-[11deg] group-hover:rotate-0" : undefined} />
        </>
      );
      break;
    }
    case "jaw": {
      const moon = white ? C.periwinkle : "#fff";
      art = (
        <>
          {hill}
          <path d="M306 38A36 36 0 1 0 338 92A30 30 0 1 1 306 38Z" fill={moon} fillOpacity={white ? 0.55 : 1} />
          <circle cx={244} cy={52} r={4} fill={moon} fillOpacity={white ? 0.55 : 1} />
          <circle cx={354} cy={138} r={3} fill={moon} fillOpacity={white ? 0.55 : 1} />
          <circle cx={104} cy={74} r={4} fill={moon} fillOpacity={white ? 0.55 : 1} />
          <circle cx={146} cy={40} r={2.5} fill={moon} fillOpacity={white ? 0.55 : 1} />
          <Figure x={190} s={0.92} fill={C.periwinkle} className="rotate-[-12deg] group-hover:-translate-y-2 group-hover:rotate-0" />
        </>
      );
      break;
    }
    case "sports": {
      art = (
        <>
          <circle cx={84} cy={60} r={56} fill={C.periwinkle} fillOpacity={0.35} />
          {hill}
          <ellipse cx={180} cy={240} rx={36} ry={6} fill={C.ink} fillOpacity={0.08} />
          <g stroke={light} strokeWidth={6} strokeLinecap="round">
            <path d="M96 124H124" />
            <path d="M84 150H120" />
            <path d="M92 176H118" />
          </g>
          <Figure x={180} y={206} s={0.86} r={-14} fill={C.lime} className="group-hover:-translate-y-4 group-hover:rotate-[6deg]" />
          <Ball cx={296} cy={112} r={24} fill={C.blush} seam="#fff" className="delay-75 group-hover:-translate-y-3 group-hover:rotate-[120deg]" />
        </>
      );
      break;
    }
  }

  return <>{art}</>;
}

/**
 * Pose for an article: cycles through the scenes in publication order within
 * each kind, so neighbouring cards in the library rarely repeat a scene.
 */
function getCoverVariant(slug: string, kind: CoverKind) {
  const siblings = getAllBlogPosts().filter((post) => getEditorialTheme(post.category).kind === kind);
  const index = siblings.findIndex((post) => post.slug === slug);
  return index >= 0 ? index : seedFromSlug(slug);
}

export function PostCover({
  category,
  slug,
  surface = "wash",
  className,
}: {
  category: string;
  slug: string;
  /** "wash": category-tinted panel (cards). "white": white panel for use on a tinted hero. */
  surface?: "wash" | "white";
  className?: string;
}) {
  const theme = getEditorialTheme(category);
  const white = surface === "white";
  return (
    <div aria-hidden="true" className={cn("relative overflow-clip", white ? "bg-white" : theme.wash, className)}>
      <svg viewBox="0 0 400 260" preserveAspectRatio="xMidYMax slice" className="absolute inset-0 size-full" focusable="false">
        <Scene kind={theme.kind} variant={getCoverVariant(slug, theme.kind)} white={white} />
      </svg>
    </div>
  );
}
