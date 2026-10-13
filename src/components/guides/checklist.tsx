import type { CSSProperties, ReactNode } from "react";
import { cn } from "@/lib/utils";
import styles from "./guides.module.css";

const checkedTone = {
  lime: "has-[:checked]:border-lime has-[:checked]:bg-lime-wash",
  periwinkle: "has-[:checked]:border-periwinkle has-[:checked]:bg-periwinkle-wash",
  blush: "has-[:checked]:border-blush has-[:checked]:bg-blush-wash",
} as const;

/**
 * A tick-it-off list built from native checkboxes, so it works without
 * JavaScript and with any assistive tech. Checking an item draws the tick,
 * bounces the box, and tints the row. Nothing is saved.
 */
export function Checklist({
  items,
  label,
  tone = "lime",
  className,
}: {
  items: readonly ReactNode[];
  /** Accessible name for the list. */
  label: string;
  tone?: keyof typeof checkedTone;
  className?: string;
}) {
  return (
    <ul aria-label={label} className={cn("space-y-3", className)}>
      {items.map((item, index) => (
        <li key={index} className="ff-reveal" style={{ "--i": Math.min(index, 4) } as CSSProperties}>
          <label
            className={cn(
              "group/check flex min-h-14 cursor-pointer items-start gap-4 rounded-2xl border border-border bg-white px-4 py-4 transition-colors duration-300 hover:border-ink/25 sm:px-5",
              checkedTone[tone],
            )}
          >
            <input type="checkbox" className={cn("peer sr-only", styles.check)} />
            <span
              aria-hidden="true"
              className={cn(
                "mt-0.5 grid size-7 shrink-0 place-items-center rounded-full border-2 border-input bg-white transition-colors duration-200 peer-checked:border-cobalt peer-checked:bg-cobalt peer-focus-visible:ring-2 peer-focus-visible:ring-ring peer-focus-visible:ring-offset-2 group-hover/check:border-cobalt",
                styles.box,
              )}
            >
              <svg viewBox="0 0 24 24" className="size-4 overflow-visible" focusable="false">
                <path
                  pathLength={1}
                  d="M5 12.5l4.5 4.5L19 7.5"
                  fill="none"
                  stroke="#ffffff"
                  strokeWidth={3.2}
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  className="[stroke-dasharray:1] [stroke-dashoffset:1] group-has-[:checked]/check:[stroke-dashoffset:0] motion-safe:transition-[stroke-dashoffset] motion-safe:delay-75 motion-safe:duration-300"
                />
              </svg>
            </span>
            <span className="text-base leading-relaxed text-ink">{item}</span>
          </label>
        </li>
      ))}
    </ul>
  );
}
