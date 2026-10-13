import type { ReactNode } from "react";
import { Link } from "wouter";
import { MinimalGlyph } from "@/components/ui/minimal-glyph";
import { PageHero } from "@/components/site/page-hero";
import BlogTableOfContents from "@/components/blog/blog-table-of-contents";
import { PhoneLink } from "@/components/tracking/tracked-links";

const sections: { id: string; title: string; body: ReactNode }[] = [
  {
    id: "information-we-collect",
    title: "Information We Collect",
    body: (
      <>
        <p>When you contact us through our website, we may collect information such as:</p>
        <ul>
          <li>Your name</li>
          <li>Email address</li>
          <li>Phone number</li>
          <li>The service, preferred date, or preferred time you select</li>
          <li>Any message you choose to send</li>
          <li>Consent records and technical details used to prevent duplicate or abusive submissions</li>
        </ul>
        <p>
          We may also collect limited website activity such as pages viewed, buttons clicked, referring website,
          campaign parameters, browser or device information, and approximate location derived from an IP address.
        </p>
      </>
    ),
  },
  {
    id: "how-we-use-your-information",
    title: "How We Use Your Information",
    body: (
      <>
        <p>We use this information to:</p>
        <ul>
          <li>Respond to your questions and appointment requests</li>
          <li>Notify our office team and maintain a record of the request</li>
          <li>Measure which pages and campaigns lead to calls or appointment requests</li>
          <li>Protect the website from spam, fraud, and misuse</li>
          <li>Improve website performance, accessibility, and ease of use</li>
        </ul>
      </>
    ),
  },
  {
    id: "analytics-cookies-and-third-party-services",
    title: "Analytics, Cookies, and Third-Party Services",
    body: (
      <>
        <p>
          We use Google Analytics and Vercel Analytics to understand aggregate website use. We do not load a
          session-replay service on this website. Our optional website voice assistant is provided by ElevenLabs and
          loads only after a visitor interacts with the site or the page has been idle.
        </p>
        <p>
          Website form requests may be stored using Neon database services and relayed to our office using Formspree.
          Hosting and security services may process limited technical information needed to deliver and protect the
          site. These providers process information under their own terms and privacy practices.
        </p>
        <p>
          We do not sell personal information collected through these forms. External links, including payment,
          mapping, review, and social-media services, are governed by the destination&apos;s privacy practices.
        </p>
      </>
    ),
  },
  {
    id: "how-long-we-keep-information",
    title: "How Long We Keep Information",
    body: (
      <p>
        We keep website request records only as long as reasonably necessary to respond, operate the practice,
        maintain required business records, protect against misuse, and meet legal obligations. Retention may vary
        based on the type of request and whether you become a patient.
      </p>
    ),
  },
  {
    id: "your-choices",
    title: "Your Choices",
    body: (
      <p>
        You can limit cookies through your browser settings. You may also contact us to ask about access,
        correction, or deletion of personal information submitted through this website, subject to legal and
        recordkeeping requirements. Browser privacy controls may affect how some analytics tools operate.
      </p>
    ),
  },
  {
    id: "security-and-children",
    title: "Security and Children",
    body: (
      <p>
        We use reasonable administrative and technical safeguards, but no online service can guarantee absolute
        security. This website is intended for adults arranging care for themselves or their families; children
        should not submit personal information without a parent or guardian.
      </p>
    ),
  },
  {
    id: "policy-changes",
    title: "Policy Changes",
    body: <p>We may update this policy as our website or service providers change. The date above shows the latest revision.</p>,
  },
  {
    id: "contact-us",
    title: "Contact Us",
    body: (
      <p>
        If you have a privacy question or request, call{" "}
        <PhoneLink location="privacy_policy">(408) 358-8100</PhoneLink> or <Link href="/contact">contact us</Link>.
      </p>
    ),
  },
];

// Plain-language highlights; each restates a sentence from the policy below.
const highlights = [
  "We use what you send us to respond to your questions and appointment requests.",
  "We do not sell personal information collected through our website forms.",
  "This website is not a patient portal, so please keep urgent or highly sensitive medical details off it.",
  "You can ask us about access, correction, or deletion of what you submitted.",
];

export default function PrivacyPolicy() {
  return (
    <div className="overflow-x-clip">
      <PageHero
        id="privacy-heading"
        tone="cream"
        art="pinwheel"
        breadcrumbs={[{ label: "Home", href: "/" }, { label: "Privacy Policy" }]}
        eyebrow="Your privacy"
        titleText="Privacy Policy"
        lead={
          <p>
            How our website handles the information you share with us: what we collect, why, who helps us run the site,
            and the choices you have.
          </p>
        }
        meta={
          <p className="inline-flex items-center gap-2 rounded-full bg-white px-3.5 py-1.5 font-semibold text-ink ring-1 ring-ink/10">
            <span aria-hidden="true" className="size-2 rounded-full bg-cobalt" />
            Last updated: July 15, 2026
          </p>
        }
      />

      <div className="py-12 sm:py-16 lg:py-20">
        <div className="mx-auto grid max-w-7xl gap-8 px-4 sm:px-6 lg:grid-cols-[13.5rem_minmax(0,43rem)] lg:justify-center lg:gap-x-14 lg:gap-y-10 lg:px-8 xl:gap-x-20">
          <section aria-labelledby="privacy-summary-heading" className="rounded-3xl bg-periwinkle-wash p-6 sm:p-8 lg:col-start-2 lg:row-start-1">
            <h2 id="privacy-summary-heading" className="font-display text-2xl font-semibold tracking-[-0.02em] text-ink">
              The short version
            </h2>
            <ul className="mt-5 space-y-3">
              {highlights.map((item) => (
                <li key={item} className="flex gap-3 text-base leading-relaxed text-ink">
                  <span aria-hidden="true" className="mt-0.5 grid size-6 shrink-0 place-items-center rounded-full bg-white text-xs font-bold text-cobalt ring-1 ring-ink/5">
                    <MinimalGlyph name="check" />
                  </span>
                  <span>{item}</span>
                </li>
              ))}
            </ul>
          </section>

          <div className="lg:col-start-1 lg:row-span-2 lg:row-start-1">
            <div className="lg:sticky lg:top-28">
              <BlogTableOfContents items={sections.map(({ id, title }) => ({ id, title }))} topHref="#privacy-heading" />
            </div>
          </div>

          <div className="min-w-0 lg:col-start-2 lg:row-start-2">
            <div className="ff-prose prose-li:my-1 prose-a:font-semibold prose-a:decoration-cobalt/30 prose-a:underline-offset-4 hover:prose-a:decoration-cobalt">
              <p className="text-[1.15rem] leading-relaxed text-ink">
                Family First Smile Care respects your privacy. This policy explains the information our public website
                collects, why we use it, the service providers that help us operate the site, and the choices available
                to you. This website is not a patient portal and should not be used for urgent or highly sensitive
                medical information.
              </p>
              {sections.map((section) => (
                <section key={section.id} id={section.id} className="scroll-mt-28">
                  <h2>{section.title}</h2>
                  {section.body}
                </section>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
