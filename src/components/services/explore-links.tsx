import type { CSSProperties } from "react";
import { Link } from "wouter";
import { cn } from "@/lib/utils";
import { ToothPerson } from "@/components/brand/pinwheel";
import { MinimalGlyph } from "@/components/ui/minimal-glyph";
import { SectionHeader } from "@/components/site/section";
import type { RelatedLink } from "@/lib/internal-links";

const cards = [
  { wash: "bg-periwinkle-wash", color: "var(--ff-periwinkle)" },
  { wash: "bg-blush-wash", color: "var(--ff-blush)" },
  { wash: "bg-lime-wash", color: "var(--ff-lime)" },
  { wash: "bg-cloud-wash", color: "var(--ff-cloud)" },
];

/**
 * Related pages: the first four as colorful cards (always a full row), the
 * rest as a tidy row of pill links, so the grid never ends on a short row.
 */
export function ExploreLinks({
  id,
  eyebrow = "Keep exploring",
  title = "Related services & resources",
  links,
}: {
  id: string;
  eyebrow?: string;
  title?: string;
  links: RelatedLink[];
}) {
  if (!links.length) return null;
  const featured = links.slice(0, 4);
  const more = links.slice(4);
  const columns = featured.length === 4 ? "sm:grid-cols-2 lg:grid-cols-4" : featured.length === 3 ? "md:grid-cols-3" : featured.length === 2 ? "sm:grid-cols-2" : "";

  return (
    <div>
      <SectionHeader id={id} eyebrow={eyebrow} title={title} />
      <ul className={cn("mt-10 grid gap-4", columns)}>
        {featured.map((link, index) => {
          const card = cards[index % cards.length];
          return (
            <li key={link.href} className="ff-reveal" style={{ "--i": index } as CSSProperties}>
              <Link
                href={link.href}
                className={cn(
                  "ff-lift group relative flex h-full flex-col overflow-clip rounded-3xl p-6 sm:min-h-44 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2",
                  card.wash,
                )}
              >
                <ToothPerson
                  color={card.color}
                  className="pointer-events-none absolute -bottom-5 -right-2 h-20 w-auto rotate-[-8deg] transition-[rotate,translate] duration-500 ease-[var(--ease-spring)] group-hover:-translate-y-1.5 group-hover:rotate-[4deg] motion-reduce:transition-none"
                />
                <span className="relative block pr-6 text-lg font-bold leading-snug text-ink">{link.title}</span>
                {link.description ? <span className="relative mt-1.5 block pr-8 text-sm leading-relaxed text-ink-soft">{link.description}</span> : null}
                <span aria-hidden="true" className="relative mt-auto block pt-4 sm:pt-5">
                  <span className="ff-arrow grid size-9 place-items-center rounded-full bg-white text-ink ring-1 ring-ink/5 transition-colors group-hover:bg-ink group-hover:text-white">
                    <MinimalGlyph name="arrow-right" />
                  </span>
                </span>
              </Link>
            </li>
          );
        })}
      </ul>
      {more.length ? (
        <div className="ff-reveal mt-6 flex flex-wrap items-center gap-2">
          <span className="mr-2 text-sm font-bold text-ink-soft">Also helpful:</span>
          {more.map((link) => (
            <Link
              key={link.href}
              href={link.href}
              className="group inline-flex min-h-11 items-center gap-2 rounded-full border border-ink/15 bg-white px-4 text-sm font-semibold text-ink transition-colors hover:border-ink/30 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
            >
              {link.title}
              <MinimalGlyph name="arrow-right" className="ff-arrow text-xs" />
            </Link>
          ))}
        </div>
      ) : null}
    </div>
  );
}
