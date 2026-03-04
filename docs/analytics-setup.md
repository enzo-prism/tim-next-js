# Analytics Setup (GA4 + Ads + Hotjar + Admin APIs)

## Tracking Architecture in This Codebase

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
- Appointment CTA flows should call this helper before navigation.

### Hotjar

- Initialized client-side in `initHotjar()` from `src/lib/analytics.ts`.
- Skips admin pages (`/admin*`) by design.

### Admin analytics APIs (server-side)

- `GET /api/admin/ga4/overview`
  - reads GA4 data through Google Analytics Data API
- `GET /api/admin/gsc/overview`
  - reads Search Console data through Google Search Console API
- both return `503 missing_config` when credentials/env are incomplete

## Required Variables

### Public tracking vars

- `NEXT_PUBLIC_GA_MEASUREMENT_ID` (currently `G-L7MH47XYXL`)
- `NEXT_PUBLIC_GOOGLE_ADS_TAG_ID`
- `NEXT_PUBLIC_GOOGLE_ADS_CONVERSION_EVENT`
- `NEXT_PUBLIC_HOTJAR_ID`
- `NEXT_PUBLIC_HOTJAR_SNIPPET_VERSION`

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

1. Open [famfirstsmile.com](https://famfirstsmile.com) and verify `gtag/js?id=G-L7MH47XYXL` loads.
2. In browser devtools Network tab, confirm `collect`/`g/collect` hits after page load.
3. Navigate to a second route and confirm another GA hit is sent.
4. In GA4 Realtime, verify active users and route page views appear.
5. Confirm admin route `/admin` does not emit normal public pageview tracking.
6. Verify Google Ads conversion fires by clicking an appointment CTA wired to `triggerGoogleAdsConversion`.
7. Verify admin API connectivity:
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

## Hardening Recommendations

1. Add a Playwright smoke script that asserts GA script tag presence and route transition pageview hit.
2. Add dashboard heartbeat endpoint for analytics config status.
3. Add weekly manual verification against GA4 Realtime and conversion diagnostics.
