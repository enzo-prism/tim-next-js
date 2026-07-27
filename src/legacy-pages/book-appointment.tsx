"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useMutation } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
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
import { services } from "@/content/services";
import {
  appointmentFormSchema,
  leadServiceIds,
  LEAD_CONSENT_VERSION,
  type AppointmentFormValues,
} from "@/content/form-schemas";
import {
  trackAppointmentBookingAbandonment,
  trackAppointmentBookingStepComplete,
  trackAppointmentBookingStepView,
  trackAppointmentSubmitFallback,
  trackAppointmentSubmitSuccess,
  trackFormStart,
  trackFormSubmitAttempt,
  trackFormSubmitError,
  trackPhoneClick,
  type AppointmentBookingStep,
} from "@/lib/analytics";
import { captureLeadAttribution, createSubmissionId } from "@/lib/lead-attribution";
import { toast } from "sonner";

const officePhone = "(408) 358-8100";
const officePhoneHref = "tel:+14083588100";
const requiredDetailsFields = ["service", "firstName", "lastName", "phone", "email"] as const;

type AppointmentResponse = {
  success: boolean;
  created: boolean;
  delivered: boolean;
  leadId: string;
  serviceId: string | null;
  fallbackMessage?: string;
};

type BookAppointmentProps = {
  initialServiceId?: (typeof leadServiceIds)[number];
};

