"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { leadStatusOptions } from "@/components/admin/lead-meta";
import type {
  AdminContactItem,
  UpdateAdminContactInput,
} from "@/app/api/admin/contacts/types";
import type { LeadStatus } from "@/server/schema";

const formatDateTime = (value: string) => {
  const date = new Date(value);
  return Number.isNaN(date.getTime()) ? value : date.toLocaleString();
};

export function LeadLifecycleEditor({
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
