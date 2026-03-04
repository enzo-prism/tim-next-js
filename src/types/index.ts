import type { Service } from "@/content/services";
import type { Contact, InsertContact } from "@/server/schema";

export type { Service, Contact, InsertContact };

export interface AdminChangelogEntry {
  hash: string;
  shortHash: string;
  date: string;
  subject: string;
  url: string | null;
}

export interface AdminChangelogResponse {
  generatedAt: string;
  entries: AdminChangelogEntry[];
}

export interface AdminContactsResponse {
  total: number;
  items: Contact[];
}

export interface Ga4OverviewResponse {
  range: {
    days: 7 | 30 | 90;
    startDate: string;
    endDate: string;
  };
  totals: {
    activeUsers: number;
    sessions: number;
    screenPageViews: number;
  };
  series: Array<{
    date: string;
    activeUsers: number;
    sessions: number;
    screenPageViews: number;
  }>;
  topPages: Array<{
    pagePath: string;
    screenPageViews: number;
  }>;
}

export interface GscOverviewResponse {
  range: {
    days: 7 | 30 | 90;
    startDate: string;
    endDate: string;
  };
  totals: {
    clicks: number;
    impressions: number;
    ctr: number;
    position: number;
  };
  series: Array<{
    date: string;
    clicks: number;
    impressions: number;
    ctr: number;
    position: number;
  }>;
  topQueries: Array<{
    query: string;
    clicks: number;
    impressions: number;
    ctr: number;
    position: number;
  }>;
  topPages: Array<{
    page: string;
    clicks: number;
    impressions: number;
    ctr: number;
    position: number;
  }>;
}
