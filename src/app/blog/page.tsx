import type { CSSProperties } from "react";
import type { Metadata } from "next";
import Link from "next/link";
import BlogPostCard from "@/components/blog/blog-post-card";
import { Button } from "@/components/ui/button";
import { MinimalGlyph } from "@/components/ui/minimal-glyph";
import { ToothPerson } from "@/components/brand/pinwheel";
import { PageHero } from "@/components/site/page-hero";
import { Eyebrow } from "@/components/site/section";
import { CtaBand } from "@/components/site/cta-band";
import { FeaturedPostCard } from "@/components/editorial/featured-post-card";
import { getBalancedSpan, topicDotClass } from "@/components/editorial/editorial-theme";
import { AppointmentLink, PhoneLink } from "@/components/tracking/tracked-links";
import { buildAppointmentUrl } from "@/lib/analytics";
import { buildRouteMetadata } from "@/lib/metadata";
import { cn } from "@/lib/utils";
import { practiceHoursSummary } from "@/content/practice-hours";
import {
  blogTopics,
  getAllBlogPosts,
  getBlogPostHref,
  getBlogTopicHref,
  getPostsForTopic,
  resolveBlogTopic,
} from "@/content/blog";
import {
  buildBlogCollectionSchema,
  buildBreadcrumbSchema,
  practiceInfo,
} from "@/content/structured-data";

export const metadata: Metadata = buildRouteMetadata("/blog");

type BlogIndexProps = {
  searchParams?: Promise<{ topic?: string | string[] }>;
};

const topicWash: Record<string, string> = {
  children: "bg-lime-wash",
  prevention: "bg-cloud-wash",
  alignment: "bg-blush-wash",
  "jaw-pain": "bg-periwinkle-wash",
  sports: "bg-periwinkle-wash",
  urgent: "bg-blush-wash",
};

const topicFigure: Record<string, string> = {
  children: "var(--ff-lime)",
  prevention: "var(--ff-periwinkle)",
  alignment: "var(--ff-blush)",
  "jaw-pain": "var(--ff-periwinkle)",
  sports: "var(--ff-lime)",
  urgent: "var(--ff-blush)",
};

