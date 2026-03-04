"use client";

import { useState, type MouseEvent } from "react";
import { Link, useLocation } from "wouter";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet";
import { ChevronDown, CreditCard, Menu } from "lucide-react";
import familyFirstLogo from "@assets/Logo_1753972987510.png";
import { services } from "@/data/services";
import { APPOINTMENT_FORM_URL, triggerGoogleAdsConversion } from "@/lib/analytics";
import { getServiceHref } from "@/lib/routes";

const navigation: Array<{ name: string; href: string; dropdown?: boolean }> = [
  { name: "Home", href: "/" },
  { name: "About Us", href: "/about" },
  { name: "Services", href: "/services", dropdown: true },
  { name: "Our Team", href: "/team" },
  { name: "Patient Info", href: "/patient-info" },
  { name: "Contact", href: "/contact" },
];

const serviceMenuItems = services.flatMap((service) => [
  { title: service.title, href: getServiceHref(service.id) },
  ...(service.subServices?.map((subService) => ({
    title: subService.title,
    href: getServiceHref(subService.id),
  })) ?? []),
]);

export default function Header() {
  const [location] = useLocation();
  const [isOpen, setIsOpen] = useState(false);
  const handleAppointmentClick = (event: MouseEvent<HTMLAnchorElement>) => {
    event.preventDefault();
    triggerGoogleAdsConversion(APPOINTMENT_FORM_URL, "_blank");
  };
  const isServicesActive =
    location === "/services" ||
    location.startsWith("/services/") ||
    location.startsWith("/technology/") ||
    location === "/tmj";
  return (
    <nav
      className="fixed top-0 w-full z-50 bg-white/80 backdrop-blur border-b border-gray-200/60 shadow-sm"
      role="navigation"
      aria-label="Main navigation"
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          {/* Logo */}
          <Link href="/" className="flex items-center">
            <div className="h-10 w-10 mr-3 rounded-xl overflow-hidden bg-white shadow-sm ring-1 ring-black/5">
              <img
                src={familyFirstLogo.src}
                alt="Family First Smile Care Logo"
                width={40}
                height={40}
                className="h-full w-full object-cover"
                onError={(e) => {
                  console.error("ES module logo failed, trying fallback path:", familyFirstLogo.src);
                  e.currentTarget.src = "/attached_assets/Logo_1753972987510.png";
                  e.currentTarget.onerror = () => {
                    console.error("All logo paths failed");
                    e.currentTarget.parentElement?.setAttribute("style", "display:none");
                  };
                }}
              />
            </div>
            <span className="text-xl font-bold text-gray-800">Family First Smile Care</span>
          </Link>
          
          {/* Desktop Navigation */}
          <div className="hidden md:flex items-center space-x-8">
            {navigation.map((item) => (
              item.dropdown ? (
                <DropdownMenu key={item.name}>
                  <DropdownMenuTrigger asChild>
                    <button
                      type="button"
                      aria-current={isServicesActive ? "page" : undefined}
                      className={`nav-link inline-flex items-center gap-1 ${
                        isServicesActive
                          ? "text-primary font-semibold"
                          : "text-gray-700 hover:text-primary"
                      } data-[state=open]:text-primary`}
                    >
                      Services
                      <ChevronDown className="h-4 w-4" />
                    </button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="start" className="w-80 p-3">
                    <DropdownMenuLabel className="px-3 py-2 text-xs font-semibold text-gray-500 uppercase tracking-wide">
                      Services
                    </DropdownMenuLabel>
                    <DropdownMenuItem
                      asChild
                      className="cursor-pointer rounded-md px-3 py-2 text-sm font-semibold text-gray-900 focus:bg-primary/10 focus:text-primary"
                    >
                      <Link href="/services">View all services</Link>
                    </DropdownMenuItem>
                    <div className="space-y-1">
                      {serviceMenuItems.map((service) => (
                        <DropdownMenuItem
                          key={service.href}
                          asChild
                          className="cursor-pointer rounded-md px-3 py-2 text-sm font-semibold text-gray-900 focus:bg-primary/10 focus:text-primary"
                        >
                          <Link href={service.href}>{service.title}</Link>
                        </DropdownMenuItem>
                      ))}
                    </div>
                    <DropdownMenuSeparator className="my-2" />
                    <DropdownMenuLabel className="px-3 py-2 text-xs font-semibold text-gray-500 uppercase tracking-wide">
                      Technology
                    </DropdownMenuLabel>
                    <DropdownMenuItem
                      asChild
                      className="cursor-pointer rounded-md px-3 py-2 text-sm font-semibold text-gray-900 focus:bg-primary/10 focus:text-primary"
                    >
                      <Link href="/technology/itero-digital-scanner">iTero Digital Scanner</Link>
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              ) : (
                <Link
                  key={item.name}
                  href={item.href}
                  aria-current={location === item.href ? "page" : undefined}
                  className={`nav-link ${
                    location === item.href
                      ? "text-primary font-semibold"
                      : "text-gray-700 hover:text-primary"
                  }`}
                >
                  {item.name}
                </Link>
              )
            ))}
            <Button
              asChild
              variant="outline"
              className="mr-4 border-primary text-primary hover:bg-primary hover:text-primary-foreground"
            >
              <a
                href="https://swipesimple.com/links/lnk_67505de480da165de07d5bd3f42fbcce"
                target="_blank"
                rel="noopener noreferrer"
              >
                <CreditCard className="h-4 w-4 mr-2" />
                Pay Bill
              </a>
            </Button>
            <Button asChild className="bg-primary text-primary-foreground hover:bg-primary/90">
              <a
                href={APPOINTMENT_FORM_URL}
                target="_blank"
                rel="noopener noreferrer"
                onClick={handleAppointmentClick}
              >
                Book Appointment
              </a>
            </Button>
          </div>
          
          {/* Mobile Menu */}
          <div className="md:hidden">
            <Sheet open={isOpen} onOpenChange={setIsOpen}>
              <SheetTrigger asChild>
                <Button variant="ghost" size="icon" aria-label="Toggle mobile menu">
                  <Menu className="h-6 w-6" />
                </Button>
              </SheetTrigger>
              <SheetContent side="right" className="w-[300px] sm:w-[400px]">
                <nav className="flex flex-col space-y-4 mt-8">
                  {navigation.filter((item) => !item.dropdown).map((item) => (
                    <Link
                      key={item.name}
                      href={item.href}
                      aria-current={location === item.href ? "page" : undefined}
                      className={`nav-link text-lg ${
                        location === item.href
                          ? "text-primary font-semibold"
                          : "text-gray-700 hover:text-primary"
                      }`}
                      onClick={() => setIsOpen(false)}
                    >
                      {item.name}
                    </Link>
                  ))}
                  <div className="border-t border-gray-200 pt-4">
                    <p className="text-sm font-semibold text-gray-500 uppercase tracking-wide">Services</p>
                    <div className="mt-3 flex flex-col space-y-4">
                      <Link
                        href="/services"
                        className="text-gray-800 font-semibold hover:text-primary"
                        onClick={() => setIsOpen(false)}
                      >
                        View all services
                      </Link>
                      {serviceMenuItems.map((service) => (
                        <Link
                          key={service.href}
                          href={service.href}
                          className="text-gray-800 font-semibold hover:text-primary"
                          onClick={() => setIsOpen(false)}
                        >
                          {service.title}
                        </Link>
                      ))}
                    </div>
                    <div className="mt-6 border-t border-gray-200 pt-4">
                      <p className="text-sm font-semibold text-gray-500 uppercase tracking-wide">Technology</p>
                      <div className="mt-3 flex flex-col space-y-4">
                        <Link
                          href="/technology/itero-digital-scanner"
                          className="text-gray-800 font-semibold hover:text-primary"
                          onClick={() => setIsOpen(false)}
                        >
                          iTero Digital Scanner
                        </Link>
                      </div>
                    </div>
                  </div>
                  <Button
                    asChild
                    variant="outline"
                    className="w-full border-primary text-primary hover:bg-primary hover:text-primary-foreground"
                  >
                    <a
                      href="https://swipesimple.com/links/lnk_67505de480da165de07d5bd3f42fbcce"
                      target="_blank"
                      rel="noopener noreferrer"
                      onClick={() => setIsOpen(false)}
                    >
                      <CreditCard className="h-4 w-4 mr-2" />
                      Pay Bill Online
                    </a>
                  </Button>

                  <Button asChild className="w-full bg-primary text-primary-foreground hover:bg-primary/90">
                    <a
                      href={APPOINTMENT_FORM_URL}
                      target="_blank"
                      rel="noopener noreferrer"
                      onClick={(event) => {
                        setIsOpen(false);
                        handleAppointmentClick(event);
                      }}
                    >
                      Book Appointment
                    </a>
                  </Button>
                </nav>
              </SheetContent>
            </Sheet>
          </div>
        </div>
      </div>
      <div
        aria-hidden="true"
        className="pointer-events-none absolute inset-x-0 bottom-0 h-px bg-gradient-to-r from-transparent via-primary/35 to-transparent"
      />
    </nav>
  );
}
