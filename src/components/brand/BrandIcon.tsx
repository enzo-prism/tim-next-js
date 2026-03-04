import iconTooth from "@assets/brand/icon-tooth.png";
import iconChild from "@assets/brand/icon-child.png";
import iconSparkles from "@assets/brand/icon-sparkles.png";
import iconSmile from "@assets/brand/icon-smile.png";
import iconJaw from "@assets/brand/icon-jaw.png";
import { cn } from "@/lib/utils";

export type BrandIconName = "tooth" | "child" | "sparkles" | "smile" | "activity";

const ICONS: Record<BrandIconName, string> = {
  tooth: iconTooth.src,
  child: iconChild.src,
  sparkles: iconSparkles.src,
  smile: iconSmile.src,
  activity: iconJaw.src,
};

interface BrandIconProps {
  name: BrandIconName;
  className?: string;
}

export default function BrandIcon({ name, className }: BrandIconProps) {
  return (
    <img
      src={ICONS[name]}
      alt=""
      aria-hidden="true"
      className={cn("inline-block brightness-0 invert", className)}
      loading="lazy"
      decoding="async"
    />
  );
}
