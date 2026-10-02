import { Link, useParams } from "react-router-dom";
import { Calendar, Loader2, MapPin, Users } from "lucide-react";

import { Button } from "@/components/ui/button";
import { StatusBadge } from "@/components/dashboard/status-badge";
import { ProposalForm } from "@/pages/freelancer/jobs/proposal-form";

import { useAuth } from "@/features/auth/auth-context";
import { useJob } from "@/hooks/use-jobs";
import { useJobProposals, useMyProposals } from "@/hooks/use-proposals";

import type { Job } from "@/types/job";

function ClientOwnerActions({ job }: { job: Job }) {
  const { data: proposals = [] } = useJobProposals(job._id);

  return (
    <div className="space-y-3 rounded-xl border bg-white p-5 shadow-sm">
      <div className="flex items-center gap-2 text-sm text-zinc-600">
        <Users className="h-4 w-4" />
        {proposals.length} proposal{proposals.length === 1 ? "" : "s"}{" "}
        received
      </div>

      <Button asChild className="w-full">
        <Link to={`/client/jobs/${job._id}/proposals`}>
          Review proposals
        </Link>
      </Button>
    </div>
  );
}

function FreelancerApply({ job }: { job: Job }) {
  const { data: myProposals = [], isLoading } = useMyProposals();

  const existing = myProposals.find((proposal) => {
    const proposalJobId =
      typeof proposal.job === "string" ? proposal.job : proposal.job._id;
    return proposalJobId === job._id;
  });

  if (isLoading) {
    return <div className="h-40 animate-pulse rounded-xl bg-zinc-100" />;
  }

  if (existing) {
    return (
      <div className="space-y-3 rounded-xl border bg-white p-5 shadow-sm">
        <div className="flex items-center justify-between">
          <h2 className="font-semibold">Your proposal</h2>
          <StatusBadge status={existing.status} />
        </div>

        <p className="text-sm text-zinc-500">
          Bid: ₦{existing.bidAmount.toLocaleString()} ·{" "}
          {existing.estimatedDuration} days
        </p>

        <Button asChild variant="outline" className="w-full">
          <Link to="/freelancer/proposals">View my proposals</Link>
        </Button>
      </div>
    );
  }

  if (job.status !== "OPEN") {
    return (
      <div className="rounded-xl border bg-white p-5 text-sm text-zinc-500 shadow-sm">
        This job is no longer accepting proposals.
      </div>
    );
  }

  return <ProposalForm jobId={job._id} />;
}

export default function JobDetailPage() {
  const { id } = useParams<{ id: string }>();
  const { user, isAuthenticated } = useAuth();

  const { data: job, isLoading, isError } = useJob(id);

  if (isLoading) {
    return (
      <div className="flex min-h-[50vh] items-center justify-center">
        <Loader2 className="h-6 w-6 animate-spin text-zinc-400" />
      </div>
    );
  }

  if (isError || !job) {
    return (
      <div className="mx-auto max-w-3xl p-6">
        <div className="rounded-xl border p-10 text-center">
          <h3 className="font-semibold">Job not found</h3>
          <p className="mt-1 text-sm text-zinc-500">
            It may have been removed or is no longer available.
          </p>
        </div>
      </div>
    );
  }

  const client = typeof job.client === "string" ? null : job.client;
  const clientId = typeof job.client === "string" ? job.client : job.client._id;
  const isOwner = user?.role === "CLIENT" && user._id === clientId;

  return (
    <div className="mx-auto max-w-6xl p-4 sm:p-6 lg:p-8">
      <div className="grid gap-6 lg:grid-cols-[1fr_380px]">
        <div className="space-y-6">
          <div className="rounded-xl border bg-white p-6 shadow-sm">
            <div className="flex flex-wrap items-center gap-3">
              <h1 className="text-2xl font-bold tracking-tight">
                {job.title}
              </h1>
              <StatusBadge status={job.status} />
            </div>

            <div className="mt-4 flex flex-wrap gap-x-6 gap-y-2 text-sm text-zinc-500">
              <span className="font-semibold text-zinc-900">
                {job.currency} {job.budget.toLocaleString()}{" "}
                <span className="font-normal text-zinc-500">
                  ({job.budgetType.toLowerCase()})
                </span>
              </span>

              {job.category && <span>{job.category}</span>}

              {job.deadline && (
                <span className="flex items-center gap-1">
                  <Calendar className="h-4 w-4" />
                  Due {new Date(job.deadline).toLocaleDateString()}
                </span>
              )}
            </div>

            <h2 className="mt-6 font-semibold">Description</h2>
            <p className="mt-2 whitespace-pre-wrap text-sm leading-6 text-zinc-600">
              {job.description}
            </p>

            {job.skills.length > 0 && (
              <>
                <h2 className="mt-6 font-semibold">Skills required</h2>
                <div className="mt-2 flex flex-wrap gap-2">
                  {job.skills.map((skill) => (
                    <span
                      key={skill}
                      className="rounded-full bg-zinc-100 px-3 py-1 text-xs"
                    >
                      {skill}
                    </span>
                  ))}
                </div>
              </>
            )}
          </div>
        </div>

        <aside className="space-y-4">
          {client && (
            <div className="rounded-xl border bg-white p-5 shadow-sm">
              <h2 className="font-semibold">About the client</h2>
              <p className="mt-2 text-sm font-medium">{client.name}</p>

              {client.location && (
                <p className="mt-1 flex items-center gap-1 text-sm text-zinc-500">
                  <MapPin className="h-4 w-4" />
                  {client.location}
                </p>
              )}

              {client.bio && (
                <p className="mt-3 text-sm text-zinc-600">{client.bio}</p>
              )}
            </div>
          )}

          {isOwner && <ClientOwnerActions job={job} />}

          {user?.role === "FREELANCER" && <FreelancerApply job={job} />}

          {!isAuthenticated && (
            <div className="space-y-3 rounded-xl border bg-white p-5 shadow-sm">
              <p className="text-sm text-zinc-600">
                Sign in as a freelancer to submit a proposal for this job.
              </p>

              <Button asChild className="w-full">
                <Link to="/login">Sign in</Link>
              </Button>
            </div>
          )}
        </aside>
      </div>
    </div>
  );
}
