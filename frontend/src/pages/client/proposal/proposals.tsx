import { Check, Eye, X } from "lucide-react";
import { Link, useNavigate } from "react-router-dom";
import { toast } from "sonner";

import { Button } from "@/components/ui/button";
import { DashboardHeader } from "@/components/dashboard/dashboard-header";
import { StatusBadge } from "@/components/dashboard/status-badge";
import {
  useAcceptProposal,
  useClientProposals,
  useRejectProposal,
} from "@/hooks/use-proposals";
import { getErrorMessage } from "@/lib/errors";

export default function ClientProposalsPage() {
  const navigate = useNavigate();

  const {
    data: proposals = [],
    isLoading,
    isError,
  } = useClientProposals();

  const acceptMutation = useAcceptProposal();
  const rejectMutation = useRejectProposal();

  async function handleAccept(proposalId: string) {
    const confirmed = window.confirm(
      "Accept this proposal? This will create a project, contract, milestone and payment record.",
    );

    if (!confirmed) return;

    try {
      const result = await acceptMutation.mutateAsync(proposalId);

      toast.success("Proposal accepted and project created.");

      navigate(`/projects/${result.projectId}`);
    } catch (error) {
      toast.error(
        getErrorMessage(error, "Unable to accept proposal"),
      );
    }
  }

  async function handleReject(proposalId: string) {
    const confirmed = window.confirm(
      "Are you sure you want to reject this proposal?",
    );

    if (!confirmed) return;

    try {
      await rejectMutation.mutateAsync(proposalId);

      toast.success("Proposal rejected.");
    } catch (error) {
      toast.error(
        getErrorMessage(error, "Unable to reject proposal"),
      );
    }
  }

  return (
    <div className="p-4 sm:p-6 lg:p-8">
      <DashboardHeader
        title="Proposals"
        description="Review proposals submitted by freelancers for your jobs."
      />

      {isLoading && (
        <div className="rounded-xl border bg-white p-8 text-center">
          <p className="text-sm text-zinc-500">
            Loading proposals...
          </p>
        </div>
      )}

      {isError && (
        <div className="rounded-xl border border-red-200 bg-red-50 p-8 text-center">
          <p className="text-sm text-red-600">
            Unable to load your proposals.
          </p>
        </div>
      )}

      {!isLoading && !isError && proposals.length === 0 && (
        <div className="rounded-xl border bg-white p-10 text-center">
          <h3 className="text-lg font-semibold text-zinc-900">
            No proposals yet
          </h3>

          <p className="mt-2 text-sm text-zinc-500">
            Freelancers have not submitted proposals to your jobs yet.
          </p>

          <Button asChild className="mt-5">
            <Link to="/client/jobs">
              View My Jobs
            </Link>
          </Button>
        </div>
      )}

      {!isLoading && !isError && proposals.length > 0 && (
        <div className="mt-6 space-y-4">
          {proposals.map((proposal) => {
            const freelancer =
              typeof proposal.freelancer === "string"
                ? null
                : proposal.freelancer;

            const job =
              typeof proposal.job === "string"
                ? null
                : proposal.job;

            return (
              <div
                key={proposal._id}
                className="rounded-xl border bg-white p-5 shadow-sm"
              >
                <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
                  <div className="min-w-0">
                    <div className="flex flex-wrap items-center gap-2">
                      <h2 className="text-lg font-semibold text-zinc-950">
                        {job?.title ?? "Job"}
                      </h2>

                      <StatusBadge status={proposal.status} />
                    </div>

                    <p className="mt-1 text-sm text-zinc-500">
                      Proposal from{" "}
                      <span className="font-medium text-zinc-800">
                        {freelancer?.name ?? "Freelancer"}
                      </span>
                    </p>
                  </div>

                  <div className="flex flex-wrap gap-2">
                    {job?._id && (
                      <Button
                        asChild
                        variant="outline"
                        size="sm"
                      >
                        <Link
                          to={`/client/jobs/${job._id}/proposals`}
                        >
                          <Eye className="mr-2 h-4 w-4" />
                          View Job Proposals
                        </Link>
                      </Button>
                    )}

                    {proposal.status === "PENDING" && (
                      <>
                        <Button
                          size="sm"
                          onClick={() =>
                            handleAccept(proposal._id)
                          }
                          disabled={
                            acceptMutation.isPending ||
                            rejectMutation.isPending
                          }
                        >
                          <Check className="mr-2 h-4 w-4" />
                          Accept
                        </Button>

                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() =>
                            handleReject(proposal._id)
                          }
                          disabled={
                            acceptMutation.isPending ||
                            rejectMutation.isPending
                          }
                        >
                          <X className="mr-2 h-4 w-4" />
                          Reject
                        </Button>
                      </>
                    )}
                  </div>
                </div>

                <div className="mt-5 grid gap-4 border-t pt-5 sm:grid-cols-2 lg:grid-cols-4">
                  <div>
                    <p className="text-xs font-medium uppercase tracking-wide text-zinc-500">
                      Freelancer
                    </p>

                    <p className="mt-1 text-sm font-medium text-zinc-900">
                      {freelancer?.name ?? "N/A"}
                    </p>
                  </div>

                  <div>
                    <p className="text-xs font-medium uppercase tracking-wide text-zinc-500">
                      Bid Amount
                    </p>

                    <p className="mt-1 text-sm font-medium text-zinc-900">
                      ₦{Number(proposal.bidAmount ?? 0).toLocaleString()}
                    </p>
                  </div>

                  <div>
                    <p className="text-xs font-medium uppercase tracking-wide text-zinc-500">
                      Delivery
                    </p>

                    <p className="mt-1 text-sm font-medium text-zinc-900">
                      {proposal.deliveryTime
                        ? `${proposal.deliveryTime} days`
                        : "N/A"}
                    </p>
                  </div>

                  <div>
                    <p className="text-xs font-medium uppercase tracking-wide text-zinc-500">
                      Job Status
                    </p>

                    <p className="mt-1 text-sm font-medium text-zinc-900">
                      {job?.status ?? "N/A"}
                    </p>
                  </div>
                </div>

                {proposal.coverLetter && (
                  <div className="mt-5 border-t pt-5">
                    <p className="text-xs font-medium uppercase tracking-wide text-zinc-500">
                      Cover Letter
                    </p>

                    <p className="mt-2 whitespace-pre-wrap text-sm leading-6 text-zinc-600">
                      {proposal.coverLetter}
                    </p>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}