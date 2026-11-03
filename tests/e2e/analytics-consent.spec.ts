import { expect, test, type Page, type Route } from "@playwright/test";
import { mkdir, writeFile } from "node:fs/promises";
import path from "node:path";
import { CANONICAL_GA_MEASUREMENT_ID } from "../../src/lib/tracking-config";

const ARTIFACT_DIR = "/opt/cursor/artifacts/analytics-consent";

type CollectHit = {
  url: string;
  method: string;
  at: string;
};

const countDataLayerEvents = async (page: Page, eventName: string) =>
  page.evaluate(
    (name) =>
      window.dataLayer.filter(
        (entry) => entry?.[0] === "event" && entry?.[1] === name,
      ).length,
    eventName,
  );

const isCollectUrl = (url: string) => {
  try {
    const parsed = new URL(url);
    return (
      parsed.pathname.includes("/g/collect") ||
      parsed.pathname.endsWith("/collect") ||
      parsed.pathname.includes("/j/collect")
    );
  } catch {
    return url.includes("/g/collect");
  }
};

const installCollectInterceptor = async (page: Page, hits: CollectHit[]) => {
  const handle = async (route: Route) => {
    const url = route.request().url();
    if (url.includes("googletagmanager.com/gtag/js")) {
      await route.continue();
      return;
    }
    if (isCollectUrl(url)) {
      hits.push({
        url,
        method: route.request().method(),
        at: new Date().toISOString(),
      });
      await route.fulfill({ status: 204, body: "" });
      return;
    }
    await route.continue();
  };

  await page.route("https://www.googletagmanager.com/**", handle);
  await page.route("https://www.google-analytics.com/**", handle);
  await page.route("https://analytics.google.com/**", handle);
  await page.route("https://*.google-analytics.com/**", handle);
};

const stubGtag = async (page: Page) => {
  await page.route("https://www.googletagmanager.com/gtag/js**", async (route) => {
    await route.fulfill({ contentType: "application/javascript", body: "" });
  });
};

const writeArtifact = async (name: string, body: string) => {
  await mkdir(ARTIFACT_DIR, { recursive: true });
  await writeFile(path.join(ARTIFACT_DIR, name), body);
};

const screenshotBanner = async (page: Page, name: string) => {
  await mkdir(ARTIFACT_DIR, { recursive: true });
  await page.screenshot({
    path: path.join(ARTIFACT_DIR, name),
    fullPage: false,
  });
};

const parseCollect = (url: string) => {
  const parsed = new URL(url);
  return {
    tid: parsed.searchParams.get("tid"),
    en: parsed.searchParams.get("en"),
    gcs: parsed.searchParams.get("gcs"),
    gcd: parsed.searchParams.get("gcd"),
  };
};

