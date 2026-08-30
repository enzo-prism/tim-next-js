import { expect, test, type Page } from "@playwright/test";

const PUBLIC_ROUTES = ["/", "/blog"];
const SUPPRESSED_ROUTES = ["/contact", "/book-appointment"];
const CONSENT_STORAGE_KEY = "ffsc_analytics_consent_v1";
const WIDGET_SCRIPT_URL =
  "https://cdn.jsdelivr.net/npm/@elevenlabs/convai-widget-embed@0.11.4";

const widgetStubScript = `
(() => {
  if (customElements.get("elevenlabs-convai")) return;

  class ElevenLabsConvai extends HTMLElement {
    static get observedAttributes() {
      return [
        "action-text",
        "expand-text",
        "start-call-text",
        "dismissible",
        "text-contents",
      ];
    }

    constructor() {
      super();
      this.expanded = false;
      this.dismissed = false;
      this.attachShadow({ mode: "open" });
    }

    connectedCallback() {
      this.render();
    }

    attributeChangedCallback() {
      this.render();
    }

    get textContents() {
      try {
        return JSON.parse(this.getAttribute("text-contents") || "{}");
      } catch {
        return {};
      }
    }

    get actionText() {
      return this.textContents.main_label || this.getAttribute("action-text") || "Need help?";
    }

    get expandText() {
      return this.textContents.expand || this.getAttribute("expand-text") || "Open assistant";
    }

    get startCallText() {
      return this.textContents.start_call || this.getAttribute("start-call-text") || "Talk with us";
    }

    get collapseText() {
      return this.textContents.collapse || "Close assistant";
    }

    get isDismissible() {
      return this.getAttribute("dismissible") === "true";
    }

    render() {
      if (!this.shadowRoot) return;

      const hidden = this.dismissed ? "hidden" : "";
      this.shadowRoot.innerHTML = \`
        <style>
          :host {
            color: var(--el-base-primary, #0c0a09);
            font-family: Arial, sans-serif;
          }

          .overlay {
            position: absolute;
            inset: var(--el-overlay-padding, 16px);
            display: flex;
            flex-direction: column;
            justify-content: flex-end;
            align-items: flex-end;
            gap: 12px;
            pointer-events: none;
          }

          .sheet,
          .launcher,
          .dismiss {
            pointer-events: auto;
          }

          .launcher,
          .dismiss,
          .primary {
            border: 1px solid var(--el-accent-border, #1d4ed8);
            border-radius: var(--el-button-radius, 18px);
            background: var(--el-accent, #2563eb);
            color: var(--el-accent-primary, #ffffff);
            cursor: pointer;
            font: inherit;
          }

          .launcher {
            display: inline-flex;
            align-items: center;
            gap: 10px;
            min-height: 56px;
            padding: 0 18px;
            box-shadow: 0 20px 45px rgba(12, 10, 9, 0.16);
          }

          .orb {
            width: 32px;
            height: 32px;
            border-radius: 999px;
            background: linear-gradient(
              135deg,
              var(--el-accent, #2563eb),
              var(--el-base-primary, #047857)
            );
            flex: none;
          }

          .sheet {
            width: min(380px, calc(100vw - (var(--el-overlay-padding, 16px) * 2)));
            border: 1px solid var(--el-base-border, #e7e5e4);
            border-radius: var(--el-sheet-radius, 28px);
            background: var(--el-base, #ffffff);
            box-shadow: 0 24px 60px rgba(12, 10, 9, 0.18);
            overflow: hidden;
          }

          .sheet[hidden],
          .launcher[hidden],
          .dismiss[hidden] {
            display: none;
          }

          .header {
            display: flex;
            align-items: center;
            justify-content: space-between;
            gap: 12px;
            padding: 18px 18px 0;
          }

          .title {
            font-size: 0.95rem;
            font-weight: 700;
          }

          .body {
            padding: 18px;
            display: grid;
            gap: 14px;
          }

          .copy {
            color: var(--el-base-subtle, #766f6a);
            line-height: 1.5;
            margin: 0;
          }

          .primary {
            min-height: 46px;
            padding: 0 16px;
            justify-self: start;
          }

          .dismiss {
            min-height: 40px;
            padding: 0 14px;
            background: var(--el-base, #ffffff);
            color: var(--el-base-primary, #0c0a09);
            border-color: var(--el-base-border, #e7e5e4);
          }
        </style>
        <div class="overlay" data-testid="mock-elevenlabs-overlay">
          <section class="sheet" data-testid="mock-elevenlabs-sheet" \${this.expanded ? "" : "hidden"}>
            <div class="header">
              <div class="title">Family First Smile Care Assistant</div>
              <button type="button" class="dismiss" data-testid="mock-elevenlabs-collapse" aria-label="\${this.collapseText}">
                \${this.collapseText}
              </button>
            </div>
            <div class="body">
              <p class="copy">A deterministic test double for the live ElevenLabs widget.</p>
              <button type="button" class="primary" data-testid="mock-elevenlabs-start">
                \${this.startCallText}
              </button>
            </div>
          </section>
          <button
            type="button"
            class="launcher"
            data-testid="mock-elevenlabs-launcher"
            aria-label="\${this.expandText}"
            \${this.expanded ? "hidden" : ""}
          >
            <span class="orb" aria-hidden="true"></span>
            <span>\${this.actionText}</span>
          </button>
          <button
            type="button"
            class="dismiss"
            data-testid="mock-elevenlabs-dismiss"
            aria-label="Dismiss assistant"
            \${this.isDismissible && !this.expanded ? "" : "hidden"}
          >
            Hide
          </button>
        </div>
      \`;

      this.shadowRoot
        .querySelector("[data-testid='mock-elevenlabs-launcher']")
        ?.addEventListener("click", () => {
          this.expanded = true;
          this.render();
        });

      this.shadowRoot
        .querySelector("[data-testid='mock-elevenlabs-collapse']")
        ?.addEventListener("click", () => {
          this.expanded = false;
          this.render();
        });

      this.shadowRoot
        .querySelector("[data-testid='mock-elevenlabs-dismiss']")
        ?.addEventListener("click", () => {
          this.dismissed = true;
          this.render();
        });
    }
  }

  customElements.define("elevenlabs-convai", ElevenLabsConvai);
})();
`;

