"use client";

import { Helmet } from "react-helmet-async";
import { Link } from "wouter";
import PageBreadcrumbs from "@/components/navigation/PageBreadcrumbs";
import { services } from "@/data/services";
import { getServiceHref } from "@/lib/routes";

export default function SiteMap() {
  return (
    <div className="pt-16 pb-20 bg-white">
      <Helmet>
        <meta name="robots" content="noindex,follow" />
      </Helmet>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <PageBreadcrumbs items={[{ label: "Home", href: "/" }, { label: "Site Map" }]} />

        <div className="max-w-3xl">
          <h1 className="text-4xl font-bold mb-4">Site Map</h1>
          <p className="text-xl text-gray-600">
            Browse the main pages, patient resources, and our full list of services.
          </p>
        </div>

        <div className="mt-12 grid gap-10 lg:grid-cols-2">
          <section>
            <h2 className="text-2xl font-bold mb-4">Main Pages</h2>
            <ul className="space-y-2 text-gray-700">
              <li><Link href="/" className="hover:text-primary transition-colors">Home</Link></li>
              <li><Link href="/about" className="hover:text-primary transition-colors">About</Link></li>
              <li><Link href="/services" className="hover:text-primary transition-colors">Services</Link></li>
              <li><Link href="/team" className="hover:text-primary transition-colors">Our Team</Link></li>
              <li><Link href="/patient-info" className="hover:text-primary transition-colors">Patient Info</Link></li>
              <li><Link href="/contact" className="hover:text-primary transition-colors">Contact</Link></li>
              <li><Link href="/book-appointment" className="hover:text-primary transition-colors">Book Appointment</Link></li>
              <li><Link href="/tmj" className="hover:text-primary transition-colors">TMJ Treatment</Link></li>
              <li>
                <Link href="/technology/itero-digital-scanner" className="hover:text-primary transition-colors">
                  iTero Digital Scanner
                </Link>
              </li>
            </ul>
          </section>

          <section>
            <h2 className="text-2xl font-bold mb-4">Patient Resources</h2>
            <ul className="space-y-2 text-gray-700">
              <li><Link href="/patient-info" className="hover:text-primary transition-colors">Patient Info Hub</Link></li>
              <li>
                <Link href="/patient-info/brushing" className="hover:text-primary transition-colors">
                  How to Brush Properly
                </Link>
              </li>
              <li>
                <Link href="/patient-info/flossing" className="hover:text-primary transition-colors">
                  Flossing Fundamentals
                </Link>
              </li>
              <li>
                <Link href="/patient-info/nutrition" className="hover:text-primary transition-colors">
                  Nutrition for Healthy Teeth
                </Link>
              </li>
            </ul>
          </section>
        </div>

        <section className="mt-14">
          <h2 className="text-2xl font-bold mb-4">All Services</h2>
          <div className="grid gap-6 md:grid-cols-2">
            {services.map((service) => (
              <div key={service.id} className="rounded-2xl border border-gray-200 bg-white p-6">
                <Link
                  href={getServiceHref(service.id)}
                  className="text-lg font-semibold text-gray-900 hover:text-primary transition-colors"
                >
                  {service.title}
                </Link>

                {service.description ? (
                  <p className="mt-2 text-gray-600">{service.description}</p>
                ) : null}

                {service.subServices?.length ? (
                  <ul className="mt-4 space-y-2 text-gray-700">
                    {service.subServices.map((subService) => (
                      <li key={subService.id}>
                        <Link
                          href={getServiceHref(subService.id)}
                          className="hover:text-primary transition-colors"
                        >
                          {subService.title}
                        </Link>
                      </li>
                    ))}
                  </ul>
                ) : null}
              </div>
            ))}
          </div>
        </section>
      </div>
    </div>
  );
}