test.describe("GA4 consent collection", () => {
  test("includes Allow and No thanks in the first HTML", async ({ request }) => {
    const response = await request.get("/");
    expect(response.ok()).toBeTruthy();
    const html = await response.text();
    expect(html).toContain('aria-label="Allow analytics"');
    expect(html).toContain("No thanks");
    expect(html).toContain("Analytics privacy choices");
    expect(html).toContain("analytics_storage: 'granted'");
    expect(html).toContain('"GB"');
    expect(html).toContain('"CH"');
    expect(html).toContain("ga-disable-G-L7MH47XYXL");
  });

  test("loads G-L7MH47XYXL and records page_view without a banner choice", async ({ page }) => {
    const gtagRequests: string[] = [];

    await page.route("https://www.googletagmanager.com/gtag/js**", async (route) => {
      gtagRequests.push(route.request().url());
      await route.fulfill({ contentType: "application/javascript", body: "" });
    });

    await page.goto("/");
    await expect(page.getByRole("button", { name: "Allow analytics" })).toBeVisible();

    await expect.poll(() => gtagRequests.length).toBeGreaterThan(0);
    expect(gtagRequests.some((url) => url.includes(`id=${CANONICAL_GA_MEASUREMENT_ID}`))).toBe(
      true,
    );
    expect(gtagRequests.some((url) => url.includes("G-54ESSN4BF8"))).toBe(false);

    await expect.poll(async () => countDataLayerEvents(page, "page_view")).toBeGreaterThan(0);

    const sendTo = await page.evaluate(() => {
      const event = window.dataLayer.find(
        (entry) => entry?.[0] === "event" && entry?.[1] === "page_view",
      );
      return event?.[2]?.send_to;
    });
    expect(sendTo).toBe(CANONICAL_GA_MEASUREMENT_ID);
  });

  test("fresh profile fires an intercepted collect hit with analytics granted", async ({
    page,
  }, testInfo) => {
    test.skip(testInfo.project.name !== "desktop", "Collect proof is recorded once on desktop.");

    const hits: CollectHit[] = [];
    await installCollectInterceptor(page, hits);

    await page.goto("/");
    await expect(page.getByRole("region", { name: "Analytics privacy choices" })).toBeVisible();
    await screenshotBanner(page, "banner-fresh-prompt.png");

    await expect
      .poll(() => hits.find((hit) => parseCollect(hit.url).tid === CANONICAL_GA_MEASUREMENT_ID), {
        timeout: 20_000,
      })
      .toBeTruthy();

    const pageView = hits.find((hit) => {
      const parsed = parseCollect(hit.url);
      return parsed.tid === CANONICAL_GA_MEASUREMENT_ID && parsed.en === "page_view";
    });
    expect(pageView).toBeTruthy();
    const granted = parseCollect(pageView!.url);
    // Consent Mode v2: G1 + ads + analytics. Analytics granted is the trailing 1
    // in G101 / G1x1; ads remain denied.
    expect(granted.gcs === null || /G1.1/.test(granted.gcs)).toBeTruthy();

    await writeArtifact(
      "collect-fresh.json",
      `${JSON.stringify(
        {
          hits: hits.map((hit) => ({ ...hit, ...parseCollect(hit.url) })),
        },
        null,
        2,
      )}\n`,
    );
  });

  test("No thanks stops collect hits and is remembered across reload", async ({
    page,
  }, testInfo) => {
    test.skip(testInfo.project.name !== "desktop", "Collect proof is recorded once on desktop.");

    const hits: CollectHit[] = [];
    await installCollectInterceptor(page, hits);

    await page.goto("/");
    await expect
      .poll(() => hits.some((hit) => parseCollect(hit.url).tid === CANONICAL_GA_MEASUREMENT_ID), {
        timeout: 20_000,
      })
      .toBeTruthy();

    const beforeDecline = hits.length;
    await page.getByRole("button", { name: "No thanks" }).click();
    await expect(page.getByRole("region", { name: "Analytics privacy choices" })).toHaveCount(0);
    await screenshotBanner(page, "banner-after-no-thanks.png");

    expect(
      await page.evaluate(() => window.localStorage.getItem("ffsc_analytics_consent_v1")),
    ).toBe("denied");
    expect(await page.evaluate(() => window["ga-disable-G-L7MH47XYXL"])).toBe(true);

    await page.waitForTimeout(1500);
    expect(hits.length).toBe(beforeDecline);

    await page.reload();
    await expect(page.getByRole("region", { name: "Analytics privacy choices" })).toHaveCount(0);
    await screenshotBanner(page, "banner-after-reload-opt-out.png");
    await page.waitForTimeout(2000);
    expect(hits.length).toBe(beforeDecline);
    expect(
      await page.evaluate(() => document.getElementById("google-analytics")),
    ).toBeNull();

    await writeArtifact(
      "collect-after-opt-out.json",
      `${JSON.stringify({ beforeDecline, after: hits }, null, 2)}\n`,
    );
  });

  test("a mocked contact submit sends generate_lead without Allow", async ({ page }, testInfo) => {
    test.skip(testInfo.project.name !== "desktop", "Collect proof is recorded once on desktop.");

    const hits: CollectHit[] = [];
    await installCollectInterceptor(page, hits);
    await page.route("**/api/contacts", async (route) => {
      await route.fulfill({
        status: 200,
        contentType: "application/json",
        body: JSON.stringify({
          success: true,
          created: true,
          delivered: true,
          leadId: "lead-analytics-proof",
          serviceId: null,
        }),
      });
    });

    await page.goto("/contact");
    await page.getByLabel("First Name *").fill("Taylor");
    await page.getByLabel("Last Name *").fill("Patient");
    await page.getByLabel("Email Address *").fill("taylor@example.com");
    await page
      .getByLabel(/I agree that Family First Smile Care may contact me/i)
      .check();
    await page.getByRole("button", { name: "Send Message" }).click();

    await expect(page.getByText("Thank you. Our team will get back to you soon.")).toBeVisible();
    await expect.poll(async () => countDataLayerEvents(page, "generate_lead")).toBe(1);

    await expect
      .poll(
        () =>
          hits.some((hit) => {
            const parsed = parseCollect(hit.url);
            return parsed.tid === CANONICAL_GA_MEASUREMENT_ID && parsed.en === "generate_lead";
          }),
        { timeout: 20_000 },
      )
      .toBeTruthy();

    await screenshotBanner(page, "banner-form-submit-prompt-still-visible.png");
    await writeArtifact(
      "collect-generate-lead.json",
      `${JSON.stringify(
        hits.filter((hit) => parseCollect(hit.url).en === "generate_lead"),
        null,
        2,
      )}\n`,
    );
  });

  test("records the EEA/UK/CH denied default even when the browser is not in those regions", async ({
    page,
  }) => {
    await stubGtag(page);
    await page.goto("/");

    const defaults = await page.evaluate(() =>
      window.dataLayer
        .filter((entry) => entry?.[0] === "consent" && entry?.[1] === "default")
        .map((entry) => entry?.[2]),
    );

    const regionDenied = defaults.find(
      (entry) => entry?.analytics_storage === "denied" && Array.isArray(entry?.region),
    );
    const globalGranted = defaults.find(
      (entry) => entry?.analytics_storage === "granted" && !entry?.region,
    );

    expect(regionDenied?.region).toEqual(
      expect.arrayContaining(["AT", "FR", "DE", "GB", "CH"]),
    );
    expect(regionDenied).toEqual(
      expect.objectContaining({
        ad_storage: "denied",
        ad_user_data: "denied",
        ad_personalization: "denied",
      }),
    );
    expect(globalGranted).toEqual(
      expect.objectContaining({
        analytics_storage: "granted",
        ad_storage: "denied",
        ad_user_data: "denied",
        ad_personalization: "denied",
      }),
    );

    await mkdir(ARTIFACT_DIR, { recursive: true });
    await writeFile(
      path.join(ARTIFACT_DIR, "consent-defaults.json"),
      `${JSON.stringify({ defaults, note: "Google applies the region default from IP; Playwright cannot spoof that server-side check." }, null, 2)}\n`,
    );
  });
});
