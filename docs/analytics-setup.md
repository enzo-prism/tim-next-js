# Analytics Setup (Vercel Analytics + GA4 + Ads + Admin APIs)

## Tracking Architecture in This Codebase

### Consent gating (applies to everything below)

Nothing described in this document runs before the visitor opts in.

1. `src/app/layout.tsx` sets `gtag('consent', 'default', ...)` to `denied` for `analytics_storage`, `ad_storage`, `ad_user_data`, and `ad_personalization`, with `wait_for_update: 500`, before any tag loads.
2. `src/components/google-analytics.tsx` renders the consent prompt and injects `gtag.js` plus Vercel Analytics only after consent is granted. The tag is appended with `document.createElement("script")` (not a conditionally rendered `next/script`, which can fail to load). The choice persists in `localStorage` under `ffsc_analytics_consent_v1`.
3. Every helper in `src/lib/analytics.ts` re-checks stored consent, so a denied or undecided visitor emits nothing even if a helper is called directly.

Expect reported traffic and conversions to be lower than raw visits. That is the consent gate working, not a tracking fault.

### The consent prompt UI

The prompt is deliberately low-emphasis: a compact left-aligned bar in the first HTML, with
muted 12px text, a plain `Privacy` link to `/privacy-policy`, and two text buttons. Neither choice
is a filled CTA, so the presentation does not strongly nudge the visitor toward granting consent.
The initial UI state is `prompt` so Allow / No thanks are present before hydration. After mount,
a stored granted or denied choice hides the bar.

Three constraints to preserve when restyling it:

- **Accessible names are load-bearing.** Playwright selects the region by `Analytics privacy
  choices` and the buttons by `Allow analytics` and `No thanks`. The allow button shows "Allow"
  and carries `aria-label="Allow analytics"`; changing either name breaks `tests/e2e`.
- **It must never compete with the assistant launcher.** The assistant launcher
  (`data-testid="assistant-launcher"`) remains hidden until the visitor resolves the analytics
  choice. `tests/e2e/elevenlabs-widget.spec.ts` asserts the consent-first handoff across desktop,
  tablet, and mobile.
- **Keep it inside the `DESIGN.md` contract** — semantic tokens, `rounded-lg`, at most
  `shadow-sm`. `npm run minimal:check` enforces the hard rules.

### The shared URL policy

`sanitizeAnalyticsUrl()` in `src/lib/analytics.ts` reduces any analytics URL to its path plus allow-listed campaign parameters (`utm_source`, `utm_medium`, `utm_campaign`, `utm_term`, `utm_content`, `utm_id`, `gclid`, `gbraid`, `wbraid`, `dclid`, `msclkid`). The hash and all other query parameters are dropped.

Both GA4 (`page_location`) and Vercel Web Analytics (`beforeSend`) use it. Two reasons it must stay that way:

- A patient-facing URL can carry an email address or a name, so no provider may receive one verbatim.
- GA4 derives session source/medium and campaign **from `page_location`**. Stripping the query string wholesale silently reports all paid traffic as direct.

### Vercel Web Analytics page tracking

1. `@vercel/analytics` is installed in `package.json`.
2. `src/components/vercel-analytics.tsx` wraps `<Analytics />` from `@vercel/analytics/next`.
3. `src/components/google-analytics.tsx` mounts that wrapper once consent is granted.
4. `beforeSend(...)` drops `/admin*` traffic (matched on pathname, not a substring of the whole URL) and rewrites every remaining event URL through `sanitizeAnalyticsUrl()`.
5. Vercel automatically tracks page views in production after the deployment is visited.

This does not replace GA4. It gives a first-party Vercel traffic view alongside the existing Google-based reporting stack.

### Custom event tracking

1. `src/lib/analytics.ts` is the single event emitter for custom events.
2. `trackSiteEvent(...)` sends the same sanitized event payload to:
   - GA4 through `gtag("event", eventName, ...)`
   - Vercel Web Analytics through `track(eventName, ...)`
3. Custom events are skipped on `/admin*`.
4. Payloads are allowlisted, flat, and intentionally low-cardinality. Do not send names, emails, phone numbers, message text, preferred dates, free-form search text, or any other patient-identifying data.

Current event dictionary:

