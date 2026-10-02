import {
  ArrowUpRight,
  Clock3,
  FileText,
} from "lucide-react";

import {
  Link,
} from "react-router-dom";

import {
  useMyProposals,
} from "@/hooks/use-proposals";

import {
  DashboardHeader,
} from "@/components/dashboard/dashboard-header";

import {
  StatusBadge,
} from "@/components/dashboard/status-badge";

import {
  EmptyState,
} from "@/components/dashboard/empty-state";

export default function FreelancerProposalsPage() {
  const {
    data: proposals = [],
    isLoading,
  } = useMyProposals();

  return (
    <div className="p-4 sm:p-6 lg:p-8">
      <DashboardHeader
        title="My Proposals"
        description="Track the proposals you've submitted."
      />

      {isLoading ? (
        <div className="space-y-3">
          {[1, 2, 3].map(
            (item) => (
              <div
                key={item}
                className="h-28 animate-pulse rounded-xl bg-zinc-100"
              />
            ),
          )}
        </div>
      ) : proposals.length === 0 ? (
        <div className="rounded-xl border bg-white">
          <EmptyState
            icon={FileText}
            title="No proposals yet"
            description="Find a project that matches your skills and submit your first proposal."
          />
        </div>
      ) : (
        <div className="space-y-3">
          {proposals.map(
            (proposal) => {
              const job =
                typeof proposal.job ===
                "string"
                  ? null
                  : proposal.job;

              return (
                <Link
                  key={proposal._id}
                  to={`/freelancer/proposals/${proposal._id}`}
                  className="block rounded-xl border bg-white p-5 shadow-sm transition hover:border-zinc-400"
                >
                  <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                    <div>
                      <div className="flex flex-wrap items-center gap-3">
                        <h3 className="font-semibold">
                          {job?.title ??
                            "Job"}
                        </h3>

                        <StatusBadge
                          status={
                            proposal.status
                          }
                        />
                      </div>

                      <div className="mt-2 flex flex-wrap gap-4 text-sm text-zinc-500">
                        <span>
                          Bid: ₦
                          {proposal.bidAmount.toLocaleString()}
                        </span>

                        <span className="flex items-center gap-1">
                          <Clock3 className="h-3.5 w-3.5" />
                          {
                            proposal.estimatedDuration
                          }{" "}
                          days
                        </span>
                      </div>
                    </div>

                    <ArrowUpRight className="h-4 w-4 text-zinc-400" />
                  </div>
                </Link>
              );
            },
          )}
        </div>
      )}
    </div>
  );
}