"use client";

import { useMemo, useState } from "react";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { useMutation } from "@tanstack/react-query";
import { Calendar, CalendarCheck2, Clock3, Phone, ShieldCheck } from "lucide-react";
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
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { useToast } from "@/hooks/use-toast";
import { services } from "@/content/services";
import { insertAppointmentSchema } from "@/server/schema";
import HeroBackdrop from "@/components/brand/HeroBackdrop";
import PageBreadcrumbs from "@/components/navigation/PageBreadcrumbs";
import { trackAppointmentSubmitFallback, trackAppointmentSubmitSuccess } from "@/lib/analytics";

const officePhone = "(408) 358-8100";
const officePhoneHref = "tel:+14083588100";

const appointmentFormSchema = insertAppointmentSchema
  .omit({
    requestType: true,
    formspreeStatus: true,
  })
  .extend({
    company: z.string().optional(),
  });

type AppointmentFormValues = z.infer<typeof appointmentFormSchema>;

type AppointmentResponse = {
  success: boolean;
  delivered: boolean;
  appointment: {
    id: string;
    firstName: string;
    lastName: string;
    email: string;
    phone: string | null;
    service: string | null;
    message: string | null;
    requestType: "appointment" | "contact";
    preferredDate: string | null;
    preferredTime: string | null;
    formspreeStatus: "delivered" | "failed" | null;
    createdAt: string;
  };
  fallbackMessage?: string;
};

