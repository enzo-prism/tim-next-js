import Image, { type StaticImageData } from "next/image";
import type { CSSProperties } from "react";
import { cn } from "@/lib/utils";

export type StripPhoto = { src: StaticImageData; alt: string; caption?: string; position?: string };

/**
 * A row of real office photos in arch frames, staggered up and down, that
 * drifts sideways as you scroll (wide screens) and swipes on phones.
 */
export function PhotoStrip({ photos, className }: { photos: StripPhoto[]; className?: string }) {
  return (
    <div className={cn("ff-marquee-scope", className)}>
      <ul className="ff-marquee items-start" data-direction="left" aria-label="Office photos">
        {photos.map((photo, index) => (
          <li key={photo.alt} className={cn("w-[min(68vw,17rem)] lg:w-[19rem]", index % 2 === 1 && "lg:mt-16")} style={{ "--i": index } as CSSProperties}>
            <figure>
              <div className={cn("relative aspect-[3/4] overflow-hidden bg-cream", index % 3 === 0 ? "ff-arch" : "rounded-3xl")}>
                <Image
                  src={photo.src}
                  alt={photo.alt}
                  fill
                  sizes="(max-width: 1023px) 68vw, 304px"
                  quality={70}
                  className="object-cover"
                  style={{ objectPosition: photo.position ?? "50% 50%" }}
                />
              </div>
              {photo.caption ? <figcaption className="mt-3 px-1 text-sm font-semibold text-ink-soft">{photo.caption}</figcaption> : null}
            </figure>
          </li>
        ))}
      </ul>
    </div>
  );
}
