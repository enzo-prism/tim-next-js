import type { CSSProperties } from "react";
import { cn } from "@/lib/utils";
import { ToothPerson } from "@/components/brand/pinwheel";
import { brandColor } from "./feature-bits";

export type AlignmentConcern = "crowding" | "spacing" | "bite" | "relapse";

/** Pick the diagram for a content bullet by its wording. */
export function concernFor(text: string): AlignmentConcern {
  if (/space|spacing|gap/i.test(text)) return "spacing";
  if (/bite/i.test(text)) return "bite";
  if (/relapse|past orthodontic/i.test(text)) return "relapse";
  return "crowding";
}

type Tooth = { x: string; y?: string; r: string; color?: number; flip?: boolean };

// Each tooth-person's "out of line" pose. On hover of the card (motion-safe),
// everyone glides into a neat row: a tiny Invisalign in miniature.
const poses: Record<AlignmentConcern, Tooth[][]> = {
  crowding: [
    [
      { x: "62%", r: "-12deg" },
      { x: "30%", y: "-7%", r: "9deg", color: 1 },
      { x: "0%", y: "4%", r: "-6deg", color: 2 },
      { x: "-30%", y: "-5%", r: "11deg", color: 3 },
      { x: "-62%", r: "-9deg", color: 0 },
    ],
  ],
  spacing: [
    [
      { x: "-48%", r: "-4deg" },
      { x: "-16%", r: "3deg", color: 1 },
      { x: "16%", r: "-3deg", color: 2 },
      { x: "48%", r: "5deg", color: 3 },
    ],
  ],
  bite: [
    [
      { x: "42%", r: "0deg", flip: true, color: 3 },
      { x: "42%", r: "0deg", flip: true, color: 2 },
      { x: "42%", r: "0deg", flip: true, color: 1 },
      { x: "42%", r: "0deg", flip: true, color: 0 },
    ],
    [
      { x: "0%", r: "0deg" },
      { x: "0%", r: "0deg", color: 1 },
      { x: "0%", r: "0deg", color: 2 },
      { x: "0%", r: "0deg", color: 3 },
    ],
  ],
  relapse: [
    [
      { x: "0%", r: "0deg", color: 1 },
      { x: "0%", r: "0deg", color: 2 },
      { x: "0%", r: "0deg", color: 3 },
      { x: "38%", y: "-12%", r: "22deg", color: 0 },
    ],
  ],
};

/**
 * A playful diagram of an alignment concern drawn with the logo's
 * tooth-people. Decorative; the card title carries the meaning.
 */
export function ToothDiagram({ concern, className }: { concern: AlignmentConcern; className?: string }) {
  const rows = poses[concern];
  return (
    <div aria-hidden="true" className={cn("flex flex-col items-center justify-center gap-1", className)}>
      {rows.map((row, rowIndex) => (
        <div key={rowIndex} className={cn("flex items-end justify-center gap-1.5", rows.length > 1 ? "h-12 sm:h-14" : "h-20 sm:h-24")}>
          {row.map((tooth, index) => (
            <span
              key={index}
              className="block h-full [rotate:var(--r)] [translate:var(--x)_var(--y)] transition-[rotate,translate] duration-700 ease-[var(--ease-spring)] group-hover:[rotate:0deg] group-hover:[translate:0_0] motion-reduce:transition-none"
              style={{ "--x": tooth.x, "--y": tooth.y ?? "0%", "--r": tooth.r, transitionDelay: `${index * 45}ms` } as CSSProperties}
            >
              <ToothPerson
                color={brandColor[tooth.color ?? 0]}
                className={cn("h-full w-auto", tooth.flip && "rotate-180")}
              />
            </span>
          ))}
        </div>
      ))}
    </div>
  );
}