export default function BookAppointment() {
  const { toast } = useToast();
  const [submission, setSubmission] = useState<{
    delivered: boolean;
    fallbackMessage?: string;
  } | null>(null);

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
        .map((service) => ({
          value: service.id,
          label: service.title,
        })),
    [],
  );

  const form = useForm<AppointmentFormValues>({
    resolver: zodResolver(appointmentFormSchema),
    defaultValues: {
      firstName: "",
      lastName: "",
      email: "",
      phone: "",
      service: "",
      preferredDate: "",
      preferredTime: "",
      message: "",
      company: "",
    },
  });

  const appointmentMutation = useMutation({
    mutationFn: async (values: AppointmentFormValues) => {
      const res = await fetch("/api/appointments", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(values),
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

      if (data.delivered) {
        trackAppointmentSubmitSuccess();
        toast({
          title: "Appointment request received",
          description:
            "Thanks! We received your request and our team will contact you shortly to confirm.",
        });
      } else {
        trackAppointmentSubmitFallback();
        toast({
          title: "Request saved with backup notice",
          description:
            data.fallbackMessage ||
            "Your request is saved. Please call us so we can prioritize your appointment.",
        });
      }

      form.reset({
        firstName: "",
        lastName: "",
        email: "",
        phone: "",
        service: "",
        preferredDate: "",
        preferredTime: "",
        message: "",
        company: "",
      });
    },
    onError: (error: Error & { details?: { errors?: Array<{ path: Array<string | number>; message: string }>; message?: string } }) => {
      const issues = error.details?.errors ?? [];
      for (const issue of issues) {
        const path = issue.path?.[0];
        if (typeof path === "string") {
          form.setError(path as keyof AppointmentFormValues, {
            type: "server",
            message: issue.message,
          });
        }
      }

      toast({
        title: "Unable to submit request",
        description: error.message || "Please try again or call our office directly.",
        variant: "destructive",
      });
    },
  });

  const onSubmit = (values: AppointmentFormValues) => {
    setSubmission(null);
    appointmentMutation.mutate(values);
  };

  return (
    <div className="pt-16 pb-20 bg-white">
      <section className="relative overflow-hidden py-20 lg:py-28">
        <HeroBackdrop variant="warm" />
        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center">
            <h1 className="text-4xl lg:text-5xl font-bold text-gray-800 mb-6">
              Book Your Appointment
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
          <section className="bg-gray-50 rounded-2xl p-6 sm:p-8 shadow-sm border border-gray-100">
            <h2 className="text-2xl font-bold text-gray-800 mb-3">Appointment Request Form</h2>
            <p className="text-gray-600 mb-6">
              Complete the form below and our team will reach out quickly to finalize your appointment.
            </p>

            {submission?.delivered ? (
              <div className="mb-6 rounded-xl border border-emerald-200 bg-emerald-50 p-4">
                <p className="font-semibold text-emerald-800">Appointment request received.</p>
                <p className="text-emerald-700 text-sm mt-1">
                  Thank you. We will contact you soon to confirm your date and time.
                </p>
              </div>
            ) : null}

            {submission && !submission.delivered ? (
              <div className="mb-6 rounded-xl border border-amber-200 bg-amber-50 p-4">
                <p className="font-semibold text-amber-900">Request saved with backup notice.</p>
                <p className="text-amber-800 text-sm mt-1">
                  {submission.fallbackMessage ||
                    "Your request was saved, but online delivery is delayed."}
                </p>
                <p className="text-amber-900 text-sm mt-2">
                  Please call us now at{" "}
                  <a href={officePhoneHref} className="font-semibold underline">
                    {officePhone}
                  </a>{" "}
                  so we can prioritize your appointment.
                </p>
              </div>
            ) : null}

            <Form {...form}>
              <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
                <input
                  type="text"
                  tabIndex={-1}
                  autoComplete="off"
                  aria-hidden="true"
                  className="hidden"
                  {...form.register("company")}
                />

                <div className="grid gap-4 sm:grid-cols-2">
                  <FormField
                    control={form.control}
                    name="firstName"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>First Name *</FormLabel>
                        <FormControl>
                          <Input {...field} autoComplete="given-name" />
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
                          <Input {...field} autoComplete="family-name" />
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
                        <Input type="email" autoComplete="email" {...field} />
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
                        <Input type="tel" autoComplete="tel" {...field} />
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
                          {appointmentServiceOptions.map((service) => (
                            <SelectItem key={service.value} value={service.value}>
                              {service.label}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
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
                        <FormLabel>Preferred Date *</FormLabel>
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
                        <FormLabel>Preferred Time *</FormLabel>
                        <FormControl>
                          <Input type="time" {...field} />
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
                          placeholder="Tell us anything helpful before your visit."
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

                <Button
                  type="submit"
                  className="w-full bg-primary text-primary-foreground hover:bg-primary/90 py-3 text-base font-semibold"
                  disabled={appointmentMutation.isPending}
                >
                  {appointmentMutation.isPending ? "Submitting..." : "Request Appointment"}
                </Button>
              </form>
            </Form>
          </section>

          <aside className="space-y-6">
            <div className="rounded-2xl border border-primary/20 bg-primary/5 p-6">
              <h3 className="text-xl font-bold text-gray-800 mb-4">What Happens Next</h3>
              <ul className="space-y-4 text-gray-700">
                <li className="flex items-start">
                  <Calendar className="h-5 w-5 text-primary mt-0.5 mr-3 flex-shrink-0" />
                  We review your preferred date and service details.
                </li>
                <li className="flex items-start">
                  <Clock3 className="h-5 w-5 text-primary mt-0.5 mr-3 flex-shrink-0" />
                  Our team contacts you to confirm the best appointment time.
                </li>
                <li className="flex items-start">
                  <CalendarCheck2 className="h-5 w-5 text-primary mt-0.5 mr-3 flex-shrink-0" />
                  You receive a confirmed visit plan and arrival instructions.
                </li>
              </ul>
            </div>

            <div className="rounded-2xl border border-gray-200 bg-white p-6 shadow-sm">
              <h3 className="text-xl font-bold text-gray-800 mb-4">Need Immediate Help?</h3>
              <p className="text-gray-600 mb-4">
                For urgent concerns or same-day availability, call our office directly.
              </p>
              <a
                href={officePhoneHref}
                className="inline-flex items-center text-primary font-semibold hover:text-primary/80 transition-colors"
              >
                <Phone className="h-4 w-4 mr-2" />
                {officePhone}
              </a>
            </div>

            <div className="rounded-2xl border border-secondary/20 bg-secondary/5 p-6">
              <h3 className="text-xl font-bold text-gray-800 mb-3">Privacy & Security</h3>
              <p className="text-gray-700 flex items-start">
                <ShieldCheck className="h-5 w-5 text-secondary mt-0.5 mr-3 flex-shrink-0" />
                Your request is securely saved for our team and reviewed promptly.
              </p>
            </div>
          </aside>
        </div>
      </div>
    </div>
  );
}