export default function BookAppointment({ initialServiceId }: BookAppointmentProps) {
  const submissionIdRef = useRef<string | null>(null);
  const formStartedRef = useRef(false);
  const completedRef = useRef(false);
  const abandonmentTrackedRef = useRef(false);
  const completedStepsRef = useRef(new Set<AppointmentBookingStep>());
  const activeStepRef = useRef<AppointmentBookingStep>(1);
  const shouldFocusStepHeadingRef = useRef(false);
  const stepHeadingRef = useRef<HTMLHeadingElement>(null);
  const submissionStatusRef = useRef<HTMLDivElement>(null);
  const [isFormReady, setIsFormReady] = useState(false);
  const [step, setStep] = useState<AppointmentBookingStep>(1);
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
      service: initialServiceId ?? "",
      preferredDate: "",
      preferredTime: "",
      message: "",
      consentToContact: false,
    },
  });

  useEffect(() => {
    captureLeadAttribution();
  }, []);

  useEffect(() => {
    if (!isFormReady || submission) return;
    activeStepRef.current = step;
    trackAppointmentBookingStepView(step, form.getValues("service") || undefined);
  }, [form, isFormReady, step, submission]);

  useEffect(() => {
    if (!shouldFocusStepHeadingRef.current) return;
    shouldFocusStepHeadingRef.current = false;
    stepHeadingRef.current?.focus();
  }, [step, submission]);

  useEffect(() => {
    if (submission) {
      submissionStatusRef.current?.focus();
    }
  }, [submission]);

  useEffect(() => {
    const trackAbandonment = (reason: "page_exit" | "route_change") => {
      if (
        !formStartedRef.current ||
        completedRef.current ||
        abandonmentTrackedRef.current
      ) {
        return;
      }

      abandonmentTrackedRef.current = true;
      trackAppointmentBookingAbandonment(
        activeStepRef.current,
        form.getValues("service") || undefined,
        reason,
      );
    };
    const handlePageHide = () => trackAbandonment("page_exit");

    window.addEventListener("pagehide", handlePageHide);
    return () => {
      window.removeEventListener("pagehide", handlePageHide);
      trackAbandonment("route_change");
    };
  }, [form]);

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
        | (AppointmentResponse & {
            errors?: Array<{ path: Array<string | number>; message: string }>;
            message?: string;
          })
        | null;

      if (!res.ok || !payload?.success) {
        const error = new Error(
          payload?.message || "Failed to submit appointment request.",
        ) as Error & { details?: typeof payload; status?: number };
        error.details = payload ?? undefined;
        error.status = res.status;
        throw error;
      }

      return payload;
    },
    onSuccess: (data) => {
      // The lead is complete once the API has durably saved it, even if the
      // office notification still needs a retry.
      completedRef.current = true;
      setSubmission({
        delivered: data.delivered,
        fallbackMessage: data.fallbackMessage,
      });

      if (data.delivered) {
        trackAppointmentSubmitSuccess(
          data.serviceId || undefined,
          submissionIdRef.current || undefined,
        );
      }

      if (data.delivered) {
        toast.success("Appointment request received", {
          description:
            "Thanks. Our team will contact you to confirm an appointment time.",
        });
      } else {
        trackAppointmentSubmitFallback(data.serviceId || undefined);
        toast("Request saved with backup notice", {
          description:
            data.fallbackMessage ||
            "Your request is saved. Please call us so we can prioritize it.",
        });
      }

      if (data.delivered) {
        form.reset();
        submissionIdRef.current = null;
      }
    },
    onError: (
      error: Error & {
        details?: {
          errors?: Array<{ path: Array<string | number>; message: string }>;
          message?: string;
        };
        status?: number;
      },
    ) => {
      // A 409 means this submission UUID is already bound to different stored
      // data, which happens when a patient edits their request and resubmits
      // after a delivery-fallback notice. Retire the UUID so the next attempt
      // is treated as a fresh lead instead of conflicting forever.
      const isSubmissionConflict = error.status === 409;
      if (isSubmissionConflict) {
        submissionIdRef.current = null;
      }
      const issues = error.details?.errors ?? [];
      let hasDetailsError = false;
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
          hasDetailsError ||= requiredDetailsFields.includes(
            path as (typeof requiredDetailsFields)[number],
          );
        }
      }

      if (hasDetailsError) {
        activeStepRef.current = 1;
        shouldFocusStepHeadingRef.current = true;
        setStep(1);
      }

      toast.error("Unable to submit request", {
        description: isSubmissionConflict
          ? "Your request changed since the last attempt. Submit once more to send the updated details."
          : error.message || "Please try again or call our office directly.",
      });
    },
  });

  const handleFormStart = () => {
    if (formStartedRef.current) return;
    formStartedRef.current = true;
    trackFormStart({
      formType: "appointment",
      location: "book_appointment_page",
      serviceId: form.getValues("service") || undefined,
    });
  };

  const trackStepCompleteOnce = (completedStep: AppointmentBookingStep) => {
    if (completedStepsRef.current.has(completedStep)) return;
    completedStepsRef.current.add(completedStep);
    trackAppointmentBookingStepComplete(
      completedStep,
      form.getValues("service") || undefined,
    );
  };

  const advanceToPreferences = async () => {
    handleFormStart();
    const isValid = await form.trigger(requiredDetailsFields, { shouldFocus: true });
    if (!isValid) return;

    trackStepCompleteOnce(1);
    activeStepRef.current = 2;
    shouldFocusStepHeadingRef.current = true;
    setStep(2);
  };

  const returnToDetails = () => {
    activeStepRef.current = 1;
    shouldFocusStepHeadingRef.current = true;
    setStep(1);
  };

  const onSubmit = (values: AppointmentFormValues) => {
    setSubmission(null);
    trackStepCompleteOnce(2);
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

  return (
    <div className="bg-background px-4 pb-20 pt-24 sm:px-6 sm:pt-28 lg:px-8">
      <div className="mx-auto max-w-5xl">
        <header className="mb-8 max-w-2xl sm:mb-10">
          <p className="mb-2 text-sm font-bold uppercase tracking-wider text-primary">
            Appointment request
          </p>
          <h1 className="text-3xl font-bold text-foreground sm:text-4xl">
            Tell us how we can help
          </h1>
          <p id="request-expectation" className="mt-3 text-base text-muted-foreground sm:text-lg">
            Send a short request and our team will contact you to confirm a time. Your visit is
            not booked until we confirm it with you.
          </p>
          <p className="mt-3 text-sm text-foreground">
            Prefer to talk now?{" "}
            <a
              href={officePhoneHref}
              className="font-semibold text-primary underline underline-offset-4"
              onClick={() => trackPhoneClick("appointment_intro")}
            >
              Call {officePhone}
            </a>
            .
          </p>
        </header>

        <div className="grid items-start gap-8 lg:grid-cols-[minmax(0,1fr)_18rem]">
          <section
            aria-labelledby="appointment-form-heading"
            className="rounded-xl border border-border bg-card p-5 sm:p-8"
          >
            <div className="mb-7 border-b border-border pb-6">
              <div className="flex items-center justify-between gap-4 text-sm font-semibold">
                <span className="text-foreground">Step {step} of 2</span>
                <span className="text-muted-foreground">
                  {step === 1 ? "Your details" : "Preferences"}
                </span>
              </div>
              <div
                className="mt-3 h-1.5 overflow-hidden rounded-full bg-muted"
                role="progressbar"
                aria-label="Appointment request progress"
                aria-valuemin={1}
                aria-valuemax={2}
                aria-valuenow={step}
                aria-valuetext={`Step ${step} of 2: ${step === 1 ? "Your details" : "Preferences"}`}
              >
                <div
                  aria-hidden="true"
                  className="h-full rounded-full bg-primary transition-[width]"
                  style={{ width: step === 1 ? "50%" : "100%" }}
                />
              </div>
            </div>

            {submission ? (
              <div
                ref={submissionStatusRef}
                role="status"
                aria-live="polite"
                tabIndex={-1}
                className="rounded-xl border border-border bg-accent p-5 outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
              >
                <h2 id="appointment-form-heading" className="text-xl font-bold text-accent-foreground">
                  {submission.delivered
                    ? "Your appointment request was received"
                    : "Your request was saved"}
                </h2>
                <p className="mt-2 text-sm text-accent-foreground">
                  {submission.delivered
                    ? "Our team will contact you to confirm a date and time."
                    : submission.fallbackMessage ||
                      "Online delivery is delayed. Please call us so we can prioritize your request."}
                </p>
                {!submission.delivered ? (
                  <div className="mt-4 flex flex-col gap-3 sm:flex-row sm:items-center">
                    <Button
                      type="button"
                      onClick={() => {
                        shouldFocusStepHeadingRef.current = true;
                        setSubmission(null);
                      }}
                      className="sm:w-auto"
                    >
                      Try delivery again
                    </Button>
                    <a
                      href={officePhoneHref}
                      className="inline-flex min-h-11 items-center font-semibold text-primary underline underline-offset-4"
                      onClick={() => trackPhoneClick("appointment_fallback_notice")}
                    >
                      Call {officePhone}
                    </a>
                  </div>
                ) : null}
              </div>
            ) : (
              <Form {...form}>
                <form
                  noValidate
                  aria-describedby="request-expectation"
                  aria-busy={appointmentMutation.isPending}
                  onSubmit={(event) => {
                    if (step === 1) {
                      event.preventDefault();
                      void advanceToPreferences();
                      return;
                    }
                    void form.handleSubmit(onSubmit, onInvalidSubmit)(event);
                  }}
                  onFocusCapture={handleFormStart}
                  className="space-y-5"
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

                  {step === 1 ? (
                    <fieldset className="space-y-5">
                      <legend className="sr-only">Your contact details</legend>
                      <div>
                        <h2
                          id="appointment-form-heading"
                          ref={stepHeadingRef}
                          tabIndex={-1}
                          className="text-2xl font-bold text-foreground outline-none"
                        >
                          Start with the essentials
                        </h2>
                        <p className="mt-2 text-sm text-muted-foreground">
                          All fields in this step are required. We use them only to respond to your
                          request.
                        </p>
                      </div>

                      <FormField
                        control={form.control}
                        name="service"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>What can we help with?</FormLabel>
                            <FormControl>
                              <select
                                {...field}
                                required
                                aria-required="true"
                                className="flex h-11 w-full rounded-md border border-input bg-background px-3 py-2 text-sm text-foreground ring-offset-background focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
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

                      <div className="grid gap-5 sm:grid-cols-2">
                        <FormField
                          control={form.control}
                          name="firstName"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>First name</FormLabel>
                              <FormControl>
                                <Input
                                  {...field}
                                  autoComplete="given-name"
                                  required
                                  aria-required="true"
                                />
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
                              <FormLabel>Last name</FormLabel>
                              <FormControl>
                                <Input
                                  {...field}
                                  autoComplete="family-name"
                                  required
                                  aria-required="true"
                                />
                              </FormControl>
                              <FormMessage />
                            </FormItem>
                          )}
                        />
                      </div>

                      <div className="grid gap-5 sm:grid-cols-2">
                        <FormField
                          control={form.control}
                          name="phone"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>Phone</FormLabel>
                              <FormControl>
                                <Input
                                  type="tel"
                                  inputMode="tel"
                                  autoComplete="tel"
                                  required
                                  aria-required="true"
                                  {...field}
                                />
                              </FormControl>
                              <FormMessage />
                            </FormItem>
                          )}
                        />
                        <FormField
                          control={form.control}
                          name="email"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>Email</FormLabel>
                              <FormControl>
                                <Input
                                  type="email"
                                  autoComplete="email"
                                  required
                                  aria-required="true"
                                  {...field}
                                />
                              </FormControl>
                              <FormMessage />
                            </FormItem>
                          )}
                        />
                      </div>

                      <Button
                        type="button"
                        size="lg"
                        className="w-full text-base font-semibold"
                        disabled={!isFormReady}
                        onClick={() => void advanceToPreferences()}
                      >
                        Continue
                      </Button>
                    </fieldset>
                  ) : (
                    <fieldset className="space-y-5">
                      <legend className="sr-only">Appointment preferences</legend>
                      <div>
                        <h2
                          id="appointment-form-heading"
                          ref={stepHeadingRef}
                          tabIndex={-1}
                          className="text-2xl font-bold text-foreground outline-none"
                        >
                          Add any preferences
                        </h2>
                        <p className="mt-2 text-sm text-muted-foreground">
                          Date, time, and notes are optional. We will confirm availability with you.
                        </p>
                      </div>

                      <div className="grid gap-5 sm:grid-cols-2">
                        <FormField
                          control={form.control}
                          name="preferredDate"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>Preferred date (optional)</FormLabel>
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
                              <FormLabel>Preferred time (optional)</FormLabel>
                              <FormControl>
                                <select
                                  {...field}
                                  className="flex h-11 w-full rounded-md border border-input bg-background px-3 py-2 text-sm text-foreground ring-offset-background focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2"
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
                                rows={3}
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
                          <FormItem className="rounded-lg border border-border bg-muted/40 p-4">
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
                                  I agree that Family First Smile Care may contact me about this
                                  request.
                                </FormLabel>
                                <p className="mt-1 text-sm text-muted-foreground">
                                  Please do not include private medical details. Call us to discuss a
                                  health concern.
                                </p>
                              </div>
                            </div>
                            <FormMessage />
                          </FormItem>
                        )}
                      />

                      <div className="grid gap-3 sm:grid-cols-[auto_minmax(0,1fr)]">
                        <Button
                          type="button"
                          variant="outline"
                          size="lg"
                          className="sm:px-6"
                          disabled={appointmentMutation.isPending}
                          onClick={returnToDetails}
                        >
                          Back
                        </Button>
                        <Button
                          type="submit"
                          size="lg"
                          className="text-base font-semibold"
                          disabled={!isFormReady || appointmentMutation.isPending}
                        >
                          {appointmentMutation.isPending
                            ? "Sending request…"
                            : "Send Appointment Request"}
                        </Button>
                      </div>
                    </fieldset>
                  )}
                </form>
              </Form>
            )}
          </section>

          <aside className="space-y-5 lg:sticky lg:top-24">
            <section className="rounded-xl border border-border bg-accent p-5">
              <h2 className="text-lg font-bold text-accent-foreground">What happens next</h2>
              <ol className="mt-4 space-y-3 text-sm text-accent-foreground">
                <li>1. We review your request.</li>
                <li>2. Our team contacts you about availability.</li>
                <li>3. We confirm your visit and arrival details.</li>
              </ol>
            </section>

            <section className="rounded-xl border border-border bg-card p-5">
              <h2 className="text-lg font-bold text-foreground">Need help sooner?</h2>
              <p className="mt-2 text-sm text-muted-foreground">
                Call the office for time-sensitive scheduling questions.
              </p>
              <a
                href={officePhoneHref}
                className="mt-3 inline-flex min-h-11 items-center font-semibold text-primary underline underline-offset-4"
                onClick={() => trackPhoneClick("appointment_sidebar")}
              >
                {officePhone}
              </a>
            </section>
          </aside>
        </div>
      </div>
    </div>
  );
}