export default async function BlogIndexPage({ searchParams }: BlogIndexProps) {
  const query = await searchParams;
  const selectedTopic = resolveBlogTopic(query?.topic);
  const posts = getPostsForTopic(selectedTopic);
  const allPosts = getAllBlogPosts();
  const pageUrl = `${practiceInfo.url}/blog`;
  const pageTitle = "Family First Smile Care Blog";
  const pageDescription =
    "Helpful dental articles for Los Gatos families covering children's dentistry, prevention, oral health habits, and what to expect at Family First Smile Care.";

  // The hero features the most recently updated article; the full list skips it.
  const featuredPost = [...allPosts].sort((a, b) => Date.parse(b.updatedAt) - Date.parse(a.updatedAt))[0];
  const gridPosts = selectedTopic ? posts : posts.filter((post) => post.slug !== featuredPost.slug);

  const breadcrumbSchema = buildBreadcrumbSchema([
    { name: "Home", item: practiceInfo.url },
    { name: "Blog", item: pageUrl },
  ]);
  const blogSchema = buildBlogCollectionSchema({
    name: pageTitle,
    description: pageDescription,
    url: pageUrl,
    posts: posts.map((post) => ({
      title: post.title,
      url: `${practiceInfo.url}${getBlogPostHref(post.slug)}`,
      datePublished: post.publishedAt,
      dateModified: post.updatedAt,
      description: post.metaDescription,
    })),
  });

  return (
    <div className="overflow-x-clip">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumbSchema) }}
      />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(blogSchema) }}
      />

      <PageHero
        id="blog-heading"
        tone="cloud"
        breadcrumbs={[{ label: "Home", href: "/" }, { label: "Blog" }]}
        eyebrow="The family dental library"
        titleText="Dental answers for the questions families really ask"
        lead={
          <p>
            Clear, prevention-first guidance from our Los Gatos team: first visits, growing teeth, cleanings, aligners,
            jaw pain, and what to do when something hurts. Read at your own pace, then ask us anything.
          </p>
        }
        actions={
          <>
            <Button asChild size="lg" className="group h-14 pl-7 pr-5 text-base">
              <AppointmentLink href={buildAppointmentUrl({ source: "blog_index_hero" })} source="blog_index_hero">
                Request an appointment
                <span aria-hidden="true" className="ff-arrow grid size-8 place-items-center rounded-full bg-white/15">
                  <MinimalGlyph name="arrow-right" />
                </span>
              </AppointmentLink>
            </Button>
            <Button asChild size="lg" variant="outline" className="h-14 px-7 text-base">
              <Link href="#articles">Browse by topic</Link>
            </Button>
          </>
        }
        media={<FeaturedPostCard post={featuredPost} articleCount={allPosts.length} topicCount={blogTopics.length} />}
      />

      <section id="articles" aria-labelledby="articles-heading" className="scroll-mt-20 py-16 sm:py-20 lg:py-24">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="ff-reveal max-w-3xl">
            <Eyebrow className="mb-4">
              {posts.length} {posts.length === 1 ? "article" : "articles"}
              {selectedTopic ? " in this topic" : ""}
            </Eyebrow>
            <h2 id="articles-heading" className="ff-h2">
              {selectedTopic ? (
                selectedTopic.title
              ) : (
                <>
                  Start with the questions families <em className="ff-italic font-normal">ask most.</em>
                </>
              )}
            </h2>
          </div>

          <nav aria-label="Browse dental articles by topic" className="ff-reveal mt-8" style={{ "--i": 1 } as CSSProperties}>
            <ul className="flex flex-wrap gap-2.5">
              <li>
                <Link
                  href="/blog#articles"
                  aria-current={selectedTopic ? undefined : "page"}
                  className={cn(
                    "ff-press inline-flex min-h-11 items-center gap-2 rounded-full px-4 text-sm font-semibold ring-1 transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2",
                    selectedTopic ? "bg-white text-ink ring-border hover:ring-ink/30" : "bg-ink text-white ring-ink",
                  )}
                >
                  All articles
                  <span className={cn("text-xs tabular-nums", selectedTopic ? "text-ink-soft" : "text-white/70")}>{allPosts.length}</span>
                </Link>
              </li>
              {blogTopics.map((topic) => {
                const isActive = selectedTopic?.id === topic.id;
                return (
                  <li key={topic.id}>
                    <Link
                      href={getBlogTopicHref(topic)}
                      aria-current={isActive ? "page" : undefined}
                      className={cn(
                        "ff-press inline-flex min-h-11 items-center gap-2 rounded-full px-4 text-sm font-semibold ring-1 transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2",
                        isActive ? "bg-ink text-white ring-ink" : "bg-white text-ink ring-border hover:ring-ink/30",
                      )}
                    >
                      <span aria-hidden="true" className={cn("size-2.5 rounded-full", topicDotClass[topic.id])} />
                      {topic.title}
                      <span className={cn("text-xs tabular-nums", isActive ? "text-white/70" : "text-ink-soft")}>
                        {getPostsForTopic(topic).length}
                      </span>
                    </Link>
                  </li>
                );
              })}
            </ul>
          </nav>

          {selectedTopic ? (
            <div
              className={cn(
                "relative mt-8 flex flex-col gap-4 overflow-clip rounded-3xl p-6 pr-24 sm:flex-row sm:items-center sm:justify-between sm:p-7 sm:pr-32",
                topicWash[selectedTopic.id] ?? "bg-cloud-wash",
              )}
            >
              <ToothPerson
                color={topicFigure[selectedTopic.id] ?? "var(--ff-periwinkle)"}
                className="pointer-events-none absolute -bottom-7 right-4 h-28 w-auto rotate-[-8deg] sm:right-8"
              />
              <p className="relative max-w-xl text-lg leading-relaxed text-ink">{selectedTopic.description}</p>
              <div className="relative flex flex-wrap items-center gap-x-6 gap-y-2">
                <Link href={selectedTopic.careHref} className="ff-link inline-flex min-h-11 items-center">
                  {selectedTopic.careLabel}
                </Link>
                <Link href="/blog#articles" className="inline-flex min-h-11 items-center text-sm font-semibold text-ink-soft underline decoration-ink/20 underline-offset-4 hover:text-ink">
                  View all articles
                </Link>
              </div>
            </div>
          ) : null}

          <ul className="mt-10 grid gap-3 sm:gap-5 md:grid-cols-2 lg:grid-cols-6 lg:gap-6">
            {gridPosts.map((post, index) => {
              const span = getBalancedSpan(gridPosts.length, index);
              return (
                <li key={post.slug} className={cn("ff-reveal", span.className)} style={{ "--i": index % 3 } as CSSProperties}>
                  <BlogPostCard post={post} large={span.large} wideAtMd={span.wideAtMd} wideAtLg={span.wideAtLg} />
                </li>
              );
            })}
          </ul>
        </div>
      </section>

      <CtaBand
        id="blog-cta-heading"
        eyebrow="Still wondering?"
        title={
          <>
            Have a question we <em className="ff-italic font-normal text-lime">didn’t answer?</em>
          </>
        }
        body="Articles are a good start, but every smile is different. Our Los Gatos team is happy to talk through your family’s questions and help you plan the next step."
        actions={
          <>
            <Button asChild size="lg" variant="night" className="group h-14 pl-7 pr-5 text-base">
              <Link href="/contact">
                Contact our office
                <span aria-hidden="true" className="ff-arrow grid size-8 place-items-center rounded-full bg-ink/10">
                  <MinimalGlyph name="arrow-right" />
                </span>
              </Link>
            </Button>
            <Button asChild size="lg" variant="night-outline" className="h-14 px-7 text-base">
              <PhoneLink location="blog_index_final">Call (408) 358-8100</PhoneLink>
            </Button>
          </>
        }
        note={<>{practiceHoursSummary} · 15251 National Ave, Suite 102, Los Gatos</>}
      />
    </div>
  );
}
