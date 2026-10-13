"use client";

import { useState, type CSSProperties } from "react";
import { Link, useLocation } from "wouter";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet";
import { MinimalGlyph } from "@/components/ui/minimal-glyph";
import { Pinwheel } from "@/components/brand/pinwheel";
import { services } from "@/data/services";
import {
  buildAppointmentUrl,
  trackAppointmentCtaClick,
  trackPayBillClick,
  trackServiceLearnMoreClick,
} from "@/lib/analytics";
import { getServiceHref } from "@/lib/routes";
import { PhoneLink } from "@/components/tracking/tracked-links";
import { practiceHoursSummary, practicePhone } from "@/content/practice-hours";

const PAY_BILL_URL = "https://swipesimple.com/links/lnk_67505de480da165de07d5bd3f42fbcce";

const navigation: Array<{ name: string; label: string; href: string; dropdown?: boolean }> = [
  { name: "Home", label: "Home", href: "/" },
  { name: "About Us", label: "About", href: "/about" },
  { name: "Services", label: "Services", href: "/services", dropdown: true },
  { name: "Our Team", label: "Team", href: "/team" },
  { name: "New Patients", label: "New Patients", href: "/new-patients" },
  { name: "Blog", label: "Blog", href: "/blog" },
  { name: "Contact", label: "Contact", href: "/contact" },
];

const serviceMenuItems = services.flatMap((service) => [
  { id: service.id, title: service.title, description: service.description, href: getServiceHref(service.id) },
  ...(service.subServices?.map((subService) => ({
    id: subService.id,
    title: subService.title,
    description: subService.description,
    href: getServiceHref(subService.id),
  })) ?? []),
]);

const desktopLinkClass =
  "relative inline-flex h-10 items-center rounded-full px-3.5 text-sm font-semibold whitespace-nowrap transition-colors duration-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 forced-colors:focus-visible:outline-2 forced-colors:focus-visible:outline-offset-2 forced-colors:focus-visible:outline-[CanvasText]";

const mobileMenuLinkClass =
  "flex min-h-11 items-center rounded-xl px-3 py-2 text-base font-semibold text-ink transition-colors hover:bg-periwinkle-wash hover:text-cobalt-deep focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 forced-colors:focus-visible:outline-2 forced-colors:focus-visible:outline-offset-2 forced-colors:focus-visible:outline-[CanvasText]";

