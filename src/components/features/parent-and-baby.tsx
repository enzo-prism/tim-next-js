"use client";

import { useState, type CSSProperties } from "react";
import { ToothPerson } from "@/components/brand/pinwheel";
import { cn } from "@/lib/utils";

/**
 * A grown-up tooth-person and a little one leaning in. Tap the little one to
 * make it hop (a small easter egg, like the family in the closing band).
 */
export function ParentAndBaby({ className }: { className?: string }) {
  const [hops, setHops] = useState(0);
  return (
    <div className={cn("relative", className)}>
      <div aria-hidden="true" className="absolute inset-x-[16%] bottom-0 h-[6%] rounded-full bg-ink/[0.06]" />
      <div className="relative flex h-full items-end justify-center gap-[3%] pb-[2.5%]">
        <span aria-hidden="true" className="ff-intro-scale block h-full" style={{ "--d": 260, aspectRatio: "104 / 160" } as CSSProperties}>
          <ToothPerson color="var(--ff-periwinkle)" className="h-full w-auto -rotate-[4deg]" />
        </span>
        <button
          type="button"
          onClick={() => setHops((count) => count + 1)}
          style={{ aspectRatio: "104 / 160" }}
          className="group relative -ml-[2%] block h-[52%] rounded-2xl focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-4 focus-visible:ring-offset-lime-wash"
        >
          <span className="sr-only">Say hi to our littlest patient</span>
          <span aria-hidden="true" className="ff-intro-pop block h-full" style={{ "--d": 720 } as CSSProperties}>
            <span key={hops} className={cn("block h-full", hops > 0 && "ff-hop")}>
              <ToothPerson
                color="var(--ff-lime)"
                className="h-full w-auto -rotate-[10deg] transition-transform duration-300 group-hover:-translate-y-1.5 motion-reduce:transition-none"
              />
            </span>
          </span>
        </button>
      </div>
    </div>
  );
}
