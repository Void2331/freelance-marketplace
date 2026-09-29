import {
  ArrowUpRight,
  Search,
} from "lucide-react";

import {
  Link,
} from "react-router-dom";

import {
  useMemo,
  useState,
} from "react";

import {
  Input,
} from "@/components/ui/input";

import {
  Button,
} from "@/components/ui/button";

import {
  DashboardHeader,
} from "@/components/dashboard/dashboard-header";

import {
  StatusBadge,
} from "@/components/dashboard/status-badge";

import {
  useJobs,
} from "@/hooks/use-jobs";

export default function FreelancerJobsPage() {
  const [search, setSearch] =
    useState("");

  const [category, setCategory] =
    useState("");

  const {
    data: jobs = [],
    isLoading,
    isError,
  } = useJobs({
    category:
      category || undefined,
  });

  const filteredJobs =
    useMemo(() => {
      const term =
        search.trim().toLowerCase();

      if (!term) {
        return jobs;
      }

      return jobs.filter((job) =>
        [
          job.title,
          job.description,
          job.category,
          ...job.skills,
        ]
          .filter(Boolean)
          .some((value) =>
            value
              ?.toLowerCase()
              .includes(term),
          ),
      );
    }, [jobs, search]);

  return (
    <div className="p-4 sm:p-6 lg:p-8">
      <DashboardHeader
        title="Find Work"
        description="Discover projects that match your skills."
      />

      <div className="mb-6 grid gap-3 md:grid-cols-[1fr_220px]">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-zinc-400" />

          <Input
            value={search}
            onChange={(event) =>
              setSearch(
                event.target.value,
              )
            }
            placeholder="Search jobs..."
            className="pl-9"
          />
        </div>

        <Input
          value={category}
          onChange={(event) =>
            setCategory(
              event.target.value,
            )
          }
          placeholder="Filter by category"
        />
      </div>

      {isLoading ? (
        <div className="grid gap-4 lg:grid-cols-2">
          {[1, 2, 3, 4].map(
            (item) => (
              <div
                key={item}
                className="h-52 animate-pulse rounded-xl bg-zinc-100"
              />
            ),
          )}
        </div>
      ) : isError ? (
        <div className="rounded-xl border p-10 text-center">
          <h3 className="font-semibold">
            Unable to load jobs
          </h3>

          <p className="mt-1 text-sm text-zinc-500">
            Please try again later.
          </p>
        </div>
      ) : filteredJobs.length === 0 ? (
        <div className="rounded-xl border p-12 text-center">
          <Search className="mx-auto h-8 w-8 text-zinc-400" />

          <h3 className="mt-4 font-semibold">
            No matching jobs
          </h3>

          <p className="mt-1 text-sm text-zinc-500">
            Try changing your search or category.
          </p>
        </div>
      ) : (
        <div className="grid gap-4 lg:grid-cols-2">
          {filteredJobs.map(
            (job) => (
              <article
                key={job._id}
                className="rounded-xl border bg-white p-5 shadow-sm transition hover:border-zinc-400"
              >
                <div className="flex items-start justify-between gap-4">
                  <div>
                    <Link
                      to={`/freelancer/jobs/${job._id}`}
                      className="font-semibold hover:underline"
                    >
                      {job.title}
                    </Link>

                    <div className="mt-2">
                      <StatusBadge
                        status={job.status}
                      />
                    </div>
                  </div>

                  <ArrowUpRight className="h-4 w-4 text-zinc-400" />
                </div>

                <p className="mt-4 line-clamp-3 text-sm leading-6 text-zinc-500">
                  {job.description}
                </p>

                <div className="mt-4 flex flex-wrap gap-2">
                  {job.skills.map(
                    (skill) => (
                      <span
                        key={skill}
                        className="rounded-full bg-zinc-100 px-2.5 py-1 text-xs text-zinc-600"
                      >
                        {skill}
                      </span>
                    ),
                  )}
                </div>

                <div className="mt-5 flex items-center justify-between border-t pt-4">
                  <div>
                    <p className="font-semibold">
                      {job.currency}{" "}
                      {job.budget.toLocaleString()}
                    </p>

                    <p className="text-xs text-zinc-500">
                      {job.budgetType}
                    </p>
                  </div>

                  <Button
                    size="sm"
                    asChild
                  >
                    <Link
                      to={`/freelancer/jobs/${job._id}`}
                    >
                      View Job
                    </Link>
                  </Button>
                </div>
              </article>
            ),
          )}
        </div>
      )}
    </div>
  );
}