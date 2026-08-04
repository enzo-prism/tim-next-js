import type { ReconciliationProviderName } from "@/server/schema";

export interface ReconciliationTimeWindow {
  since: Date;
  until: Date;
}

export interface IReconciliationProvider {
  readonly name: ReconciliationProviderName;
  fetchExternalLeadIds(
    window: ReconciliationTimeWindow,
    signal: AbortSignal,
  ): Promise<string[]>;
}

export class GoogleAdsReconciliationProvider implements IReconciliationProvider {
  readonly name: ReconciliationProviderName = "google_ads";

  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  async fetchExternalLeadIds(window: ReconciliationTimeWindow, signal: AbortSignal): Promise<string[]> {
    throw new Error("provider_not_configured");
  }
}

export class FormspreeReconciliationProvider implements IReconciliationProvider {
  readonly name: ReconciliationProviderName = "formspree";

  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  async fetchExternalLeadIds(window: ReconciliationTimeWindow, signal: AbortSignal): Promise<string[]> {
    throw new Error("provider_not_configured");
  }
}

export const getReconciliationProvider = (
  name: ReconciliationProviderName,
): IReconciliationProvider => {
  switch (name) {
    case "google_ads":
      return new GoogleAdsReconciliationProvider();
    case "formspree":
      return new FormspreeReconciliationProvider();
  }
};

export const ALL_RECONCILIATION_PROVIDERS: ReconciliationProviderName[] = [
  "google_ads",
  "formspree",
];
