import type { CSSProperties } from "react";
import Link from "next/link";
import { format, parseISO } from "date-fns";
import { MinimalGlyph } from "@/components/ui/minimal-glyph";
import { Pinwheel } from "@/components/brand/pinwheel";
import { getBlogPostHref, type BlogPost } from "@/content/blog";
import { cn } from "@/lib/utils";
import { getEditorialTheme } from "./editorial-theme";
import { PostCover } from "./post-cover";

/** The blog hero's feature: the most recently updated article as a pinned card. */
export function FeaturedPostCard({ post, articleCount, topicCount }: { post: BlogPost; articleCount: number; topicCount: number }) {
  const theme = getEditorialTheme(post.category);
  const wasUpdated = post.updatedAt !== post.publishedAt;
  const date = wasUpdated ? post.updatedAt : post.publishedAt;

  return (
    <div className="relative mx-auto w-full max-w-xl lg:mr-0">
      <div aria-hidden="true" className="pointer-events-none absolute -right-3 -top-9 size-28 sm:-right-8 sm:-top-12 sm:size-36 lg:-left-16 lg:-top-14 lg:right-auto lg:size-44">
        <Pinwheel gather="load" spin="page" delay={300} className="size-full" />
      </div>

      <article className="ff-lift group relative z-[1] rounded-3xl bg-white p-2.5 shadow-float ring-1 ring-border transition-[rotate,translate,box-shadow] duration-500 lg:rotate-[1.25deg] lg:hover:rotate-0">
        <div className="relative">
          <PostCover category={post.category} slug={post.slug} className="aspect-[16/9] rounded-2xl" />
          <span className="ff-chip ff-intro-pop absolute left-3 top-3 text-xs sm:left-4 sm:top-4" style={{ "--d": 760 } as CSSProperties}>
            <span aria-hidden="true" className="size-2 rounded-full bg-cobalt" />
            {wasUpdated ? "Freshly updated" : "Newest article"}
          </span>
        </div>
        <div className="px-4 pb-4 pt-5 sm:px-6 sm:pb-6">
          <p className="flex items-center gap-2 text-xs font-bold uppercase tracking-[0.12em] text-ink-soft">
            <span aria-hidden="true" className={cn("size-2.5 rounded-full", theme.solid)} />
            {post.category}
          </p>
          <h2 className="mt-3 font-display text-2xl font-semibold leading-tight tracking-[-0.02em] text-ink sm:text-[1.75rem]">
            <Link
              href={getBlogPostHref(post.slug)}
              className="rounded-sm outline-none transition-colors after:absolute after:inset-0 after:rounded-3xl group-hover:text-cobalt-deep focus-visible:after:ring-2 focus-visible:after:ring-ring focus-visible:after:ring-offset-2"
            >
              {post.title}
            </Link>
          </h2>
          <p className="mt-3 text-base leading-relaxed text-ink-soft">{post.excerpt}</p>
          <div className="mt-5 flex items-center justify-between gap-4 text-sm text-ink-soft">
            <p>
              <span className="font-semibold text-ink">{post.readingTimeMinutes} min read</span>
              <span aria-hidden="true" className="mx-2 text-ink/25">
                ·
              </span>
              {wasUpdated ? "Updated " : ""}
              <time dateTime={date}>{format(parseISO(date), "MMMM d, yyyy")}</time>
            </p>
            <span aria-hidden="true" className="ff-arrow grid size-10 shrink-0 place-items-center rounded-full bg-cobalt text-white">
              <MinimalGlyph name="arrow-right" />
            </span>
          </div>
        </div>
      </article>

      <p
        className="ff-chip ff-intro-pop absolute -bottom-5 left-4 z-[2] text-xs sm:-left-6 sm:text-sm"
        style={{ "--d": 900 } as CSSProperties}
      >
        <span aria-hidden="true" className="size-2.5 rounded-full bg-lime ring-2 ring-ink/10" />
        {articleCount} articles · {topicCount} topics
      </p>
    </div>
  );
}
