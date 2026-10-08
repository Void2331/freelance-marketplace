import { ArrowUpRight, Clock3, FileText, CheckCircle2, XCircle } from "lucide-react";
import { Link } from "react-router-dom";

import { Button } from "@/components/ui/button";
import { DashboardHeader } from "@/components/dashboard/dashboard-header";
import { SectionCard } from "@/components/dashboard/section-card";
import { StatusBadge } from "@/components/dashboard/status-badge";
import { EmptyState } from "@/components/dashboard/empty-state";
import { StatCard } from "@/components/dashboard/stat-card";
import { useMyProposals } from "@/hooks/use-proposals";

export default function FreelancerProposalsPage() {
  const { data: proposals = [], isLoading } = useMyProposals();

  const pending = proposals.filter((proposal) => proposal.status === "PENDING");
  const accepted = proposals.filter((proposal) => proposal.status === "ACCEPTED");
  const rejected = proposals.filter((proposal) => proposal.status === "REJECTED");

  return (
    <div className="min-w-0 p-4 sm:p-6 lg:p-8">
      <DashboardHeader
        title="My Proposals"
        description="Track every proposal you've submitted and see which opportunities need your attention."
        action={<Button asChild><Link to="/freelancer/jobs">Find Work</Link></Button>}
      />

      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <StatCard title="Total Proposals" value={isLoading ? "—" : proposals.length} icon={FileText} description="submitted" />
        <StatCard title="Pending" value={isLoading ? "—" : pending.length} icon={Clock3} description="awaiting client response" />
        <StatCard title="Accepted" value={isLoading ? "—" : accepted.length} icon={CheckCircle2} description="won opportunities" />
        <StatCard title="Rejected" value={isLoading ? "—" : rejected.length} icon={XCircle} description="not selected" />
      </div>

      <SectionCard title="Proposal pipeline" description="Your current applications" className="mt-6">
        {isLoading ? (
          <div className="space-y-3">{[1, 2, 3].map((item) => <div key={item} className="h-28 animate-pulse rounded-xl bg-zinc-100" />)}</div>
        ) : proposals.length === 0 ? (
          <EmptyState icon={FileText} title="No proposals yet" description="Find a project that matches your skills and submit your first proposal." actionLabel="Find work" onAction={() => { window.location.href = "/freelancer/jobs"; }} />
        ) : (
          <div className="divide-y">
            {proposals.map((proposal) => {
              const job = typeof proposal.job === "string" ? null : proposal.job;
              return (
                <Link key={proposal._id} to={`/freelancer/proposals/${proposal._id}`} className="block py-4 transition hover:bg-zinc-50">
                  <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                    <div className="min-w-0">
                      <div className="flex flex-wrap items-center gap-3">
                        <h3 className="truncate font-semibold">{job?.title ?? "Job"}</h3>
                        <StatusBadge status={proposal.status} />
                      </div>
                      <div className="mt-2 flex flex-wrap gap-4 text-sm text-zinc-500">
                        <span>Bid: ₦{proposal.bidAmount.toLocaleString()}</span>
                        <span className="flex items-center gap-1"><Clock3 className="h-3.5 w-3.5" />{proposal.estimatedDuration} days</span>
                      </div>
                    </div>
                    <ArrowUpRight className="h-4 w-4 shrink-0 text-zinc-400" />
                  </div>
                </Link>
              );
            })}
          </div>
        )}
      </SectionCard>
    </div>
  );
}
