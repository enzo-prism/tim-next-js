import type { CSSProperties } from "react";
import Image from "next/image";
import illustrationAligners from "@assets/brand/illustration-aligners.webp";
import { ToothPerson } from "@/components/brand/pinwheel";
import { Sticker } from "./feature-bits";

/**
 * Invisalign hero media: the aligner render as a floating product shot in a
 * round white lens, a blush disc behind it, and two stickers. The trays drift
 * gently with scroll.
 */
export function AlignerShowcase() {
  return (
    <div className="relative mx-auto w-[86%] max-w-[18.5rem] py-4 sm:w-full sm:max-w-[25rem] lg:max-w-[29rem]">
      <div className="relative aspect-square">
        <div aria-hidden="true" className="absolute inset-0 translate-x-[7%] translate-y-[6%] rounded-full bg-blush" />
        <div aria-hidden="true" className="absolute -left-[4%] -top-[3%] size-[22%] rounded-full bg-lime-wash ring-1 ring-ink/5" />
        <div className="relative size-full overflow-clip rounded-full bg-white shadow-float ring-8 ring-white">
          <Image
            src={illustrationAligners}
            alt="Clear aligner trays illustration"
            priority
            fill
            sizes="(max-width: 639px) 18.5rem, (max-width: 1023px) 25rem, 29rem"
            className="ff-parallax scale-[1.22] object-cover object-[97%_55%]"
            style={{ "--ff-parallax": "-5%" } as CSSProperties}
          />
        </div>
        <ToothPerson
          color="var(--ff-blush)"
          className="ff-intro-pop absolute -bottom-[2%] -left-[3%] z-[2] h-[24%] w-auto -rotate-[10deg]"
          style={{ "--d": 760 } as CSSProperties}
        />
        <Sticker dot="bg-periwinkle" className="-left-[2%] top-[16%] sm:-left-[8%]" delay={880}>
          iTero 3D scan
        </Sticker>
        <Sticker dot="bg-lime" className="-right-[1%] bottom-[18%] sm:-right-[6%]" delay={1020}>
          Smile preview
        </Sticker>
      </div>
    </div>
  );
}