function Wordmark({ compact = false }: { compact?: boolean }) {
  return (
    <span className="min-w-0 leading-none">
      <span className={`block font-display font-semibold text-ink ${compact ? "text-[1.05rem]" : "text-[1.15rem] sm:text-xl"}`}>
        Family First
      </span>
      <span className="mt-1 block text-[0.62rem] font-bold uppercase tracking-[0.3em] text-ink-soft">Smile Care</span>
    </span>
  );
}

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
    <header className="sticky top-0 z-50 px-2 pt-2 sm:px-3 sm:pt-3">
      <nav
        className="ff-header-surface mx-auto flex h-16 w-full max-w-[1320px] items-center justify-between gap-3 rounded-full border pl-2.5 pr-2 backdrop-blur-md sm:pl-3"
        role="navigation"
        aria-label="Main navigation"
      >
        {/* Logo */}
        <Link href="/" className="group flex min-w-0 items-center gap-2.5 rounded-full pr-2 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring">
          <span className="grid size-11 shrink-0 place-items-center rounded-full bg-white ring-1 ring-ink/5">
            <Pinwheel hover className="size-9" />
          </span>
          <span className="sr-only">Family First Smile Care</span>
          <span aria-hidden="true">
            <Wordmark />
          </span>
        </Link>
        <span className="hidden whitespace-nowrap rounded-full bg-white/70 px-3 py-1 text-[0.7rem] font-bold uppercase tracking-[0.12em] text-ink-soft ring-1 ring-ink/5 2xl:inline-flex">
          Los Gatos Family Dentist
        </span>

        {/* Desktop Navigation */}
        <div className="hidden flex-1 items-center justify-center xl:flex">
          <div className="flex items-center gap-0.5">
            {navigation.map((item) =>
              item.dropdown ? (
                <DropdownMenu key={item.name}>
                  <DropdownMenuTrigger asChild>
                    <button
                      type="button"
                      aria-current={isServicesActive ? "page" : undefined}
                      className={`group ${desktopLinkClass} gap-1.5 ${
                        isServicesActive ? "bg-periwinkle-wash text-cobalt-deep" : "text-ink/80 hover:bg-ink/[0.04] hover:text-ink"
                      } data-[state=open]:bg-periwinkle-wash data-[state=open]:text-cobalt-deep`}
                    >
                      Services
                      <MinimalGlyph name="chevron-down" className="h-3.5 w-3.5 opacity-70 transition-transform duration-300 motion-reduce:transition-none group-data-[state=open]:rotate-180" />
                    </button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent
                    align="center"
                    sideOffset={14}
                    className="w-[44rem] max-w-[calc(100vw-2rem)] rounded-3xl border-border bg-popover p-3 text-popover-foreground shadow-lift"
                  >
                    <div className="grid grid-cols-[1fr_15rem] gap-3">
                      {/* The feature card comes first in the DOM so keyboard order ends on the last service. */}
                      <div className="relative col-start-2 row-start-1 flex flex-col justify-between overflow-hidden rounded-2xl bg-lime-wash p-5">
                        <Pinwheel className="pointer-events-none absolute -right-10 -top-10 size-40 opacity-90" />
                        <div className="relative mt-16">
                          <p className="font-display text-xl font-semibold leading-tight text-ink">Not sure what you need?</p>
                          <p className="mt-2 text-sm leading-relaxed text-ink-soft">Start with an exam and we’ll map out a plan together.</p>
                        </div>
                        <DropdownMenuItem asChild className="relative mt-4 cursor-pointer justify-center rounded-full bg-ink px-4 py-2.5 text-sm font-semibold text-white focus:bg-cobalt focus:text-white">
                          <Link
                            href="/services"
                            onClick={() => trackServiceLearnMoreClick("all-services", "header_services_menu")}
                          >
                            View all services
                          </Link>
                        </DropdownMenuItem>
                      </div>
                      <div className="col-start-1 row-start-1">
                        <DropdownMenuLabel className="px-3 pb-1 pt-2 text-[0.7rem] font-bold uppercase tracking-[0.14em] text-ink-soft">
                          Care for every age
                        </DropdownMenuLabel>
                        <div className="grid grid-cols-2 gap-0.5">
                          {serviceMenuItems.map((service) => (
                            <DropdownMenuItem
                              key={service.href}
                              asChild
                              className="cursor-pointer flex-col items-start gap-0.5 rounded-2xl px-3 py-2.5 focus:bg-periwinkle-wash"
                            >
                              <Link
                                href={service.href}
                                onClick={() => trackServiceLearnMoreClick(service.id, "header_services_menu")}
                              >
                                <span className="text-sm font-semibold text-ink">{service.title}</span>
                                <span className="text-xs leading-snug text-ink-soft">{service.description}</span>
                              </Link>
                            </DropdownMenuItem>
                          ))}
                          <DropdownMenuItem
                            asChild
                            className="cursor-pointer flex-col items-start gap-0.5 rounded-2xl px-3 py-2.5 focus:bg-periwinkle-wash"
                          >
                            <Link
                              href="/technology/itero-digital-scanner"
                              onClick={() => trackServiceLearnMoreClick("itero-digital-scanner", "header_services_menu")}
                            >
                              <span className="text-sm font-semibold text-ink">iTero Digital Scanner</span>
                              <span className="text-xs leading-snug text-ink-soft">Digital impressions, no trays</span>
                            </Link>
                          </DropdownMenuItem>
                        </div>
                      </div>
                    </div>
                  </DropdownMenuContent>
                </DropdownMenu>
              ) : (
                <Link
                  key={item.name}
                  href={item.href}
                  aria-current={isItemActive(item.href) ? "page" : undefined}
                  className={`${desktopLinkClass} ${
                    isItemActive(item.href) ? "bg-periwinkle-wash text-cobalt-deep" : "text-ink/80 hover:bg-ink/[0.04] hover:text-ink"
                  }`}
                >
                  {item.label}
                </Link>
              ),
            )}
          </div>
        </div>

        <div className="hidden items-center gap-1.5 xl:flex">
          <Button asChild variant="ghost" className="h-11 whitespace-nowrap px-4 text-ink/80 hover:bg-ink/[0.04] hover:text-ink">
            <a href={PAY_BILL_URL} target="_blank" rel="noopener noreferrer" onClick={() => trackPayBillClick("header_desktop")}>
              Pay Bill
              <span className="sr-only"> (opens in a new tab)</span>
            </a>
          </Button>
          <Button asChild className="group h-12 whitespace-nowrap pl-5 pr-4 text-[0.95rem]">
            <Link href={buildAppointmentUrl({ source: "header_desktop" })} onClick={() => handleAppointmentClick("header_desktop")}>
              Request Appointment
              <span aria-hidden="true" className="ff-arrow grid size-7 place-items-center rounded-full bg-white/15">
                <MinimalGlyph name="arrow-right" className="text-sm" />
              </span>
            </Link>
          </Button>
        </div>

        {/* Compact / Mobile Actions */}
        <div className="flex items-center gap-1.5 xl:hidden">
          <Button asChild variant="ghost" className="hidden h-10 whitespace-nowrap px-4 text-ink/80 sm:inline-flex">
            <a href={PAY_BILL_URL} target="_blank" rel="noopener noreferrer" onClick={() => trackPayBillClick("header_compact")}>
              Pay Bill
              <span className="sr-only"> (opens in a new tab)</span>
            </a>
          </Button>
          <Button asChild className="inline-flex h-11 whitespace-nowrap px-4">
            <Link href={buildAppointmentUrl({ source: "header_compact" })} onClick={() => handleAppointmentClick("header_compact")}>
              Request visit
            </Link>
          </Button>
          <Sheet open={isOpen} onOpenChange={setIsOpen}>
            <SheetTrigger asChild>
              <Button variant="ghost" size="icon" aria-label="Toggle mobile menu" className="shrink-0 bg-white ring-1 ring-ink/10 hover:bg-white">
                <MinimalGlyph name="menu" className="h-6 w-6" />
              </Button>
            </SheetTrigger>
            <SheetContent
              side="right"
              className="flex h-dvh w-full flex-col gap-0 overflow-hidden border-l-0 bg-paper pb-0 pt-[max(1.25rem,env(safe-area-inset-top))] sm:w-[420px] sm:max-w-[420px] [&>button]:right-[max(1rem,env(safe-area-inset-right))] [&>button]:top-[max(1.25rem,env(safe-area-inset-top))] [&>button]:grid [&>button]:size-11 [&>button]:place-items-center [&>button]:rounded-full [&>button]:bg-white [&>button]:opacity-100 [&>button]:ring-1 [&>button]:ring-ink/10"
            >
              <SheetHeader className="shrink-0 text-left">
                <div className="flex items-center gap-2.5" aria-hidden="true">
                  <Pinwheel gather="load" className="size-10" />
                  <Wordmark compact />
                </div>
                <SheetTitle className="sr-only">Family First Smile Care menu</SheetTitle>
                <SheetDescription className="sr-only">Navigate the site or request an appointment.</SheetDescription>
              </SheetHeader>
              <nav
                aria-label="Mobile navigation"
                className="mt-6 min-h-0 flex-1 touch-pan-y space-y-5 overflow-y-auto overscroll-y-contain pb-[max(1.5rem,env(safe-area-inset-bottom))] [-webkit-overflow-scrolling:touch]"
              >
                <ul className="space-y-0.5">
                  {navigation
                    .filter((item) => !item.dropdown)
                    .map((item, index) => (
                      <li key={item.name} className="ff-intro" style={{ "--d": 60 + index * 45, "--ff-rise": "1rem" } as CSSProperties}>
                        <Link
                          href={item.href}
                          aria-current={isItemActive(item.href) ? "page" : undefined}
                          className={`flex min-h-12 items-center justify-between rounded-2xl px-3 font-display text-[1.65rem] font-semibold leading-tight transition-colors hover:bg-periwinkle-wash focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring ${
                            isItemActive(item.href) ? "text-cobalt" : "text-ink"
                          }`}
                          onClick={() => setIsOpen(false)}
                        >
                          {item.name}
                          {isItemActive(item.href) ? <span aria-hidden="true" className="size-2 rounded-full bg-lime ring-2 ring-ink/10" /> : null}
                        </Link>
                      </li>
                    ))}
                </ul>
                <div className="ff-intro grid gap-2" style={{ "--d": 360 } as CSSProperties}>
                  <Button asChild size="lg" className="w-full">
                    <Link
                      href={buildAppointmentUrl({ source: "header_mobile" })}
                      onClick={() => {
                        setIsOpen(false);
                        handleAppointmentClick("mobile_menu_top");
                      }}
                    >
                      Request Appointment
                    </Link>
                  </Button>
                  <Button asChild size="lg" variant="outline" className="w-full">
                    <PhoneLink location="mobile_menu" onClick={() => setIsOpen(false)}>
                      Call {practicePhone.display}
                    </PhoneLink>
                  </Button>
                  <p className="text-center text-xs font-medium text-ink-soft">{practiceHoursSummary}</p>
                </div>
                <div className="ff-intro rounded-3xl bg-white p-3 ring-1 ring-border" style={{ "--d": 420 } as CSSProperties}>
                  <p className="px-3 pb-1 pt-2 text-[0.7rem] font-bold uppercase tracking-[0.14em] text-ink-soft">Services</p>
                  <div className="flex flex-col">
                    <Link
                      href="/services"
                      className={mobileMenuLinkClass}
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
                        className={mobileMenuLinkClass}
                        onClick={() => {
                          trackServiceLearnMoreClick(service.id, "mobile_menu");
                          setIsOpen(false);
                        }}
                      >
                        {service.title}
                      </Link>
                    ))}
                  </div>
                  <p className="mt-3 border-t border-border px-3 pb-1 pt-4 text-[0.7rem] font-bold uppercase tracking-[0.14em] text-ink-soft">Technology</p>
                  <Link
                    href="/technology/itero-digital-scanner"
                    className={mobileMenuLinkClass}
                    onClick={() => {
                      trackServiceLearnMoreClick("itero-digital-scanner", "mobile_menu");
                      setIsOpen(false);
                    }}
                  >
                    iTero Digital Scanner
                  </Link>
                </div>
                <Button asChild variant="outline" className="ff-intro w-full" style={{ "--d": 480 } as CSSProperties}>
                  <a
                    href={PAY_BILL_URL}
                    target="_blank"
                    rel="noopener noreferrer"
                    onClick={() => {
                      trackPayBillClick("mobile_menu");
                      setIsOpen(false);
                    }}
                  >
                    Pay Bill Online
                  </a>
                </Button>
              </nav>
            </SheetContent>
          </Sheet>
        </div>
      </nav>
    </header>
  );
}
