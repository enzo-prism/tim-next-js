export const GA_MEASUREMENT_ID =
  process.env.NEXT_PUBLIC_GA_MEASUREMENT_ID || "G-L7MH47XYXL";

export const GOOGLE_ADS_TAG_ID =
  process.env.NEXT_PUBLIC_GOOGLE_ADS_TAG_ID || "AW-11373090310";

export const GOOGLE_ADS_CONVERSION_EVENT =
  process.env.NEXT_PUBLIC_GOOGLE_ADS_CONVERSION_EVENT || "ads_conversion_Submit_lead_form_1";

export const HOTJAR_ID = Number.parseInt(process.env.NEXT_PUBLIC_HOTJAR_ID || "6487571", 10);
export const HOTJAR_SNIPPET_VERSION = Number.parseInt(
  process.env.NEXT_PUBLIC_HOTJAR_SNIPPET_VERSION || "6",
  10,
);

export const APPOINTMENT_FORM_URL = "/book-appointment";
