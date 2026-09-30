import type { Contact } from "@/server/schema";
import { storage } from "@/server/storage";
import {
  LeadNotificationRejectedError,
  relayLeadNotification,
  toFormspreePayload,
} from "@/server/lead-notifications";

const MAX_BATCH_SIZE = 10;
export type DeliveryOutcome = "delivered" | "failed" | "skipped" | "indeterminate";
export type FormspreeRetryResult = {
  processed: number;
  delivered: number;
  failed: number;
  skipped: number;
  indeterminate: number;
  errorCode?: "storage_unavailable";
};

export const deliverWebsiteLead = async (lead: Contact): Promise<DeliveryOutcome> => {
  if (lead.formspreeStatus !== "failed" || !toFormspreePayload(lead)) return "skipped";
  let claimed: Contact | undefined;
  try {
    claimed = await storage.claimContactNotification(lead.id);
  } catch {
    console.error("formspree_retry_claim_failed");
    return "failed";
  }
  if (!claimed) return "skipped";
  const payload = toFormspreePayload(claimed);
  if (!payload) {
    console.error("formspree_retry_payload_invalid");
    try { await storage.updateContactFormspreeStatus(lead.id, "failed"); } catch { /* Cron health reports the stuck claim. */ }
    return "failed";
  }
  try {
    await relayLeadNotification(payload);
  } catch (error) {
    // Network failures/timeouts do not prove the provider rejected the send.
    // Keep sending claims until provider evidence resolves the uncertainty.
    if (!(error instanceof LeadNotificationRejectedError) || error.status < 400 || error.status >= 500 || error.status === 408) {
      console.error("formspree_delivery_indeterminate");
      return "indeterminate";
    }
    console.error("formspree_delivery_rejected");
    try {
      await storage.updateContactFormspreeStatus(lead.id, "failed");
    } catch {
      console.error("formspree_retry_failure_status_update_failed");
      return "indeterminate";
    }
    return "failed";
  }
  try {
    await storage.updateContactFormspreeStatus(lead.id, "delivered");
  } catch {
    console.error("formspree_retry_status_update_failed");
    return "indeterminate";
  }
  return "delivered";
};

export const retryFailedFormspreeNotifications = async (): Promise<FormspreeRetryResult> => {
  const result: FormspreeRetryResult = {
    processed: 0, delivered: 0, failed: 0, skipped: 0, indeterminate: 0,
  };
  let leads: Contact[];
  try {
    leads = await storage.listFailedFormspreeLeads(MAX_BATCH_SIZE);
  } catch {
    console.error("formspree_retry_list_failed");
    return { ...result, errorCode: "storage_unavailable" };
  }
  for (const lead of leads) {
    const outcome = await deliverWebsiteLead(lead);
    result[outcome] += 1;
    if (outcome !== "skipped") result.processed += 1;
  }
  return result;
};
