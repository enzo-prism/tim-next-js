import { storage } from "@/server/storage";
import { relayLeadNotification, toFormspreePayload } from "@/server/lead-notifications";

const MAX_BATCH_SIZE = 10;

export type FormspreeRetryResult = {
  processed: number;
  delivered: number;
  failed: number;
  skipped: number;
};

export const retryFailedFormspreeNotifications = async (): Promise<FormspreeRetryResult> => {
  const result: FormspreeRetryResult = {
    processed: 0,
    delivered: 0,
    failed: 0,
    skipped: 0,
  };

  let leads;
  try {
    leads = await storage.listFailedFormspreeLeads(MAX_BATCH_SIZE);
  } catch {
    console.error("formspree_retry_list_failed");
    return result;
  }

  for (const lead of leads) {
    try {
      await storage.enqueueLeadOutbox(lead);
    } catch {
      console.error("formspree_retry_outbox_enqueue_failed");
    }

    const payload = toFormspreePayload(lead);
    if (!payload) {
      result.skipped += 1;
      continue;
    }

    let claimed;
    try {
      claimed = await storage.claimContactNotification(lead.id);
    } catch {
      console.error("formspree_retry_claim_failed");
      result.failed += 1;
      continue;
    }

    if (!claimed) {
      result.skipped += 1;
      continue;
    }

    result.processed += 1;
    const claimedPayload = toFormspreePayload(claimed) ?? payload;

    try {
      await relayLeadNotification(claimedPayload);
      try {
        await storage.updateContactFormspreeStatus(lead.id, "delivered");
      } catch {
        console.error("formspree_retry_status_update_failed");
      }
      result.delivered += 1;
    } catch {
      console.error("formspree_retry_relay_failed");
      try {
        await storage.updateContactFormspreeStatus(lead.id, "failed");
      } catch {
        console.error("formspree_retry_failure_status_update_failed");
      }
      result.failed += 1;
    }
  }

  return result;
};
