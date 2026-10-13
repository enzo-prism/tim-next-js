"use client";

import { useEffect, useMemo, useRef, useState, type CSSProperties } from "react";
import Image from "next/image";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useMutation } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { MinimalGlyph } from "@/components/ui/minimal-glyph";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Checkbox } from "@/components/ui/checkbox";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

import { Link } from "wouter";
import { toast } from "sonner";
import PracticeAddressLink from "@/components/location/PracticeAddressLink";
import { practiceInfo } from "@/content/structured-data";
import {
  contactFormSchema,
  LEAD_CONSENT_VERSION,
  type ContactFormValues,
} from "@/content/form-schemas";
import { services } from "@/content/services";
import { practiceHoursSummary } from "@/content/practice-hours";
import {
  trackContactSubmitSuccess,
  trackAppointmentCtaClick,
  trackFormStart,
  trackFormSubmitAttempt,
  trackFormSubmitError,
  trackMapClick,
  trackPhoneClick,
  trackSocialClick,
} from "@/lib/analytics";
import { captureLeadAttribution, createSubmissionId } from "@/lib/lead-attribution";
import { Pinwheel, ToothPerson } from "@/components/brand/pinwheel";
import { PageHero } from "@/components/site/page-hero";
import { Eyebrow, Section, SectionHeader } from "@/components/site/section";
import { CtaBand } from "@/components/site/cta-band";
import { PracticeStatusPill } from "@/components/forms/practice-status-pill";
import storefrontPhoto from "@assets/Office Photo 11_1753972057108.jpg";

const cardLabelClass = "relative text-xs font-bold uppercase tracking-[0.14em] text-cobalt-deep";
const socialLinkClass =
  "inline-flex min-h-11 items-center rounded-full border border-ink/15 bg-white px-5 text-sm font-semibold text-ink transition-colors hover:border-cobalt hover:text-cobalt";
const exploreLinks = [
  { href: "/services", label: "Services" },
  { href: "/patient-info", label: "Patient Info" },
  { href: "/services/invisalign", label: "Invisalign" },
  { href: "/tmj", label: "TMJ Treatment" },
  { href: "/technology/itero-digital-scanner", label: "iTero Scanner" },
  { href: "/team", label: "Our Team" },
];

type ContactResponse = {
  success: boolean;
  created: boolean;
  delivered: boolean;
  queued?: boolean;
  leadId: string;
  serviceId: string | null;
  fallbackMessage?: string;
  message?: string;
  errors?: Array<{ path: Array<string | number>; message: string }>;
};

