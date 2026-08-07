"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
} from "@/components/ui/sheet";
import { LeadLifecycleEditor } from "@/components/admin/lead-lifecycle-editor";
import {
  NewMarker,
  SourceBadge,
  StatusPill,
  TestBadge,
} from "@/components/admin/lead-badges";
import {
  consentLabel,
  formatAbsoluteDateTime,
  formatReceivedRelative,
  formspreeStatusLabel,
  fullName,
  ingestionProvenance,
  isFreshNewLead,
  requestTypeLabel,
  sourceKindLabel,
  sourceLabel,
} from "@/components/admin/lead-meta";
import type {
  AdminContactItem,
  UpdateAdminContactInput,
} from "@/app/api/admin/contacts/types";

function CopyValueButton({ value, label }: { value: string; label: string }) {
  const [copied, setCopied] = useState(false);

  const copy = async () => {
    try {
      if (navigator.clipboard?.writeText) {
        await navigator.clipboard.writeText(value);
      } else {
        const helper = document.createElement("textarea");
        helper.value = value;
        helper.setAttribute("readonly", "");
        helper.style.position = "absolute";
        helper.style.left = "-9999px";
        document.body.appendChild(helper);
        helper.select();
        document.execCommand("copy");
        document.body.removeChild(helper);
      }
      setCopied(true);
      window.setTimeout(() => setCopied(false), 2000);
    } catch {
      setCopied(false);
    }
  };

  return (
    <span className="inline-flex items-center gap-2">
      <Button type="button" variant="outline" size="sm" onClick={copy} aria-label={label}>
        Copy
      </Button>
      <span aria-live="polite" className="text-xs font-medium text-[#0369A1]">
        {copied ? "Copied" : ""}
      </span>
    </span>
  );
}

// `always` keeps a row on screen when the value is empty. Use it for the few
// fields where "the form asked and they left it blank" is itself the answer --
// silently dropping those reads as though the question was never put.
function DetailRow({
  label,
  value,
  always = false,
}: {
  label: string;
  value: string | null;
  always?: boolean;
}) {
  if (!value && !always) return null;
  return (
    <div className="grid grid-cols-[128px_1fr] gap-2 text-sm">
      <dt className="text-muted-foreground">{label}</dt>
      <dd className="break-words">
        {value || <span className="text-muted-foreground">Not provided</span>}
      </dd>
    </div>
  );
}

function DrawerSection({
  title,
  children,
}: {
  title: string;
  children: React.ReactNode;
}) {
  return (
    <section className="space-y-3">
      <h3 className="text-xs font-semibold uppercase tracking-wide text-gray-500">
        {title}
      </h3>
      {children}
    </section>
  );
}

export function LeadDetailDrawer({
  row,
  open,
  saving,
  onOpenChange,
  onCloseAutoFocus,
  onSave,
}: {
  row: AdminContactItem | null;
  open: boolean;
  saving: boolean;
  onOpenChange: (open: boolean) => void;
  onCloseAutoFocus?: (event: Event) => void;
  onSave: (id: string, input: UpdateAdminContactInput) => Promise<void>;
}) {
  // The Sheet root stays mounted across open/close so Radix can run its exit
  // animation. The parent deliberately keeps `row` set while the drawer is
  // closed -- clearing it here would unmount the content mid-transition -- and
  // supplies onCloseAutoFocus to put focus back on the row that opened it.
  const content = row ? (
    <DrawerBody
      row={row}
      saving={saving}
      onSave={onSave}
      onCloseAutoFocus={onCloseAutoFocus}
    />
  ) : null;
  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      {content}
    </Sheet>
  );
}

