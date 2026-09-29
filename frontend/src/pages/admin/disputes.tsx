import { useState } from "react";
import { Link } from "react-router-dom";
import { Loader2 } from "lucide-react";
import { toast } from "sonner";

import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { DashboardHeader } from "@/components/dashboard/dashboard-header";
import { StatusBadge } from "@/components/dashboard/status-badge";

import { useAdminDisputes, useResolveDispute } from "@/hooks/use-disputes";
import { DISPUTE_REASONS } from "@/types/dispute";

import type { Dispute, DisputeDecision } from "@/types/dispute";
import { getErrorMessage } from "@/lib/errors";

const OPEN_STATUSES = ["OPEN", "UNDER_REVIEW", "AWAITING_RESPONSE"];

const DECISIONS: { value: DisputeDecision; label: string }[] = [
  { value: "RESOLVED_CLIENT", label: "Refund the client" },
  { value: "RESOLVED_FREELANCER", label: "Pay the freelancer" },
  { value: "PARTIAL_RESOLUTION", label: "Partial resolution" },
];

function reasonLabel(reason: string) {
  return DISPUTE_REASONS.find((item) => item.value === reason)?.label ?? reason;
}

function partyName(party: Dispute["openedBy"]) {
  return typeof party === "string" ? "—" : party.name;
}

function ResolveForm({ dispute }: { dispute: Dispute }) {
  const resolve = useResolveDispute();
  const [decision, setDecision] = useState<DisputeDecision>("RESOLVED_CLIENT");
  const [resolution, setResolution] = useState("");

  async function handleSubmit() {
    if (!resolution.trim()) {
      toast.error("Please explain your decision");
      return;
    }

    const confirmed = window.confirm(
      "Resolve this dispute? Funds will be moved according to your decision.",
    );

    if (!confirmed) return;

    try {
      await resolve.mutateAsync({
        disputeId: dispute._id,
        decision,
        resolution: resolution.trim(),
      });
      toast.success("Dispute resolved");
    } catch (error) {
      toast.error(
        getErrorMessage(error, "Unable to resolve dispute"),
      );
    }
  }

  return (
    <div className="mt-4 space-y-3 border-t pt-4">
      <select
        className="h-9 w-full rounded-lg border border-input bg-transparent px-2.5 text-sm"
        value={decision}
        onChange={(event) => setDecision(event.target.value as DisputeDecision)}
      >
        {DECISIONS.map((item) => (
          <option key={item.value} value={item.value}>
            {item.label}
          </option>
        ))}
      </select>

      <Textarea
        placeholder="Explain the decision (shown to both parties)"
        value={resolution}
        onChange={(event) => setResolution(event.target.value)}
      />

      <Button size="sm" onClick={handleSubmit} disabled={resolve.isPending}>
        {resolve.isPending && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
        Resolve dispute
      </Button>
    </div>
  );
}

export default function AdminDisputesPage() {
  const [filter, setFilter] = useState<"open" | "all">("open");

  const { data: disputes = [], isLoading, isError } = useAdminDisputes();

  const visible = disputes.filter(
    (dispute) => filter === "all" || OPEN_STATUSES.includes(dispute.status),
  );

  return (
    <div className="p-4 sm:p-6 lg:p-8">
      <DashboardHeader
        title="Disputes"
        description="Review and resolve disputes raised on milestones."
      />

      <div className="mb-4 flex gap-2">
        {(["open", "all"] as const).map((value) => (
          <Button
            key={value}
            size="sm"
            variant={filter === value ? "default" : "outline"}
            onClick={() => setFilter(value)}
          >
            {value === "open" ? "Needs review" : "All disputes"}
          </Button>
        ))}
      </div>

      {isLoading ? (
        <div className="h-32 animate-pulse rounded-xl bg-zinc-100" />
      ) : isError ? (
        <div className="rounded-xl border p-10 text-center text-sm text-red-600">
          Unable to load disputes.
        </div>
      ) : visible.length === 0 ? (
        <div className="rounded-xl border bg-white p-10 text-center text-sm text-zinc-500">
          No disputes to show.
        </div>
      ) : (
        <div className="space-y-4">
          {visible.map((dispute) => {
            const project =
              typeof dispute.project === "string" ? null : dispute.project;
            const milestone =
              typeof dispute.milestone === "string" ? null : dispute.milestone;

            return (
              <div
                key={dispute._id}
                className="rounded-xl border bg-white p-5 shadow-sm"
              >
                <div className="flex flex-wrap items-start justify-between gap-3">
                  <div>
                    <h3 className="font-semibold">
                      {milestone?.title ?? "Milestone"}
                    </h3>

                    {project && (
                      <Link
                        to={`/projects/${project._id}`}
                        className="text-sm text-zinc-500 hover:underline"
                      >
                        {project.title}
                      </Link>
                    )}
                  </div>

                  <StatusBadge status={dispute.status} />
                </div>

                <p className="mt-3 text-sm">
                  <span className="font-medium">
                    {reasonLabel(dispute.reason)}
                  </span>{" "}
                  · opened by {partyName(dispute.openedBy)} against{" "}
                  {partyName(dispute.against)}
                  {milestone &&
                    ` · ${milestone.currency} ${milestone.amount.toLocaleString()}`}
                </p>

                <p className="mt-2 whitespace-pre-wrap text-sm text-zinc-600">
                  {dispute.description}
                </p>

                {dispute.resolution && (
                  <p className="mt-3 rounded-lg bg-zinc-50 p-3 text-sm text-zinc-600">
                    <span className="font-medium">Resolution:</span>{" "}
                    {dispute.resolution}
                  </p>
                )}

                {OPEN_STATUSES.includes(dispute.status) && (
                  <ResolveForm dispute={dispute} />
                )}
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
