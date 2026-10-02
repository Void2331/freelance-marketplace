import { Link } from "react-router-dom";
import { Loader2 } from "lucide-react";
import { toast } from "sonner";

import { Button } from "@/components/ui/button";
import { DashboardHeader } from "@/components/dashboard/dashboard-header";
import { StatusBadge } from "@/components/dashboard/status-badge";

import { useAdminDeleteJob, useAdminJobs } from "@/hooks/use-jobs";
import { getErrorMessage } from "@/lib/errors";

import type { Job } from "@/types/job";

// IN_PROGRESS/COMPLETED jobs have a real project attached, so admins
// moderate those from the project itself rather than removing the job.
const REMOVABLE_STATUSES = ["OPEN", "CANCELLED"];

function JobRow({ job }: { job: Job }) {
  const removeJob = useAdminDeleteJob();

  async function handleRemove() {
    const confirmed = window.confirm(
      `Remove "${job.title}"? If it already has a project attached, it will be closed instead of deleted.`,
    );

    if (!confirmed) return;

    try {
      const result = await removeJob.mutateAsync(job._id);
      toast.success(result.deleted ? "Job deleted" : "Job closed");
    } catch (error) {
      toast.error(getErrorMessage(error, "Unable to remove job"));
    }
  }

  return (
    <tr>
      <td className="px-5 py-3 font-medium">
        <Link to={`/jobs/${job._id}`} className="hover:underline">
          {job.title}
        </Link>
      </td>
      <td className="px-5 py-3 text-zinc-500">
        {typeof job.client === "string" ? "—" : job.client.name}
      </td>
      <td className="px-5 py-3">
        {job.currency} {job.budget.toLocaleString()}
      </td>
      <td className="px-5 py-3">
        <StatusBadge status={job.status} />
      </td>
      <td className="px-5 py-3 text-zinc-500">
        {new Date(job.createdAt).toLocaleDateString()}
      </td>
      <td className="px-5 py-3 text-right">
        {REMOVABLE_STATUSES.includes(job.status) && (
          <Button
            size="sm"
            variant="destructive"
            onClick={handleRemove}
            disabled={removeJob.isPending}
          >
            {removeJob.isPending && (
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
            )}
            Remove
          </Button>
        )}
      </td>
    </tr>
  );
}

export default function AdminJobsPage() {
  const { data: jobs = [], isLoading, isError } = useAdminJobs();

  return (
    <div className="p-4 sm:p-6 lg:p-8">
      <DashboardHeader
        title="Jobs"
        description="Every job posted on the marketplace."
      />

      <div className="overflow-x-auto rounded-xl border bg-white shadow-sm">
        <table className="w-full text-left text-sm">
          <thead className="border-b bg-zinc-50 text-xs uppercase text-zinc-500">
            <tr>
              <th className="px-5 py-3">Title</th>
              <th className="px-5 py-3">Client</th>
              <th className="px-5 py-3">Budget</th>
              <th className="px-5 py-3">Status</th>
              <th className="px-5 py-3">Posted</th>
              <th className="px-5 py-3" />
            </tr>
          </thead>

          <tbody className="divide-y">
            {isLoading ? (
              <tr>
                <td colSpan={6} className="px-5 py-8 text-center text-zinc-400">
                  Loading...
                </td>
              </tr>
            ) : isError ? (
              <tr>
                <td colSpan={6} className="px-5 py-8 text-center text-red-600">
                  Unable to load jobs.
                </td>
              </tr>
            ) : jobs.length === 0 ? (
              <tr>
                <td colSpan={6} className="px-5 py-8 text-center text-zinc-400">
                  No jobs found.
                </td>
              </tr>
            ) : (
              jobs.map((job) => <JobRow key={job._id} job={job} />)
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
