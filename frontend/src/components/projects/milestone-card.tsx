import {
  CheckCircle2,
  CircleDollarSign,
  Clock3,
} from "lucide-react";

import type {
  Milestone,
} from "@/types/milestone";

interface MilestoneCardProps {
  milestone: Milestone;
  children?: React.ReactNode;
}

function statusIcon(
  status: Milestone["status"],
) {
  if (status === "RELEASED") {
    return (
      <CheckCircle2 className="h-5 w-5" />
    );
  }

  if (
    status === "FUNDED" ||
    status === "APPROVED"
  ) {
    return (
      <CircleDollarSign className="h-5 w-5" />
    );
  }

  return (
    <Clock3 className="h-5 w-5" />
  );
}

export function MilestoneCard({
  milestone,
  children,
}: MilestoneCardProps) {
  return (
    <article className="rounded-xl border bg-white p-5 shadow-sm">
      <div className="flex gap-4">
        <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-zinc-100">
          {statusIcon(
            milestone.status,
          )}
        </div>

        <div className="min-w-0 flex-1">
          <div className="flex flex-wrap items-start justify-between gap-3">
            <div>
              <p className="text-xs text-zinc-400">
                Milestone{" "}
                {milestone.order}
              </p>

              <h3 className="font-semibold">
                {milestone.title}
              </h3>
            </div>

            <span className="rounded-full bg-zinc-100 px-3 py-1 text-xs font-medium">
              {milestone.status.replaceAll(
                "_",
                " ",
              )}
            </span>
          </div>

          <p className="mt-2 text-sm leading-6 text-zinc-500">
            {milestone.description}
          </p>

          <div className="mt-4 flex flex-wrap gap-4 text-sm">
            <span className="font-semibold">
              {milestone.currency}{" "}
              {milestone.amount.toLocaleString()}
            </span>

            {milestone.dueDate && (
              <span className="text-zinc-500">
                Due{" "}
                {new Date(
                  milestone.dueDate,
                ).toLocaleDateString()}
              </span>
            )}
          </div>

          {children && (
            <div className="mt-5 border-t pt-4">
              {children}
            </div>
          )}
        </div>
      </div>
    </article>
  );
}