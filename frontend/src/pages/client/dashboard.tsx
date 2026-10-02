import {
  ArrowUpRight,
  BriefcaseBusiness,
  CheckCircle2,
  Clock3,
  DollarSign,
  Plus,
} from "lucide-react";
import { Link } from "react-router-dom";

import { Button } from "@/components/ui/button";
import { DashboardHeader } from "@/components/dashboard/dashboard-header";
import { StatCard } from "@/components/dashboard/stat-card";
import { StatusBadge } from "@/components/dashboard/status-badge";
import { SectionCard } from "@/components/dashboard/section-card";
import { EmptyState } from "@/components/dashboard/empty-state";

import { useAuth } from "@/features/auth/auth-context";
import { useMyJobs } from "@/hooks/use-jobs";
import { useMyProjects } from "@/hooks/use-projects";

const ACTIVE_PROJECT_STATUSES = ["AWAITING_PAYMENT", "IN_PROGRESS"];

export default function ClientDashboard() {
  const { user } = useAuth();

  const { data, isLoading: jobsLoading } = useMyJobs();
  const { data: projects = [], isLoading: projectsLoading } = useMyProjects();

  const jobs = data?.data || [];

  const firstName = user?.name?.split(" ")[0];

  const activeJobs = jobs.filter((job) => job.status === "OPEN").length;

  const activeProjects = projects.filter((project) =>
    ACTIVE_PROJECT_STATUSES.includes(project.status),
  );

  const completedProjects = projects.filter(
    (project) => project.status === "COMPLETED",
  ).length;

  const totalValue = projects
    .filter((project) => project.status !== "CANCELLED")
    .reduce((total, project) => total + project.totalAmount, 0);

  const currency = projects[0]?.currency ?? "NGN";

  const recentJobs = jobs
    .slice()
    .sort(
      (a, b) =>
        new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime(),
    )
    .slice(0, 5);

  return (
    <div className="p-4 sm:p-6 lg:p-8">
      <DashboardHeader
        title={firstName ? `Welcome back, ${firstName}` : "Welcome back"}
        description="Here's what's happening with your projects."
        action={
          <Button asChild>
            <Link to="/client/jobs/new">
              <Plus className="mr-2 h-4 w-4" />
              Post a Job
            </Link>
          </Button>
        }
      />

      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <StatCard
          title="Open Jobs"
          value={jobsLoading ? "—" : activeJobs}
          icon={BriefcaseBusiness}
          description="accepting proposals"
        />

        <StatCard
          title="Active Projects"
          value={projectsLoading ? "—" : activeProjects.length}
          icon={Clock3}
          description="in progress"
        />

        <StatCard
          title="Completed Projects"
          value={projectsLoading ? "—" : completedProjects}
          icon={CheckCircle2}
          description="delivered"
        />

        <StatCard
          title="Total Project Value"
          value={
            projectsLoading
              ? "—"
              : `${currency} ${totalValue.toLocaleString()}`
          }
          icon={DollarSign}
          description="excluding cancelled"
        />
      </div>

      <div className="mt-6 grid gap-6 xl:grid-cols-2">
        <SectionCard
          title="Recent Jobs"
          description="Your latest job postings"
          action={
            <Button variant="ghost" size="sm" asChild>
              <Link to="/client/jobs">
                View all
                <ArrowUpRight className="ml-1 h-4 w-4" />
              </Link>
            </Button>
          }
        >
          {jobsLoading ? (
            <div className="h-32 animate-pulse rounded-lg bg-zinc-100" />
          ) : recentJobs.length === 0 ? (
            <EmptyState
              icon={BriefcaseBusiness}
              title="No jobs yet"
              description="Post your first job to start receiving proposals."
            />
          ) : (
            <div className="space-y-1">
              {recentJobs.map((job) => (
                <Link
                  key={job._id}
                  to={`/client/jobs/${job._id}`}
                  className="block rounded-lg p-3 transition hover:bg-zinc-50"
                >
                  <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                    <div className="min-w-0">
                      <h3 className="truncate font-medium">{job.title}</h3>

                      <p className="mt-1 text-xs text-zinc-500">
                        {job.currency} {job.budget.toLocaleString()}
                      </p>
                    </div>

                    <StatusBadge status={job.status} />
                  </div>
                </Link>
              ))}
            </div>
          )}
        </SectionCard>

        <SectionCard
          title="Active Projects"
          description="Open a project to fund milestones and review work"
          action={
            <Button variant="ghost" size="sm" asChild>
              <Link to="/client/projects">
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
              description="Projects appear here after you accept a proposal."
            />
          ) : (
            <div className="space-y-1">
              {activeProjects.slice(0, 5).map((project) => (
                <Link
                  key={project._id}
                  to={`/projects/${project._id}`}
                  className="block rounded-lg p-3 transition hover:bg-zinc-50"
                >
                  <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
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
