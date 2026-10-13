"use client";

import { useEffect, useRef, useState } from "react";
import { Button } from "@/components/ui/button";
import { MinimalGlyph } from "@/components/ui/minimal-glyph";
import { cn } from "@/lib/utils";
import { FamilyRow } from "./guide-art";

const TOTAL_MS = 120_000;
const QUARTER_MS = TOTAL_MS / 4;

// Brushed in order, sweeping clockwise from nine o'clock on the dial.
const QUADRANTS = [
  { name: "Top left", startDeg: 270, color: "var(--ff-periwinkle)", dot: "bg-periwinkle" },
  { name: "Top right", startDeg: 0, color: "var(--ff-blush)", dot: "bg-blush" },
  { name: "Bottom right", startDeg: 90, color: "var(--ff-lime)", dot: "bg-lime" },
  { name: "Bottom left", startDeg: 180, color: "var(--ff-cobalt)", dot: "bg-cobalt" },
] as const;

type Status = "idle" | "running" | "paused" | "done";

const C = 130;
const point = (deg: number, r: number) => {
  const rad = ((deg - 90) * Math.PI) / 180;
  return `${(C + r * Math.cos(rad)).toFixed(2)} ${(C + r * Math.sin(rad)).toFixed(2)}`;
};
const arc = (startDeg: number, r: number) => `M${point(startDeg + 2, r)} A${r} ${r} 0 0 1 ${point(startDeg + 88, r)}`;

function usePrefersReducedMotion() {
  const [reduce, setReduce] = useState(false);
  useEffect(() => {
    const query = window.matchMedia("(prefers-reduced-motion: reduce)");
    const update = () => setReduce(query.matches);
    update();
    query.addEventListener("change", update);
    return () => query.removeEventListener("change", update);
  }, []);
  return reduce;
}

function formatTime(ms: number) {
  const seconds = Math.max(0, Math.ceil(ms / 1000));
  return `${Math.floor(seconds / 60)}:${String(seconds % 60).padStart(2, "0")}`;
}

/**
 * "Brush along": a two-minute brushing timer that walks a family around the
 * four quarters of the mouth, 30 seconds each. It never starts on its own,
 * can be paused or reset, announces each new quarter politely, and with
 * reduced motion it simply updates once a second without animating.
 */
