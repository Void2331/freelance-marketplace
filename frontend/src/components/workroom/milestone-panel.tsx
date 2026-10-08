import { useState } from "react";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { Loader2 } from "lucide-react";
import { toast } from "sonner";

import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { MilestoneCard } from "@/components/projects/milestone-card";
import { ReceiptButton } from "@/components/documents/receipt-button";

import {
  useApproveMilestone,
  useInitializePayment,
  useRejectMilestone,
  useRequestChanges,
  useStartMilestone,
} from "@/hooks/use-milestones";

import {
  DeliverableSubmission,
  SubmissionHistory,
} from "@/components/workroom/deliverable-submission";

import { useOpenDispute } from "@/hooks/use-disputes";

import {
  submissionSchema,
  type SubmissionFormValues,
} from "@/lib/validations/milestone";

import {
  disputeSchema,
  type DisputeFormValues,
} from "@/lib/validations/dispute";

import { DISPUTE_REASONS } from "@/types/dispute";

import type { Milestone } from "@/types/milestone";
import type { UserRole } from "@/types/auth";

interface MilestonePanelProps {
  milestone: Milestone;
  projectId: string;
  role: UserRole;
}

const DISPUTABLE_STATUSES = [
  "FUNDED",
  "IN_PROGRESS",
  "SUBMITTED",
  "REVISION_REQUESTED",
];

function errorMessage(error: unknown, fallback: string) {
  const message = (error as any)?.response?.data?.message;

  return typeof message === "string" ? message : fallback;
}

