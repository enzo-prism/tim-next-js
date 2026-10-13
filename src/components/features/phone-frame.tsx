import type { CSSProperties, ReactNode } from "react";
import Image from "next/image";
import { cn } from "@/lib/utils";

/**
 * A small phone-shaped frame for portrait reel stills. It settles straight as
 * it scrolls into view.
 */
export function PhoneFrame({
  src,
  alt,
  caption,
  width,
  height,
  tilt = "0deg",
  index = 0,
  className,
  sizes = "(max-width: 639px) 44vw, 220px",
}: {
  src: string;
  alt: string;
  caption?: ReactNode;
  width: number;
  height: number;
  tilt?: string;
  index?: number;
  className?: string;
  sizes?: string;
}) {
  return (
    <figure className={cn("ff-straighten", className)} style={{ "--ff-tilt": tilt, "--i": index } as CSSProperties}>
      <div className="relative rounded-3xl bg-night p-1.5 shadow-float sm:p-2">
        <span aria-hidden="true" className="absolute left-[calc(50%-1.25rem)] top-3.5 z-[1] h-1.5 w-10 rounded-full bg-night/70 sm:top-4" />
        <div className="relative overflow-clip rounded-2xl bg-cream" style={{ aspectRatio: `${width} / ${height}` }}>
          <Image src={src} alt={alt} width={width} height={height} sizes={sizes} className="size-full object-cover" />
        </div>
      </div>
      {caption ? <figcaption className="mt-3 px-1 text-center text-sm font-semibold leading-snug text-ink">{caption}</figcaption> : null}
    </figure>
  );
}