function DrawerBody({
  row,
  saving,
  onSave,
  onCloseAutoFocus,
}: {
  row: AdminContactItem;
  saving: boolean;
  onSave: (id: string, input: UpdateAdminContactInput) => Promise<void>;
  onCloseAutoFocus?: (event: Event) => void;
}) {
  const name = fullName(row);
  const provenance = ingestionProvenance(row);
  const isPaidLead = row.source === "Google Ads";
  const clickId = row.gclid || row.gbraid || row.wbraid;
  const delivery = formspreeStatusLabel(row.formspreeStatus);

  return (
    <SheetContent
      side="right"
      className="w-full overflow-y-auto sm:w-[420px] sm:max-w-[420px]"
      onCloseAutoFocus={onCloseAutoFocus}
      // Radix aria-hides outside content but never emits aria-modal, and the
      // UI spec's accessibility gate requires it on the drawer.
      aria-modal="true"
    >
      <SheetHeader>
        <div className="flex flex-wrap items-center gap-2 pr-10">
          <SheetTitle className="text-xl font-bold">{name}</SheetTitle>
          {isFreshNewLead(row) ? <NewMarker /> : null}
          {row.isTest ? <TestBadge /> : null}
          <StatusPill status={row.leadStatus} />
        </div>
        <div className="flex flex-wrap items-center gap-2 pt-1">
          <SourceBadge source={row.source} />
          <span className="text-xs text-muted-foreground">
            {row.campaignName
              ? `${sourceKindLabel(row.source)} · ${row.campaignName}`
              : sourceKindLabel(row.source)}
          </span>
        </div>
        <SheetDescription>
          Received{" "}
          <time
            dateTime={row.createdAt}
            title={formatAbsoluteDateTime(row.createdAt)}
            aria-label={formatAbsoluteDateTime(row.createdAt)}
          >
            {formatReceivedRelative(row.createdAt)}
          </time>
        </SheetDescription>
      </SheetHeader>

      <div className="mt-6 space-y-8 pb-6">
        <DrawerSection title="Follow up">
          <div className="space-y-2">
            {row.phone ? (
              <div className="flex items-center gap-2">
                <Button asChild className="flex-1">
                  <a href={`tel:${row.phone}`}>Call {row.phone}</a>
                </Button>
                <CopyValueButton
                  value={row.phone}
                  label={`Copy phone number for ${name}`}
                />
              </div>
            ) : null}
            {row.email ? (
              <div className="flex items-center gap-2">
                <Button asChild variant="secondary" className="flex-1">
                  <a href={`mailto:${row.email}`}>Email {row.email}</a>
                </Button>
                <CopyValueButton
                  value={row.email}
                  label={`Copy email address for ${name}`}
                />
              </div>
            ) : null}
            {!row.phone && !row.email ? (
              <p className="text-sm text-muted-foreground">
                No contact details on file.
              </p>
            ) : null}
          </div>
        </DrawerSection>

        <DrawerSection title="Patient stage">
          <LeadLifecycleEditor
            row={row}
            saving={saving}
            onSave={(input) => onSave(row.id, input)}
          />
        </DrawerSection>

        <DrawerSection title="What they asked for">
          <dl className="space-y-2">
            <DetailRow label="Request" value={requestTypeLabel(row.requestType)} />
            <DetailRow label="Service" value={row.service} always />
            <DetailRow label="Preferred date" value={row.preferredDate} />
            <DetailRow label="Preferred time" value={row.preferredTime} />
          </dl>
          {row.message ? (
            <p className="whitespace-pre-wrap rounded-md bg-muted p-3 text-sm">
              {row.message}
            </p>
          ) : (
            <p className="rounded-md bg-muted p-3 text-sm text-muted-foreground">
              {isPaidLead
                ? "No message. The Google Ads lead form collects a name, email and phone number only, so a paid lead never carries a reason for reaching out."
                : "They did not leave a message."}
            </p>
          )}
        </DrawerSection>

        <DrawerSection title="Where they came from">
          <dl className="space-y-2">
            <DetailRow label="Source" value={sourceLabel(row.source)} />
            <DetailRow label="Campaign" value={row.campaignName} />
            <DetailRow label="Campaign ID" value={row.campaignId} />
            <DetailRow label="Google lead ID" value={row.googleAdsLeadId} />
            <DetailRow label="Click ID" value={clickId} />
            <DetailRow label="Landing page" value={row.landingPage} />
            <DetailRow label="Referrer" value={row.referrer} />
            <DetailRow label="Button clicked" value={row.ctaSource} />
            <DetailRow label="UTM source" value={row.utmSource} />
            <DetailRow label="UTM medium" value={row.utmMedium} />
            <DetailRow label="UTM campaign" value={row.utmCampaign} />
            <DetailRow label="UTM term" value={row.utmTerm} />
            <DetailRow label="UTM content" value={row.utmContent} />
            <DetailRow label="How it arrived" value={provenance} />
          </dl>
        </DrawerSection>

        <details className="rounded-md border border-border p-3">
          <summary className="cursor-pointer text-xs font-semibold uppercase tracking-wide text-gray-500">
            Record details
          </summary>
          <dl className="mt-3 space-y-2">
            <DetailRow label="Consent" value={consentLabel(row)} always />
            <DetailRow label="Consent version" value={row.consentVersion} />
            <DetailRow label="Notification" value={delivery} />
            <DetailRow label="Submission ID" value={row.submissionId} />
            <DetailRow label="Record ID" value={row.id} />
          </dl>
        </details>

        <DrawerSection title="History">
          <dl className="space-y-2">
            <DetailRow
              label="Received"
              value={formatAbsoluteDateTime(row.createdAt)}
            />
            <DetailRow
              label="Contacted"
              value={row.contactedAt ? formatAbsoluteDateTime(row.contactedAt) : null}
            />
            <DetailRow
              label="Booked"
              value={row.bookedAt ? formatAbsoluteDateTime(row.bookedAt) : null}
            />
            <DetailRow
              label="Arrived"
              value={row.arrivedAt ? formatAbsoluteDateTime(row.arrivedAt) : null}
            />
            <DetailRow
              label="Last updated"
              value={`${formatAbsoluteDateTime(row.updatedAt)}${row.updatedBy ? ` by ${row.updatedBy}` : ""}`}
            />
            {row.lostReason ? <DetailRow label="Lost reason" value={row.lostReason} /> : null}
          </dl>
        </DrawerSection>
      </div>
    </SheetContent>
  );
}
