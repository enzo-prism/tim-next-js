import { describe, expect, it } from "vitest";
import {
  columnsFromLeadFormFields,
  extraAnswerLines,
  mapGoogleAdsColumnsToContact,
  mapGoogleAdsService,
  parseGoogleAdsColumnData,
  parseGoogleAdsName,
} from "@/server/google-ads-lead";

describe("google ads lead mapping", () => {
  it("parses webhook column data and names", () => {
    const columns = parseGoogleAdsColumnData([
      { column_id: "FULL_NAME", string_value: "Jane Doe" },
      { column_id: "EMAIL", string_value: "jane@example.com" },
      { column_id: "PREFERRED_CONTACT_TIME", string_value: "morning" },
    ]);
    expect(parseGoogleAdsName(columns, "jane@example.com")).toEqual({
      firstName: "Jane",
      lastName: "Doe",
    });
    const contact = mapGoogleAdsColumnsToContact({
      leadId: "lead-1",
      campaignId: "23205053490",
      ingestedVia: "webhook",
      columns,
      rawPayload: { lead_id: "lead-1" },
    });
    expect(contact.preferredTime).toBe("morning");
    expect(contact.email).toBe("jane@example.com");
    expect(contact.requestType).toBe("google_ads_lead");
    expect(contact.consentVersion).toBe("google-lead-form");
  });

  it("maps Ads API field_type columns", () => {
    const columns = columnsFromLeadFormFields([
      { field_type: "EMAIL", field_value: "ada@example.com" },
      { field_type: "PHONE_NUMBER", field_value: "408-555-0100" },
      { field_type: "FIRST_NAME", field_value: "Ada" },
      { field_type: "LAST_NAME", field_value: "Lovelace" },
    ]);
    const contact = mapGoogleAdsColumnsToContact({
      leadId: "lead-2",
      ingestedVia: "reconciliation",
      columns,
      rawPayload: {},
    });
    expect(contact.firstName).toBe("Ada");
    expect(contact.lastName).toBe("Lovelace");
    expect(contact.phone).toBe("408-555-0100");
  });

  it("maps Ads search JSON camelCase fieldType and questionText columns", () => {
    const columns = columnsFromLeadFormFields([
      { fieldType: "EMAIL", fieldValue: "ada@example.com" },
      { fieldType: "PHONE_NUMBER", fieldValue: "408-555-0100" },
      { questionText: "SERVICE", fieldValue: "Invisalign" },
    ]);
    const contact = mapGoogleAdsColumnsToContact({
      leadId: "lead-2b",
      ingestedVia: "reconciliation",
      columns,
      rawPayload: {},
    });
    expect(contact.email).toBe("ada@example.com");
    expect(contact.phone).toBe("408-555-0100");
    expect(contact.service).toBe("invisalign");
  });

  it("maps free-text preferred times into the appointment enum and keeps the original", () => {
    const namedColumns = [
      { column_id: "FULL_NAME", string_value: "Jane Doe" },
      { column_id: "EMAIL", string_value: "jane@example.com" },
      {
        column_id: "PREFERRED_CONTACT_TIME",
        column_name: "Preferred contact time",
        string_value: "afternoon after 4pm",
      },
    ];
    const columns = parseGoogleAdsColumnData(namedColumns);
    const contact = mapGoogleAdsColumnsToContact({
      leadId: "lead-3",
      ingestedVia: "webhook",
      columns,
      namedColumns,
      rawPayload: {},
    });
    expect(contact.preferredTime).toBe("afternoon");
    expect(contact.message).toContain("afternoon after 4pm");
  });

  const contactFromPreferredTime = (value: string) =>
    mapGoogleAdsColumnsToContact({
      leadId: "lead-time",
      ingestedVia: "webhook",
      columns: parseGoogleAdsColumnData([
        { column_id: "EMAIL", string_value: "jane@example.com" },
        { column_id: "PREFERRED_CONTACT_TIME", string_value: value },
      ]),
      rawPayload: {},
    });

  it("does not treat the English word am as morning", () => {
    expect(contactFromPreferredTime("I am available after 5").preferredTime).toBe("afternoon");
    expect(contactFromPreferredTime("I am free").preferredTime).toBeNull();
  });

  it("maps compact clock times like 9am to morning", () => {
    expect(contactFromPreferredTime("9am").preferredTime).toBe("morning");
    expect(contactFromPreferredTime("5pm").preferredTime).toBe("afternoon");
  });

  it("maps a morning window that ends at noon to morning", () => {
    expect(contactFromPreferredTime("9am–12pm").preferredTime).toBe("morning");
  });

  it("folds custom questions, location, and contact method into message", () => {
    const namedColumns = [
      { column_id: "FULL_NAME", column_name: "Full name", string_value: "Jane Doe" },
      { column_id: "EMAIL", column_name: "Email", string_value: "jane@example.com" },
      { column_id: "COMMENT", column_name: "Comment", string_value: "Please call after 3pm" },
      {
        column_id: "CUSTOM_QUESTION_1",
        column_name: "Do you have insurance?",
        string_value: "Yes, I have insurance",
      },
      {
        column_id: "PREFERRED_CONTACT_METHOD",
        column_name: "Preferred contact method",
        string_value: "Email",
      },
      { column_id: "CITY", column_name: "City", string_value: "Los Gatos" },
      { column_id: "POSTAL_CODE", column_name: "Postal code", string_value: "95032" },
    ];
    const columns = parseGoogleAdsColumnData(namedColumns);
    const contact = mapGoogleAdsColumnsToContact({
      leadId: "lead-4",
      ingestedVia: "webhook",
      columns,
      namedColumns,
      rawPayload: {},
    });
    expect(contact.message).toContain("Please call after 3pm");
    expect(contact.message).toContain("Do you have insurance?: Yes, I have insurance");
    expect(contact.message).toContain("Preferred contact method: Email");
    expect(contact.message).toContain("City: Los Gatos");
    expect(contact.message).toContain("Postal code: 95032");
    expect(contact.message?.match(/Yes, I have insurance/g)).toHaveLength(1);
    expect(extraAnswerLines(columns, namedColumns).join("\n")).not.toContain("jane@example.com");
  });

  it("maps known service labels to website slugs and leaves unknown values intact", () => {
    expect(mapGoogleAdsService("Invisalign")).toBe("invisalign");
    expect(mapGoogleAdsService("General & Family Dentistry")).toBe("family-dentistry");
    expect(mapGoogleAdsService("Children's Dentistry")).toBe("children-dentistry");
    expect(mapGoogleAdsService("Something custom")).toBe("Something custom");
    expect(mapGoogleAdsService(null)).toBeNull();
  });
});
