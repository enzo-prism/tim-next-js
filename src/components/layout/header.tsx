"use client";

import { useState } from "react";
import Image from "next/image";
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
import { MinimalGlyph } from "@/components/ui/minimal-glyph";
import familyFirstLogo from "@assets/Logo_1753972987510.png";
import { services } from "@/data/services";
import {
  APPOINTMENT_FORM_URL,
  trackAppointmentCtaClick,
  trackPayBillClick,
  trackServiceLearnMoreClick,
} from "@/lib/analytics";
import { getServiceHref } from "@/lib/routes";

const navigation: Array<{ name: string; href: string; dropdown?: boolean }> = [
  { name: "Home", href: "/" },
  { name: "About Us", href: "/about" },
  { name: "Services", href: "/services", dropdown: true },
  { name: "Our Team", href: "/team" },
  { name: "Patient Info", href: "/patient-info" },
  { name: "Blog", href: "/blog" },
  { name: "Contact", href: "/contact" },
];

const serviceMenuItems = services.flatMap((service) => [
  { id: service.id, title: service.title, href: getServiceHref(service.id) },
  ...(service.subServices?.map((subService) => ({
    id: subService.id,
    title: subService.title,
    href: getServiceHref(subService.id),
  })) ?? []),
]);

export default function Header() {
  const [location] = useLocation();
  const [isOpen, setIsOpen] = useState(false);
  const handleAppointmentClick = (trackingLocation = "header") => {
    trackAppointmentCtaClick(trackingLocation);
  };
  const isServicesActive =
    location === "/services" ||
    location.startsWith("/services/") ||
    location.startsWith("/technology/") ||
    location === "/tmj";
  const isItemActive = (href: string) =>
    href === "/blog" ? location === "/blog" || location.startsWith("/blog/") : location === href;
  return (
    <nav
      className="fixed inset-x-0 top-0 z-50 border-b border-gray-200/70 bg-white/95 shadow-sm"
      role="navigation"
      aria-label="Main navigation"
    >
      <div className="mx-auto w-full max-w-[1320px] px-3 sm:px-4 lg:px-6">
        <div className="flex h-16 items-center justify-between gap-3">
          {/* Logo */}
          <Link href="/" className="group flex min-w-0 items-center gap-2.5 sm:gap-3">
            <div className="h-10 w-10 shrink-0 overflow-hidden rounded-xl bg-white shadow-sm ring-1 ring-black/5 transition-transform duration-200">
              <Image
                src={familyFirstLogo}
                alt="Family First Smile Care Logo"
                width={40}
                height={40}
                priority
                className="h-full w-full object-cover"
              />
            </div>
            <div className="min-w-0">
              <span className="hidden whitespace-nowrap text-base font-extrabold leading-tight tracking-tight text-gray-900 sm:block sm:text-lg">
                Family First Smile Care
              </span>
              <span className="block text-xs font-extrabold leading-tight tracking-tight text-gray-900 sm:hidden">
                <span className="block">Family First</span>
                <span className="block">Smile Care</span>
              </span>
              <span className="hidden text-[11px] font-semibold uppercase tracking-[0.08em] text-gray-500 2xl:block">
                Los Gatos Family Dentist
              </span>
            </div>
          </Link>

          {/* Desktop Navigation */}
          <div className="hidden xl:flex flex-1 items-center justify-center">
            <div className="flex items-center gap-1 rounded-lg border border-gray-200/90 bg-white/95 p-1 shadow-sm">
              {navigation.map((item) =>
                item.dropdown ? (
                  <DropdownMenu key={item.name}>
                    <DropdownMenuTrigger asChild>
                      <button
                        type="button"
                        aria-current={isServicesActive ? "page" : undefined}
                        className={`inline-flex h-9 items-center gap-1.5 rounded-lg px-3 text-sm font-semibold whitespace-nowrap transition-colors ${
                          isServicesActive
                            ? "bg-primary/10 text-primary"
                            : "text-gray-700 hover:bg-primary/5 hover:text-primary"
                        } data-[state=open]:bg-primary/10 data-[state=open]:text-primary`}
                      >
                        Services
                        <MinimalGlyph name="chevron-down" className="h-3.5 w-3.5 opacity-70" />
                      </button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent
                      align="start"
                      sideOffset={6}
                      className="w-80 border-sky-200 bg-white p-3 text-slate-950 shadow-sm"
                    >
                      <DropdownMenuLabel className="px-3 py-2 text-xs font-semibold uppercase tracking-wide text-slate-500">
                        Services
                      </DropdownMenuLabel>
                      <DropdownMenuItem
                        asChild
                        className="cursor-pointer rounded-md px-3 py-2 text-sm font-semibold text-slate-950 focus:bg-primary/10 focus:text-primary"
                      >
                        <Link
                          href="/services"
                          onClick={() => trackServiceLearnMoreClick("all-services", "header_services_menu")}
                        >
                          View all services
                        </Link>
                      </DropdownMenuItem>
                      <div className="space-y-1">
                        {serviceMenuItems.map((service) => (
                          <DropdownMenuItem
                            key={service.href}
                            asChild
                            className="cursor-pointer rounded-md px-3 py-2 text-sm font-semibold text-slate-950 focus:bg-primary/10 focus:text-primary"
                          >
                            <Link
                              href={service.href}
                              onClick={() => trackServiceLearnMoreClick(service.id, "header_services_menu")}
                            >
                              {service.title}
                            </Link>
                          </DropdownMenuItem>
                        ))}
                      </div>
                      <DropdownMenuSeparator className="my-2 bg-sky-100" />
                      <DropdownMenuLabel className="px-3 py-2 text-xs font-semibold uppercase tracking-wide text-slate-500">
                        Technology
                      </DropdownMenuLabel>
                      <DropdownMenuItem
                        asChild
                        className="cursor-pointer rounded-md px-3 py-2 text-sm font-semibold text-slate-950 focus:bg-primary/10 focus:text-primary"
                      >
                        <Link
                          href="/technology/itero-digital-scanner"
                          onClick={() => trackServiceLearnMoreClick("itero-digital-scanner", "header_services_menu")}
                        >
                          iTero Digital Scanner
                        </Link>
                      </DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
                ) : (
                  <Link
                    key={item.name}
                    href={item.href}
                    aria-current={isItemActive(item.href) ? "page" : undefined}
                    className={`inline-flex h-9 items-center rounded-lg px-3 text-sm font-semibold whitespace-nowrap transition-colors ${
                      isItemActive(item.href)
                        ? "bg-primary/10 text-primary"
                        : "text-gray-700 hover:bg-primary/5 hover:text-primary"
                    }`}
                  >
                    {item.name === "About Us"
                      ? "About"
                      : item.name === "Our Team"
                        ? "Team"
                        : item.name}
                  </Link>
                ),
              )}
            </div>
          </div>

          <div className="hidden xl:flex items-center gap-2">
            <Button
              asChild
              variant="outline"
              className="h-10 whitespace-nowrap border-primary/60 text-primary hover:bg-primary hover:text-primary-foreground"
            >
              <a
                href="https://swipesimple.com/links/lnk_67505de480da165de07d5bd3f42fbcce"
                target="_blank"
                rel="noopener noreferrer"
                onClick={() => trackPayBillClick("header_desktop")}
              >
                <MinimalGlyph name="credit-card" className="mr-2 h-4 w-4" />
                Pay Bill
              </a>
            </Button>
            <Button asChild className="h-10 whitespace-nowrap bg-primary text-primary-foreground hover:bg-primary/90">
              <Link href={APPOINTMENT_FORM_URL} onClick={() => handleAppointmentClick("header_desktop")}>
                Book Appointment
              </Link>
            </Button>
          </div>

          {/* Compact / Mobile Actions */}
          <div className="xl:hidden flex items-center gap-2">
            <Button
              asChild
              variant="outline"
              className="hidden sm:inline-flex h-9 whitespace-nowrap border-primary/60 text-primary hover:bg-primary hover:text-primary-foreground"
            >
              <a
                href="https://swipesimple.com/links/lnk_67505de480da165de07d5bd3f42fbcce"
                target="_blank"
                rel="noopener noreferrer"
                onClick={() => trackPayBillClick("header_compact")}
              >
                <MinimalGlyph name="credit-card" className="mr-2 h-4 w-4" />
                Pay Bill
              </a>
            </Button>
            <Button asChild className="hidden sm:inline-flex h-9 whitespace-nowrap bg-primary text-primary-foreground hover:bg-primary/90">
              <Link href={APPOINTMENT_FORM_URL} onClick={() => handleAppointmentClick("header_compact")}>
                Book
              </Link>
            </Button>
            <Sheet open={isOpen} onOpenChange={setIsOpen}>
              <SheetTrigger asChild>
                <Button variant="ghost" size="icon" aria-label="Toggle mobile menu" className="shrink-0">
                  <MinimalGlyph name="menu" className="h-6 w-6" />
                </Button>
              </SheetTrigger>
              <SheetContent side="right" className="w-[300px] sm:w-[400px]">
                <nav className="mt-8 flex flex-col space-y-4">
                  {navigation.filter((item) => !item.dropdown).map((item) => (
                    <Link
                      key={item.name}
                      href={item.href}
                      aria-current={isItemActive(item.href) ? "page" : undefined}
                      className={`nav-link text-lg ${
                        isItemActive(item.href)
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
                        onClick={() => {
                          trackServiceLearnMoreClick("all-services", "mobile_menu");
                          setIsOpen(false);
                        }}
                      >
                        View all services
                      </Link>
                      {serviceMenuItems.map((service) => (
                        <Link
                          key={service.href}
                          href={service.href}
                          className="text-gray-800 font-semibold hover:text-primary"
                          onClick={() => {
                            trackServiceLearnMoreClick(service.id, "mobile_menu");
                            setIsOpen(false);
                          }}
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
                          onClick={() => {
                            trackServiceLearnMoreClick("itero-digital-scanner", "mobile_menu");
                            setIsOpen(false);
                          }}
                        >
                          iTero Digital Scanner
                        </Link>
                      </div>
                    </div>
                  </div>
                  <Button asChild variant="outline" className="w-full border-primary text-primary hover:bg-primary hover:text-primary-foreground">
                    <a
                      href="https://swipesimple.com/links/lnk_67505de480da165de07d5bd3f42fbcce"
                      target="_blank"
                      rel="noopener noreferrer"
                      onClick={() => {
                        trackPayBillClick("mobile_menu");
                        setIsOpen(false);
                      }}
                    >
                      <MinimalGlyph name="credit-card" className="h-4 w-4 mr-2" />
                      Pay Bill Online
                    </a>
                  </Button>
                  <Button asChild className="w-full bg-primary text-primary-foreground hover:bg-primary/90">
                    <Link
                      href={APPOINTMENT_FORM_URL}
                      onClick={() => {
                        setIsOpen(false);
                        handleAppointmentClick("mobile_menu");
                      }}
                    >
                      Book Appointment
                    </Link>
                  </Button>
                </nav>
              </SheetContent>
            </Sheet>
          </div>
        </div>
      </div>
      <div
        aria-hidden="true"
        className="pointer-events-none absolute inset-x-0 bottom-0 h-px bg-border"
      />
    </nav>
  );
}
