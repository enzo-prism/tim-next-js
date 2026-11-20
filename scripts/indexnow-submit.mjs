#!/usr/bin/env node
// Tells IndexNow engines (Bing, Yandex, Seznam, Naver) which URLs changed so
// they recrawl them. Bing's index feeds Copilot and ChatGPT search.
//
// The key is public by design: IndexNow verifies ownership by fetching
// https://www.famfirstsmile.com/<key>.txt, which lives in public/.
// Run after a production deploy that changed page content:
//   npm run seo:indexnow                       # every URL in the live sitemap
//   npm run seo:indexnow -- /tmj /blog/foo     # only these paths
//   npm run seo:indexnow -- --dry-run          # print what would be sent
// Google does not use IndexNow; use Search Console for Google recrawls.

const host = "www.famfirstsmile.com";
const origin = `https://${host}`;
const key = "46d06e3c84edbc6824a009b2cc8a9ff3";
const keyLocation = `${origin}/${key}.txt`;

const args = process.argv.slice(2);
const dryRun = args.includes("--dry-run");
const paths = args.filter((arg) => !arg.startsWith("--"));

async function sitemapUrls() {
  const response = await fetch(`${origin}/sitemap.xml`);
  if (!response.ok) throw new Error(`sitemap.xml returned ${response.status}`);
  const xml = await response.text();
  return [...xml.matchAll(/<loc>(.*?)<\/loc>/g)].map((match) => match[1]);
}

async function main() {
  const urlList = paths.length
    ? paths.map((path) => new URL(path, origin).toString())
    : await sitemapUrls();

  const foreign = urlList.filter((url) => new URL(url).host !== host);
  if (foreign.length) throw new Error(`Only ${host} URLs can be submitted: ${foreign.join(", ")}`);
  if (!urlList.length) throw new Error("No URLs to submit");

  const keyResponse = await fetch(keyLocation);
  const servedKey = keyResponse.ok ? (await keyResponse.text()).trim() : "";
  if (servedKey !== key) {
    throw new Error(`${keyLocation} does not serve the key yet. Deploy public/${key}.txt first.`);
  }

  const body = { host, key, keyLocation, urlList };
  if (dryRun) {
    console.log(JSON.stringify(body, null, 2));
    return;
  }

  const response = await fetch("https://api.indexnow.org/indexnow", {
    method: "POST",
    headers: { "Content-Type": "application/json; charset=utf-8" },
    body: JSON.stringify(body),
  });
  // 200 = accepted, 202 = accepted while the key is being verified.
  console.log(`IndexNow: HTTP ${response.status} for ${urlList.length} URL(s)`);
  if (response.status !== 200 && response.status !== 202) {
    console.error(await response.text());
    process.exitCode = 1;
  }
}

main().catch((error) => {
  console.error(error.message);
  process.exitCode = 1;
});