function getFutureDateInputValue(daysFromNow = 14) {
  const date = new Date();
  date.setDate(date.getDate() + daysFromNow);
  while (date.getDay() === 0 || date.getDay() >= 5) {
    date.setDate(date.getDate() + 1);
  }
  const month = `${date.getMonth() + 1}`.padStart(2, "0");
  const day = `${date.getDate()}`.padStart(2, "0");
  return `${date.getFullYear()}-${month}-${day}`;
}

async function installWidgetStub(page: Page) {
  await page.route(WIDGET_SCRIPT_URL, async (route) => {
    await route.fulfill({
      contentType: "application/javascript",
      body: widgetStubScript,
    });
  });
}

async function gotoWithLauncher(page: Page, route: string) {
  await installWidgetStub(page);
  await page.addInitScript((key) => {
    window.localStorage.setItem(key, "denied");
  }, CONSENT_STORAGE_KEY);
  await page.goto(route, { waitUntil: "domcontentloaded" });
  await expect(page.locator('[data-testid="assistant-launcher"]')).toBeVisible({
    timeout: 10_000,
  });
  await expect(page.locator('[data-widget="elevenlabs-convai"]')).toHaveCount(0);
}

async function activateAssistant(page: Page) {
  await page.locator('[data-testid="assistant-launcher"]').click();
  await expect(page.locator('[data-widget="elevenlabs-convai"]')).toHaveCount(1);
  await expect
    .poll(async () => {
      return page.evaluate(() => Boolean(customElements.get("elevenlabs-convai")));
    })
    .toBeTruthy();
}

async function getLauncherMetrics(page: Page) {
  const launcher = page.locator('[data-testid="assistant-launcher"]');
  await expect(launcher).toBeVisible();

  return launcher.evaluate((element) => {
    const rect = element.getBoundingClientRect();
    return {
      top: rect.top,
      right: rect.right,
      bottom: rect.bottom,
      left: rect.left,
      width: rect.width,
      height: rect.height,
      viewportWidth: window.innerWidth,
      viewportHeight: window.innerHeight,
    };
  });
}

async function expectNoHorizontalOverflow(page: Page) {
  const hasOverflow = await page.evaluate(() => {
    return document.documentElement.scrollWidth > window.innerWidth;
  });
  expect(hasOverflow).toBeFalsy();
}

