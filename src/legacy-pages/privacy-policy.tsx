"use client";

import { Link } from "wouter";
import PageBreadcrumbs from "@/components/navigation/PageBreadcrumbs";

export default function PrivacyPolicy() {
  return (
    <div className="pt-16 pb-20 bg-white">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        <PageBreadcrumbs items={[{ label: "Home", href: "/" }, { label: "Privacy Policy" }]} />

        <h1 className="text-4xl font-bold mb-3">Privacy Policy</h1>
        <p className="text-gray-600 mb-10">Last updated: February 6, 2026</p>

        <div className="prose prose-gray max-w-none">
          <p>
            Family First Smile Care respects your privacy. This page explains what information we collect through our
            website, how we use it, and the choices you have.
          </p>

          <h2>Information We Collect</h2>
          <p>When you contact us through our website, we may collect information such as:</p>
          <ul>
            <li>Your name</li>
            <li>Email address</li>
            <li>Phone number</li>
            <li>Any message you choose to send</li>
          </ul>

          <h2>How We Use Your Information</h2>
          <p>We use this information to:</p>
          <ul>
            <li>Respond to your questions and appointment requests</li>
            <li>Provide customer support</li>
            <li>Improve our website and services</li>
          </ul>

          <h2>Analytics, Cookies, and Third-Party Services</h2>
          <p>
            We use third-party analytics tools (including Google Analytics and Hotjar) to understand how visitors use
            our site and to improve performance and user experience. These tools may use cookies or similar technologies
            to collect usage data.
          </p>
          <p>
            Our website may also include links to third-party websites or services (for example, online payments). If you
            follow those links, any information you provide is governed by the third party&apos;s privacy practices.
          </p>

          <h2>Contact Us</h2>
          <p>
            If you have questions about this Privacy Policy, please{" "}
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

