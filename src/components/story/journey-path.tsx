import type { CSSProperties, ReactNode } from "react";
import { cn } from "@/lib/utils";
import { Pinwheel } from "@/components/brand/pinwheel";

export type JourneyStop = {
  /** Small label above the place (role, year). */
  label: string;
  place: string;
  detail: ReactNode;
};

const markerColors = ["bg-periwinkle", "bg-blush", "bg-lime", "bg-cloud"];

// Each stop owns one slice of the winding road, drawn in a 100×100 box that
// stretches to the row (preserveAspectRatio="none" + non-scaling strokes), so
// the road stays continuous however tall each row grows. The road enters and
// leaves every row at the centre, and bends out to the stop's marker.
function roadSlice(markerX: number, first: boolean, last: boolean) {
  const into = `M50 0 C50 28 ${markerX} 22 ${markerX} 50`;
  const outOf = `C${markerX} 78 50 72 50 100`;
  if (first && last) return `M${markerX} 50`;
  if (first) return `M${markerX} 50 ${outOf}`;
  if (last) return into;
  return `${into} ${outOf}`;
}

/**
 * A life's path as a winding road: stops alternate sides on wide screens and
 * sit beside a left-hand road on phones. The road is uncovered, slice by
 * slice, as each stop scrolls into view (CSS only); without scroll-driven
 * animation support it is simply drawn. The last stop ends at the pinwheel.
 */
export function JourneyPath({ stops, className, label }: { stops: JourneyStop[]; className?: string; label?: string }) {
  return (
    <ol className={cn("relative", className)} aria-label={label}>
      {stops.map((stop, index) => {
        const first = index === 0;
        const last = index === stops.length - 1;
        const onLeft = index % 2 === 0;
        // The road bends toward each stop's side and settles in the middle at the end.
        const markerX = last ? 50 : onLeft ? 32 : 68;
        const d = roadSlice(markerX, first, last);
        return (
          <li
            key={stop.place}
            className="relative grid grid-cols-[3.25rem_minmax(0,1fr)] gap-x-4 md:grid-cols-[minmax(0,1fr)_9rem_minmax(0,1fr)] md:gap-x-0"
          >
            {/* Road slice + marker */}
            <div aria-hidden="true" className="relative col-start-1 row-start-1 md:col-start-2">
              <svg viewBox="0 0 100 100" preserveAspectRatio="none" focusable="false" className="absolute inset-0 size-full overflow-visible">
                <path d={d} fill="none" stroke="var(--ff-line)" strokeWidth={3} strokeLinecap="round" vectorEffect="non-scaling-stroke" strokeDasharray="1 7" />
              </svg>
              {/* The cobalt road is uncovered top to bottom as the row scrolls in
                  (a clip reveal: stroke dashes don't survive non-scaling strokes). */}
              <span
                className="ff-unclip absolute inset-0"
                style={{ "--ff-unclip-from": "0 0 100% 0", "--ff-unclip-radius": "0px" } as CSSProperties}
              >
                <svg viewBox="0 0 100 100" preserveAspectRatio="none" focusable="false" className="absolute inset-0 size-full overflow-visible">
                  <path d={d} fill="none" stroke="var(--ff-cobalt)" strokeWidth={3} strokeLinecap="round" vectorEffect="non-scaling-stroke" />
                </svg>
              </span>
              <span
                className="absolute top-1/2 -translate-x-1/2 -translate-y-1/2"
                style={{ left: `${markerX}%` }}
              >
                {last ? (
                  <span className="ff-reveal-pop grid size-14 place-items-center rounded-full bg-white shadow-float ring-4 ring-paper md:size-20" style={{ "--i": 0 } as CSSProperties}>
                    <Pinwheel gather="view" className="size-12 md:size-[4.5rem]" />
                  </span>
                ) : (
                  <span
                    className={cn("ff-reveal-pop block size-7 rounded-full ring-[6px] ring-paper", markerColors[index % markerColors.length])}
                    style={{ "--i": 0 } as CSSProperties}
                  />
                )}
              </span>
            </div>

            {/* Stop */}
            <div
              className={cn(
                "col-start-2 row-start-1 py-7 sm:py-9 md:py-7",
                onLeft ? "md:col-start-1 md:pr-8 md:text-right" : "md:col-start-3 md:pl-8",
                onLeft ? "ff-reveal-right" : "ff-reveal-left",
              )}
            >
              <div
                className={cn(
                  "md:max-w-md",
                  onLeft && "md:ml-auto",
                  last && "rounded-3xl bg-periwinkle-wash p-6 sm:p-7 md:text-left",
                )}
              >
                <p className="text-xs font-bold uppercase tracking-[0.14em] text-cobalt-deep">{stop.label}</p>
                <h3 className="mt-2 font-display text-[1.75rem] font-semibold leading-[1.08] text-ink sm:text-4xl">{stop.place}</h3>
                <div className="mt-3 text-base leading-relaxed text-ink-soft sm:text-[1.0625rem]">{stop.detail}</div>
              </div>
            </div>
          </li>
        );
      })}
    </ol>
  );
}