| Event | When it fires | Safe parameters |
| --- | --- | --- |
| `cta_click` | Appointment/consultation CTAs | `location`, `cta_type`, `destination`, `service_id` |
| `appointment_step_view` | A booking step is shown | `form_type`, `form_step`, `step_name`, `location`, `service_id` |
| `appointment_step_complete` | A booking step passes validation | `form_type`, `form_step`, `step_name`, `location`, `service_id` |
| `appointment_form_abandon` | A started booking flow exits before success | `form_type`, `form_step`, `step_name`, `abandonment_reason`, `location`, `service_id` |
| `form_start` | First meaningful form interaction | `form_type`, `location`, `service_id` |
| `form_submit_attempt` | Form submit before the request resolves | `form_type`, `location`, `service_id` |
| `generate_lead` | Successful appointment/contact submission | `form_type`, `lead_source`, `location`, `service_id` |
| `form_submit_fallback` | Appointment saved but delivery fallback is shown | `form_type`, `location`, `service_id` |
| `form_submit_error` | Appointment/contact submission fails | `form_type`, `location`, `service_id`, `error_type` |
| `phone_click` | Phone links | `location`, `destination` |
| `map_click` | Google Maps links | `location`, `destination`, `provider` |
| `pay_bill_click` | SwipeSimple payment links | `location`, `destination`, `provider` |
| `review_link_click` | Google/Yelp review profile links | `location`, `destination`, `provider` |
| `social_click` | Social profile/post links | `location`, `destination`, `provider` |
| `service_learn_more_click` | Service discovery links | `location`, `destination`, `service_id` |

GA4 uses `generate_lead` because it is a recommended lead event. If parameter breakdowns are needed in GA4 reports, create custom dimensions/metrics for the custom parameters such as `form_type`, `location`, `service_id`, `provider`, and `cta_type`.

Vercel custom events require a Vercel plan that supports custom events. Pageview analytics can work even if custom-event dashboards are unavailable.

### GA4 page tracking

1. `src/components/google-analytics.tsx` loads `gtag.js` after Allow and initializes GA4 using measurement ID `G-L7MH47XYXL` only. `NEXT_PUBLIC_GA_MEASUREMENT_ID` is accepted when it matches that ID; empty, retired, or any other value is ignored.
2. GA4 is configured with `send_page_view: false`.
3. `src/components/route-analytics.tsx` listens for route changes **and** for `ffsc:analytics-consent`, so the first `page_view` after Allow does not depend on the script `load` callback.
4. `trackPageView(...)` in `src/lib/analytics.ts` sends explicit `page_view` events to GA4, with `page_location` built through the shared URL policy so campaign parameters survive.

This pattern is intentional for App Router SPA navigation accuracy. It only stays accurate while the GA4 property-side setting described in "Required GA4 property configuration" is left off.

Retired property `500238593` (historical measurement ID `G-54ESSN4BF8` from the Vite app) must not receive hits. Do not add a second GA4 ID, GTM container, or `gtag('config', ...)` destination.

Live tagging host is `www.famfirstsmile.com`. Apex `famfirstsmile.com` 308s there at Vercel, and middleware keeps www authoritative so the two hosts cannot loop. Configure the GA4 stream website URL as `https://www.famfirstsmile.com`.

### Google Ads conversion tracking

- Ads tagging is optional. `initGA()` configures Google Ads only when `NEXT_PUBLIC_GOOGLE_ADS_TAG_ID` is a valid tag. Empty, whitespace, and the rejected Exquisite Dentistry Ads fallback are treated as unset.
- `triggerGoogleAdsConversion(...)` no-ops the Ads event when no tag is configured. GA4 `generate_lead` still fires.
- When a tag is present, the event name comes from `NEXT_PUBLIC_GOOGLE_ADS_CONVERSION_EVENT` and is scoped with `send_to` that tag. Without `send_to`, gtag broadcasts the conversion to every configured destination and GA4 records a stray `ads_conversion_*` event beside `generate_lead`.
- The appointment and contact forms emit GA4 `generate_lead` only after a lead is durably
  created, even if the office relay is delayed.
- Only the appointment form also calls the direct Google Ads conversion helper.
- The browser-generated submission ID is sent as the Ads transaction ID to prevent duplicate conversions.
- A notification-only retry for an existing lead does not emit another `generate_lead`; an
  appointment retry also does not emit another Ads conversion.
- CTA clicks remain non-conversion navigation events.

