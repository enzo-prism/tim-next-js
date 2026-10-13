"use client";

import { useState, type CSSProperties } from "react";
import { cn } from "@/lib/utils";
import { ToothPerson } from "./pinwheel";
import { BRAND_TOOTH_COLORS } from "./tooth-shapes";

// The logo family standing in a row: two grown-ups and two kids.
const members = [
  { color: BRAND_TOOTH_COLORS[0], height: "100%" },
  { color: BRAND_TOOTH_COLORS[1], height: "90%" },
  { color: BRAND_TOOTH_COLORS[3], height: "58%" },
  { color: BRAND_TOOTH_COLORS[2], height: "72%" },
];

/**
 * The tooth-people family. Tapping them makes everyone hop (a small easter
 * egg); with reduced motion the button simply does nothing visible.
 */
export function ToothFamily({ className, label = "Say hi to the Family First family" }: { className?: string; label?: string }) {
  const [hops, setHops] = useState(0);
  return (
    <button
      type="button"
      onClick={() => setHops((count) => count + 1)}
      className={cn(
        "group flex items-end gap-[6%] rounded-2xl p-2 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-periwinkle focus-visible:ring-offset-2 focus-visible:ring-offset-night",
        className,
      )}
    >
      <span className="sr-only">{label}</span>
      {members.map((member, index) => (
        <span
          key={`${member.color}-${hops}`}
          aria-hidden="true"
          className={cn("flex h-full items-end", hops > 0 && "ff-hop")}
          style={{ "--k": index, height: member.height, aspectRatio: "104 / 160" } as CSSProperties}
        >
          <ToothPerson color={member.color} className="h-full w-auto transition-transform duration-300 group-hover:-translate-y-1" />
        </span>
      ))}
    </button>
  );
}
