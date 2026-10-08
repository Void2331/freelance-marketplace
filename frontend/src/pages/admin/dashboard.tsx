import {
  AlertTriangle,
  ArrowUpRight,
  BriefcaseBusiness,
  CheckCircle2,
  CircleDollarSign,
  FileText,
  FolderKanban,
  ShieldCheck,
  UserPlus,
  Users,
  UserRound,
} from "lucide-react";
import { Link } from "react-router-dom";

import { DashboardHeader } from "@/components/dashboard/dashboard-header";
import { SectionCard } from "@/components/dashboard/section-card";
import { StatCard } from "@/components/dashboard/stat-card";
import { StatusBadge } from "@/components/dashboard/status-badge";

import { useAllUsers } from "@/hooks/use-users";
import { useAdminJobs } from "@/hooks/use-jobs";
import { useAdminProjects } from "@/hooks/use-projects";
import { useAdminDisputes } from "@/hooks/use-disputes";

import { formatMoney } from "@/lib/format";

const OPEN_DISPUTE_STATUSES = [
  "OPEN",
  "UNDER_REVIEW",
  "AWAITING_RESPONSE",
];

function ProgressRow({
  label,
  value,
}: {
  label: string;
  value: number;
}) {
  const safeValue = Math.max(0, Math.min(100, value));

  return (
    <div>
      <div className="flex justify-between text-sm">
        <span className="text-zinc-500">{label}</span>

        <span className="font-semibold">
          {safeValue.toFixed(0)}%
        </span>
      </div>

      <div className="mt-2 h-2 rounded-full bg-zinc-100">
        <div
          className="h-full rounded-full bg-zinc-900 transition-all"
          style={{ width: `${safeValue}%` }}
        />
      </div>
    </div>
  );
}

function QuickAction({
  to,
  label,
  description,
  icon: Icon,
}: {
  to: string;
  label: string;
  description: string;
  icon: typeof Users;
}) {
  return (
    <Link
      to={to}
      className="group rounded-xl border bg-white p-4 shadow-sm transition hover:-translate-y-0.5 hover:border-zinc-300 hover:shadow-md"
    >
      <div className="flex items-start justify-between">
        <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-zinc-100">
          <Icon className="h-5 w-5" />
        </div>

        <ArrowUpRight className="h-4 w-4 text-zinc-400 transition group-hover:text-zinc-900" />
      </div>

      <p className="mt-4 font-semibold">{label}</p>

      <p className="mt-1 text-xs text-zinc-500">
        {description}
      </p>
    </Link>
  );
}

