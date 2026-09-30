import { Link } from "wouter";
import { Button } from "@/components/ui/button";
import PageBreadcrumbs from "@/components/navigation/PageBreadcrumbs";
import PatientInfoFaqList from "@/components/patient-info/patient-info-faq-list";
import { PhoneLink } from "@/components/tracking/tracked-links";
import { patientGuidanceFacts } from "@/content/patient-guidance";

const popularServices = [
  {
    title: "Dental Exams",
    description: "Comprehensive checkups and early detection.",
    href: "/services/dental-exams",
  },
  {
    title: "Dental Hygiene",
    description: "Professional cleanings and gum health care.",
    href: "/services/dental-hygiene",
  },
  {
    title: "Children's Dentistry",
    description: "Gentle care for kids of all ages.",
    href: "/services/children-dentistry",
  },
  {
    title: "Baby's First Visit",
    description: "First visits for infants and toddlers.",
    href: "/services/childrens-dentistry/babys-first-visit",
  },
  {
    title: "Night Guards",
    description: "Protection for grinding and jaw tension.",
    href: "/services/night-guards",
  },
  {
    title: "TMJ Treatment",
    description: "Care for jaw pain and dysfunction.",
    href: "/tmj",
  },
];

export default function PatientInfo() {

  return (
    <div className="pt-16 pb-20 bg-gray-50">
      {/* Hero Section */}
      <section className="relative bg-muted/40 py-20 lg:py-32">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center">
            <h1 className="text-4xl lg:text-5xl font-bold text-gray-800 mb-6">Patient Information</h1>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto">Everything you need to know for a smooth and comfortable dental experience</p>
          </div>
        </div>
      </section>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20">
        <PageBreadcrumbs items={[{ label: "Home", href: "/" }, { label: "Patient Info" }]} />

        <section aria-labelledby="visit-guides-heading" className="mb-10">
          <h2 id="visit-guides-heading" className="text-3xl font-bold text-foreground">Start with your next step</h2>
          <div className="mt-6 grid gap-4 md:grid-cols-3">
            {[
              { href: "/new-patients", title: "I'm new to the practice", description: "Prepare for your first visit, know what to ask, and plan your arrival." },
              { href: "/insurance-and-payment", title: "I have cost or insurance questions", description: "Bring the right questions to the office and your insurer before your visit." },
              { href: "/urgent-dental-care", title: "I need prompt dental attention", description: "Call about a time-sensitive concern and review regular office hours." },
            ].map((guide) => (
              <Link key={guide.href} href={guide.href} className="block rounded-xl border border-border bg-card p-6 transition-colors hover:border-primary/40 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2">
                <h3 className="text-lg font-bold text-foreground">{guide.title}</h3>
                <p className="mt-3 text-sm leading-relaxed text-muted-foreground">{guide.description}</p>
                <span className="mt-4 block font-semibold text-primary">View guide</span>
              </Link>
            ))}
          </div>
        </section>
        
        <div className="grid lg:grid-cols-2 gap-8">
          {/* Insurance Information */}
          <div className="bg-white rounded-xl shadow-sm p-8">
            <div className="text-center mb-6">
              <h2 className="text-2xl font-bold text-gray-800">Insurance & Payment</h2>
            </div>
            <p className="text-gray-600 mb-6">Insurance participation, benefits, and payment options can vary. Call our office before your visit so we can review the details you provide and explain the next step.</p>
            <div className="space-y-4">
              <div>
                <h3 className="font-semibold text-gray-800 mb-2">Insurance Questions</h3>
                <p className="text-gray-600">
                  Have your plan name and member information ready when you call. Coverage and
                  benefits are determined by your insurer and specific plan.
                </p>
              </div>
              <div>
                <h3 className="font-semibold text-gray-800 mb-2">Payment Questions</h3>
                <p className="text-gray-600">Call the office to ask about current payment methods and options for your proposed care.</p>
              </div>
              <div className="flex flex-col items-start gap-3 border-t border-border pt-4">
                <Button asChild><PhoneLink location="patient_info_insurance">Call {patientGuidanceFacts.phone.display}</PhoneLink></Button>
                <Link href="/insurance-and-payment" className="inline-flex min-h-11 items-center font-semibold text-primary underline underline-offset-4">Questions to ask about insurance & payment</Link>
              </div>
              <div className="rounded-xl border border-secondary/20 bg-secondary/5 p-4">
                <h3 className="font-semibold text-gray-800 mb-2">Coming from Santa Cruz?</h3>
                <p className="text-sm text-gray-600">
                  Many Santa Cruz families are happy to come over Highway 17 for care here. If you
                  have insurance questions, call ahead with your plan details before you make the
                  trip.
                </p>
                <Button asChild variant="link" className="mt-3 h-auto p-0 text-primary">
                  <Link href="/areas-we-serve/santa-cruz">See Santa Cruz visit details</Link>
                </Button>
              </div>
            </div>
          </div>
          
          {/* What to Expect */}
          <div className="bg-white rounded-xl shadow-sm p-8">
            <div className="text-center mb-6">
              <h2 className="text-2xl font-bold text-gray-800">What to Expect</h2>
            </div>
            <p className="text-gray-600 mb-6">Your comfort and understanding are our priorities. Here's what you can expect during your visit.</p>
            <div className="space-y-4">
              <div className="flex">
                <div className="bg-primary text-white w-8 h-8 rounded-lg flex items-center justify-center mr-3 mt-1 text-sm font-bold">1</div>
                <div>
                  <h3 className="font-semibold text-gray-800">Warm Welcome</h3>
                  <p className="text-sm text-gray-600">Our friendly staff will greet you and help you get settled.</p>
                </div>
              </div>
              <div className="flex">
                <div className="bg-primary text-white w-8 h-8 rounded-lg flex items-center justify-center mr-3 mt-1 text-sm font-bold">2</div>
                <div>
                  <h3 className="font-semibold text-gray-800">Thorough Examination</h3>
                  <p className="text-sm text-gray-600">Dr. Chuang will perform a comprehensive exam and explain findings.</p>
                </div>
              </div>
              <div className="flex">
                <div className="bg-primary text-white w-8 h-8 rounded-lg flex items-center justify-center mr-3 mt-1 text-sm font-bold">3</div>
                <div>
                  <h3 className="font-semibold text-gray-800">Personalized Plan</h3>
                  <p className="text-sm text-gray-600">We'll create a treatment plan tailored to your needs and budget.</p>
                </div>
              </div>
              <div className="flex">
                <div className="bg-primary text-white w-8 h-8 rounded-lg flex items-center justify-center mr-3 mt-1 text-sm font-bold">4</div>
                <div>
                  <h3 className="font-semibold text-gray-800">Comfortable Care</h3>
                  <p className="text-sm text-gray-600">Enjoy amenities like blankets, water, and entertainment during treatment.</p>
                </div>
              </div>
            </div>
          </div>
        </div>
        
        <div className="mt-6"><Button asChild variant="outline"><Link href="/new-patients">Plan your first visit</Link></Button></div>

        {/* Oral Health Education */}
        <div className="mt-16">
          <h2 className="text-3xl font-bold text-gray-800 mb-8 text-center">Oral Health Education</h2>
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            <div className="overflow-hidden rounded-xl border border-border bg-card">
              <div className="h-32 border-b border-border bg-muted/40 px-6 py-6">
                <p className="text-sm font-semibold uppercase tracking-wide text-primary">Guide</p>
              </div>
              <div className="p-6">
                <h3 className="text-xl font-semibold text-gray-800 mb-3">How to Brush Properly</h3>
                <p className="text-gray-600 mb-4">Learn the correct brushing technique to effectively remove plaque and maintain healthy teeth and gums.</p>
                <Button asChild variant="link" className="text-primary font-medium p-0">
                  <Link href="/patient-info/brushing">Read More</Link>
                </Button>
              </div>
            </div>
            
            <div className="overflow-hidden rounded-xl border border-border bg-card">
              <div className="h-32 border-b border-border bg-muted/40 px-6 py-6">
                <p className="text-sm font-semibold uppercase tracking-wide text-primary">Guide</p>
              </div>
              <div className="p-6">
                <h3 className="text-xl font-semibold text-gray-800 mb-3">Flossing Fundamentals</h3>
                <p className="text-gray-600 mb-4">Discover why flossing is essential and learn the proper technique for optimal gum health.</p>
                <Button asChild variant="link" className="text-primary font-medium p-0">
                  <Link href="/patient-info/flossing">Read More</Link>
                </Button>
              </div>
            </div>
            
            <div className="overflow-hidden rounded-xl border border-border bg-card">
              <div className="h-32 border-b border-border bg-muted/40 px-6 py-6">
                <p className="text-sm font-semibold uppercase tracking-wide text-primary">Guide</p>
              </div>
              <div className="p-6">
                <h3 className="text-xl font-semibold text-gray-800 mb-3">Nutrition for Healthy Teeth</h3>
                <p className="text-gray-600 mb-4">Understand how your diet affects your oral health and which foods promote strong teeth.</p>
                <Button asChild variant="link" className="text-primary font-medium p-0">
                  <Link href="/patient-info/nutrition">Read More</Link>
                </Button>
              </div>
            </div>
          </div>
        </div>

        {/* Popular Services */}
        <div className="mt-16">
          <h2 className="text-3xl font-bold text-gray-800 mb-4 text-center">Popular Appointments</h2>
          <p className="text-lg text-gray-600 mb-8 text-center">
            Quick links to the services patients ask for most.
          </p>
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {popularServices.map((service) => (
              <Link key={service.href} href={service.href} className="block h-full">
                <div className="h-full bg-white rounded-xl shadow-sm p-6 transition-shadow duration-300 border border-gray-100">
                  <h3 className="text-xl font-semibold text-gray-800 mb-2">{service.title}</h3>
                  <p className="text-gray-600 mb-4">{service.description}</p>
                  <span className="text-primary font-semibold">Learn more</span>
                </div>
              </Link>
            ))}
          </div>
        </div>
        
        {/* FAQs */}
        <div className="mt-16 bg-white rounded-xl shadow-sm p-8">
          <h2 className="text-3xl font-bold text-gray-800 mb-8 text-center">Frequently Asked Questions</h2>
          <PatientInfoFaqList />
        </div>
      </div>
    </div>
  );
}
