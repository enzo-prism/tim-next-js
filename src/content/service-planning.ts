import type { ServiceDecisionGuide } from "./services";

// General education and existing practice facts only. Local fees, durations,
// network participation, and clinician attestations require separate confirmation.
export const servicePlanningGuides: Record<string, ServiceDecisionGuide> = {
  "dental-exams": {
    candidacy: "A dental exam checks the health of your teeth, gums, bite, and oral tissues. It can help identify concerns before they hurt and give you a clear plan for preventive care or treatment.",
    alternatives: "A routine checkup, an evaluation of a specific concern, and an urgent visit have different goals. Tell the team why you are coming so they can help arrange the right starting point.",
    visitExpectations: "At our Los Gatos office, Dr. Chuang reviews your medical and dental history, examines your mouth, discusses any imaging needed, and explains the findings. Bring a medication list and ask how to transfer previous dental records. Confirm the visit length and whether a cleaning is included when you arrange the appointment.",
    costFactors: [
      "Whether you need a routine examination or an evaluation of a specific concern",
      "Any imaging or additional care recommended after reviewing your history",
      "Your exact plan's benefits, deductible, and network rules",
    ],
    maintenance: "Your next exam interval depends on your oral health and risk factors. Ask which changes to watch for between visits and how to coordinate examinations with cleanings.",
    faqs: [
      { question: "What is included in a comprehensive dental exam?", answer: "An examination reviews your history, teeth, gums, bite, and oral tissues, including an oral cancer screening. Dr. Chuang explains the findings and next steps. Imaging is considered when clinically needed." },
      { question: "Will I have X-rays at every visit?", answer: "Not necessarily. The need for imaging depends on your examination, symptoms, risk factors, and previous images. Tell the team when and where your last dental X-rays were taken." },
      { question: "Does my first dental exam include a cleaning?", answer: "An exam and a cleaning serve different purposes. Confirm with the office whether both are planned for your appointment; gum findings can affect which cleaning is appropriate." },
      { question: "How long will my appointment take?", answer: "Ask the team to confirm the time reserved for your particular visit, including any planned cleaning or imaging, before you arrive." },
      { question: "How is a child's exam different?", answer: "A child's visit also considers tooth development, brushing habits, feeding, and cavity prevention. Parents can share questions and comfort needs so the visit fits their child's age." },
    ],
    sources: [{ label: "MedlinePlus: Dental exam", href: "https://medlineplus.gov/lab-tests/dental-exam/" }],
  },
  "dental-hygiene": {
    candidacy: "Professional teeth cleaning removes plaque and hardened tartar that brushing and flossing cannot fully address. The gum assessment helps determine whether routine preventive cleaning or a different periodontal treatment is appropriate.",
    alternatives: "Routine cleaning and periodontal deep cleaning are different procedures. Scaling and root planing may be recommended for gum disease; it is not an automatic part of every cleaning. Ask what your gum findings mean and why a particular treatment is recommended.",
    visitExpectations: "We assess gum health, remove buildup, and discuss brushing and flossing. Polishing and fluoride depend on your needs. Tell the team about sensitivity or previous gum treatment, and confirm the planned visit length and whether an examination is included.",
    costFactors: [
      "Routine preventive cleaning versus treatment for diagnosed gum disease",
      "Whether an examination, imaging, or other recommended services are planned",
      "Your specific insurance benefits and any out-of-pocket amount",
    ],
    maintenance: "Cleaning intervals are personalized. A six-month routine suits many people, while others need a different schedule based on gum health, cavity risk, or prior periodontal treatment. Ask which home-care changes would help you most.",
    faqs: [
      { question: "Is teeth cleaning the same as deep cleaning?", answer: "No. Routine cleaning removes buildup to support preventive care. Periodontal deep cleaning treats diagnosed gum disease and may involve scaling and root planing below the gumline. Your examination determines the appropriate care." },
      { question: "How often should I have my teeth cleaned?", answer: "Many people return around every six months, but your dentist or hygienist may recommend a different interval based on gum health, buildup, cavity risk, and treatment history." },
      { question: "Can you help if cleanings make my teeth sensitive?", answer: "Tell the team about sensitivity before the visit and point out which areas bother you. Ask for pauses and an explanation of the recommended approach." },
      { question: "Can I get a cleaning without dental insurance?", answer: "Call the office to discuss a self-pay visit and request an estimate for the planned services. Confirm what is included before proceeding." },
    ],
    sources: [
      { label: "NIDCR: Gum disease", href: "https://www.nidcr.nih.gov/health-info/gum-disease" },
      { label: "MedlinePlus: Dental exam", href: "https://medlineplus.gov/lab-tests/dental-exam/" },
    ],
  },
  "family-dentistry": {
    candidacy: "Family dentistry provides a dental home for children, teens, adults, and older adults. At Family First Smile Care, Dr. Chuang and the Los Gatos team offer examinations, cleanings, preventive guidance, and individualized treatment planning.",
    alternatives: "A family dentist can help with everyday care and identify when a specialist's evaluation would be useful. Children's care from a general dentist and care from a pediatric specialist are different options; ask which setting fits your child's needs.",
    visitExpectations: "Tell us who needs a visit and whether each person has a concern, past dental anxiety, or previous treatment to discuss. Each family member needs an individual health history and care plan. Ask the office how to coordinate appointments rather than assuming everyone can be seen at the same time.",
    costFactors: [
      "The examination and preventive or restorative care planned for each person",
      "Any imaging or follow-up recommended for individual needs",
      "Each family member's coverage and plan limitations",
    ],
    maintenance: "Children's development, adult gum health, and the care of crowns or other restorations can call for different routines. We explain the plan for each person so families can keep track of home care and follow-up visits.",
    faqs: [
      { question: "Can children and adults come to the same dental office?", answer: "Yes. Family First Smile Care sees children, teens, adults, and grandparents in its Los Gatos office. Each person's examination and recommendations are tailored to their needs." },
      { question: "Can we coordinate appointments for our family?", answer: "Tell the team how many people need care and your preferred days. They can explain the available scheduling options and confirm each appointment." },
      { question: "What if I feel anxious about dental treatment?", answer: "Share your concerns when arranging the visit. Dr. Chuang explains findings and options, and you can ask for a pause. Blankets, water, and entertainment are available during treatment." },
      { question: "When might a specialist be involved?", answer: "Some concerns need additional expertise or a different treatment setting. After examining you, the dentist can explain whether a referral would help and what to discuss with that provider." },
    ],
    sources: [{ label: "MedlinePlus: Dental exam", href: "https://medlineplus.gov/lab-tests/dental-exam/" }],
  },
  "children-dentistry": {
    candidacy: "Children's dental care follows teeth as they develop and helps families build brushing, eating, and preventive-care habits. Early visits also give parents a familiar place to raise questions.",
    alternatives: "Dr. Chuang is a general dentist who provides family care, including care for children. A pediatric dentist has additional specialty training. Ask about a referral if your child's treatment, medical needs, or comfort would benefit from a different setting.",
    visitExpectations: "Tell us about your child's age, previous dental experiences, medical history, and comfort needs. Visits may include a gentle examination, cleaning when appropriate, and a conversation with parents about prevention. Start with the baby's-first-visit guide for an infant or toddler.",
    costFactors: ["The examination, preventive services, and any recommended imaging", "Treatment needs identified during the visit", "Your child's exact insurance benefits and exclusions"],
    maintenance: "The dentist recommends a follow-up interval based on your child's development and cavity risk. Ask for brushing and fluoride guidance appropriate to your child's age.",
    faqs: [
      { question: "When should my child first see a dentist?", answer: "Arrange a first visit when the first tooth appears, within six months of that tooth, and no later than the first birthday. Early visits focus on prevention and helping parents care for developing teeth." },
      { question: "Is Dr. Chuang a pediatric specialist?", answer: "Dr. Chuang is a general dentist providing family dentistry, including children's care. If a pediatric specialist or another treatment setting would be helpful, discuss the next step with the team." },
      { question: "Does every child need sedation?", answer: "No. A child's treatment needs, medical history, and ability to participate all matter. Ask which comfort options are appropriate and whether any recommended treatment needs a referral. Confirm available services with the office." },
    ],
    sources: [{ label: "AAPD: Your child's first dental visit", href: "https://www.aapd.org/resources/parent/faq/" }],
  },
};

