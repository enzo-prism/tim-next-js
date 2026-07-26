"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useMutation } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
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
import HeroBackdrop from "@/components/brand/HeroBackdrop";
import PageBreadcrumbs from "@/components/navigation/PageBreadcrumbs";

type ContactResponse = {
  success: boolean;
  created: boolean;
  delivered: boolean;
  leadId: string;
  serviceId: string | null;
  fallbackMessage?: string;
  message?: string;
  errors?: Array<{ path: Array<string | number>; message: string }>;
};

export default function Contact() {
  const [hasStartedForm, setHasStartedForm] = useState(false);
  const [submission, setSubmission] = useState<{ delivered: boolean; fallbackMessage?: string } | null>(null);
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
        };
        error.details = payload || undefined;
        throw error;
      }
      return payload;
    },
    onSuccess: (data, variables) => {
      setSubmission({ delivered: data.delivered, fallbackMessage: data.fallbackMessage });
      if (data.delivered) {
        trackContactSubmitSuccess(variables.service || undefined);
      }
      if (data.delivered) {
        toast.success("Message received", {
          description: "Thank you. Our team will get back to you soon.",
        });
      } else {
        toast("Message saved with backup notice", {
          description: data.fallbackMessage,
        });
      }
      if (data.delivered) {
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
    onError: (error: Error & { details?: ContactResponse }) => {
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
        description: error.message || "Please try again later.",
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
    <div className="pt-16 pb-20 bg-white">
      {/* Hero Section */}
      <section className="relative overflow-hidden py-20 lg:py-32">
        <HeroBackdrop variant="default" />
        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center">
            <h1 className="text-4xl lg:text-5xl font-bold text-gray-800 mb-6">Contact Us</h1>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto">Request an appointment, call our Los Gatos office, or send a general question.</p>
            <div className="mt-7 flex flex-col justify-center gap-3 sm:flex-row">
              <Button asChild>
                <Link href="/book-appointment?source=contact_hero" onClick={() => trackAppointmentCtaClick("contact_hero")}>
                  Request an Appointment
                </Link>
              </Button>
              <Button asChild variant="outline">
                <a href="tel:+14083588100" onClick={() => trackPhoneClick("contact_hero")}>
                  Call (408) 358-8100
                </a>
              </Button>
            </div>
          </div>
        </div>
      </section>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20">
        <PageBreadcrumbs items={[{ label: "Home", href: "/" }, { label: "Contact" }]} />
        
        <div className="grid lg:grid-cols-2 gap-12">
          {/* Contact Information */}
          <div>
            <div className="rounded-xl border border-border bg-card p-8 mb-8">
              <h2 className="text-2xl font-bold text-gray-800 mb-6">Get in Touch</h2>
              <div className="space-y-6">
                <div className="flex items-start">
                  <div>
                    <h3 className="font-semibold text-gray-800 mb-1">Our Location</h3>
                    <p className="text-gray-600">
                      <PracticeAddressLink className="text-inherit hover:text-primary" trackingLocation="contact_info">
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
                      className="text-sm font-semibold text-primary hover:text-primary transition-colors inline-block mt-2"
                      onClick={() => trackMapClick("contact_info")}
                    >
                      Open in Google Maps
                    </a>
                    <p className="mt-3 text-sm text-gray-600">
                      We serve families from Santa Cruz who want a gentle family dentist and are
                      comfortable making the easy trip over Highway 17 to Los Gatos.
                    </p>
                    <Link
                      href="/areas-we-serve/santa-cruz"
                      className="text-sm font-semibold text-primary hover:text-primary transition-colors inline-block mt-2"
                    >
                      See Santa Cruz visit info
                    </Link>
                  </div>
                </div>
                
                <div className="flex items-start">
                  <div>
                    <h3 className="font-semibold text-gray-800 mb-1">Phone Number</h3>
                    <a
                      href="tel:+14083588100"
                      className="font-semibold text-primary hover:underline"
                      onClick={() => trackPhoneClick("contact_info")}
                    >
                      (408) 358-8100
                    </a>
                  </div>
                </div>
                
                <div className="flex items-start">
                  <div>
                    <h3 className="font-semibold text-gray-800 mb-1">Email Address</h3>
                    <a href="mailto:hello@famfirstsmile.com" className="font-semibold text-primary hover:underline">
                      hello@famfirstsmile.com
                    </a>
                  </div>
                </div>
                
                <div className="flex items-start">
                  <div>
                    <h3 className="font-semibold text-gray-800 mb-1">Office Hours</h3>
                    <div className="text-gray-600">
                      <p>Monday - Thursday: 9:00 AM - 5:00 PM</p>
                      <p>Friday: Closed</p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
            
            {/* Social Links */}
            <div className="text-center">
              <h3 className="text-lg font-semibold text-gray-800 mb-4">Connect With Us</h3>
              <div className="flex justify-center gap-3">
                <a 
                  href="https://www.facebook.com/famfirstsmile/" 
                  target="_blank" 
                  rel="noopener noreferrer"
                  className="inline-flex rounded-lg border border-border px-4 py-2 text-sm font-semibold text-primary transition-colors hover:bg-primary hover:text-primary-foreground" 
                  aria-label="Visit our Facebook page"
                  onClick={() => trackSocialClick("facebook", "contact_page")}
                >
                  Facebook
                </a>
                <a 
                  href="https://www.instagram.com/famfirstsmile/" 
                  target="_blank" 
                  rel="noopener noreferrer"
                  className="inline-flex rounded-lg border border-border px-4 py-2 text-sm font-semibold text-primary transition-colors hover:bg-primary hover:text-primary-foreground" 
                  aria-label="Visit our Instagram page"
                  onClick={() => trackSocialClick("instagram", "contact_page")}
                >
                  Instagram
                </a>
              </div>
            </div>

            <div className="mt-10 rounded-xl border border-border bg-muted/40 p-6">
              <h3 className="text-lg font-semibold text-gray-800 mb-4">Explore</h3>
              <div className="grid grid-cols-2 gap-3 text-sm">
                <Link href="/services" className="text-primary font-semibold hover:text-primary transition-colors">
                  Services
                </Link>
                <Link href="/patient-info" className="text-primary font-semibold hover:text-primary transition-colors">
                  Patient Info
                </Link>
                <Link href="/services/invisalign" className="text-primary font-semibold hover:text-primary transition-colors">
                  Invisalign
                </Link>
                <Link href="/tmj" className="text-primary font-semibold hover:text-primary transition-colors">
                  TMJ Treatment
                </Link>
                <Link href="/technology/itero-digital-scanner" className="text-primary font-semibold hover:text-primary transition-colors">
                  iTero Scanner
                </Link>
                <Link href="/team" className="text-primary font-semibold hover:text-primary transition-colors">
                  Our Team
                </Link>
              </div>
            </div>
          </div>
          
          {/* Contact Form */}
          <div>
            <div className="bg-gray-50 rounded-xl p-8">
              <h2 className="text-2xl font-bold text-gray-800 mb-6">Send Us a Message</h2>
              {submission ? (
                <div
                  ref={submissionStatusRef}
                  role="status"
                  aria-live="polite"
                  tabIndex={-1}
                  className="mb-6 rounded-lg border border-sky-200 bg-sky-50 p-4 text-sm text-sky-900 outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
                >
                  <p className="font-semibold">Your message was saved.</p>
                  <p className="mt-1">
                    {submission.delivered
                      ? "Thank you. Our team will get back to you soon."
                      : submission.fallbackMessage}
                  </p>
                  {!submission.delivered ? (
                    <p className="mt-2 font-medium">
                      Your details are still here. Press Send Message again to retry delivery.
                    </p>
                  ) : null}
                </div>
              ) : null}
              <Form {...form}>
                <form
                  onSubmit={form.handleSubmit(onSubmit, onInvalidSubmit)}
                  onFocusCapture={handleFormStart}
                  className="space-y-4"
                >
                  <input
                    type="text"
                    {...form.register("company")}
                    tabIndex={-1}
                    autoComplete="off"
                    aria-hidden="true"
                    className="hidden"
                  />
                  <div className="grid md:grid-cols-2 gap-4">
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
                        <FormLabel>Phone Number</FormLabel>
                        <FormControl>
                          <Input type="tel" inputMode="tel" autoComplete="tel" {...field} value={field.value ?? ""} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  
                  <FormField
                    control={form.control}
                    name="service"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Service Interested In</FormLabel>
                        <Select
                          onValueChange={field.onChange}
                          value={(field.value || undefined) as string | undefined}
                        >
                          <FormControl>
                            <SelectTrigger>
                              <SelectValue placeholder="Select a service" />
                            </SelectTrigger>
                          </FormControl>
                          <SelectContent>
                            {serviceOptions.map((service) => (
                              <SelectItem key={service.id} value={service.id}>
                                {service.title}
                              </SelectItem>
                            ))}
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
                        <FormLabel>Message</FormLabel>
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
                      <FormItem className="rounded-lg border border-border bg-background p-4">
                        <div className="flex items-start gap-3">
                          <FormControl>
                            <Checkbox
                              checked={field.value}
                              onCheckedChange={(checked) => field.onChange(checked === true)}
                              aria-required="true"
                            />
                          </FormControl>
                          <div>
                            <FormLabel className="leading-relaxed">
                              I agree that Family First Smile Care may contact me about this message. *
                            </FormLabel>
                            <p className="mt-1 text-sm text-muted-foreground">
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
                    className="w-full bg-primary text-primary-foreground hover:bg-primary/90 font-semibold py-3"
                    disabled={contactMutation.isPending}
                  >
                    {contactMutation.isPending ? "Sending..." : "Send Message"}
                  </Button>
                </form>
              </Form>
            </div>
          </div>
        </div>
        
        {/* Map Section */}
        <div className="mt-16">
          <div className="mb-6 rounded-xl border border-primary/15 bg-primary/5 p-5 text-center">
            <h2 className="text-2xl font-bold text-gray-800">Easy to reach from Santa Cruz</h2>
            <p className="mt-2 text-gray-600">
              Our office is just off Highway 17 in Los Gatos, which makes visits simple for many
              Santa Cruz patients who want family-focused care.
            </p>
          </div>
          <h2 className="text-2xl font-bold text-gray-800 mb-8 text-center">Find Us</h2>
          <div className="bg-white rounded-xl overflow-hidden border border-border shadow-sm">
            <div className="bg-primary p-6">
              <div className="flex flex-col md:flex-row items-center justify-between gap-4">
                <div className="text-white text-center md:text-left">
                  <h3 className="font-semibold text-lg mb-1">Family First Smile Care</h3>
                  <PracticeAddressLink className="text-white hover:text-white/85" trackingLocation="contact_map_bar">
                    {practiceInfo.addressText}
                  </PracticeAddressLink>
                  <p className="mt-1 text-sm text-white/85">
                    Convenient for Los Gatos and Santa Cruz families coming over Highway 17.
                  </p>
                </div>
                <div className="flex gap-3">
                  <a 
                    href={practiceInfo.mapUrl}
                    target="_blank" 
                    rel="noopener noreferrer"
                    className="bg-white text-primary px-6 py-2 rounded-lg hover:bg-gray-100 transition-colors font-semibold flex items-center gap-2"
                    onClick={() => trackMapClick("contact_map_bar")}
                  >
                    Open in Google Maps
                  </a>
                  <a 
                    href="tel:4083588100"
                    className="bg-white/5 text-white px-6 py-2 rounded-lg hover:bg-white hover:text-primary transition-colors font-semibold flex items-center gap-2 border border-white/25"
                    onClick={() => trackPhoneClick("contact_map_bar")}
                  >
                    Call Now
                  </a>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
