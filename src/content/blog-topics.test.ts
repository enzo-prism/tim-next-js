import { describe, expect, it } from "vitest";
import { blogTopics, getAllBlogPosts, getBlogTopicHref, getPostsForTopic, resolveBlogTopic } from "./blog";

describe("patient-resource topics", () => {
  it("supports shareable URL choices and returns all articles for invalid choices", () => {
    expect(resolveBlogTopic(["prevention", "children"])?.id).toBe("prevention");
    expect(resolveBlogTopic("unknown-topic")).toBeUndefined();
    expect(getPostsForTopic(resolveBlogTopic("unknown-topic"))).toEqual(getAllBlogPosts());
    expect(getBlogTopicHref(resolveBlogTopic("jaw-pain")!)).toBe("/blog?topic=jaw-pain#articles");
  });

  it("groups both prevention category labels without pulling in unrelated posts", () => {
    const posts = getPostsForTopic(resolveBlogTopic("prevention"));
    expect(posts.length).toBeGreaterThan(0);
    expect(posts.some((post) => post.slug === "how-often-dental-cleaning-los-gatos")).toBe(true);
    expect(posts.every((post) => ["Preventive Care", "Preventive Dentistry"].includes(post.category))).toBe(true);
  });

  it("provides focused urgent guidance alongside an actionable care route", () => {
    const topic = resolveBlogTopic("urgent")!;
    expect(getPostsForTopic(topic).map((post) => post.slug).sort()).toEqual([
      "child-knocked-out-tooth-los-gatos",
      "what-should-you-do-if-your-child-has-a-toothache-los-gatos",
    ]);
    expect(topic.careHref).toBe("/urgent-dental-care");
  });

  it("makes every topic useful and keeps every article discoverable", () => {
    for (const topic of blogTopics) expect(getPostsForTopic(topic).length).toBeGreaterThan(0);
    for (const post of getAllBlogPosts()) expect(blogTopics.some((topic) => getPostsForTopic(topic).some((item) => item.slug === post.slug))).toBe(true);
  });
});
