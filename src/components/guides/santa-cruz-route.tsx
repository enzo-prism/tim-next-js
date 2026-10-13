import type { CSSProperties } from "react";
import { cn } from "@/lib/utils";
import { BRAND_TOOTH_COLORS, TOOTH_BODY_PATH, TOOTH_HEAD } from "@/components/brand/tooth-shapes";
import styles from "./guides.module.css";

// The road, in the SVG's 600 × 560 user space: Santa Cruz on the coast
// (bottom left), over the hill on Highway 17, to Los Gatos (top right).
const ROAD =
  "M104 474C142 462 170 440 166 410C162 382 190 364 222 372C254 380 282 362 276 334C270 306 296 286 326 294C356 302 380 284 374 256C368 228 392 206 424 212C456 218 478 196 470 170C464 150 478 128 500 118";

const START = { x: 104, y: 474 };
const MID = { x: 276, y: 334 };
const END = { x: 500, y: 118 };

const pct = (value: number, total: number) => `${((value / total) * 100).toFixed(2)}%`;

function Stop({ x, y, r, color, className }: { x: number; y: number; r: number; color: string; className: string }) {
  return (
    <g className={cn(styles.stop, className)}>
      <circle cx={x} cy={y} r={r + 7} fill="#ffffff" />
      <circle cx={x} cy={y} r={r} fill={color} />
    </g>
  );
}

/**
 * "Santa Cruz → Highway 17 → Los Gatos": the road draws itself as the map
 * scrolls through the viewport, stops pop in as the line reaches them, and a
 * little tooth-person rides along. Without scroll-timeline support (or with
 * reduced motion) the finished map simply shows.
 */
