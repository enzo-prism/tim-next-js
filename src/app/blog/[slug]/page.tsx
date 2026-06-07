import { notFound } from "next/navigation";
import { format } from "date-fns";
import { MinimalGlyph } from "@/components/ui/minimal-glyph";
import type { Metadata } from "next";
import Link from "next/link";
import HeroBackdrop from "@/components/brand/HeroBackdrop";
import BlogTableOfContents from "@/components/blog/blog-table-of-contents";
import PageBreadcrumbs from "@/components/navigation/PageBreadcrumbs";
import RelatedLinksSection from "@/components/navigation/RelatedLinksSection";
import { Button } from "@/components/ui/button";
import { getAllBlogPosts, getBlogPostBySlug, getBlogPostHref } from "@/content/blog";
import {
  buildBlogPostingSchema,
  buildBreadcrumbSchema,
  buildFaqSchema,
  practiceInfo,
} from "@/content/structured-data";
import { metadataBase } from "@/lib/metadata";

type BlogPostRouteProps = {
  params: Promise<{ slug: string }>;
};

const renderSectionParagraph = (paragraph: string) => {
  if (/^###\s+/.test(paragraph)) {
    return (
      <h3 key={paragraph} className="mt-8 text-xl font-semibold text-slate-900">
        {paragraph.replace(/^###\s+/, "")}
      </h3>
    );
  }

  return <p key={paragraph}>{paragraph}</p>;
};

export function generateStaticParams() {
  return getAllBlogPosts().map((post) => ({ slug: post.slug }));
}

export async function generateMetadata({
  params,
}: BlogPostRouteProps): Promise<Metadata> {
  const { slug } = await params;
  const post = getBlogPostBySlug(slug);

  if (!post) {
    return {
      title: "Blog Post Not Found | Family First Smile Care",
      description: "The blog post you are looking for could not be found.",
      metadataBase,
    };
  }

  const canonical = getBlogPostHref(post.slug);
  const canonicalUrl = `${practiceInfo.url}${canonical}`;
  const keywords = [post.primaryKeyword, ...post.secondaryKeywords];

  return {
    metadataBase,
    title: post.metaTitle,
    description: post.metaDescription,
    keywords,
    authors: [{ name: "Family First Smile Care Editorial Team", url: practiceInfo.url }],
    alternates: {
      canonical,
    },
    openGraph: {
      title: post.metaTitle,
      description: post.metaDescription,
      url: canonicalUrl,
      type: "article",
      siteName: practiceInfo.name,
      publishedTime: post.publishedAt,
      modifiedTime: post.updatedAt,
      section: post.category,
      tags: keywords,
      images: [
        {
          url: practiceInfo.image[1],
          width: 1600,
          height: 1067,
          alt: post.title,
        },
      ],
    },
    twitter: {
      card: "summary_large_image",
      title: post.metaTitle,
      description: post.metaDescription,
      images: [practiceInfo.image[1]],
    },
  };
}

export default async function BlogPostPage({ params }: BlogPostRouteProps) {
  const { slug } = await params;
  const post = getBlogPostBySlug(slug);

  if (!post) {
    notFound();
  }

  const articleUrl = `${practiceInfo.url}${getBlogPostHref(post.slug)}`;
  const breadcrumbSchema = buildBreadcrumbSchema([
    { name: "Home", item: practiceInfo.url },
    { name: "Blog", item: `${practiceInfo.url}/blog` },
    { name: post.title, item: articleUrl },
  ]);
  const articleSchema = buildBlogPostingSchema({
    title: post.title,
    description: post.metaDescription,
    url: articleUrl,
    datePublished: post.publishedAt,
    dateModified: post.updatedAt,
    keywords: [post.primaryKeyword, ...post.secondaryKeywords],
    articleSection: post.category,
    image: practiceInfo.image[1],
  });
  const faqSchema = post.faq.length ? buildFaqSchema(post.faq) : null;
  const tableOfContents = post.sections.map((section) => ({
    id: section.id,
    title: section.title,
  }));

  return (
    <div className="bg-white pt-16 pb-20">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify(breadcrumbSchema).replace(/</g, "\\u003c"),
        }}
      />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify(articleSchema).replace(/</g, "\\u003c"),
        }}
      />
      {faqSchema ? (
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{
            __html: JSON.stringify(faqSchema).replace(/</g, "\\u003c"),
          }}
        />
      ) : null}

      <section className="relative overflow-hidden py-16 sm:py-20 lg:py-24">
        <HeroBackdrop variant="warm" />
        <div className="relative mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <PageBreadcrumbs
            items={[
              { label: "Home", href: "/" },
              { label: "Blog", href: "/blog" },
              { label: post.title },
            ]}
          />

          <div className="grid items-start gap-10 lg:grid-cols-[minmax(0,1fr)_340px] lg:gap-12">
            <div>
              <div className="inline-flex items-center gap-2 rounded-lg border border-primary/20 bg-primary/5 px-4 py-1.5 text-xs font-semibold uppercase tracking-[0.18em] text-primary/80">
                {post.heroEyebrow}
              </div>
              <h1 className="mt-5 max-w-4xl text-4xl font-bold leading-tight text-slate-900 sm:text-5xl">
                <span className="inline-flex flex-wrap items-center gap-3">
                  
                  <span>{post.title}</span>
                </span>
              </h1>
              <p className="mt-6 max-w-3xl text-lg leading-8 text-slate-600 sm:text-xl">
                {post.heroSummary}
              </p>

              <div className="mt-6 flex flex-wrap gap-4 text-sm text-slate-500">
                <span className="inline-flex items-center gap-2">
                  <MinimalGlyph name="calendar-days" className="h-4 w-4" />
                  Published {format(new Date(post.publishedAt), "MMMM d, yyyy")}
                </span>
                <span className="inline-flex items-center gap-2">
                  <MinimalGlyph name="clock" className="h-4 w-4" />
                  {post.readingTimeMinutes} min read
                </span>
                <span className="inline-flex items-center gap-2">
                  <MinimalGlyph name="map-pin" className="h-4 w-4" />
                  Los Gatos, CA
                </span>
              </div>
            </div>

            <aside className="rounded-xl border border-slate-200 bg-white/95 p-6 shadow-sm">
              <div className="text-sm font-semibold uppercase tracking-[0.18em] text-primary/80">
                Short answer
              </div>
              <p className="mt-4 text-lg font-semibold leading-8 text-slate-900">
                {post.quickAnswer}
              </p>
              <p className="mt-4 text-sm leading-6 text-slate-600">
                {post.quickAnswerSupport}
              </p>
            </aside>
          </div>
        </div>
      </section>

      <section className="py-8 sm:py-10">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="grid gap-8 lg:grid-cols-[minmax(0,1fr)_300px] lg:items-start">
            <article className="rounded-xl border border-slate-200 bg-white p-6 shadow-sm sm:p-8 lg:p-10">
              <div className="prose prose-slate max-w-none prose-headings:scroll-mt-24 prose-headings:font-bold prose-headings:text-slate-900 prose-p:text-slate-700 prose-p:leading-8 prose-li:text-slate-700 prose-strong:text-slate-900 prose-a:text-primary prose-a:no-underline hover:prose-a:text-primary/80">
                {post.intro.map((paragraph) => (
                  <p key={paragraph}>{paragraph}</p>
                ))}

                {post.sections.map((section) => (
                  <section key={section.id} id={section.id} className="mt-12 first:mt-0">
                    <h2>{section.title}</h2>
                    {section.paragraphs?.map((paragraph) => renderSectionParagraph(paragraph))}
                    {section.bullets?.length ? (
                      <ul>
                        {section.bullets.map((bullet) => (
                          <li key={bullet}>{bullet}</li>
                        ))}
                      </ul>
                    ) : null}
                    {section.callout ? (
                      <div className="not-prose mt-6 rounded-xl border border-primary/15 bg-primary/5 p-5 text-sm leading-7 text-slate-700">
                        {section.callout}
                      </div>
                    ) : null}
                  </section>
                ))}
              </div>

              <section className="mt-14 rounded-xl border border-slate-200 bg-slate-50/80 p-6 sm:p-8">
                <div className="flex items-center gap-2 text-sm font-semibold uppercase tracking-[0.18em] text-primary/80">
                  <MinimalGlyph name="message-text" className="h-4 w-4" />
                  FAQ
                </div>
                <div className="mt-5 space-y-4">
                  {post.faq.map((item) => (
                    <details
                      key={item.question}
                      className="rounded-xl border border-slate-200 bg-white px-5 py-4"
                    >
                      <summary className="cursor-pointer list-none font-semibold text-slate-900">
                        {item.question}
                      </summary>
                      <p className="mt-3 text-base leading-7 text-slate-600">{item.answer}</p>
                    </details>
                  ))}
                </div>
              </section>

              <section className="mt-14 rounded-xl bg-primary px-8 py-8 text-white shadow-sm">
                <div className="grid gap-6 lg:grid-cols-[minmax(0,1fr)_auto] lg:items-center">
                  <div>
                    <div className="text-sm font-semibold uppercase tracking-[0.18em] text-white/80">
                      Next step
                    </div>
                    <h2 className="mt-3 text-3xl font-bold leading-tight">{post.ctaTitle}</h2>
                    <p className="mt-4 max-w-2xl text-base leading-7 text-white/85">{post.ctaBody}</p>
                  </div>

                  <Button asChild size="lg" className="bg-white text-primary hover:bg-white/90">
                    <Link href={post.ctaHref}>
                      {post.ctaLabel}
                      <MinimalGlyph name="arrow-right" className="ml-2 h-4 w-4" />
                    </Link>
                  </Button>
                </div>
              </section>

              <section className="mt-12">
                <h2 className="text-2xl font-bold text-slate-900">Sources referenced</h2>
                <ul className="mt-5 space-y-3">
                  {post.sources.map((source) => (
                    <li key={source.href}>
                      <a
                        href={source.href}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="inline-flex items-center gap-2 text-base font-semibold text-primary hover:text-primary/80"
                      >
                        {source.label}
                        <MinimalGlyph name="external-link" className="h-4 w-4" />
                      </a>
                    </li>
                  ))}
                </ul>
              </section>
            </article>

            <div className="space-y-6 lg:sticky lg:top-24">
              <BlogTableOfContents items={tableOfContents} />

              <aside className="rounded-xl border border-slate-200 bg-white p-6 shadow-sm">
                <div className="text-sm font-semibold uppercase tracking-[0.18em] text-primary/80">
                  Helpful next steps
                </div>
                <div className="mt-5 space-y-4">
                  {post.relatedLinks.slice(0, 3).map((link) => (
                    <div key={link.href}>
                      <Link href={link.href} className="font-semibold text-slate-900 hover:text-primary">
                        {link.title}
                      </Link>
                      <p className="mt-1 text-sm leading-6 text-slate-600">{link.description}</p>
                    </div>
                  ))}
                </div>
              </aside>
            </div>
          </div>

          <RelatedLinksSection title="Related Services & Resources" links={post.relatedLinks} />
        </div>
      </section>
    </div>
  );
}