### Admin analytics APIs (server-side)

- `GET /api/admin/ga4/overview`
  - reads GA4 data through Google Analytics Data API
- `GET /api/admin/gsc/overview`
  - reads Search Console data through Google Search Console API
  - returns query-by-page rows plus ranked positions 4-20 opportunities
- both return `503 missing_config` when credentials/env are incomplete

## Required GA4 Property Configuration

These are set in the GA4 property, not in this repo, and they will silently corrupt reporting if changed back.

Property `518867337`, stream `13261242785`, measurement ID `G-L7MH47XYXL`.

| Setting | Required state | Why |
| --- | --- | --- |
| Enhanced measurement → Page views → "Page changes based on browser history events" | **Off** | App Router navigates via `history.pushState`. Left on, GA4 fires its own `page_view` on every client-side navigation on top of the one `RouteAnalytics` sends, roughly doubling page views. The automatic one also reports the raw URL, bypassing the shared URL policy. |
| Enhanced measurement → Form interactions | **Off** | GA4 auto-fires its own `form_start` that collides with the richer custom `form_start` in this codebase, blending two different event shapes under one name. |
| Enhanced measurement → Page views (main toggle) | On (locked by GA4) | Harmless. The initial page view is suppressed by `send_page_view: false` at the tag. |
| Redact data → Email | On | Defence in depth behind the shared URL policy. |

## Google Ads Account Configuration

Account `353-904-6031`. Auto-tagging is **on**, so `gclid` is appended to landing URLs; GA4 only sees it because `page_location` preserves it.

This site does not ship a default Ads tag. The account may still contain historical conversion actions belonging to other properties, which must never be primary:

| Conversion action | State | Note |
| --- | --- | --- |
| `Submit lead form` (`Page load: www.design-prism.com/#Apply`) | Secondary | Agency site, created 2023. Can never fire from this domain. |
| `Submit lead form (Page load https://www.chriswongdds.com/…/thank-you)` | Secondary | Different client's site. |
| `Submit lead form (1)` — source *Website (Google Analytics GA4)* | **Primary** | Intended working path, created when the GA4 link was made on 2026-07-25. Which GA4 event it imports is unconfirmed; `generate_lead` is the property's only lead key event. Confirm it actually records before trusting Ads conversion numbers. |

A primary conversion action that cannot fire makes every campaign bid toward a target it will never reach. Audit `Action optimization` on the "Submit lead form" goal before trusting Ads conversion numbers.

## Required Variables

### Vercel Web Analytics

- no application env vars required
- Vercel Web Analytics must be enabled in the Vercel project dashboard
- data only appears for deployed environments, not normal local development

### Public tracking vars

- `NEXT_PUBLIC_GA_MEASUREMENT_ID` (must be `G-L7MH47XYXL`; any other value is ignored)
- `NEXT_PUBLIC_GOOGLE_ADS_TAG_ID` (optional; rejected Exquisite Dentistry Ads fallback is ignored)
- `NEXT_PUBLIC_GOOGLE_ADS_CONVERSION_EVENT` (used only when a valid Ads tag is set)

### Admin reporting vars

- `GA4_PROPERTY_ID` (numeric property id, currently `518867337`)
- `GSC_SITE_URL` (`sc-domain:famfirstsmile.com` recommended)
- one credential mode:
  - `GOOGLE_SERVICE_ACCOUNT_JSON_BASE64` (preferred for Vercel), or
  - `GOOGLE_SERVICE_ACCOUNT_JSON`, or
  - `GOOGLE_APPLICATION_CREDENTIALS` (local runtimes only; a workstation path is not available
    inside Vercel)

## Manual GA4 Tag Confirmation

Google-provided base snippet for this property:

```html
<!-- Google tag (gtag.js) -->
<script async src="https://www.googletagmanager.com/gtag/js?id=G-L7MH47XYXL"></script>
<script>
  window.dataLayer = window.dataLayer || [];
  function gtag(){dataLayer.push(arguments);}
  gtag('js', new Date());
  gtag('config', 'G-L7MH47XYXL');
</script>
```

This project already implements an equivalent setup: consent defaults in `src/app/layout.tsx`, then `gtag.js` injected from `src/components/google-analytics.tsx` after Allow.

## Validation Checklist (Production)

Run these two first, in a fresh browser profile, because everything after them depends on consent being granted:

- Load a public route and confirm **no** GA or Vercel request fires before choosing "Allow" in the consent bar. Then accept and confirm tracking starts.
- With consent granted, load a route with `?utm_source=test&gclid=test123&email=someone@example.com` and confirm the GA4 `page_view` `page_location` and the Vercel `[view]` URL both keep `utm_source`/`gclid` and both drop `email`.

Then:

1. Open the production deployment and verify `/_vercel/insights/script.js` loads.
2. Navigate across two or more public routes and confirm page views begin appearing in the Vercel Analytics dashboard.
3. Open [famfirstsmile.com](https://www.famfirstsmile.com) and verify `gtag/js?id=G-L7MH47XYXL` loads.
4. In browser devtools Network tab, confirm `collect`/`g/collect` hits after page load.
5. Navigate to a second route and confirm another GA hit is sent.
6. In GA4 Realtime, verify active users and route page views appear.
7. Confirm admin route `/admin` does not emit normal public pageview tracking in either Vercel Analytics or GA4.
8. Verify appointment CTAs emit only `cta_click`; the Google Ads conversion must fire only after the API confirms a newly created durable appointment lead.
9. Confirm representative custom events fire without exposing form data:
   - appointment CTA: `cta_click`
   - appointment/contact submit success: `generate_lead`
   - phone/map/pay/review/social links: corresponding click event
10. Verify admin API connectivity:
   - `GET /api/admin/ga4/overview?days=30`
   - `GET /api/admin/gsc/overview?days=30`
11. Start, advance, and exit the appointment flow; verify step events contain no form values or patient identifiers.

## Common Failure Modes

1. GA detected by Tag Assistant but no page data in reports:
   - usually `NEXT_PUBLIC_GA_MEASUREMENT_ID` mismatch or filtering in GA4 property.
   - also check consent: nothing is emitted until the visitor opts in, and a fresh browser profile starts undecided.
2. Admin GA4/GSC cards show missing config:
   - missing `GA4_PROPERTY_ID`, `GSC_SITE_URL`, or service account credentials.
3. Search Console returns permission errors:
   - service account email is not added as an owner/user in Search Console property.
4. Route transitions not tracked:
   - `RouteAnalytics` removed or `trackPageView` not firing on pathname change.
   - First page view after Allow missing: consent event listener removed, so collection waits on a script callback that never runs.
5. Vercel Analytics stays blank after deploy:
   - Web Analytics is not enabled in the Vercel project, an ad/content blocker is suppressing the script, or nobody has visited the deployed site since the change.
6. Custom events appear in GA4 but not as breakdowns:
   - GA4 custom parameters need matching custom dimensions/metrics before they appear in standard reports.
7. Vercel pageviews appear but custom events do not:
   - the Vercel project plan may not include custom events, or the event has not been triggered in production yet.
8. Paid traffic reports as `(direct) / (none)` or `googleads.g.doubleclick.net / referral`, and Paid Search shows zero sessions:
   - `page_location` is being sent without campaign parameters. GA4 reads source/medium from that field, so a query-stripped URL destroys attribution even though auto-tagging is on. Verify `sanitizeAnalyticsUrl()` still preserves `gclid` and the `utm_*` keys.
9. Page views roughly double, or engagement rate looks implausibly low:
   - "Page changes based on browser history events" was re-enabled in Enhanced measurement. See "Required GA4 property configuration".
10. GA4 shows a stray `ads_conversion_*` event next to `generate_lead`:
   - the Ads conversion is firing without `send_to`, so gtag is broadcasting it to the GA4 destination as well.
11. Google Ads reports far fewer conversions than GA4 reports leads:
   - check what the primary conversion actions on the "Submit lead form" goal are actually keyed to. A page-load conversion pointed at a domain this site does not serve will sit at zero forever while still driving bidding.
12. GA4 "no data received in the past 48 hours" with the consent prompt still appearing:
   - `gtag.js` was mounted with a conditionally rendered `next/script`. Load it with a DOM `<script>` after Allow, and send `page_view` from `RouteAnalytics` on the consent event.

## Hardening Recommendations

1. Add a Playwright smoke script that asserts both the Vercel Insights script and GA script load on public routes.
2. Add dashboard heartbeat endpoint for analytics config status.
3. Add weekly manual verification against Vercel Analytics, GA4 Realtime, and conversion diagnostics.
