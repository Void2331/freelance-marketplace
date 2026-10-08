import {
  ArrowRight,
  BriefcaseBusiness,
  Clock3,
  DollarSign,
  FileText,
  Plus,
  Wallet,
} from "lucide-react";

import { Link } from "react-router-dom";

import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";

import { DashboardHeader } from "@/components/dashboard/dashboard-header";
import { StatusBadge } from "@/components/dashboard/status-badge";

import { useAuth } from "@/features/auth/auth-context";
import { useWallet } from "@/hooks/use-wallet";
import { useMyProjects } from "@/hooks/use-projects";
import { useMyProposals } from "@/hooks/use-proposals";
import { useJobs } from "@/hooks/use-jobs";


export default function FreelancerDashboard() {
  const { user } = useAuth();

  const {
    data: wallet,
    isLoading: walletLoading,
  } = useWallet();

  const {
    data: projects = [],
    isLoading: projectsLoading,
  } = useMyProjects();

  const {
    data: proposals = [],
    isLoading: proposalsLoading,
  } = useMyProposals();

  const {
    data,
    isLoading: jobsLoading,
  } = useJobs();

  const jobs = data?.data || [];

  const firstName = user?.name?.split(" ")[0];

  const currency = wallet?.currency ?? "NGN";

  const activeProjects = projects.filter(
    (project) =>
      project.status === "IN_PROGRESS" ||
      project.status === "ACTIVE",
  );

  const pendingProposals = proposals.filter(
    (proposal) =>
      proposal.status === "PENDING" ||
      proposal.status === "SUBMITTED",
  );

  const suggestedJobs = jobs
    .filter(
      (job) =>
        job.status === "OPEN",
    )
    .slice(0, 5);

  const isLoading =
    walletLoading ||
    projectsLoading ||
    proposalsLoading ||
    jobsLoading;

  return (
    <div className="p-4 sm:p-6 lg:p-8">
      <DashboardHeader
        title={`Welcome back${firstName ? `, ${firstName}` : ""}`}
        description="Keep track of your work, proposals, earnings, and opportunities."
        action={
          <Button asChild>
            <Link to="/freelancer/jobs">
              <BriefcaseBusiness className="mr-2 h-4 w-4" />
              Find Work
            </Link>
          </Button>
        }
      />

      {isLoading ? (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {[1, 2, 3, 4].map((item) => (
            <div
              key={item}
              className="h-32 animate-pulse rounded-xl bg-zinc-100"
            />
          ))}
        </div>
      ) : (
        <>
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            <Card>
              <CardContent className="p-5">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-zinc-500">
                      Available Balance
                    </p>

                    <p className="mt-2 text-2xl font-semibold">
                      {currency}{" "}
                      {Number(
                        wallet?.availableBalance ?? 0,
                      ).toLocaleString()}
                    </p>
                  </div>

                  <div className="rounded-lg bg-zinc-100 p-3">
                    <Wallet className="h-5 w-5 text-zinc-700" />
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="p-5">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-zinc-500">
                      Total Earnings
                    </p>

                    <p className="mt-2 text-2xl font-semibold">
                      {currency}{" "}
                      {Number(
                        wallet?.totalEarnings ?? 0,
                      ).toLocaleString()}
                    </p>
                  </div>

                  <div className="rounded-lg bg-zinc-100 p-3">
                    <DollarSign className="h-5 w-5 text-zinc-700" />
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="p-5">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-zinc-500">
                      Active Projects
                    </p>

                    <p className="mt-2 text-2xl font-semibold">
                      {activeProjects.length}
                    </p>
                  </div>

                  <div className="rounded-lg bg-zinc-100 p-3">
                    <BriefcaseBusiness className="h-5 w-5 text-zinc-700" />
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="p-5">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-zinc-500">
                      Pending Proposals
                    </p>

                    <p className="mt-2 text-2xl font-semibold">
                      {pendingProposals.length}
                    </p>
                  </div>

                  <div className="rounded-lg bg-zinc-100 p-3">
                    <FileText className="h-5 w-5 text-zinc-700" />
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          <div className="mt-8 grid gap-6 lg:grid-cols-3">
            <Card className="lg:col-span-2">
              <CardHeader className="flex flex-row items-center justify-between">
                <div>
                  <CardTitle>Suggested Jobs</CardTitle>

                  <p className="mt-1 text-sm text-zinc-500">
                    Find opportunities that match your skills.
                  </p>
                </div>

                <Button
                  asChild
                  variant="ghost"
                  size="sm"
                >
                  <Link to="/freelancer/jobs">
                    View all
                    <ArrowRight className="ml-2 h-4 w-4" />
                  </Link>
                </Button>
              </CardHeader>

              <CardContent>
                {suggestedJobs.length === 0 ? (
                  <div className="rounded-lg border border-dashed p-8 text-center">
                    <BriefcaseBusiness className="mx-auto h-8 w-8 text-zinc-400" />

                    <p className="mt-3 font-medium">
                      No open jobs available
                    </p>

                    <p className="mt-1 text-sm text-zinc-500">
                      Check back later for new opportunities.
                    </p>
                  </div>
                ) : (
                  <div className="space-y-3">
                    {suggestedJobs.map((job) => (
                      <div
                        key={job._id}
                        className="rounded-xl border p-4 transition hover:bg-zinc-50"
                      >
                        <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
                          <div className="min-w-0">
                            <Link
                              to={`/jobs/${job._id}`}
                              className="font-semibold hover:underline"
                            >
                              {job.title}
                            </Link>

                            <p className="mt-1 line-clamp-2 text-sm text-zinc-500">
                              {job.description}
                            </p>

                            <div className="mt-3 flex flex-wrap gap-3 text-xs text-zinc-500">
                              <span>
                                {job.currency}{" "}
                                {Number(
                                  job.budget ?? 0,
                                ).toLocaleString()}
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

                          <Button
                            asChild
                            size="sm"
                          >
                            <Link
                              to={`/jobs/${job._id}`}
                            >
                              View Job
                            </Link>
                          </Button>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Quick Actions</CardTitle>
              </CardHeader>

              <CardContent className="space-y-3">
                <Button
                  asChild
                  className="w-full justify-start"
                  variant="outline"
                >
                  <Link to="/freelancer/jobs">
                    <BriefcaseBusiness className="mr-2 h-4 w-4" />
                    Browse Jobs
                  </Link>
                </Button>

                <Button
                  asChild
                  className="w-full justify-start"
                  variant="outline"
                >
                  <Link to="/freelancer/proposals">
                    <FileText className="mr-2 h-4 w-4" />
                    My Proposals
                  </Link>
                </Button>

                <Button
                  asChild
                  className="w-full justify-start"
                  variant="outline"
                >
                  <Link to="/freelancer/projects">
                    <BriefcaseBusiness className="mr-2 h-4 w-4" />
                    My Projects
                  </Link>
                </Button>

                <Button
                  asChild
                  className="w-full justify-start"
                  variant="outline"
                >
                  <Link to="/freelancer/wallet">
                    <Wallet className="mr-2 h-4 w-4" />
                    Wallet
                  </Link>
                </Button>
              </CardContent>
            </Card>
          </div>

          <div className="mt-6 grid gap-6 lg:grid-cols-2">
            <Card>
              <CardHeader className="flex flex-row items-center justify-between">
                <div>
                  <CardTitle>Active Projects</CardTitle>

                  <p className="mt-1 text-sm text-zinc-500">
                    Projects currently in progress.
                  </p>
                </div>

                <Button
                  asChild
                  variant="ghost"
                  size="sm"
                >
                  <Link to="/freelancer/projects">
                    View all
                    <ArrowRight className="ml-2 h-4 w-4" />
                  </Link>
                </Button>
              </CardHeader>

              <CardContent>
                {activeProjects.length === 0 ? (
                  <div className="rounded-lg border border-dashed p-8 text-center">
                    <Clock3 className="mx-auto h-8 w-8 text-zinc-400" />

                    <p className="mt-3 font-medium">
                      No active projects
                    </p>

                    <p className="mt-1 text-sm text-zinc-500">
                      Accepted projects will appear here.
                    </p>
                  </div>
                ) : (
                  <div className="space-y-3">
                    {activeProjects.slice(0, 5).map(
                      (project) => (
                        <Link
                          key={project._id}
                          to={`/freelancer/projects/${project._id}`}
                          className="flex items-center justify-between rounded-lg border p-4 transition hover:bg-zinc-50"
                        >
                          <div className="min-w-0">
                            <p className="truncate font-medium">
                              {project.title}
                            </p>

                            <p className="mt-1 text-xs text-zinc-500">
                              Project in progress
                            </p>
                          </div>

                          <StatusBadge
                            status={project.status}
                          />
                        </Link>
                      ),
                    )}
                  </div>
                )}
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Proposal Activity</CardTitle>

                <p className="mt-1 text-sm text-zinc-500">
                  Your latest proposal activity.
                </p>
              </CardHeader>

              <CardContent>
                {proposals.length === 0 ? (
                  <div className="rounded-lg border border-dashed p-8 text-center">
                    <FileText className="mx-auto h-8 w-8 text-zinc-400" />

                    <p className="mt-3 font-medium">
                      No proposals yet
                    </p>

                    <p className="mt-1 text-sm text-zinc-500">
                      Submit proposals to jobs you are interested in.
                    </p>

                    <Button
                      asChild
                      className="mt-4"
                    >
                      <Link to="/freelancer/jobs">
                        <Plus className="mr-2 h-4 w-4" />
                        Find Work
                      </Link>
                    </Button>
                  </div>
                ) : (
                  <div className="space-y-3">
                    {proposals.slice(0, 5).map(
                      (proposal) => (
                        <Link
                          key={proposal._id}
                          to={`/freelancer/proposals/${proposal._id}`}
                          className="flex items-center justify-between rounded-lg border p-4 transition hover:bg-zinc-50"
                        >
                          <div className="min-w-0">
                            <p className="truncate font-medium">
                              {proposal.job?.title ??
                                "Job Proposal"}
                            </p>

                            <p className="mt-1 text-xs text-zinc-500">
                              Proposal submitted
                            </p>
                          </div>

                          <StatusBadge
                            status={proposal.status}
                          />
                        </Link>
                      ),
                    )}
                  </div>
                )}
              </CardContent>
            </Card>
          </div>
        </>
      )}
    </div>
  );
}