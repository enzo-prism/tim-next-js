import type { CSSProperties, ReactNode } from "react";
import { cn } from "@/lib/utils";

const dotColors = ["bg-periwinkle", "bg-blush", "bg-lime", "bg-cloud"];

export type TimelineStep = { title: ReactNode; body?: ReactNode };

/**
 * Numbered steps joined by a line that draws itself as the section scrolls
 * through (horizontal on wide screens, vertical on phones). Each step's marker
 * pops in as it arrives.
 */
export function StepTimeline({ steps, className, tone = "light" }: { steps: TimelineStep[]; className?: string; tone?: "light" | "night" }) {
  const night = tone === "night";
  const columns = steps.length >= 4 ? 4 : steps.length === 3 ? 3 : 2;
  return (
    <ol
      className={cn(
        "relative grid gap-8 md:gap-6",
        steps.length >= 4 ? "md:grid-cols-4" : steps.length === 3 ? "md:grid-cols-3" : "md:grid-cols-2",
        className,
      )}
    >
      {/* Track + growing line */}
      <span aria-hidden="true" className={cn("absolute bottom-6 left-[1.375rem] top-6 w-0.5 md:hidden", night ? "bg-white/10" : "bg-ink/10")}>
        <span className="ff-grow-view block size-full origin-top bg-cobalt" />
      </span>
      <span
        aria-hidden="true"
        className={cn("absolute left-[1.375rem] top-[1.375rem] hidden h-0.5 md:block", night ? "bg-white/10" : "bg-ink/10")}
        style={{ right: `calc((100% - ${(columns - 1) * 1.5}rem) / ${columns} - 1.375rem)` }}
      >
        <span className="ff-grow-view-x block size-full origin-left bg-cobalt" />
      </span>
      {steps.map((step, index) => (
        <li key={index} className="relative flex gap-5 md:block">
          <span
            aria-hidden="true"
            className={cn(
              "ff-reveal-pop relative z-[1] grid size-11 shrink-0 place-items-center rounded-full font-display text-lg font-semibold text-ink ring-4",
              dotColors[index % dotColors.length],
              night ? "ring-night" : "ring-paper",
            )}
            style={{ "--i": index } as CSSProperties}
          >
            {index + 1}
          </span>
          <div className="ff-reveal pb-2 md:mt-6 md:pr-4" style={{ "--i": index } as CSSProperties}>
            <h3 className={cn("text-lg font-bold leading-snug", night ? "text-white" : "text-ink")}>
              <span className="sr-only">Step {index + 1}: </span>
              {step.title}
            </h3>
            {step.body ? <div className={cn("mt-2 text-base leading-relaxed", night ? "text-white/70" : "text-ink-soft")}>{step.body}</div> : null}
          </div>
        </li>
      ))}
    </ol>
  );
}
