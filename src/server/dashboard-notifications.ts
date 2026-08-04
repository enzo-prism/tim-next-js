import type { Contact } from "@/server/schema";

// STUB: This module is not yet wired into any ingestion path.
// It will be connected to a tested idempotent outbox in a future iteration.
// Do not claim notifications work until the outbox is implemented and tested.

export type DashboardNotificationConfig = {
  enabled: boolean;
  recipients: string[];
  dashboardUrl: string;
};

const getNotificationConfig = (): DashboardNotificationConfig => {
  const enabled = process.env.LEAD_DASHBOARD_NOTIFICATIONS_ENABLED === "true";
  const recipients = (process.env.LEAD_DASHBOARD_NOTIFICATION_RECIPIENTS || "")
    .split(",")
    .map((r) => r.trim())
    .filter(Boolean);
  const dashboardUrl =
    process.env.LEAD_DASHBOARD_URL || "https://www.famfirstsmile.com/admin";

  return { enabled, recipients, dashboardUrl };
};

export const isNotificationEnabled = (): boolean => {
  const config = getNotificationConfig();
  return config.enabled && config.recipients.length > 0;
};

export async function sendNewLeadNotification(contact: Contact): Promise<{
  sent: boolean;
  reason?: string;
}> {
  const config = getNotificationConfig();

  if (!config.enabled) {
    return { sent: false, reason: "notifications_disabled" };
  }

  if (config.recipients.length === 0) {
    return { sent: false, reason: "no_recipients_configured" };
  }

  const webhookUrl = process.env.LEAD_NOTIFICATION_WEBHOOK_URL;
  if (!webhookUrl) {
    console.warn(
      "Lead dashboard notification skipped: LEAD_NOTIFICATION_WEBHOOK_URL not set.",
      { leadId: contact.id, source: contact.ingestedVia },
    );
    return { sent: false, reason: "webhook_not_configured" };
  }

  const subject = "A new lead just came in";
  const body = [
    "A new lead was received via the website.",
    "",
    `View all leads: ${config.dashboardUrl}`,
    "",
    "This is an automated notification. No patient details are included.",
  ].join("\n");

  try {
    const response = await fetch(webhookUrl, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        subject,
        body,
        to: config.recipients,
        metadata: {
          leadId: contact.id,
          source: contact.ingestedVia,
          requestType: contact.requestType,
        },
      }),
      signal: AbortSignal.timeout(10_000),
    });

    if (!response.ok) {
      console.error(
        `Lead notification webhook returned ${response.status}`,
      );
      return { sent: false, reason: "webhook_error" };
    }

    return { sent: true };
  } catch (error) {
    console.error("Lead dashboard notification failed:", error);
    return { sent: false, reason: "send_failed" };
  }
}
