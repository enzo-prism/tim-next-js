import { Link } from "wouter";
import { MapPin, Phone, Mail, Facebook, Instagram, CreditCard, Star } from "lucide-react";
import familyFirstLogo from "@assets/Logo_1753972987510.png";
import meshWarm from "@assets/brand/mesh-hero-warm.webp";

export default function Footer() {
  return (
    <footer className="relative overflow-hidden bg-gradient-to-b from-gray-900 to-gray-950 text-white py-12">
      <img
        src={meshWarm.src}
        alt=""
        aria-hidden="true"
        className="pointer-events-none absolute inset-0 h-full w-full object-cover opacity-10 mix-blend-soft-light"
        loading="lazy"
        decoding="async"
      />

      <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid md:grid-cols-4 gap-8">
          {/* Practice Info */}
          <div className="md:col-span-2">
            <div className="flex items-center mb-4">
              <img 
                src={familyFirstLogo.src} 
                alt="Family First Smile Care Logo" 
                width={32}
                height={32}
                className="h-8 w-8 mr-3"
                loading="lazy"
                decoding="async"
              />
              <span className="text-xl font-bold">Family First Smile Care</span>
            </div>
            <p className="text-gray-300 mb-4">
              Gentle, compassionate dental care for the whole family in Los Gatos, CA.
            </p>
            <div className="space-y-2 text-gray-300">
              <div className="flex items-center">
                <MapPin className="mr-3 h-4 w-4" />
                <a
                  href="https://www.google.com/maps/search/?api=1&query=15251+National+Ave+Suite+102+Los+Gatos+CA+95032"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="hover:text-blue-300 transition-colors"
                >
                  15251 National Ave, Suite 102, Los Gatos, CA 95032
                </a>
              </div>
              <div className="flex items-center">
                <Phone className="mr-3 h-4 w-4" />
                <a href="tel:4083588100" className="hover:text-blue-300 transition-colors">
                  (408) 358-8100
                </a>
              </div>
              <div className="flex items-center">
                <Mail className="mr-3 h-4 w-4" />
                <a href="mailto:hello@famfirstsmile.com" className="hover:text-blue-300 transition-colors">
                  hello@famfirstsmile.com
                </a>
              </div>
            </div>
          </div>
          
          {/* Quick Links */}
          <div>
            <h3 className="text-lg font-semibold mb-4">Quick Links</h3>
            <ul className="space-y-2 text-gray-300">
              <li><Link href="/" className="hover:text-blue-300 transition-colors">Home</Link></li>
              <li><Link href="/about" className="hover:text-blue-300 transition-colors">About Us</Link></li>
              <li><Link href="/services" className="hover:text-blue-300 transition-colors">Services</Link></li>
              <li><Link href="/team" className="hover:text-blue-300 transition-colors">Our Team</Link></li>
              <li><Link href="/patient-info" className="hover:text-blue-300 transition-colors">Patient Info</Link></li>
              <li><Link href="/contact" className="hover:text-blue-300 transition-colors">Contact</Link></li>
              <li>
                <a 
                  href="https://g.page/r/Cej0Xl18KcCyEAE/review" 
                  target="_blank" 
                  rel="noopener noreferrer"
                  className="hover:text-orange-400 transition-colors flex items-center"
                >
                  <Star className="h-4 w-4 mr-2" />
                  Leave a Google Review
                </a>
              </li>
              <li>
                <a 
                  href="https://swipesimple.com/links/lnk_67505de480da165de07d5bd3f42fbcce" 
                  target="_blank" 
                  rel="noopener noreferrer"
                  className="hover:text-blue-300 transition-colors flex items-center"
                >
                  <CreditCard className="h-4 w-4 mr-2" />
                  Pay Bill Online
                </a>
              </li>
            </ul>

            <h4 className="mt-7 text-sm font-semibold tracking-wide text-gray-200">Popular Services</h4>
            <ul className="mt-3 space-y-2 text-gray-300">
              <li><Link href="/services/dental-exams" className="hover:text-blue-300 transition-colors">Dental Exams</Link></li>
              <li><Link href="/services/dental-hygiene" className="hover:text-blue-300 transition-colors">Dental Hygiene</Link></li>
              <li><Link href="/services/family-dentistry" className="hover:text-blue-300 transition-colors">Family Dentistry</Link></li>
              <li><Link href="/services/children-dentistry" className="hover:text-blue-300 transition-colors">Children&apos;s Dentistry</Link></li>
              <li><Link href="/services/invisalign" className="hover:text-blue-300 transition-colors">Invisalign</Link></li>
              <li><Link href="/tmj" className="hover:text-blue-300 transition-colors">TMJ Treatment</Link></li>
              <li><Link href="/services/night-guards" className="hover:text-blue-300 transition-colors">Night Guards</Link></li>
              <li><Link href="/technology/itero-digital-scanner" className="hover:text-blue-300 transition-colors">iTero Digital Scanner</Link></li>
            </ul>
          </div>
          
          {/* Office Hours & Social */}
          <div>
            <h3 className="text-lg font-semibold mb-4">Our Hours</h3>
            <div className="text-gray-300 space-y-1 mb-6">
              <p>Monday: 9AM - 5PM</p>
              <p>Tuesday: 9AM - 5PM</p>
              <p>Wednesday: 9AM - 5PM</p>
              <p>Thursday: 9AM - 5PM</p>
              <p>Friday: Closed</p>
            </div>
            <div className="flex space-x-4">
              <a 
                href="https://www.facebook.com/famfirstsmile/" 
                target="_blank" 
                rel="noopener noreferrer"
                className="text-gray-300 hover:text-blue-300 transition-colors" 
                aria-label="Facebook"
              >
                <Facebook className="h-6 w-6" />
              </a>
              <a 
                href="https://www.instagram.com/famfirstsmile/" 
                target="_blank" 
                rel="noopener noreferrer"
                className="text-gray-300 hover:text-blue-300 transition-colors" 
                aria-label="Instagram"
              >
                <Instagram className="h-6 w-6" />
              </a>
            </div>
          </div>
        </div>
        
        <div className="border-t border-gray-700 mt-8 pt-8 text-center text-gray-400">
          <p>
            &copy; 2026 Family First Smile Care. All rights reserved. |{" "}
            <Link href="/privacy-policy" className="hover:text-blue-300 transition-colors">
              Privacy Policy
            </Link>{" "}
            |{" "}
            <Link href="/sitemap" className="hover:text-blue-300 transition-colors">
              Site Map
            </Link>
          </p>
        </div>
      </div>
    </footer>
  );
}
