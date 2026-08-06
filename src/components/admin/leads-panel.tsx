"use client";

import { useMemo, useRef, useState } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Skeleton } from "@/components/ui/skeleton";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { patchJson, postJson } from "@/components/admin/admin-fetch";
import { LeadDetailDrawer } from "@/components/admin/lead-detail-drawer";
import {
  NewMarker,
  SourceBadge,
  StatusPill,
  TestBadge,
} from "@/components/admin/lead-badges";
import {
  formatAbsoluteDateTime,
  formatReceivedRelative,
  fullName,
  isFreshNewLead,
  leadSourceOptions,
  leadStatusOptions,
  requestTypeOptions,
} from "@/components/admin/lead-meta";
import type {
  AdminContactItem,
  AdminContactsResponse,
  UpdateAdminContactInput,
  UpdateAdminContactResponse,
} from "@/app/api/admin/contacts/types";
import type { LeadStatus } from "@/server/schema";
import { cn } from "@/lib/utils";

const PAGE_SIZE = 25;

type StatusFilter = "all" | LeadStatus;
type TypeFilter = "all" | "contact" | "appointment";

function FilterChip({
  pressed,
  onClick,
  children,
}: {
  pressed: boolean;
  onClick: () => void;
  children: React.ReactNode;
}) {
  return (
    <button
      type="button"
      aria-pressed={pressed}
      onClick={onClick}
      className={cn(
        "inline-flex items-center rounded-full border px-3 py-1 text-xs font-medium transition-colors",
        "focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2",
        pressed
          ? "border-[#0369A1] bg-[#E0F2FE] text-[#075985]"
          : "border-border bg-white text-gray-700 hover:bg-gray-50",
      )}
    >
      {children}
    </button>
  );
}

function ChipGroup({
  label,
  children,
}: {
  label: string;
  children: React.ReactNode;
}) {
  return (
    <div className="flex flex-wrap items-center gap-2">
      <span className="text-xs font-semibold uppercase tracking-wide text-gray-500">
        {label}
      </span>
      <div role="group" aria-label={label} className="flex flex-wrap gap-1.5">
        {children}
      </div>
    </div>
  );
}

// The four numbers the front desk actually acts on, in the order the lead
// moves through them. Deliberately not every status: "no-show" and "lost" are
// filters, not headlines.
const SUMMARY_STATUSES: Array<{ value: LeadStatus; label: string }> = [
  { value: "new", label: "New" },
  { value: "contacted", label: "Contacted" },
  { value: "booked", label: "Booked" },
  { value: "arrived", label: "Arrived" },
];

function SummaryTile({
  label,
  count,
  active,
  onClick,
}: {
  label: string;
  count: number;
  active: boolean;
  onClick: () => void;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      aria-pressed={active}
      className={cn(
        "rounded-lg border p-4 text-left transition-colors",
        "focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2",
        active
          ? "border-primary bg-[#E0F2FE]"
          : "border-border bg-white hover:bg-[#F0F9FF]",
      )}
    >
      <div className="text-2xl font-bold tabular-nums text-foreground">{count}</div>
      <div className="mt-1 text-xs font-semibold uppercase tracking-wide text-muted-foreground">
        {label}
      </div>
    </button>
  );
}

