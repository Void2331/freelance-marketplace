import {
  Edit,
  Eye,
  MoreHorizontal,
  Plus,
  Trash2,
} from "lucide-react";

import { Link } from "react-router-dom";
import { useState } from "react";
import { toast } from "sonner";

import { Button } from "@/components/ui/button";

import {
  DashboardHeader,
} from "@/components/dashboard/dashboard-header";

import {
  StatusBadge,
} from "@/components/dashboard/status-badge";

import {
  EmptyState,
} from "@/components/dashboard/empty-state";

import {
  useDeleteJob,
  useMyJobs,
} from "@/hooks/use-jobs";
import { getErrorMessage } from "@/lib/errors";

export default function ClientJobsPage() {
  const { data: jobs = [], isLoading } =
    useMyJobs();

  const deleteMutation =
    useDeleteJob();

  const [deletingId, setDeletingId] =
    useState<string | null>(null);

  async function handleDelete(
    id: string,
  ) {
    const confirmed = window.confirm(
      "Are you sure you want to delete this job?",
    );

    if (!confirmed) {
      return;
    }

    try {
      setDeletingId(id);

      await deleteMutation.mutateAsync(id);

      toast.success(
        "Job deleted successfully",
      );
    } catch (error) {
      toast.error(
        getErrorMessage(error, "Unable to delete job"),
      );
    } finally {
      setDeletingId(null);
    }
  }

  return (
    <div className="p-4 sm:p-6 lg:p-8">
      <DashboardHeader
        title="My Jobs"
        description="Manage the jobs you've posted."
        action={
          <Button asChild>
            <Link to="/client/jobs/new">
              <Plus className="mr-2 h-4 w-4" />
              Post a Job
            </Link>
          </Button>
        }
      />

      {isLoading ? (
        <div className="space-y-3">
          {[1, 2, 3].map((item) => (
            <div
              key={item}
              className="h-28 animate-pulse rounded-xl bg-zinc-100"
            />
          ))}
        </div>
      ) : jobs.length === 0 ? (
        <div className="rounded-xl border bg-white">
          <EmptyState
            icon={Plus}
            title="No jobs yet"
            description="Create your first job and start receiving proposals from freelancers."
            actionLabel="Post a Job"
            onAction={() => {
              window.location.href =
                "/client/jobs/new";
            }}
          />
        </div>
      ) : (
        <div className="space-y-3">
          {jobs.map((job) => (
            <div
              key={job._id}
              className="rounded-xl border bg-white p-5 shadow-sm"
            >
              <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
                <div className="min-w-0">
                  <div className="flex flex-wrap items-center gap-3">
                    <Link
                      to={`/client/jobs/${job._id}`}
                      className="font-semibold hover:underline"
                    >
                      {job.title}
                    </Link>

                    <StatusBadge
                      status={job.status}
                    />
                  </div>

                  <p className="mt-2 line-clamp-2 text-sm text-zinc-500">
                    {job.description}
                  </p>

                  <div className="mt-3 flex flex-wrap gap-4 text-xs text-zinc-500">
                    <span>
                      {job.currency}{" "}
                      {job.budget.toLocaleString()}
                    </span>

                    <span>
                      {job.budgetType}
                    </span>

                    {job.category && (
                      <span>
                        {job.category}
                      </span>
                    )}
                  </div>
                </div>

                <div className="flex flex-wrap gap-2">
                  <Button
                    size="sm"
                    variant="outline"
                    asChild
                  >
                    <Link
                      to={`/client/jobs/${job._id}`}
                    >
                      <Eye className="mr-2 h-4 w-4" />
                      View
                    </Link>
                  </Button>

                  {job.status === "OPEN" && (
                    <>
                      <Button
                        size="sm"
                        variant="outline"
                        asChild
                      >
                        <Link
                          to={`/client/jobs/${job._id}/edit`}
                        >
                          <Edit className="mr-2 h-4 w-4" />
                          Edit
                        </Link>
                      </Button>

                      <Button
                        size="sm"
                        variant="outline"
                        disabled={
                          deletingId === job._id
                        }
                        onClick={() =>
                          handleDelete(
                            job._id,
                          )
                        }
                      >
                        <Trash2 className="mr-2 h-4 w-4" />
                        Delete
                      </Button>
                    </>
                  )}

                  {job.status === "OPEN" && (
                    <Button
                      size="sm"
                      variant="outline"
                      asChild
                    >
                      <Link
                        to={`/client/jobs/${job._id}/proposals`}
                      >
                        <MoreHorizontal className="mr-2 h-4 w-4" />
                        Proposals
                      </Link>
                    </Button>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}