import type { CSSProperties } from "react";
import { cn } from "@/lib/utils";
import { ToothPerson } from "@/components/brand/pinwheel";
import { DrawnCheck } from "./feature-bits";

// Every line is taken from the iTero and Invisalign page content: no putty,
// a small handheld wand, fewer retakes, a 3D model to review together, and
// the option to pause at any time.
const rows = [
  { label: "What goes in your mouth", putty: "A tray of “goopy” impression putty", scan: "A small handheld wand. No putty." },
  { label: "Getting it right", putty: "More likely to need a retake", scan: "Helps reduce retakes" },
  { label: "What you see", putty: "No 3D model to look at together", scan: "A detailed 3D model we review together" },
];

/**
 * "Putty trays vs. digital scan": two cards that settle straight as they
 * scroll into view, with the scan card on top.
 */
export function PuttyVsScan({ className }: { className?: string }) {
  return (
    <div className={cn("relative grid gap-4 sm:grid-cols-2 sm:gap-0", className)}>
      <div
        className="ff-straighten relative rounded-3xl bg-cloud-wash p-6 ring-1 ring-border sm:mr-[-1.5rem] sm:mt-10 sm:p-7 sm:pr-12"
        style={{ "--ff-tilt": "-4deg", "--i": 0 } as CSSProperties}
      >
        <p className="text-xs font-bold uppercase tracking-[0.14em] text-ink-soft">The old way</p>
        <h3 className="mt-2 font-display text-2xl font-semibold text-ink">Putty trays</h3>
        <dl className="mt-6 space-y-5">
          {rows.map((row) => (
            <div key={row.label}>
              <dt className="text-[0.7rem] font-bold uppercase tracking-[0.12em] text-ink-soft/80">{row.label}</dt>
              <dd className="mt-1.5 flex items-start gap-3 text-base leading-snug text-ink-soft">
                <span aria-hidden="true" className="mt-2 h-0.5 w-3.5 shrink-0 rounded-full bg-ink/30" />
                {row.putty}
              </dd>
            </div>
          ))}
        </dl>
      </div>

      <div
        className="ff-straighten relative z-[1] rounded-3xl bg-white p-6 shadow-float ring-2 ring-periwinkle sm:p-7"
        style={{ "--ff-tilt": "3deg", "--i": 1 } as CSSProperties}
      >
        <ToothPerson color="var(--ff-periwinkle)" className="pointer-events-none absolute -right-2 -top-9 h-16 w-auto rotate-[10deg]" />
        <p className="text-xs font-bold uppercase tracking-[0.14em] text-cobalt">With iTero</p>
        <h3 className="mt-2 font-display text-2xl font-semibold text-ink">A digital scan</h3>
        <dl className="mt-6 space-y-5">
          {rows.map((row) => (
            <div key={row.label}>
              <dt className="text-[0.7rem] font-bold uppercase tracking-[0.12em] text-ink-soft/80">{row.label}</dt>
              <dd className="mt-1.5 flex items-start gap-3 text-base font-semibold leading-snug text-ink">
                <DrawnCheck tone="lime" className="-mt-0.5 size-6" />
                {row.scan}
              </dd>
            </div>
          ))}
        </dl>
        <p className="mt-6 rounded-2xl bg-periwinkle-wash px-4 py-3 text-sm leading-relaxed text-ink">
          We can pause at any time to keep you comfortable.
        </p>
      </div>

      <span
        aria-hidden="true"
        className="ff-reveal-pop absolute left-[calc(50%-1.5rem)] top-[calc(50%-1.5rem)] z-[2] hidden size-12 place-items-center rounded-full bg-ink font-display text-base font-semibold italic text-white ring-4 ring-paper sm:grid"
        style={{ "--i": 1 } as CSSProperties}
      >
        vs
      </span>
    </div>
  );
}
