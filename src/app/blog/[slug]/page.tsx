import type { CSSProperties, ReactNode } from "react";
import { notFound } from "next/navigation";
import { format, parseISO } from "date-fns";
import type { Metadata } from "next";
import Link from "next/link";
import BlogTableOfContents from "@/components/blog/blog-table-of-contents";
import BlogPostCard from "@/components/blog/blog-post-card";
import PatientInfoFaqList from "@/components/patient-info/patient-info-faq-list";
import { Button } from "@/components/ui/button";
import { MinimalGlyph } from "@/components/ui/minimal-glyph";
import { BrandDots } from "@/components/brand/pinwheel";
import { PageHero } from "@/components/site/page-hero";
import { Eyebrow } from "@/components/site/section";
import { CtaBand } from "@/components/site/cta-band";
import { PhoneLink } from "@/components/tracking/tracked-links";
import { PostCover } from "@/components/editorial/post-cover";
import { ReadingProgress } from "@/components/editorial/reading-progress";
import { getBalancedSpan, getEditorialTheme } from "@/components/editorial/editorial-theme";
import { ArticleCallout, ArticleSources, AskPrompt, NextStepCards, ShortAnswer } from "@/components/editorial/article-parts";
import { cn } from "@/lib/utils";
import {
  blogTopics,
  getAllBlogPosts,
  getBlogPostBySlug,
  getBlogPostHref,
  getBlogTopicHref,
  type BlogPost,
} from "@/content/blog";
import {
  buildBlogPostingSchema,
  buildBreadcrumbSchema,
  buildFaqSchema,
  practiceInfo,
} from "@/content/structured-data";
import { practiceHoursSummary } from "@/content/practice-hours";
import { metadataBase } from "@/lib/metadata";
import { getClinicalReview } from "@/content/clinical-review";
import ClinicalReviewByline from "@/components/blog/clinical-review-byline";

type BlogPostRouteProps = {
  params: Promise<{ slug: string }>;
};

