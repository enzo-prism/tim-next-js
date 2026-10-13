import type { CSSProperties } from "react";
import { cn } from "@/lib/utils";
import { BRAND_TOOTH_COLORS, TOOTH_BODY_PATH, TOOTH_HEAD } from "@/components/brand/tooth-shapes";

/*
 * 404 art: the logo pinwheel with one tooth-person wandered off (with a little
 * "?"). It wiggles once on load; hovering the art or the "Back to homepage"
 * button (`.ffe-404-home` inside `.ffe-404`) brings it home. Decorative only.
 */
const css = `
.ffe-lost{transform-box:fill-box;transform-origin:50% 50%;translate:148px -30px;rotate:-166deg;transition:translate .9s var(--ease-spring),rotate .9s var(--ease-spring)}
.ffe-q{transform-box:fill-box;transform-origin:0% 100%;transition:opacity .3s ease,scale .35s var(--ease-spring)}
.ffe-gap{transition:opacity .3s ease}
.ffe-404-art:hover .ffe-lost,.ffe-404:has(.ffe-404-home:hover) .ffe-lost,.ffe-404:has(.ffe-404-home:focus-visible) .ffe-lost{translate:0 0;rotate:0deg}
.ffe-404-art:hover :is(.ffe-q,.ffe-gap),.ffe-404:has(.ffe-404-home:hover) :is(.ffe-q,.ffe-gap),.ffe-404:has(.ffe-404-home:focus-visible) :is(.ffe-q,.ffe-gap){opacity:0;scale:.6}
@keyframes ffe-wiggle{0%,100%{rotate:0deg}18%{rotate:-10deg}40%{rotate:8deg}62%{rotate:-5deg}82%{rotate:2deg}}
@media (prefers-reduced-motion:no-preference){
  .ffe-wiggle{transform-box:fill-box;transform-origin:50% 50%;animation:ffe-wiggle .9s var(--ease-in-out-soft) .9s both}
}
@media (prefers-reduced-motion:reduce){.ffe-lost,.ffe-q,.ffe-gap{transition:none}}
`;

/** Each tooth's resting spot in the pinwheel (same geometry as the logo). */
const place = (k: number) => `rotate(${k * 90}) translate(-102.4 -103.5)`;
const GATHER_FROM = [
  { x: -46, y: -40 },
  { x: 40, y: -46 },
  { x: 46, y: 40 },
  { x: -40, y: 46 },
];

function ToothShape() {
  return (
    <>
      <path d={TOOTH_BODY_PATH} />
      <circle cx={TOOTH_HEAD.cx} cy={TOOTH_HEAD.cy} r={TOOTH_HEAD.r} />
    </>
  );
}

export function LostPinwheel({ className }: { className?: string }) {
  const lost = 2; // the lime tooth wandered off
  return (
    <>
      <style dangerouslySetInnerHTML={{ __html: css }} />
      <svg
        viewBox="-150 -158 440 316"
        className={cn("ff-pinwheel ff-pinwheel-gather block overflow-visible", className)}
        style={{ "--d": 200, isolation: "isolate" } as CSSProperties}
        aria-hidden="true"
        focusable="false"
      >
        {/* The empty spot, waiting. */}
        <g
          className="ffe-gap"
          transform={place(lost)}
          fill="none"
          stroke="var(--ff-ink)"
          strokeOpacity={0.22}
          strokeWidth={2.5}
          strokeDasharray="6 7"
          strokeLinecap="round"
        >
          <ToothShape />
        </g>

        {BRAND_TOOTH_COLORS.map((color, k) =>
          k === lost ? null : (
            <g
              key={color}
              className="ff-tooth-wrap"
              style={{ "--k": k, "--gx": `${GATHER_FROM[k].x}px`, "--gy": `${GATHER_FROM[k].y}px` } as CSSProperties}
            >
              <g className="ff-tooth" transform={place(k)} fill={color}>
                <ToothShape />
              </g>
            </g>
          ),
        )}

        <g className="ffe-lost">
          <g className="ffe-wiggle">
            <g className="ff-tooth" transform={place(lost)} fill={BRAND_TOOTH_COLORS[lost]}>
              <ToothShape />
            </g>
          </g>
        </g>

        <g className="ffe-q">
          <path d="M214 -70L206 -50L230 -66Z" fill="#fff" />
          <circle cx={238} cy={-98} r={30} fill="#fff" />
          <text
            x={238}
            y={-86}
            textAnchor="middle"
            fontSize={36}
            fontWeight={600}
            fill="var(--ff-cobalt)"
            style={{ fontFamily: "var(--font-display)" }}
          >
            ?
          </text>
        </g>
      </svg>
    </>
  );
}
