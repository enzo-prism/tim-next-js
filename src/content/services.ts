export interface ServiceDecisionGuide {
  candidacy: string;
  alternatives: string;
  visitExpectations: string;
  costFactors: string[];
  maintenance: string;
  faqs: { question: string; answer: string }[];
  sources: { label: string; href: string }[];
}

export interface Service {
  id: string;
  title: string;
  description: string;
  icon: string;
  details: string[];
  featured?: boolean;
  subServices?: Service[];
  heroDescription?: string;
  longDescription?: string;
  benefits?: string[];
  process?: string[];
  seoTitle?: string;
  seoDescription?: string;
  decisionGuide?: ServiceDecisionGuide;
}

export const services: Service[] = [
  {
    id: "children-dentistry",
    title: "Children's Dentistry",
    description: "Gentle care for little smiles",
    icon: "child",
    details: [
      "Gentle first visits and dental exams",
      "Habit-building and oral hygiene education",
      "Child-friendly tools and techniques",
      "Rewards program with toys and stickers",
      "Preventive sealants and fluoride",
    ],
    heroDescription: "Creating positive dental experiences for children with gentle, compassionate care that builds lifelong healthy habits.",
    longDescription: "At Family First Smile Care, we understand that a child's first dental experiences shape their relationship with oral health for life. Our pediatric approach focuses on creating a welcoming, fun environment where children feel safe and comfortable.",
    benefits: [
      "Child-friendly environment with toys and games",
      "Gentle techniques designed for young patients",
      "Educational approach to build healthy habits",
      "Preventive focus to avoid future problems",
      "Positive reinforcement and reward systems",
    ],
    process: [
      "Initial consultation and comfort visit",
      "Gentle examination and assessment",
      "Fun educational activities about oral health",
      "Professional cleaning if appropriate",
      "Home care instructions for parents",
    ],
    subServices: [
      {
        id: "childrens-dentistry/babys-first-visit",
        title: "Baby's First Visit",
        description: "Gentle, parent-involved dental visits for infants and toddlers",
        icon: "baby",
        details: [
          "Knee-to-knee exams with parents present",
          "Teething and feeding guidance",
          "Age-appropriate cleanings and fluoride",
        ],
        heroDescription: "A warm, unrushed introduction to dental care where parents stay close and babies feel secure.",
        longDescription: "We pace baby visits slowly, letting little ones explore while we coach parents on brushing, nutrition, and soothing techniques.",
        benefits: [
          "Positive first impressions of dental care",
          "Personalized coaching for home routines",
          "Early detection of tongue or lip ties",
        ],
        process: [
          "Warm welcome and comfort visit",
          "Knee-to-knee exam with a parent",
          "Gentle cleaning and fluoride if recommended",
          "Customized home-care plan",
        ],
        seoTitle: "Baby's First Dental Visit in Los Gatos, CA | Family First Smile Care",
        seoDescription: "A calm, playful first dental visit for babies in Los Gatos. Learn what happens, how to prepare, and why early visits matter for lifelong oral health.",
      },
    ],
  },
  {
    id: "dental-exams",
    title: "Dental Exams",
    description: "Comprehensive oral health evaluations",
    icon: "dental-exam",
    details: [
      "Thorough oral health examinations",
      "Digital X-rays and imaging",
      "Early detection of dental issues",
      "Personalized treatment planning",
      "Regular check-up recommendations",
    ],
    heroDescription: "Comprehensive dental examinations using advanced technology to detect issues early and maintain optimal oral health.",
    longDescription: "Regular dental examinations are the foundation of preventive oral healthcare. Our thorough evaluations help identify potential issues before they become serious problems, saving you time, discomfort, and expense.",
    benefits: [
      "Early detection prevents major problems",
      "Digital imaging for precise diagnosis",
      "Personalized treatment recommendations",
      "Comprehensive oral health assessment",
      "Professional guidance and education",
    ],
    process: [
      "Medical and dental history review",
      "Visual examination of teeth and gums",
      "Digital X-rays if needed",
      "Oral cancer screening",
      "Treatment planning discussion",
    ],
  },
  {
    id: "dental-hygiene",
    title: "Dental Hygiene",
    description: "Professional cleanings and education",
    icon: "hygiene-sparkle",
    details: [
      "Professional dental cleanings",
      "Plaque and tartar removal",
      "Gum health assessment",
      "Personalized oral hygiene education",
      "Home care recommendations",
    ],
    heroDescription: "Professional dental cleanings and personalized hygiene education to maintain healthy teeth and gums.",
    longDescription: "Professional dental hygiene services go beyond what you can achieve at home. Our skilled hygienists provide thorough cleanings while educating you on the best practices for maintaining optimal oral health.",
    benefits: [
      "Removes hardened plaque and tartar",
      "Prevents gum disease and cavities",
      "Fresh breath and clean feeling",
      "Personalized hygiene instruction",
      "Early detection of oral health issues",
    ],
    process: [
      "Gum health evaluation",
      "Professional plaque and tartar removal",
      "Deep cleaning and polishing",
      "Fluoride treatment if recommended",
      "Home care instruction and tips",
    ],
  },
  {
    id: "family-dentistry",
    title: "General & Family Dentistry",
    description: "Comprehensive care for all ages",
    icon: "family-dentistry",
    details: [
      "Routine dental examinations",
      "Professional dental cleanings",
      "Preventive care and education",
      "Digital X-rays and diagnostics",
      "Fluoride treatments",
    ],
    heroDescription: "Complete dental care for every member of your family, from children to seniors, in one convenient location.",
    longDescription: "Family dentistry means comprehensive care for patients of all ages. We provide everything from routine cleanings to complex treatments, ensuring your entire family receives consistent, quality dental care.",
    benefits: [
      "Convenient care for the whole family",
      "Consistent treatment philosophy",
      "Comprehensive range of services",
      "Family-friendly environment",
      "Long-term oral health relationships",
    ],
    process: [
      "Initial family consultation",
      "Individual treatment planning",
      "Preventive care focus",
      "Regular maintenance visits",
      "Ongoing oral health education",
    ],
  },
  {
    id: "night-guards",
    title: "Night Guards",
    description: "Protection against teeth grinding",
    icon: "night-guard",
    details: [
      "Custom-fitted night guards",
      "Protection against bruxism",
      "Comfortable, durable materials",
      "Evaluation of grinding, clenching, and jaw symptoms",
      "Protection to help reduce tooth wear",
    ],
    heroDescription: "Custom-fitted night guards to protect your teeth from grinding and clenching while you sleep.",
    longDescription: "Grinding and clenching can wear or damage teeth. A custom night guard separates the teeth to help protect them. An exam helps determine whether a guard is appropriate and whether your symptoms need other evaluation.",
    benefits: [
      "Helps protect teeth from grinding-related wear",
      "Fit tailored to your teeth",
      "Guidance on use and care",
      "Follow-up adjustments when needed",
      "A plan based on your symptoms and examination",
    ],
    process: [
      "Bruxism evaluation and assessment",
      "Custom impressions for perfect fit",
      "Night guard fabrication",
      "Fitting and adjustment appointment",
      "Follow-up care and maintenance",
    ],
    decisionGuide: {
      candidacy: "A guard may be considered when grinding or clenching is damaging teeth. Jaw soreness or morning headaches can have several causes, so an examination comes before choosing an appliance.",
      alternatives: "Ask whether monitoring, changes to daytime clenching habits, or evaluation of other contributing factors would be appropriate. A guard is one option in a broader plan, rather than a guaranteed cure for grinding or jaw pain.",
      visitExpectations: "Bring any existing guard and describe when symptoms occur. The visit includes a discussion of your symptoms and an examination. If a custom guard is recommended, ask about impressions, fitting, adjustments, and the expected timeline before proceeding.",
      costFactors: [
        "The type of appliance recommended after the exam",
        "Fabrication, fitting, and any planned follow-up care",
        "Your plan's benefits, exclusions, and replacement rules",
      ],
      maintenance: "Ask for cleaning and storage instructions specific to your appliance. Bring it to follow-up visits and contact the office if it no longer fits comfortably or shows damage.",
      faqs: [
        { question: "Will a night guard stop me from grinding?", answer: "Its main purpose is to separate and protect the teeth. Grinding may continue, and your dentist may discuss other ways to manage contributing factors." },
        { question: "Is a store-bought guard the same as a custom guard?", answer: "Fit and design differ. Bring any appliance you use so the dentist can assess it and explain whether a custom option would be appropriate." },
        { question: "Can you give me a price before I decide?", answer: "Ask for an estimate after the recommended appliance and follow-up plan are clear. Insurance benefits depend on your specific plan; the office can help identify what to confirm with your insurer." },
      ],
      sources: [{ label: "NIDCR: Bruxism", href: "https://www.nidcr.nih.gov/health-info/bruxism" }],
    },
  },
  {
    id: "restorative-dentistry",
    title: "Restorative Dentistry",
    description: "Restore damaged teeth to full function",
    icon: "restorative-tooth",
    details: [
      "Composite fillings",
      "Dental bonding",
      "Root canal therapy",
      "Complete smile restoration",
      "Long-lasting, natural-looking results",
    ],
    heroDescription: "Advanced restorative treatments to repair damaged teeth and restore your smile to optimal function and beauty.",
    longDescription: "Restorative dentistry encompasses treatments that repair, replace, or restore damaged teeth. Our goal is to preserve your natural teeth whenever possible while ensuring optimal function and aesthetics.",
    benefits: [
      "Preserves natural tooth structure",
      "Restores full chewing function",
      "Natural-looking results",
      "Long-lasting durability",
      "Prevents further damage",
    ],
    process: [
      "Comprehensive examination and diagnosis",
      "Treatment planning discussion",
      "Preparation and restoration",
      "Final adjustments and polish",
      "Follow-up care instructions",
    ],
    subServices: [
      {
        id: "invisalign",
        title: "Invisalign",
        description: "Clear aligners for a perfect smile",
        icon: "smile-aligner",
        featured: true,
        details: [
          "Virtually invisible clear aligners",
          "Removable for eating and cleaning",
          "Comfortable, smooth plastic material",
          "Treatment timing tailored to your teeth and goals",
          "Personalized consultation with iTero\u00ae digital scanning when appropriate",
        ],
        heroDescription: "Straighten your teeth discreetly with Invisalign clear aligners - the modern alternative to traditional braces.",
        longDescription: "Invisalign uses a series of custom-made, clear aligners to gradually move your teeth into the desired position. The aligners are virtually invisible and can be removed for eating, brushing, and special occasions.",
        benefits: [
          "Nearly invisible treatment",
          "Removable for convenience",
          "Smooth, removable aligners",
          "Personalized treatment timeline",
          "Easy maintenance and cleaning",
        ],
        process: [
          "Consultation and digital records",
          "Custom treatment plan creation",
          "Aligner fabrication and delivery",
          "Regular progress check-ups",
          "Retainer fitting after completion",
        ],
        seoTitle: "Invisalign Los Gatos | iTero Scan | Family First Smile Care",
        seoDescription: "Invisalign in Los Gatos. Our iTero\u00ae digital scanner takes a fast, comfortable 3D scan (no messy impressions) and helps preview your smile. Book a consultation.",
      },
      {
        id: "teeth-whitening",
        title: "Teeth Whitening",
        description: "Professional whitening for brighter smiles",
        icon: "whitening-sparkle",
        details: [
          "Professional-grade whitening treatments",
          "Assessment of stains and sensitivity",
          "Discussion of realistic shade changes",
          "Guidance on the available whitening options",
          "Instructions for treatment and maintenance",
        ],
        heroDescription: "Explore professional teeth whitening with a plan based on your teeth, sensitivity, and smile goals. Results and timing vary.",
        longDescription: "Whitening can lighten natural teeth, but not every type of discoloration responds in the same way. An examination and a discussion of your dental history help determine whether whitening is a suitable next step.",
        benefits: [
          "A treatment discussion guided by your dental health",
          "Shade goals tailored to your smile",
          "Advice about sensitivity and existing dental work",
          "Clear treatment instructions",
          "Guidance on maintaining your results",
        ],
        process: [
          "Consultation and shade assessment",
          "Professional cleaning if needed",
          "Discussion of appropriate whitening options and timing",
          "Treatment instructions and sensitivity guidance",
          "Follow-up and maintenance recommendations",
        ],
        decisionGuide: {
          candidacy: "Whitening acts on natural teeth. Crowns, veneers, and fillings do not whiten with bleaching, so existing dental work matters when planning an even-looking shade.",
          alternatives: "Ask whether a cleaning, a change in home care, or a different approach to the discoloration would better fit your goals. Whitening is optional; you can discuss the options before deciding.",
          visitExpectations: "Bring your questions and tell us about previous whitening and sensitivity. Discuss the available approach, likely timeline, and limitations before treatment. A particular shade change or a one-visit result cannot be guaranteed.",
          costFactors: [
            "The whitening approach selected and what it includes",
            "Any dental care recommended before whitening",
            "Follow-up products or maintenance, if recommended",
          ],
          maintenance: "Follow the directions for the selected product. If sensitivity develops, contact your dentist about adjusting or pausing treatment. Ask about everyday care and whether future touch-ups are appropriate.",
          faqs: [
            { question: "Will whitening change the color of my crowns or fillings?", answer: "No. Bleaching changes natural teeth, rather than existing crowns or fillings. Discuss these restorations before choosing a shade goal." },
            { question: "Can whitening make teeth sensitive?", answer: "Some people experience sensitivity. Tell the dentist about any existing sensitivity and ask what to do if it occurs during treatment." },
            { question: "How much will whitening cost?", answer: "Ask for the current options and an estimate before proceeding. Confirm what is included and whether any maintenance would have an additional cost. Do not assume your insurance plan covers cosmetic whitening." },
          ],
          sources: [{ label: "ADA MouthHealthy: Teeth Whitening", href: "https://www.mouthhealthy.org/all-topics-a-z/teeth-whitening" }],
        },
      },
      {
        id: "dental-crowns",
        title: "Dental Crowns",
        description: "Restore and protect damaged teeth",
        icon: "crown",
        details: [
          "Custom-fitted porcelain crowns",
          "Natural-looking tooth restoration",
          "Strong, durable materials",
          "A treatment timeline explained before care",
          "Care planning for damaged teeth",
        ],
        heroDescription: "Custom dental crowns that restore damaged teeth to full function while maintaining a natural, beautiful appearance.",
        longDescription: "Dental crowns are tooth-shaped caps that completely cover a damaged tooth above the gum line. They restore the tooth's shape, size, strength, and improve its appearance while providing long-lasting protection.",
        benefits: [
          "Support for a damaged tooth when a crown is appropriate",
          "Natural appearance and feel",
          "Durable, long-lasting materials",
          "Restores full chewing function",
          "A treatment plan tailored to the tooth",
        ],
        process: [
          "Examination and discussion of treatment options",
          "Review of material, estimate, and expected appointments",
          "Tooth preparation and impression if proceeding",
          "Temporary protection and fabrication as appropriate to the plan",
          "Crown fitting, adjustments, and care instructions",
        ],
        decisionGuide: {
          candidacy: "A crown may be recommended for a broken or weakened tooth, or a tooth with a large filling and limited remaining structure. The dentist examines the tooth before recommending how to restore it.",
          alternatives: "Ask why a crown is recommended for this tooth and whether a filling or another restoration could be appropriate. The options depend on the remaining tooth and your examination.",
          visitExpectations: "Discuss the proposed material, number of appointments, and any temporary crown before treatment. Appointment timing depends on the treatment plan and fabrication process. Call the office to confirm available options rather than assuming same-day treatment.",
          costFactors: [
            "The recommended crown material and fabrication process",
            "Any additional treatment needed for the tooth",
            "Your plan's crown benefits, deductible, and limitations",
          ],
          maintenance: "Continue daily brushing, cleaning between teeth, and regular dental visits. Ask for instructions specific to any temporary or final crown, and contact the office if it feels loose or uncomfortable.",
          faqs: [
            { question: "Can I get a crown in one visit?", answer: "Call to confirm the options available for your case. The dentist will explain the expected appointments and whether temporary protection is needed before you proceed." },
            { question: "Why a crown instead of another filling?", answer: "A crown can support a tooth that has too little sound structure for a filling alone. Your dentist can explain the findings for your tooth and any reasonable alternatives." },
            { question: "Will insurance pay for my crown?", answer: "Coverage depends on your plan and proposed treatment. Ask for an estimate and confirm benefits and limitations with your insurer before proceeding." },
          ],
          sources: [
            { label: "ADA MouthHealthy: Crowns", href: "https://www.mouthhealthy.org/all-topics-a-z/crowns" },
            { label: "ADA MouthHealthy: Brushing Your Teeth", href: "https://www.mouthhealthy.org/all-topics-a-z/brushing-your-teeth" },
          ],
        },
      },
    ],
  },
  {
    id: "tmj",
    title: "TMJ Treatment",
    description: "Relief for jaw pain and dysfunction",
    icon: "jaw-tmj",
    details: [
      "Comprehensive TMJ/TMD evaluation and diagnosis",
      "Custom night guards to prevent teeth grinding",
      "Physical therapy and jaw exercises",
      "Advanced CBCT imaging for precise assessment",
      "Personalized treatment plans for lasting relief",
    ],
  },
];
