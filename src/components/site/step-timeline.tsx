import type { CSSProperties, ReactNode } from "react";
import { cn } from "@/lib/utils";

const dotColors = ["bg-periwinkle", "bg-blush", "bg-lime", "bg-cloud"];
const columnClass: Record<number, string> = {
  2: "lg:grid-cols-2",
  3: "lg:grid-cols-3",
  4: "lg:grid-cols-4",
  5: "lg:grid-cols-5",
};

export type TimelineStep = { title: ReactNode; body?: ReactNode };

/**
 * Numbered steps joined by a line that draws itself as the section scrolls
 * through (horizontal on wide screens, vertical on phones or when
 * `orientation="vertical"`). Each step's marker pops in as it arrives.
 */
export function StepTimeline({
  steps,
  className,
  tone = "light",
  orientation = "auto",
  ringClassName,
}: {
  steps: TimelineStep[];
  className?: string;
  tone?: "light" | "night";
  /** "auto" goes horizontal at lg; "vertical" always stacks (for narrow columns). */
  orientation?: "auto" | "vertical";
  /** Ring around each marker; defaults to the enclosing Section's background. */
  ringClassName?: string;
}) {
  const night = tone === "night";
  const horizontal = orientation === "auto";
  const columns = Math.min(Math.max(steps.length, 2), 5);
  const trackColor = night ? "bg-white/10" : "bg-ink/10";
  return (
    <ol className={cn("relative grid gap-8", horizontal && cn("lg:gap-6", columnClass[columns]), className)}>
      {/* Horizontal line from the first marker to the last (wide screens). */}
      {horizontal ? (
        <span
          aria-hidden="true"
          className={cn("absolute left-[1.375rem] top-[1.375rem] hidden h-0.5 lg:block", trackColor)}
          style={{ right: `calc((100% - ${(columns - 1) * 1.5}rem) / ${columns} - 1.375rem)` }}
        >
          <span className="ff-grow-view-x block size-full origin-left bg-cobalt" />
        </span>
      ) : null}
      {steps.map((step, index) => (
        <li key={index} className={cn("relative flex gap-5", horizontal && "lg:block")}>
          {/* Vertical connector down to the next marker. */}
          {index < steps.length - 1 ? (
            <span
              aria-hidden="true"
              className={cn("absolute -bottom-8 left-[1.375rem] top-11 w-0.5 -translate-x-1/2", trackColor, horizontal && "lg:hidden")}
            >
              <span className="ff-grow-view block size-full origin-top bg-cobalt" />
            </span>
          ) : null}
          <span
            aria-hidden="true"
            className={cn(
              "ff-reveal-pop relative z-[1] grid size-11 shrink-0 place-items-center rounded-full font-display text-lg font-semibold text-ink ring-4",
              dotColors[index % dotColors.length],
              ringClassName ?? (night ? "ring-night" : "ring-[var(--ff-surface,var(--ff-paper))]"),
            )}
            style={{ "--i": index } as CSSProperties}
          >
            {index + 1}
          </span>
          <div className={cn("ff-reveal pb-2", horizontal && "lg:mt-6 lg:pr-4")} style={{ "--i": index } as CSSProperties}>
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
