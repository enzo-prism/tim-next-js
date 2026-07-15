import { googleBusinessProfileUrl, yelpBusinessProfileUrl } from "@/data/reviews";
import type { Testimonial } from "@/lib/types";

export type TestimonialLink = {
  href: string;
  label: string;
};

export type TestimonialExcerpt = {
  name: string;
  rating: number;
  patientLabel: string;
  quote: string;
};

export type TestimonialTheme = {
  title: string;
  description: string;
};

export type TestimonialSection = {
  id: string;
  eyebrow: string;
  title: string;
  description: string;
  links: TestimonialLink[];
  reviews: TestimonialExcerpt[];
};

export type TestimonialSummary = {
  averageRating: string;
  reviewCountLabel: string;
  sourceLabel: string;
  sourceUrl: string;
  editorialNote: string;
  verifiedAtLabel: string;
};

export type ReviewLibrarySummary = {
  averageRating: string;
  reviewCountLabel: string;
  sourceLabel: string;
  editorialNote: string;
  verifiedAtLabel: string;
};

export type PublicReviewFeedItem = {
  name: string;
  rating: number;
  dateLabel: string;
  quote: string;
};

export type PublicReviewFeedSection = {
  id: string;
  eyebrow: string;
  title: string;
  description: string;
  sourceLabel: string;
  sourceUrl: string;
  reviews: PublicReviewFeedItem[];
};

export const testimonialsPageSummary: TestimonialSummary = {
  averageRating: "5.0",
  reviewCountLabel: "52 Google reviews",
  sourceLabel: "Public Google reviews",
  sourceUrl: googleBusinessProfileUrl,
  editorialNote:
    "Selected excerpts from publicly posted Google reviews shared by patients and families.",
  verifiedAtLabel: "Review snapshot verified April 16, 2026",
};

export const testimonialsReviewLibrarySummary: ReviewLibrarySummary = {
  averageRating: "5.0",
  reviewCountLabel: "52 Google reviews + 6 Yelp reviews",
  sourceLabel: "Public Google and Yelp review listings",
  editorialNote:
    "This page includes public Google review excerpts plus Yelp excerpts surfaced through Yahoo Local's Yelp feed.",
  verifiedAtLabel: "Review snapshot verified April 16, 2026",
};

export const publicReviewFeedSections: PublicReviewFeedSection[] = [
  {
    id: "latest-google-reviews",
    eyebrow: "Public Google reviews",
    title: "More experiences shared by patients",
    description:
      "These public Google review excerpts add more patient experiences without replacing the curated service-based testimonials above.",
    sourceLabel: "Read all Google reviews",
    sourceUrl: googleBusinessProfileUrl,
    reviews: [
      {
        name: "Veronica Rajasekar",
        rating: 5,
        dateLabel: "Apr 08, 2026",
        quote:
          "I had a fantastic experience with Dr. Chuang and his team. Dr. Chuang is incredibly patient, knowledgeable, and gentle, taking the time to listen to my concerns and clearly explain all my options. Georgia at the front office is also wonderful—always friendly and helpful with the scheduling process. Highly recommend!",
      },
      {
        name: "Js L",
        rating: 5,
        dateLabel: "Mar 26, 2026",
        quote:
          "Dr. Chuang is a true perfectionist who listens carefully and explains every step so I always feel at ease. His attention to detail is unmatched, and his staff is friendly, professional, and welcoming. I always know I’m in excellent hands here.",
      },
      {
        name: "Thomas H",
        rating: 5,
        dateLabel: "Mar 17, 2026",
        quote:
          "Dr Tim, is one of the best dentist I have ever worked with. He is passionate about dental care and passionate about people. I have not been more excited to go to a dental appointment, until I started working with Dr. Tim. His staff is great, care is great, services are great not to mention he will find that week old piece of meat you left in your gums. Highly recommend!",
      },
      {
        name: "LiZy CHaIrez",
        rating: 5,
        dateLabel: "Mar 03, 2026",
        quote: "This patient left a 5-star Google rating without a written comment.",
      },
    ],
  },
  {
    id: "yelp-reviews",
    eyebrow: "Yelp reviews",
    title: "Yelp feedback now visible alongside the Google testimonials",
    description:
      "The website previously focused on Google-only social proof. These Yelp excerpts broaden that picture for families who check more than one review source before booking.",
    sourceLabel: "Read Yelp reviews",
    sourceUrl: yelpBusinessProfileUrl,
    reviews: [
      {
        name: "Peggy W.",
        rating: 5,
        dateLabel: "01/21/26",
        quote:
          "A friend of mine recommended Dr. Chuang and I am so glad I went to him. I had an emergency and he took me the same day. He has a great staff and they are all dedicated to your ease and comfort. I...",
      },
      {
        name: "Tcchi M.",
        rating: 5,
        dateLabel: "01/18/25",
        quote:
          "I came in for a 3rd opinion for my sensitive teeth. I haven't received actual treatment yet, but during the consultation I was impressed with Dr. Chuang's knowledge, his polite staff, and his...",
      },
      {
        name: "Thomas B.",
        rating: 5,
        dateLabel: "01/15/25",
        quote:
          "Doctor Tim was the best! I'm the kind of person that typically hates going to the dentist, but this was the most comfortable I've ever felt - I felt like Doctor Tim handled with care, gave me a...",
      },
      {
        name: "Y E.",
        rating: 5,
        dateLabel: "05/13/25",
        quote:
          "Everyone there is super friendly, gentle, and caring. We received great care. It was nice that there was no other patient and we got all the personal attention. My daughter wants to go back, and...",
      },
      {
        name: "Monica L.",
        rating: 5,
        dateLabel: "12/13/24",
        quote:
          "Dr. Chuang is stellar and provides great service! He was very patient and walked me through every step of my annual cleaning :) highly recommend, just wish I lived closer to his clinic!",
      },
    ],
  },
];

