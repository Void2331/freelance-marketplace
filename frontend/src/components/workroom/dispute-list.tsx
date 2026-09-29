import { Scale } from "lucide-react";

import { SectionCard } from "@/components/dashboard/section-card";
import { StatusBadge } from "@/components/dashboard/status-badge";

import { useProjectDisputes } from "@/hooks/use-disputes";
import { DISPUTE_REASONS } from "@/types/dispute";

interface DisputeListProps {
  projectId: string;
}

export function DisputeList({ projectId }: DisputeListProps) {
  const { data: disputes = [] } = useProjectDisputes(projectId);

  // Only render once there's something to show.
  if (disputes.length === 0) return null;

  return (
    <SectionCard
      title="Disputes"
      description="Issues raised on this project and their outcome"
    >
      <div className="space-y-4">
        {disputes.map((dispute) => {
          const milestone =
            typeof dispute.milestone === "string" ? null : dispute.milestone;

          const reason =
            DISPUTE_REASONS.find((item) => item.value === dispute.reason)
              ?.label ?? dispute.reason;

          return (
            <div key={dispute._id} className="rounded-lg border p-4">
              <div className="flex items-start justify-between gap-3">
                <div className="flex items-center gap-2">
                  <Scale className="h-4 w-4 text-zinc-400" />
                  <p className="text-sm font-medium">
                    {milestone?.title ?? "Milestone"} · {reason}
                  </p>
                </div>

                <StatusBadge status={dispute.status} />
              </div>

              <p className="mt-2 text-sm text-zinc-600">
                {dispute.description}
              </p>

              {dispute.resolution && (
                <p className="mt-3 rounded-lg bg-zinc-50 p-3 text-sm text-zinc-600">
                  <span className="font-medium">Resolution:</span>{" "}
                  {dispute.resolution}
                </p>
              )}
            </div>
          );
        })}
      </div>
    </SectionCard>
  );
}
