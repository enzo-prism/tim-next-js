import type { CSSProperties, ReactNode } from "react";
import { cn } from "@/lib/utils";
import { BrandDots } from "@/components/brand/pinwheel";

export type SectionTone = "paper" | "cream" | "white" | "night" | "periwinkle" | "blush" | "lime" | "cloud";

// `--ff-surface` lets children (e.g. timeline marker rings) match the band.
const toneClass: Record<SectionTone, string> = {
  paper: "bg-paper text-ink [--ff-surface:var(--ff-paper)]",
  cream: "bg-cream text-ink [--ff-surface:var(--ff-cream)]",
  white: "bg-white text-ink [--ff-surface:#ffffff]",
  night: "bg-night text-white [--ff-surface:var(--ff-night)]",
  periwinkle: "bg-periwinkle-wash text-ink [--ff-surface:var(--ff-periwinkle-wash)]",
  blush: "bg-blush-wash text-ink [--ff-surface:var(--ff-blush-wash)]",
  lime: "bg-lime-wash text-ink [--ff-surface:var(--ff-lime-wash)]",
  cloud: "bg-cloud-wash text-ink [--ff-surface:var(--ff-cloud-wash)]",
};

/** Full-width band with a constrained inner container. */
export function Section({
  id,
  tone = "paper",
  className,
  innerClassName,
  width = "default",
  labelledBy,
  children,
  style,
}: {
  id?: string;
  tone?: SectionTone;
  className?: string;
  innerClassName?: string;
  width?: "default" | "narrow" | "wide" | "full";
  labelledBy?: string;
  children: ReactNode;
  style?: CSSProperties;
}) {
  return (
    <section
      id={id}
      aria-labelledby={labelledBy}
      className={cn("relative py-16 sm:py-20 lg:py-28", toneClass[tone], className)}
      style={style}
    >
      <div
        className={cn(
          "relative mx-auto px-4 sm:px-6 lg:px-8",
          width === "default" && "max-w-7xl",
          width === "narrow" && "max-w-3xl",
          width === "wide" && "max-w-[88rem]",
          width === "full" && "max-w-none px-0 sm:px-0 lg:px-0",
          innerClassName,
        )}
      >
        {children}
      </div>
    </section>
  );
}

/** Eyebrow with the logo's four "heads" as a mark. */
export function Eyebrow({ children, className, tone = "default" }: { children: ReactNode; className?: string; tone?: "default" | "night" }) {
  return (
    <p className={cn("ff-eyebrow", tone === "night" && "text-periwinkle", className)}>
      <BrandDots />
      <span>{children}</span>
    </p>
  );
}

/** Section heading block: eyebrow, display title, optional lead and actions. */
export function SectionHeader({
  id,
  eyebrow,
  title,
  lead,
  align = "left",
  tone = "default",
  as: Heading = "h2",
  className,
  actions,
  reveal = true,
}: {
  id?: string;
  eyebrow?: ReactNode;
  title: ReactNode;
  lead?: ReactNode;
  align?: "left" | "center";
  tone?: "default" | "night";
  as?: "h1" | "h2" | "h3";
  className?: string;
  actions?: ReactNode;
  reveal?: boolean;
}) {
  return (
    <div
      className={cn(
        "max-w-3xl",
        align === "center" && "mx-auto text-center [&_.ff-eyebrow]:justify-center",
        reveal && "ff-reveal",
        className,
      )}
    >
      {eyebrow ? (
        <Eyebrow tone={tone} className="mb-4">
          {eyebrow}
        </Eyebrow>
      ) : null}
      <Heading id={id} className={cn("ff-h2", tone === "night" && "text-white")}>
        {title}
      </Heading>
      {lead ? (
        <div className={cn("ff-lead mt-5", align === "center" && "mx-auto", tone === "night" && "text-white/75")}>{lead}</div>
      ) : null}
      {actions ? (
        <div className={cn("mt-7 flex flex-wrap gap-3", align === "center" && "justify-center")}>{actions}</div>
      ) : null}
    </div>
  );
}
