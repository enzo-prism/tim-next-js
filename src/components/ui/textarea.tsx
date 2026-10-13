import * as React from "react"

import { cn } from "@/lib/utils"

const Textarea = React.forwardRef<
  HTMLTextAreaElement,
  React.ComponentProps<"textarea">
>(({ className, ...props }, ref) => {
  return (
    <textarea
      className={cn(
        "flex min-h-28 w-full min-w-0 resize-y rounded-xl border border-input bg-white px-4 py-3 text-base leading-relaxed text-ink ring-offset-white transition-[border-color,box-shadow] duration-200 placeholder:text-ink-soft/70 hover:border-ink/60 focus-visible:border-primary focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 forced-colors:focus-visible:outline-2 forced-colors:focus-visible:outline-offset-2 forced-colors:focus-visible:outline-[CanvasText] aria-invalid:border-2 aria-invalid:border-destructive disabled:cursor-not-allowed disabled:bg-muted disabled:opacity-50 motion-reduce:transition-none",
        className
      )}
      ref={ref}
      {...props}
    />
  )
})
Textarea.displayName = "Textarea"

export { Textarea }
