import { describe, expect, it } from "vitest";
import { additionalBlogPosts } from "@/content/blog.generated";

const badBreathPost = additionalBlogPosts.find(
  (post) =>
    post.slug === "why-does-my-child-have-bad-breath-even-after-brushing-los-gatos",
);

describe("child bad-breath article", () => {
  it("uses a search title no longer than 60 characters", () => {
    expect(badBreathPost).toBeDefined();
    expect(badBreathPost!.metaTitle.length).toBeLessThanOrEqual(60);
  });

  it("keeps headings in section data instead of paragraph markdown", () => {
    const paragraphs = badBreathPost!.sections.flatMap(
      (section) => section.paragraphs ?? [],
    );

    expect(paragraphs.some((paragraph) => paragraph.startsWith("###"))).toBe(false);
    expect(
      badBreathPost!.sections.map((section) => section.title),
    ).toContain("1. They are brushing, but not cleaning thoroughly");
  });

  it("answers with likely causes and when to contact a dentist", () => {
    expect(badBreathPost!.quickAnswer).toMatch(/tongue buildup/i);
    expect(badBreathPost!.quickAnswerSupport).toMatch(/contact a dentist/i);
  });
});
