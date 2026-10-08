import {
  ArrowDownLeft,
  CalendarClock,
  CircleDollarSign,
  Filter,
  Search,
} from "lucide-react";

import { useMemo, useState } from "react";
import { Link } from "react-router-dom";

import { DashboardHeader } from "@/components/dashboard/dashboard-header";
import { StatusBadge } from "@/components/dashboard/status-badge";
import { Button } from "@/components/ui/button";

import { useMyProjects } from "@/hooks/use-projects";

export default function ClientTransactions() {
  const {
    data: projects = [],
    isLoading,
  } = useMyProjects();

  const [search, setSearch] =
    useState("");

  const [status, setStatus] =
    useState<
      "ALL" | "ACTIVE" | "COMPLETED"
    >("ALL");

  const active = projects.filter(
    (project) =>
      [
        "AWAITING_PAYMENT",
        "IN_PROGRESS",
      ].includes(project.status),
  );

  const completed = projects.filter(
    (project) =>
      project.status === "COMPLETED",
  );

  const pendingValue = active.reduce(
    (sum, project) =>
      sum + project.totalAmount,
    0,
  );

  const completedValue =
    completed.reduce(
      (sum, project) =>
        sum + project.totalAmount,
      0,
    );

  const totalValue = projects
    .filter(
      (project) =>
        project.status !== "CANCELLED",
    )
    .reduce(
      (sum, project) =>
        sum + project.totalAmount,
      0,
    );

  const filteredProjects =
    useMemo(() => {
      const normalized =
        search.trim().toLowerCase();

      return projects.filter(
        (project) => {
          const matchesSearch =
            !normalized ||
            project.title
              .toLowerCase()
              .includes(normalized);

          const matchesStatus =
            status === "ALL" ||
            (status === "ACTIVE" &&
              [
                "AWAITING_PAYMENT",
                "IN_PROGRESS",
              ].includes(
                project.status,
              )) ||
            (status === "COMPLETED" &&
              project.status ===
                "COMPLETED");

          return (
            matchesSearch &&
            matchesStatus
          );
        },
      );
    }, [
      projects,
      search,
      status,
    ]);

  return (
    <div className="p-4 sm:p-6 lg:p-8">
      <DashboardHeader
        title="Transactions"
        description="Track project funding, milestone payments and completed spend."
      />

      <div className="grid gap-4 lg:grid-cols-3">
        <div className="rounded-xl border bg-white p-5 shadow-sm">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-zinc-500">
                Pending / active payments
              </p>

              <p className="mt-2 text-2xl font-semibold">
                NGN{" "}
                {pendingValue.toLocaleString()}
              </p>
            </div>

            <CalendarClock className="h-5 w-5 text-zinc-400" />
          </div>

          <p className="mt-5 text-xs text-zinc-500">
            Funding associated with active projects.
          </p>
        </div>

        <div className="rounded-xl border bg-white p-5 shadow-sm">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-zinc-500">
                Completed spend
              </p>

              <p className="mt-2 text-2xl font-semibold">
                NGN{" "}
                {completedValue.toLocaleString()}
              </p>
            </div>

            <ArrowDownLeft className="h-5 w-5 text-zinc-400" />
          </div>

          <p className="mt-5 text-xs text-zinc-500">
            Value of completed projects.
          </p>
        </div>

        <div className="rounded-xl border bg-white p-5 shadow-sm">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-zinc-500">
                Total project value
              </p>

              <p className="mt-2 text-2xl font-semibold">
                NGN{" "}
                {totalValue.toLocaleString()}
              </p>
            </div>

            <CircleDollarSign className="h-5 w-5 text-zinc-400" />
          </div>

          <p className="mt-5 text-xs text-zinc-500">
            Excludes cancelled projects.
          </p>
        </div>
      </div>

      <div className="mt-6 rounded-xl border bg-white shadow-sm">
        <div className="border-b p-4">
          <div className="flex flex-col gap-3 lg:flex-row lg:items-center lg:justify-between">
            <div className="flex flex-1 items-center rounded-lg border bg-zinc-50 px-3 lg:max-w-md">
              <Search className="h-4 w-4 text-zinc-400" />

              <input
                value={search}
                onChange={(event) =>
                  setSearch(event.target.value)
                }
                placeholder="Search by project"
                className="h-10 w-full bg-transparent px-3 text-sm outline-none"
              />
            </div>

            <div className="flex items-center gap-2 text-sm">
              <Filter className="h-4 w-4 text-zinc-400" />

              <Button
                size="sm"
                variant={
                  status === "ALL"
                    ? "default"
                    : "outline"
                }
                onClick={() =>
                  setStatus("ALL")
                }
              >
                All
              </Button>

              <Button
                size="sm"
                variant={
                  status === "ACTIVE"
                    ? "default"
                    : "outline"
                }
                onClick={() =>
                  setStatus("ACTIVE")
                }
              >
                Active
              </Button>

              <Button
                size="sm"
                variant={
                  status === "COMPLETED"
                    ? "default"
                    : "outline"
                }
                onClick={() =>
                  setStatus("COMPLETED")
                }
              >
                Completed
              </Button>
            </div>
          </div>
        </div>

        {isLoading ? (
          <div className="p-10 text-center text-sm text-zinc-500">
            Loading transactions…
          </div>
        ) : filteredProjects.length ===
          0 ? (
          <div className="p-12 text-center">
            <CircleDollarSign className="mx-auto h-8 w-8 text-zinc-300" />

            <p className="mt-3 font-medium">
              No transactions found
            </p>

            <p className="mt-1 text-sm text-zinc-500">
              Funding activity will appear here
              as you hire and pay freelancers.
            </p>

            <Button
              className="mt-5"
              asChild
            >
              <Link to="/client/jobs/new">
                Post a job
              </Link>
            </Button>
          </div>
        ) : (
          <div className="divide-y">
            {filteredProjects.map(
              (project) => (
                <Link
                  key={project._id}
                  to={`/projects/${project._id}`}
                  className="flex flex-col gap-3 p-4 transition hover:bg-zinc-50 sm:flex-row sm:items-center sm:justify-between"
                >
                  <div className="flex min-w-0 items-center gap-3">
                    <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-zinc-100">
                      <ArrowDownLeft className="h-4 w-4" />
                    </div>

                    <div className="min-w-0">
                      <p className="truncate font-medium">
                        Project funding ·{" "}
                        {project.title}
                      </p>

                      <p className="mt-1 text-xs text-zinc-500">
                        {new Date(
                          project.createdAt,
                        ).toLocaleDateString()}{" "}
                        · {project.currency}
                      </p>
                    </div>
                  </div>

                  <div className="flex items-center justify-between gap-4 sm:justify-end">
                    <StatusBadge
                      status={project.status}
                    />

                    <p className="font-semibold">
                      -{project.currency}{" "}
                      {project.totalAmount.toLocaleString()}
                    </p>
                  </div>
                </Link>
              ),
            )}
          </div>
        )}
      </div>
    </div>
  );
}