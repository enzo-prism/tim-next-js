import { describe, expect, it } from "vitest";
import { buildLocalBusinessSchema } from "@/content/structured-data";
import { practiceWeeklyHours } from "@/content/practice-hours";

const dayNames = ["Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"];

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

  it("matches the hours the mobile action bar uses for open-now status", () => {
    const schema = buildLocalBusinessSchema();
    const published = schema.openingHoursSpecification.flatMap((spec) =>
      spec.dayOfWeek.map((day) => ({ day, opens: spec.opens, closes: spec.closes })),
    );

    expect(published).toEqual(
      practiceWeeklyHours.map((entry) => ({
        day: dayNames[entry.weekday],
        opens: entry.opens,
        closes: entry.closes,
      })),
    );
  });
});
