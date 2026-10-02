import {
  Check,
  X,
} from "lucide-react";

import {
  useNavigate,
  useParams,
} from "react-router-dom";

import {
  toast,
} from "sonner";

import {
  Button,
} from "@/components/ui/button";

import {
  DashboardHeader,
} from "@/components/dashboard/dashboard-header";

import {
  StatusBadge,
} from "@/components/dashboard/status-badge";

import {
  useAcceptProposal,
  useJobProposals,
  useRejectProposal,
} from "@/hooks/use-proposals";
import { getErrorMessage } from "@/lib/errors";

export default function ClientJobProposalsPage() {
  const {
    jobId,
  } = useParams<{
    jobId: string;
  }>();

  const navigate =
    useNavigate();

  const {
    data: proposals = [],
    isLoading,
  } = useJobProposals(jobId);

  const acceptMutation =
    useAcceptProposal();

  const rejectMutation =
    useRejectProposal();

  async function handleAccept(
    proposalId: string,
  ) {
    const confirmed =
      window.confirm(
        "Accept this proposal? This will create a project, contract, milestone and payment record.",
      );

    if (!confirmed) {
      return;
    }

    try {
      const result =
        await acceptMutation.mutateAsync(
          proposalId,
        );

      toast.success(
        "Proposal accepted and project created.",
      );

      navigate(
        `/projects/${result.projectId}`,
      );
    } catch (error) {
      toast.error(
        getErrorMessage(error, "Unable to accept proposal"),
      );
    }
  }

  async function handleReject(
    proposalId: string,
  ) {
    try {
      await rejectMutation.mutateAsync(
        proposalId,
      );

      toast.success(
        "Proposal rejected.",
      );
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
        description="Review freelancers who applied to this job."
      />

      {isLoading ? (
        <div className="space-y-3">
          {[1, 2, 3].map(
            (item) => (
              <div
                key={item}
                className="h-36 animate-pulse rounded-xl bg-zinc-100"
              />
            ),
          )}
        </div>
      ) : proposals.length === 0 ? (
        <div className="rounded-xl border p-10 text-center">
          <h3 className="font-semibold">
            No proposals yet
          </h3>

          <p className="mt-1 text-sm text-zinc-500">
            Freelancers haven't submitted proposals for this job yet.
          </p>
        </div>
      ) : (
        <div className="space-y-4">
          {proposals.map(
            (proposal) => {
              const freelancer =
                typeof proposal.freelancer ===
                "string"
                  ? null
                  : proposal.freelancer;

              return (
                <div
                  key={proposal._id}
                  className="rounded-xl border bg-white p-5 shadow-sm"
                >
                  <div className="flex flex-col gap-5 lg:flex-row lg:items-start lg:justify-between">
                    <div className="min-w-0">
                      <div className="flex flex-wrap items-center gap-3">
                        <h2 className="font-semibold">
                          {freelancer?.name ??
                            "Freelancer"}
                        </h2>

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

                        <span>
                          Duration:{" "}
                          {
                            proposal.estimatedDuration
                          }{" "}
                          days
                        </span>
                      </div>

                      <p className="mt-4 whitespace-pre-wrap text-sm leading-6 text-zinc-600">
                        {
                          proposal.coverLetter
                        }
                      </p>
                    </div>

                    <div className="flex shrink-0 flex-wrap gap-2">
                      {proposal.status ===
                        "PENDING" && (
                        <>
                          <Button
                            size="sm"
                            onClick={() =>
                              handleAccept(
                                proposal._id,
                              )
                            }
                            disabled={
                              acceptMutation.isPending
                            }
                          >
                            <Check className="mr-2 h-4 w-4" />
                            Accept
                          </Button>

                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() =>
                              handleReject(
                                proposal._id,
                              )
                            }
                            disabled={
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
                </div>
              );
            },
          )}
        </div>
      )}
    </div>
  );
}