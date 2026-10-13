import type { CSSProperties } from "react";
import Link from "next/link";
import { PageHero } from "@/components/site/page-hero";
import { ToothPerson } from "@/components/brand/pinwheel";
import { services } from "@/data/services";
import { getAllBlogPosts, getBlogPostHref } from "@/content/blog";
import { getEditorialTheme, type CoverKind } from "@/components/editorial/editorial-theme";
import { getServiceHref } from "@/lib/routes";

const mainPages = [
  { href: "/", label: "Home" },
  { href: "/about", label: "About" },
  { href: "/services", label: "Services" },
  { href: "/team", label: "Our Team" },
  { href: "/testimonials", label: "Testimonials" },
  { href: "/patient-info", label: "Patient Info" },
  { href: "/blog", label: "Blog" },
  { href: "/contact", label: "Contact" },
  { href: "/areas-we-serve/santa-cruz", label: "Santa Cruz Families" },
  { href: "/book-appointment", label: "Book Appointment" },
  { href: "/tmj", label: "TMJ Treatment" },
  { href: "/technology/itero-digital-scanner", label: "iTero Digital Scanner" },
];

const patientResources = [
  { href: "/new-patients", label: "New Patient Guide" },
  { href: "/insurance-and-payment", label: "Insurance & Payment" },
  { href: "/urgent-dental-care", label: "Urgent Dental Concerns" },
  { href: "/patient-info", label: "Patient Info Hub" },
  { href: "/patient-info/brushing", label: "How to Brush Properly" },
  { href: "/patient-info/flossing", label: "Flossing Fundamentals" },
  { href: "/patient-info/nutrition", label: "Nutrition for Healthy Teeth" },
];

const articleGroups: { kind: CoverKind; label: string; color: string }[] = [
  { kind: "kids", label: "Children’s dentistry", color: "var(--ff-lime)" },
  { kind: "prevention", label: "Cleanings and prevention", color: "var(--ff-periwinkle)" },
  { kind: "alignment", label: "Invisalign and orthodontics", color: "var(--ff-blush)" },
  { kind: "jaw", label: "Jaw pain and grinding", color: "var(--ff-periwinkle)" },
  { kind: "sports", label: "Sports and mouthguards", color: "var(--ff-lime)" },
];

const linkClass =
  "group/link inline-flex min-h-10 items-center gap-2 rounded-sm py-1 text-base font-semibold text-ink transition-colors hover:text-cobalt focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring";

function GroupHeading({ id, color, children }: { id: string; color: string; children: string }) {
  return (
    <h2 id={id} className="flex items-center gap-3 font-display text-2xl font-semibold tracking-[-0.02em] text-ink">
      <ToothPerson color={color} className="h-8 w-auto shrink-0" />
      {children}
    </h2>
  );
}

function Dot() {
  return <span aria-hidden="true" className="size-1.5 shrink-0 rounded-full bg-ink/20 transition-colors group-hover/link:bg-cobalt" />;
}

function ArticleGroup({
  group,
  posts,
  className,
  listClassName,
}: {
  group: (typeof articleGroups)[number];
  posts: ReturnType<typeof getAllBlogPosts>;
  className?: string;
  listClassName?: string;
}) {
  return (
    <div className={className}>
      <h3 className="flex items-center gap-2.5 text-xs font-bold uppercase tracking-[0.14em] text-cobalt-deep">
        <span aria-hidden="true" className="size-2.5 rounded-full" style={{ background: group.color }} />
        {group.label}
      </h3>
      <ul className={["mt-4", listClassName].filter(Boolean).join(" ")}>
        {posts.map((post) => (
          <li key={post.slug} className="break-inside-avoid pb-3">
            <Link
              href={getBlogPostHref(post.slug)}
              className="rounded-sm text-[0.975rem] font-semibold leading-snug text-ink underline decoration-transparent decoration-2 underline-offset-4 transition-colors hover:text-cobalt hover:decoration-cobalt/30 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
            >
              {post.title}
            </Link>
          </li>
        ))}
      </ul>
    </div>
  );
}

