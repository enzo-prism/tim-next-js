"use client";

import Image from "next/image";
import { Link } from "wouter";
import familyFirstLogo from "@assets/Logo_1753972987510.png";
import PracticeAddressLink from "@/components/location/PracticeAddressLink";
import { practiceInfo } from "@/content/structured-data";
import { yelpBusinessProfileUrl } from "@/data/reviews";
import {
  trackPayBillClick,
  trackPhoneClick,
  trackReviewLinkClick,
  trackSocialClick,
} from "@/lib/analytics";

export default function Footer() {
  return (
    <footer className="relative overflow-hidden border-t border-border bg-muted/40 py-12 text-foreground">
      <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid md:grid-cols-4 gap-8">
          {/* Practice Info */}
          <div className="md:col-span-2">
            <div className="flex items-center mb-4">
              <Image
                src={familyFirstLogo}
                alt=""
                width={32}
                height={32}
                className="h-8 w-8 mr-3"
              />
              <span className="text-xl font-bold">Family First Smile Care</span>
            </div>
            <p className="text-muted-foreground mb-4">
              Gentle, compassionate dental care for Los Gatos and Santa Cruz families who want a
              warm, family-focused dental home.
            </p>
            <div className="space-y-2 text-muted-foreground">
              <div className="flex items-center">
                <PracticeAddressLink className="text-inherit hover:text-primary" trackingLocation="footer">
                  {practiceInfo.addressText}
                </PracticeAddressLink>
              </div>
              <div className="flex items-center">
                <a
                  href="tel:4083588100"
                  className="hover:text-primary transition-colors"
                  onClick={() => trackPhoneClick("footer")}
                >
                  (408) 358-8100
                </a>
              </div>
              <div className="flex items-center">
                <a href="mailto:hello@famfirstsmile.com" className="hover:text-primary transition-colors">
                  hello@famfirstsmile.com
                </a>
              </div>
            </div>
          </div>
          
          {/* Quick Links */}
          <div>
            <h2 className="text-lg font-semibold mb-4">Quick Links</h2>
            <ul className="space-y-2 text-muted-foreground">
              <li><Link href="/" className="hover:text-primary transition-colors">Home</Link></li>
              <li><Link href="/about" className="hover:text-primary transition-colors">About Us</Link></li>
              <li><Link href="/services" className="hover:text-primary transition-colors">Services</Link></li>
              <li><Link href="/team" className="hover:text-primary transition-colors">Our Team</Link></li>
              <li><Link href="/testimonials" className="hover:text-primary transition-colors">Testimonials</Link></li>
              <li><Link href="/patient-info" className="hover:text-primary transition-colors">Patient Info</Link></li>
              <li><Link href="/blog" className="hover:text-primary transition-colors">Blog</Link></li>
              <li><Link href="/contact" className="hover:text-primary transition-colors">Contact</Link></li>
              <li>
                <Link href="/areas-we-serve/santa-cruz" className="hover:text-primary transition-colors">
                  Santa Cruz Families
                </Link>
              </li>
              <li>
                <a 
                  href="https://g.page/r/Cej0Xl18KcCyEAE/review" 
                  target="_blank" 
                  rel="noopener noreferrer"
                  className="hover:text-primary transition-colors"
                  onClick={() => trackReviewLinkClick("google", "footer")}
                >
                  Leave a Google Review
                  <span className="sr-only"> (opens in a new tab)</span>
                </a>
              </li>
              <li>
                <a
                  href={yelpBusinessProfileUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="hover:text-primary transition-colors"
                  onClick={() => trackReviewLinkClick("yelp", "footer")}
                >
                  Read Yelp Reviews
                  <span className="sr-only"> (opens in a new tab)</span>
                </a>
              </li>
              <li>
                <a 
                  href="https://swipesimple.com/links/lnk_67505de480da165de07d5bd3f42fbcce" 
                  target="_blank" 
                  rel="noopener noreferrer"
                  className="hover:text-primary transition-colors"
                  onClick={() => trackPayBillClick("footer")}
                >
                  Pay Bill Online
                  <span className="sr-only"> (opens in a new tab)</span>
                </a>
              </li>
            </ul>

            <h3 className="mt-7 text-sm font-semibold tracking-wide text-foreground">Popular Services</h3>
            <ul className="mt-3 space-y-2 text-muted-foreground">
              <li><Link href="/services/dental-exams" className="hover:text-primary transition-colors">Dental Exams</Link></li>
              <li><Link href="/services/dental-hygiene" className="hover:text-primary transition-colors">Dental Hygiene</Link></li>
              <li><Link href="/services/family-dentistry" className="hover:text-primary transition-colors">Family Dentistry</Link></li>
              <li><Link href="/services/children-dentistry" className="hover:text-primary transition-colors">Children&apos;s Dentistry</Link></li>
              <li><Link href="/services/invisalign" className="hover:text-primary transition-colors">Invisalign</Link></li>
              <li><Link href="/tmj" className="hover:text-primary transition-colors">TMJ Treatment</Link></li>
              <li><Link href="/services/night-guards" className="hover:text-primary transition-colors">Night Guards</Link></li>
              <li><Link href="/technology/itero-digital-scanner" className="hover:text-primary transition-colors">iTero Digital Scanner</Link></li>
              <li>
                <Link
                  href="/blog/how-often-dental-cleaning-los-gatos"
                  className="hover:text-primary transition-colors"
                >
                  Dental Cleaning Frequency Guide
                </Link>
              </li>
              <li>
                <Link
                  href="/blog/when-should-kids-first-see-a-dentist-los-gatos"
                  className="hover:text-primary transition-colors"
                >
                  Kids' First Dental Visit Guide
                </Link>
              </li>
            </ul>
          </div>
          
          {/* Office Hours & Social */}
          <div>
            <h2 className="text-lg font-semibold mb-4">Our Hours</h2>
            <div className="text-muted-foreground space-y-1 mb-6">
              <p>Monday: 9AM - 5PM</p>
              <p>Tuesday: 9AM - 5PM</p>
              <p>Wednesday: 9AM - 5PM</p>
              <p>Thursday: 9AM - 5PM</p>
              <p>Friday: Closed</p>
            </div>
            <div className="flex gap-4">
              <a 
                href="https://www.facebook.com/famfirstsmile/" 
                target="_blank" 
                rel="noopener noreferrer"
                className="text-muted-foreground hover:text-primary transition-colors" 
                aria-label="Facebook"
                onClick={() => trackSocialClick("facebook", "footer")}
              >
                Facebook
                <span className="sr-only"> (opens in a new tab)</span>
              </a>
              <a 
                href="https://www.instagram.com/famfirstsmile/" 
                target="_blank" 
                rel="noopener noreferrer"
                className="text-muted-foreground hover:text-primary transition-colors" 
                aria-label="Instagram"
                onClick={() => trackSocialClick("instagram", "footer")}
              >
                Instagram
                <span className="sr-only"> (opens in a new tab)</span>
              </a>
            </div>
          </div>
        </div>
        
        <div className="border-t border-border mt-8 pt-8 text-center text-muted-foreground">
          <p>
            &copy; 2026 Family First Smile Care. All rights reserved. |{" "}
            <Link href="/privacy-policy" className="hover:text-primary transition-colors">
              Privacy Policy
            </Link>{" "}
            |{" "}
            <Link href="/sitemap" className="hover:text-primary transition-colors">
              Site Map
            </Link>
          </p>
        </div>
      </div>
    </footer>
  );
}