export function SantaCruzRoute({ className }: { className?: string }) {
  return (
    <figure className={cn("relative", className)}>
      <div className={cn("relative aspect-[600/560] w-full", styles.route)}>
        <svg viewBox="0 0 600 560" className="absolute inset-0 size-full" aria-hidden="true" focusable="false">
          {/* Sky, ridges of the Santa Cruz Mountains, and the coast */}
          <rect width={600} height={560} fill="var(--ff-paper)" />
          <circle cx={92} cy={96} r={30} fill="var(--ff-lime)" opacity={0.55} />
          <path d="M0 250C80 200 150 230 220 190C290 150 350 190 420 150C480 115 540 140 600 110V560H0Z" fill="var(--ff-cloud)" />
          <path d="M0 340C90 300 170 330 250 290C330 250 400 290 470 260C530 236 570 250 600 240V560H0Z" fill="var(--ff-lime)" opacity={0.3} />
          <path d="M140 560C180 470 260 440 330 450C400 460 450 400 520 400C560 400 590 420 600 430V560Z" fill="var(--ff-lime)" opacity={0.55} />
          <path d="M0 380C50 392 84 430 88 470C92 510 80 540 96 560H0Z" fill="var(--ff-periwinkle)" opacity={0.75} />
          <path d="M0 372C56 384 96 426 100 470C104 512 92 540 108 560" fill="none" stroke="var(--ff-blush)" strokeWidth={10} strokeLinecap="round" />
          {[404, 444, 484, 524].map((y, index) => (
            <path
              key={y}
              d={`M${6 + index * 5} ${y}c8 -6 16 6 24 0s16 6 24 0`}
              fill="none"
              stroke="#ffffff"
              strokeWidth={3}
              strokeLinecap="round"
              opacity={0.85}
            />
          ))}
          {/* Trees */}
          {[
            [214, 470, 12],
            [238, 478, 9],
            [372, 300, 11],
            [396, 292, 8],
            [540, 420, 12],
            [562, 410, 8],
            [120, 330, 10],
            [560, 196, 9],
          ].map(([cx, cy, r]) => (
            <g key={`${cx}-${cy}`}>
              <rect x={cx - 1.5} y={cy} width={3} height={r + 4} rx={1.5} fill="var(--ff-ink)" opacity={0.3} />
              <circle cx={cx} cy={cy} r={r} fill="var(--ff-lime)" />
            </g>
          ))}
          {/* The road: a soft track, then the drawn line on top */}
          <path d={ROAD} fill="none" stroke="#ffffff" strokeWidth={24} strokeLinecap="round" strokeLinejoin="round" />
          <path d={ROAD} fill="none" stroke="var(--ff-ink)" strokeOpacity={0.12} strokeWidth={4} strokeLinecap="round" strokeDasharray="2 12" />
          <path
            d={ROAD}
            pathLength={1}
            className={styles.road}
            fill="none"
            stroke="var(--ff-cobalt)"
            strokeWidth={7}
            strokeLinecap="round"
            strokeLinejoin="round"
          />
          {/* Highway 17 shield */}
          <g transform="translate(322 360)">
            <path d="M-22 -24H22C24 -8 20 10 0 24C-20 10 -24 -8 -22 -24Z" fill="#ffffff" stroke="var(--ff-ink)" strokeWidth={3} strokeLinejoin="round" />
            <text x={0} y={7} textAnchor="middle" fontSize={20} fontWeight={700} fill="var(--ff-ink)" fontFamily="var(--font-sans)">
              17
            </text>
          </g>
          {/* Our office: a map pin carrying the logo pinwheel */}
          <g transform={`translate(${END.x} ${END.y - 58})`}>
            <path d="M-12 26L0 46L12 26Z" fill="#ffffff" />
            <circle r={34} fill="#ffffff" stroke="var(--ff-ink)" strokeOpacity={0.12} strokeWidth={2} />
            <g transform="scale(0.19)" style={{ isolation: "isolate" }}>
              {BRAND_TOOTH_COLORS.map((color, k) => (
                <g key={color} transform={`rotate(${k * 90}) translate(-102.4 -103.5)`} fill={color} style={{ mixBlendMode: "multiply" }}>
                  <path d={TOOTH_BODY_PATH} />
                  <circle cx={TOOTH_HEAD.cx} cy={TOOTH_HEAD.cy} r={TOOTH_HEAD.r} />
                </g>
              ))}
            </g>
          </g>
          <Stop x={START.x} y={START.y} r={11} color="var(--ff-blush)" className={styles.stopStart} />
          <Stop x={MID.x} y={MID.y} r={11} color="var(--ff-lime)" className={styles.stopMid} />
          <Stop x={END.x} y={END.y} r={14} color="var(--ff-periwinkle)" className={styles.stopEnd} />
          {/* A tooth-person riding the road (only where it can move) */}
          <g className={styles.rider} style={{ offsetPath: `path("${ROAD}")` } as CSSProperties}>
            <g transform="translate(-13 -40) scale(0.26)" fill="var(--ff-cobalt)">
              <path d={TOOTH_BODY_PATH} />
              <circle cx={TOOTH_HEAD.cx} cy={TOOTH_HEAD.cy} r={TOOTH_HEAD.r} />
            </g>
          </g>
        </svg>

        {/* Labels stay crisp HTML at every size */}
        <span
          aria-hidden="true"
          className="ff-chip absolute -translate-y-1/2 whitespace-nowrap text-xs sm:text-sm"
          style={{ left: pct(START.x + 24, 600), top: pct(START.y + 30, 560) }}
        >
          <span className="size-2.5 rounded-full bg-blush ring-2 ring-ink/10" />
          Santa Cruz
        </span>
        <span
          aria-hidden="true"
          className="ff-chip absolute -translate-y-1/2 whitespace-nowrap text-xs sm:text-sm"
          style={{ left: pct(MID.x + 72, 600), top: pct(MID.y + 30, 560) }}
        >
          <span className="size-2.5 rounded-full bg-lime ring-2 ring-ink/10" />
          Over the hill
        </span>
        <span
          aria-hidden="true"
          className="ff-chip absolute -translate-x-full -translate-y-1/2 whitespace-nowrap text-xs sm:text-sm"
          style={{ left: pct(END.x - 26, 600), top: pct(END.y + 26, 560) }}
        >
          <span className="size-2.5 rounded-full bg-periwinkle ring-2 ring-ink/10" />
          Los Gatos · Suite 102
        </span>
      </div>
      <figcaption className="sr-only">Map illustration: the drive from Santa Cruz, over the hill on Highway 17, to our office at Suite 102 in Los Gatos.</figcaption>
    </figure>
  );
}
