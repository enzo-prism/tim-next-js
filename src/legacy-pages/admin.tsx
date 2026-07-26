"use client";

import { useMemo, useState } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import {
  CartesianGrid,
  Line,
  LineChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Skeleton } from "@/components/ui/skeleton";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Textarea } from "@/components/ui/textarea";
import { ToggleGroup, ToggleGroupItem } from "@/components/ui/toggle-group";
import type {
  AdminContactItem,
  AdminContactsResponse,
  UpdateAdminContactInput,
  UpdateAdminContactResponse,
} from "@/app/api/admin/contacts/types";
import type { LeadStatus } from "@/server/schema";

type DaysOption = 7 | 30 | 90;

type MissingConfigPayload = {
  ok: false;
  error: "missing_config";
  message: string;
  missing: string[];
};

type AdminChangelogEntry = {
  hash: string;
  shortHash: string;
  date: string;
  subject: string;
  url: string | null;
};

type AdminChangelogResponse = {
  generatedAt: string;
  entries: AdminChangelogEntry[];
};

type AnalyticsSectionState =
  | { status: "available" }
  | { status: "unavailable"; message: string };

type GA4OverviewResponse = {
  range: { days: DaysOption; startDate: string; endDate: string };
  totals: { activeUsers: number; sessions: number; screenPageViews: number };
  series: Array<{
    date: string;
    activeUsers: number;
    sessions: number;
    screenPageViews: number;
  }>;
  topPages: Array<{ pagePath: string; screenPageViews: number }> | null;
  partial: boolean;
  sections: {
    overview: AnalyticsSectionState;
    topPages: AnalyticsSectionState;
  };
};

type GSCOverviewResponse = {
  range: { days: DaysOption; startDate: string; endDate: string };
  totals: { clicks: number; impressions: number; ctr: number; position: number };
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
  }> | null;
  topPages: Array<{
    page: string;
    clicks: number;
    impressions: number;
    ctr: number;
    position: number;
  }> | null;
  searchOpportunities: Array<{
    page: string;
    query: string;
    clicks: number;
    impressions: number;
    ctr: number;
    position: number;
    opportunityScore: number;
  }> | null;
  partial: boolean;
  sections: {
    overview: AnalyticsSectionState;
    topQueries: AnalyticsSectionState;
    topPages: AnalyticsSectionState;
    searchOpportunities:
      | {
          status: "available";
          truncated: boolean;
          rowsScanned: number;
          rowCap: number;
        }
      | {
          status: "unavailable";
          message: string;
          truncated: false;
          rowsScanned: 0;
          rowCap: number;
        };
  };
  opportunityCriteria: {
    minPosition: number;
    maxPosition: number;
    limit: number;
    score: string;
  };
};

type FetchJsonError = Error & {
  status?: number;
  payload?: unknown;
};

const isMissingConfigPayload = (value: unknown): value is MissingConfigPayload => {
  if (!value || typeof value !== "object") return false;
  const v = value as Record<string, unknown>;
  return (
    v.ok === false &&
    v.error === "missing_config" &&
    typeof v.message === "string" &&
    Array.isArray(v.missing)
  );
};

const getPayloadMessage = (value: unknown): string | null => {
  if (!value || typeof value !== "object") return null;
  const v = value as Record<string, unknown>;
  return typeof v.message === "string" ? v.message : null;
};

async function fetchJson<T>(url: string): Promise<T> {
  const res = await fetch(url, {
    credentials: "include",
    headers: { Accept: "application/json" },
  });

  const text = await res.text();
  let payload: unknown = null;
  if (text) {
    try {
      payload = JSON.parse(text) as unknown;
    } catch {
      payload = null;
    }
  }

  if (!res.ok) {
    const message = getPayloadMessage(payload) || res.statusText;

    const error: FetchJsonError = new Error(message);
    error.status = res.status;
    error.payload = payload;
    throw error;
  }

  return payload as T;
}

async function patchJson<T>(url: string, body: unknown): Promise<T> {
  const res = await fetch(url, {
    method: "PATCH",
    credentials: "include",
    headers: { Accept: "application/json", "Content-Type": "application/json" },
    body: JSON.stringify(body),
  });

  const payload = (await res.json().catch(() => null)) as unknown;
  if (!res.ok) {
    const error: FetchJsonError = new Error(getPayloadMessage(payload) || res.statusText);
    error.status = res.status;
    error.payload = payload;
    throw error;
  }
  return payload as T;
}

async function postJson<T>(url: string, body: unknown): Promise<T> {
  const res = await fetch(url, {
    method: "POST",
    credentials: "include",
    headers: { Accept: "application/json", "Content-Type": "application/json" },
    body: JSON.stringify(body),
  });

  const payload = (await res.json().catch(() => null)) as unknown;
  if (!res.ok) {
    const error: FetchJsonError = new Error(getPayloadMessage(payload) || res.statusText);
    error.status = res.status;
    error.payload = payload;
    throw error;
  }
  return payload as T;
}

