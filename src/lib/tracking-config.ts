export const CANONICAL_GA_MEASUREMENT_ID = "G-L7MH47XYXL";

/** Vite-era measurement ID for retired GA4 property 500238593. Never send hits. */
export const RETIRED_GA_MEASUREMENT_IDS: readonly string[] = ["G-54ESSN4BF8"];

export const resolveGaMeasurementId = (raw?: string | null) => {
  const value = raw?.trim() ?? "";
  // Property 518867337 is the only live GA4 destination. Empty, whitespace,
  // retired (G-54ESSN4BF8 / 500238593), and any other G- ID are ignored.
  return value === CANONICAL_GA_MEASUREMENT_ID ? value : CANONICAL_GA_MEASUREMENT_ID;
};

export const GA_MEASUREMENT_ID = resolveGaMeasurementId(
  process.env.NEXT_PUBLIC_GA_MEASUREMENT_ID,
);

export const GOOGLE_ADS_TAG_ID =
  process.env.NEXT_PUBLIC_GOOGLE_ADS_TAG_ID || "AW-11373090310";

export const GOOGLE_ADS_CONVERSION_EVENT =
  process.env.NEXT_PUBLIC_GOOGLE_ADS_CONVERSION_EVENT || "ads_conversion_Submit_lead_form_1";

export const APPOINTMENT_FORM_URL = "/book-appointment";

export const buildAppointmentUrl = (options: { serviceId?: string; source?: string } = {}) => {
  const params = new URLSearchParams();
  if (options.serviceId) params.set("service", options.serviceId);
  if (options.source) params.set("source", options.source);
  const query = params.toString();
  return query ? `${APPOINTMENT_FORM_URL}?${query}` : APPOINTMENT_FORM_URL;
};
