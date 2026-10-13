import type { CSSProperties } from "react";
import Image from "next/image";
import { cn } from "@/lib/utils";
import { Pinwheel } from "@/components/brand/pinwheel";
import type { ServicePhoto } from "./service-themes";

/**
 * A real office photo in the arch frame with two friendly stickers and the
 * logo pinwheel gathering behind it. Used as PageHero media on service pages.
 */
export function HeroPhoto({
  photo,
  chips,
  chipColors = ["var(--ff-lime)", "var(--ff-blush)"],
  className,
}: {
  photo: ServicePhoto;
  chips: readonly string[];
  chipColors?: [string, string];
  className?: string;
}) {
  const position = photo.position ?? "50% 50%";
  return (
    <div className={cn("relative mx-auto w-[min(74%,19rem)] sm:w-[min(62%,21rem)] lg:w-[78%] lg:max-w-[25rem]", className)}>
      <div aria-hidden="true" className="pointer-events-none absolute -right-14 -top-10 size-44 sm:-right-20 sm:size-56 lg:-right-24 lg:-top-14 lg:size-72">
        <Pinwheel gather="load" spin="page" delay={200} className="size-full" />
      </div>
      <div className="ff-arch relative aspect-[4/5] bg-white ring-8 ring-white">
        <Image
          src={photo.src}
          alt={photo.alt}
          priority
          fill
          sizes="(max-width: 639px) 74vw, (max-width: 1023px) 336px, 400px"
          quality={72}
          className="object-cover"
          style={{ objectPosition: position, scale: photo.zoom, transformOrigin: position }}
        />
      </div>
      {chips.slice(0, 2).map((chip, index) => (
        <span
          key={chip}
          className={cn(
            "ff-chip ff-intro-pop absolute z-[2] max-w-[13rem] whitespace-nowrap",
            index === 0 ? "-left-7 top-[14%] sm:-left-12" : "-right-5 bottom-[16%] sm:-right-10",
          )}
          style={{ "--d": 900 + index * 140 } as CSSProperties}
        >
          <span aria-hidden="true" className="size-2.5 shrink-0 rounded-full ring-2 ring-ink/10" style={{ background: chipColors[index] }} />
          {chip}
        </span>
      ))}
    </div>
  );
}
