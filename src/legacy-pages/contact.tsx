"use client";


import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { MapPin, Phone, Mail, Clock, Facebook, Instagram } from "lucide-react";
import { Link } from "wouter";
import { useToast } from "@/hooks/use-toast";
import { insertContactSchema, type InsertContact } from "@/server/schema";
import { apiRequest } from "@/lib/queryClient";
import HeroBackdrop from "@/components/brand/HeroBackdrop";
import PageBreadcrumbs from "@/components/navigation/PageBreadcrumbs";

type ContactFormValues = InsertContact;

export default function Contact() {
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const form = useForm<ContactFormValues>({
    resolver: zodResolver(insertContactSchema),
    defaultValues: {
      firstName: "",
      lastName: "",
      email: "",
      phone: "",
      service: "",
      message: "",
    },
  });

  const contactMutation = useMutation({
    mutationFn: async (values: ContactFormValues) => {
      return apiRequest("POST", "/api/contacts", values);
    },
    onSuccess: () => {
      toast({
        title: "Message sent successfully!",
        description: "Thank you for contacting us. We will get back to you soon.",
      });
      form.reset();
    },
    onError: (error: any) => {
      toast({
        title: "Error sending message",
        description: error.message || "Please try again later.",
        variant: "destructive",
      });
    },
  });

  const onSubmit = (values: ContactFormValues) => {
    contactMutation.mutate(values);
  };

  return (
    <div className="pt-16 pb-20 bg-white">
      {/* Hero Section */}
      <section className="relative overflow-hidden py-20 lg:py-32">
        <HeroBackdrop variant="default" />
        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center">
            <h1 className="text-4xl lg:text-5xl font-bold text-gray-800 mb-6">Contact Us</h1>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto">Ready to schedule your appointment? We're here to help and answer any questions you may have.</p>
          </div>
        </div>
      </section>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20">
        <PageBreadcrumbs items={[{ label: "Home", href: "/" }, { label: "Contact" }]} />
        
        <div className="grid lg:grid-cols-2 gap-12">
          {/* Contact Information */}
          <div>
            <div className="bg-gradient-to-br from-primary/10 to-secondary/10 rounded-2xl p-8 mb-8">
              <h2 className="text-2xl font-bold text-gray-800 mb-6">Get in Touch</h2>
              <div className="space-y-6">
                <div className="flex items-start">
                  <div className="bg-primary text-white w-12 h-12 rounded-full flex items-center justify-center mr-4 mt-1">
                    <MapPin className="h-5 w-5" />
                  </div>
                  <div>
                    <h3 className="font-semibold text-gray-800 mb-1">Our Location</h3>
                    <p className="text-gray-600">15251 National Ave, Suite 102<br />Los Gatos, CA 95032</p>
                    <a
                      href="https://www.google.com/maps/search/?api=1&query=15251+National+Ave+Suite+102+Los+Gatos+CA+95032"
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-sm font-semibold text-primary hover:text-primary/80 transition-colors inline-block mt-2"
                    >
                      Get Directions
                    </a>
                  </div>
                </div>
                
                <div className="flex items-start">
                  <div className="bg-secondary text-white w-12 h-12 rounded-full flex items-center justify-center mr-4 mt-1">
                    <Phone className="h-5 w-5" />
                  </div>
                  <div>
                    <h3 className="font-semibold text-gray-800 mb-1">Phone Number</h3>
                    <p className="text-gray-600">(408) 358-8100</p>
                  </div>
                </div>
                
                <div className="flex items-start">
                  <div className="bg-accent text-white w-12 h-12 rounded-full flex items-center justify-center mr-4 mt-1">
                    <Mail className="h-5 w-5" />
                  </div>
                  <div>
                    <h3 className="font-semibold text-gray-800 mb-1">Email Address</h3>
                    <p className="text-gray-600">hello@famfirstsmile.com</p>
                  </div>
                </div>
                
                <div className="flex items-start">
                  <div className="bg-primary text-white w-12 h-12 rounded-full flex items-center justify-center mr-4 mt-1">
                    <Clock className="h-5 w-5" />
                  </div>
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
              <div className="flex justify-center space-x-4">
                <a 
                  href="https://www.facebook.com/famfirstsmile/" 
                  target="_blank" 
                  rel="noopener noreferrer"
                  className="bg-blue-600 text-white w-12 h-12 rounded-full flex items-center justify-center hover:bg-blue-700 transition-colors" 
                  aria-label="Visit our Facebook page"
                >
                  <Facebook className="h-6 w-6" />
                </a>
                <a 
                  href="https://www.instagram.com/famfirstsmile/" 
                  target="_blank" 
                  rel="noopener noreferrer"
                  className="bg-pink-600 text-white w-12 h-12 rounded-full flex items-center justify-center hover:bg-pink-700 transition-colors" 
                  aria-label="Visit our Instagram page"
                >
                  <Instagram className="h-6 w-6" />
                </a>
              </div>
            </div>

            <div className="mt-10 bg-gray-50 rounded-2xl p-6">
              <h3 className="text-lg font-semibold text-gray-800 mb-4">Explore</h3>
              <div className="grid grid-cols-2 gap-3 text-sm">
                <Link href="/services" className="text-primary font-semibold hover:text-primary/80 transition-colors">
                  Services
                </Link>
                <Link href="/patient-info" className="text-primary font-semibold hover:text-primary/80 transition-colors">
                  Patient Info
                </Link>
                <Link href="/services/invisalign" className="text-primary font-semibold hover:text-primary/80 transition-colors">
                  Invisalign
                </Link>
                <Link href="/tmj" className="text-primary font-semibold hover:text-primary/80 transition-colors">
                  TMJ Treatment
                </Link>
                <Link href="/technology/itero-digital-scanner" className="text-primary font-semibold hover:text-primary/80 transition-colors">
                  iTero Scanner
                </Link>
                <Link href="/team" className="text-primary font-semibold hover:text-primary/80 transition-colors">
                  Our Team
                </Link>
              </div>
            </div>
          </div>
          
          {/* Contact Form */}
          <div>
            <div className="bg-gray-50 rounded-2xl p-8">
              <h2 className="text-2xl font-bold text-gray-800 mb-6">Send Us a Message</h2>
              <Form {...form}>
                <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
                  <div className="grid md:grid-cols-2 gap-4">
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
                        <FormLabel>Email Address *</FormLabel>
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
                        <FormLabel>Phone Number</FormLabel>
                        <FormControl>
                          <Input type="tel" autoComplete="tel" {...field} value={field.value ?? ""} />
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
                            <SelectItem value="general-checkup">General Checkup & Cleaning</SelectItem>
                            <SelectItem value="children-dentistry">Children's Dentistry</SelectItem>
                            <SelectItem value="invisalign">Invisalign Consultation</SelectItem>
                            <SelectItem value="emergency">Emergency Care</SelectItem>
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
                            placeholder="Tell us about your dental concerns or questions..."
                            {...field}
                            value={field.value ?? ""}
                          />
                        </FormControl>
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
          <h2 className="text-2xl font-bold text-gray-800 mb-8 text-center">Find Us</h2>
          <div className="bg-white rounded-2xl overflow-hidden shadow-xl">
            {/* Map Container */}
            <div className="relative h-[500px]">
              <iframe
                src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d3174.8858269999997!2d-121.95269418469015!3d37.24628897985869!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x808e3557c7180047%3A0xb2c0297c5d5ef4e8!2sTim%20J%20Chuang%2C%20DDS%20-%20Family%20First%20Smile%20Care!5e0!3m2!1sen!2sus!4v1735847521234!5m2!1sen!2sus"
                width="100%"
                height="100%"
                style={{ border: 0 }}
                allowFullScreen
                loading="lazy"
                referrerPolicy="no-referrer-when-downgrade"
                title="Family First Smile Care Location"
                className="absolute inset-0"
              />
            </div>
            {/* Info Bar */}
            <div className="bg-gradient-to-r from-primary to-secondary p-6">
              <div className="flex flex-col md:flex-row items-center justify-between gap-4">
                <div className="text-white text-center md:text-left">
                  <h3 className="font-semibold text-lg mb-1">Family First Smile Care</h3>
                  <p className="text-white">15251 National Ave, Suite 102, Los Gatos, CA 95032</p>
                </div>
                <div className="flex gap-3">
                  <a 
                    href="https://www.google.com/maps/dir/?api=1&destination=Tim+J+Chuang+DDS+Family+First+Smile+Care+15251+National+Ave+Suite+102+Los+Gatos+CA+95032" 
                    target="_blank" 
                    rel="noopener noreferrer"
                    className="bg-white text-primary px-6 py-2 rounded-lg hover:bg-gray-100 transition-colors font-semibold flex items-center gap-2"
                  >
                    <MapPin className="h-4 w-4" />
                    Get Directions
                  </a>
                  <a 
                    href="tel:4083588100"
                    className="bg-white/5 backdrop-blur text-white px-6 py-2 rounded-lg hover:bg-white hover:text-primary transition-colors font-semibold flex items-center gap-2 border border-white/25"
                  >
                    <Phone className="h-4 w-4" />
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
