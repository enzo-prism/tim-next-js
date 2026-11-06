# SEO and AEO implementation — November 6, 2026

## Scope and evidence

This release implements the code and content work supported by the [GA4/GSC audit](https://app.notion.com/p/4103429581eb8183be6ae1f155bd0e56). Baseline: August 5–November 4, 2026, 96 Google Web clicks / 7,582 impressions and 266 property-level Google AI impressions. Privacy-filtered query rows, page rows and AI page rows do not add to property totals. Historical GA4 key events are not unique leads; use production-host segments and preserve consent caveats.

Priority changes are TMJ and exam relevance, useful cleaning/family/children’s service answers, the incomplete sedation article, clear opening answers in 13 other articles, contextual links, breadcrumbs, actual sitemap update dates and accurate doctor identity. Existing URLs, real 404s, canonical host, authored reviews and clinical-review digest validation remain in place. Appointment links retain service intent, store the first CTA source in the existing operational session attribution, and record CTA location in consented event attributes instead of crawlable source parameters. No new provider or storage key is introduced.

`src/content/blog.generated.ts` now contains curated editorial repairs. Do not run the legacy external-source generator without reconciling these edits; its historical source paths are not the canonical edited content. Editorial dates represent actual text changes, not clinical attestations.

## Measurement contract

Only HTTPS `www.famfirstsmile.com` and `famfirstsmile.com` are eligible to collect analytics, and consent remains required. Apex redirects to www. Arbitrary preview hosts never collect, even with the test flag. `NEXT_PUBLIC_ANALYTICS_TEST_MODE=true` allows loopback hosts only for browser tests; do not configure it in Vercel. Every E2E page fixture intercepts Google and Vercel analytics to keep synthetic traffic out of reporting.

GA4 property 518867337 / stream 13261242785 / G-L7MH47XYXL was checked live. Stream URL was aligned to `https://www.famfirstsmile.com`. History-based automatic page views and automatic form interactions were already off; email redaction was active. No consent or retention policy was changed. The stream’s 48-hour collection warning remains an observation, not proof of a broken consent path. Local intercepted tests verify one initial page-view event after Allow and no collection after decline through navigation/reload. Existing form tests verify durable-save conversion and retry deduplication against stubbed APIs.

## Acceptance evidence

- Full E2E across desktop, tablet and mobile, including global/header/contact appointment URL regression coverage; 19 checks intentionally skip non-applicable viewports. Use the release commit’s CI run as the exact test-count record.
- Unit/type/lint/monitor/design checks and production build; GitHub CI additionally exercises isolated PostgreSQL integration tests.
- Production database schema read-back passed using the SELECT-only verifier. No migration or patient record was changed.
- Release from reviewed main commit through the Git-connected `tim-next-js` Vercel project. Verify the source SHA and custom-domain aliases, then check all sitemap routes, rendered metadata/JSON-LD, redirects, assets and invalid empty API submissions (HTTP 400 without creating leads).
- Request indexing selectively for materially repaired canonical pages after release; record the actual GSC response. Submission is not proof of indexing.

## Practice confirmations still required

See [practice details](./practice-content-confirmation.md) and [clinical review publication](./clinical-review-publishing.md). Prices, visit duration, insurance participation, exact sedation services/referrals, family scheduling and parking/access facts must be supplied by the practice. Do not infer clinician approval from this release. The review registry remains empty; no clinician-review badge or `reviewedBy` claim is published.

Original, consented cases and current local listing/review facts require verified source material before publication. No fabricated case, specialty, travel time, free consultation, urgent availability or new listing fact is added. Santa Cruz remains a service-area page for a Los Gatos office.

## Follow-up measurement

After 28 complete days of clean data, compare equal periods for US/device GSC Web clicks and impressions on the changed pages, Google AI impressions, qualified organic requests and confirmed appointments. Use actual lead outcomes rather than phone-click counts. Reporting is manual; no schedule was created. Search lift and index inclusion require observation and are not release acceptance guarantees.

Google’s [AI optimization guide](https://developers.google.com/search/docs/fundamentals/ai-optimization-guide) is the current reference. Useful visible FAQs support readers; do not promise FAQ rich results or ranking lift from llms.txt. Keep accurate visible content, source links and entity details as the foundation.