export function BrushAlongTimer({ className }: { className?: string }) {
  const [status, setStatus] = useState<Status>("idle");
  const [elapsed, setElapsed] = useState(0);
  const [celebrations, setCelebrations] = useState(0);
  const originRef = useRef(0);
  const reduceMotion = usePrefersReducedMotion();

  useEffect(() => {
    if (status !== "running") return;
    const tick = () => {
      const next = Math.min(TOTAL_MS, performance.now() - originRef.current);
      setElapsed(next);
      if (next >= TOTAL_MS) {
        setStatus("done");
        setCelebrations((count) => count + 1);
      }
    };
    const id = window.setInterval(tick, reduceMotion ? 1000 : 100);
    return () => window.clearInterval(id);
  }, [status, reduceMotion]);

  const start = (from: number) => {
    originRef.current = performance.now() - from;
    setElapsed(from);
    setStatus("running");
  };

  const onPrimary = () => {
    if (status === "running") {
      setStatus("paused");
      return;
    }
    if (status === "done") {
      start(0);
      return;
    }
    start(elapsed);
  };

  const onReset = () => {
    setStatus("idle");
    setElapsed(0);
  };

  // Whole seconds only when motion is reduced, so nothing glides.
  const shown = reduceMotion ? Math.floor(elapsed / 1000) * 1000 : elapsed;
  const current = Math.min(3, Math.floor(shown / QUARTER_MS));
  const total = shown / TOTAL_MS;
  const fillFor = (index: number) => Math.max(0, Math.min(1, (shown - index * QUARTER_MS) / QUARTER_MS));

  let message = "Press start, then brush each quarter of your mouth for 30 seconds.";
  if (status === "running") {
    message = current === 0 ? "Start with the top left." : current === 3 ? "Last one: the bottom left." : `Now the ${QUADRANTS[current].name.toLowerCase()}.`;
  } else if (status === "paused") {
    message = "Paused. Press resume when you’re ready.";
  } else if (status === "done") {
    message = "All done. Two great minutes! Spit, and skip the rinse so the fluoride keeps working.";
  }

  const primaryLabel = status === "running" ? "Pause" : status === "paused" ? "Resume" : status === "done" ? "Brush again" : "Start brushing";

  return (
    <div className={cn("rounded-3xl bg-white p-5 ring-1 ring-border sm:p-8", className)}>
      <div className="grid items-center gap-8 md:grid-cols-[minmax(0,17rem)_minmax(0,1fr)] md:gap-10">
        <div className="relative mx-auto w-full max-w-[17rem]">
          <svg viewBox="0 0 260 260" className="block size-full" aria-hidden="true" focusable="false">
            {/* Total progress ring */}
            <circle cx={C} cy={C} r={124} fill="none" stroke="var(--ff-cream)" strokeWidth={6} />
            <circle
              cx={C}
              cy={C}
              r={124}
              fill="none"
              stroke="var(--ff-ink)"
              strokeWidth={6}
              strokeLinecap="round"
              pathLength={1}
              strokeDasharray={1}
              strokeDashoffset={1 - total}
              transform={`rotate(180 ${C} ${C})`}
              opacity={total > 0 ? 1 : 0}
            />
            {/* The four quarters of the mouth */}
            {QUADRANTS.map((quadrant, index) => (
              <g key={quadrant.name}>
                <path d={arc(quadrant.startDeg, 88)} fill="none" stroke="var(--ff-cream)" strokeWidth={38} />
                <path
                  d={arc(quadrant.startDeg, 88)}
                  fill="none"
                  stroke={quadrant.color}
                  strokeWidth={38}
                  pathLength={1}
                  strokeDasharray={1}
                  strokeDashoffset={1 - fillFor(index)}
                  opacity={fillFor(index) > 0 ? 1 : 0}
                />
              </g>
            ))}
          </svg>
          <div className="absolute inset-0 grid place-items-center text-center">
            <div>
              <p role="timer" aria-label={`${formatTime(TOTAL_MS - shown)} left`} className="font-display text-5xl font-semibold leading-none tracking-tight text-ink tabular-nums">
                {formatTime(TOTAL_MS - shown)}
              </p>
              <p aria-hidden="true" className="mt-2 text-[0.7rem] font-bold uppercase tracking-[0.14em] text-ink-soft">
                {status === "done" ? "Sparkling" : status === "idle" ? "Two minutes" : QUADRANTS[current].name}
              </p>
            </div>
          </div>
        </div>

        <div>
          <p aria-live="polite" className="min-h-[3.5rem] font-display text-xl font-semibold leading-snug text-ink sm:text-2xl">
            {message}
          </p>
          <div className="mt-5 flex flex-col gap-3 sm:flex-row">
            <Button type="button" size="lg" onClick={onPrimary} className="h-13 min-w-40 px-7 text-base">
              {primaryLabel}
            </Button>
            <Button type="button" size="lg" variant="outline" onClick={onReset} disabled={status === "idle" && elapsed === 0} className="h-13 px-7 text-base">
              Reset
            </Button>
          </div>
          <ol className="mt-7 grid grid-cols-2 gap-2" aria-label="The four quarters of the mouth">
            {QUADRANTS.map((quadrant, index) => {
              const done = fillFor(index) >= 1;
              const active = status !== "idle" && status !== "done" && index === current;
              return (
                <li
                  key={quadrant.name}
                  aria-current={active ? "step" : undefined}
                  className={cn(
                    "flex min-h-11 items-center gap-2.5 rounded-full px-3 text-sm font-semibold transition-colors",
                    active ? "bg-ink text-white" : "bg-cream text-ink",
                  )}
                >
                  <span aria-hidden="true" className={cn("grid size-5 shrink-0 place-items-center rounded-full text-[0.7rem] font-bold", quadrant.dot, index === 3 ? "text-white" : "text-ink")}>
                    {done ? <MinimalGlyph name="check" /> : index + 1}
                  </span>
                  {quadrant.name}
                  {done ? <span className="sr-only"> (done)</span> : null}
                </li>
              );
            })}
          </ol>
          <div className="mt-6 flex items-end gap-4">
            <span key={celebrations} className={cn("block h-12 shrink-0", celebrations > 0 && "ff-hop")}>
              <FamilyRow className="h-12 w-auto" />
            </span>
            <p className="text-sm leading-snug text-ink-soft">Tip: let kids press start. Grown-ups brush along, too.</p>
          </div>
        </div>
      </div>
    </div>
  );
}