const formatInt = (value: number) => value.toLocaleString();
const formatPercent = (value: number) => `${(value * 100).toFixed(1)}%`;
const formatPosition = (value: number) => value.toFixed(1);
const formatSearchPage = (value: string) => {
  try {
    const path = new URL(value).pathname;
    return path || "/";
  } catch {
    return value || "(not set)";
  }
};
const formatDateTime = (value: string) => {
  const date = new Date(value);
  return Number.isNaN(date.getTime()) ? value : date.toLocaleString();
};

const leadStatusOptions: Array<{ value: LeadStatus; label: string }> = [
  { value: "new", label: "New" },
  { value: "contacted", label: "Contacted" },
  { value: "booked", label: "Booked" },
  { value: "arrived", label: "Arrived" },
  { value: "no-show", label: "No-show" },
  { value: "lost", label: "Lost" },
];

const statusLabel = (value: LeadStatus) =>
  leadStatusOptions.find((option) => option.value === value)?.label ?? value;

function LeadLifecycleEditor({
  row,
  saving,
  onSave,
}: {
  row: AdminContactItem;
  saving: boolean;
  onSave: (input: UpdateAdminContactInput) => Promise<void>;
}) {
  const [leadStatus, setLeadStatus] = useState<LeadStatus>(row.leadStatus);
  const [lostReason, setLostReason] = useState(row.lostReason ?? "");
  const [staffNotes, setStaffNotes] = useState(row.staffNotes ?? "");
  const [error, setError] = useState<string | null>(null);

  const isDirty =
    leadStatus !== row.leadStatus ||
    lostReason.trim() !== (row.lostReason ?? "") ||
    staffNotes.trim() !== (row.staffNotes ?? "");
  const lostReasonMissing = leadStatus === "lost" && !lostReason.trim();

  const save = async () => {
    setError(null);
    try {
      await onSave({
        leadStatus,
        lostReason: leadStatus === "lost" ? lostReason.trim() : null,
        staffNotes: staffNotes.trim() || null,
        expectedUpdatedAt: row.updatedAt,
      });
    } catch (saveError) {
      setError(saveError instanceof Error ? saveError.message : "Update failed.");
    }
  };

  return (
    <div className="min-w-[300px] space-y-3">
      <div className="space-y-1.5">
        <Label htmlFor={`lead-status-${row.id}`} className="text-xs">
          Patient stage
        </Label>
        <Select
          value={leadStatus}
          onValueChange={(value) => setLeadStatus(value as LeadStatus)}
          disabled={saving}
        >
          <SelectTrigger id={`lead-status-${row.id}`}>
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            {leadStatusOptions.map((option) => (
              <SelectItem key={option.value} value={option.value}>
                {option.label}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      {leadStatus === "lost" ? (
        <div className="space-y-1.5">
          <Label htmlFor={`lost-reason-${row.id}`} className="text-xs">
            Lost reason
          </Label>
          <Input
            id={`lost-reason-${row.id}`}
            value={lostReason}
            onChange={(event) => setLostReason(event.target.value)}
            maxLength={500}
            placeholder="Insurance, timing, unreachable..."
            disabled={saving}
            aria-invalid={lostReasonMissing}
          />
        </div>
      ) : null}

      <div className="space-y-1.5">
        <Label htmlFor={`staff-notes-${row.id}`} className="text-xs">
          Private staff notes
        </Label>
        <Textarea
          id={`staff-notes-${row.id}`}
          value={staffNotes}
          onChange={(event) => setStaffNotes(event.target.value)}
          maxLength={4000}
          rows={3}
          placeholder="Follow-up details visible only in admin"
          disabled={saving}
        />
      </div>

      <div className="flex items-center justify-between gap-3">
        <Button
          type="button"
          size="sm"
          onClick={save}
          disabled={!isDirty || lostReasonMissing || saving}
        >
          {saving ? "Saving..." : "Save stage"}
        </Button>
        <span className="text-xs text-muted-foreground" aria-live="polite">
          {error || (isDirty ? "Unsaved changes" : "Saved")}
        </span>
      </div>

      <div className="space-y-1 text-xs text-muted-foreground">
        {row.contactedAt ? <div>Contacted {formatDateTime(row.contactedAt)}</div> : null}
        {row.bookedAt ? <div>Booked {formatDateTime(row.bookedAt)}</div> : null}
        {row.arrivedAt ? <div>Arrived {formatDateTime(row.arrivedAt)}</div> : null}
      </div>
    </div>
  );
}

function QueryErrorCard({ error }: { error: unknown }) {
  const err = error as FetchJsonError;
  const payload = err?.payload;

  if (err?.status === 401) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="text-base">Unauthorized</CardTitle>
        </CardHeader>
        <CardContent className="space-y-3 text-sm text-muted-foreground">
          <p>Refresh the page and enter the admin password again.</p>
          <Button variant="outline" onClick={() => window.location.reload()}>
            Reload & Authenticate
          </Button>
        </CardContent>
      </Card>
    );
  }

  if (isMissingConfigPayload(payload)) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="text-base">Configuration Needed</CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          <p className="text-sm text-muted-foreground">{payload.message}</p>
          {payload.missing.length ? (
            <div className="rounded-md bg-muted p-3 text-sm">
              <div className="font-semibold mb-1">Missing:</div>
              <ul className="list-disc pl-5 space-y-1">
                {payload.missing.map((item) => (
                  <li key={item} className="font-mono text-xs">
                    {item}
                  </li>
                ))}
              </ul>
            </div>
          ) : null}
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-base">Something Went Wrong</CardTitle>
      </CardHeader>
      <CardContent className="text-sm text-muted-foreground">
        {err?.message || "Failed to load admin data."}
      </CardContent>
    </Card>
  );
}

