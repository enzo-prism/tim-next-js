# Migration Parity Checklist

Use this checklist before cutting traffic fully to Vercel production.

## Public Routes

- [ ] `/` renders correctly
- [ ] `/about` renders correctly
- [ ] `/services` renders correctly
- [ ] `/services/[serviceId]` works for all service ids
- [ ] `/services/childrens-dentistry/babys-first-visit` renders correctly
- [ ] `/services/invisalign` renders correctly
- [ ] `/technology/itero-digital-scanner` renders correctly
- [ ] `/team` renders correctly
- [ ] `/patient-info` renders correctly
- [ ] `/patient-info/brushing` renders correctly
- [ ] `/patient-info/flossing` renders correctly
- [ ] `/patient-info/nutrition` renders correctly
- [ ] `/contact` renders correctly and submits
- [ ] `/book-appointment` renders correctly and submits
- [ ] `/tmj` renders correctly
- [ ] `/privacy-policy` renders correctly
- [ ] `/sitemap` renders correctly
- [ ] `/font-test` renders correctly
- [ ] Custom 404 appears for unknown route

## Redirects and Canonicalization

- [ ] `/hello-world` -> `/`
- [ ] `/dental-services/dental-crowns` -> `/services/dental-crowns`
- [ ] `/digital-x-ray` -> `/services/dental-exams`
- [ ] `/articles/premium_education/category/47362` -> `/services`
- [ ] `/articles/premium_education/category/47364` -> `/services`
- [ ] `/articles/premium_education/category/47367` -> `/services`
- [ ] `/?page_id=1073` -> `/patient-info`
- [ ] `www.*` -> apex host
- [ ] `/services/tmj` -> `/tmj`
- [ ] TMJ canonical points to `/tmj`

## SEO and Structured Data

- [ ] Route titles and descriptions match expected intent
- [ ] Canonical URL is correct per route
- [ ] OpenGraph metadata present
- [ ] LocalBusiness JSON-LD present globally
- [ ] Service JSON-LD present on service detail routes
- [ ] FAQ JSON-LD present on Invisalign and iTero pages
- [ ] `/robots.txt` returns expected directives
- [ ] `/sitemap.xml` includes all canonical routes
- [ ] `/llms.txt` reachable

## Contact + Admin Features

- [ ] `POST /api/contacts` persists valid submissions
- [ ] invalid contact payload returns `400` with errors
- [ ] `POST /api/appointments` returns `201` when DB + relay succeed
- [ ] `POST /api/appointments` returns `202 delivered:false` when relay fails but DB persists
- [ ] `/admin` requires Basic Auth
- [ ] `/api/admin/contacts` requires Basic Auth
- [ ] `/api/admin/changelog` returns payload
- [ ] admin contacts pagination and search work
- [ ] admin contacts table shows request type, preferred date/time, and Formspree status

## Analytics

- [ ] GA script loads with correct measurement ID
- [ ] route-change pageviews are tracked
- [ ] appointment CTA click event fires as non-conversion analytics event
- [ ] Google Ads conversion event fires on successful appointment submission (not on CTA click)
- [ ] `/api/admin/ga4/overview` returns valid data or expected `missing_config`
- [ ] `/api/admin/gsc/overview` returns valid data or expected `missing_config`

## Performance and Accessibility

- [ ] Homepage passes baseline Lighthouse checks
- [ ] Services and contact pages pass baseline Lighthouse checks
- [ ] keyboard navigation works through primary flows
- [ ] skip-link is visible and functional on focus
