export const canonicalizeUtmSource = (value: string) => {
  const normalized = value.trim().replace(/\s+/g, " ").toLowerCase();
  const aliases: Record<string, string> = {
    google: "Google Ads",
    "google ads": "Google Ads",
    googleads: "Google Ads",
    adwords: "Google Ads",
    facebook: "Meta",
    fb: "Meta",
    instagram: "Meta",
    meta: "Meta",
    bing: "Microsoft Ads",
    microsoft: "Microsoft Ads",
    "microsoft ads": "Microsoft Ads",
  };
  return (
    aliases[normalized] ||
    normalized.replace(/\b\w/g, (character) => character.toUpperCase())
  );
};

export const normalizeLeadSource = (contact: {
  utmSource?: string | null;
  gclid?: string | null;
  gbraid?: string | null;
  wbraid?: string | null;
  referrer?: string | null;
}) => {
  const utmSource = contact.utmSource?.trim();
  if (utmSource) return canonicalizeUtmSource(utmSource);
  if (contact.gclid || contact.gbraid || contact.wbraid) return "Google Ads";
  // A bare HTTP referrer used to promote a lead to "Referral". It should not.
  // Someone who searched the practice on Google and then filled in the form
  // arrived with referrer=www.google.com, and calling that a referral both
  // hides that they came through our own website and, in a dental practice,
  // reads as a patient referral. The referrer is still shown on the lead; it
  // just no longer decides where the lead came from.
  return "Website form";
};
