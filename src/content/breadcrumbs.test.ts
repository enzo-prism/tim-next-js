import { describe, expect, it } from "vitest";
import { existsSync } from "node:fs";
import path from "node:path";
import { buildRouteBreadcrumbSchema, staticBreadcrumbTrails } from "@/content/breadcrumbs";

const routeFileExists = (route: string) =>
  existsSync(path.join(process.cwd(), "src/app", route, "page.tsx"));

describe("static breadcrumb trails", () => {
  it.each(Object.keys(staticBreadcrumbTrails))("%s points only at real routes and ends on itself", (route) => {
    const trail = staticBreadcrumbTrails[route];
    trail.forEach((crumb) => expect(routeFileExists(crumb.path), crumb.path).toBe(true));
    expect(trail.at(-1)?.path).toBe(route);
  });

  it("builds a Home-first BreadcrumbList with absolute URLs", () => {
    const schema = buildRouteBreadcrumbSchema("/patient-info/flossing");
    expect(schema.itemListElement).toEqual([
      { "@type": "ListItem", position: 1, name: "Home", item: "https://www.famfirstsmile.com" },
      { "@type": "ListItem", position: 2, name: "Patient Info", item: "https://www.famfirstsmile.com/patient-info" },
      {
        "@type": "ListItem",
        position: 3,
        name: "Flossing Fundamentals",
        item: "https://www.famfirstsmile.com/patient-info/flossing",
      },
    ]);
  });

  it("is used by each registered route file", async () => {
    const { readFileSync } = await import("node:fs");
    for (const route of Object.keys(staticBreadcrumbTrails)) {
      const source = readFileSync(path.join(process.cwd(), "src/app", route, "page.tsx"), "utf8");
      expect(source, route).toContain(`buildRouteBreadcrumbSchema("${route}")`);
    }
  });
});
