export const CRON_SECRET_SETUP =
  "Set CRON_SECRET on Vercel project tim-next-js for Production and Preview. Generate with `openssl rand -hex 32`. Vercel Cron sends Authorization: Bearer $CRON_SECRET automatically once that env exists.";

export const GOOGLE_ADS_WEBHOOK_KEY_SETUP =
  "Set GOOGLE_ADS_WEBHOOK_KEY on Vercel project tim-next-js (Production and Preview) to a long random secret (`openssl rand -hex 32`). In Google Ads, open the Lead Form for campaign 23205053490 and set the webhook URL to https://www.famfirstsmile.com/api/webhooks/google-ads with the same value as google_key.";

export const GOOGLE_ADS_RECONCILIATION_SETUP =
  "Set GOOGLE_ADS_DEVELOPER_TOKEN, GOOGLE_ADS_CUSTOMER_ID, GOOGLE_ADS_OAUTH_CLIENT_ID, GOOGLE_ADS_OAUTH_CLIENT_SECRET, and GOOGLE_ADS_REFRESH_TOKEN on Vercel project tim-next-js (Production and Preview), then set RECONCILIATION_ENABLED=true. Customer ID 353-904-6031 may be stored with or without dashes.";

export const FORMSPREE_RECONCILIATION_SETUP =
  "Set FORMSPREE_API_KEY on Vercel project tim-next-js (Production and Preview) to a Formspree Forms API key that can read form mojngolr, then set RECONCILIATION_ENABLED=true.";

export const LEADS_IMPORT_SETUP =
  "Set LEADS_IMPORT_SECRET on Vercel project tim-next-js (Production) to a long random secret (`openssl rand -hex 32`). The lead-email automation calls POST /api/admin/leads/import with Authorization: Bearer $LEADS_IMPORT_SECRET to store parsed Gmail lead emails.";

export const LEAD_DASHBOARD_NOTIFICATION_SETUP =
  "To email staff when a new lead is stored, set LEAD_DASHBOARD_NOTIFICATIONS_ENABLED=true, LEAD_DASHBOARD_NOTIFICATION_RECIPIENTS, LEAD_NOTIFICATION_WEBHOOK_URL, and optionally LEAD_DASHBOARD_URL=https://chuang-leads-dashboard.vercel.app. The webhook body contains no patient fields.";
