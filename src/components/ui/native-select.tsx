import * as React from "react";
import { MinimalGlyph } from "@/components/ui/minimal-glyph";
import { cn } from "@/lib/utils";

// Keep the browser's accessible picker and server-rendered options for booking.
// The wrapper only draws a calmer chevron; every prop still lands on <select>.
const NativeSelect = React.forwardRef<HTMLSelectElement, React.ComponentProps<"select">>(
  ({ className, ...props }, ref) => (
    <span className="relative block w-full min-w-0">
      <select
        ref={ref}
        className={cn(
          "flex h-12 w-full min-w-0 cursor-pointer appearance-none rounded-xl border border-input bg-white py-2 pl-4 pr-11 text-base text-ink ring-offset-white transition-[border-color,box-shadow] duration-200 hover:border-ink/60 focus:border-primary focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 forced-colors:appearance-auto forced-colors:focus:outline-2 forced-colors:focus:outline-offset-2 forced-colors:focus:outline-[CanvasText] aria-invalid:border-2 aria-invalid:border-destructive disabled:cursor-not-allowed disabled:bg-muted disabled:opacity-50 motion-reduce:transition-none",
          className,
        )}
        {...props}
      />
      <MinimalGlyph
        name="chevron-down"
        className="pointer-events-none absolute right-4 top-1/2 h-5 w-5 -translate-y-1/2 text-ink-soft forced-colors:hidden"
      />
    </span>
  ),
);
NativeSelect.displayName = "NativeSelect";

export { NativeSelect };
