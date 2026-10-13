import type { CSSProperties, ReactNode } from "react";
import { cn } from "@/lib/utils";

/**
 * Wraps a word with a hand-drawn swoosh underneath. The stroke draws itself on
 * load ("load") or as it scrolls into view ("view"); without motion support it
 * is simply drawn.
 */
export function Squiggle({
  children,
  draw = "view",
  delay = 0,
  color,
  className,
}: {
  children: ReactNode;
  draw?: "load" | "view";
  delay?: number;
  color?: string;
  className?: string;
}) {
  return (
    <span
      className={cn("ff-underline", className)}
      style={{ "--underline-color": color } as CSSProperties}
    >
      {children}
      <svg
        viewBox="0 0 200 24"
        preserveAspectRatio="none"
        aria-hidden="true"
        focusable="false"
        className={draw === "load" ? "ff-draw-intro" : "ff-draw-view"}
        style={{ "--d": delay } as CSSProperties}
      >
        <path
          pathLength={1}
          vectorEffect="non-scaling-stroke"
          style={{ strokeWidth: "0.085em" }}
          d="M4 17C38 9 76 6 112 8.5C142 10.5 168 14 196 7"
        />
      </svg>
    </span>
  );
}