export const featuredReview: TestimonialExcerpt = {
  name: "Priscilla Barajas",
  rating: 5,
  patientLabel: "Patient and parent",
  quote:
    "I can't say enough wonderful things about Dr. Chuang and the staff at this office. They have treated my entire family of seven with so much kindness, patience, and care. Our kids actually enjoy going to the dentist now, which says everything.",
};

export const testimonialThemes: TestimonialTheme[] = [
  {
    title: "Thorough first visits",
    description:
      "New patients consistently mention careful exams, modern scans, and treatment plans that feel clear instead of rushed.",
  },
  {
    title: "Gentle care for anxious patients",
    description:
      "Many reviews call out how calm, patient, and reassuring the team is during cleanings and treatment.",
  },
  {
    title: "Family-friendly dentistry",
    description:
      "Parents regularly describe child-friendly visits, welcoming staff, and a practice that makes the whole family feel at home.",
  },
  {
    title: "Advanced treatment planning",
    description:
      "Patients mention TMJ care, custom night guards, Invisalign, and digital technology that supports better decisions.",
  },
];

export const testimonialSections: TestimonialSection[] = [
  {
    id: "new-patients",
    eyebrow: "New patient experience",
    title: "Reviews about thorough exams and clear explanations",
    description:
      "People looking for a new dentist in Los Gatos often want to know whether the first visit feels thoughtful, modern, and easy to understand. These Google reviews repeatedly mention comprehensive exams, careful scans, and treatment plans explained in plain language.",
    links: [
      { href: "/services/dental-exams", label: "Dental Exams" },
      { href: "/services/dental-hygiene", label: "Dental Hygiene" },
      { href: "/services/family-dentistry", label: "General & Family Dentistry" },
    ],
    reviews: [
      {
        name: "Todd McMasters",
        rating: 5,
        patientLabel: "New patient",
        quote:
          "I became a new patient with Dr. Chuang the beginning of this year and I am very happy with my care! Dr. Chuang and his team are very friendly and always make me feel right at home and carefully explain the procedures.",
      },
      {
        name: "Andrea Callaghan",
        rating: 5,
        patientLabel: "New patient",
        quote:
          "Dr. Chuang was kind, very good listener, knowledgeable about my rare health issues and any issues related to dental health. He was informative and helped me figure out the best plan for my teeth. I have seen my dentist in the Bay Area for 40 years but she retired so I was a little hesitant to find a new dentist. However the team was AMAZING. I will be his new patient for the next 40 years :)",
      },
      {
        name: "Jerry Jobe",
        rating: 5,
        patientLabel: "First visit",
        quote:
          "First visit - very thorough, communicated well, very personable. Well equipped office using up to date process for diagnosis and treatment.",
      },
    ],
  },
  {
    id: "gentle-care",
    eyebrow: "Comfort and trust",
    title: "Patients highlight gentle care and low-stress visits",
    description:
      "For patients with dental anxiety or sensitivity, comfort matters as much as technical skill. These reviews speak to a style of care that feels patient, transparent, and reassuring during cleanings, treatment, and everyday visits.",
    links: [
      { href: "/patient-info", label: "Patient Info" },
      { href: "/services/dental-hygiene", label: "Professional Cleanings" },
      { href: "/contact", label: "Schedule a Visit" },
    ],
    reviews: [
      {
        name: "Don Spingola",
        rating: 5,
        patientLabel: "Patient with dental anxiety",
        quote:
          "I couldn't be happier with my experience with Dr. Chuang and his staff. They are kind, gentle, and patient especially considering my usual anxiety associated with dental visits. I feel very fortunate to have found Dr. Chuang and highly recommend him to anyone looking for an exceptional dental experience.",
      },
      {
        name: "TO Preising",
        rating: 5,
        patientLabel: "First visit",
        quote:
          "This was my first visit, and Dr. Chuang and his staff were diligent and thorough, explaining every step and answering every question. A painless experience!",
      },
      {
        name: "Janey Lee",
        rating: 5,
        patientLabel: "Patient with dental anxiety",
        quote:
          "I have some dental anxiety and Dr. Chuang is always readily available with solid advice and a reassuring manner in answering my questions. He has a positive attitude and a problem-solving oriented approach. Highly recommend him for your dental needs!",
      },
    ],
  },
  {
    id: "family-dentistry",
    eyebrow: "Family dentistry",
    title: "Families talk about kindness, patience, and kid-friendly visits",
    description:
      "Families choosing a long-term dental home want a practice that works for adults, children, and nervous first-timers alike. These testimonials describe a family dentist experience built around warmth, consistency, and visits that leave kids more comfortable instead of more worried.",
    links: [
      { href: "/services/family-dentistry", label: "Family Dentistry" },
      { href: "/services/children-dentistry", label: "Children's Dentistry" },
      {
        href: "/services/childrens-dentistry/babys-first-visit",
        label: "Baby's First Visit",
      },
    ],
    reviews: [
      {
        name: "Priscilla Barajas",
        rating: 5,
        patientLabel: "Patient and parent",
        quote:
          "I can't say enough wonderful things about Dr. Chuang and the staff at this office. They have treated my entire family of seven with so much kindness, patience, and care. Every visit feels comfortable, and they always go above and beyond to make sure each one of us - from the youngest to the oldest - is taken care of. Our kids actually enjoy going to the dentist now, which says everything! This will absolutely be our family dentist from now on.",
      },
      {
        name: "Kevin Lan",
        rating: 5,
        patientLabel: "Parent",
        quote:
          "Dr Chuang was great for my 2 year old daughter's first dental visit. He was patient, fun and knew how to interact with toddlers well, and had necessary tools like toys and stickers to keep the kid happy.",
      },
      {
        name: "Dayn Le",
        rating: 5,
        patientLabel: "Local patient",
        quote:
          "Dr. Tim and his team were friendly and professional. Dr. Tim was very thorough, but I really appreciated the care and attention to detail. His assistant Trang was also so sweet and made me feel completely comfortable throughout my visit. Great experience overall, I'm so glad I found this new dental office, especially because I could literally walk to the office!",
      },
    ],
  },
  {
    id: "advanced-care",
    eyebrow: "TMJ, Invisalign, and technology",
    title: "Patients mention modern technology and specialized treatment planning",
    description:
      "Beyond routine care, patients also talk about TMJ support, custom night guards, Invisalign planning, and up-to-date technology. These reviews help show how the practice supports both everyday family dentistry and more specialized needs in one office.",
    links: [
      { href: "/tmj", label: "TMJ Treatment" },
      { href: "/services/night-guards", label: "Night Guards" },
      { href: "/services/invisalign", label: "Invisalign" },
      { href: "/technology/itero-digital-scanner", label: "iTero Digital Scanner" },
    ],
    reviews: [
      {
        name: "Paula Gregoire",
        rating: 5,
        patientLabel: "TMJ patient",
        quote:
          "It has been such a pleasure meeting Dr. Chuang and getting an actual treatment plan to help with my TMJ. He constructed a custom dental orthotic for me to wear at night and also taught me some simple massages and exercises to help with my pain. After being given the run around and negligent care from other dentists and health professionals for years, it is truly a relief to find a caring professional who is so knowledgeable about TMJ!",
      },
      {
        name: "Jinny",
        rating: 5,
        patientLabel: "Invisalign patient",
        quote:
          "I'm so glad I was referred to Dr. Chuang! I wanted some minor tweaks to my smile and he was able to help me achieve my desired look with just 7 trays. The whole process has been such a breeze and went by so quickly. He always takes his time to explain what's going to be done and never rushes anything.",
      },
      {
        name: "Jon Takagi",
        rating: 5,
        patientLabel: "Night guard patient",
        quote:
          "I recommend Family First Smile Care for anyone's dental needs. Dr. Chuang and his staff are very friendly and were quick to respond to my dental issues providing referrals to additional specialists. The practice used modern equipment to have a 3D printed night guard made to help with my TMJ issue.",
      },
    ],
  },
];

