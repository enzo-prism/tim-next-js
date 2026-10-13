import type { ReactNode } from "react";
import { cn } from "@/lib/utils";
import { ToothFamily } from "@/components/brand/tooth-family";
import { Eyebrow } from "./section";

/**
 * The night closing band: a big promise, the actions, and the tooth-people
 * family (tap them to make them hop). Pass `decoration` for seasonal art.
 */
export function CtaBand({
  id,
  eyebrow = "Ready when you are",
  title,
  body,
  actions,
  note,
  decoration,
  family = true,
  className,
}: {
  id?: string;
  eyebrow?: ReactNode;
  title: ReactNode;
  body?: ReactNode;
  actions: ReactNode;
  note?: ReactNode;
  decoration?: ReactNode;
  family?: boolean;
  className?: string;
}) {
  return (
    <section aria-labelledby={id} className={cn("px-2 pb-2 sm:px-3 sm:pb-3", className)}>
      <div className="relative overflow-clip rounded-3xl bg-night text-white">
        {decoration}
        <div className="relative mx-auto grid max-w-7xl items-end gap-12 px-5 py-16 sm:px-8 sm:py-20 lg:grid-cols-[minmax(0,1fr)_auto] lg:px-12 lg:py-24">
          <div className="ff-reveal max-w-2xl">
            <Eyebrow tone="night" className="mb-5">
              {eyebrow}
            </Eyebrow>
            <h2 id={id} className="ff-h2 text-white">
              {title}
            </h2>
            {body ? <div className="mt-5 text-lg leading-relaxed text-white/75">{body}</div> : null}
            <div className="mt-9 flex flex-col gap-3 sm:flex-row sm:flex-wrap sm:items-center">{actions}</div>
            {note ? <div className="mt-6 text-sm text-white/60">{note}</div> : null}
          </div>
          {family ? (
            <div className="ff-reveal-pop hidden h-44 justify-self-end sm:flex lg:h-56" style={{ "--i": 1 } as React.CSSProperties}>
              <ToothFamily className="h-full" />
            </div>
          ) : null}
        </div>
      </div>
    </section>
  );
}
