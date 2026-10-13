import type { HeroTone } from "@/components/site/page-hero";

/** Which tooth-people scene a blog cover shows. */
export type CoverKind = "kids" | "prevention" | "alignment" | "jaw" | "sports";

export type EditorialTheme = {
  kind: CoverKind;
  /** Soft panel behind the cover art. */
  wash: string;
  /** Solid brand color (dots, chips). */
  solid: string;
  /** Hero tone for the article page. */
  heroTone: HeroTone;
};

const themes: Record<CoverKind, EditorialTheme> = {
  kids: { kind: "kids", wash: "bg-lime-wash", solid: "bg-lime", heroTone: "lime" },
  prevention: { kind: "prevention", wash: "bg-cloud-wash", solid: "bg-cloud", heroTone: "cloud" },
  alignment: { kind: "alignment", wash: "bg-blush-wash", solid: "bg-blush", heroTone: "blush" },
  jaw: { kind: "jaw", wash: "bg-periwinkle-wash", solid: "bg-periwinkle", heroTone: "periwinkle" },
  sports: { kind: "sports", wash: "bg-periwinkle-wash", solid: "bg-periwinkle", heroTone: "periwinkle" },
};

const categoryKinds: Record<string, CoverKind> = {
  "Children's Dentistry": "kids",
  "Preventive Care": "prevention",
  "Preventive Dentistry": "prevention",
  "Invisalign & Orthodontics": "alignment",
  "TMJ & Bruxism": "jaw",
  "Sports Dentistry": "sports",
};

export function getEditorialTheme(category: string): EditorialTheme {
  return themes[categoryKinds[category] ?? "prevention"];
}

/** Small stable number from a slug, so each article keeps the same cover pose. */
export function seedFromSlug(slug: string) {
  let hash = 0;
  for (let index = 0; index < slug.length; index += 1) {
    hash = (hash * 31 + slug.charCodeAt(index)) >>> 0;
  }
  return hash;
}

/** Brand dot for each blog topic chip. */
export const topicDotClass: Record<string, string> = {
  children: "bg-lime",
  prevention: "bg-cloud ring-1 ring-ink/15",
  alignment: "bg-blush",
  "jaw-pain": "bg-periwinkle",
  sports: "bg-periwinkle",
  urgent: "bg-blush",
};

/**
 * Column spans that never leave a short last row: three across on desktop
 * (a 6-column grid, with one or two rows of wider cards first when the count
 * is not a multiple of three) and two across on tablets (the first card spans
 * the row when the count is odd).
 */
export function getBalancedSpan(count: number, index: number) {
  if (count === 1) return { className: "md:col-span-2 lg:col-span-6", wideAtMd: true, wideAtLg: true, large: true };
  const wideCards = count % 3 === 1 ? 4 : count % 3 === 2 ? 2 : 0;
  const isWideLg = index < wideCards;
  const isWideMd = count % 2 === 1 && index === 0;
  return {
    className: [isWideMd ? "md:col-span-2" : "", isWideLg ? "lg:col-span-3" : "lg:col-span-2"].filter(Boolean).join(" "),
    wideAtMd: isWideMd,
    wideAtLg: false,
    large: isWideLg,
  };
}
