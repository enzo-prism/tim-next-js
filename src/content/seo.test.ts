import { describe, expect, it } from "vitest";
import { resolvePageMeta } from "@/content/seo";

describe("priority search snippets", () => {
  it.each(["/", "/areas-we-serve/santa-cruz", "/tmj"])(
    "keeps the %s title within 60 characters",
    (path) => {
      expect(resolvePageMeta(path).title.length).toBeLessThanOrEqual(60);
    },
  );

  it("leads the homepage title with the local dentist query", () => {
    expect(resolvePageMeta("/").title).toBe("Los Gatos Dentist | Family First Smile Care");
  });

  it("does not make an unsupported expert claim in the TMJ snippet", () => {
    const tmjMeta = resolvePageMeta("/tmj");

    expect(`${tmjMeta.title} ${tmjMeta.description}`).not.toMatch(/\bexpert\b/i);
  });
});