export default function SiteMap() {
  const blogPosts = getAllBlogPosts();
  const postsFor = (kind: CoverKind) => blogPosts.filter((post) => getEditorialTheme(post.category).kind === kind);
  const [leadGroup, ...otherGroups] = articleGroups;

  return (
    <div className="overflow-x-clip">
      <PageHero
        id="sitemap-heading"
        tone="cream"
        art="pinwheel"
        breadcrumbs={[{ label: "Home", href: "/" }, { label: "Site Map" }]}
        eyebrow="Find your way"
        titleText="Site Map"
        lead={<p>Browse the main pages, patient resources, our full list of services, and every article in the family dental library.</p>}
      />

      <div className="py-16 sm:py-20 lg:py-24">
        <div className="mx-auto grid max-w-7xl gap-12 px-4 sm:px-6 md:grid-cols-2 lg:grid-cols-3 lg:gap-14 lg:px-8">
          <section aria-labelledby="sitemap-main" className="ff-reveal">
            <GroupHeading id="sitemap-main" color="var(--ff-periwinkle)">
              Main pages
            </GroupHeading>
            <ul className="mt-6 space-y-1 border-t border-border pt-5">
              {mainPages.map((page) => (
                <li key={page.href}>
                  <Link href={page.href} className={linkClass}>
                    <Dot />
                    {page.label}
                  </Link>
                </li>
              ))}
            </ul>
          </section>

          <section aria-labelledby="sitemap-resources" className="ff-reveal" style={{ "--i": 1 } as CSSProperties}>
            <GroupHeading id="sitemap-resources" color="var(--ff-blush)">
              Patient resources
            </GroupHeading>
            <ul className="mt-6 space-y-1 border-t border-border pt-5">
              {patientResources.map((page) => (
                <li key={page.href}>
                  <Link href={page.href} className={linkClass}>
                    <Dot />
                    {page.label}
                  </Link>
                </li>
              ))}
            </ul>
          </section>

          <section aria-labelledby="sitemap-services" className="ff-reveal md:col-span-2 lg:col-span-1" style={{ "--i": 2 } as CSSProperties}>
            <GroupHeading id="sitemap-services" color="var(--ff-lime)">
              All services
            </GroupHeading>
            <ul className="mt-6 space-y-1 border-t border-border pt-5 md:columns-2 md:gap-10 lg:columns-1">
              {services.map((service) => (
                <li key={service.id} className="break-inside-avoid">
                  <Link href={getServiceHref(service.id)} className={linkClass}>
                    <Dot />
                    {service.title}
                  </Link>
                  {service.subServices?.length ? (
                    <ul className="mb-2 ml-[0.1875rem] border-l-2 border-border pl-5">
                      {service.subServices.map((subService) => (
                        <li key={subService.id}>
                          <Link
                            href={getServiceHref(subService.id)}
                            className="inline-flex min-h-10 items-center rounded-sm py-1 text-[0.95rem] text-ink-soft transition-colors hover:text-cobalt focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
                          >
                            {subService.title}
                          </Link>
                        </li>
                      ))}
                    </ul>
                  ) : null}
                </li>
              ))}
            </ul>
          </section>
        </div>
      </div>

      <section aria-labelledby="sitemap-articles" className="px-2 pb-16 sm:px-3 sm:pb-20 lg:pb-24">
        <div className="rounded-3xl bg-white py-12 ring-1 ring-border sm:py-16 lg:py-20">
          <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
            <div className="ff-reveal flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
              <h2 id="sitemap-articles" className="ff-h2">
                Blog <em className="ff-italic font-normal">articles</em>
              </h2>
              <Link href="/blog" className="ff-link inline-flex min-h-11 items-center">
                Visit the family dental library
              </Link>
            </div>
            <div className="mt-10 grid gap-10 lg:grid-cols-3 lg:gap-14">
              {/* The big children's group gets two columns; the smaller groups stack beside it. */}
              <ArticleGroup group={leadGroup} posts={postsFor(leadGroup.kind)} className="lg:col-span-2" listClassName="sm:columns-2 sm:gap-10" />
              <div className="grid gap-10 sm:grid-cols-2 lg:grid-cols-1">
                {otherGroups.map((group) =>
                  postsFor(group.kind).length ? <ArticleGroup key={group.kind} group={group} posts={postsFor(group.kind)} /> : null,
                )}
              </div>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
