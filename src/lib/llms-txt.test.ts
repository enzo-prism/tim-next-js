import { describe, expect, it } from "vitest";
import { buildLlmsTxt } from "@/lib/llms-txt";
import { services } from "@/content/services";
import { getAllBlogPosts } from "@/content/blog";
import { getServiceHref } from "@/lib/routes";

describe("llms.txt", () => {
  const text = buildLlmsTxt();

  it("starts with the practice name and summary", () => {
    expect(text.startsWith("# Family First Smile Care\n\n> ")).toBe(true);
  });

  it("lists every service and article page with absolute URLs", () => {
    const serviceIds = services.flatMap((service) => [service.id, ...(service.subServices ?? []).map((sub) => sub.id)]);
    serviceIds.forEach((id) => expect(text).toContain(`(https://www.famfirstsmile.com${getServiceHref(id)})`));
    getAllBlogPosts().forEach((post) => expect(text).toContain(`(https://www.famfirstsmile.com/blog/${post.slug})`));
  });

  it("publishes the office hours and phone used elsewhere on the site", () => {
    expect(text).toContain("Office hours: Mon–Thu, 9 AM–5 PM");
    expect(text).toContain("(408) 358-8100");
  });

  it("keeps every entry on one line", () => {
    text
      .split("\n")
      .filter((line) => line.startsWith("- "))
      .forEach((line) => expect(line).not.toMatch(/\s{2,}/));
  });
});
