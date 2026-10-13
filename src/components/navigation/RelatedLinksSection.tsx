import type { CSSProperties } from "react";
import { MinimalGlyph } from "@/components/ui/minimal-glyph";
import { Link } from "wouter";
import type { RelatedLink } from "@/lib/internal-links";

const washes = ["bg-periwinkle-wash", "bg-blush-wash", "bg-lime-wash", "bg-cloud-wash"];

export default function RelatedLinksSection({
  title,
  links,
}: {
  title: string;
  links: RelatedLink[];
}) {
  if (!links.length) return null;

  return (
    <section className="mt-16">
      <div className="mb-6 flex items-end justify-between gap-6">
        <h2 className="ff-h3 ff-reveal text-2xl sm:text-3xl">{title}</h2>
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        {links.map((link, index) => (
          <Link
            key={link.href}
            href={link.href}
            className={`ff-reveal ff-lift group block h-full rounded-3xl p-6 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 ${washes[index % washes.length]}`}
            style={{ "--i": index % 3 } as CSSProperties}
          >
            <div className="flex h-full flex-col justify-between gap-5">
              <div>
                <h3 className="text-lg font-bold text-ink">{link.title}</h3>
                {link.description ? <p className="mt-1.5 text-sm leading-relaxed text-ink-soft">{link.description}</p> : null}
              </div>
              <span aria-hidden="true" className="ff-arrow grid size-9 place-items-center rounded-full bg-white text-ink ring-1 ring-ink/5 transition-colors group-hover:bg-ink group-hover:text-white">
                <MinimalGlyph name="arrow-right" />
              </span>
            </div>
          </Link>
        ))}
      </div>
    </section>
  );
}
