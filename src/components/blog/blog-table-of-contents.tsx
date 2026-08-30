import { cn } from "@/lib/utils";

type TocItem = {
  id: string;
  title: string;
};

export default function BlogTableOfContents({
  items,
  className,
}: {
  items: TocItem[];
  className?: string;
}) {
  if (!items.length) return null;

  return (
    <nav
      aria-label="On this page"
      className={cn("rounded-xl border border-slate-200 bg-white p-6 shadow-sm", className)}
    >
      <div className="flex items-center gap-2 text-sm font-semibold uppercase tracking-[0.18em] text-primary">
        On this page
      </div>
      <div className="mt-5">
        <ol className="space-y-3 text-sm leading-6 text-slate-600">
          {items.map((item) => (
            <li key={item.id}>
              <a href={`#${item.id}`} className="transition-colors hover:text-primary">
                {item.title}
              </a>
            </li>
          ))}
        </ol>
      </div>
    </nav>
  );
}
