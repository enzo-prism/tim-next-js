import { cn } from "@/lib/utils";

type HeroBackdropVariant = "default" | "warm";

interface HeroBackdropProps {
  variant?: HeroBackdropVariant;
  className?: string;
}

export default function HeroBackdrop({ variant = "default", className }: HeroBackdropProps) {
  return (
    <div
      aria-hidden="true"
      className={cn(
        "pointer-events-none absolute inset-0 border-b border-border/70",
        variant === "warm" ? "bg-muted/40" : "bg-background",
        className,
      )}
    />
  );
}
