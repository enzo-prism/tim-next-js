import { cn } from "@/lib/utils";

const STAR = "M10 1.6l2.47 5.01 5.53.8-4 3.9.94 5.5L10 14.2l-4.94 2.6.94-5.5-4-3.9 5.53-.8z";

/** Five filled stars beside a written rating. Decorative; the number carries the meaning. */
export function Stars({ className, count = 5 }: { className?: string; count?: number }) {
  return (
    <span aria-hidden="true" className={cn("inline-flex gap-0.5 text-cobalt", className)}>
      {Array.from({ length: count }, (_, index) => (
        <svg key={index} viewBox="0 0 20 20" className="size-[1em]" focusable="false">
          <path d={STAR} fill="currentColor" />
        </svg>
      ))}
    </span>
  );
}