export default function Contact() {
  const [hasStartedForm, setHasStartedForm] = useState(false);
  const [submission, setSubmission] = useState<{ delivered: boolean; queued?: boolean; fallbackMessage?: string } | null>(null);
  const submissionIdRef = useRef<string | null>(null);
  const submissionStatusRef = useRef<HTMLDivElement>(null);
  const serviceOptions = useMemo(
    () => services.flatMap((service) => [service, ...(service.subServices ?? [])]),
    [],
  );

  const form = useForm<ContactFormValues>({
    resolver: zodResolver(contactFormSchema),
    defaultValues: {
      company: "",
      firstName: "",
      lastName: "",
      email: "",
      phone: "",
      service: "",
      message: "",
      consentToContact: false,
    },
  });

  const contactMutation = useMutation({
    mutationFn: async (values: ContactFormValues) => {
      submissionIdRef.current ||= createSubmissionId();
      const response = await fetch("/api/contacts", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({
          ...values,
          submissionId: submissionIdRef.current,
          consentVersion: LEAD_CONSENT_VERSION,
          ...captureLeadAttribution(),
        }),
      });
      const payload = (await response.json().catch(() => null)) as ContactResponse | null;
      if (!response.ok || !payload?.success) {
        const error = new Error(payload?.message || "Unable to send your message.") as Error & {
          details?: ContactResponse;
          status?: number;
        };
        error.details = payload || undefined;
        error.status = response.status;
        throw error;
      }
      return payload;
    },
    onSuccess: (data, variables) => {
      setSubmission({ delivered: data.delivered, queued: data.queued, fallbackMessage: data.fallbackMessage });
      if (data.created) {
        trackContactSubmitSuccess(variables.service || undefined);
      }
      if (data.delivered || data.queued) {
        toast.success("Message received", {
          description: "Thank you. Our team will get back to you soon.",
        });
      } else {
        toast("Message saved with backup notice", {
          description: data.fallbackMessage,
        });
      }
      if (data.delivered || data.queued) {
        form.reset({
          company: "",
          firstName: "",
          lastName: "",
          email: "",
          phone: "",
          service: "",
          message: "",
          consentToContact: false,
        });
        submissionIdRef.current = null;
      }
    },
    onError: (error: Error & { details?: ContactResponse; status?: number }) => {
      // A 409 means this submission UUID is already bound to different stored
      // data, which happens when a patient edits their details and resubmits
      // after a delivery-fallback notice. Retire the UUID so the next attempt
      // is treated as a fresh lead instead of conflicting forever.
      const isSubmissionConflict = error.status === 409;
      if (isSubmissionConflict) {
        submissionIdRef.current = null;
      }
      const issues = error.details?.errors ?? [];
      trackFormSubmitError({
        errorType: issues.length ? "validation_error" : "request_error",
        formType: "contact",
        location: "contact_page",
        serviceId: form.getValues("service") || undefined,
      });
      for (const issue of issues) {
        const path = issue.path?.[0];
        if (typeof path === "string") {
          form.setError(path as keyof ContactFormValues, { type: "server", message: issue.message });
        }
      }
      toast.error("Error sending message", {
        description: isSubmissionConflict
          ? "Your details changed since the last attempt. Press Send Message once more to submit them."
          : error.message || "Please try again later.",
      });
    },
  });

  useEffect(() => {
    if (submission) {
      submissionStatusRef.current?.focus();
    }
  }, [submission]);

  const onSubmit = (values: ContactFormValues) => {
    setSubmission(null);
    trackFormSubmitAttempt({
      formType: "contact",
      location: "contact_page",
      serviceId: values.service || undefined,
    });
    contactMutation.mutate(values);
  };

  const onInvalidSubmit = () => {
    trackFormSubmitError({
      errorType: "validation_error",
      formType: "contact",
      location: "contact_page",
      serviceId: form.getValues("service") || undefined,
    });
  };

  const handleFormStart = () => {
    if (hasStartedForm) return;
    setHasStartedForm(true);
    trackFormStart({
      formType: "contact",
      location: "contact_page",
      serviceId: form.getValues("service") || undefined,
    });
  };

  return (
    <div>
      <PageHero
        id="contact-heading"
        tone="blush"
        breadcrumbs={[{ label: "Home", href: "/" }, { label: "Contact" }]}
        eyebrow="Contact"
        titleText="Contact our Los Gatos team"
        lead="Request an appointment, call the office, or send a general question. We’re happy to help you find the right next step."
        actions={
          <>
            <Button asChild size="lg" className="group h-14 pl-7 pr-5 text-base">
              <Link href="/book-appointment?source=contact_hero" onClick={() => trackAppointmentCtaClick("contact_hero")}>
                Request an Appointment
                <span aria-hidden="true" className="ff-arrow grid size-8 place-items-center rounded-full bg-white/15">
                  <MinimalGlyph name="arrow-right" />
                </span>
              </Link>
            </Button>
            <Button asChild size="lg" variant="outline" className="h-14 px-7 text-base">
              <a href="tel:+14083588100" onClick={() => trackPhoneClick("contact_hero")}>
                Call (408) 358-8100
              </a>
            </Button>
          </>
        }
        meta={<PracticeStatusPill />}
        media={
          <figure className="relative mx-auto w-full max-w-[17.5rem] sm:max-w-sm lg:max-w-[26rem]">
            <div aria-hidden="true" className="pointer-events-none absolute -right-12 -top-12 size-40 sm:-right-16 sm:size-52 lg:-right-20 lg:-top-16 lg:size-64">
              <Pinwheel gather="load" spin="page" delay={240} className="size-full" />
            </div>
            <div className="ff-arch relative aspect-[4/5] bg-blush ring-8 ring-white">
              <Image
                src={storefrontPhoto}
                alt="The Family First Smile Care storefront at Suite 102 in Los Gatos"
                fill
                priority
                sizes="(max-width: 639px) 280px, (max-width: 1023px) 384px, 416px"
                className="object-cover object-[50%_40%]"
              />
            </div>
            <span className="ff-chip ff-intro-pop absolute -left-4 top-[20%] sm:-left-10" style={{ "--d": 760 } as CSSProperties}>
              <span aria-hidden="true" className="size-2.5 rounded-full bg-lime ring-2 ring-ink/10" />
              Suite 102
            </span>
            <span className="ff-chip ff-intro-pop absolute -right-3 bottom-[16%] sm:-right-8" style={{ "--d": 880 } as CSSProperties}>
              <span aria-hidden="true" className="size-2.5 rounded-full bg-periwinkle ring-2 ring-ink/10" />
              Just off Highway 17
            </span>
          </figure>
        }
      />

      <Section labelledBy="contact-details-heading">
        <div className="grid gap-14 lg:grid-cols-[minmax(0,0.9fr)_minmax(0,1.1fr)] lg:gap-16">
          {/* Contact details */}
          <div>
            <SectionHeader
              id="contact-details-heading"
              eyebrow="Reach us"
              title={
                <>
                  Get in <em className="ff-italic font-normal">touch</em>
                </>
              }
              lead="Call, email, or stop by. Everything you need to reach the office is right here."
            />

            <div className="mt-10 grid gap-4 sm:grid-cols-2">
              <div className="ff-reveal relative overflow-clip rounded-3xl bg-periwinkle-wash p-6" style={{ "--i": 0 } as CSSProperties}>
                <p className={cardLabelClass}>Call</p>
                <a
                  href="tel:+14083588100"
                  className="mt-2 inline-flex min-h-11 items-center font-display text-2xl font-semibold text-ink underline decoration-ink/20 decoration-2 underline-offset-[6px] transition-colors hover:decoration-cobalt"
                  onClick={() => trackPhoneClick("contact_info")}
                >
                  (408) 358-8100
                </a>
                <p className="mt-1 text-sm leading-relaxed text-ink-soft">The quickest way to reach us during office hours.</p>
              </div>

              <div className="ff-reveal rounded-3xl bg-cloud-wash p-6" style={{ "--i": 1 } as CSSProperties}>
                <p className={cardLabelClass}>Office hours</p>
                <dl className="mt-3 space-y-2 text-base">
                  <div className="flex items-baseline justify-between gap-4">
                    <dt className="text-ink-soft">Mon – Thu</dt>
                    <dd className="font-semibold text-ink">9 AM – 5 PM</dd>
                  </div>
                  <div className="flex items-baseline justify-between gap-4">
                    <dt className="text-ink-soft">Fri – Sun</dt>
                    <dd className="font-semibold text-ink">Closed</dd>
                  </div>
                </dl>
                <p className="mt-3 text-sm text-ink-soft">Pacific time</p>
              </div>

              <div className="ff-reveal relative overflow-clip rounded-3xl bg-lime-wash p-6 sm:col-span-2 sm:p-7" style={{ "--i": 2 } as CSSProperties}>
                <ToothPerson
                  color="var(--ff-lime)"
                  className="pointer-events-none absolute -bottom-8 -right-2 h-32 w-auto rotate-[-8deg]"
                />
                <p className={cardLabelClass}>Visit</p>
                <p className="relative mt-3 max-w-[22rem] text-lg font-semibold leading-snug text-ink">
                  <PracticeAddressLink className="text-inherit hover:text-cobalt" trackingLocation="contact_info">
                    <>
                      {practiceInfo.addressLines[0]}
                      <br />
                      {practiceInfo.addressLines[1]}
                    </>
                  </PracticeAddressLink>
                </p>
                <a
                  href={practiceInfo.mapUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="ff-link relative mt-3 inline-flex min-h-11 items-center gap-1.5 text-sm"
                  onClick={() => trackMapClick("contact_info")}
                >
                  Open in Google Maps
                  <MinimalGlyph name="arrow-up-right" />
                  <span className="sr-only"> (opens in a new tab)</span>
                </a>
              </div>

              <div className="ff-reveal flex flex-col gap-6 rounded-3xl bg-blush-wash p-6 sm:col-span-2 sm:flex-row sm:items-end sm:justify-between sm:p-7" style={{ "--i": 3 } as CSSProperties}>
                <div className="min-w-0">
                  <p className={cardLabelClass}>Email</p>
                  <a
                    href="mailto:hello@famfirstsmile.com"
                    className="mt-2 inline-flex min-h-11 items-center text-lg font-semibold text-ink underline decoration-ink/20 decoration-2 underline-offset-[6px] transition-colors hover:decoration-cobalt"
                  >
                    hello@famfirstsmile.com
                  </a>
                  <p className="mt-1 text-sm leading-relaxed text-ink-soft">For general questions. Please keep medical details for a call.</p>
                </div>
                <div className="shrink-0">
                  <p className={cardLabelClass}>Follow along</p>
                  <div className="mt-3 flex flex-wrap gap-2">
                    <a
                      href="https://www.facebook.com/famfirstsmile/"
                      target="_blank"
                      rel="noopener noreferrer"
                      className={socialLinkClass}
                      aria-label="Visit our Facebook page"
                      onClick={() => trackSocialClick("facebook", "contact_page")}
                    >
                      Facebook
                    </a>
                    <a
                      href="https://www.instagram.com/famfirstsmile/"
                      target="_blank"
                      rel="noopener noreferrer"
                      className={socialLinkClass}
                      aria-label="Visit our Instagram page"
                      onClick={() => trackSocialClick("instagram", "contact_page")}
                    >
                      Instagram
                    </a>
                  </div>
                </div>
              </div>
            </div>

            <div className="ff-reveal mt-10">
              <p className="text-sm font-semibold text-ink">While you’re here</p>
              <ul className="mt-3 flex flex-wrap gap-2">
                {exploreLinks.map((link) => (
                  <li key={link.href}>
                    <Link
                      href={link.href}
                      className="inline-flex min-h-11 items-center rounded-full bg-white px-4 text-sm font-semibold text-ink ring-1 ring-border transition-colors hover:text-cobalt hover:ring-cobalt/40"
                    >
                      {link.label}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          </div>

          {/* Message form */}
          <div className="relative rounded-3xl bg-white p-5 shadow-float ring-1 ring-ink/5 sm:p-8 lg:self-start lg:p-10">
            <Eyebrow>General questions</Eyebrow>
            <h2 className="mt-4 font-display text-3xl font-semibold leading-tight text-ink">Send us a message</h2>
            <p id="contact-form-help" className="mt-3 text-base leading-relaxed text-ink-soft">
              Fields marked * are required. For appointment requests, use our{" "}
              <Link href="/book-appointment?source=contact_form" className="ff-link">appointment form</Link>.
            </p>
            {submission ? (
              <div
                ref={submissionStatusRef}
                role="status"
                aria-live="polite"
                tabIndex={-1}
                className="mt-6 flex gap-4 rounded-2xl bg-lime-wash p-5 text-sm leading-relaxed text-ink outline-none ring-1 ring-ink/5 focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 motion-safe:animate-in motion-safe:fade-in-0 motion-safe:slide-in-from-top-2 motion-safe:duration-500"
              >
                <Pinwheel gather="load" delay={100} className="size-10 shrink-0 sm:size-12" />
                <div>
                  <p className="font-display text-lg font-semibold">Your message was saved.</p>
                  <p className="mt-1">
                    {submission.delivered || submission.queued
                      ? "Thank you. Our team will contact you during office hours."
                      : submission.fallbackMessage}
                  </p>
                  <p className="mt-2 text-ink-soft">Office hours: {practiceHoursSummary} (Pacific time). If you have not heard from us by the end of the next open office day, please call (408) 358-8100.</p>
                  {!submission.delivered && !submission.queued ? (
                    <p className="mt-2 font-semibold">
                      Your details are still here. Press Send Message again to retry delivery.
                    </p>
                  ) : null}
                </div>
              </div>
            ) : null}
            <Form {...form}>
              <form
                noValidate
                aria-describedby="contact-form-help"
                aria-busy={contactMutation.isPending}
                onSubmit={form.handleSubmit(onSubmit, onInvalidSubmit)}
                onFocusCapture={handleFormStart}
                className="mt-8 space-y-5"
              >
                <input
                  type="text"
                  {...form.register("company")}
                  tabIndex={-1}
                  autoComplete="off"
                  aria-hidden="true"
                  className="hidden"
                />
                <div className="grid gap-5 sm:grid-cols-2">
                  <FormField
                    control={form.control}
                    name="firstName"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>First Name *</FormLabel>
                        <FormControl>
                          <Input {...field} autoComplete="given-name" required aria-required="true" />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={form.control}
                    name="lastName"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Last Name *</FormLabel>
                        <FormControl>
                          <Input {...field} autoComplete="family-name" required aria-required="true" />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>

                <div className="grid gap-5 sm:grid-cols-2">
                  <FormField
                    control={form.control}
                    name="email"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Email Address *</FormLabel>
                        <FormControl>
                          <Input type="email" autoComplete="email" required aria-required="true" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="phone"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Phone Number<span className="font-normal text-ink-soft"> (optional)</span></FormLabel>
                        <FormControl>
                          <Input type="tel" inputMode="tel" autoComplete="tel" {...field} value={field.value ?? ""} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>

                <FormField
                  control={form.control}
                  name="service"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Service Interested In<span className="font-normal text-ink-soft"> (optional)</span></FormLabel>
                      <Select
                        name={field.name}
                        onValueChange={(value) => field.onChange(value === "no-preference" ? "" : value)}
                        value={field.value ?? ""}
                      >
                        <FormControl>
                          <SelectTrigger ref={field.ref} onBlur={field.onBlur}>
                            <SelectValue placeholder="No service preference" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          <SelectItem value="no-preference">No service preference</SelectItem>
                          {serviceOptions.map((service) => (
                            <SelectItem key={service.id} value={service.id}>
                              {service.title}
                            </SelectItem>
                          ))}
                          <SelectItem value="not-sure">Help me choose</SelectItem>
                          <SelectItem value="tooth-pain">Tooth pain or a dental concern</SelectItem>
                          <SelectItem value="other">Other</SelectItem>
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="message"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Message<span className="font-normal text-ink-soft"> (optional)</span></FormLabel>
                      <FormControl>
                        <Textarea
                          rows={4}
                          placeholder="Share a general question or scheduling detail."
                          {...field}
                          value={field.value ?? ""}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="consentToContact"
                  render={({ field }) => (
                    <FormItem className="rounded-2xl bg-cream/70 p-4 ring-1 ring-ink/5 sm:p-5">
                      <div className="flex items-start gap-3.5">
                        <FormControl>
                          <Checkbox
                            ref={field.ref}
                            name={field.name}
                            onBlur={field.onBlur}
                            checked={field.value}
                            onCheckedChange={(checked) => field.onChange(checked === true)}
                            aria-required="true"
                            className="mt-0.5"
                          />
                        </FormControl>
                        <div>
                          <FormLabel className="cursor-pointer text-base leading-relaxed">
                            I agree that Family First Smile Care may contact me about this message. *
                          </FormLabel>
                          <p className="mt-1 text-sm leading-relaxed text-ink-soft">
                            Please do not send private medical details through this form.
                          </p>
                        </div>
                      </div>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <Button
                  type="submit"
                  size="lg"
                  className="h-14 w-full text-base"
                  disabled={contactMutation.isPending}
                >
                  {contactMutation.isPending ? "Sending..." : "Send Message"}
                </Button>
              </form>
            </Form>
          </div>
        </div>
      </Section>

      <CtaBand
        id="find-us-heading"
        eyebrow="Find us"
        title={
          <>
            Easy to reach from <em className="ff-italic font-normal text-lime">Santa Cruz</em>
          </>
        }
        body={
          <>
            Our office is just off Highway 17 in Los Gatos, which makes visits simple for many Santa
            Cruz patients who want family-focused care.{" "}
            <Link
              href="/areas-we-serve/santa-cruz"
              className="font-semibold text-white underline decoration-white/40 decoration-2 underline-offset-4 transition-colors hover:decoration-lime"
            >
              See Santa Cruz visit info
            </Link>
          </>
        }
        actions={
          <>
            <Button asChild size="lg" variant="night" className="h-14 px-7 text-base">
              <a
                href={practiceInfo.mapUrl}
                target="_blank"
                rel="noopener noreferrer"
                onClick={() => trackMapClick("contact_map_bar")}
              >
                Open in Google Maps
                <MinimalGlyph name="arrow-up-right" />
                <span className="sr-only"> (opens in a new tab)</span>
              </a>
            </Button>
            <Button asChild size="lg" variant="night-outline" className="h-14 px-7 text-base">
              <a href="tel:+14083588100" onClick={() => trackPhoneClick("contact_map_bar")}>
                Call (408) 358-8100
              </a>
            </Button>
          </>
        }
        note={
          <PracticeAddressLink className="text-white/75 hover:text-white" trackingLocation="contact_map_bar">
            {practiceInfo.addressText}
          </PracticeAddressLink>
        }
      />
    </div>
  );
}