const renderSectionParagraph = (paragraph: string) => {
  if (/^###\s+/.test(paragraph)) {
    return <h3 key={paragraph}>{paragraph.replace(/^###\s+/, "")}</h3>;
  }

  return <p key={paragraph}>{paragraph}</p>;
};

const endsLikeSentence = (text: string) => /[.!?:]["”’)]*$/.test(text.trim());

/**
 * Intro copy is mostly plain paragraphs, but a few generated articles carry
 * short heading-like lines and "- " bullets. Render those as a subheading and
 * a list instead of stray paragraphs; only a real opening paragraph gets the
 * drop cap.
 */
function renderIntro(intro: string[]) {
  const blocks: ReactNode[] = [];
  let bullets: string[] = [];
  const flushBullets = () => {
    if (!bullets.length) return;
    blocks.push(
      <ul key={`list-${blocks.length}`}>
        {bullets.map((bullet) => (
          <li key={bullet}>{bullet}</li>
        ))}
      </ul>,
    );
    bullets = [];
  };

  intro.forEach((text, index) => {
    if (/^-\s+/.test(text)) {
      bullets.push(text.replace(/^-\s+/, ""));
      return;
    }
    flushBullets();
    if (text.trim().length < 90 && !endsLikeSentence(text)) {
      blocks.push(<h2 key={text}>{text}</h2>);
    } else if (index === 0) {
      blocks.push(
        <p
          key={text}
          className="text-[1.2rem] leading-relaxed text-ink first-letter:float-left first-letter:mr-3 first-letter:mt-1.5 first-letter:text-[3.6em] first-letter:font-semibold first-letter:leading-[0.8] first-letter:text-cobalt first-letter:[font-family:var(--font-display)] sm:text-[1.3rem]"
        >
          {text}
        </p>,
      );
    } else {
      blocks.push(<p key={text}>{text}</p>);
    }
  });
  flushBullets();
  return blocks;
}

/** Three more articles: same category first, then the newest of the rest. */
function getMoreArticles(post: BlogPost) {
  const others = getAllBlogPosts().filter((item) => item.slug !== post.slug);
  const sameCategory = others.filter((item) => item.category === post.category);
  const rest = others.filter((item) => item.category !== post.category);
  return [...sameCategory, ...rest].slice(0, 3);
}

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
          url: practiceInfo.image[0],
          width: 1200,
          height: 630,
          alt: post.title,
        },
      ],
    },
    twitter: {
      card: "summary_large_image",
      title: post.metaTitle,
      description: post.metaDescription,
      images: [practiceInfo.image[0]],
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
  const clinicalReview = getClinicalReview(post);
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
    clinicalReview,
  });
  const faqSchema = post.faq.length ? buildFaqSchema(post.faq) : null;
  const tableOfContents = post.sections.map((section) => ({
    id: section.id,
    title: section.title,
  }));
  const hasToc = tableOfContents.length > 0;
  const theme = getEditorialTheme(post.category);
  const topic = blogTopics.find((item) => item.categories.includes(post.category));
  const isForChild = post.category === "Children's Dentistry";
  const moreArticles = getMoreArticles(post);

  return (
    <div className="ffe-post overflow-x-clip">
      <ReadingProgress />
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

      <PageHero
        id="post-heading"
        tone={theme.heroTone}
        className="[&_h1]:text-[length:clamp(2.05rem,1.45rem+2.2vw,3.4rem)] [&_h1]:leading-[1.08]"
        breadcrumbs={[
          { label: "Home", href: "/" },
          { label: "Blog", href: "/blog" },
          { label: post.title },
        ]}
        eyebrow={post.heroEyebrow}
        titleText={post.title}
        lead={<p>{post.heroSummary}</p>}
        meta={
          <div className="space-y-4">
            <div className="flex flex-wrap items-center gap-x-4 gap-y-2">
              {topic ? (
                <Link
                  href={getBlogTopicHref(topic)}
                  className="ff-press inline-flex min-h-9 items-center gap-2 rounded-full bg-white px-3.5 text-sm font-semibold text-ink ring-1 ring-ink/10 transition-colors hover:ring-ink/30 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
                >
                  <span aria-hidden="true" className={cn("size-2.5 rounded-full", theme.solid, theme.kind === "prevention" && "ring-1 ring-ink/15")} />
                  {post.category}
                </Link>
              ) : (
                <span className="inline-flex min-h-9 items-center rounded-full bg-white px-3.5 text-sm font-semibold text-ink ring-1 ring-ink/10">
                  {post.category}
                </span>
              )}
              <span className="font-semibold text-ink">{post.readingTimeMinutes} min read</span>
              <span>Los Gatos, CA</span>
            </div>
            <div className="flex flex-wrap items-center gap-x-4 gap-y-2">
              <span className="inline-flex items-center gap-2.5 font-semibold text-ink">
                <span aria-hidden="true" className="grid size-8 place-items-center rounded-full bg-white ring-1 ring-ink/10">
                  <BrandDots className="gap-[2px] [&>i]:size-[5px]" />
                </span>
                By Family First Smile Care Editorial Team
              </span>
              <span>
                Published <time dateTime={post.publishedAt}>{format(parseISO(post.publishedAt), "MMMM d, yyyy")}</time>
              </span>
              {post.updatedAt !== post.publishedAt ? (
                <span className="inline-flex items-center gap-1.5">
                  <span aria-hidden="true" className="size-2 rounded-full bg-cobalt" />
                  Updated <time dateTime={post.updatedAt}>{format(parseISO(post.updatedAt), "MMMM d, yyyy")}</time>
                </span>
              ) : null}
              <ClinicalReviewByline review={clinicalReview} />
            </div>
          </div>
        }
        media={
          <div className="relative mx-auto w-full max-w-lg lg:mr-0">
            <PostCover
              category={post.category}
              slug={post.slug}
              surface="white"
              className="aspect-[2/1] rounded-3xl shadow-float ring-1 ring-ink/5 sm:aspect-[16/9] lg:aspect-[5/4]"
            />
          </div>
        }
      />

      <div className="py-12 sm:py-16 lg:py-20">
        <div
          className={cn(
            "mx-auto grid max-w-7xl gap-8 px-4 sm:px-6 lg:justify-center lg:gap-y-10 lg:px-8",
            hasToc ? "lg:grid-cols-[13.5rem_minmax(0,43rem)] lg:gap-x-14 xl:gap-x-20" : "lg:grid-cols-[minmax(0,43rem)]",
          )}
        >
          <div className={cn("min-w-0", hasToc && "lg:col-start-2 lg:row-start-1")}>
            {/* A few generated articles have a lead-in rather than an answer; frame those honestly. */}
            {/[.!?]["”’)]*$/.test(post.quickAnswer.trim()) ? (
              <ShortAnswer answer={post.quickAnswer} support={post.quickAnswerSupport} />
            ) : (
              <ShortAnswer label="In this article" answer={post.quickAnswerSupport} compact />
            )}
          </div>

          {hasToc ? (
            <div className="lg:col-start-1 lg:row-span-2 lg:row-start-1">
              <div className="lg:sticky lg:top-28">
                <BlogTableOfContents items={tableOfContents} topHref="#post-heading" />
              </div>
            </div>
          ) : null}

          <article aria-labelledby="post-heading" className={cn("ffe-article min-w-0", hasToc && "lg:col-start-2 lg:row-start-2")}>
            <div className="ff-prose prose-p:text-pretty prose-li:my-1.5 prose-h3:mt-9 prose-h3:text-[1.35rem] prose-ul:my-6">
              {renderIntro(post.intro)}

              {post.sections.map((section, index) => (
                <section key={section.id} id={section.id} className="scroll-mt-28 [&>h2]:mt-3">
                  <p aria-hidden="true" className="not-prose mt-14 flex items-center gap-3 text-xs font-bold uppercase tracking-[0.14em] text-cobalt">
                    {String(index + 1).padStart(2, "0")}
                    <span className="h-px w-10 bg-periwinkle" />
                  </p>
                  <h2>{section.title}</h2>
                  {section.paragraphs?.map((paragraph) => renderSectionParagraph(paragraph))}
                  {section.bullets?.length ? (
                    <ul>
                      {section.bullets.map((bullet) => (
                        <li key={bullet}>{bullet}</li>
                      ))}
                    </ul>
                  ) : null}
                  {section.callout ? <ArticleCallout>{section.callout}</ArticleCallout> : null}
                </section>
              ))}
            </div>

            {post.faq.length ? (
              <section aria-labelledby="faq-heading" className="mt-16">
                <Eyebrow className="mb-3">FAQ</Eyebrow>
                <h2 id="faq-heading" className="ff-h3 mb-6">
                  Questions families ask
                </h2>
                <PatientInfoFaqList faqs={post.faq.map((item) => ({ id: item.question, ...item }))} />
              </section>
            ) : null}

            <AskPrompt forChild={isForChild} />

            <ArticleSources sources={post.sources} />
          </article>
        </div>
      </div>

      {post.relatedLinks.length ? (
        <section aria-labelledby="helpful-next-steps-heading" className="relative bg-cream py-16 sm:py-20 lg:py-24">
          <div className="relative mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
            <div className="ff-reveal mb-10 max-w-3xl">
              <Eyebrow className="mb-4">Keep going</Eyebrow>
              <h2 id="helpful-next-steps-heading" className="ff-h2">
                Helpful next <em className="ff-italic font-normal">steps</em>
              </h2>
            </div>
            <NextStepCards links={post.relatedLinks} />
          </div>
        </section>
      ) : null}

      {moreArticles.length ? (
        <section aria-labelledby="more-articles-heading" className="py-16 sm:py-20 lg:py-24">
          <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
            <div className="ff-reveal mb-10 flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
              <div className="max-w-2xl">
                <Eyebrow className="mb-4">From the family library</Eyebrow>
                <h2 id="more-articles-heading" className="ff-h2">
                  Keep reading
                </h2>
              </div>
              <Link href="/blog" className="ff-link inline-flex min-h-11 items-center">
                See all articles
              </Link>
            </div>
            <ul className="grid gap-3 sm:gap-5 md:grid-cols-2 lg:grid-cols-6 lg:gap-6">
              {moreArticles.map((item, index) => {
                const span = getBalancedSpan(moreArticles.length, index);
                return (
                  <li key={item.slug} className={cn("ff-reveal", span.className)} style={{ "--i": index } as CSSProperties}>
                    <BlogPostCard post={item} large={span.large} wideAtMd={span.wideAtMd} wideAtLg={span.wideAtLg} />
                  </li>
                );
              })}
            </ul>
          </div>
        </section>
      ) : null}

      <CtaBand
        id="post-cta-heading"
        eyebrow="Next step"
        title={post.ctaTitle}
        body={post.ctaBody}
        actions={
          <>
            <Button asChild size="lg" variant="night" className="group h-14 pl-7 pr-5 text-base">
              <Link href={post.ctaHref}>
                {post.ctaLabel}
                <span aria-hidden="true" className="ff-arrow grid size-8 place-items-center rounded-full bg-ink/10">
                  <MinimalGlyph name="arrow-right" />
                </span>
              </Link>
            </Button>
            <Button asChild size="lg" variant="night-outline" className="h-14 px-7 text-base">
              <PhoneLink location="blog_post_final">Call (408) 358-8100</PhoneLink>
            </Button>
          </>
        }
        note={<>{practiceHoursSummary} · 15251 National Ave, Suite 102, Los Gatos</>}
      />
    </div>
  );
}
