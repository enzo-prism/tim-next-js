"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { useSearchParams } from "next/navigation";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useMutation } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Checkbox } from "@/components/ui/checkbox";
import { toast } from "sonner";
import { services } from "@/content/services";
import {
  appointmentFormSchema,
  leadServiceIds,
  LEAD_CONSENT_VERSION,
  type AppointmentFormValues,
} from "@/content/form-schemas";
import HeroBackdrop from "@/components/brand/HeroBackdrop";
import PageBreadcrumbs from "@/components/navigation/PageBreadcrumbs";
import {
  trackAppointmentSubmitFallback,
  trackAppointmentSubmitSuccess,
  trackFormStart,
  trackFormSubmitAttempt,
  trackFormSubmitError,
  trackPhoneClick,
} from "@/lib/analytics";
import { captureLeadAttribution, createSubmissionId } from "@/lib/lead-attribution";

const officePhone = "(408) 358-8100";
const officePhoneHref = "tel:+14083588100";

type AppointmentResponse = {
  success: boolean;
  created: boolean;
  delivered: boolean;
  leadId: string;
  serviceId: string | null;
  fallbackMessage?: string;
};

export default function BookAppointment() {
  const searchParams = useSearchParams();
  const submissionIdRef = useRef<string | null>(null);
  const [isFormReady, setIsFormReady] = useState(false);
  const [hasStartedForm, setHasStartedForm] = useState(false);
  const [submission, setSubmission] = useState<{
    delivered: boolean;
    fallbackMessage?: string;
  } | null>(null);

  useEffect(() => {
    setIsFormReady(true);
  }, []);

  const minDate = useMemo(() => {
    const now = new Date();
    const month = `${now.getMonth() + 1}`.padStart(2, "0");
    const day = `${now.getDate()}`.padStart(2, "0");
    return `${now.getFullYear()}-${month}-${day}`;
  }, []);

  const appointmentServiceOptions = useMemo(
    () =>
      services
        .flatMap((service) => [service, ...(service.subServices ?? [])])
        .filter((service) =>
          leadServiceIds.includes(service.id as (typeof leadServiceIds)[number]),
        )
        .map((service) => ({
          value: service.id as (typeof leadServiceIds)[number],
          label: service.title,
        })),
    [],
  );

  const form = useForm<AppointmentFormValues>({
    resolver: zodResolver(appointmentFormSchema),
    defaultValues: {
      company: "",
      firstName: "",
      lastName: "",
      email: "",
      phone: "",
      service: "",
      preferredDate: "",
      preferredTime: "",
      message: "",
      consentToContact: false,
    },
  });

  useEffect(() => {
    captureLeadAttribution();
    const requestedService = searchParams.get("service");
    const isKnownService = appointmentServiceOptions.some(
      (option) => option.value === requestedService,
    );
    if (requestedService && isKnownService && !form.getValues("service")) {
      form.setValue(
        "service",
        requestedService as (typeof leadServiceIds)[number],
        { shouldValidate: true },
      );
    }
  }, [appointmentServiceOptions, form, searchParams]);

  const appointmentMutation = useMutation({
    mutationFn: async (values: AppointmentFormValues) => {
      submissionIdRef.current ||= createSubmissionId();
      const res = await fetch("/api/appointments", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          ...values,
          submissionId: submissionIdRef.current,
          consentVersion: LEAD_CONSENT_VERSION,
          ...captureLeadAttribution(),
        }),
        credentials: "include",
      });

      const payload = (await res.json().catch(() => null)) as
        | (AppointmentResponse & { errors?: Array<{ path: Array<string | number>; message: string }>; message?: string })
        | null;

      if (!res.ok || !payload?.success) {
        const error = new Error(payload?.message || "Failed to submit appointment request.") as Error & {
          details?: typeof payload;
        };
        error.details = payload ?? undefined;
        throw error;
      }

      return payload;
    },
    onSuccess: (data) => {
      setSubmission({
        delivered: data.delivered,
        fallbackMessage: data.fallbackMessage,
      });

      if (data.created) {
        trackAppointmentSubmitSuccess(
          data.serviceId || undefined,
          submissionIdRef.current || undefined,
        );
      }

      if (data.delivered) {
        toast.success("Appointment request received", {
          description:
            "Thanks! We received your request and our team will contact you shortly to confirm.",
        });
      } else {
        trackAppointmentSubmitFallback(data.serviceId || undefined);
        toast("Request saved with backup notice", {
          description:
            data.fallbackMessage ||
            "Your request is saved. Please call us so we can prioritize your appointment.",
        });
      }

      form.reset({
        company: "",
        firstName: "",
        lastName: "",
        email: "",
        phone: "",
        service: "",
        preferredDate: "",
        preferredTime: "",
        message: "",
        consentToContact: false,
      });
      submissionIdRef.current = null;
    },
    onError: (error: Error & { details?: { errors?: Array<{ path: Array<string | number>; message: string }>; message?: string } }) => {
      const issues = error.details?.errors ?? [];
      trackFormSubmitError({
        errorType: issues.length > 0 ? "validation_error" : "request_error",
        formType: "appointment",
        location: "book_appointment_page",
        serviceId: form.getValues("service") || undefined,
      });

      for (const issue of issues) {
        const path = issue.path?.[0];
        if (typeof path === "string") {
          form.setError(path as keyof AppointmentFormValues, {
            type: "server",
            message: issue.message,
          });
        }
      }

      toast.error("Unable to submit request", {
        description: error.message || "Please try again or call our office directly.",
      });
    },
  });

  const onSubmit = (values: AppointmentFormValues) => {
    setSubmission(null);
    trackFormSubmitAttempt({
      formType: "appointment",
      location: "book_appointment_page",
      serviceId: values.service || undefined,
    });
    appointmentMutation.mutate(values);
  };

  const onInvalidSubmit = () => {
    trackFormSubmitError({
      errorType: "validation_error",
      formType: "appointment",
      location: "book_appointment_page",
      serviceId: form.getValues("service") || undefined,
    });
  };

  const handleFormStart = () => {
    if (hasStartedForm) return;
    setHasStartedForm(true);
    trackFormStart({
      formType: "appointment",
      location: "book_appointment_page",
      serviceId: form.getValues("service") || undefined,
    });
  };

  return (
    <div className="pt-16 pb-20 bg-white">
      <section className="relative overflow-hidden py-20 lg:py-28">
        <HeroBackdrop variant="warm" />
        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center">
            <h1 className="text-4xl lg:text-5xl font-bold text-gray-800 mb-6">
              Request an Appointment
            </h1>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto">
              Request your preferred date and time. We will follow up to confirm your visit.
            </p>
          </div>
        </div>
      </section>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        <PageBreadcrumbs items={[{ label: "Home", href: "/" }, { label: "Book Appointment" }]} />

        <div className="grid gap-10 lg:grid-cols-[minmax(0,1.2fr)_minmax(0,0.8fr)]">
          <section className="bg-gray-50 rounded-xl p-6 sm:p-8 shadow-sm border border-gray-100">
            <h2 className="text-2xl font-bold text-gray-800 mb-3">Appointment Request Form</h2>
            <p className="text-gray-600 mb-6">
              Complete the form below and our team will reach out quickly to finalize your appointment.
            </p>

            {submission?.delivered ? (
              <div role="status" aria-live="polite" className="mb-6 rounded-xl border border-sky-200 bg-sky-50 p-4">
                <p className="font-semibold text-sky-900">Appointment request received.</p>
                <p className="text-sky-800 text-sm mt-1">
                  Thank you. We will contact you soon to confirm your date and time.
                </p>
              </div>
            ) : null}

            {submission && !submission.delivered ? (
              <div role="status" aria-live="polite" className="mb-6 rounded-xl border border-blue-200 bg-blue-50 p-4">
                <p className="font-semibold text-blue-900">Request saved with backup notice.</p>
                <p className="text-blue-800 text-sm mt-1">
                  {submission.fallbackMessage ||
                    "Your request was saved, but online delivery is delayed."}
                </p>
                <p className="text-blue-900 text-sm mt-2">
                  Please call us now at{" "}
                  <a
                    href={officePhoneHref}
                    className="font-semibold underline"
                    onClick={() => trackPhoneClick("appointment_fallback_notice")}
                  >
                    {officePhone}
                  </a>{" "}
                  so we can prioritize your appointment.
                </p>
              </div>
            ) : null}

            <Form {...form}>
              <form
                onSubmit={form.handleSubmit(onSubmit, onInvalidSubmit)}
                onFocusCapture={handleFormStart}
                className="space-y-4"
                data-hydrated={isFormReady ? "true" : "false"}
              >
                <input
                  type="text"
                  {...form.register("company")}
                  tabIndex={-1}
                  autoComplete="off"
                  aria-hidden="true"
                  className="hidden"
                />

                <div className="grid gap-4 sm:grid-cols-2">
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
                      <FormLabel>Email *</FormLabel>
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
                      <FormLabel>Phone *</FormLabel>
                      <FormControl>
                        <Input type="tel" inputMode="tel" autoComplete="tel" required aria-required="true" {...field} />
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
                      <FormLabel>Service *</FormLabel>
                      <FormControl>
                        <select
                          {...field}
                          required
                          aria-required="true"
                          className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm text-foreground ring-offset-background focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                        >
                          <option value="" disabled>
                            Select a service
                          </option>
                          {appointmentServiceOptions.map((service) => (
                            <option key={service.value} value={service.value}>
                              {service.label}
                            </option>
                          ))}
                        </select>
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <div className="grid gap-4 sm:grid-cols-2">
                  <FormField
                    control={form.control}
                    name="preferredDate"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Preferred Date (optional)</FormLabel>
                        <FormControl>
                          <Input type="date" min={minDate} {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={form.control}
                    name="preferredTime"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Preferred Time (optional)</FormLabel>
                        <FormControl>
                          <select
                            {...field}
                            className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm text-foreground ring-offset-background focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2"
                          >
                            <option value="">No preference</option>
                            <option value="morning">Morning (9 AM–12 PM)</option>
                            <option value="afternoon">Afternoon (12–5 PM)</option>
                            <option value="flexible">Flexible</option>
                          </select>
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>

                <FormField
                  control={form.control}
                  name="message"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Notes (optional)</FormLabel>
                      <FormControl>
                        <Textarea
                          rows={4}
                          placeholder="Share scheduling details or accessibility needs."
                          value={field.value ?? ""}
                          onChange={field.onChange}
                          onBlur={field.onBlur}
                          name={field.name}
                          ref={field.ref}
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
                            I agree that Family First Smile Care may contact me about this request. *
                          </FormLabel>
                          <p className="mt-1 text-sm text-muted-foreground">
                            Please do not include private medical details. Call us if you need to discuss a health concern.
                          </p>
                        </div>
                      </div>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <Button
                  type="submit"
                  className="w-full bg-primary text-primary-foreground hover:bg-primary/90 py-3 text-base font-semibold"
                  disabled={!isFormReady || appointmentMutation.isPending}
                >
                  {appointmentMutation.isPending ? "Submitting..." : "Request Appointment"}
                </Button>
              </form>
            </Form>
          </section>

          <aside className="space-y-6">
            <div className="rounded-xl border border-primary/20 bg-primary/5 p-6">
              <h3 className="text-xl font-bold text-gray-800 mb-4">What Happens Next</h3>
              <ul className="space-y-4 text-gray-700">
                <li>
                  We review your preferred date and service details.
                </li>
                <li>
                  Our team contacts you to confirm the best appointment time.
                </li>
                <li>
                  You receive a confirmed visit plan and arrival instructions.
                </li>
              </ul>
            </div>

            <div className="rounded-xl border border-gray-200 bg-white p-6 shadow-sm">
              <h3 className="text-xl font-bold text-gray-800 mb-4">Need Immediate Help?</h3>
              <p className="text-gray-600 mb-4">
                For urgent concerns or same-day availability, call our office directly.
              </p>
              <a
                href={officePhoneHref}
                className="inline-flex items-center text-primary font-semibold hover:text-primary transition-colors"
                onClick={() => trackPhoneClick("appointment_sidebar")}
              >
                {officePhone}
              </a>
            </div>

            <div className="rounded-xl border border-border bg-muted/40 p-6">
              <h3 className="text-xl font-bold text-gray-800 mb-3">Your Privacy</h3>
              <p className="text-gray-700">
                We use your details only to respond and coordinate care. Please avoid sharing sensitive medical information online.
              </p>
            </div>
          </aside>
        </div>
      </div>
    </div>
  );
}
