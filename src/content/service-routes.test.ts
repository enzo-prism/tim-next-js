import { existsSync, readdirSync } from "node:fs";
import { describe, expect, it } from "vitest";
import { getServiceDetailStaticParams, servicesWithDedicatedRoutes } from "@/content/service-routes";

const servicesAppDir = new URL("../app/services/", import.meta.url);

describe("service detail prerendering", () => {
  it("never prerenders a service that has its own page", () => {
    const dedicatedRoutes = readdirSync(servicesAppDir, { withFileTypes: true })
      .filter((entry) => entry.isDirectory() && !entry.name.startsWith("["))
      .filter((entry) => existsSync(new URL(`${entry.name}/page.tsx`, servicesAppDir)))
      .map((entry) => entry.name);
    const prerendered = getServiceDetailStaticParams().map((params) => params.serviceId);

    expect(dedicatedRoutes).toContain("invisalign");
    for (const route of dedicatedRoutes) {
      expect(prerendered).not.toContain(route);
    }
    for (const id of servicesWithDedicatedRoutes) {
      expect(dedicatedRoutes).toContain(id);
    }
  });

  it("still prerenders the generic service pages", () => {
    const prerendered = getServiceDetailStaticParams().map((params) => params.serviceId);

    expect(prerendered).toEqual(
      expect.arrayContaining(["family-dentistry", "children-dentistry", "dental-exams", "teeth-whitening"]),
    );
  });
});
