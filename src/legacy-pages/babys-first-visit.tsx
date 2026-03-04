"use client";

import type { MouseEvent } from "react";
import { useEffect } from "react";
import { Link } from "wouter";
import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogTrigger } from "@/components/ui/dialog";
import { Baby, Shield, Sparkles, Heart, NotebookPen, PhoneCall, Smile, Star, MapPin, Phone, BookOpen, Expand } from "lucide-react";
import { APPOINTMENT_FORM_URL, triggerGoogleAdsConversion } from "@/lib/analytics";
import { Carousel, CarouselContent, CarouselItem, CarouselNext, CarouselPrevious } from "@/components/ui/carousel";
import PageBreadcrumbs from "@/components/navigation/PageBreadcrumbs";
import RelatedLinksSection from "@/components/navigation/RelatedLinksSection";
import type { RelatedLink } from "@/lib/internal-links";

const fadeInUp = {
  hidden: { opacity: 0, y: 24 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.5, ease: "easeOut" } }
};

const scaleIn = {
  hidden: { opacity: 0, scale: 0.97 },
  visible: { opacity: 1, scale: 1, transition: { duration: 0.45, ease: "easeOut" } }
};

export default function BabysFirstVisit() {
  const handleAppointmentClick = (event: MouseEvent<HTMLAnchorElement>) => {
    event.preventDefault();
    triggerGoogleAdsConversion(APPOINTMENT_FORM_URL, "_blank");
  };

  // Ensure the Instagram embed script is available when the page loads
  useEffect(() => {
    const existing = document.getElementById("instagram-embed-script");
    if (existing) {
      // Trigger a reparse of embeds if script already loaded
      // @ts-expect-error instagram global is injected by the script
      window.instgrm?.Embeds?.process?.();
      return;
    }

    const script = document.createElement("script");
    script.id = "instagram-embed-script";
    script.src = "https://www.instagram.com/embed.js";
    script.async = true;
    document.body.appendChild(script);
  }, []);

  const visitPhotos = [
    {
      src: "https://res.cloudinary.com/dhqpqfw6w/image/upload/v1763743366/Screenshot_2025-11-21_at_8.40.28_AM_bwdpts.webp",
      title: "Exam in Mom/Dad's lap (part 1)",
      description: "We keep your child in the comfort of your lap while introducing the space."
    },
    {
      src: "https://res.cloudinary.com/dhqpqfw6w/image/upload/v1763743366/Screenshot_2025-11-21_at_8.40.51_AM_rtvz7a.webp",
      title: "Exam in Mom/Dad's lap (part 2)",
      description: "A quick look at teeth, gums, and frenums with gentle pacing."
    },
    {
      src: "https://res.cloudinary.com/dhqpqfw6w/image/upload/v1763743367/Screenshot_2025-11-21_at_8.40.56_AM_tonxf1.webp",
      title: "Toothbrush cleaning",
      description: "Soft-bristle brushing to prepare for future cleanings."
    },
    {
      src: "https://res.cloudinary.com/dhqpqfw6w/image/upload/v1763743366/Screenshot_2025-11-21_at_8.40.38_AM_fkyaat.webp",
      title: "High fives and smiles",
      description: "Celebrating little wins so the first visit stays positive."
    }
  ];

  const infographicUrl = "https://res.cloudinary.com/dhqpqfw6w/image/upload/v1763745802/Generated_Image_November_21_2025_-_9_22AM_hbuzza.webp";

  const relatedLinks: RelatedLink[] = [
    {
      href: "/services/children-dentistry",
      title: "Children's Dentistry",
      description: "Gentle, kid-friendly care that builds lifelong healthy habits.",
    },
    {
      href: "/patient-info",
      title: "Patient Information",
      description: "FAQs, what to expect, and helpful resources for your visit.",
    },
    {
      href: "/patient-info/brushing",
      title: "How to Brush Properly",
      description: "Age-based brushing tips to protect enamel and gums.",
    },
    {
      href: "/patient-info/nutrition",
      title: "Nutrition for Healthy Teeth",
      description: "Tooth-friendly snack ideas and habits for little smiles.",
    },
    {
      href: "/contact",
      title: "Contact & Scheduling",
      description: "Ask a question, request an appointment, or get directions.",
    },
    {
      href: "/team",
      title: "Meet Our Team",
      description: "Get to know Dr. Chuang and our caring staff.",
    },
  ];

  return (
    <div className="pt-16 pb-20 bg-white">

      {/* Hero */}
      <section className="relative overflow-hidden bg-gradient-to-r from-primary/5 via-secondary/5 to-primary/10 py-16 lg:py-24">
        <div className="absolute inset-0 opacity-30" style={{
          backgroundImage: `url("data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' fill-rule='evenodd'%3E%3Cg fill='%230066CC' fill-opacity='0.06'%3E%3Ccircle cx='30' cy='30' r='2'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E")`
        }}></div>
        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid lg:grid-cols-2 gap-10 items-center">
            <motion.div
              initial="hidden"
              whileInView="visible"
              viewport={{ once: true, margin: "-80px" }}
              variants={fadeInUp}
            >
              <div className="inline-flex items-center bg-white shadow-md rounded-full px-4 py-2 text-sm font-semibold text-secondary mb-4">
                <Baby className="w-4 h-4 mr-2" />
                Children&apos;s Dentistry
              </div>
              <h1 className="text-4xl lg:text-5xl font-bold text-gray-800 leading-tight mb-4">Baby&apos;s First Dental Visit in Los Gatos, CA</h1>
              <p className="text-lg text-gray-700 leading-relaxed mb-6 max-w-2xl">
                A gentle, positive introduction to lifelong oral health. The American Academy of Pediatric Dentistry recommends seeing a dentist by age 1 or within six months of the first tooth.
              </p>
              <p className="text-base text-gray-600 leading-relaxed mb-6 max-w-2xl">
                We make first visits simple, calm, and fun so babies and parents feel at ease.
              </p>
              <div className="flex flex-col sm:flex-row gap-4">
                <Button asChild className="w-full sm:w-auto bg-primary text-primary-foreground hover:bg-primary/90">
                  <a
                    href={APPOINTMENT_FORM_URL}
                    target="_blank"
                    rel="noopener noreferrer"
                    onClick={handleAppointmentClick}
                  >
                    Schedule Baby&apos;s First Visit
                  </a>
                </Button>
                <Button
                  asChild
                  variant="outline"
                  className="w-full sm:w-auto border-primary text-primary hover:bg-primary/5"
                >
                  <Link href="/patient-info">First Visit Checklist</Link>
                </Button>
              </div>
              <div className="flex flex-wrap gap-4 mt-6 text-sm text-gray-600">
                <div className="flex items-center">
                  <Shield className="w-4 h-4 text-primary mr-2" />
                  Gentle, board-certified care
                </div>
                <div className="flex items-center">
                  <Sparkles className="w-4 h-4 text-secondary mr-2" />
                  Calm, kid-friendly rooms
                </div>
                <div className="flex items-center">
                  <Heart className="w-4 h-4 text-primary mr-2" />
                  Parents welcome chairside
                </div>
              </div>
            </motion.div>
            <motion.div
              className="relative"
              initial="hidden"
              whileInView="visible"
              viewport={{ once: true, margin: "-60px" }}
              variants={scaleIn}
            >
              <div className="bg-white border border-primary/15 rounded-3xl shadow-xl p-8">
                <div className="flex items-center justify-between mb-4">
                  <div className="flex items-center">
                    <div className="bg-primary text-white rounded-2xl w-12 h-12 flex items-center justify-center mr-3">
                      <Smile className="w-6 h-6" />
                    </div>
                    <div>
                      <h3 className="font-semibold text-gray-800">A calm, playful start</h3>
                      <p className="text-sm text-gray-600">Short, age-tailored appointments</p>
                    </div>
                  </div>
                  <Star className="w-5 h-5 text-secondary" />
                </div>
                <div className="grid sm:grid-cols-2 gap-4">
                  <div className="bg-gradient-to-br from-primary/5 to-white rounded-2xl p-4 border border-primary/10">
                    <p className="text-xs uppercase text-primary font-semibold mb-1">Visit length</p>
                    <p className="text-lg font-bold text-gray-800">30-45 minutes</p>
                    <p className="text-sm text-gray-600 mt-2">We go at your child&apos;s pace with breaks as needed.</p>
                  </div>
                  <div className="bg-gradient-to-br from-secondary/5 to-white rounded-2xl p-4 border border-secondary/10">
                    <p className="text-xs uppercase text-secondary font-semibold mb-1">Parent role</p>
                    <p className="text-lg font-bold text-gray-800">Stay involved</p>
                    <p className="text-sm text-gray-600 mt-2">Hold hands, ask questions, and help keep things familiar.</p>
                  </div>
                  <div className="bg-gradient-to-br from-accent/5 to-white rounded-2xl p-4 border border-accent/10 sm:col-span-2">
                    <p className="text-xs uppercase text-accent font-semibold mb-1">Take-home plan</p>
                    <p className="text-sm text-gray-700">Customized tips on brushing, teething comfort, feeding routines, and pacifier use.</p>
                  </div>
                </div>
              </div>
            </motion.div>
          </div>
        </div>
      </section>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16 space-y-16">
        <PageBreadcrumbs
          items={[
            { label: "Home", href: "/" },
            { label: "Services", href: "/services" },
            { label: "Children's Dentistry", href: "/services/children-dentistry" },
            { label: "Baby's First Visit" },
          ]}
        />

        {/* Photo carousel */}
        <motion.section
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, margin: "-80px" }}
          variants={fadeInUp}
        >
          <div className="bg-white border border-gray-200 rounded-3xl shadow-sm p-8 lg:p-12">
            <div className="flex justify-between items-center flex-wrap gap-4 mb-6">
              <div>
                <h2 className="text-3xl font-bold text-gray-800">Baby visit, step by step</h2>
                <p className="text-gray-700">Real moments from exams, cleanings, and the smiles that follow.</p>
              </div>
              <div className="text-sm text-gray-600">
                Swipe or use arrows to explore
              </div>
            </div>
            <Carousel className="relative">
              <CarouselContent>
                {visitPhotos.map((photo) => (
                  <CarouselItem key={photo.src}>
                    <div className="grid lg:grid-cols-[1.5fr,1fr] gap-6 items-center">
                      <div className="overflow-hidden rounded-2xl border border-gray-200 shadow-sm">
                        <img
                          src={photo.src}
                          alt={photo.title}
                          className="w-full h-full object-cover"
                          loading="lazy"
                        />
                      </div>
                      <div className="space-y-3">
                        <p className="inline-flex items-center text-sm uppercase font-semibold text-secondary bg-secondary/10 px-3 py-1 rounded-full w-fit">
                          {photo.title}
                        </p>
                        <p className="text-gray-700 text-lg leading-relaxed">{photo.description}</p>
                        <p className="text-sm text-gray-600">We keep parents close, follow your child&apos;s cues, and celebrate every small win.</p>
                      </div>
                    </div>
                  </CarouselItem>
                ))}
              </CarouselContent>
              <CarouselPrevious className="bg-white shadow-lg border border-gray-200 hover:border-primary" />
              <CarouselNext className="bg-white shadow-lg border border-gray-200 hover:border-primary" />
            </Carousel>
          </div>
        </motion.section>

        {/* Why start early */}
        <motion.section
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, margin: "-80px" }}
          variants={fadeInUp}
        >
          <div className="bg-white border border-gray-200 rounded-3xl shadow-sm p-8 lg:p-12">
            <h2 className="text-3xl font-bold text-gray-800 mb-4">Why Your Baby Should See a Dentist Before Age One</h2>
            <p className="text-lg text-gray-700 mb-6">
              Early visits aren&apos;t about fixing teeth - they&apos;re about strong foundations, healthy habits, and catching issues early.
            </p>
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
              {[
                "Helps your baby feel comfortable with the dental environment",
                "Ensures teeth and jaw are developing normally",
                "Allows us to spot early signs of cavities or oral habits that may cause problems later",
                "Gives parents personalized guidance for brushing, nutrition, pacifiers, and teething",
                "Builds a long-term positive relationship with dental care (less anxiety later)",
              ].map((benefit) => (
                <div key={benefit} className="flex items-start bg-gradient-to-r from-primary/5 to-secondary/5 rounded-2xl p-4">
                  <Shield className="w-5 h-5 text-primary mr-3 mt-0.5" />
                  <p className="text-gray-700">{benefit}</p>
                </div>
              ))}
            </div>
          </div>
        </motion.section>

        {/* Infographic */}
        <motion.section
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, margin: "-80px" }}
          variants={fadeInUp}
        >
          <Dialog>
            <div className="bg-white border border-gray-200 rounded-3xl shadow-sm p-8 lg:p-12">
              <div className="flex items-start justify-between gap-4 flex-wrap mb-6">
                <div className="max-w-3xl">
                  <h2 className="text-3xl font-bold text-gray-800">Baby&apos;s first visit at a glance</h2>
                  <p className="text-gray-700 mt-2">A quick visual roadmap so you and your little one know exactly how the appointment flows.</p>
                </div>
                <DialogTrigger asChild>
                  <Button variant="outline" className="border-primary text-primary hover:bg-primary/5">
                    <Expand className="w-4 h-4 mr-2" />
                    Open full screen
                  </Button>
                </DialogTrigger>
              </div>
              <div className="grid lg:grid-cols-[1.4fr,1fr] gap-6 items-start">
                <DialogTrigger asChild>
                  <button
                    type="button"
                    className="group relative w-full overflow-hidden rounded-2xl border border-gray-200 shadow-sm focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2"
                  >
                    <div className="absolute inset-0 bg-gradient-to-t from-black/30 via-black/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity"></div>
                    <img
                      src={infographicUrl}
                      alt="Baby&apos;s first dental visit infographic"
                      className="w-full h-full object-cover bg-gray-50"
                      loading="lazy"
                    />
                    <div className="absolute bottom-4 left-4 flex items-center gap-2 text-white font-semibold drop-shadow">
                      <Expand className="w-5 h-5" />
                      <span>Tap to view full screen</span>
                    </div>
                  </button>
                </DialogTrigger>
                <div className="space-y-4">
                  <div className="flex items-start gap-3">
                    <Sparkles className="w-5 h-5 text-secondary mt-0.5" />
                    <p className="text-gray-700">
                      Timeline of the visit, from lap exam to the toothbrush cleaning, so you know what comes next.
                    </p>
                  </div>
                  <div className="flex items-start gap-3">
                    <Shield className="w-5 h-5 text-primary mt-0.5" />
                    <p className="text-gray-700">
                      Gentle comfort cues and safety steps we follow for babies and toddlers.
                    </p>
                  </div>
                  <div className="flex items-start gap-3">
                    <Heart className="w-5 h-5 text-secondary mt-0.5" />
                    <p className="text-gray-700">
                      Parent tips called out visually for quick prep before your appointment.
                    </p>
                  </div>
                  <p className="text-sm text-gray-600">
                    Click anywhere on the graphic or use the button to open it in a full-screen viewer.
                  </p>
                </div>
              </div>
            </div>
            <DialogContent className="max-w-6xl w-[95vw] max-h-[90vh] p-0 bg-transparent border-none shadow-none">
              <div className="w-full h-full flex items-center justify-center">
                <img
                  src={infographicUrl}
                  alt="Baby&apos;s first dental visit infographic full view"
                  className="max-h-[85vh] w-auto max-w-full rounded-2xl shadow-2xl"
                />
              </div>
            </DialogContent>
          </Dialog>
        </motion.section>

        {/* What to expect */}
        <motion.section
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, margin: "-80px" }}
          variants={fadeInUp}
        >
          <div className="bg-gradient-to-br from-primary/5 to-secondary/10 rounded-3xl p-8 lg:p-12 border border-primary/10 space-y-6">
            <div className="flex items-center gap-3">
              <div className="bg-primary text-white rounded-full w-12 h-12 flex items-center justify-center">
                <Sparkles className="w-6 h-6" />
              </div>
              <div>
                <p className="text-sm uppercase text-primary font-semibold">What to expect</p>
                <h2 className="text-3xl font-bold text-gray-800">Step-by-step comfort</h2>
              </div>
            </div>
            <div className="grid lg:grid-cols-3 gap-6">
              <div className="bg-white rounded-2xl p-5 shadow-sm border border-white/60">
                <div className="text-sm font-semibold text-primary mb-2">1. Warm welcome & getting comfortable</div>
                <p className="text-gray-700 leading-relaxed">
                  We start by letting your baby explore the environment - lights, colors, tools, and sounds - at their own pace. Familiarity before anything clinical.
                </p>
              </div>
              <div className="bg-white rounded-2xl p-5 shadow-sm border border-white/60">
                <div className="text-sm font-semibold text-primary mb-2">2. Quick growth & development exam</div>
                <ul className="text-gray-700 text-sm space-y-2 list-disc pl-4">
                  <li>How the teeth are erupting</li>
                  <li>Gum health</li>
                  <li>Tongue, lips, and frenulum</li>
                  <li>Bite alignment and jaw development</li>
                  <li>Early signs of decay or enamel issues</li>
                </ul>
                <p className="text-gray-600 text-sm mt-2">This exam is brief - usually just a couple minutes.</p>
              </div>
              <div className="bg-white rounded-2xl p-5 shadow-sm border border-white/60">
                <div className="text-sm font-semibold text-primary mb-2">3. Soft toothbrush cleaning</div>
                <p className="text-gray-700 leading-relaxed">
                  We use a soft infant toothbrush to lightly clean the teeth and gums. It preps your child for future cleanings and builds the routine early.
                </p>
              </div>
            </div>
            <div className="grid lg:grid-cols-2 gap-6">
              <div className="bg-white rounded-2xl p-5 shadow-sm border border-white/60">
                <div className="text-sm font-semibold text-primary mb-2">4. Parent education & Q&amp;A</div>
                <ul className="text-gray-700 text-sm space-y-2 list-disc pl-4">
                  <li>How to brush effectively (and how often)</li>
                  <li>Fluoride use and safety</li>
                  <li>Teething guidance</li>
                  <li>Thumb sucking and pacifier habits</li>
                  <li>Diet tips to prevent early childhood cavities</li>
                  <li>When to schedule the next visit</li>
                </ul>
                <p className="text-gray-600 text-sm mt-2">Parents always leave feeling more confident.</p>
              </div>
              <div className="bg-white rounded-2xl p-5 shadow-sm border border-white/60">
                <div className="text-sm font-semibold text-primary mb-2">5. Keep it fun & positive</div>
                <p className="text-gray-700 leading-relaxed">
                  The visit is intentionally quick, calm, and playful - stickers, smiles, and gentle encouragement so your child leaves feeling safe and happy.
                </p>
              </div>
            </div>
          </div>
        </motion.section>

        {/* Message from Dr */}
        <motion.section
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, margin: "-80px" }}
          variants={fadeInUp}
        >
          <div className="bg-white border border-gray-200 rounded-3xl shadow-sm p-6 sm:p-8 lg:p-12 space-y-8">
            <div className="flex items-center gap-3">
              <Smile className="w-6 h-6 text-primary" />
              <h2 className="text-3xl font-bold text-gray-800">A Message From Dr. Tim J. Chuang</h2>
            </div>
            <div className="grid gap-6 lg:gap-8 lg:grid-cols-2 items-start">
              <div className="bg-gradient-to-br from-primary/5 via-white to-secondary/10 border border-primary/10 rounded-2xl p-3 sm:p-4 shadow-md w-full max-w-xl mx-auto lg:mx-0">
                <div className="relative w-full overflow-hidden rounded-xl border border-white shadow-sm mx-auto max-w-[540px]">
                  <blockquote
                    className="instagram-media"
                    data-instgrm-captioned
                    data-instgrm-permalink="https://www.instagram.com/reel/DNrGJb4ZMXi/?utm_source=ig_embed&amp;utm_campaign=loading"
                    data-instgrm-version="14"
                  >
                    <a href="https://www.instagram.com/reel/DNrGJb4ZMXi/?utm_source=ig_embed&amp;utm_campaign=loading" target="_blank" rel="noreferrer">
                      View this post on Instagram
                    </a>
                  </blockquote>
                </div>
              </div>
              <div className="bg-gradient-to-br from-primary/5 via-white to-secondary/10 border border-primary/10 rounded-2xl p-3 sm:p-4 shadow-md w-full max-w-xl mx-auto lg:mx-0">
                <div className="relative w-full overflow-hidden rounded-xl border border-white shadow-sm mx-auto max-w-[540px]">
                  <blockquote
                    className="instagram-media"
                    data-instgrm-captioned
                    data-instgrm-permalink="https://www.instagram.com/reel/DE8HuqhStM9/?utm_source=ig_embed&amp;utm_campaign=loading"
                    data-instgrm-version="14"
                  >
                    <a href="https://www.instagram.com/reel/DE8HuqhStM9/?utm_source=ig_embed&amp;utm_campaign=loading" target="_blank" rel="noreferrer">
                      View this post on Instagram
                    </a>
                  </blockquote>
                </div>
              </div>
            </div>
          </div>
        </motion.section>

        {/* How to prepare & comfort */}
        <motion.section
          className="grid lg:grid-cols-2 gap-10 items-start"
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, margin: "-80px" }}
          variants={fadeInUp}
        >
          <div className="bg-white border border-gray-200 rounded-3xl p-8 shadow-sm">
            <div className="flex items-center mb-4">
              <NotebookPen className="w-6 h-6 text-primary mr-3" />
              <h2 className="text-2xl font-bold text-gray-800">How to Prepare for Your Baby&apos;s First Visit</h2>
            </div>
            <ul className="space-y-3 text-gray-600">
              <li className="flex items-start">
                <Sparkles className="w-5 h-5 text-secondary mr-3 flex-shrink-0 mt-0.5" />
                Schedule when your baby is usually well-rested
              </li>
              <li className="flex items-start">
                <Sparkles className="w-5 h-5 text-secondary mr-3 flex-shrink-0 mt-0.5" />
                Bring a favorite comfort item (toy, blanket, pacifier)
              </li>
              <li className="flex items-start">
                <Sparkles className="w-5 h-5 text-secondary mr-3 flex-shrink-0 mt-0.5" />
                Feed them lightly beforehand and brush teeth/gums that morning
              </li>
              <li className="flex items-start">
                <Sparkles className="w-5 h-5 text-secondary mr-3 flex-shrink-0 mt-0.5" />
                Write down questions about teething, habits, or development
              </li>
            </ul>
            <p className="text-gray-600 mt-4">We tailor the visit to your child&apos;s temperament - no pressure, no rush.</p>
          </div>
          <div className="bg-gradient-to-br from-primary/10 via-white to-secondary/10 rounded-3xl p-8 border border-primary/10 shadow-sm">
            <div className="flex items-center mb-4">
              <Shield className="w-6 h-6 text-primary mr-3" />
              <h2 className="text-2xl font-bold text-gray-800">Comfort & safety promises</h2>
            </div>
            <div className="grid sm:grid-cols-2 gap-4">
              {[
                "Tell-show-do pacing with plenty of breaks",
                "Flavor options for fluoride and polishing when appropriate",
                "Nitrous available for older pediatric visits when indicated",
                "Latex-free environment and age-appropriate tools",
              ].map((item) => (
                <div key={item} className="bg-white/70 rounded-2xl p-4 border border-white">
                  <div className="flex items-start">
                    <Heart className="w-5 h-5 text-secondary mr-2 mt-0.5" />
                    <p className="text-gray-700 text-sm">{item}</p>
                  </div>
                </div>
              ))}
            </div>
            <div className="mt-6 flex items-center text-gray-700">
              <PhoneCall className="w-5 h-5 text-primary mr-3" />
              Call us at (408) 358-8100 if you would like to discuss feeding challenges or special accommodations ahead of time.
            </div>
          </div>
        </motion.section>

        {/* Common questions */}
        <motion.section
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, margin: "-80px" }}
          variants={fadeInUp}
        >
          <div className="bg-white border border-gray-200 rounded-3xl shadow-sm p-8 lg:p-12 space-y-6">
            <div className="flex items-center gap-3">
              <BookOpen className="w-6 h-6 text-primary" />
              <h2 className="text-3xl font-bold text-gray-800">Common Questions Parents Ask</h2>
            </div>
            <div className="grid md:grid-cols-2 gap-6">
              <div className="p-5 rounded-2xl border border-gray-100 bg-gradient-to-r from-primary/5 to-white">
                <h3 className="font-semibold text-gray-800 mb-2">When should I bring my baby to the dentist?</h3>
                <p className="text-gray-700">Before their first birthday or when the first tooth erupts.</p>
              </div>
              <div className="p-5 rounded-2xl border border-gray-100 bg-gradient-to-r from-secondary/5 to-white">
                <h3 className="font-semibold text-gray-800 mb-2">What if my baby cries?</h3>
                <p className="text-gray-700">That&apos;s completely normal. Babies cry in new environments - there&apos;s no pressure to perform.</p>
              </div>
              <div className="p-5 rounded-2xl border border-gray-100 bg-gradient-to-r from-primary/5 to-white">
                <h3 className="font-semibold text-gray-800 mb-2">Do you take children as regular patients?</h3>
                <p className="text-gray-700">Absolutely. We love helping families build healthy habits early and continue care through childhood and beyond.</p>
              </div>
              <div className="p-5 rounded-2xl border border-gray-100 bg-gradient-to-r from-secondary/5 to-white">
                <h3 className="font-semibold text-gray-800 mb-2">Will my child get fluoride?</h3>
                <p className="text-gray-700">If appropriate, Dr. Chuang may recommend a safe, gentle fluoride application to strengthen enamel.</p>
              </div>
            </div>
          </div>
        </motion.section>

        {/* Preventing cavities */}
        <motion.section
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, margin: "-80px" }}
          variants={fadeInUp}
        >
          <div className="bg-gradient-to-br from-primary/5 to-secondary/5 rounded-3xl p-8 lg:p-12 border border-primary/10">
            <h2 className="text-3xl font-bold text-gray-800 mb-4">Preventing Cavities From the Start</h2>
            <p className="text-gray-700 mb-6">Even babies can develop early childhood cavities. Here&apos;s how to protect their smile:</p>
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
              {[
                "Wipe gums after feeding",
                "Brush twice daily with a tiny smear of toothpaste",
                "Avoid putting baby to bed with milk or juice",
                "Limit frequent snacking",
                "Choose water between meals",
                "Encourage transition off bottles by age 12-18 months",
              ].map((item) => (
                <div key={item} className="flex items-start bg-white rounded-2xl p-4 shadow-sm border border-white/60">
                  <Sparkles className="w-5 h-5 text-secondary mr-3 mt-0.5" />
                  <p className="text-gray-700">{item}</p>
                </div>
              ))}
            </div>
          </div>
        </motion.section>

        {/* Office */}
        <motion.section
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, margin: "-80px" }}
          variants={fadeInUp}
        >
          <div className="bg-white border border-gray-200 rounded-3xl shadow-sm p-8 lg:p-12">
            <h2 className="text-3xl font-bold text-gray-800 mb-4">Our Office: Designed for Families</h2>
            <p className="text-gray-700 mb-6">
              Located in the heart of Los Gatos, our practice is built for comfort - warm colors, gentle lighting, and a team that loves kids.
            </p>
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
              {[
                "Calm communication and clear expectations",
                "No surprises - tell-show-do pacing",
                "Positive reinforcement and age-appropriate rewards",
                "Comfortable seating for parents chairside",
                "Easy parking and stroller access",
                "Friendly team trained to support little patients",
              ].map((item) => (
                <div key={item} className="flex items-start bg-gradient-to-r from-primary/5 to-white rounded-2xl p-4 border border-gray-100">
                  <Heart className="w-5 h-5 text-primary mr-3 mt-0.5" />
                  <p className="text-gray-700">{item}</p>
                </div>
              ))}
            </div>
          </div>
        </motion.section>

        <RelatedLinksSection title="Related Services & Resources" links={relatedLinks} />

        {/* CTA */}
        <motion.section
          className="bg-gradient-to-r from-primary to-secondary rounded-3xl p-8 lg:p-12 text-white"
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, margin: "-120px" }}
          variants={fadeInUp}
        >
          <div className="grid lg:grid-cols-[2fr,1fr] gap-8 items-center">
            <div>
              <h2 className="text-3xl font-bold mb-4">Schedule Your Baby&apos;s First Visit</h2>
              <p className="text-lg text-white/95 mb-6">
                Give your child the best start to lifelong oral health. We&apos;re honored to help your family smile with confidence.
              </p>
              <div className="flex flex-col sm:flex-row gap-4">
                <Button asChild className="w-full sm:w-auto bg-white text-primary hover:bg-gray-100 shadow-lg">
                  <a
                    href={APPOINTMENT_FORM_URL}
                    target="_blank"
                    rel="noopener noreferrer"
                    onClick={handleAppointmentClick}
                  >
                    Schedule Now
                  </a>
                </Button>
                <Button
                  asChild
                  variant="outline"
                  className="w-full sm:w-auto bg-white/5 border-white/25 text-white hover:bg-white hover:text-primary"
                >
                  <a href="tel:+14083588100">Call Us</a>
                </Button>
                <Button
                  asChild
                  variant="outline"
                  className="w-full sm:w-auto bg-white/5 border-white/25 text-white hover:bg-white hover:text-primary"
                >
                  <a
                    href="https://maps.google.com/?q=Family+First+Smile+Care+Los+Gatos"
                    target="_blank"
                    rel="noopener noreferrer"
                  >
                    Location - Los Gatos, CA
                  </a>
                </Button>
              </div>
            </div>
            <div className="bg-white/5 border border-white/25 rounded-2xl p-6 backdrop-blur">
              <div className="flex items-center mb-3">
                <Baby className="w-6 h-6 text-white mr-3" />
                <p className="text-sm font-semibold">Ages 0-3 welcome</p>
              </div>
              <ul className="space-y-3 text-sm">
                <li className="flex items-start">
                  <Sparkles className="w-4 h-4 text-white mt-0.5 mr-2" />
                  New patient appointments include parent coaching and home-care plans.
                </li>
                <li className="flex items-start">
                  <Sparkles className="w-4 h-4 text-white mt-0.5 mr-2" />
                  Same-day scheduling when available for teething concerns.
                </li>
                <li className="flex items-start">
                  <Sparkles className="w-4 h-4 text-white mt-0.5 mr-2" />
                  Convenient Los Gatos location with free parking and stroller access.
                </li>
                <li className="flex items-start">
                  <MapPin className="w-4 h-4 text-white mt-0.5 mr-2" />
                  15251 National Ave, Suite 102, Los Gatos, CA 95032
                </li>
              </ul>
              <div className="flex items-center mt-4 text-sm">
                <Phone className="w-4 h-4 text-white mr-2" />
                <span>(408) 358-8100</span>
              </div>
            </div>
          </div>
        </motion.section>
      </div>
    </div>
  );
}