export default function AdminDashboard() {
  const usersQuery = useAllUsers({
    page: 1,
    limit: 1,
  });

  const freelancersQuery = useAllUsers({
    role: "FREELANCER",
    page: 1,
    limit: 1,
  });

  const clientsQuery = useAllUsers({
    role: "CLIENT",
    page: 1,
    limit: 1,
  });

  const jobsQuery = useAdminJobs();
  const projectsQuery = useAdminProjects();
  const disputesQuery = useAdminDisputes();

  const users = usersQuery.data;

  const jobs = jobsQuery.data ?? [];
  const projects = projectsQuery.data ?? [];
  const disputes = disputesQuery.data ?? [];

  const loading =
    usersQuery.isLoading ||
    freelancersQuery.isLoading ||
    clientsQuery.isLoading ||
    jobsQuery.isLoading ||
    projectsQuery.isLoading ||
    disputesQuery.isLoading;

  const error =
    usersQuery.isError ||
    freelancersQuery.isError ||
    clientsQuery.isError ||
    jobsQuery.isError ||
    projectsQuery.isError ||
    disputesQuery.isError;

  const totalUsers =
    users?.pagination.total ?? 0;

  const freelancers =
    freelancersQuery.data?.pagination.total ?? 0;

  const clients =
    clientsQuery.data?.pagination.total ?? 0;

  const openJobs = jobs.filter(
    (job) => job.status === "OPEN",
  ).length;

  const activeProjects = projects.filter(
    (project) => project.status === "IN_PROGRESS",
  ).length;

  const completedProjects = projects.filter(
    (project) => project.status === "COMPLETED",
  ).length;

  const cancelledProjects = projects.filter(
    (project) => project.status === "CANCELLED",
  ).length;

  const openDisputes = disputes.filter(
    (dispute) =>
      OPEN_DISPUTE_STATUSES.includes(dispute.status),
  ).length;

  const projectValue = projects.reduce(
    (sum, project) => sum + project.totalAmount,
    0,
  );

  const completedValue = projects
    .filter(
      (project) => project.status === "COMPLETED",
    )
    .reduce(
      (sum, project) => sum + project.totalAmount,
      0,
    );

  const completionRate = projects.length
    ? (completedProjects / projects.length) * 100
    : 0;

  const attentionItems = [
    {
      count: openDisputes,
      label: "dispute(s) need review",
      to: "/admin/disputes",
    },
  ].filter((item) => item.count > 0);

  const recentProjects = [...projects]
    .sort(
      (a, b) =>
        new Date(b.createdAt).getTime() -
        new Date(a.createdAt).getTime(),
    )
    .slice(0, 5);

  const recentJobs = [...jobs]
    .sort(
      (a, b) =>
        new Date(b.createdAt).getTime() -
        new Date(a.createdAt).getTime(),
    )
    .slice(0, 5);

  return (
    <div className="p-4 sm:p-6 lg:p-8">
      <DashboardHeader
        title="Admin Dashboard"
        description="Monitor marketplace activity, users, jobs, projects and platform health."
      />

      {loading ? (
        <div className="space-y-6">
          <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
            {[0, 1, 2, 3].map((item) => (
              <div
                key={item}
                className="h-32 animate-pulse rounded-xl bg-zinc-100"
              />
            ))}
          </div>

          <div className="grid gap-6 xl:grid-cols-[1fr_360px]">
            <div className="h-80 animate-pulse rounded-xl bg-zinc-100" />

            <div className="h-80 animate-pulse rounded-xl bg-zinc-100" />
          </div>
        </div>
      ) : error ? (
        <div className="rounded-xl border bg-white p-10 text-center text-sm text-red-600 shadow-sm">
          Unable to load the admin dashboard.
          Please refresh and try again.
        </div>
      ) : (
        <>
          {attentionItems.length > 0 ? (
            <div className="mb-6 grid gap-3 sm:grid-cols-2 xl:grid-cols-3">
              {attentionItems.map((item) => (
                <Link
                  key={item.label}
                  to={item.to}
                  className="flex items-center justify-between rounded-xl border border-amber-200 bg-amber-50 px-4 py-3 text-sm text-amber-900 transition hover:bg-amber-100"
                >
                  <span className="flex items-center gap-2">
                    <AlertTriangle className="h-4 w-4" />

                    <span>
                      <strong>{item.count}</strong>{" "}
                      {item.label}
                    </span>
                  </span>

                  <ArrowUpRight className="h-4 w-4" />
                </Link>
              ))}
            </div>
          ) : (
            <div className="mb-6 flex items-center gap-2 rounded-xl border border-emerald-200 bg-emerald-50 px-4 py-3 text-sm text-emerald-700">
              <CheckCircle2 className="h-4 w-4" />

              Nothing needs your attention right now.
            </div>
          )}

          <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
            <StatCard
              title="Total Users"
              value={totalUsers.toLocaleString()}
              icon={Users}
              description={`${clients.toLocaleString()} clients · ${freelancers.toLocaleString()} freelancers`}
            />

            <StatCard
              title="Open Jobs"
              value={openJobs.toLocaleString()}
              icon={BriefcaseBusiness}
              description={`${jobs.length.toLocaleString()} total jobs`}
            />

            <StatCard
              title="Active Projects"
              value={activeProjects.toLocaleString()}
              icon={FolderKanban}
              description={`${completedProjects} completed · ${cancelledProjects} cancelled`}
            />

            <StatCard
              title="Project Value"
              value={formatMoney(projectValue)}
              icon={CircleDollarSign}
              description="total value across projects"
            />
          </div>

          <div className="mt-6 grid gap-6 xl:grid-cols-[1fr_360px]">
            <SectionCard
              title="Recent Projects"
              description="Latest marketplace projects"
              action={
                <Link
                  to="/admin/projects"
                  className="inline-flex items-center rounded-md px-2 py-1.5 text-sm font-medium hover:bg-zinc-100"
                >
                  View all

                  <ArrowUpRight className="ml-1 h-4 w-4" />
                </Link>
              }
            >
              {recentProjects.length === 0 ? (
                <p className="py-8 text-center text-sm text-zinc-500">
                  No projects yet.
                </p>
              ) : (
                <div className="space-y-3">
                  {recentProjects.map((project) => (
                    <Link
                      key={project._id}
                      to={`/projects/${project._id}`}
                      className="flex flex-col gap-3 rounded-xl border p-4 transition hover:bg-zinc-50 sm:flex-row sm:items-center sm:justify-between"
                    >
                      <div className="min-w-0">
                        <p className="truncate font-semibold">
                          {project.title}
                        </p>

                        <p className="mt-1 text-xs text-zinc-500">
                          {typeof project.client === "string"
                            ? "Client"
                            : project.client.name}

                          {" · "}

                          {typeof project.freelancer === "string"
                            ? "Freelancer"
                            : project.freelancer.name}
                        </p>
                      </div>

                      <div className="flex shrink-0 items-center gap-3">
                        <span className="font-semibold">
                          {formatMoney(
                            project.totalAmount,
                            project.currency,
                          )}
                        </span>

                        <StatusBadge status={project.status} />
                      </div>
                    </Link>
                  ))}
                </div>
              )}
            </SectionCard>

            <SectionCard
              title="Platform Health"
              description="Current marketplace status"
            >
              <div className="space-y-5">
                <div className="flex items-center gap-3">
                  <div className="flex h-10 w-10 items-center justify-center rounded-full bg-emerald-50">
                    <ShieldCheck className="h-5 w-5 text-emerald-600" />
                  </div>

                  <div>
                    <p className="font-medium">
                      Platform Status
                    </p>

                    <p className="text-xs text-emerald-600">
                      Core marketplace data available
                    </p>
                  </div>
                </div>

                <ProgressRow
                  label="Projects completed"
                  value={completionRate}
                />

                <ProgressRow
                  label="Open jobs vs total jobs"
                  value={
                    jobs.length
                      ? (openJobs / jobs.length) * 100
                      : 0
                  }
                />

                <p className="border-t pt-4 text-xs text-zinc-500">
                  {projects.length} projects ·{" "}
                  {openDisputes} disputes requiring review
                </p>
              </div>
            </SectionCard>
          </div>

          <div className="mt-6 grid gap-6 xl:grid-cols-2">
            <SectionCard
              title="Admin Quick Actions"
              description="Go directly to the areas you manage"
            >
              <div className="grid gap-3 sm:grid-cols-2">
                <QuickAction
                  to="/admin/users"
                  label="Manage Users"
                  description="Search, filter and activate/deactivate accounts."
                  icon={UserRound}
                />

                <QuickAction
                  to="/admin/jobs"
                  label="Moderate Jobs"
                  description="Review marketplace jobs and remove eligible listings."
                  icon={BriefcaseBusiness}
                />

                <QuickAction
                  to="/admin/projects"
                  label="Monitor Projects"
                  description="Inspect clients, freelancers, values and statuses."
                  icon={FolderKanban}
                />

                <QuickAction
                  to="/admin/disputes"
                  label="Review Disputes"
                  description={`${openDisputes} currently require attention.`}
                  icon={AlertTriangle}
                />
              </div>
            </SectionCard>

            <SectionCard
              title="Marketplace Snapshot"
              description="Key operational figures"
            >
              <div className="grid gap-3 sm:grid-cols-2">
                <div className="rounded-xl bg-zinc-50 p-4">
                  <UserPlus className="h-5 w-5" />

                  <p className="mt-3 text-2xl font-bold">
                    {totalUsers.toLocaleString()}
                  </p>

                  <p className="text-xs text-zinc-500">
                    Registered users
                  </p>
                </div>

                <div className="rounded-xl bg-zinc-50 p-4">
                  <Users className="h-5 w-5" />

                  <p className="mt-3 text-2xl font-bold">
                    {freelancers.toLocaleString()}
                  </p>

                  <p className="text-xs text-zinc-500">
                    Freelancers
                  </p>
                </div>

                <div className="rounded-xl bg-zinc-50 p-4">
                  <BriefcaseBusiness className="h-5 w-5" />

                  <p className="mt-3 text-2xl font-bold">
                    {clients.toLocaleString()}
                  </p>

                  <p className="text-xs text-zinc-500">
                    Clients
                  </p>
                </div>

                <div className="rounded-xl bg-zinc-50 p-4">
                  <FileText className="h-5 w-5" />

                  <p className="mt-3 text-2xl font-bold">
                    {formatMoney(completedValue)}
                  </p>

                  <p className="text-xs text-zinc-500">
                    Completed project value
                  </p>
                </div>
              </div>
            </SectionCard>
          </div>

          <div className="mt-6 grid gap-6 xl:grid-cols-2">
            <SectionCard
              title="Recent Jobs"
              description="Latest jobs posted on the marketplace"
              action={
                <Link
                  to="/admin/jobs"
                  className="text-sm font-medium hover:underline"
                >
                  View all
                </Link>
              }
            >
              {recentJobs.length === 0 ? (
                <p className="py-8 text-center text-sm text-zinc-500">
                  No jobs yet.
                </p>
              ) : (
                <div className="space-y-2">
                  {recentJobs.map((job) => (
                    <Link
                      key={job._id}
                      to={`/jobs/${job._id}`}
                      className="flex items-center justify-between rounded-lg px-3 py-3 hover:bg-zinc-50"
                    >
                      <div className="min-w-0">
                        <p className="truncate text-sm font-medium">
                          {job.title}
                        </p>

                        <p className="text-xs text-zinc-500">
                          {job.currency}{" "}
                          {job.budget.toLocaleString()}
                        </p>
                      </div>

                      <StatusBadge status={job.status} />
                    </Link>
                  ))}
                </div>
              )}
            </SectionCard>

            <SectionCard
              title="Admin Responsibilities"
              description="The main operational areas of the platform"
            >
              <div className="space-y-3">
                {[
                  [
                    "Users",
                    "Account moderation and role oversight",
                    "/admin/users",
                    Users,
                  ],
                  [
                    "Jobs",
                    "Marketplace listing moderation",
                    "/admin/jobs",
                    BriefcaseBusiness,
                  ],
                  [
                    "Projects",
                    "Monitor active and completed work",
                    "/admin/projects",
                    FolderKanban,
                  ],
                  [
                    "Disputes",
                    "Resolve milestone disputes and protect funds",
                    "/admin/disputes",
                    AlertTriangle,
                  ],
                ].map(
                  ([label, description, to, Icon]) => {
                    const ItemIcon =
                      Icon as typeof Users;

                    return (
                      <Link
                        key={String(label)}
                        to={String(to)}
                        className="flex items-center gap-3 rounded-xl border p-3 hover:bg-zinc-50"
                      >
                        <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-zinc-100">
                          <ItemIcon className="h-4 w-4" />
                        </div>

                        <div className="min-w-0 flex-1">
                          <p className="text-sm font-medium">
                            {String(label)}
                          </p>

                          <p className="text-xs text-zinc-500">
                            {String(description)}
                          </p>
                        </div>

                        <ArrowUpRight className="h-4 w-4 text-zinc-400" />
                      </Link>
                    );
                  },
                )}
              </div>
            </SectionCard>
          </div>
        </>
      )}
    </div>
  );
}