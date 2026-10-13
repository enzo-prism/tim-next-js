import { Link } from "wouter";
import PracticeAddressLink from "@/components/location/PracticeAddressLink";
import { practiceInfo } from "@/content/structured-data";
import { yelpBusinessProfileUrl } from "@/data/reviews";
import { PhoneLink, TrackedExternalLink } from "@/components/tracking/tracked-links";
import { FooterPumpkinPatch } from "@/components/seasonal/seasonal-client";
import { Pinwheel } from "@/components/brand/pinwheel";

const footerLinkClass =
  "inline-flex min-h-8 items-center text-white/70 transition-colors hover:text-white focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-periwinkle focus-visible:ring-offset-2 focus-visible:ring-offset-night rounded-sm";

const quickLinks = [
  { href: "/", label: "Home" },
  { href: "/about", label: "About Us" },
  { href: "/services", label: "Services" },
  { href: "/team", label: "Our Team" },
  { href: "/testimonials", label: "Testimonials" },
  { href: "/new-patients", label: "New Patients" },
  { href: "/insurance-and-payment", label: "Insurance & Payment" },
  { href: "/urgent-dental-care", label: "Urgent Dental Concerns" },
  { href: "/patient-info", label: "Patient Resources" },
  { href: "/blog", label: "Blog" },
  { href: "/contact", label: "Contact" },
  { href: "/areas-we-serve/santa-cruz", label: "Santa Cruz Families" },
];

const popularServices = [
  { href: "/services/dental-exams", label: "Dental Exams" },
  { href: "/services/dental-hygiene", label: "Dental Hygiene" },
  { href: "/services/family-dentistry", label: "Family Dentistry" },
  { href: "/services/children-dentistry", label: "Children's Dentistry" },
  { href: "/services/invisalign", label: "Invisalign" },
  { href: "/tmj", label: "TMJ Treatment" },
  { href: "/services/night-guards", label: "Night Guards" },
  { href: "/technology/itero-digital-scanner", label: "iTero Digital Scanner" },
  { href: "/blog/how-often-dental-cleaning-los-gatos", label: "Dental Cleaning Frequency Guide" },
  { href: "/blog/when-should-kids-first-see-a-dentist-los-gatos", label: "Kids' First Dental Visit Guide" },
];

const hours = [
  { day: "Monday", time: "9AM - 5PM" },
  { day: "Tuesday", time: "9AM - 5PM" },
  { day: "Wednesday", time: "9AM - 5PM" },
  { day: "Thursday", time: "9AM - 5PM" },
  { day: "Friday", time: "Closed" },
];

