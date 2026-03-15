import Link from "next/link";
import { CalendarDays, Clock3, ArrowRight } from "lucide-react";
import { format } from "date-fns";
import type { BlogPost } from "@/content/blog";
import { getBlogPostHref } from "@/content/blog";

export default function BlogPostCard({ post }: { post: BlogPost }) {
  return (
    <article className="group flex h-full flex-col rounded-[2rem] border border-slate-200 bg-white p-6 shadow-sm transition-all duration-300 hover:-translate-y-1 hover:shadow-xl">
      <div className="flex items-center gap-2 text-xs font-semibold uppercase tracking-[0.18em] text-primary/80">
        <span className="rounded-full bg-primary/8 px-3 py-1 text-primary">{post.category}</span>
      </div>

      <h2 className="mt-5 text-2xl font-bold leading-tight text-slate-900">
        <Link href={getBlogPostHref(post.slug)} className="transition-colors hover:text-primary">
          {post.title}
        </Link>
      </h2>

      <p className="mt-4 flex-1 text-base leading-7 text-slate-600">{post.excerpt}</p>

      <div className="mt-6 flex flex-wrap gap-4 text-sm text-slate-500">
        <span className="inline-flex items-center gap-2">
          <CalendarDays className="h-4 w-4" />
          {format(new Date(post.publishedAt), "MMMM d, yyyy")}
        </span>
        <span className="inline-flex items-center gap-2">
          <Clock3 className="h-4 w-4" />
          {post.readingTimeMinutes} min read
        </span>
      </div>

      <Link
        href={getBlogPostHref(post.slug)}
        className="mt-6 inline-flex items-center gap-2 text-sm font-semibold text-primary transition-colors hover:text-primary/80"
      >
        Read article
        <ArrowRight className="h-4 w-4" />
      </Link>
    </article>
  );
}
