"use client";

import { Link } from "wouter";
import PageBreadcrumbs from "@/components/navigation/PageBreadcrumbs";

export default function PrivacyPolicy() {
  return (
    <div className="pt-16 pb-20 bg-white">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        <PageBreadcrumbs items={[{ label: "Home", href: "/" }, { label: "Privacy Policy" }]} />

        <h1 className="text-4xl font-bold mb-3">Privacy Policy</h1>
        <p className="text-gray-600 mb-10">Last updated: July 15, 2026</p>

        <div className="prose prose-gray max-w-none">
          <p>
            Family First Smile Care respects your privacy. This policy explains the information our public website
            collects, why we use it, the service providers that help us operate the site, and the choices available to
            you. This website is not a patient portal and should not be used for urgent or highly sensitive medical
            information.
          </p>

          <h2>Information We Collect</h2>
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

          <h2>How We Use Your Information</h2>
          <p>We use this information to:</p>
          <ul>
            <li>Respond to your questions and appointment requests</li>
            <li>Notify our office team and maintain a record of the request</li>
            <li>Measure which pages and campaigns lead to calls or appointment requests</li>
            <li>Protect the website from spam, fraud, and misuse</li>
            <li>Improve website performance, accessibility, and ease of use</li>
          </ul>

          <h2>Analytics, Cookies, and Third-Party Services</h2>
          <p>
            We use Google Analytics and Vercel Analytics to understand aggregate website use. We do not load a
            session-replay service on this website. Our optional website voice assistant is provided by ElevenLabs and loads only after a visitor
            interacts with the site or the page has been idle.
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

          <h2>How Long We Keep Information</h2>
          <p>
            We keep website request records only as long as reasonably necessary to respond, operate the practice,
            maintain required business records, protect against misuse, and meet legal obligations. Retention may vary
            based on the type of request and whether you become a patient.
          </p>

          <h2>Your Choices</h2>
          <p>
            You can limit cookies through your browser settings. You may also contact us to ask about access,
            correction, or deletion of personal information submitted through this website, subject to legal and
            recordkeeping requirements. Browser privacy controls may affect how some analytics tools operate.
          </p>

          <h2>Security and Children</h2>
          <p>
            We use reasonable administrative and technical safeguards, but no online service can guarantee absolute
            security. This website is intended for adults arranging care for themselves or their families; children
            should not submit personal information without a parent or guardian.
          </p>

          <h2>Policy Changes</h2>
          <p>We may update this policy as our website or service providers change. The date above shows the latest revision.</p>

          <h2>Contact Us</h2>
          <p>
            If you have a privacy question or request, call (408) 358-8100 or{" "}
            <Link href="/contact" className="text-primary underline underline-offset-4">
              contact us
            </Link>
            .
          </p>
        </div>
      </div>
    </div>
  );
}
