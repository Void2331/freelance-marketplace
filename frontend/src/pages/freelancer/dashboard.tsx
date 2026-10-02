import {
  ArrowUpRight,
  BriefcaseBusiness,
  Clock3,
  DollarSign,
  FileText,
  Search,
  Wallet,
} from "lucide-react";
import { Link } from "react-router-dom";

import { Button } from "@/components/ui/button";
import { DashboardHeader } from "@/components/dashboard/dashboard-header";
import { StatCard } from "@/components/dashboard/stat-card";
import { StatusBadge } from "@/components/dashboard/status-badge";
import { SectionCard } from "@/components/dashboard/section-card";
import { EmptyState } from "@/components/dashboard/empty-state";

import { useAuth } from "@/features/auth/auth-context";
import { useJobs } from "@/hooks/use-jobs";
import { useMyProjects } from "@/hooks/use-projects";
import { useMyProposals } from "@/hooks/use-proposals";
import { useWallet } from "@/hooks/use-wallet";

const ACTIVE_PROJECT_STATUSES = ["AWAITING_PAYMENT", "IN_PROGRESS"];

export default function FreelancerDashboard() {
  const { user } = useAuth();

  const { data: wallet, isLoading: walletLoading } = useWallet();
  const { data: projects = [], isLoading: projectsLoading } = useMyProjects();
  const { data: proposals = [], isLoading: proposalsLoading } =
    useMyProposals();
  const { data, isLoading: jobsLoading } = useJobs();

  const jobs = data?.data || [];

  const firstName = user?.name?.split(" ")[0];
  const currency = wallet?.currency ?? "NGN";

  const activeProjects = projects.filter((project) =>
    ACTIVE_PROJECT_STATUSES.includes(project.status),
  );

  const pendingProposals = proposals.filter(
    (proposal) => proposal.status === "PENDING",
  ).length;

  const appliedJobIds = new Set(
    proposals.map((proposal) =>
      typeof proposal.job === "string" ? proposal.job : proposal.job._id,
    ),
  );

  // Newest open jobs the freelancer hasn't applied to yet.
  const suggestedJobs = jobs
    .filter((job) => job.status === "OPEN" && !appliedJobIds.has(job._id))
    .sort(
      (a, b) =>
        new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime(),
    )
    .slice(0, 4);

  return (
    <div className="p-4 sm:p-6 lg:p-8">
      <DashboardHeader
        title={firstName ? `Welcome back, ${firstName}` : "Welcome back"}
        description="Discover new opportunities and manage your work."
        action={
          <Button asChild>
            <Link to="/freelancer/jobs">
              <Search className="mr-2 h-4 w-4" />
              Find Work
            </Link>
          </Button>
        }
      />

      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <StatCard
          title="Available Balance"
          value={
            walletLoading
              ? "—"
              : `${currency} ${(wallet?.availableBalance ?? 0).toLocaleString()}`
          }
          icon={Wallet}
          description="ready to withdraw"
        />

        <StatCard
          title="Total Earnings"
          value={
            walletLoading
              ? "—"
              : `${currency} ${(wallet?.totalEarned ?? 0).toLocaleString()}`
          }
          icon={DollarSign}
          description="lifetime"
        />

        <StatCard
          title="Active Projects"
          value={projectsLoading ? "—" : activeProjects.length}
          icon={Clock3}
          description="currently active"
        />

        <StatCard
          title="Pending Proposals"
          value={proposalsLoading ? "—" : pendingProposals}
          icon={FileText}
          description="awaiting responses"
        />
      </div>

      <div className="mt-6 grid gap-6 xl:grid-cols-2">
        <SectionCard
          title="New Jobs For You"
          description="Open jobs you haven't applied to yet"
          action={
            <Button variant="ghost" size="sm" asChild>
              <Link to="/freelancer/jobs">
                Browse all
                <ArrowUpRight className="ml-1 h-4 w-4" />
              </Link>
            </Button>
          }
        >
          {jobsLoading ? (
            <div className="h-32 animate-pulse rounded-lg bg-zinc-100" />
          ) : suggestedJobs.length === 0 ? (
            <EmptyState
              icon={BriefcaseBusiness}
              title="Nothing new right now"
              description="Check back soon for new jobs."
            />
          ) : (
            <div className="space-y-1">
              {suggestedJobs.map((job) => (
                <Link
                  key={job._id}
                  to={`/freelancer/jobs/${job._id}`}
                  className="block rounded-lg p-3 transition hover:bg-zinc-50"
                >
                  <h3 className="truncate font-medium">{job.title}</h3>

                  <p className="mt-1 text-xs text-zinc-500">
                    {job.currency} {job.budget.toLocaleString()} ·{" "}
                    {job.budgetType.toLowerCase()}
                  </p>
                </Link>
              ))}
            </div>
          )}
        </SectionCard>

        <SectionCard
          title="Active Projects"
          description="Projects currently in progress"
          action={
            <Button variant="ghost" size="sm" asChild>
              <Link to="/freelancer/projects">
                View all
                <ArrowUpRight className="ml-1 h-4 w-4" />
              </Link>
            </Button>
          }
        >
          {projectsLoading ? (
            <div className="h-32 animate-pulse rounded-lg bg-zinc-100" />
          ) : activeProjects.length === 0 ? (
            <EmptyState
              icon={Clock3}
              title="No active projects"
              description="Projects appear here once a client accepts your proposal."
            />
          ) : (
            <div className="space-y-1">
              {activeProjects.slice(0, 5).map((project) => (
                <Link
                  key={project._id}
                  to={`/projects/${project._id}`}
                  className="block rounded-lg p-3 transition hover:bg-zinc-50"
                >
                  <div className="flex items-center justify-between gap-3">
                    <div className="min-w-0">
                      <h3 className="truncate font-medium">{project.title}</h3>

                      <p className="mt-1 text-xs text-zinc-500">
                        {project.currency} {project.totalAmount.toLocaleString()}
                      </p>
                    </div>

                    <StatusBadge status={project.status} />
                  </div>
                </Link>
              ))}
            </div>
          )}
        </SectionCard>
      </div>
    </div>
  );
}
