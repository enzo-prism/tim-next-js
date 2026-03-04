import meshDefault from "@assets/brand/mesh-hero-bluegreen.webp";
import meshWarm from "@assets/brand/mesh-hero-warm.webp";
import { cn } from "@/lib/utils";

type HeroBackdropVariant = "default" | "warm";

interface HeroBackdropProps {
  variant?: HeroBackdropVariant;
  className?: string;
}

export default function HeroBackdrop({
  variant = "default",
  className,
}: HeroBackdropProps) {
  const mesh = variant === "warm" ? meshWarm.src : meshDefault.src;

  return (
    <div
      aria-hidden="true"
      className={cn("pointer-events-none absolute inset-0 overflow-hidden", className)}
    >
      <div className="absolute inset-0 bg-gradient-to-b from-white via-white to-gray-50" />

      <img
        src={mesh}
        alt=""
        className="absolute inset-0 h-full w-full object-cover opacity-60"
        loading="eager"
        decoding="async"
      />

      {/* Soft orbs to keep the backdrop feeling dimensional even before the mesh loads */}
      <div className="absolute -top-24 -left-24 h-80 w-80 rounded-full bg-primary/20 blur-3xl" />
      <div className="absolute -bottom-28 -right-24 h-96 w-96 rounded-full bg-secondary/20 blur-3xl" />
      <div className="absolute top-1/3 -right-24 h-72 w-72 rounded-full bg-accent/15 blur-3xl" />

      {/* Gentle fade to improve text legibility */}
      <div className="absolute inset-0 bg-gradient-to-r from-white/70 via-white/20 to-white/0" />
    </div>
  );
}
