import { describe, expect, it } from "vitest";
import robots from "@/app/robots";

describe("robots.txt", () => {
  const result = robots();
  const rules = Array.isArray(result.rules) ? result.rules : [result.rules];

  it("sets no crawl delay for any crawler", () => {
    rules.forEach((rule) => expect(rule.crawlDelay).toBeUndefined());
  });

  it("allows public pages and blocks only API and admin paths", () => {
    rules.forEach((rule) => {
      expect(rule.allow).toBe("/");
      expect(rule.disallow).toEqual(["/api/", "/admin"]);
    });
  });

  it("points at the canonical sitemap", () => {
    expect(result.sitemap).toBe("https://www.famfirstsmile.com/sitemap.xml");
  });
});
