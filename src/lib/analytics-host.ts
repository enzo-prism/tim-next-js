const productionHosts = new Set(["www.famfirstsmile.com", "famfirstsmile.com"]);
const loopbackHosts = new Set(["localhost", "127.0.0.1", "[::1]"]);

/** Preview and development visits must never pollute the practice's property. */
export function isAnalyticsCollectionUrl(rawUrl: string, allowLoopbackTest = false): boolean {
  try {
    const url = new URL(rawUrl);
    if (url.protocol === "https:" && productionHosts.has(url.hostname)) return true;
    return allowLoopbackTest && loopbackHosts.has(url.hostname) && ["http:", "https:"].includes(url.protocol);
  } catch {
    return false;
  }
}

export function canCollectAnalytics(): boolean {
  if (typeof window === "undefined") return false;
  return isAnalyticsCollectionUrl(
    window.location.origin,
    process.env.NEXT_PUBLIC_ANALYTICS_TEST_MODE === "true",
  );
}
