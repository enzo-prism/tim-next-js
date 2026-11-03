import type { BrowserContext } from "@playwright/test";

export function isBlockedAnalyticsHost(hostname: string) {
  const host = hostname.toLowerCase();
  if (
    host === "google.com" ||
    host === "www.google.com" ||
    host === "google-analytics.com" ||
    host === "www.google-analytics.com" ||
    host === "analytics.google.com" ||
    host === "googletagmanager.com" ||
    host === "www.googletagmanager.com" ||
    host === "gstatic.com" ||
    host === "www.gstatic.com" ||
    host === "doubleclick.net" ||
    host === "www.doubleclick.net" ||
    host === "googleadservices.com" ||
    host === "www.googleadservices.com" ||
    host === "googlesyndication.com" ||
    host === "www.googlesyndication.com" ||
    host === "googleapis.com" ||
    host === "www.googleapis.com" ||
    host === "pagead2.googlesyndication.com"
  ) {
    return true;
  }

  return (
    host.endsWith(".google.com") ||
    host.endsWith(".google-analytics.com") ||
    host.endsWith(".analytics.google.com") ||
    host.endsWith(".googletagmanager.com") ||
    host.endsWith(".gstatic.com") ||
    host.endsWith(".doubleclick.net") ||
    host.endsWith(".googleadservices.com") ||
    host.endsWith(".googlesyndication.com") ||
    host.endsWith(".googleapis.com") ||
    host.includes("pagead2")
  );
}

export async function isolateGoogleAnalytics(context: BrowserContext) {
  await context.addInitScript(() => {
    const calls: unknown[][] = [];
    const dataLayer: unknown[] = Array.isArray(window.dataLayer) ? window.dataLayer : [];
    window.dataLayer = dataLayer;
    (
      window as Window & {
        __ffscGtagCalls?: unknown[][];
      }
    ).__ffscGtagCalls = calls;
    window.gtag = (...args: unknown[]) => {
      calls.push(args);
      dataLayer.push(args);
    };
  });

  await context.route("**/*", async (route) => {
    let hostname = "";
    try {
      hostname = new URL(route.request().url()).hostname;
    } catch {
      await route.continue();
      return;
    }

    if (isBlockedAnalyticsHost(hostname)) {
      await route.abort();
      return;
    }

    await route.continue();
  });
}