export const homepageTestimonials: Testimonial[] = [
  {
    id: 0,
    name: "Priscilla Barajas",
    title: "Patient and parent",
    content:
      "They treated my family of seven with so much kindness and care. Our kids actually enjoy going to the dentist now, and we trust Dr. Chuang and his team completely.",
    rating: 5,
  },
  {
    id: 1,
    name: "Andrea Callaghan",
    title: "New patient",
    content:
      "Dr. Chuang was kind, knowledgeable, and helped me figure out the best plan for my teeth. The team was amazing, and I felt at ease finding a new dentist.",
    rating: 5,
  },
  {
    id: 2,
    name: "Janey Lee",
    title: "Patient with dental anxiety",
    content:
      "Dr. Chuang always offers solid advice and a reassuring manner when I have questions. His positive, problem-solving approach makes visits much easier.",
    rating: 5,
  },
  {
    id: 3,
    name: "Kevin Lan",
    title: "Parent",
    content:
      "Dr Chuang was great for my 2 year old daughter's first dental visit. He was patient, fun, and knew how to interact with toddlers well.",
    rating: 5,
  },
  {
    id: 4,
    name: "Jinny",
    title: "Invisalign patient",
    content:
      "He helped me achieve my desired look with just 7 trays, and the whole Invisalign process was such a breeze. He explains everything and never rushes.",
    rating: 5,
  },
  {
    id: 5,
    name: "Paula Gregoire",
    title: "TMJ patient",
    content:
      "It was a relief to find someone so knowledgeable about TMJ. Dr. Chuang gave me a real treatment plan, a custom orthotic, and exercises to help with my pain.",
    rating: 5,
  },
  {
    id: 6,
    name: "Jon Takagi",
    title: "Patient",
    content:
      "Dr. Chuang and his staff are very friendly and responsive. The practice used modern equipment to make a 3D printed night guard for my TMJ issue.",
    rating: 5,
  },
  {
    id: 7,
    name: "Davy H",
    title: "Patient",
    content:
      "Dr. Chuang's clinic is welcoming, professional, and truly caring. His team provides attentive, personalized care with expertise and kindness.",
    rating: 5,
  },
];

export const testimonialsPageRelatedLinks = [
  {
    href: "/services/dental-exams",
    title: "Dental Exams",
    description: "Learn how comprehensive exams, digital imaging, and early diagnosis support long-term oral health.",
  },
  {
    href: "/services/family-dentistry",
    title: "General & Family Dentistry",
    description: "See how we care for children, parents, and grandparents under one roof in Los Gatos.",
  },
  {
    href: "/services/children-dentistry",
    title: "Children's Dentistry",
    description: "Explore gentle visits designed to help kids feel safe, engaged, and confident at the dentist.",
  },
  {
    href: "/services/invisalign",
    title: "Invisalign",
    description: "Read about our clear aligner approach and how digital planning makes smile design easier.",
  },
  {
    href: "/tmj",
    title: "TMJ Treatment",
    description: "See how custom orthotics, night guards, and bite evaluation can help reduce jaw discomfort.",
  },
  {
    href: "/contact",
    title: "Contact & Scheduling",
    description: "Request an appointment, ask a question, or get directions to our Los Gatos office.",
  },
];
