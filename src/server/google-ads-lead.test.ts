import { describe, expect, it } from "vitest";
import {
  columnsFromLeadFormFields,
  mapGoogleAdsColumnsToContact,
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

  it("leaves free-text preferred times unmapped", () => {
    const columns = parseGoogleAdsColumnData([
      { column_id: "FULL_NAME", string_value: "Jane Doe" },
      { column_id: "EMAIL", string_value: "jane@example.com" },
      { column_id: "PREFERRED_CONTACT_TIME", string_value: "afternoon after 4pm" },
    ]);
    const contact = mapGoogleAdsColumnsToContact({
      leadId: "lead-3",
      ingestedVia: "webhook",
      columns,
      rawPayload: {},
    });
    expect(contact.preferredTime).toBeNull();
  });
});
