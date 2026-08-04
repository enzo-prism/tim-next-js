import type { ReconciliationProviderName } from "@/server/schema";

export interface ReconciliationTimeWindow {
  since: Date;
  until: Date;
}

export interface IReconciliationProvider {
  readonly name: ReconciliationProviderName;
  fetchExternalLeadIds(window: ReconciliationTimeWindow): Promise<string[]>;
}

export class GoogleAdsReconciliationProvider implements IReconciliationProvider {
  readonly name: ReconciliationProviderName = "google_ads";

  async fetchExternalLeadIds(_window: ReconciliationTimeWindow): Promise<string[]> {
    throw new Error("provider_not_configured");
  }
}

export class FormspreeReconciliationProvider implements IReconciliationProvider {
  readonly name: ReconciliationProviderName = "formspree";

  async fetchExternalLeadIds(_window: ReconciliationTimeWindow): Promise<string[]> {
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
