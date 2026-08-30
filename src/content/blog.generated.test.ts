import { describe, expect, it } from "vitest";
import { additionalBlogPosts } from "@/content/blog.generated";

const badBreathPost = additionalBlogPosts.find(
  (post) =>
    post.slug === "why-does-my-child-have-bad-breath-even-after-brushing-los-gatos",
);

const spaceMaintainerPost = additionalBlogPosts.find(
  (post) => post.slug === "does-my-child-need-a-space-maintainer-los-gatos",
);

describe("child space-maintainer article", () => {
  it("uses a current, non-diagnostic quick answer without repeating the introduction", () => {
    expect(spaceMaintainerPost).toBeDefined();
    expect(spaceMaintainerPost!.updatedAt).toBe("2026-08-30");
    expect(spaceMaintainerPost!.quickAnswer).toMatch(/may be considered/i);
    expect(spaceMaintainerPost!.quickAnswer).toMatch(/not every child needs one/i);
    expect(spaceMaintainerPost!.intro).not.toContain(spaceMaintainerPost!.quickAnswer);
  });

  it("links to the specific authoritative sources", () => {
    expect(spaceMaintainerPost!.sources.map((source) => source.href)).toEqual([
      "https://www.aapd.org/media/Policies_Guidelines/BP_DevelopDentition.pdf",
      "https://commons.ada.org/journalmichigandentalassociation/vol105/iss1/3/",
    ]);
  });

  it("does not claim that Dr. Chuang medically reviewed the article", () => {
    const serializedPost = JSON.stringify(spaceMaintainerPost);
    expect(serializedPost).not.toMatch(/medically reviewed/i);
    expect(serializedPost).not.toMatch(/reviewed by dr\. chuang/i);
  });
});

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