export default function Footer() {
  return (
    <footer className="dark relative overflow-hidden bg-night text-white">
      <div className="relative mx-auto max-w-7xl px-4 pt-16 sm:px-6 sm:pt-20 lg:px-8">
        <div className="grid gap-12 lg:grid-cols-12">
          {/* Practice Info */}
          <div className="lg:col-span-5">
            <div className="flex items-center gap-3">
              <span className="grid size-12 place-items-center rounded-full bg-white">
                <Pinwheel className="size-10" />
              </span>
              <span className="text-xl font-bold">Family First Smile Care</span>
            </div>
            <p className="mt-5 max-w-md text-lg leading-relaxed text-white/75">
              Gentle, compassionate dental care for Los Gatos and Santa Cruz families who want a
              warm, family-focused dental home.
            </p>
            <div className="mt-7 grid gap-3 text-base">
              <div>
                <p className="text-xs font-bold uppercase tracking-[0.14em] text-periwinkle">Visit</p>
                <PracticeAddressLink className="mt-1 inline-block text-white/85 underline decoration-white/25 hover:text-white hover:decoration-white" trackingLocation="footer">
                  {practiceInfo.addressText}
                </PracticeAddressLink>
              </div>
              <div className="flex flex-wrap gap-x-8 gap-y-3">
                <div>
                  <p className="text-xs font-bold uppercase tracking-[0.14em] text-periwinkle">Call</p>
                  <PhoneLink location="footer" className="mt-1 inline-block font-display text-2xl font-semibold text-white transition-colors hover:text-lime">
                    (408) 358-8100
                  </PhoneLink>
                </div>
                <div>
                  <p className="text-xs font-bold uppercase tracking-[0.14em] text-periwinkle">Email</p>
                  <a href="mailto:hello@famfirstsmile.com" className="mt-1.5 inline-block text-white/85 underline decoration-white/25 underline-offset-4 transition-colors hover:text-white hover:decoration-white">
                    hello@famfirstsmile.com
                  </a>
                </div>
              </div>
            </div>
            <FooterPumpkinPatch />
          </div>

          {/* Quick Links */}
          <div className="grid gap-10 sm:grid-cols-2 lg:col-span-4">
            <div>
              <h2 className="text-xs font-bold uppercase tracking-[0.14em] text-periwinkle">Quick Links</h2>
              <ul className="mt-4 space-y-1.5">
                {quickLinks.map((link) => (
                  <li key={link.href}>
                    <Link href={link.href} className={footerLinkClass}>
                      {link.label}
                    </Link>
                  </li>
                ))}
                <li>
                  <TrackedExternalLink
                    href="https://g.page/r/Cej0Xl18KcCyEAE/review"
                    target="_blank"
                    rel="noopener noreferrer"
                    className={footerLinkClass}
                    kind="review"
                    provider="google"
                    location="footer"
                  >
                    Leave a Google Review
                    <span className="sr-only"> (opens in a new tab)</span>
                  </TrackedExternalLink>
                </li>
                <li>
                  <TrackedExternalLink
                    href={yelpBusinessProfileUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className={footerLinkClass}
                    kind="review"
                    provider="yelp"
                    location="footer"
                  >
                    Read Yelp Reviews
                    <span className="sr-only"> (opens in a new tab)</span>
                  </TrackedExternalLink>
                </li>
                <li>
                  <TrackedExternalLink
                    href="https://swipesimple.com/links/lnk_67505de480da165de07d5bd3f42fbcce"
                    target="_blank"
                    rel="noopener noreferrer"
                    className={footerLinkClass}
                    kind="pay_bill"
                    location="footer"
                  >
                    Pay Bill Online
                    <span className="sr-only"> (opens in a new tab)</span>
                  </TrackedExternalLink>
                </li>
              </ul>
            </div>
            <div>
              <h3 className="text-xs font-bold uppercase tracking-[0.14em] text-periwinkle">Popular Services</h3>
              <ul className="mt-4 space-y-1.5">
                {popularServices.map((link) => (
                  <li key={link.href}>
                    <Link href={link.href} className={footerLinkClass}>
                      {link.label}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          </div>

          {/* Office Hours & Social */}
          <div className="lg:col-span-3">
            <h2 className="text-xs font-bold uppercase tracking-[0.14em] text-periwinkle">Our Hours</h2>
            <dl className="mt-4 divide-y divide-white/10 rounded-2xl bg-white/[0.04] px-4 ring-1 ring-white/10">
              {hours.map((row) => (
                <div key={row.day} className="flex items-center justify-between gap-4 py-2.5 text-sm">
                  <dt className="text-white/70">{row.day}</dt>
                  <dd className={row.time === "Closed" ? "text-white/50" : "font-semibold text-white"}>{row.time}</dd>
                </div>
              ))}
            </dl>
            <div className="mt-6 flex gap-2">
              <TrackedExternalLink
                href="https://www.facebook.com/famfirstsmile/"
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex min-h-10 items-center rounded-full px-4 text-sm font-semibold text-white ring-1 ring-white/20 transition-colors hover:bg-white hover:text-ink"
                aria-label="Facebook"
                kind="social"
                provider="facebook"
                location="footer"
              >
                Facebook
                <span className="sr-only"> (opens in a new tab)</span>
              </TrackedExternalLink>
              <TrackedExternalLink
                href="https://www.instagram.com/famfirstsmile/"
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex min-h-10 items-center rounded-full px-4 text-sm font-semibold text-white ring-1 ring-white/20 transition-colors hover:bg-white hover:text-ink"
                aria-label="Instagram"
                kind="social"
                provider="instagram"
                location="footer"
              >
                Instagram
                <span className="sr-only"> (opens in a new tab)</span>
              </TrackedExternalLink>
            </div>
          </div>
        </div>

        <div className="mt-14 flex flex-col gap-3 border-t border-white/10 pt-6 text-sm text-white/55 sm:flex-row sm:items-center sm:justify-between">
          <p>
            &copy; 2026 Family First Smile Care. All rights reserved. |{" "}
            <Link href="/privacy-policy" className="hover:text-white transition-colors">
              Privacy Policy
            </Link>{" "}
            |{" "}
            <Link href="/sitemap" className="hover:text-white transition-colors">
              Site Map
            </Link>
          </p>
          <p>Made with care in Los Gatos, California.</p>
        </div>
      </div>

      {/* Giant closing wordmark that rises as the footer scrolls in. */}
      <div aria-hidden="true" className="relative mt-6 select-none overflow-hidden">
        <div className="ff-reveal mx-auto flex max-w-[96rem] items-end justify-center gap-[2vw] px-4" style={{ "--ff-rise": "40%" } as React.CSSProperties}>
          <p className="font-display text-[clamp(3.5rem,13.5vw,13rem)] font-semibold leading-[0.8] tracking-[-0.045em] text-white/[0.09]">
            family first
          </p>
          <Pinwheel spin="view" blend={false} className="mb-[1.5vw] size-[clamp(3rem,10vw,9.5rem)] shrink-0 opacity-90" />
        </div>
      </div>
    </footer>
  );
}
