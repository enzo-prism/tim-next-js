import { MinimalGlyph } from "@/components/ui/minimal-glyph";

type TocItem = {
  id: string;
  title: string;
};

const number = (index: number) => String(index + 1).padStart(2, "0");

/**
 * "On this page" navigation. Phones get a collapsed <details> above the
 * article; desktop gets a quiet numbered list meant to sit in a sticky column.
 */
export default function BlogTableOfContents({
  items,
  className,
  topHref,
}: {
  items: TocItem[];
  className?: string;
  /** Optional "Back to top" target shown under the desktop list. */
  topHref?: string;
}) {
  if (!items.length) return null;

  return (
    <nav aria-label="On this page" className={className}>
      <details className="group rounded-2xl bg-white ring-1 ring-border lg:hidden">
        <summary className="flex min-h-14 cursor-pointer list-none items-center justify-between gap-4 rounded-2xl px-5 py-3 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring [&::-webkit-details-marker]:hidden">
          <span className="flex items-baseline gap-2.5">
            <span className="text-xs font-bold uppercase tracking-[0.14em] text-cobalt-deep">On this page</span>
            <span className="text-sm text-ink-soft">{items.length} sections</span>
          </span>
          <span
            aria-hidden="true"
            className="grid size-9 shrink-0 place-items-center rounded-full bg-cream text-ink transition-[rotate,background-color] duration-300 group-open:rotate-180 group-open:bg-ink group-open:text-white motion-reduce:transition-none"
          >
            <MinimalGlyph name="chevron-down" />
          </span>
        </summary>
        <ol className="space-y-0.5 border-t border-border px-3 py-3">
          {items.map((item, index) => (
            <li key={item.id}>
              <a
                href={`#${item.id}`}
                className="flex min-h-11 items-baseline gap-3 rounded-xl px-2 py-2.5 text-[0.95rem] leading-snug text-ink transition-colors hover:bg-cream focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
              >
                <span aria-hidden="true" className="w-5 shrink-0 font-display text-sm font-semibold text-cobalt tabular-nums">
                  {number(index)}
                </span>
                <span>{item.title}</span>
              </a>
            </li>
          ))}
        </ol>
      </details>

      <div className="hidden lg:block">
        <p className="ff-eyebrow">On this page</p>
        <ol className="mt-5 border-l border-border">
          {items.map((item, index) => (
            <li key={item.id}>
              <a
                href={`#${item.id}`}
                className="group/link -ml-px flex gap-3 border-l-2 border-transparent py-2 pl-4 text-sm leading-snug text-ink-soft transition-colors hover:border-cobalt hover:text-ink focus-visible:rounded-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
              >
                <span aria-hidden="true" className="w-5 shrink-0 font-display font-semibold text-ink/35 tabular-nums transition-colors group-hover/link:text-cobalt">
                  {number(index)}
                </span>
                <span>{item.title}</span>
              </a>
            </li>
          ))}
        </ol>
        {topHref ? (
          <a
            href={topHref}
            className="mt-6 inline-flex min-h-11 items-center gap-2 rounded-full text-sm font-semibold text-ink-soft transition-colors hover:text-cobalt focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
          >
            <MinimalGlyph name="chevron-up" />
            Back to top
          </a>
        ) : null}
      </div>
    </nav>
  );
}
