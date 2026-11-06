import { describe, expect, it } from "vitest";
import { getAllBlogPosts, getBlogPostBySlug } from "./blog";
import { services } from "./services";
import { buildDentistPersonSchema } from "./structured-data";
import { getClinicalReview } from "./clinical-review";
import sitemap from "../app/sitemap";

describe("patient search answers", () => {
  it("replaces the incomplete sedation article with substantive sections and specific questions", () => {
    const post = getBlogPostBySlug("dental-sedation-for-kids-los-gatos")!;
    expect(post.sections.length).toBeGreaterThanOrEqual(4);
    expect(post.faq.some((faq) => faq.question.includes("available at Family First"))).toBe(true);
    expect([...post.intro, ...post.sections.flatMap((section) => section.paragraphs ?? [])].join(" ")).toContain("does not establish");
    expect(getClinicalReview(post)).toBeUndefined();
  });

  it("gives every priority service practical planning answers without inventing local prices", () => {
    for (const id of ["dental-exams", "dental-hygiene", "family-dentistry", "children-dentistry"]) {
      const guide = services.find((service) => service.id === id)!.decisionGuide!;
      expect(guide.faqs.length).toBeGreaterThanOrEqual(3);
      expect(guide.sources.length).toBeGreaterThan(0);
      expect(JSON.stringify(guide)).not.toMatch(/\$\d|guaranteed|same-day appointment|clinically reviewed by/i);
    }
  });

  it("publishes real article dates in the canonical sitemap", () => {
    const urls = sitemap();
    for (const post of getAllBlogPosts()) {
      expect(urls.find((row) => row.url.endsWith(`/blog/${post.slug}`))?.lastModified).toEqual(new Date(post.updatedAt));
    }
    expect(new Set(urls.map((row) => row.url)).size).toBe(urls.length);
  });

  it("connects the dentist's existing identity without inventing specialty credentials", () => {
    const person = buildDentistPersonSchema();
    expect(person.alternateName).toContain("Dr. Timothy Chuang");
    expect(person.sameAs[0]).toMatch(/^https:\/\/findadentist\.ada\.org\//);
    expect(person.jobTitle).not.toMatch(/specialist/);
  });
});