export function MilestonePanel({
  milestone,
  projectId,
  role,
}: MilestonePanelProps) {
  const [showChangesForm, setShowChangesForm] = useState(false);
  const [showDisputeForm, setShowDisputeForm] = useState(false);

  const initializePayment = useInitializePayment();
  const startMilestone = useStartMilestone();
  const requestChanges = useRequestChanges();
  const approveMilestone = useApproveMilestone();
  const rejectMilestone = useRejectMilestone();
  const openDispute = useOpenDispute();

  const changesForm = useForm<SubmissionFormValues>({
    resolver: zodResolver(submissionSchema),
  });

  const disputeForm = useForm<DisputeFormValues>({
    resolver: zodResolver(disputeSchema),
  });

  async function handleFund() {
    try {
      const result = await initializePayment.mutateAsync({
        milestoneId: milestone._id,
        projectId,
      });

      window.location.href = result.authorizationUrl;
    } catch (error) {
      toast.error(errorMessage(error, "Unable to start payment"));
    }
  }

  async function handleStart() {
    try {
      await startMilestone.mutateAsync({
        id: milestone._id,
        projectId,
      });

      toast.success("Milestone started");
    } catch (error) {
      toast.error(errorMessage(error, "Unable to start milestone"));
    }
  }

  async function handleRequestChanges(
    values: SubmissionFormValues,
  ) {
    try {
      await requestChanges.mutateAsync({
        id: milestone._id,
        projectId,
        message: values.message,
      });

      toast.success("Changes requested");

      setShowChangesForm(false);
      changesForm.reset();
    } catch (error) {
      toast.error(
        errorMessage(error, "Unable to request changes"),
      );
    }
  }

  async function handleApprove() {
    const confirmed = window.confirm(
      "Approve this milestone? This releases payment to the freelancer immediately.",
    );

    if (!confirmed) return;

    try {
      await approveMilestone.mutateAsync({
        id: milestone._id,
        projectId,
      });

      toast.success(
        "Milestone approved and payment released",
      );
    } catch (error) {
      toast.error(
        errorMessage(error, "Unable to approve milestone"),
      );
    }
  }

  async function handleReject() {
    const confirmed = window.confirm(
      "Reject this milestone? This cannot be undone.",
    );

    if (!confirmed) return;

    try {
      await rejectMilestone.mutateAsync({
        id: milestone._id,
        projectId,
      });

      toast.success("Milestone rejected");
    } catch (error) {
      toast.error(
        errorMessage(error, "Unable to reject milestone"),
      );
    }
  }

  async function handleOpenDispute(
    values: DisputeFormValues,
  ) {
    try {
      await openDispute.mutateAsync({
        milestoneId: milestone._id,
        data: values,
      });

      toast.success(
        "Dispute opened — our team will review it shortly",
      );

      setShowDisputeForm(false);
      disputeForm.reset();
    } catch (error) {
      toast.error(
        errorMessage(error, "Unable to open dispute"),
      );
    }
  }

  const canDispute =
    (role === "CLIENT" || role === "FREELANCER") &&
    DISPUTABLE_STATUSES.includes(milestone.status);

  const isFreelancer = role === "FREELANCER";

  return (
    <MilestoneCard milestone={milestone}>
      <div className="space-y-4">
        {/* =====================================================
            PENDING: CLIENT FUNDS THE MILESTONE
        ====================================================== */}
        {milestone.status === "PENDING" &&
          role === "CLIENT" && (
            <Button
              size="sm"
              onClick={handleFund}
              disabled={initializePayment.isPending}
            >
              {initializePayment.isPending && (
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              )}

              Fund milestone
            </Button>
          )}

        {milestone.status === "PENDING" &&
          role === "FREELANCER" && (
            <p className="text-sm text-zinc-500">
              Waiting for the client to fund this milestone.
            </p>
          )}

        {/* =====================================================
            FUNDED: FREELANCER STARTS WORK
        ====================================================== */}
        {milestone.status === "FUNDED" &&
          role === "FREELANCER" && (
            <Button
              size="sm"
              onClick={handleStart}
              disabled={startMilestone.isPending}
            >
              {startMilestone.isPending && (
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              )}

              Start work
            </Button>
          )}

        {milestone.status === "FUNDED" &&
          role === "CLIENT" && (
            <p className="text-sm text-zinc-500">
              Milestone is funded and held in escrow. Waiting
              for the freelancer to start.
            </p>
          )}

        {/* =====================================================
            IN_PROGRESS / REVISION_REQUESTED:
            FREELANCER SUBMITS DELIVERABLE
        ====================================================== */}

        {isFreelancer &&
          (
            milestone.status === "IN_PROGRESS" ||
            milestone.status === "REVISION_REQUESTED"
          ) && (
            <DeliverableSubmission
              milestoneId={milestone._id}
              projectId={projectId}
            />
          )}

        {/* =====================================================
            CLIENT VIEW WHILE MILESTONE IS IN PROGRESS
        ====================================================== */}

        {milestone.status === "IN_PROGRESS" &&
          role === "CLIENT" && (
            <p className="text-sm text-zinc-500">
              The freelancer is working on this milestone.
            </p>
          )}

        {/* =====================================================
            CLIENT VIEW WHILE REVISION IS REQUESTED
        ====================================================== */}

        {milestone.status === "REVISION_REQUESTED" &&
          role === "CLIENT" && (
            <p className="text-sm text-zinc-500">
              Waiting for the freelancer to resubmit after
              your requested changes.
            </p>
          )}

        {/* =====================================================
            SUBMITTED: CLIENT REVIEWS DELIVERABLE
        ====================================================== */}

        {milestone.status === "SUBMITTED" &&
          role === "CLIENT" && (
            <div className="space-y-3">
              {milestone.submissionNote && (
                <p className="rounded-lg bg-zinc-50 p-3 text-sm text-zinc-600">
                  {milestone.submissionNote}
                </p>
              )}

              {showChangesForm ? (
                <form
                  onSubmit={changesForm.handleSubmit(
                    handleRequestChanges,
                  )}
                  className="space-y-3"
                >
                  <Textarea
                    placeholder="What needs to change?"
                    {...changesForm.register("message")}
                  />

                  {changesForm.formState.errors.message && (
                    <p className="text-xs text-red-600">
                      {
                        changesForm.formState.errors.message
                          .message
                      }
                    </p>
                  )}

                  <div className="flex gap-2">
                    <Button
                      type="submit"
                      size="sm"
                      variant="outline"
                      disabled={requestChanges.isPending}
                    >
                      {requestChanges.isPending && (
                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      )}

                      Send request
                    </Button>

                    <Button
                      type="button"
                      size="sm"
                      variant="ghost"
                      onClick={() =>
                        setShowChangesForm(false)
                      }
                    >
                      Cancel
                    </Button>
                  </div>
                </form>
              ) : (
                <div className="flex flex-wrap gap-2">
                  <Button
                    size="sm"
                    onClick={handleApprove}
                    disabled={approveMilestone.isPending}
                  >
                    {approveMilestone.isPending && (
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    )}

                    Approve &amp; release payment
                  </Button>

                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() =>
                      setShowChangesForm(true)
                    }
                  >
                    Request changes
                  </Button>

                  <Button
                    size="sm"
                    variant="destructive"
                    onClick={handleReject}
                    disabled={rejectMilestone.isPending}
                  >
                    {rejectMilestone.isPending && (
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    )}

                    Reject
                  </Button>
                </div>
              )}
            </div>
          )}

        {/* =====================================================
            SUBMITTED: FREELANCER WAITING FOR CLIENT
        ====================================================== */}

        {milestone.status === "SUBMITTED" &&
          role === "FREELANCER" && (
            <p className="text-sm text-zinc-500">
              Submitted — waiting for client review.
            </p>
          )}

        {/* =====================================================
            SUBMISSION HISTORY
        ====================================================== */}

        {(milestone.status === "SUBMITTED" ||
          milestone.status === "RELEASED" ||
          milestone.status === "REVISION_REQUESTED") && (
          <SubmissionHistory
            milestoneId={milestone._id}
          />
        )}

        {/* =====================================================
            RELEASED
        ====================================================== */}

        {milestone.status === "RELEASED" && (
          <p className="text-sm font-medium text-emerald-600">
            Payment released to the freelancer.
          </p>
        )}

        {/* =====================================================
            DISPUTED
        ====================================================== */}

        {milestone.status === "DISPUTED" && (
          <p className="text-sm font-medium text-orange-600">
            This milestone is under dispute.
          </p>
        )}

        {/* =====================================================
            RECEIPT
        ====================================================== */}

        <ReceiptButton
          milestone={milestone}
          role={role}
        />

        {/* =====================================================
            DISPUTE ACTION
        ====================================================== */}

        {canDispute && (
          <div className="border-t pt-3">
            {showDisputeForm ? (
              <form
                onSubmit={disputeForm.handleSubmit(
                  handleOpenDispute,
                )}
                className="space-y-3"
              >
                <select
                  className="h-9 w-full rounded-lg border border-input bg-transparent px-2.5 text-sm"
                  {...disputeForm.register("reason")}
                  defaultValue=""
                >
                  <option value="" disabled>
                    Select a reason
                  </option>

                  {DISPUTE_REASONS.map((reason) => (
                    <option
                      key={reason.value}
                      value={reason.value}
                    >
                      {reason.label}
                    </option>
                  ))}
                </select>

                {disputeForm.formState.errors.reason && (
                  <p className="text-xs text-red-600">
                    Please select a reason
                  </p>
                )}

                <Textarea
                  placeholder="Describe the issue in detail..."
                  {...disputeForm.register("description")}
                />

                {disputeForm.formState.errors.description && (
                  <p className="text-xs text-red-600">
                    {
                      disputeForm.formState.errors
                        .description.message
                    }
                  </p>
                )}

                <div className="flex gap-2">
                  <Button
                    type="submit"
                    size="sm"
                    variant="destructive"
                    disabled={openDispute.isPending}
                  >
                    {openDispute.isPending && (
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    )}

                    Open dispute
                  </Button>

                  <Button
                    type="button"
                    size="sm"
                    variant="ghost"
                    onClick={() =>
                      setShowDisputeForm(false)
                    }
                  >
                    Cancel
                  </Button>
                </div>
              </form>
            ) : (
              <Button
                size="sm"
                variant="link"
                className="h-auto p-0 text-zinc-500"
                onClick={() =>
                  setShowDisputeForm(true)
                }
              >
                Report a problem with this milestone
              </Button>
            )}
          </div>
        )}
      </div>
    </MilestoneCard>
  );
}

