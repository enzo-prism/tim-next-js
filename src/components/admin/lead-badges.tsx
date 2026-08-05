import type { LeadStatus } from "@/server/schema";
import {
  sourceBadgeClasses,
  sourceLabel,
  statusLabel,
  statusPillClasses,
} from "@/components/admin/lead-meta";
import { cn } from "@/lib/utils";

export function StatusPill({
  status,
  className,
}: {
  status: LeadStatus;
  className?: string;
}) {
  return (
    <span
      data-testid="status-pill"
      className={cn(
        "inline-flex items-center rounded-lg px-2.5 py-1 text-xs font-semibold",
        statusPillClasses[status] ?? "bg-[#F1F5F9] text-[#475569]",
        className,
      )}
    >
      {statusLabel(status)}
    </span>
  );
}

export function SourceBadge({ source }: { source: string }) {
  return (
    <span
      data-testid="source-badge"
      className={cn(
        "inline-flex items-center rounded-lg px-2.5 py-1 text-[11px] font-semibold uppercase tracking-wide",
        sourceBadgeClasses[source] ?? "bg-gray-100 text-gray-700",
      )}
    >
      {sourceLabel(source)}
    </span>
  );
}

export function TestBadge() {
  return (
    <span
      data-testid="test-badge"
      className="inline-flex items-center rounded-lg border border-dashed border-[#0369A1] px-2.5 py-1 text-[11px] font-semibold uppercase tracking-wide text-[#0369A1]"
    >
      Test
    </span>
  );
}

export function NewMarker() {
  return (
    <span
      data-testid="new-marker"
      className="inline-flex items-center gap-1 text-[11px] font-semibold uppercase tracking-wide text-[#0369A1]"
    >
      <span aria-hidden="true" className="h-2 w-2 rounded-full bg-[#38BDF8]" />
      New
    </span>
  );
}
