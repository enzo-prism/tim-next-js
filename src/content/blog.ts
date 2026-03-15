export interface BlogPostSection {
  id: string;
  title: string;
  paragraphs?: string[];
  bullets?: string[];
  callout?: string;
}

export interface BlogPostFaq {
  question: string;
  answer: string;
}

export interface BlogPostLink {
  href: string;
  title: string;
  description: string;
}

export interface BlogPostSource {
  label: string;
  href: string;
}

export interface BlogPost {
  slug: string;
  title: string;
  metaTitle: string;
  metaDescription: string;
  excerpt: string;
  category: string;
  primaryKeyword: string;
  secondaryKeywords: string[];
  publishedAt: string;
  updatedAt: string;
  readingTimeMinutes: number;
  heroEyebrow: string;
  heroSummary: string;
  quickAnswer: string;
  intro: string[];
  sections: BlogPostSection[];
  faq: BlogPostFaq[];
  relatedLinks: BlogPostLink[];
  sources: BlogPostSource[];
  ctaTitle: string;
  ctaBody: string;
  ctaHref: string;
  ctaLabel: string;
}

export const getBlogPostHref = (slug: string) => `/blog/${slug}`;

const blogPosts: BlogPost[] = [
  {
    slug: "when-should-kids-first-see-a-dentist-los-gatos",
    title: "When Should Kids First See a Dentist? A Los Gatos Parent Guide to the First Visit",
    metaTitle: "When Should Kids First See a Dentist in Los Gatos? | Family First Smile Care",
    metaDescription:
      "Wondering when your child should first see a dentist? Learn the right timing, what happens at the first visit, and how Los Gatos parents can help kids feel comfortable.",
    excerpt:
      "Most children should have their first dental visit within six months of the first tooth or by age one. Here is what Los Gatos parents should expect and how to make the visit feel easy.",
    category: "Children's Dentistry",
    primaryKeyword: "when should kids first see a dentist",
    secondaryKeywords: [
      "first dentist visit child",
      "children's dentist Los Gatos",
      "baby first dental visit",
      "how to prepare child for dentist",
      "family dentist Los Gatos",
    ],
    publishedAt: "2026-03-14",
    updatedAt: "2026-03-14",
    readingTimeMinutes: 7,
    heroEyebrow: "Los Gatos Parents Guide",
    heroSummary:
      "Early dental visits are about prevention, comfort, and building healthy habits before dental care ever feels stressful.",
    quickAnswer:
      "Most children should see a dentist within six months of the first tooth erupting, or by the first birthday at the latest.",
    intro: [
      "A lot of parents wait until something seems wrong before scheduling a dental visit for their child. In most cases, that is later than ideal.",
      "The better move is to start early, before pain, fear, or visible problems show up. Early dental visits help children get comfortable with the office, help parents learn how to care for baby teeth, and give your dentist a chance to catch small issues before they become stressful ones.",
      "At Family First Smile Care, that early, family-centered approach fits the heart of the practice. The office emphasizes gentle care, prevention, and a calm experience for children and anxious patients alike. For Los Gatos families, that is exactly what a first visit should feel like.",
    ],
    sections: [
      {
        id: "recommended-age",
        title: "So when should kids first see a dentist?",
        paragraphs: [
          "A good rule of thumb is this: your child should see a dentist within six months of the first tooth coming in, or by the first birthday at the latest.",
          "That recommendation lines up with current guidance from the American Academy of Pediatric Dentistry and is reinforced by Stanford Medicine Children's Health. Parents are often surprised because one or two tiny teeth do not seem like enough to justify a dental visit, but baby teeth matter right away.",
          "They support eating, speech development, spacing for adult teeth, and healthy routines at home. Starting early is less about treatment and more about creating a steady, low-stress foundation.",
        ],
        callout:
          "For most parents, the age-one guideline is the key takeaway: if the first tooth is already in, it is time to start thinking about that first dental home.",
      },
      {
        id: "why-early-visits-matter",
        title: "Why the first visit should happen early",
        paragraphs: [
          "The first visit is not usually about major treatment. It is mostly about prevention, education, and comfort.",
          "When kids start early, the dental office feels normal instead of dramatic. That matters because a child whose first visit happens because of pain or an emergency is more likely to build fear around the experience.",
        ],
        bullets: [
          "Checking for early signs of decay",
          "Talking through feeding habits and cavity risk",
          "Guidance on brushing baby teeth and cleaning gums",
          "Questions about pacifiers, thumb-sucking, or teething",
          "Helping your child see the dental office as normal and safe",
        ],
      },
      {
        id: "what-happens",
        title: "What happens at a child's first dental visit?",
        paragraphs: [
          "For many children, the first appointment is short, gentle, and very parent-involved.",
          "Stanford Medicine Children's Health notes that the first visit often lasts around 30 to 45 minutes and is designed in part to help the child feel comfortable with the dentist. That is a useful expectation for parents. The goal is not perfection. The goal is a positive foundation.",
        ],
        bullets: [
          "A quick exam of the teeth, gums, bite, and oral tissues",
          "A conversation about growth and development",
          "Tips for brushing and fluoride use at home",
          "Guidance on snacks, drinks, and bottle habits",
          "A gentle cleaning if appropriate",
        ],
      },
      {
        id: "how-to-prepare",
        title: "How Los Gatos parents can help kids feel comfortable",
        paragraphs: [
          "One of the most helpful things parents can do is stay calm themselves. Children read adult energy fast, so tense language can make the appointment feel bigger than it needs to be.",
          "Stanford's first-visit guidance specifically advises parents not to pass their own dental anxiety to their child. Neutral language and a good appointment time go a long way.",
        ],
        bullets: [
          "Book an appointment when your child is usually rested and fed",
          "Use simple, neutral language about the visit",
          "Avoid saying it will not hurt before your child even asks",
          "Bring a comfort item if that helps your child settle",
          "Let the dental team guide the pace when possible",
        ],
      },
      {
        id: "nervous-child",
        title: "What if my child is nervous, strong-willed, or very young?",
        paragraphs: [
          "That is common. It does not mean you should wait.",
          "Some children cry. Some cling to a parent. Some refuse to open wide right away. None of that is unusual, especially in toddlers. What matters is working with a practice that expects child behavior to be child behavior and responds with patience instead of pressure.",
          "Very young children may struggle with separation, while preschoolers can be unpredictable for entirely normal developmental reasons. A gentle first visit still helps, even if it feels messy in the moment.",
        ],
      },
      {
        id: "baby-teeth-matter",
        title: "Why baby teeth deserve real attention",
        paragraphs: [
          "Some parents still hear the old idea that baby teeth do not matter because they fall out anyway. That is not true.",
          "Baby teeth help children chew comfortably, speak clearly, and hold space for permanent teeth. Cavities in baby teeth can still cause pain, infection, sleep problems, and trouble eating. They can also turn future dental care into something children expect to be unpleasant.",
          "An early dental home helps prevent that cycle and makes ongoing care feel routine.",
        ],
      },
      {
        id: "questions-to-ask",
        title: "What parents should ask at the first visit",
        paragraphs: [
          "The first appointment is also your chance to get clear answers that are specific to your child's age, habits, and risk factors.",
        ],
        bullets: [
          "Is my child's brushing routine appropriate for their age?",
          "How much fluoride toothpaste should we use?",
          "Are there feeding habits increasing cavity risk?",
          "Is thumb-sucking or pacifier use becoming an issue?",
          "When should we schedule the next exam?",
        ],
      },
      {
        id: "follow-up-visits",
        title: "How often should kids go after the first visit?",
        paragraphs: [
          "For many children, checkups every six months are a good baseline. Some kids may need more frequent visits depending on cavity risk, enamel concerns, or developmental issues.",
          "The important thing is consistency. Regular visits help dental care feel routine instead of dramatic, which is especially helpful for young children and anxious parents.",
        ],
      },
      {
        id: "signs-not-to-wait",
        title: "Signs you should not wait for the first birthday",
        paragraphs: [
          "Even if your child has not reached age one yet, some signs are worth checking sooner.",
        ],
        bullets: [
          "White or brown spots on teeth",
          "Ongoing sensitivity to brushing",
          "Trouble eating because of mouth discomfort",
          "Swelling or unusual gum changes",
          "Dental trauma from a fall or bump",
        ],
      },
    ],
    faq: [
      {
        question: "Is age one really not too early for a dentist?",
        answer:
          "No. Age one is the recommended upper limit, and many children should be seen earlier if teeth have already erupted.",
      },
      {
        question: "What if my child cries at the first visit?",
        answer:
          "That is common. A calm, gentle visit can still be successful even if your child is unsure at first.",
      },
      {
        question: "Do baby teeth really need checkups?",
        answer:
          "Yes. Baby teeth affect comfort, eating, speech, and the spacing of future adult teeth, so they deserve preventive care.",
      },
      {
        question: "How can I prepare my child for the first dental visit?",
        answer:
          "Keep the explanation simple, choose a good time of day, and stay calm. Your energy helps shape the experience.",
      },
    ],
    relatedLinks: [
      {
        href: "/services/children-dentistry",
        title: "Children's Dentistry",
        description: "Explore our gentle, prevention-focused approach for kids of different ages.",
      },
      {
        href: "/services/childrens-dentistry/babys-first-visit",
        title: "Baby's First Visit",
        description: "See what happens during infant and toddler dental visits at our Los Gatos office.",
      },
      {
        href: "/services",
        title: "All Dental Services",
        description: "Browse preventive, restorative, cosmetic, and family dental care in one place.",
      },
      {
        href: "/patient-info/brushing",
        title: "How to Brush Properly",
        description: "Use age-appropriate brushing habits to protect new teeth at home.",
      },
      {
        href: "/contact",
        title: "Contact & Scheduling",
        description: "Ask a question or request an appointment with our team in Los Gatos.",
      },
    ],
    sources: [
      {
        label: "AAPD parent FAQ on first dental visits",
        href: "https://www.aapd.org/resources/parent/faq/",
      },
      {
        label: "Stanford Medicine Children's Health first-visit fact sheet",
        href: "https://www.stanfordchildrens.org/en/topic/default?id=a-childs-first-dental-visit-fact-sheet-1-1509&sid=30003",
      },
    ],
    ctaTitle: "Make the first visit feel easy",
    ctaBody:
      "If you are wondering whether it is time to schedule, we can help you plan a calm, age-appropriate first appointment for your child.",
    ctaHref: "/book-appointment",
    ctaLabel: "Book a first visit",
  },
];

export function getAllBlogPosts() {
  return [...blogPosts].sort((a, b) => Date.parse(b.publishedAt) - Date.parse(a.publishedAt));
}

export function getBlogPostBySlug(slug: string) {
  return blogPosts.find((post) => post.slug === slug);
}

export function getAllBlogRoutes() {
  return getAllBlogPosts().map((post) => getBlogPostHref(post.slug));
}