function PartialDataNotice() {
  return (
    <div
      role="status"
      className="rounded-lg border border-blue-200 bg-blue-50 px-4 py-3 text-sm text-blue-900"
    >
      Some reporting sections are temporarily unavailable. Available numbers are still shown.
    </div>
  );
}

export default function Admin() {
  const queryClient = useQueryClient();
  const [tab, setTab] = useState<"changelog" | "ga4" | "gsc" | "contacts">(
    "changelog",
  );
  const [days, setDays] = useState<DaysOption>(30);
  const [contactsSearch, setContactsSearch] = useState("");
  const [contactsStatus, setContactsStatus] = useState<"all" | LeadStatus>("all");
  const [contactsSource, setContactsSource] = useState("all");
  const [contactsPage, setContactsPage] = useState(0);
  const contactsLimit = 25;

  const changelogQuery = useQuery({
    queryKey: ["/api/admin/changelog"],
    queryFn: () => fetchJson<AdminChangelogResponse>("/api/admin/changelog"),
  });

  const gaQueryKey = useMemo(
    () => `/api/admin/ga4/overview?days=${days}`,
    [days],
  );
  const ga4Query = useQuery({
    queryKey: [gaQueryKey],
    queryFn: () => fetchJson<GA4OverviewResponse>(gaQueryKey),
    enabled: tab === "ga4",
  });

  const gscQueryKey = useMemo(
    () => `/api/admin/gsc/overview?days=${days}`,
    [days],
  );
  const gscQuery = useQuery({
    queryKey: [gscQueryKey],
    queryFn: () => fetchJson<GSCOverviewResponse>(gscQueryKey),
    enabled: tab === "gsc",
  });

  const contactsRequest = useMemo(() => {
    const q = contactsSearch.trim();
    return {
      limit: contactsLimit,
      offset: contactsPage * contactsLimit,
      ...(q ? { q } : {}),
      ...(contactsStatus !== "all" ? { status: contactsStatus } : {}),
      ...(contactsSource !== "all" ? { source: contactsSource } : {}),
    };
  }, [contactsLimit, contactsPage, contactsSearch, contactsSource, contactsStatus]);
  const contactsQuery = useQuery({
    queryKey: ["admin-contacts", contactsRequest],
    queryFn: () =>
      postJson<AdminContactsResponse>("/api/admin/contacts", contactsRequest),
    enabled: tab === "contacts",
  });
  const updateContactMutation = useMutation({
    mutationFn: ({
      id,
      input,
    }: {
      id: string;
      input: UpdateAdminContactInput;
    }) =>
      patchJson<UpdateAdminContactResponse>(
        `/api/admin/contacts/${encodeURIComponent(id)}`,
        input,
      ),
    onSuccess: async () => {
      await queryClient.invalidateQueries({
        predicate: (query) =>
          query.queryKey[0] === "admin-contacts",
      });
    },
    onError: (error) => {
      if ((error as FetchJsonError)?.status === 409) {
        void queryClient.invalidateQueries({ queryKey: ["admin-contacts"] });
      }
    },
  });

  const isRefreshing =
    changelogQuery.isFetching ||
    ga4Query.isFetching ||
    gscQuery.isFetching ||
    contactsQuery.isFetching;

  const refresh = async () => {
    await queryClient.invalidateQueries({ queryKey: ["/api/admin/changelog"] });
    await queryClient.invalidateQueries({ queryKey: [gaQueryKey] });
    await queryClient.invalidateQueries({ queryKey: [gscQueryKey] });
    await queryClient.invalidateQueries({ queryKey: ["admin-contacts"] });
  };

  const showRange = tab === "ga4" || tab === "gsc";
  const contactsTotal = contactsQuery.data?.total ?? 0;
  const contactsItems = contactsQuery.data?.items ?? [];
  const sourceSummary = contactsQuery.data?.sourceSummary ?? [];
  const pipelineTotals = sourceSummary.reduce(
    (totals, source) => ({
      leads: totals.leads + source.leads,
      booked: totals.booked + source.booked,
      arrived: totals.arrived + source.arrived,
    }),
    { leads: 0, booked: 0, arrived: 0 },
  );
  const pipelineBookingRate = pipelineTotals.leads
    ? pipelineTotals.booked / pipelineTotals.leads
    : 0;
  const pipelineArrivalRate = pipelineTotals.leads
    ? pipelineTotals.arrived / pipelineTotals.leads
    : 0;
  const contactsStart = contactsTotal > 0 ? contactsPage * contactsLimit + 1 : 0;
  const contactsEnd =
    contactsTotal > 0 ? Math.min(contactsStart + contactsItems.length - 1, contactsTotal) : 0;
  const canPrevContacts = contactsPage > 0;
  const canNextContacts = (contactsPage + 1) * contactsLimit < contactsTotal;

  return (
    <div className="pt-16 pb-20 bg-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="flex flex-col gap-6 sm:flex-row sm:items-end sm:justify-between">
          <div className="space-y-1">
            <h1 className="text-3xl font-bold text-gray-900">Admin</h1>
            <p className="text-sm text-gray-600">
              Changelog, contacts, Google Analytics (GA4), and Search Console.
            </p>
          </div>

          <div className="flex flex-col sm:flex-row gap-3 sm:items-center sm:justify-end">
            {showRange ? (
              <div className="flex items-center gap-3">
                <div className="text-xs font-semibold uppercase tracking-wide text-gray-500">
                  Range
                </div>
                <ToggleGroup
                  type="single"
                  value={String(days)}
                  onValueChange={(value) => {
                    if (!value) return;
                    const next = Number.parseInt(value, 10) as DaysOption;
                    setDays(next);
                  }}
                  className="justify-start"
                >
                  <ToggleGroupItem value="7" aria-label="Last 7 days">
                    7d
                  </ToggleGroupItem>
                  <ToggleGroupItem value="30" aria-label="Last 30 days">
                    30d
                  </ToggleGroupItem>
                  <ToggleGroupItem value="90" aria-label="Last 90 days">
                    90d
                  </ToggleGroupItem>
                </ToggleGroup>
              </div>
            ) : null}

            <Button variant="outline" onClick={refresh} disabled={isRefreshing}>
              {isRefreshing ? "Refreshing..." : "Refresh"}
            </Button>
          </div>
        </div>

        <Tabs value={tab} onValueChange={(value) => setTab(value as typeof tab)} className="mt-10">
          <TabsList className="w-full justify-start">
            <TabsTrigger value="changelog">Changelog</TabsTrigger>
            <TabsTrigger value="ga4">Google Analytics</TabsTrigger>
            <TabsTrigger value="gsc">Search Console</TabsTrigger>
            <TabsTrigger value="contacts">Contacts</TabsTrigger>
          </TabsList>

          <TabsContent value="changelog" className="mt-6">
            {changelogQuery.isLoading ? (
              <div className="space-y-4">
                <Skeleton className="h-24 w-full" />
                <Skeleton className="h-24 w-full" />
              </div>
            ) : changelogQuery.isError ? (
              <QueryErrorCard error={changelogQuery.error} />
            ) : (
              <Card>
                <CardHeader>
                  <CardTitle className="text-base">Recent Updates</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="text-xs text-muted-foreground">
                    Generated at:{" "}
                    <span className="font-mono">
                      {changelogQuery.data?.generatedAt}
                    </span>
                  </div>

                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead className="w-[140px]">Date</TableHead>
                        <TableHead>Change</TableHead>
                        <TableHead className="w-[120px]">Commit</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {changelogQuery.data?.entries?.length ? (
                        changelogQuery.data.entries.map((entry) => (
                          <TableRow key={entry.hash}>
                            <TableCell className="font-mono text-xs">
                              {entry.date}
                            </TableCell>
                            <TableCell className="text-sm">
                              {entry.subject}
                            </TableCell>
                            <TableCell className="font-mono text-xs">
                              {entry.url ? (
                                <a
                                  href={entry.url}
                                  target="_blank"
                                  rel="noopener noreferrer"
                                  className="text-primary hover:underline"
                                >
                                  {entry.shortHash}
                                </a>
                              ) : (
                                entry.shortHash
                              )}
                            </TableCell>
                          </TableRow>
                        ))
                      ) : (
                        <TableRow>
                          <TableCell colSpan={3} className="text-sm text-muted-foreground">
                            No changelog entries found.
                          </TableCell>
                        </TableRow>
                      )}
                    </TableBody>
                  </Table>
                </CardContent>
              </Card>
            )}
          </TabsContent>

          <TabsContent value="ga4" className="mt-6 space-y-6">
            {ga4Query.isLoading ? (
              <div className="space-y-4">
                <Skeleton className="h-40 w-full" />
                <Skeleton className="h-72 w-full" />
              </div>
            ) : ga4Query.isError ? (
              <QueryErrorCard error={ga4Query.error} />
            ) : (
              <>
                {ga4Query.data?.partial ? <PartialDataNotice /> : null}
                <div className="grid gap-4 md:grid-cols-3">
                  <Card>
                    <CardHeader>
                      <CardTitle className="text-sm text-muted-foreground">Active Users</CardTitle>
                    </CardHeader>
                    <CardContent className="text-3xl font-bold">
                      {formatInt(ga4Query.data?.totals.activeUsers ?? 0)}
                    </CardContent>
                  </Card>
                  <Card>
                    <CardHeader>
                      <CardTitle className="text-sm text-muted-foreground">Sessions</CardTitle>
                    </CardHeader>
                    <CardContent className="text-3xl font-bold">
                      {formatInt(ga4Query.data?.totals.sessions ?? 0)}
                    </CardContent>
                  </Card>
                  <Card>
                    <CardHeader>
                      <CardTitle className="text-sm text-muted-foreground">Page Views</CardTitle>
                    </CardHeader>
                    <CardContent className="text-3xl font-bold">
                      {formatInt(ga4Query.data?.totals.screenPageViews ?? 0)}
                    </CardContent>
                  </Card>
                </div>

                <Card>
                  <CardHeader>
                    <CardTitle className="text-base">Active Users Trend</CardTitle>
                  </CardHeader>
                  <CardContent className="h-[320px]">
                    <ResponsiveContainer width="100%" height="100%">
                      <LineChart data={ga4Query.data?.series ?? []}>
                        <CartesianGrid strokeDasharray="3 3" />
                        <XAxis
                          dataKey="date"
                          tickFormatter={(value: string) => value.slice(5)}
                        />
                        <YAxis />
                        <Tooltip />
                        <Line
                          type="monotone"
                          dataKey="activeUsers"
                          stroke="var(--primary)"
                          strokeWidth={2}
                          dot={false}
                        />
                      </LineChart>
                    </ResponsiveContainer>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader>
                    <CardTitle className="text-base">Top Pages</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <Table>
                      <TableHeader>
                        <TableRow>
                          <TableHead>Path</TableHead>
                          <TableHead className="w-[160px] text-right">Views</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {ga4Query.data?.sections.topPages.status === "unavailable" ? (
                          <TableRow>
                            <TableCell colSpan={2} className="text-sm text-muted-foreground">
                              {ga4Query.data.sections.topPages.message}
                            </TableCell>
                          </TableRow>
                        ) : ga4Query.data?.topPages?.length ? (
                          ga4Query.data.topPages.map((row) => (
                            <TableRow key={row.pagePath}>
                              <TableCell className="font-mono text-xs">
                                {row.pagePath || "(not set)"}
                              </TableCell>
                              <TableCell className="text-right font-mono text-xs">
                                {formatInt(row.screenPageViews)}
                              </TableCell>
                            </TableRow>
                          ))
                        ) : (
                          <TableRow>
                            <TableCell colSpan={2} className="text-sm text-muted-foreground">
                              No page data found.
                            </TableCell>
                          </TableRow>
                        )}
                      </TableBody>
                    </Table>
                  </CardContent>
                </Card>
              </>
            )}
          </TabsContent>

          <TabsContent value="gsc" className="mt-6 space-y-6">
            {gscQuery.isLoading ? (
              <div className="space-y-4">
                <Skeleton className="h-40 w-full" />
                <Skeleton className="h-72 w-full" />
              </div>
            ) : gscQuery.isError ? (
              <QueryErrorCard error={gscQuery.error} />
            ) : (
              <>
                {gscQuery.data?.partial ? <PartialDataNotice /> : null}
                <div className="grid gap-4 md:grid-cols-4">
                  <Card>
                    <CardHeader>
                      <CardTitle className="text-sm text-muted-foreground">Clicks</CardTitle>
                    </CardHeader>
                    <CardContent className="text-3xl font-bold">
                      {formatInt(gscQuery.data?.totals.clicks ?? 0)}
                    </CardContent>
                  </Card>
                  <Card>
                    <CardHeader>
                      <CardTitle className="text-sm text-muted-foreground">Impressions</CardTitle>
                    </CardHeader>
                    <CardContent className="text-3xl font-bold">
                      {formatInt(gscQuery.data?.totals.impressions ?? 0)}
                    </CardContent>
                  </Card>
                  <Card>
                    <CardHeader>
                      <CardTitle className="text-sm text-muted-foreground">CTR</CardTitle>
                    </CardHeader>
                    <CardContent className="text-3xl font-bold">
                      {formatPercent(gscQuery.data?.totals.ctr ?? 0)}
                    </CardContent>
                  </Card>
                  <Card>
                    <CardHeader>
                      <CardTitle className="text-sm text-muted-foreground">Avg Position</CardTitle>
                    </CardHeader>
                    <CardContent className="text-3xl font-bold">
                      {formatPosition(gscQuery.data?.totals.position ?? 0)}
                    </CardContent>
                  </Card>
                </div>

                <Card>
                  <CardHeader>
                    <CardTitle className="text-base">Clicks Trend</CardTitle>
                  </CardHeader>
                  <CardContent className="h-[320px]">
                    <ResponsiveContainer width="100%" height="100%">
                      <LineChart data={gscQuery.data?.series ?? []}>
                        <CartesianGrid strokeDasharray="3 3" />
                        <XAxis
                          dataKey="date"
                          tickFormatter={(value: string) => value.slice(5)}
                        />
                        <YAxis />
                        <Tooltip />
                        <Line
                          type="monotone"
                          dataKey="clicks"
                          stroke="var(--secondary)"
                          strokeWidth={2}
                          dot={false}
                        />
                      </LineChart>
                    </ResponsiveContainer>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader>
                    <CardTitle className="text-base">Search Growth Opportunities</CardTitle>
                    <p className="text-sm text-muted-foreground">
                      Query-page pairs ranking in positions 4-20, prioritized by impressions,
                      ranking potential, and CTR headroom. This is a work queue, not a traffic
                      forecast.
                    </p>
                  </CardHeader>
                  <CardContent>
                    <Table>
                      <TableHeader>
                        <TableRow>
                          <TableHead>Query</TableHead>
                          <TableHead>Ranking page</TableHead>
                          <TableHead className="text-right">Impressions</TableHead>
                          <TableHead className="text-right">CTR</TableHead>
                          <TableHead className="text-right">Position</TableHead>
                          <TableHead className="text-right">Priority</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {gscQuery.data?.sections.searchOpportunities.status ===
                        "unavailable" ? (
                          <TableRow>
                            <TableCell colSpan={6} className="text-sm text-muted-foreground">
                              {gscQuery.data.sections.searchOpportunities.message}
                            </TableCell>
                          </TableRow>
                        ) : gscQuery.data?.searchOpportunities?.length ? (
                          gscQuery.data.searchOpportunities.map((row) => (
                            <TableRow key={`${row.page}:${row.query}`}>
                              <TableCell className="max-w-[280px] text-sm font-medium">
                                {row.query}
                              </TableCell>
                              <TableCell className="max-w-[320px] font-mono text-xs">
                                <a
                                  href={row.page}
                                  target="_blank"
                                  rel="noopener noreferrer"
                                  className="text-primary hover:underline"
                                >
                                  {formatSearchPage(row.page)}
                                </a>
                              </TableCell>
                              <TableCell className="text-right font-mono text-xs">
                                {formatInt(row.impressions)}
                              </TableCell>
                              <TableCell className="text-right font-mono text-xs">
                                {formatPercent(row.ctr)}
                              </TableCell>
                              <TableCell className="text-right font-mono text-xs">
                                {formatPosition(row.position)}
                              </TableCell>
                              <TableCell className="text-right font-mono text-xs">
                                {row.opportunityScore.toFixed(1)}
                              </TableCell>
                            </TableRow>
                          ))
                        ) : (
                          <TableRow>
                            <TableCell colSpan={6} className="text-sm text-muted-foreground">
                              No position 4-20 opportunities were found for this period.
                            </TableCell>
                          </TableRow>
                        )}
                      </TableBody>
                    </Table>
                    {gscQuery.data?.sections.searchOpportunities.status === "available" &&
                    gscQuery.data.sections.searchOpportunities.truncated ? (
                      <p className="mt-3 text-xs text-muted-foreground">
                        Opportunity analysis reached its bounded{" "}
                        {formatInt(gscQuery.data.sections.searchOpportunities.rowCap)}-row cap.
                        Results may be incomplete.
                      </p>
                    ) : null}
                  </CardContent>
                </Card>

                <div className="grid gap-6 lg:grid-cols-2">
                  <Card>
                    <CardHeader>
                      <CardTitle className="text-base">Top Queries</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <Table>
                        <TableHeader>
                          <TableRow>
                            <TableHead>Query</TableHead>
                            <TableHead className="w-[120px] text-right">Clicks</TableHead>
                            <TableHead className="w-[140px] text-right">Impressions</TableHead>
                          </TableRow>
                        </TableHeader>
                        <TableBody>
                          {gscQuery.data?.sections.topQueries.status === "unavailable" ? (
                            <TableRow>
                              <TableCell colSpan={3} className="text-sm text-muted-foreground">
                                {gscQuery.data.sections.topQueries.message}
                              </TableCell>
                            </TableRow>
                          ) : gscQuery.data?.topQueries?.length ? (
                            gscQuery.data.topQueries.map((row) => (
                              <TableRow key={row.query}>
                                <TableCell className="text-sm">{row.query || "(not set)"}</TableCell>
                                <TableCell className="text-right font-mono text-xs">
                                  {formatInt(row.clicks)}
                                </TableCell>
                                <TableCell className="text-right font-mono text-xs">
                                  {formatInt(row.impressions)}
                                </TableCell>
                              </TableRow>
                            ))
                          ) : (
                            <TableRow>
                              <TableCell colSpan={3} className="text-sm text-muted-foreground">
                                No query data found.
                              </TableCell>
                            </TableRow>
                          )}
                        </TableBody>
                      </Table>
                    </CardContent>
                  </Card>

                  <Card>
                    <CardHeader>
                      <CardTitle className="text-base">Top Pages</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <Table>
                        <TableHeader>
                          <TableRow>
                            <TableHead>Page</TableHead>
                            <TableHead className="w-[120px] text-right">Clicks</TableHead>
                            <TableHead className="w-[140px] text-right">Impressions</TableHead>
                          </TableRow>
                        </TableHeader>
                        <TableBody>
                          {gscQuery.data?.sections.topPages.status === "unavailable" ? (
                            <TableRow>
                              <TableCell colSpan={3} className="text-sm text-muted-foreground">
                                {gscQuery.data.sections.topPages.message}
                              </TableCell>
                            </TableRow>
                          ) : gscQuery.data?.topPages?.length ? (
                            gscQuery.data.topPages.map((row) => (
                              <TableRow key={row.page}>
                                <TableCell className="font-mono text-xs">
                                  {row.page || "(not set)"}
                                </TableCell>
                                <TableCell className="text-right font-mono text-xs">
                                  {formatInt(row.clicks)}
                                </TableCell>
                                <TableCell className="text-right font-mono text-xs">
                                  {formatInt(row.impressions)}
                                </TableCell>
                              </TableRow>
                            ))
                          ) : (
                            <TableRow>
                              <TableCell colSpan={3} className="text-sm text-muted-foreground">
                                No page data found.
                              </TableCell>
                            </TableRow>
                          )}
                        </TableBody>
                      </Table>
                    </CardContent>
                  </Card>
                </div>
              </>
            )}
          </TabsContent>

          <TabsContent value="contacts" className="mt-6 space-y-6">
            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
              <Card>
                <CardHeader>
                  <CardTitle className="text-sm text-muted-foreground">Captured leads</CardTitle>
                </CardHeader>
                <CardContent className="text-3xl font-bold">
                  {formatInt(pipelineTotals.leads)}
                </CardContent>
              </Card>
              <Card>
                <CardHeader>
                  <CardTitle className="text-sm text-muted-foreground">Booked</CardTitle>
                </CardHeader>
                <CardContent className="text-3xl font-bold">
                  {formatInt(pipelineTotals.booked)}
                </CardContent>
              </Card>
              <Card>
                <CardHeader>
                  <CardTitle className="text-sm text-muted-foreground">Lead to booking</CardTitle>
                </CardHeader>
                <CardContent className="text-3xl font-bold">
                  {formatPercent(pipelineBookingRate)}
                </CardContent>
              </Card>
              <Card>
                <CardHeader>
                  <CardTitle className="text-sm text-muted-foreground">Lead to arrival</CardTitle>
                </CardHeader>
                <CardContent className="text-3xl font-bold">
                  {formatPercent(pipelineArrivalRate)}
                </CardContent>
              </Card>
            </div>

            <Card>
              <CardHeader>
                <CardTitle className="text-base">Source to New Patient Results</CardTitle>
              </CardHeader>
              <CardContent>
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Source</TableHead>
                      <TableHead className="text-right">Leads</TableHead>
                      <TableHead className="text-right">Booked</TableHead>
                      <TableHead className="text-right">Arrived</TableHead>
                      <TableHead className="text-right">Booking rate</TableHead>
                      <TableHead className="text-right">Arrival rate</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {sourceSummary.length ? (
                      sourceSummary.map((source) => (
                        <TableRow key={source.source}>
                          <TableCell className="font-medium">{source.source}</TableCell>
                          <TableCell className="text-right font-mono text-xs">
                            {formatInt(source.leads)}
                          </TableCell>
                          <TableCell className="text-right font-mono text-xs">
                            {formatInt(source.booked)}
                          </TableCell>
                          <TableCell className="text-right font-mono text-xs">
                            {formatInt(source.arrived)}
                          </TableCell>
                          <TableCell className="text-right font-mono text-xs">
                            {formatPercent(source.bookingRate)}
                          </TableCell>
                          <TableCell className="text-right font-mono text-xs">
                            {formatPercent(source.arrivalRate)}
                          </TableCell>
                        </TableRow>
                      ))
                    ) : (
                      <TableRow>
                        <TableCell colSpan={6} className="text-sm text-muted-foreground">
                          Source results will appear after leads are captured.
                        </TableCell>
                      </TableRow>
                    )}
                  </TableBody>
                </Table>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="text-base">Website Leads</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
                  <div className="grid flex-1 gap-3 sm:grid-cols-3">
                    <div className="space-y-1.5">
                      <Label htmlFor="contacts-search" className="text-xs">
                        Search
                      </Label>
                      <Input
                        id="contacts-search"
                        value={contactsSearch}
                        onChange={(event) => {
                          setContactsSearch(event.target.value);
                          setContactsPage(0);
                        }}
                        placeholder="Name, service, campaign..."
                      />
                    </div>

                    <div className="space-y-1.5">
                      <Label htmlFor="contacts-status" className="text-xs">
                        Patient stage
                      </Label>
                      <Select
                        value={contactsStatus}
                        onValueChange={(value) => {
                          setContactsStatus(value as "all" | LeadStatus);
                          setContactsPage(0);
                        }}
                      >
                        <SelectTrigger id="contacts-status">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="all">All stages</SelectItem>
                          {leadStatusOptions.map((option) => (
                            <SelectItem key={option.value} value={option.value}>
                              {option.label}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>

                    <div className="space-y-1.5">
                      <Label htmlFor="contacts-source" className="text-xs">
                        Source
                      </Label>
                      <Select
                        value={contactsSource}
                        onValueChange={(value) => {
                          setContactsSource(value);
                          setContactsPage(0);
                        }}
                      >
                        <SelectTrigger id="contacts-source">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="all">All sources</SelectItem>
                          {sourceSummary.map((source) => (
                            <SelectItem key={source.source} value={source.source}>
                              {source.source}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                  </div>

                  <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-end">
                    <div className="text-xs text-muted-foreground">
                      {contactsQuery.isLoading ? (
                        "Loading…"
                      ) : contactsTotal ? (
                        <>
                          Showing{" "}
                          <span className="font-mono">
                            {contactsStart}-{contactsEnd}
                          </span>{" "}
                          of <span className="font-mono">{contactsTotal}</span>
                        </>
                      ) : (
                        "No contacts"
                      )}
                    </div>
                    <div className="flex gap-2">
                      <Button
                        variant="outline"
                        onClick={() => setContactsPage((p) => Math.max(0, p - 1))}
                        disabled={!canPrevContacts || contactsQuery.isFetching}
                      >
                        Prev
                      </Button>
                      <Button
                        variant="outline"
                        onClick={() => setContactsPage((p) => p + 1)}
                        disabled={!canNextContacts || contactsQuery.isFetching}
                      >
                        Next
                      </Button>
                    </div>
                  </div>
                </div>

                {contactsQuery.isLoading ? (
                  <div className="space-y-4">
                    <Skeleton className="h-24 w-full" />
                    <Skeleton className="h-24 w-full" />
                  </div>
                ) : contactsQuery.isError ? (
                  <QueryErrorCard error={contactsQuery.error} />
                ) : (
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead className="w-[190px]">Received</TableHead>
                        <TableHead className="w-[120px]">Type</TableHead>
                        <TableHead className="w-[200px]">Name</TableHead>
                        <TableHead className="w-[220px]">Email</TableHead>
                        <TableHead className="w-[160px]">Phone</TableHead>
                        <TableHead className="w-[180px]">Service</TableHead>
                        <TableHead className="w-[220px]">Preferred Time</TableHead>
                        <TableHead className="w-[220px]">Source</TableHead>
                        <TableHead className="w-[340px]">Patient Lifecycle</TableHead>
                        <TableHead className="w-[160px]">Notification</TableHead>
                        <TableHead>Message</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {contactsItems.length ? (
                        contactsItems.map((row) => (
                          <TableRow key={`${row.id}:${row.updatedAt}`}>
                            <TableCell className="font-mono text-xs">
                              {formatDateTime(row.createdAt)}
                            </TableCell>
                            <TableCell>
                              <span className="inline-flex items-center rounded-lg bg-gray-100 px-2.5 py-1 text-xs font-semibold uppercase tracking-wide text-gray-700">
                                {row.requestType || "contact"}
                              </span>
                            </TableCell>
                            <TableCell className="text-sm">
                              {row.firstName} {row.lastName}
                            </TableCell>
                            <TableCell className="text-sm">
                              <a
                                href={`mailto:${row.email}`}
                                className="text-primary hover:underline"
                              >
                                {row.email}
                              </a>
                            </TableCell>
                            <TableCell className="font-mono text-xs">
                              {row.phone || "-"}
                            </TableCell>
                            <TableCell className="text-sm">
                              {row.service || "-"}
                            </TableCell>
                            <TableCell className="text-sm">
                              {row.preferredDate || row.preferredTime
                                ? `${row.preferredDate || "Date TBD"}${row.preferredTime ? ` • ${row.preferredTime}` : ""}`
                                : "-"}
                            </TableCell>
                            <TableCell className="text-sm">
                              <div className="space-y-1">
                                <div className="font-medium text-gray-800">
                                  {row.leadSource}
                                </div>
                                <div className="text-xs text-muted-foreground">
                                  {[row.utmMedium, row.utmCampaign, row.ctaSource]
                                    .filter(Boolean)
                                    .join(" • ") || row.landingPage || "-"}
                                </div>
                              </div>
                            </TableCell>
                            <TableCell className="align-top">
                              <div className="mb-3 inline-flex rounded-lg bg-secondary/20 px-2.5 py-1 text-xs font-semibold text-accent-foreground">
                                {statusLabel(row.leadStatus)}
                              </div>
                              <LeadLifecycleEditor
                                row={row}
                                saving={
                                  updateContactMutation.isPending &&
                                  updateContactMutation.variables?.id === row.id
                                }
                                onSave={async (input) => {
                                  await updateContactMutation.mutateAsync({ id: row.id, input });
                                }}
                              />
                            </TableCell>
                            <TableCell className="text-sm">
                              <span
                                className={`inline-flex items-center rounded-lg px-2.5 py-1 text-xs font-semibold ${
                                  row.formspreeStatus === "delivered"
                                    ? "bg-sky-100 text-sky-800"
                                    : "bg-blue-100 text-blue-800"
                                }`}
                              >
                                {row.formspreeStatus || "pending"}
                              </span>
                            </TableCell>
                            <TableCell className="text-sm text-muted-foreground whitespace-pre-wrap">
                              {row.message || "-"}
                            </TableCell>
                          </TableRow>
                        ))
                      ) : (
                        <TableRow>
                          <TableCell colSpan={11} className="text-sm text-muted-foreground">
                            No contacts found.
                          </TableCell>
                        </TableRow>
                      )}
                    </TableBody>
                  </Table>
                )}
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}
