import fs from "node:fs";

const sourceTs = "/Users/enzo/.openclaw/workspace/clients/family-first-smile-care/shared/blog-posts.ts";
const targetBlogTs = "/Users/enzo/.openclaw/workspace/clients/tim-next-js/src/content/blog.ts";
const outPath = "/Users/enzo/.openclaw/workspace/clients/tim-next-js/src/content/blog.generated.ts";

const sourceText = fs.readFileSync(sourceTs, "utf8");
const sourceMatch = sourceText.match(/export const blogPosts: BlogPost\[] = (\[[\s\S]*?\]);\n\nexport const blogPostMap/);
if (!sourceMatch) throw new Error("Could not parse source blog posts");
const sourcePosts = JSON.parse(sourceMatch[1]);
const sourceBySlug = new Map(sourcePosts.map((post) => [post.slug, post]));

const existingBlogText = fs.readFileSync(targetBlogTs, "utf8");
const existingSlugs = new Set([...existingBlogText.matchAll(/slug:\s*"([^"]+)"/g)].map((match) => match[1]));

const staticLinks = {
  "/": { href: "/", title: "Home", description: "Return to the Family First Smile Care homepage." },
  "/blog": { href: "/blog", title: "Dental Blog", description: "Helpful articles answering common questions from Los Gatos families." },
  "/services": { href: "/services", title: "All Dental Services", description: "Explore preventive, restorative, cosmetic, and family dental care in one place." },
  "/contact": { href: "/contact", title: "Contact & Scheduling", description: "Ask a question, request an appointment, or get directions to our office." },
  "/book-appointment": { href: "/book-appointment", title: "Book an Appointment", description: "Request a visit with Family First Smile Care." },
  "/patient-info": { href: "/patient-info", title: "Patient Information", description: "FAQs, what to expect, and helpful resources for your visit." },
  "/patient-info/brushing": { href: "/patient-info/brushing", title: "How to Brush Properly", description: "Step-by-step brushing tips for healthier teeth and gums." },
  "/patient-info/flossing": { href: "/patient-info/flossing", title: "Flossing Fundamentals", description: "Daily flossing technique to help prevent cavities and gum inflammation." },
  "/patient-info/nutrition": { href: "/patient-info/nutrition", title: "Nutrition for Healthy Teeth", description: "Tooth-friendly eating habits and foods to limit." },
  "/team": { href: "/team", title: "Meet Our Team", description: "Get to know Dr. Chuang and the caring team behind your visit." },
  "/testimonials": { href: "/testimonials", title: "Patient Testimonials", description: "Read what patients say about gentle care, family dentistry, Invisalign, and TMJ support." },
  "/tmj": { href: "/tmj", title: "TMJ Treatment", description: "Care for jaw pain, headaches, and TMJ/TMD symptoms." },
  "/services/children-dentistry": { href: "/services/children-dentistry", title: "Children's Dentistry", description: "Explore our gentle, prevention-focused approach for kids of different ages." },
  "/services/childrens-dentistry/babys-first-visit": { href: "/services/childrens-dentistry/babys-first-visit", title: "Baby's First Visit", description: "See what happens during infant and toddler dental visits at our Los Gatos office." },
  "/services/dental-hygiene": { href: "/services/dental-hygiene", title: "Dental Hygiene", description: "Professional cleanings and hygiene coaching to support long-term prevention." },
  "/services/dental-exams": { href: "/services/dental-exams", title: "Dental Exams", description: "Learn what comprehensive exams help catch before symptoms become obvious." },
  "/services/family-dentistry": { href: "/services/family-dentistry", title: "General & Family Dentistry", description: "Explore preventive care for children, parents, and older adults in one office." },
  "/services/invisalign": { href: "/services/invisalign", title: "Invisalign", description: "Clear aligner treatment with digital smile planning and comfort-focused care." },
  "/technology/itero-digital-scanner": { href: "/technology/itero-digital-scanner", title: "iTero Digital Scanner", description: "Comfortable 3D digital scans for Invisalign planning and smile previews." },
};

const slugify = (value) =>
  value
    .toLowerCase()
    .replace(/&/g, " and ")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .slice(0, 64) || "section";

const sentenceize = (text) => text.replace(/\s+/g, " ").trim();

const firstSentence = (text) => {
  const cleaned = sentenceize(text);
  const match = cleaned.match(/.+?[.!?](?=\s|$)/);
  return match ? match[0].trim() : cleaned;
};

const remainingSentences = (text) => {
  const cleaned = sentenceize(text);
  const first = firstSentence(cleaned);
  return cleaned.startsWith(first) ? cleaned.slice(first.length).trim() : cleaned;
};

function detectCategory(slug) {
  if (/invisalign|orthodontic/.test(slug)) return "Invisalign & Orthodontics";
  if (/mouthguard|sports/.test(slug)) return "Sports Dentistry";
  if (/bleeding-gums|cleaning|sealants|x-rays/.test(slug)) return "Preventive Care";
  if (/jaw-pain|tmj/.test(slug)) return "TMJ & Jaw Pain";
  if (/child|kids|baby|adult-tooth|cavities|bad-breath|sedation/.test(slug)) return "Children's Dentistry";
  return "Family Dentistry";
}

function heroEyebrowFor(category) {
  switch (category) {
    case "Children's Dentistry":
      return "Los Gatos Parents Guide";
    case "Preventive Care":
      return "Prevention Guide";
    case "Sports Dentistry":
      return "Spring Sports Guide";
    case "Invisalign & Orthodontics":
      return "Smile Planning Guide";
    case "TMJ & Jaw Pain":
      return "Jaw Pain Guide";
    default:
      return "Family Dentistry Guide";
  }
}

function parseMarkdown(markdown) {
  const lines = markdown.replace(/\r\n/g, "\n").split("\n");
  const intro = [];
  const sections = [];
  const faq = [];
  let currentSection = null;
  let inFaq = false;
  let currentFaq = null;
  let pendingBullets = null;

  const flushBullets = () => {
    if (!pendingBullets || !currentSection) return;
    currentSection.bullets = (currentSection.bullets || []).concat(pendingBullets);
    pendingBullets = null;
  };

  const pushSection = () => {
    if (!currentSection) return;
    flushBullets();
    sections.push(currentSection);
    currentSection = null;
  };

  const pushFaq = () => {
    if (!currentFaq) return;
    currentFaq.answer = sentenceize(currentFaq.answer);
    if (currentFaq.question && currentFaq.answer) faq.push(currentFaq);
    currentFaq = null;
  };

  for (const raw of lines) {
    const line = raw.trim();
    if (!line) {
      flushBullets();
      continue;
    }

    if (/^##\s+/i.test(line)) {
      pushFaq();
      pushSection();
      const title = line.replace(/^##\s+/, "").trim();
      inFaq = title.toLowerCase() === "faq";
      if (!inFaq) currentSection = { id: slugify(title), title, paragraphs: [], bullets: [] };
      continue;
    }

    if (inFaq && /^###\s+/i.test(line)) {
      pushFaq();
      currentFaq = { question: line.replace(/^###\s+/, "").trim(), answer: "" };
      continue;
    }

    if (inFaq) {
      if (currentFaq) currentFaq.answer += (currentFaq.answer ? " " : "") + line;
      continue;
    }

    if (!currentSection) {
      intro.push(sentenceize(line));
      continue;
    }

    if (/^[-*]\s+/.test(line) || /^\d+[.)]\s+/.test(line)) {
      const item = line.replace(/^[-*]\s+/, "").replace(/^\d+[.)]\s+/, "").trim();
      pendingBullets = pendingBullets || [];
      pendingBullets.push(item);
      continue;
    }

    flushBullets();
    currentSection.paragraphs.push(sentenceize(line));
  }

  pushFaq();
  pushSection();

  return {
    intro: intro.slice(0, 4),
    sections: sections
      .filter((section) => section.title && (section.paragraphs.length || section.bullets.length))
      .map((section) => ({
        ...section,
        paragraphs: section.paragraphs.length ? section.paragraphs : undefined,
        bullets: section.bullets.length ? section.bullets : undefined,
      })),
    faq,
  };
}

function buildSources(category, slug) {
  if (category === "Children's Dentistry") {
    return [
      { label: "American Academy of Pediatric Dentistry", href: "https://www.aapd.org/resources/parent/" },
      { label: "Stanford Medicine Children's Health oral health guidance", href: "https://www.stanfordchildrens.org/en/topic/default?id=oral-health-90-P01835" },
    ];
  }
  if (category === "Preventive Care") {
    return [
      { label: "American Dental Association oral health topics", href: "https://www.ada.org/resources/ada-library/oral-health-topics" },
      { label: "NIDCR oral hygiene guidance", href: "https://www.nidcr.nih.gov/health-info/oral-hygiene" },
    ];
  }
  if (category === "Sports Dentistry") {
    return [
      { label: "American Academy of Pediatric Dentistry sports safety guidance", href: "https://www.aapd.org/resources/parent/faq/" },
      { label: "American Dental Association mouthguard overview", href: "https://www.ada.org/resources/ada-library/oral-health-topics/mouthguards" },
    ];
  }
  if (category === "Invisalign & Orthodontics") {
    return [
      { label: "American Association of Orthodontists on early evaluations", href: "https://aaoinfo.org/whats-trending/age-7/" },
      { label: "Invisalign treatment overview", href: "https://www.invisalign.com/how-invisalign-works" },
    ];
  }
  if (/adult-tooth-coming-in/.test(slug)) {
    return [
      { label: "American Association of Orthodontists on eruption concerns", href: "https://aaoinfo.org/whats-trending/age-7/" },
      { label: "MedlinePlus teething and tooth eruption overview", href: "https://medlineplus.gov/teething.html" },
    ];
  }
  return [
    { label: "American Dental Association oral health topics", href: "https://www.ada.org/resources/ada-library/oral-health-topics" },
    { label: "NIDCR mouth and dental health guidance", href: "https://www.nidcr.nih.gov/health-info" },
  ];
}

function buildFaqFallback(post, category) {
  const base = firstSentence(post.metaDescription);
  return [
    {
      question: `When should you call a dentist about ${post.primaryKeyword.replace(/ Los Gatos$/i, "")}?`,
      answer: `${base} If the issue is worsening, painful, or keeps coming back, it is smart to have it checked instead of waiting for it to turn into a bigger problem.`,
    },
    {
      question: "Can this wait until the next routine visit?",
      answer: /knocked-out|child-knocked-out-tooth|bad-breath|cavities|white-spots|adult-tooth/.test(post.slug)
        ? "Sometimes no. Trauma, swelling, visible changes, and symptoms that keep returning are all good reasons to call sooner instead of folding the question into a later checkup."
        : "Sometimes, but not always. The safest move is to ask when the symptom is new, persistent, or getting worse, especially if it affects eating, sleeping, sports, or school.",
    },
    {
      question: "Who can help with this in Los Gatos?",
      answer: `Family First Smile Care helps Los Gatos families with ${category.toLowerCase()} questions, preventive visits, and next-step planning that feels calm instead of confusing.`,
    },
  ];
}

function resolveLink(href) {
  if (!href || !href.startsWith("/")) return null;
  if (href.startsWith("/blog/")) {
    const slug = href.replace(/^\/blog\//, "");
    const meta = sourceBySlug.get(slug);
    if (meta) return { href, title: meta.title, description: meta.metaDescription };
  }
  return staticLinks[href] || null;
}

function buildRelatedLinks(post, category) {
  const links = [];
  const seen = new Set();
  const add = (link) => {
    if (!link || !link.href || seen.has(link.href)) return;
    seen.add(link.href);
    links.push(link);
  };

  for (const href of post.internalLinks || []) add(resolveLink(href));

  if (category === "Children's Dentistry") {
    add(staticLinks["/services/children-dentistry"]);
    add(staticLinks["/services/childrens-dentistry/babys-first-visit"]);
    add(resolveLink("/blog/when-should-kids-first-see-a-dentist-los-gatos"));
  } else if (category === "Preventive Care") {
    add(staticLinks["/services/dental-hygiene"]);
    add(staticLinks["/services/dental-exams"]);
    add(resolveLink("/blog/how-often-dental-cleaning-los-gatos"));
  } else if (category === "Sports Dentistry") {
    add(staticLinks["/services/children-dentistry"]);
    add(staticLinks["/contact"]);
  } else if (category === "Invisalign & Orthodontics") {
    add(staticLinks["/services/invisalign"]);
    add(staticLinks["/technology/itero-digital-scanner"]);
  }

  add(staticLinks["/services"]);
  add(staticLinks["/contact"]);
  add(staticLinks["/blog"]);

  return links.slice(0, 6);
}

function buildCta(category) {
  if (category === "Invisalign & Orthodontics") {
    return {
      ctaTitle: "See what the next smile-planning step looks like",
      ctaBody: "If you want clear answers about timing, scans, and whether Invisalign makes sense, we can walk you through it without making the whole thing weird or overwhelming.",
      ctaHref: "/services/invisalign",
      ctaLabel: "Explore Invisalign",
    };
  }
  if (category === "Sports Dentistry") {
    return {
      ctaTitle: "Protect the smile before the season gets messy",
      ctaBody: "If your child is starting a new sport, has braces, or keeps tossing a bulky mouthguard into the bottom of the bag, we can help you choose the next practical step.",
      ctaHref: "/contact",
      ctaLabel: "Ask about mouthguards",
    };
  }
  return {
    ctaTitle: "Get a clear answer before this becomes a bigger problem",
    ctaBody: "Family First Smile Care helps Los Gatos families sort out prevention questions early, with calm guidance and visits that feel straightforward instead of stressful.",
    ctaHref: "/book-appointment",
    ctaLabel: "Book an appointment",
  };
}

const missingPosts = sourcePosts.filter((post) => !existingSlugs.has(post.slug));
const generatedPosts = missingPosts.map((post) => {
  const category = detectCategory(post.slug);
  const parsed = parseMarkdown(post.markdown);
  const cta = buildCta(category);

  return {
    slug: post.slug,
    title: post.title,
    metaTitle: post.metaTitle,
    metaDescription: post.metaDescription,
    excerpt: post.excerpt,
    category,
    primaryKeyword: post.primaryKeyword,
    secondaryKeywords: post.secondaryKeywords,
    publishedAt: post.publishedAt,
    updatedAt: post.publishedAt,
    readingTimeMinutes: post.readTimeMinutes,
    heroEyebrow: heroEyebrowFor(category),
    heroSummary: sentenceize(post.metaDescription),
    quickAnswer: firstSentence(post.excerpt || post.metaDescription),
    quickAnswerSupport: remainingSentences(post.excerpt || post.metaDescription) || sentenceize(post.metaDescription),
    intro: parsed.intro.length ? parsed.intro : [post.excerpt, post.metaDescription],
    sections: parsed.sections,
    faq: parsed.faq.length ? parsed.faq.map((item) => ({ question: item.question, answer: sentenceize(item.answer) })) : buildFaqFallback(post, category),
    relatedLinks: buildRelatedLinks(post, category),
    sources: buildSources(category, post.slug),
    ...cta,
  };
});

const content = `import type { BlogPost } from "./blog";\n\n// Generated from Family First daily SEO drafts that were not yet present in the live Next.js blog.\nexport const additionalBlogPosts: BlogPost[] = ${JSON.stringify(generatedPosts, null, 2)};\n`;
fs.writeFileSync(outPath, content);
console.log(`Wrote ${generatedPosts.length} generated posts to ${outPath}`);
