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

describe("sitewide entity graph", () => {
  it("joins the website, practice and lead dentist by stable IDs", async () => {
    const { buildSiteGraphSchema, entityIds } = await import("@/content/structured-data");
    const graph = buildSiteGraphSchema();
    const nodes = graph["@graph"] as Array<Record<string, unknown>>;

    expect(graph["@context"]).toBe("https://schema.org");
    expect(nodes.map((node) => node["@id"])).toEqual([
      entityIds.website,
      entityIds.practice,
      entityIds.leadDentist,
    ]);
    nodes.forEach((node) => expect(node).not.toHaveProperty("@context"));

    const [website, practice, dentist] = nodes;
    expect(website.publisher).toEqual({ "@id": entityIds.practice });
    expect(practice.employee).toEqual({ "@id": entityIds.leadDentist });
    expect(dentist.worksFor).toEqual({ "@id": entityIds.practice });
  });

  it("lists the Yelp profile the footer links to", async () => {
    const { buildLocalBusinessSchema } = await import("@/content/structured-data");
    const { yelpBusinessProfileUrl } = await import("@/data/reviews");
    expect(buildLocalBusinessSchema().sameAs).toContain(yelpBusinessProfileUrl);
  });
});
