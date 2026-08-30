import { MinimalGlyph } from "@/components/ui/minimal-glyph";
import type { Metadata } from "next";
import Link from "next/link";
import HeroBackdrop from "@/components/brand/HeroBackdrop";
import PageBreadcrumbs from "@/components/navigation/PageBreadcrumbs";
import BlogPostCard from "@/components/blog/blog-post-card";
import { Button } from "@/components/ui/button";
import { buildRouteMetadata } from "@/lib/metadata";
import { getAllBlogPosts, getBlogPostHref } from "@/content/blog";
import {
  buildBlogCollectionSchema,
  buildBreadcrumbSchema,
  practiceInfo,
} from "@/content/structured-data";

export const metadata: Metadata = buildRouteMetadata("/blog");

const pillars = [
  {
    title: "Children's Dentistry",
    description: "Guides for first visits, healthy habits, and helping kids feel safe at the dentist.",
    icon: "hygiene-sparkle",
  },
  {
    title: "Preventive Care",
    description: "Articles that answer practical questions before small concerns turn into bigger problems.",
    icon: "stethoscope",
  },
  {
    title: "Local Guidance",
    description: "Helpful resources written for Los Gatos families who want clear, calm answers.",
    icon: "book-open",
  },
];

export default function BlogIndexPage() {
  const posts = getAllBlogPosts();
  const pageUrl = `${practiceInfo.url}/blog`;
  const pageTitle = "Family First Smile Care Blog";
  const pageDescription =
    "Helpful dental articles for Los Gatos families covering children's dentistry, prevention, oral health habits, and what to expect at Family First Smile Care.";

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
    <div className="bg-white pt-16 pb-20">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumbSchema) }}
      />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(blogSchema) }}
      />

      <section className="relative overflow-hidden py-16 sm:py-20 lg:py-24">
        <HeroBackdrop variant="default" />
        <div className="relative mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <PageBreadcrumbs items={[{ label: "Home", href: "/" }, { label: "Blog" }]} />

          <div className="grid items-start gap-10 lg:grid-cols-[minmax(0,1fr)_360px] lg:gap-12">
            <div>
              <div className="inline-flex items-center gap-2 rounded-lg border border-primary/20 bg-primary/5 px-4 py-1.5 text-xs font-semibold uppercase tracking-[0.18em] text-primary">
                Helpful dental guidance
              </div>
              <h1 className="mt-5 max-w-4xl text-4xl font-bold leading-tight text-slate-900 sm:text-5xl">
                <span className="inline-flex flex-wrap items-center gap-3">
                  
                  <span>Dental articles built to answer real questions from families.</span>
                </span>
              </h1>
              <p className="mt-6 max-w-3xl text-lg leading-8 text-slate-600 sm:text-xl">
                Find clear, prevention-focused guidance for Los Gatos families, including the
                questions parents ask most often and the practical details that help patients feel
                informed before a visit.
              </p>
            </div>

            <div className="rounded-xl border border-slate-200 bg-white/95 p-6 shadow-sm">
              <div className="text-sm font-semibold uppercase tracking-[0.18em] text-primary">What you will find here</div>
              <p className="mt-4 text-base leading-7 text-slate-600">
                Helpful, practical articles about first visits, preventive care, and the small
                habits that make a big difference between appointments.
              </p>
              <Button asChild className="mt-6 w-full bg-primary text-primary-foreground hover:bg-primary/90">
                  <Link href="/book-appointment?source=blog_index_hero">Request an appointment</Link>
              </Button>
            </div>
          </div>
        </div>
      </section>

      <section className="py-8 sm:py-10">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="grid gap-4 md:grid-cols-3">
            {pillars.map((pillar) => (
                <article
                  key={pillar.title}
                  className="rounded-xl border border-slate-200 bg-slate-50/80 p-6"
                >
                  <div className="inline-flex h-11 w-11 items-center justify-center rounded-xl bg-primary/10 text-primary">
                    <MinimalGlyph name={pillar.icon} className="h-6 w-6" />
                  </div>
                  <h2 className="mt-5 text-xl font-bold text-slate-900">{pillar.title}</h2>
                  <p className="mt-3 text-base leading-7 text-slate-600">{pillar.description}</p>
                </article>
            ))}
          </div>
        </div>
      </section>

      <section className="py-8 sm:py-10">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
            <div>
              <div className="text-sm font-semibold uppercase tracking-[0.18em] text-primary">
                Latest posts
              </div>
              <h2 className="mt-3 text-3xl font-bold text-slate-900 sm:text-4xl">
                Start with the questions parents ask most.
              </h2>
            </div>
          </div>

          <div className="mt-8 grid gap-6 lg:grid-cols-2">
            {posts.map((post) => (
              <BlogPostCard key={post.slug} post={post} />
            ))}
          </div>
        </div>
      </section>

      <section className="py-10 sm:py-12">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="rounded-xl bg-primary px-8 py-10 text-white shadow-sm sm:px-10">
            <div className="grid gap-6 lg:grid-cols-[minmax(0,1fr)_auto] lg:items-center">
              <div>
                <div className="text-sm font-semibold uppercase tracking-[0.18em] text-white/95">
                  Need care now?
                </div>
                <h2 className="mt-3 text-3xl font-bold leading-tight sm:text-4xl">
                  Get answers online, then get care from a local team that keeps things gentle.
                </h2>
                <p className="mt-4 max-w-2xl text-base leading-7 text-white/95">
                  If you have questions about your child's first visit, brushing habits, or what to
                  expect at the office, we are happy to help you plan the next step.
                </p>
              </div>

              <Button
                asChild
                size="lg"
                className="bg-white text-primary hover:bg-white/90"
              >
                <Link href="/contact">
                  Contact our office
                  <MinimalGlyph name="arrow-right" className="ml-2 h-4 w-4" />
                </Link>
              </Button>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
