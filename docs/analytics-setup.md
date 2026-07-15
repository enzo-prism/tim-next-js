# Analytics Setup (Vercel Analytics + GA4 + Ads + Admin APIs)

## Tracking Architecture in This Codebase

### Vercel Web Analytics page tracking

1. `@vercel/analytics` is installed in `package.json`.
2. `src/components/vercel-analytics.tsx` wraps `<Analytics />` from `@vercel/analytics/next`.
3. `src/app/layout.tsx` mounts that wrapper once at the app shell level.
4. `beforeSend(...)` drops `/admin*` traffic so public analytics stay clean.
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

1. `src/app/layout.tsx` loads `gtag.js` and initializes GA4 using:
   - `NEXT_PUBLIC_GA_MEASUREMENT_ID` (fallback `G-L7MH47XYXL`)
2. GA4 is configured with `send_page_view: false`.
3. `src/components/route-analytics.tsx` listens for route changes.
4. `trackPageView(...)` in `src/lib/analytics.ts` sends explicit `page_view` events to GA4.

This pattern is intentional for App Router SPA navigation accuracy.

### Google Ads conversion tracking

- `initGA()` configures Google Ads with `NEXT_PUBLIC_GOOGLE_ADS_TAG_ID`.
- `triggerGoogleAdsConversion(...)` sends event name from:
  - `NEXT_PUBLIC_GOOGLE_ADS_CONVERSION_EVENT`
- The appointment form calls this only after a lead is durably created.
- The browser-generated submission ID is sent as the Ads transaction ID to prevent duplicate conversions.
- CTA clicks remain non-conversion navigation events.

### Admin analytics APIs (server-side)

- `GET /api/admin/ga4/overview`
  - reads GA4 data through Google Analytics Data API
- `GET /api/admin/gsc/overview`
  - reads Search Console data through Google Search Console API
- both return `503 missing_config` when credentials/env are incomplete

## Required Variables

### Vercel Web Analytics

- no application env vars required
- Vercel Web Analytics must be enabled in the Vercel project dashboard
- data only appears for deployed environments, not normal local development

### Public tracking vars

- `NEXT_PUBLIC_GA_MEASUREMENT_ID` (currently `G-L7MH47XYXL`)
- `NEXT_PUBLIC_GOOGLE_ADS_TAG_ID`
- `NEXT_PUBLIC_GOOGLE_ADS_CONVERSION_EVENT`

### Admin reporting vars

- `GA4_PROPERTY_ID` (numeric property id, currently `518867337`)
- `GSC_SITE_URL` (`sc-domain:famfirstsmile.com` recommended)
- one credential mode:
  - `GOOGLE_SERVICE_ACCOUNT_JSON`, or
  - `GOOGLE_SERVICE_ACCOUNT_JSON_BASE64`, or
  - `GOOGLE_APPLICATION_CREDENTIALS`

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

This project already implements an equivalent setup in `src/app/layout.tsx`.

## Validation Checklist (Production)

1. Open the production deployment and verify `/_vercel/insights/script.js` loads.
2. Navigate across two or more public routes and confirm page views begin appearing in the Vercel Analytics dashboard.
3. Open [famfirstsmile.com](https://www.famfirstsmile.com) and verify `gtag/js?id=G-L7MH47XYXL` loads.
4. In browser devtools Network tab, confirm `collect`/`g/collect` hits after page load.
5. Navigate to a second route and confirm another GA hit is sent.
6. In GA4 Realtime, verify active users and route page views appear.
7. Confirm admin route `/admin` does not emit normal public pageview tracking in either Vercel Analytics or GA4.
8. Verify Google Ads conversion fires by clicking an appointment CTA wired to `triggerGoogleAdsConversion`.
9. Confirm representative custom events fire without exposing form data:
   - appointment CTA: `cta_click`
   - appointment/contact submit success: `generate_lead`
   - phone/map/pay/review/social links: corresponding click event
10. Verify admin API connectivity:
   - `GET /api/admin/ga4/overview?days=30`
   - `GET /api/admin/gsc/overview?days=30`

## Common Failure Modes

1. GA detected by Tag Assistant but no page data in reports:
   - usually `NEXT_PUBLIC_GA_MEASUREMENT_ID` mismatch or filtering in GA4 property.
2. Admin GA4/GSC cards show missing config:
   - missing `GA4_PROPERTY_ID`, `GSC_SITE_URL`, or service account credentials.
3. Search Console returns permission errors:
   - service account email is not added as an owner/user in Search Console property.
4. Route transitions not tracked:
   - `RouteAnalytics` removed or `trackPageView` not firing on pathname change.
5. Vercel Analytics stays blank after deploy:
   - Web Analytics is not enabled in the Vercel project, an ad/content blocker is suppressing the script, or nobody has visited the deployed site since the change.
6. Custom events appear in GA4 but not as breakdowns:
   - GA4 custom parameters need matching custom dimensions/metrics before they appear in standard reports.
7. Vercel pageviews appear but custom events do not:
   - the Vercel project plan may not include custom events, or the event has not been triggered in production yet.

## Hardening Recommendations

1. Add a Playwright smoke script that asserts both the Vercel Insights script and GA script load on public routes.
2. Add dashboard heartbeat endpoint for analytics config status.
3. Add weekly manual verification against Vercel Analytics, GA4 Realtime, and conversion diagnostics.
