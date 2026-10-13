"use client";

import { useEffect, useMemo, useRef, useState, type CSSProperties } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useMutation } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { MinimalGlyph } from "@/components/ui/minimal-glyph";
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
import { NativeSelect } from "@/components/ui/native-select";
import { Textarea } from "@/components/ui/textarea";
import { appointmentServiceLabels, visitForLabels } from "@/content/appointment-options";
import { practiceHoursSummary } from "@/content/practice-hours";
import {
  appointmentFormSchema,
  getPracticeToday,
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
import { cn } from "@/lib/utils";
import { Pinwheel, ToothPerson } from "@/components/brand/pinwheel";
import { Word, Words } from "@/components/motion/words";
import { Eyebrow } from "@/components/site/section";
import { StepTimeline } from "@/components/site/step-timeline";
import { PracticeStatusPill } from "@/components/forms/practice-status-pill";

const officePhone = "(408) 358-8100";
const officePhoneHref = "tel:+14083588100";
const requiredDetailsFields = ["service", "firstName", "lastName", "phone", "email", "preferredContactMethod", "visitFor"] as const;

const stepHeadingClass =
  "font-display text-[1.75rem] font-semibold leading-tight text-ink outline-none sm:text-3xl";
const groupLegendClass =
  "mb-5 flex items-center gap-2.5 text-xs font-bold uppercase tracking-[0.14em] text-cobalt-deep";
const optionalHintClass = "font-normal text-ink-soft";
const summaryTermClass = "text-xs font-bold uppercase tracking-[0.12em] text-ink-soft";
const summaryValueClass = "mt-1 text-base font-semibold text-ink";

const nextSteps = [
  { title: "We review your request", body: "Our team reads every request during office hours." },
  { title: "We reach out about availability", body: "By phone or email, whichever you prefer." },
  { title: "We confirm your visit", body: "You get the date, time, and arrival details." },
];

type AppointmentResponse = {
  success: boolean;
  created: boolean;
  delivered: boolean;
  queued?: boolean;
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
    queued?: boolean;
    values: AppointmentFormValues;
    fallbackMessage?: string;
  } | null>(null);
  // Presentation only: the step panel slides in after a step change. Step 1
  // renders without any entrance animation, so it is fully visible in the
  // server HTML and on first paint.
  const [displayedStep, setDisplayedStep] = useState(step);
  const [stepTransition, setStepTransition] = useState<"forward" | "back" | null>(null);
  if (displayedStep !== step) {
    setDisplayedStep(step);
    setStepTransition(step > displayedStep ? "forward" : "back");
  }

  useEffect(() => {
    setIsFormReady(true);
  }, []);

  const minDate = useMemo(() => getPracticeToday(), []);
  const appointmentServiceOptions = leadServiceIds.map((value) => ({ value, label: appointmentServiceLabels[value] }));

  const form = useForm<AppointmentFormValues>({
    resolver: zodResolver(appointmentFormSchema),
    defaultValues: {
      company: "",
      firstName: "",
      lastName: "",
      email: "",
      phone: "",
      service: initialServiceId ?? "not-sure",
      preferredContactMethod: "phone",
      visitFor: "self",
      preferredDate: "",
      preferredTime: "",
      message: "",
      consentToContact: false,
    },
  });

  const preferredContactMethod = form.watch("preferredContactMethod");
  const visitFor = form.watch("visitFor");
  const selectedService = form.watch("service");

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
    onSuccess: (data, values) => {
      // The lead is complete once the API has durably saved it, even if the
      // office notification still needs a retry.
      completedRef.current = true;
      setSubmission({
        delivered: data.delivered,
        queued: data.queued,
        values: { ...values },
        fallbackMessage: data.fallbackMessage,
      });

      if (data.created) {
        trackAppointmentSubmitSuccess(
          data.serviceId || undefined,
          submissionIdRef.current || undefined,
        );
      }

      if (data.delivered || data.queued) {
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

      if (data.delivered || data.queued) {
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
    <div className="px-2 pb-2 pt-2 sm:px-3 sm:pb-3">
      <div className="relative overflow-clip rounded-3xl bg-periwinkle-wash">
        <div
          aria-hidden="true"
          className="pointer-events-none absolute -bottom-20 -right-20 hidden size-72 lg:block xl:size-80"
        >
          <Pinwheel gather="load" spin="page" delay={150} className="size-full" />
        </div>

        <div className="relative mx-auto grid max-w-7xl gap-10 px-3 pb-12 pt-8 sm:px-6 sm:pb-16 sm:pt-12 lg:grid-cols-[minmax(0,0.78fr)_minmax(0,1.22fr)] lg:grid-rows-[auto_1fr] lg:gap-x-16 lg:gap-y-14 lg:px-8 lg:pb-24 lg:pt-16">
          {/* Intro: first on phones, top of the left column on desktop. */}
          <header className="px-1 sm:px-0 lg:col-start-1 lg:row-start-1 lg:pt-4">
            <div className="ff-intro mb-5" style={{ "--d": 0 } as CSSProperties}>
              <Eyebrow>Appointment request</Eyebrow>
            </div>
            <h1 className="ff-h1 ff-words-intro" style={{ "--d": 80 } as CSSProperties}>
              <Words text="Tell us how we can" />{" "}
              <Word index={5}>
                <em className="ff-italic font-normal text-cobalt">help</em>
              </Word>
            </h1>
            <p
              id="request-expectation"
              className="ff-lead ff-intro mt-6 max-w-xl"
              style={{ "--d": 320 } as CSSProperties}
            >
              Share a few details and our team will get in touch to find a time that works for
              you. Your visit is booked once we confirm it with you.
            </p>
            <p
              className="ff-intro mt-5 flex flex-wrap items-center gap-x-2 text-base text-ink-soft"
              style={{ "--d": 420 } as CSSProperties}
            >
              Prefer to talk now?
              <a
                href={officePhoneHref}
                className="ff-link inline-flex min-h-11 items-center"
                onClick={() => trackPhoneClick("appointment_intro")}
              >
                Call {officePhone}
              </a>
            </p>
          </header>

          {/* The request form: right column on desktop, second on phones. */}
          <section
            aria-labelledby="appointment-form-heading"
            className="ff-intro-scale relative rounded-3xl bg-white p-5 shadow-float ring-1 ring-ink/5 sm:p-8 lg:col-start-2 lg:row-span-2 lg:row-start-1 lg:self-start lg:p-10 xl:p-12"
            style={{ "--d": 160 } as CSSProperties}
          >
            <div className="mb-8 sm:mb-10">
              <div className="flex items-baseline justify-between gap-4 text-sm">
                <span className="font-bold text-ink">Step {step} of 2</span>
                <span className="font-medium text-ink-soft">
                  {step === 1 ? "Your details" : "Preferences"}
                </span>
              </div>
              <div
                className="mt-3 grid h-2 grid-cols-2 gap-1.5"
                role="progressbar"
                aria-label="Appointment request progress"
                aria-valuemin={1}
                aria-valuemax={2}
                aria-valuenow={step}
                aria-valuetext={`Step ${step} of 2: ${step === 1 ? "Your details" : "Preferences"}`}
              >
                <span aria-hidden="true" className="rounded-full bg-cobalt" />
                <span aria-hidden="true" className="overflow-clip rounded-full bg-cloud">
                  <span
                    className="block size-full origin-left rounded-full bg-cobalt transition-[scale] duration-700 ease-[var(--ease-out-soft)] motion-reduce:transition-none"
                    style={{ scale: step === 2 ? "1 1" : "0 1" }}
                  />
                </span>
              </div>
            </div>

            {submission ? (
              <div
                ref={submissionStatusRef}
                role="status"
                aria-live="polite"
                tabIndex={-1}
                className="rounded-3xl bg-lime-wash p-6 text-ink outline-none ring-1 ring-ink/5 focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 motion-safe:animate-in motion-safe:fade-in-0 motion-safe:zoom-in-95 motion-safe:duration-500 sm:p-8"
              >
                <Pinwheel gather="load" delay={120} className="size-16 sm:size-20" />
                <h2
                  id="appointment-form-heading"
                  className="mt-5 font-display text-2xl font-semibold leading-tight text-ink sm:text-3xl"
                >
                  Your appointment request was saved
                </h2>
                <p className="mt-3 text-base leading-relaxed text-ink">
                  {submission.delivered || submission.queued
                    ? "Our team will contact you to confirm a date and time."
                    : submission.fallbackMessage ||
                      "Online delivery is delayed. Please call us so we can prioritize your request."}
                </p>
                <dl className="mt-6 grid gap-x-6 gap-y-4 rounded-2xl bg-white p-5 text-sm ring-1 ring-ink/5 sm:grid-cols-2 sm:p-6">
                  <div><dt className={summaryTermClass}>Request</dt><dd className={summaryValueClass}>{appointmentServiceLabels[submission.values.service as keyof typeof appointmentServiceLabels]}</dd></div>
                  <div><dt className={summaryTermClass}>Visit for</dt><dd className={summaryValueClass}>{visitForLabels[submission.values.visitFor ?? "self"]}</dd></div>
                  <div><dt className={summaryTermClass}>Contact person</dt><dd className={summaryValueClass}>{submission.values.firstName} {submission.values.lastName}</dd></div>
                  <div><dt className={summaryTermClass}>Preferred contact</dt><dd className={cn(summaryValueClass, "break-all")}>{submission.values.preferredContactMethod === "email" ? submission.values.email : submission.values.phone}</dd></div>
                  <div><dt className={summaryTermClass}>Date preference</dt><dd className={summaryValueClass}>{submission.values.preferredDate || "No preference"}</dd></div>
                  <div><dt className={summaryTermClass}>Time preference</dt><dd className={cn(summaryValueClass, "capitalize")}>{submission.values.preferredTime || "No preference"}</dd></div>
                </dl>
                <p className="mt-5 text-sm leading-relaxed text-ink-soft">Office hours: {practiceHoursSummary} (Pacific time). If you have not heard from us by the end of the next open office day, please call {officePhone}.</p>
                {!submission.delivered && !submission.queued ? (
                  <div className="mt-6 flex flex-col gap-3 sm:flex-row sm:items-center">
                    <Button
                      type="button"
                      size="lg"
                      onClick={() => {
                        shouldFocusStepHeadingRef.current = true;
                        setSubmission(null);
                      }}
                      className="h-13 sm:w-auto"
                    >
                      Try delivery again
                    </Button>
                    <Button asChild size="lg" variant="outline" className="h-13">
                      <a
                        href={officePhoneHref}
                        onClick={() => trackPhoneClick("appointment_fallback_notice")}
                      >
                        Call {officePhone}
                      </a>
                    </Button>
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

                  {/* Keyed by step so the panel slides in on a step change only. */}
                  <div
                    key={step}
                    className={cn(
                      stepTransition === "forward" &&
                        "motion-safe:animate-in motion-safe:fade-in-0 motion-safe:slide-in-from-right-6 motion-safe:duration-500 motion-safe:ease-[var(--ease-out-soft)]",
                      stepTransition === "back" &&
                        "motion-safe:animate-in motion-safe:fade-in-0 motion-safe:slide-in-from-left-6 motion-safe:duration-500 motion-safe:ease-[var(--ease-out-soft)]",
                    )}
                  >
                    {step === 1 ? (
                      <fieldset className="space-y-9">
                        <legend className="sr-only">Your contact details</legend>
                        <div>
                          <h2
                            id="appointment-form-heading"
                            ref={stepHeadingRef}
                            tabIndex={-1}
                            className={stepHeadingClass}
                          >
                            Start with the essentials
                          </h2>
                          <p className="mt-3 text-base leading-relaxed text-ink-soft">
                            Choose how we can reach you. Only that contact method is required.
                            Use your own name when requesting a visit for your child or family.
                          </p>
                        </div>

                        <fieldset className="space-y-5">
                          <legend className={groupLegendClass}>
                            <span aria-hidden="true" className="size-2.5 rounded-full bg-periwinkle" />
                            About the visit
                          </legend>
                          <FormField
                            control={form.control}
                            name="service"
                            render={({ field }) => (
                              <FormItem>
                                <FormLabel>What can we help with?</FormLabel>
                                <FormControl>
                                  <NativeSelect
                                    {...field}
                                    required
                                    aria-required="true"
                                  >
                                    <option value="" disabled>
                                      Choose what you need
                                    </option>
                                    {appointmentServiceOptions.map((service) => (
                                      <option key={service.value} value={service.value}>
                                        {service.label}
                                      </option>
                                    ))}
                                  </NativeSelect>
                                </FormControl>
                                <FormMessage />
                              </FormItem>
                            )}
                          />

                          {selectedService === "tooth-pain" ? (
                            <p className="rounded-2xl bg-blush-wash p-4 text-sm leading-relaxed text-ink ring-1 ring-blush motion-safe:animate-in motion-safe:fade-in-0 motion-safe:slide-in-from-top-1 motion-safe:duration-300">
                              <strong className="font-bold">Need urgent help?</strong>{" "}
                              <a href={officePhoneHref} className="font-semibold text-cobalt-deep underline underline-offset-4" onClick={() => trackPhoneClick("appointment_urgent_concern")}>Call {officePhone}</a> for guidance. Please do not wait for an online request if your concern is time-sensitive.
                            </p>
                          ) : null}

                          <FormField control={form.control} name="visitFor" render={({ field }) => (
                            <FormItem>
                              <FormLabel>Who is the visit for?</FormLabel>
                              <FormControl>
                                <NativeSelect {...field}>
                                  <option value="self">Myself</option><option value="child">My child</option><option value="family">My family</option>
                                </NativeSelect>
                              </FormControl>
                              <FormMessage />
                            </FormItem>
                          )} />
                          {visitFor !== "self" ? <p className="rounded-2xl bg-cloud-wash p-4 text-sm leading-relaxed text-ink-soft">You are the contact person for {visitFor === "child" ? "your child" : "your family"}. We will arrange each patient&apos;s visit with you. No patient names or medical details are needed here.</p> : null}
                        </fieldset>

                        <fieldset className="space-y-5">
                          <legend className={groupLegendClass}>
                            <span aria-hidden="true" className="size-2.5 rounded-full bg-blush" />
                            How we&apos;ll reach you
                          </legend>
                          <FormField control={form.control} name="preferredContactMethod" render={({ field }) => (
                            <FormItem>
                              <FormLabel>How should we contact you?</FormLabel>
                              <FormControl>
                                <NativeSelect {...field} onChange={(event) => { field.onChange(event); form.clearErrors(["phone", "email"]); }}>
                                  <option value="phone">Phone call</option><option value="email">Email</option>
                                </NativeSelect>
                              </FormControl>
                              <FormMessage />
                            </FormItem>
                          )} />

                          <div className="grid gap-5 sm:grid-cols-2">
                            <FormField
                              control={form.control}
                              name="firstName"
                              render={({ field }) => (
                                <FormItem>
                                  <FormLabel>Your first name</FormLabel>
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
                                  <FormLabel>Your last name</FormLabel>
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
                                  <FormLabel>Phone<span className={optionalHintClass}>{preferredContactMethod === "phone" ? " (required)" : " (optional)"}</span></FormLabel>
                                  <FormControl>
                                    <Input
                                      type="tel"
                                      inputMode="tel"
                                      autoComplete="tel"
                                      required={preferredContactMethod === "phone"}
                                      aria-required={preferredContactMethod === "phone"}
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
                              name="email"
                              render={({ field }) => (
                                <FormItem>
                                  <FormLabel>Email<span className={optionalHintClass}>{preferredContactMethod === "email" ? " (required)" : " (optional)"}</span></FormLabel>
                                  <FormControl>
                                    <Input
                                      type="email"
                                      autoComplete="email"
                                      required={preferredContactMethod === "email"}
                                      aria-required={preferredContactMethod === "email"}
                                      {...field}
                                      value={field.value ?? ""}
                                    />
                                  </FormControl>
                                  <FormMessage />
                                </FormItem>
                              )}
                            />
                          </div>
                        </fieldset>

                        <div>
                          <Button
                            type="button"
                            size="lg"
                            className="group h-14 w-full text-base"
                            disabled={!isFormReady}
                            onClick={() => void advanceToPreferences()}
                          >
                            Continue
                            <span aria-hidden="true" className="ff-arrow grid size-8 place-items-center rounded-full bg-white/15">
                              <MinimalGlyph name="arrow-right" />
                            </span>
                          </Button>
                          <p className="mt-3 text-center text-sm text-ink-soft">
                            Next: optional date and time preferences.
                          </p>
                        </div>
                      </fieldset>
                    ) : (
                      <fieldset className="space-y-7">
                        <legend className="sr-only">Appointment preferences</legend>
                        <div>
                          <h2
                            id="appointment-form-heading"
                            ref={stepHeadingRef}
                            tabIndex={-1}
                            className={stepHeadingClass}
                          >
                            Add any preferences
                          </h2>
                          <p className="mt-3 text-base leading-relaxed text-ink-soft">
                            Date, time, and notes are optional. We will confirm availability with you.
                          </p>
                        </div>

                        <div className="grid gap-5 sm:grid-cols-2">
                          <FormField
                            control={form.control}
                            name="preferredDate"
                            render={({ field }) => (
                              <FormItem>
                                <FormLabel>Preferred date<span className={optionalHintClass}> (optional)</span></FormLabel>
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
                                <FormLabel>Preferred time<span className={optionalHintClass}> (optional)</span></FormLabel>
                                <FormControl>
                                  <NativeSelect
                                    {...field}
                                  >
                                    <option value="">No preference</option>
                                    <option value="morning">Morning (9 AM–12 PM)</option>
                                    <option value="afternoon">Afternoon (12–5 PM)</option>
                                    <option value="flexible">Flexible</option>
                                  </NativeSelect>
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
                              <FormLabel>Notes<span className={optionalHintClass}> (optional)</span></FormLabel>
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
                                    I agree that Family First Smile Care may contact me about this
                                    request.
                                  </FormLabel>
                                  <p className="mt-1 text-sm leading-relaxed text-ink-soft">
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
                            className="h-14 text-base sm:px-6"
                            disabled={appointmentMutation.isPending}
                            onClick={returnToDetails}
                          >
                            <MinimalGlyph name="arrow-left" />
                            Back
                          </Button>
                          <Button
                            type="submit"
                            size="lg"
                            className="h-auto min-h-14 min-w-0 whitespace-normal px-5 py-3 text-center text-base sm:px-8"
                            disabled={!isFormReady || appointmentMutation.isPending}
                          >
                            {appointmentMutation.isPending
                              ? "Sending request…"
                              : "Send Appointment Request"}
                          </Button>
                        </div>
                      </fieldset>
                    )}
                  </div>
                </form>
              </Form>
            )}
          </section>

          {/* Extras: after the form on phones, under the intro on desktop. */}
          <aside className="space-y-8 lg:col-start-1 lg:row-start-2 lg:self-start">
            <section className="px-1 sm:px-0">
              <h2 className="font-display text-2xl font-semibold text-ink">What happens next</h2>
              <StepTimeline className="mt-7" orientation="vertical" ringClassName="ring-periwinkle-wash" steps={nextSteps} />
            </section>

            <section className="relative overflow-clip rounded-3xl bg-night p-6 text-white sm:p-8">
              <ToothPerson
                color="var(--ff-lime)"
                className="pointer-events-none absolute -bottom-8 -right-3 h-32 w-auto rotate-[-10deg] opacity-90"
              />
              <h2 className="relative font-display text-2xl font-semibold text-white">Need help sooner?</h2>
              <p className="relative mt-3 max-w-sm text-base leading-relaxed text-white/75">
                For tooth pain or urgent concerns, call for guidance. Please do not wait for an
                online reply.
              </p>
              <Button asChild size="lg" variant="night" className="relative mt-6 h-14 w-full px-7 text-base sm:w-auto">
                <a href={officePhoneHref} onClick={() => trackPhoneClick("appointment_sidebar")}>
                  Call {officePhone}
                </a>
              </Button>
              <div className="relative mt-5 flex flex-col items-start gap-2 pr-16 text-sm text-white/70">
                <PracticeStatusPill tone="night" />
                <span>Office hours: Mon–Thu, 9 AM–5 PM (Pacific time)</span>
              </div>
            </section>
          </aside>
        </div>
      </div>
    </div>
  );
}
