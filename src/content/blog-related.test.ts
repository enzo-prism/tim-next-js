import { describe, expect, it } from "vitest";
import { blogTopics, getAllBlogPosts, getMoreArticlesFor } from "@/content/blog";

describe("related articles", () => {
  const posts = getAllBlogPosts();

  const group = (category: string) =>
    blogTopics.find((topic) => topic.categories.includes(category))?.id ?? category;

  it("returns three other articles, up to two from the same topic first", () => {
    for (const post of posts) {
      const related = getMoreArticlesFor(post, posts);
      expect(related).toHaveLength(3);
      expect(new Set(related.map((item) => item.slug)).size).toBe(3);
      expect(related.map((item) => item.slug)).not.toContain(post.slug);
      const own = group(post.category);
      const sameCount = posts.filter((item) => group(item.category) === own && item.slug !== post.slug).length;
      related.slice(0, Math.min(2, sameCount)).forEach((item) => expect(group(item.category)).toBe(own));
      expect(related.some((item) => group(item.category) !== own)).toBe(true);
    }
  });

  it("links every article from at least one other article", () => {
    const inbound = new Map(posts.map((post) => [post.slug, 0]));
    for (const post of posts) {
      for (const item of getMoreArticlesFor(post, posts)) {
        inbound.set(item.slug, (inbound.get(item.slug) ?? 0) + 1);
      }
    }
    const orphans = [...inbound].filter(([, count]) => count === 0).map(([slug]) => slug);
    expect(orphans).toEqual([]);
  });
});
