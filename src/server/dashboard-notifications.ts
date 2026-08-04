export type DashboardNotificationConfig = {
  enabled: boolean;
  recipients: string[];
  dashboardUrl: string;
  webhookUrl: string | null;
};

const getNotificationConfig = (): DashboardNotificationConfig => {
  const enabled = process.env.LEAD_DASHBOARD_NOTIFICATIONS_ENABLED === "true";
  const recipients = (process.env.LEAD_DASHBOARD_NOTIFICATION_RECIPIENTS || "")
    .split(",")
    .map((r) => r.trim())
    .filter(Boolean);
  const dashboardUrl =
    process.env.LEAD_DASHBOARD_URL || "https://www.famfirstsmile.com/admin";
  const webhookUrl = process.env.LEAD_NOTIFICATION_WEBHOOK_URL || null;

  return { enabled, recipients, dashboardUrl, webhookUrl };
};

export const isNotificationEnabled = (): boolean => {
  const config = getNotificationConfig();
  return (
    config.enabled &&
    config.recipients.length > 0 &&
    Boolean(config.webhookUrl)
  );
};

export const getNotificationConfigSafe = (): DashboardNotificationConfig =>
  getNotificationConfig();

export const sendGenericLeadAlert = async (
  idempotencyKey: string,
): Promise<void> => {
  const config = getNotificationConfig();

  if (!config.webhookUrl) {
    throw new Error("webhook_not_configured");
  }

  const response = await fetch(config.webhookUrl, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "Idempotency-Key": idempotencyKey,
    },
    body: JSON.stringify({
      subject: "A new lead just came in",
      body: `A new lead was received.\n\nView all leads: ${config.dashboardUrl}\n\nThis is an automated notification. No patient details are included.`,
      to: config.recipients,
      metadata: { source: "lead_dashboard" },
    }),
    signal: AbortSignal.timeout(10_000),
  });

  if (!response.ok) {
    throw new Error(`webhook_returned_${response.status}`);
  }
};
