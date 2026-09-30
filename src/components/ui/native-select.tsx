import * as React from "react";
import { cn } from "@/lib/utils";

// Keep the browser's accessible picker and server-rendered options for booking.
const NativeSelect = React.forwardRef<HTMLSelectElement, React.ComponentProps<"select">>(
  ({ className, ...props }, ref) => (
    <select
      ref={ref}
      className={cn(
        "flex h-11 w-full min-w-0 rounded-md border border-input bg-background px-3 py-2 text-base text-foreground ring-offset-background md:text-sm focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 forced-colors:focus:outline-2 forced-colors:focus:outline-offset-2 forced-colors:focus:outline-[CanvasText] aria-invalid:border-2 aria-invalid:border-primary disabled:cursor-not-allowed disabled:bg-muted disabled:opacity-50",
        className,
      )}
      {...props}
    />
  ),
);
NativeSelect.displayName = "NativeSelect";

export { NativeSelect };