export const tmjPlanningGuide: ServiceDecisionGuide = {
  candidacy: "Persistent jaw pain, painful clicking, locking, or difficulty chewing can be reasons to arrange an evaluation. TMJ names the jaw joint; TMD refers to disorders involving the joint or chewing muscles. A painless click alone often does not need treatment.",
  alternatives: "Many TMD symptoms improve with conservative care. Depending on your examination, discussion may include habits, guided exercises, a protective appliance, or referral. Treatments that permanently change teeth or the bite should not be presented as a routine cure for TMD.",
  visitExpectations: "Describe when symptoms started, what makes them better or worse, and any previous care. Bring an existing guard or appliance. Dr. Chuang evaluates your symptoms and jaw function, discusses whether imaging is useful, and explains next steps or an appropriate referral.",
  costFactors: ["The examination and any imaging recommended for your situation", "Whether an appliance, follow-up, or another provider's evaluation is needed", "Whether your specific dental or medical plan offers applicable benefits"],
  maintenance: "Follow the instructions for any recommended appliance or exercises. Contact the team if symptoms worsen or an appliance causes pain or changes the way your teeth fit together. Follow-up depends on the findings and care plan.",
  faqs: [
    { question: "Can a night guard cure TMJ problems?", answer: "A guard can help protect teeth from grinding, but it does not guarantee relief from TMD or stop grinding. The examination helps determine whether an appliance or another approach is appropriate." },
    { question: "Do I need braces or crowns to treat jaw pain?", answer: "Jaw pain needs an evaluation before treatment is chosen. NIDCR reports insufficient evidence that treatments changing teeth or the bite treat TMD, and some may worsen symptoms. Discuss conservative options and referral when appropriate." },
    { question: "What if I need a TMJ specialist?", answer: "Dr. Chuang is a general dentist. Ask whether your findings would benefit from an orofacial pain specialist or another clinician, and what a referral would involve." },
    { question: "How much is a TMJ consultation?", answer: "Call the office for the current evaluation fee and ask what it includes. Any imaging, appliance, or further treatment should be discussed separately. Coverage depends on your particular plan." },
    { question: "Should jaw clicking always be treated?", answer: "Not necessarily. Clicking without pain is common and often does not need treatment. Pain, locking, or difficulty using your jaw are reasons to ask for an evaluation." },
  ],
  sources: [{ label: "NIDCR: Temporomandibular disorders", href: "https://www.nidcr.nih.gov/health-info/tmd" }],
};
