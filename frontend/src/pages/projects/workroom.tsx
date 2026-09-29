import { useNavigate, useParams } from "react-router-dom";
import { ArrowLeft, Loader2 } from "lucide-react";
import { toast } from "sonner";

import { Button } from "@/components/ui/button";
import { StatusBadge } from "@/components/dashboard/status-badge";

import { MilestonePanel } from "@/components/workroom/milestone-panel";
import { MessageThread } from "@/components/workroom/message-thread";
import { ActivityFeed } from "@/components/workroom/activity-feed";
import { ReviewPanel } from "@/components/workroom/review-panel";
import { DisputeList } from "@/components/workroom/dispute-list";
import { CreateMilestoneForm } from "@/components/workroom/create-milestone-form";

import { useAuth } from "@/features/auth/auth-context";
import {
  useCancelProject,
  useCompleteProject,
  useWorkroom,
} from "@/hooks/use-projects";
import { getErrorMessage } from "@/lib/errors";

const PROJECTS_PATH_BY_ROLE: Record<string, string> = {
  CLIENT: "/client/projects",
  FREELANCER: "/freelancer/projects",
  ADMIN: "/admin/projects",
};

export default function ProjectWorkroomPage() {
  const { id } = useParams<{ id: string }>();
  const { user } = useAuth();
  const navigate = useNavigate();

  const { data, isLoading, isError } = useWorkroom(id);
  const cancelProject = useCancelProject();
  const completeProject = useCompleteProject();

  if (isLoading) {
    return (
      <div className="flex min-h-[60vh] items-center justify-center">
        <Loader2 className="h-6 w-6 animate-spin text-zinc-400" />
      </div>
    );
  }

  if (isError || !data) {
    return (
      <div className="p-4 sm:p-6 lg:p-8">
        <div className="rounded-xl border p-10 text-center">
          <h3 className="font-semibold">Unable to load this project</h3>
          <p className="mt-1 text-sm text-zinc-500">
            It may not exist, or you may not have access to it.
          </p>
        </div>
      </div>
    );
  }

  const { project, milestones, activities } = data;

  const role = user?.role ?? "CLIENT";

  const counterpart =
    role === "CLIENT"
      ? typeof project.freelancer === "string"
        ? null
        : project.freelancer
      : typeof project.client === "string"
        ? null
        : project.client;

  const canCancel =
    role === "CLIENT" &&
    ["AWAITING_PAYMENT", "IN_PROGRESS"].includes(project.status);

  const allocated = milestones.reduce(
    (total, milestone) => total + milestone.amount,
    0,
  );

  const canAddMilestone =
    role === "CLIENT" && project.status === "IN_PROGRESS";

  const canComplete =
    role === "CLIENT" &&
    project.status === "IN_PROGRESS" &&
    milestones.length > 0 &&
    milestones.every((milestone) => milestone.status === "RELEASED");

  async function handleCancel() {
    const confirmed = window.confirm(
      "Cancel this project? This cannot be undone.",
    );

    if (!confirmed || !id) return;

    try {
      await cancelProject.mutateAsync(id);
      toast.success("Project cancelled");
    } catch (error) {
      toast.error(
        getErrorMessage(error, "Unable to cancel project"),
      );
    }
  }

  async function handleComplete() {
    if (!id) return;

    try {
      await completeProject.mutateAsync(id);
      toast.success("Project marked as completed");
    } catch (error) {
      toast.error(
        getErrorMessage(error, "Unable to complete project"),
      );
    }
  }

  return (
    <div className="p-4 sm:p-6 lg:p-8">
      <Button
        variant="ghost"
        size="sm"
        className="mb-4"
        onClick={() =>
          navigate(PROJECTS_PATH_BY_ROLE[role] ?? "/")
        }
      >
        <ArrowLeft className="mr-2 h-4 w-4" />
        Back to projects
      </Button>

      <div className="mb-8 flex flex-col gap-4 rounded-xl border bg-white p-6 shadow-sm sm:flex-row sm:items-start sm:justify-between">
        <div>
          <div className="flex flex-wrap items-center gap-3">
            <h1 className="text-2xl font-bold tracking-tight">
              {project.title}
            </h1>
            <StatusBadge status={project.status} />
          </div>

          <p className="mt-2 text-sm text-zinc-500">
            {role === "CLIENT" ? "Freelancer" : "Client"}:{" "}
            <span className="font-medium text-zinc-700">
              {counterpart?.name ?? "—"}
            </span>
          </p>

          <p className="mt-1 text-sm text-zinc-500">
            Total contract value:{" "}
            <span className="font-semibold text-zinc-900">
              {project.currency} {project.totalAmount.toLocaleString()}
            </span>
          </p>
        </div>

        <div className="flex shrink-0 flex-wrap gap-2">
          {canComplete && (
            <Button
              size="sm"
              onClick={handleComplete}
              disabled={completeProject.isPending}
            >
              {completeProject.isPending && (
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              )}
              Mark project complete
            </Button>
          )}

          {canCancel && (
            <Button
              size="sm"
              variant="outline"
              onClick={handleCancel}
              disabled={cancelProject.isPending}
            >
              Cancel project
            </Button>
          )}
        </div>
      </div>

      <div className="grid gap-6 lg:grid-cols-[1fr_380px]">
        <div className="space-y-6">
          <div>
            <h2 className="mb-4 text-lg font-semibold">Milestones</h2>

            {milestones.length === 0 ? (
              <div className="rounded-xl border bg-white p-8 text-center text-sm text-zinc-500">
                No milestones yet.
              </div>
            ) : (
              <div className="space-y-4">
                {milestones
                  .slice()
                  .sort((a, b) => a.order - b.order)
                  .map((milestone) => (
                    <MilestonePanel
                      key={milestone._id}
                      milestone={milestone}
                      projectId={project._id}
                      role={role}
                    />
                  ))}
              </div>
            )}

            {canAddMilestone && (
              <div className="mt-4">
                <CreateMilestoneForm
                  projectId={project._id}
                  currency={project.currency}
                  remainingBudget={project.totalAmount - allocated}
                />
              </div>
            )}
          </div>

          {project.status === "COMPLETED" && (
            <ReviewPanel projectId={project._id} currentUser={user} />
          )}

          <DisputeList projectId={project._id} />

          <ActivityFeed activities={activities} />
        </div>

        <div>
          <MessageThread projectId={project._id} currentUser={user} />
        </div>
      </div>
    </div>
  );
}
