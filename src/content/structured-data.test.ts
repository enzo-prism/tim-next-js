import { describe, expect, it } from "vitest";
import { buildLocalBusinessSchema } from "@/content/structured-data";

describe("local business structured data", () => {
  it("publishes open days without an ambiguous midnight-to-midnight closed day", () => {
    const schema = buildLocalBusinessSchema();

    expect(schema.openingHoursSpecification).toEqual([
      {
        "@type": "OpeningHoursSpecification",
        dayOfWeek: ["Monday", "Tuesday", "Wednesday", "Thursday"],
        opens: "09:00",
        closes: "17:00",
      },
    ]);
  });
});