export function LeadsPanel() {
  const queryClient = useQueryClient();
  const [search, setSearch] = useState("");
  const [status, setStatus] = useState<StatusFilter>("all");
  const [source, setSource] = useState("all");
  const [type, setType] = useState<TypeFilter>("all");
  const [showTest, setShowTest] = useState(false);
  const [page, setPage] = useState(0);
  const [selected, setSelected] = useState<AdminContactItem | null>(null);
  const [drawerOpen, setDrawerOpen] = useState(false);
  const triggerRef = useRef<HTMLElement | null>(null);

  const request = useMemo(() => {
    const q = search.trim();
    return {
      limit: PAGE_SIZE,
      offset: page * PAGE_SIZE,
      ...(q ? { q } : {}),
      ...(status !== "all" ? { status } : {}),
      ...(source !== "all" ? { source } : {}),
    };
  }, [page, search, source, status]);

  const contactsQuery = useQuery({
    queryKey: ["admin-contacts", request],
    queryFn: () => postJson<AdminContactsResponse>("/api/admin/contacts", request),
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
        predicate: (query) => query.queryKey[0] === "admin-contacts",
      });
    },
    onError: (error) => {
      if ((error as { status?: number })?.status === 409) {
        void queryClient.invalidateQueries({ queryKey: ["admin-contacts"] });
      }
    },
  });

  const total = contactsQuery.data?.total ?? 0;
  const items = contactsQuery.data?.items ?? [];
  const sourceSummary = contactsQuery.data?.sourceSummary ?? [];
  const countsByStatus = contactsQuery.data?.countsByStatus ?? {};
  const newCount = countsByStatus.new ?? 0;

  // Operational view hides test leads by default; the Type chip filters
  // client-side because the list endpoint has no requestType filter yet.
  const visibleItems = items.filter(
    (row) =>
      (showTest || !row.isTest) && (type === "all" || row.requestType === type),
  );

  const hasActiveFilters =
    search.trim() !== "" || status !== "all" || source !== "all" || type !== "all";
  const clearFilters = () => {
    setSearch("");
    setStatus("all");
    setSource("all");
    setType("all");
    setPage(0);
  };

  // Pagination is server-side, but the test-lead and type filters run on the
  // client, so the page window can be wider than the rows actually rendered.
  // Say so rather than printing a count that disagrees with the table.
  const hiddenOnPage = items.length - visibleItems.length;
  const rangeStart = total > 0 ? page * PAGE_SIZE + 1 : 0;
  const rangeEnd =
    total > 0 ? Math.min(rangeStart + items.length - 1, total) : 0;
  const canPrev = page > 0;
  const canNext = (page + 1) * PAGE_SIZE < total;

  // Two things the drawer needs from us, both about focus on close:
  //
  // 1. `selected` outlives `drawerOpen`. Clearing the row on close unmounts
  //    SheetContent synchronously, which cancels Radix's exit animation. The
  //    stale row is never visible while closed, and the next open replaces it.
  // 2. Radix preventDefaults the native focus restore and focuses its own
  //    triggerRef. We open programmatically, so there is no SheetTrigger and
  //    that ref is null, which drops focus onto <body>. So remember the row
  //    that opened the drawer and restore focus to it ourselves.
  const openLead = (row: AdminContactItem, trigger: HTMLElement) => {
    triggerRef.current = trigger;
    setSelected(row);
    setDrawerOpen(true);
  };
  const restoreTriggerFocus = (event: Event) => {
    event.preventDefault();
    triggerRef.current?.focus();
  };
  const handleSave = async (id: string, input: UpdateAdminContactInput) => {
    const response = await updateContactMutation.mutateAsync({ id, input });
    setSelected(response.item);
  };

  const renderBadges = (row: AdminContactItem) => (
    <span className="inline-flex flex-wrap items-center gap-1.5">
      <SourceBadge source={row.source} />
      {row.isTest ? <TestBadge /> : null}
    </span>
  );

  const renderEmptyState = () => {
    if (items.length === 0 && !hasActiveFilters) {
      return (
        <p className="py-10 text-center text-sm text-muted-foreground">
          No leads yet. New leads appear here as they come in.
        </p>
      );
    }
    return (
      <div className="space-y-3 py-10 text-center">
        <p className="text-sm text-muted-foreground">No leads match these filters.</p>
        <Button variant="outline" size="sm" onClick={clearFilters}>
          Clear filters
        </Button>
      </div>
    );
  };

  return (
    <div className="space-y-4">
      <div
        className="grid grid-cols-2 gap-3 sm:grid-cols-4"
        data-testid="lead-summary"
      >
        {SUMMARY_STATUSES.map((entry) => (
          <SummaryTile
            key={entry.value}
            label={entry.label}
            count={countsByStatus[entry.value] ?? 0}
            active={status === entry.value}
            onClick={() => {
              setStatus((current) => (current === entry.value ? "all" : entry.value));
              setPage(0);
            }}
          />
        ))}
      </div>

      <div className="space-y-4 rounded-lg border border-border bg-white p-4">
        <div className="flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
          <div className="flex flex-wrap items-center gap-3">
            <FilterChip
              pressed={status === "new"}
              onClick={() => {
                setStatus("new");
                setPage(0);
              }}
            >
              {newCount} new
            </FilterChip>
            <div className="space-y-1.5">
              <Label htmlFor="leads-search" className="text-xs">
                Search leads
              </Label>
              <Input
                id="leads-search"
                value={search}
                onChange={(event) => {
                  setSearch(event.target.value);
                  setPage(0);
                }}
                placeholder="Name, service, campaign..."
                className="w-full sm:w-[240px]"
              />
            </div>
          </div>
          <FilterChip pressed={showTest} onClick={() => setShowTest((v) => !v)}>
            Show test leads
          </FilterChip>
        </div>

        <div className="space-y-2">
          <ChipGroup label="Status">
            <FilterChip
              pressed={status === "all"}
              onClick={() => {
                setStatus("all");
                setPage(0);
              }}
            >
              All
            </FilterChip>
            {leadStatusOptions.map((option) => (
              <FilterChip
                key={option.value}
                pressed={status === option.value}
                onClick={() => {
                  setStatus(option.value);
                  setPage(0);
                }}
              >
                {option.label}
              </FilterChip>
            ))}
          </ChipGroup>
          <ChipGroup label="Source">
            <FilterChip
              pressed={source === "all"}
              onClick={() => {
                setSource("all");
                setPage(0);
              }}
            >
              All
            </FilterChip>
            {leadSourceOptions.map((option) => (
              <FilterChip
                key={option.value}
                pressed={source === option.value}
                onClick={() => {
                  setSource(option.value);
                  setPage(0);
                }}
              >
                {option.label}
              </FilterChip>
            ))}
          </ChipGroup>
          <ChipGroup label="Type">
            <FilterChip
              pressed={type === "all"}
              onClick={() => setType("all")}
            >
              All
            </FilterChip>
            {requestTypeOptions.map((option) => (
              <FilterChip
                key={option.value}
                pressed={type === option.value}
                onClick={() => setType(option.value)}
              >
                {option.label}
              </FilterChip>
            ))}
          </ChipGroup>
        </div>
      </div>

      <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
        <div className="text-xs text-muted-foreground" aria-live="polite">
          {contactsQuery.isLoading ? (
            "Loading…"
          ) : total ? (
            <>
              Showing{" "}
              <span className="font-mono">
                {rangeStart}–{rangeEnd}
              </span>{" "}
              of <span className="font-mono">{total}</span>
              {hiddenOnPage > 0 ? (
                <span className="ml-1 text-muted-foreground">
                  ({hiddenOnPage} hidden on this page)
                </span>
              ) : null}
            </>
          ) : (
            "No leads"
          )}
        </div>
        <div className="flex gap-2">
          <Button
            variant="outline"
            onClick={() => setPage((p) => Math.max(0, p - 1))}
            disabled={!canPrev || contactsQuery.isFetching}
          >
            Prev
          </Button>
          <Button
            variant="outline"
            onClick={() => setPage((p) => p + 1)}
            disabled={!canNext || contactsQuery.isFetching}
          >
            Next
          </Button>
        </div>
      </div>

      {contactsQuery.isLoading ? (
        <div className="space-y-4">
          <Skeleton className="h-24 w-full" />
          <Skeleton className="h-24 w-full" />
        </div>
      ) : contactsQuery.isError ? (
        <p role="alert" className="text-sm text-muted-foreground">
          {contactsQuery.error instanceof Error
            ? contactsQuery.error.message
            : "Failed to load leads."}
        </p>
      ) : visibleItems.length === 0 ? (
        renderEmptyState()
      ) : (
        <>
          <div className="hidden sm:block" data-testid="leads-table">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead scope="col" className="w-[170px]">
                    Received
                  </TableHead>
                  <TableHead scope="col" className="w-[220px]">
                    Name
                  </TableHead>
                  <TableHead scope="col" className="w-[150px]">
                    Source
                  </TableHead>
                  <TableHead scope="col">Service</TableHead>
                  <TableHead scope="col" className="w-[130px]">
                    Status
                  </TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {visibleItems.map((row) => (
                  <TableRow
                    key={`${row.id}:${row.updatedAt}`}
                    data-testid="lead-row"
                    className={cn(
                      isFreshNewLead(row) && "border-l-2 border-l-[#38BDF8]",
                    )}
                  >
                    <TableCell>
                      <div className="flex items-center gap-2">
                        <time
                          dateTime={row.createdAt}
                          title={formatAbsoluteDateTime(row.createdAt)}
                          aria-label={formatAbsoluteDateTime(row.createdAt)}
                          className="text-sm"
                        >
                          {formatReceivedRelative(row.createdAt)}
                        </time>
                        {isFreshNewLead(row) ? <NewMarker /> : null}
                      </div>
                    </TableCell>
                    <TableCell>
                      <button
                        type="button"
                        onClick={(event) => openLead(row, event.currentTarget)}
                        className="text-left text-sm font-medium text-[#0369A1] hover:underline focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2"
                      >
                        {fullName(row)}
                      </button>
                    </TableCell>
                    <TableCell>{renderBadges(row)}</TableCell>
                    <TableCell>
                      <span className="block max-w-[260px] truncate text-sm">
                        {row.service || "-"}
                      </span>
                    </TableCell>
                    <TableCell>
                      <StatusPill status={row.leadStatus} />
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>

          <div className="space-y-3 sm:hidden" data-testid="leads-cards">
            {visibleItems.map((row) => (
              <button
                key={`${row.id}:${row.updatedAt}`}
                type="button"
                data-testid="lead-card"
                onClick={(event) => openLead(row, event.currentTarget)}
                className={cn(
                  "block w-full space-y-2 rounded-lg border border-border bg-white p-4 text-left",
                  "focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2",
                  isFreshNewLead(row) && "border-l-2 border-l-[#38BDF8]",
                )}
              >
                <span className="flex items-center gap-2 text-sm text-gray-700">
                  <span className="sr-only">Received</span>
                  <time
                    dateTime={row.createdAt}
                    title={formatAbsoluteDateTime(row.createdAt)}
                    aria-label={formatAbsoluteDateTime(row.createdAt)}
                  >
                    {formatReceivedRelative(row.createdAt)}
                  </time>
                  {isFreshNewLead(row) ? <NewMarker /> : null}
                </span>
                <span className="block text-base font-medium text-[#0369A1]">
                  <span className="sr-only">Name</span>
                  {fullName(row)}
                </span>
                <span className="block">
                  <span className="sr-only">Source</span>
                  {renderBadges(row)}
                </span>
                <span className="block truncate text-sm text-gray-700">
                  <span className="sr-only">Service</span>
                  {row.service || "-"}
                </span>
                <StatusPill status={row.leadStatus} className="flex w-full justify-center" />
              </button>
            ))}
          </div>
        </>
      )}

      <details className="rounded-lg border border-border bg-white p-4">
        <summary className="cursor-pointer text-xs font-semibold uppercase tracking-wide text-gray-500">
          Source performance
        </summary>
        <div className="mt-3 overflow-x-auto">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead scope="col">Source</TableHead>
                <TableHead scope="col" className="text-right">
                  Leads
                </TableHead>
                <TableHead scope="col" className="text-right">
                  Booked
                </TableHead>
                <TableHead scope="col" className="text-right">
                  Arrived
                </TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {sourceSummary.length ? (
                sourceSummary.map((entry) => (
                  <TableRow key={entry.source}>
                    <TableCell className="font-medium">{entry.source}</TableCell>
                    <TableCell className="text-right font-mono text-xs">
                      {entry.leads}
                    </TableCell>
                    <TableCell className="text-right font-mono text-xs">
                      {entry.booked}
                    </TableCell>
                    <TableCell className="text-right font-mono text-xs">
                      {entry.arrived}
                    </TableCell>
                  </TableRow>
                ))
              ) : (
                <TableRow>
                  <TableCell colSpan={4} className="text-sm text-muted-foreground">
                    Source results will appear after leads are captured.
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </div>
      </details>

      <LeadDetailDrawer
        row={selected}
        open={drawerOpen}
        saving={updateContactMutation.isPending}
        onOpenChange={setDrawerOpen}
        onCloseAutoFocus={restoreTriggerFocus}
        onSave={handleSave}
      />
    </div>
  );
}
