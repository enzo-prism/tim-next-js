import type { ReconciliationProviderName } from "@/server/schema";

export interface IReconciliationProvider {
  readonly name: ReconciliationProviderName;
  fetchExternalLeadIds(): Promise<string[]>;
}

export class GoogleAdsReconciliationProvider implements IReconciliationProvider {
  readonly name: ReconciliationProviderName = "google_ads";

  async fetchExternalLeadIds(): Promise<string[]> {
    throw new Error("provider_not_configured");
  }
}

export class FormspreeReconciliationProvider implements IReconciliationProvider {
  readonly name: ReconciliationProviderName = "formspree";

  async fetchExternalLeadIds(): Promise<string[]> {
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