test.describe("ElevenLabs widget integration", () => {
  test.describe.configure({ mode: "serial" });

  test("renders on public routes and stays inside the viewport", async ({ page }, testInfo) => {
    const expectedInset = testInfo.project.name === "desktop" ? 24 : 16;

    for (const route of PUBLIC_ROUTES) {
      await gotoWithLauncher(page, route);
      const metrics = await getLauncherMetrics(page);

      expect(metrics).not.toBeNull();
      expect(metrics?.width ?? 0).toBeGreaterThan(0);
      expect(metrics?.height ?? 0).toBeGreaterThan(0);
      expect(metrics?.left ?? 0).toBeGreaterThanOrEqual(0);
      expect(metrics?.top ?? 0).toBeGreaterThanOrEqual(0);
      expect(metrics?.right ?? 0).toBeLessThanOrEqual((metrics?.viewportWidth ?? 0) + 1);
      expect(metrics?.bottom ?? 0).toBeLessThanOrEqual((metrics?.viewportHeight ?? 0) + 1);
      expect((metrics?.viewportWidth ?? 0) - (metrics?.right ?? 0)).toBeGreaterThanOrEqual(
        expectedInset - 2,
      );
      expect((metrics?.viewportHeight ?? 0) - (metrics?.bottom ?? 0)).toBeGreaterThanOrEqual(
        expectedInset - 2,
      );

      await expectNoHorizontalOverflow(page);
      await expect(page.locator("nav[aria-label='Main navigation']")).toBeVisible();
    }
  });

  test("does not load the assistant until the visitor asks for it", async ({ page }) => {
    let widgetScriptRequests = 0;
    await page.route(WIDGET_SCRIPT_URL, async (route) => {
      widgetScriptRequests += 1;
      await route.fulfill({
        contentType: "application/javascript",
        body: widgetStubScript,
      });
    });

    await page.goto("/");
    await expect(page.locator('[data-testid="assistant-launcher"]')).toHaveCount(0);
    expect(widgetScriptRequests).toBe(0);

    await page.getByRole("button", { name: "No thanks" }).click();
    await expect(page.locator('[data-testid="assistant-launcher"]')).toBeVisible();
    await page.locator('[data-testid="assistant-launcher"]').click();
    await expect(page.locator('[data-widget="elevenlabs-convai"]')).toHaveCount(1);
    expect(widgetScriptRequests).toBe(1);
  });

  test("can retry after the assistant script fails to load", async ({ page }) => {
    let attempts = 0;
    await page.route(WIDGET_SCRIPT_URL, async (route) => {
      attempts += 1;
      if (attempts === 1) {
        await route.abort("failed");
        return;
      }
      await route.fulfill({
        contentType: "application/javascript",
        body: widgetStubScript,
      });
    });

    await page.goto("/");
    await page.getByRole("button", { name: "No thanks" }).click();
    await page.getByRole("button", { name: "Need help?" }).click();
    await expect(page.getByRole("button", { name: "Try assistant again" })).toBeVisible();
    await page.getByRole("button", { name: "Try assistant again" }).click();

    await expect(page.locator('[data-widget="elevenlabs-convai"]')).toHaveCount(1);
    expect(attempts).toBe(2);
  });

  test("waits to show the assistant until the privacy choice is resolved", async ({ page }) => {
    await page.goto("/");
    const privacyPanel = page.getByRole("region", { name: "Analytics privacy choices" });
    await expect(privacyPanel).toBeVisible();
    await expect(page.locator('[data-testid="assistant-launcher"]')).toHaveCount(0);

    await page.getByRole("button", { name: "No thanks" }).click();
    await expect(privacyPanel).toHaveCount(0);
    await expect(page.locator('[data-testid="assistant-launcher"]')).toBeVisible();
  });

  test("opens and collapses cleanly with pointer and keyboard", async ({ page }) => {
    await gotoWithLauncher(page, "/");
    await activateAssistant(page);

    const host = page.locator('[data-widget="elevenlabs-convai"]');
    await expect(host).toHaveAttribute("text-contents", /Talk with us/);

    await expect
      .poll(async () => {
        return host.evaluate((element) => {
          const launcher = element.shadowRoot?.querySelector(
            '[data-testid="mock-elevenlabs-launcher"] span:last-child',
          );
          return launcher?.textContent?.trim() ?? null;
        });
      })
      .toBe("Need help?");

    await host.evaluate((element) => {
      const launcher = element.shadowRoot?.querySelector(
        '[data-testid="mock-elevenlabs-launcher"]',
      ) as HTMLElement | null;
      launcher?.click();
    });

    await expect
      .poll(async () => {
        return host.evaluate((element) => {
          const button = element.shadowRoot?.querySelector(
            '[data-testid="mock-elevenlabs-start"]',
          ) as HTMLElement | null;
          return button?.textContent?.trim() ?? null;
        });
      })
      .toBe("Talk with us");

    await host.evaluate((element) => {
      const collapse = element.shadowRoot?.querySelector(
        '[data-testid="mock-elevenlabs-collapse"]',
      ) as HTMLElement | null;
      collapse?.focus();
    });
    await page.keyboard.press("Enter");

    await expect
      .poll(async () => {
        return host.evaluate((element) => {
          const launcher = element.shadowRoot?.querySelector(
            '[data-testid="mock-elevenlabs-launcher"]',
          ) as HTMLElement | null;
          return launcher ? !launcher.hidden : false;
        });
      })
      .toBeTruthy();
  });

  test("keeps error feedback visible and preserves navigation affordances", async ({
    page,
  }, testInfo) => {
    await page.goto("/book-appointment");
    await page.getByRole("button", { name: "No thanks" }).click();
    await expect(page.locator('[data-testid="assistant-launcher"]')).toHaveCount(0);
    await expect(page.locator('[data-widget="elevenlabs-convai"]')).toHaveCount(0);
    await expect(page.getByRole("button", { name: "Continue" })).toBeEnabled({
      timeout: 15_000,
    });

    await page.route("**/api/appointments", async (route) => {
      await route.fulfill({
        status: 500,
        contentType: "application/json",
        body: JSON.stringify({
          success: false,
          message: "Failed to submit appointment request.",
        }),
      });
    });

    await page.getByLabel("First name").fill("Taylor");
    await page.getByLabel("Last name").fill("Patient");
    await page.getByLabel("Email").fill("taylor@example.com");
    await page.getByLabel("Phone").fill("4083588100");
    await page.getByLabel("What can we help with?").selectOption("dental-exams");
    await expect(page.getByLabel("What can we help with?")).toHaveValue("dental-exams");
    await page.getByRole("button", { name: "Continue" }).click();
    await expect(page.getByRole("heading", { name: "Add any preferences" })).toBeFocused();
    await page.getByLabel("Preferred date (optional)").fill(getFutureDateInputValue());
    await page.getByLabel("Preferred time (optional)").selectOption("morning");
    await page
      .getByLabel(/I agree that Family First Smile Care may contact me/i)
      .check();
    await page.getByRole("button", { name: "Send Appointment Request" }).click();

    const toastViewport = page.locator('[data-testid="toast-viewport"]');
    await expect(
      toastViewport.getByText("Unable to submit request", { exact: true }),
    ).toBeVisible();

    const toastZIndex = await toastViewport.evaluate((element) => {
      return window.getComputedStyle(element).zIndex;
    });
    expect(toastZIndex).toBe("100");

    if (testInfo.project.name === "desktop") {
      await expect(page.getByRole("link", { name: "Request Appointment" }).first()).toBeVisible();
    } else {
      await page.getByRole("button", { name: "Toggle mobile menu" }).click();
      await expect(page.getByRole("navigation").getByRole("link", { name: "Contact" })).toBeVisible();
      await page.keyboard.press("Escape");
    }
  });

  test("suppresses the assistant on form routes", async ({ page }) => {
    for (const route of SUPPRESSED_ROUTES) {
      await page.goto(route);
      await expect(page.locator('[data-testid="assistant-launcher"]')).toHaveCount(0);
      await expect(page.locator('[data-widget="elevenlabs-convai"]')).toHaveCount(0);
    }
  });

  test("does not render on the admin route", async ({ browser }, testInfo) => {
    const context = await browser.newContext({
      baseURL: String(testInfo.project.use.baseURL),
      httpCredentials: {
        username: "admin",
        password: "tim",
      },
    });
    const page = await context.newPage();

    await installWidgetStub(page);
    await page.goto("/admin");

    await expect(page.locator('[data-widget="elevenlabs-convai"]')).toHaveCount(0);

    await context.close();
  });
});
