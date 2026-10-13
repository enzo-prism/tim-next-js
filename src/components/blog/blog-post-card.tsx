import Link from "next/link";
import { format, parseISO } from "date-fns";
import { MinimalGlyph } from "@/components/ui/minimal-glyph";
import { PostCover } from "@/components/editorial/post-cover";
import { getEditorialTheme } from "@/components/editorial/editorial-theme";
import { cn } from "@/lib/utils";
import type { BlogPost } from "@/content/blog";
import { getBlogPostHref } from "@/content/blog";

/**
 * Article card: generated category cover, category, title, excerpt, and
 * reading time. The title link stretches over the whole card.
 *
 * `large` makes the card a feature card on desktop; `wideAtMd` lays it out
 * side by side when it spans both tablet columns; `wideAtLg` keeps that
 * side-by-side layout on desktop too (a lone result).
 */
export default function BlogPostCard({
  post,
  as: Heading = "h3",
  large = false,
  wideAtMd = false,
  wideAtLg = false,
  className,
}: {
  post: BlogPost;
  as?: "h2" | "h3";
  large?: boolean;
  wideAtMd?: boolean;
  wideAtLg?: boolean;
  className?: string;
}) {
  const theme = getEditorialTheme(post.category);
  const wasUpdated = post.updatedAt !== post.publishedAt;
  const dateLabel = `${wasUpdated ? "Updated " : ""}${format(parseISO(wasUpdated ? post.updatedAt : post.publishedAt), "MMM d, yyyy")}`;

  return (
    <article
      className={cn(
        // Phones: a compact row (thumbnail + title). Larger screens: a stacked card.
        "ff-lift group relative grid h-full grid-cols-[5.25rem_minmax(0,1fr)] rounded-3xl min-[380px]:grid-cols-[6.5rem_minmax(0,1fr)] bg-white p-2 ring-1 ring-border sm:flex sm:flex-col",
        wideAtMd && "md:grid md:grid-cols-2 md:gap-2",
        wideAtMd && !wideAtLg && "lg:flex",
        className,
      )}
    >
      <PostCover
        category={post.category}
        slug={post.slug}
        className={cn(
          "aspect-square self-start rounded-2xl sm:aspect-[3/2] sm:self-auto",
          large && "lg:aspect-[16/9]",
          wideAtMd && "md:aspect-auto md:h-full md:min-h-72",
          wideAtMd && !wideAtLg && (large ? "lg:aspect-[16/9] lg:h-auto lg:min-h-0" : "lg:aspect-[3/2] lg:h-auto lg:min-h-0"),
        )}
      />

      <div className={cn("flex flex-1 flex-col px-3.5 py-1.5 sm:px-5 sm:pb-4 sm:pt-5", (large || wideAtMd) && "sm:px-6 sm:pb-6", wideAtMd && "md:pt-6")}>
        <p className="flex items-center gap-2 text-[0.6875rem] font-bold uppercase tracking-[0.12em] text-ink-soft sm:text-xs">
          <span aria-hidden="true" className={cn("size-2.5 shrink-0 rounded-full", theme.solid, theme.kind === "prevention" && "ring-1 ring-ink/15")} />
          {post.category}
        </p>

        <Heading
          className={cn(
            "mt-1.5 font-display text-[1.1rem] font-semibold leading-snug tracking-[-0.015em] text-ink sm:mt-3 sm:text-xl",
            large && "lg:text-2xl",
            wideAtMd && "md:text-2xl",
            wideAtMd && !wideAtLg && !large && "lg:text-xl",
          )}
        >
          <Link
            href={getBlogPostHref(post.slug)}
            className="rounded-sm outline-none transition-colors after:absolute after:inset-0 after:rounded-3xl group-hover:text-cobalt-deep focus-visible:after:ring-2 focus-visible:after:ring-ring focus-visible:after:ring-offset-2"
          >
            {post.title}
          </Link>
        </Heading>

        <p className={cn("mt-3 line-clamp-3 text-[0.975rem] leading-relaxed text-ink-soft max-sm:hidden", (large || wideAtMd) && "sm:text-base")}>
          {post.excerpt}
        </p>

        <div className="mt-auto flex items-center justify-between gap-4 pt-2.5 text-[0.8125rem] text-ink-soft sm:pt-6 sm:text-sm">
          <p className="flex flex-wrap items-center gap-x-2 gap-y-1">
            <span className="font-semibold text-ink">{post.readingTimeMinutes} min read</span>
            <span aria-hidden="true" className="text-ink/25">
              ·
            </span>
            <span>{dateLabel}</span>
          </p>
          <span
            aria-hidden="true"
            className="ff-arrow grid size-10 shrink-0 place-items-center rounded-full bg-cream text-ink transition-colors group-hover:bg-ink group-hover:text-white max-sm:hidden"
          >
            <MinimalGlyph name="arrow-right" />
          </span>
        </div>
      </div>
    </article>
  );
}
