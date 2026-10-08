import {
  ArrowUpRight,
  BriefcaseBusiness,
  CheckCircle2,
  Clock3,
  DollarSign,
  FileText,
  MessageSquare,
  Plus,
  Star,
  UserRound,
  Users,
  X,
} from "lucide-react";
import { Link } from "react-router-dom";
import { useMemo, useState } from "react";

import { Button } from "@/components/ui/button";
import { DashboardHeader } from "@/components/dashboard/dashboard-header";
import { StatCard } from "@/components/dashboard/stat-card";
import { StatusBadge } from "@/components/dashboard/status-badge";
import { SectionCard } from "@/components/dashboard/section-card";
import { EmptyState } from "@/components/dashboard/empty-state";

import { useAuth } from "@/features/auth/auth-context";
import { useMyJobs } from "@/hooks/use-jobs";
import { useMyProjects } from "@/hooks/use-projects";
import { useClientProposals } from "@/hooks/use-proposals";
import { useFreelancers } from "@/hooks/use-users";

const ACTIVE_PROJECT_STATUSES = [
  "AWAITING_PAYMENT",
  "IN_PROGRESS",
];

function ProfileCompletion({
  onClose,
}: {
  onClose: () => void;
}) {
  const items = [
    "Company or client name",
    "Profile photo",
    "About your business",
    "Location",
    "Hiring preferences",
    "Payment method",
  ];

  return (
    <div
      className="fixed inset-0 z-[70] flex items-center justify-center bg-black/40 p-4"
      onMouseDown={onClose}
    >
      <div
        className="max-h-[88vh] w-full max-w-3xl overflow-hidden rounded-2xl bg-white shadow-2xl"
        onMouseDown={(event) => event.stopPropagation()}
      >
        <div className="grid md:grid-cols-[260px_1fr]">
          <div className="bg-zinc-100 p-8 text-center">
            <div className="mx-auto flex h-32 w-32 items-center justify-center rounded-full border-8 border-zinc-900 bg-white text-3xl font-bold text-zinc-900">
              80%
            </div>

            <p className="mt-5 text-sm text-zinc-500">
              Profile complete
            </p>

            <h3 className="mt-1 text-xl font-semibold">
              Make hiring easier
            </h3>

            <Link
              to="/settings/profile"
              onClick={onClose}
              className="mt-4 inline-block text-sm underline"
            >
              Manage profile
            </Link>
          </div>

          <div>
            <div className="flex items-start justify-between border-b p-6">
              <div>
                <h2 className="text-2xl font-semibold">
                  Complete your client profile
                </h2>

                <p className="mt-1 text-sm text-zinc-500">
                  A complete profile gives freelancers more confidence
                  when deciding whether to work with you.
                </p>
              </div>

              <Button
                variant="ghost"
                size="icon"
                onClick={onClose}
              >
                <X className="h-5 w-5" />
              </Button>
            </div>

            <div className="max-h-[55vh] overflow-y-auto p-4">
              {items.map((item, index) => (
                <Link
                  key={item}
                  to="/settings/profile"
                  onClick={onClose}
                  className="flex items-center gap-4 rounded-xl border-b p-4 last:border-0 hover:bg-zinc-50"
                >
                  <span
                    className={`flex h-7 w-7 items-center justify-center rounded-full border ${
                      index < 3
                        ? "border-zinc-900 bg-zinc-900 text-white"
                        : "border-zinc-300"
                    }`}
                  >
                    {index < 3 ? (
                      <CheckCircle2 className="h-4 w-4" />
                    ) : null}
                  </span>

                  <div className="flex-1">
                    <p className="font-medium">{item}</p>

                    <p className="text-xs text-zinc-500">
                      Add this information to strengthen your
                      hiring profile.
                    </p>
                  </div>

                  <ArrowUpRight className="h-4 w-4 text-zinc-400" />
                </Link>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default function ClientDashboard() {
  const { user } = useAuth();

  const [showProfile, setShowProfile] = useState(false);

  const [jobTab, setJobTab] =
    useState<"recent" | "active">("recent");

  const {
    data: jobs = [],
    isLoading: jobsLoading,
  } = useMyJobs();

  const {
    data: projects = [],
    isLoading: projectsLoading,
  } = useMyProjects();

  const {
    data: proposals = [],
    isLoading: proposalsLoading,
  } = useClientProposals();

  const {
    data: freelancerData,
    isLoading: freelancersLoading,
  } = useFreelancers({
    limit: 4,
  });

  const firstName = user?.name?.split(" ")[0];

  const activeJobs = jobs.filter(
    (job) => job.status === "OPEN",
  );

  const activeProjects = projects.filter((project) =>
    ACTIVE_PROJECT_STATUSES.includes(project.status),
  );

  const completedProjects = projects.filter(
    (project) => project.status === "COMPLETED",
  );

  const pendingProposals = proposals.filter(
    (proposal) => proposal.status === "PENDING",
  );

  const totalValue = projects
    .filter((project) => project.status !== "CANCELLED")
    .reduce(
      (total, project) => total + project.totalAmount,
      0,
    );

  const completedValue = completedProjects.reduce(
    (total, project) => total + project.totalAmount,
    0,
  );

  const activeValue = activeProjects.reduce(
    (total, project) => total + project.totalAmount,
    0,
  );

  const currency = projects[0]?.currency ?? "NGN";

  const sortedJobs = useMemo(() => {
    const source =
      jobTab === "active"
        ? activeJobs
        : jobs;

    return source
      .slice()
      .sort(
        (a, b) =>
          new Date(b.createdAt).getTime() -
          new Date(a.createdAt).getTime(),
      )
      .slice(0, 5);
  }, [activeJobs, jobTab, jobs]);

  return (
    <div className="p-4 sm:p-6 lg:p-8">
      <DashboardHeader
        title={
          firstName
            ? `Welcome back, ${firstName}`
            : "Welcome back"
        }
        description="Hire great talent, manage your jobs and keep every project moving."
        action={
          <Button asChild>
            <Link to="/client/jobs/new">
              <Plus className="h-4 w-4" />
              Post a job
            </Link>
          </Button>
        }
      />

      {/* PROFILE COMPLETION */}
      <div className="mb-6 rounded-xl border bg-white p-4 shadow-sm">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <p className="text-sm font-semibold">
              Complete your client profile
            </p>

            <p className="mt-1 text-sm text-zinc-500">
              A complete profile helps freelancers trust your jobs
              and respond faster.
            </p>
          </div>

          <div className="flex items-center gap-4">
            <div className="h-2 w-32 rounded-full bg-zinc-100">
              <div className="h-2 w-[80%] rounded-full bg-zinc-900" />
            </div>

            <span className="text-sm font-semibold">
              80%
            </span>

            <Button
              variant="outline"
              size="sm"
              onClick={() => setShowProfile(true)}
            >
              View checklist
            </Button>
          </div>
        </div>
      </div>

      {/* STAT CARDS */}
      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <StatCard
          title="Open Jobs"
          value={
            jobsLoading
              ? "—"
              : activeJobs.length
          }
          icon={BriefcaseBusiness}
          description="accepting proposals"
        />

        <StatCard
          title="Active Projects"
          value={
            projectsLoading
              ? "—"
              : activeProjects.length
          }
          icon={Clock3}
          description="currently in progress"
        />

        <StatCard
          title="Pending Proposals"
          value={
            proposalsLoading
              ? "—"
              : pendingProposals.length
          }
          icon={FileText}
          description="awaiting your review"
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

      {/* PIPELINE + QUICK ACTIONS */}
      <div className="mt-6 grid gap-6 xl:grid-cols-[1.45fr_1fr]">
        <SectionCard
          title="Hiring pipeline"
          description="Track every stage from job post to completed delivery"
        >
          <div className="grid gap-3 sm:grid-cols-3">
            <Link
              to="/client/jobs"
              className="rounded-xl border p-4 transition hover:border-zinc-400 hover:bg-zinc-50"
            >
              <div className="flex items-center justify-between">
                <p className="text-xs text-zinc-500">
                  Jobs
                </p>

                <BriefcaseBusiness className="h-4 w-4 text-zinc-400" />
              </div>

              <p className="mt-2 text-2xl font-semibold">
                {jobs.length}
              </p>

              <p className="mt-2 text-xs text-zinc-500">
                {activeJobs.length} currently open
              </p>
            </Link>

            <Link
              to="/client/proposals"
              className="rounded-xl border p-4 transition hover:border-zinc-400 hover:bg-zinc-50"
            >
              <div className="flex items-center justify-between">
                <p className="text-xs text-zinc-500">
                  Proposals
                </p>

                <FileText className="h-4 w-4 text-zinc-400" />
              </div>

              <p className="mt-2 text-2xl font-semibold">
                {proposals.length}
              </p>

              <p className="mt-2 text-xs text-zinc-500">
                {pendingProposals.length} need review
              </p>
            </Link>

            <Link
              to="/client/projects"
              className="rounded-xl border p-4 transition hover:border-zinc-400 hover:bg-zinc-50"
            >
              <div className="flex items-center justify-between">
                <p className="text-xs text-zinc-500">
                  Projects
                </p>

                <Clock3 className="h-4 w-4 text-zinc-400" />
              </div>

              <p className="mt-2 text-2xl font-semibold">
                {projects.length}
              </p>

              <p className="mt-2 text-xs text-zinc-500">
                {completedProjects.length} completed
              </p>
            </Link>
          </div>
        </SectionCard>

        <SectionCard
          title="Quick actions"
          description="Common hiring tasks"
        >
          <div className="grid gap-2 sm:grid-cols-2 xl:grid-cols-1">
            <Button asChild>
              <Link to="/client/jobs/new">
                <Plus className="h-4 w-4" />
                Post a job
              </Link>
            </Button>

            <Button
              variant="outline"
              asChild
            >
              <Link to="/freelancers">
                <Users className="h-4 w-4" />
                Find freelancers
              </Link>
            </Button>

            <Button
              variant="outline"
              asChild
            >
              <Link to="/client/proposals">
                <FileText className="h-4 w-4" />
                Review proposals
              </Link>
            </Button>

            <Button
              variant="outline"
              asChild
            >
              <Link to="/messages">
                <MessageSquare className="h-4 w-4" />
                Message freelancers
              </Link>
            </Button>
          </div>
        </SectionCard>
      </div>

      {/* JOBS + FREELANCERS */}
      <div className="mt-6 grid gap-6 xl:grid-cols-[1.4fr_1fr]">
        <SectionCard
          title="Your jobs"
          description="Keep your hiring queue moving"
          action={
            <Button
              variant="ghost"
              size="sm"
              asChild
            >
              <Link to="/client/jobs">
                View all
                <ArrowUpRight className="h-4 w-4" />
              </Link>
            </Button>
          }
        >
          <div className="mb-4 flex gap-1 border-b">
            <button
              onClick={() => setJobTab("recent")}
              className={`px-3 py-2 text-sm font-medium ${
                jobTab === "recent"
                  ? "border-b-2 border-zinc-950 text-zinc-950"
                  : "text-zinc-500"
              }`}
            >
              Recent
            </button>

            <button
              onClick={() => setJobTab("active")}
              className={`px-3 py-2 text-sm font-medium ${
                jobTab === "active"
                  ? "border-b-2 border-zinc-950 text-zinc-950"
                  : "text-zinc-500"
              }`}
            >
              Open now
            </button>
          </div>

          {jobsLoading ? (
            <div className="h-36 animate-pulse rounded-lg bg-zinc-100" />
          ) : sortedJobs.length === 0 ? (
            <EmptyState
              icon={BriefcaseBusiness}
              title={
                jobTab === "active"
                  ? "No open jobs"
                  : "No jobs yet"
              }
              description="Post your first job to start receiving proposals from freelancers."
              actionLabel="Post a job"
              onAction={() => {
                window.location.href =
                  "/client/jobs/new";
              }}
            />
          ) : (
            <div className="divide-y">
              {sortedJobs.map((job) => (
                <Link
                  key={job._id}
                  to={`/client/jobs/${job._id}`}
                  className="block py-4 transition hover:bg-zinc-50"
                >
                  <div className="flex items-start justify-between gap-4">
                    <div className="min-w-0">
                      <p className="text-xs text-zinc-500">
                        Posted{" "}
                        {new Date(
                          job.createdAt,
                        ).toLocaleDateString()}
                      </p>

                      <h3 className="mt-1 truncate font-semibold">
                        {job.title}
                      </h3>

                      <p className="mt-1 text-xs text-zinc-500">
                        {job.currency}{" "}
                        {job.budget.toLocaleString()}{" "}
                        · {job.budgetType}
                      </p>

                      <div className="mt-2 flex flex-wrap gap-1">
                        {job.skills
                          .slice(0, 4)
                          .map((skill) => (
                            <span
                              key={skill}
                              className="rounded-full bg-zinc-100 px-2 py-1 text-[11px]"
                            >
                              {skill}
                            </span>
                          ))}
                      </div>
                    </div>

                    <StatusBadge status={job.status} />
                  </div>
                </Link>
              ))}
            </div>
          )}
        </SectionCard>

        <SectionCard
          title="Recommended talent"
          description="Freelancers you can explore next"
          action={
            <Button
              variant="ghost"
              size="sm"
              asChild
            >
              <Link to="/freelancers">
                Browse all
                <ArrowUpRight className="h-4 w-4" />
              </Link>
            </Button>
          }
        >
          {freelancersLoading ? (
            <div className="space-y-3">
              {[1, 2, 3].map((item) => (
                <div
                  key={item}
                  className="h-16 animate-pulse rounded-lg bg-zinc-100"
                />
              ))}
            </div>
          ) : (
            (freelancerData?.freelancers ?? []).length ===
            0
          ) ? (
            <EmptyState
              icon={Users}
              title="No freelancers yet"
              description="Browse the talent directory when you are ready to hire."
            />
          ) : (
            <div className="space-y-2">
              {freelancerData?.freelancers
                .slice(0, 4)
                .map((freelancer) => (
                  <Link
                    key={freelancer._id}
                    to={`/freelancers/${freelancer._id}`}
                    className="flex items-center gap-3 rounded-xl border p-3 transition hover:border-zinc-400 hover:bg-zinc-50"
                  >
                    <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-zinc-900 text-sm font-semibold text-white">
                      {freelancer.name
                        ?.charAt(0)
                        .toUpperCase() ?? (
                        <UserRound className="h-4 w-4" />
                      )}
                    </div>

                    <div className="min-w-0 flex-1">
                      <p className="truncate text-sm font-medium">
                        {freelancer.name}
                      </p>

                      <p className="truncate text-xs text-zinc-500">
                        {freelancer.skills
                          ?.slice(0, 2)
                          .join(" · ") ||
                          "Freelancer"}
                      </p>
                    </div>

                    <div className="text-right">
                      <p className="flex items-center justify-end gap-1 text-xs font-medium">
                        <Star className="h-3 w-3 fill-yellow-400 text-yellow-400" />

                        {(freelancer.averageRating ?? 0).toFixed(
                          1,
                        )}
                      </p>

                      {typeof freelancer.hourlyRate ===
                        "number" && (
                        <p className="mt-1 text-[11px] text-zinc-500">
                          ₦
                          {freelancer.hourlyRate.toLocaleString()}
                          /hr
                        </p>
                      )}
                    </div>
                  </Link>
                ))}
            </div>
          )}
        </SectionCard>
      </div>

      {/* PROJECTS + SPENDING */}
      <div className="mt-6 grid gap-6 xl:grid-cols-[1.4fr_1fr]">
        <SectionCard
          title="Active projects"
          description="Review milestones, messages and delivery"
          action={
            <Button
              variant="ghost"
              size="sm"
              asChild
            >
              <Link to="/client/projects">
                View all
                <ArrowUpRight className="h-4 w-4" />
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
              description="Projects appear here after you hire a freelancer."
              actionLabel="Find freelancers"
              onAction={() => {
                window.location.href =
                  "/freelancers";
              }}
            />
          ) : (
            <div className="grid gap-3 md:grid-cols-2">
              {activeProjects
                .slice(0, 4)
                .map((project) => (
                  <Link
                    key={project._id}
                    to={`/projects/${project._id}`}
                    className="rounded-xl border p-4 transition hover:border-zinc-400 hover:bg-zinc-50"
                  >
                    <div className="flex items-start justify-between gap-3">
                      <div className="min-w-0">
                        <h3 className="truncate font-medium">
                          {project.title}
                        </h3>

                        <p className="mt-1 text-xs text-zinc-500">
                          {project.currency}{" "}
                          {project.totalAmount.toLocaleString()}
                        </p>
                      </div>

                      <StatusBadge status={project.status} />
                    </div>

                    <div className="mt-4 flex items-center justify-between text-xs text-zinc-500">
                      <span>
                        Started{" "}
                        {new Date(
                          project.createdAt,
                        ).toLocaleDateString()}
                      </span>

                      <span>
                        Open workroom
                        <ArrowUpRight className="ml-1 inline h-3 w-3" />
                      </span>
                    </div>
                  </Link>
                ))}
            </div>
          )}
        </SectionCard>

        <SectionCard
          title="Spending overview"
          description="Understand the value of your current projects"
        >
          <div className="space-y-5">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-zinc-500">
                  Total project value
                </p>

                <p className="mt-1 text-2xl font-semibold">
                  {currency}{" "}
                  {totalValue.toLocaleString()}
                </p>
              </div>

              <DollarSign className="h-5 w-5 text-zinc-400" />
            </div>

            <div className="h-2 overflow-hidden rounded-full bg-zinc-100">
              <div
                className="h-full rounded-full bg-zinc-900"
                style={{
                  width: `${
                    totalValue
                      ? Math.min(
                          100,
                          (completedValue /
                            totalValue) *
                            100,
                        )
                      : 0
                  }%`,
                }}
              />
            </div>

            <div className="grid grid-cols-2 gap-3 text-sm">
              <div className="rounded-lg bg-zinc-50 p-3">
                <p className="text-xs text-zinc-500">
                  Active
                </p>

                <p className="mt-1 font-semibold">
                  {currency}{" "}
                  {activeValue.toLocaleString()}
                </p>
              </div>

              <div className="rounded-lg bg-zinc-50 p-3">
                <p className="text-xs text-zinc-500">
                  Completed
                </p>

                <p className="mt-1 font-semibold">
                  {currency}{" "}
                  {completedValue.toLocaleString()}
                </p>
              </div>
            </div>

            <Button
              variant="outline"
              className="w-full"
              asChild
            >
              <Link to="/client/payments">
                View payments
                <ArrowUpRight className="h-4 w-4" />
              </Link>
            </Button>
          </div>
        </SectionCard>
      </div>

      {showProfile && (
        <ProfileCompletion
          onClose={() => setShowProfile(false)}
        />
      )}
    </div>
  );
}