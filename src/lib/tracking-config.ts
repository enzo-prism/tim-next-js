export const GA_MEASUREMENT_ID =
  process.env.NEXT_PUBLIC_GA_MEASUREMENT_ID || "G-L7MH47XYXL";

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
