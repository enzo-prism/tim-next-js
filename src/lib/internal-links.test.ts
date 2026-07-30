import { describe, expect, it } from "vitest";
import { getRelatedLinksForService } from "@/lib/internal-links";

describe("contextual internal links", () => {
  it("links children's dentistry to the child bad-breath guide", () => {
    const relatedHrefs = getRelatedLinksForService("children-dentistry").map(
      (link) => link.href,
    );

    expect(relatedHrefs).toContain(
      "/blog/why-does-my-child-have-bad-breath-even-after-brushing-los-gatos",
    );
  });
});
