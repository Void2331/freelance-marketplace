import {
  ArrowUpRight,
  BriefcaseBusiness,
  Filter,
  Search,
} from "lucide-react";

import { Link } from "react-router-dom";
import { memo, useContext, useMemo, useState } from "react";

import {
  Pagination,
  PaginationContent,
  PaginationItem,
  PaginationNext,
  PaginationPrevious,
} from "@/components/ui/pagination";

import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";

import { DashboardHeader } from "@/components/dashboard/dashboard-header";
import { StatusBadge } from "@/components/dashboard/status-badge";
import { EmptyState } from "@/components/dashboard/empty-state";
import { SectionCard } from "@/components/dashboard/section-card";
import { StatCard } from "@/components/dashboard/stat-card";

import { useJobs } from "@/hooks/use-jobs";
import { PageContext } from "@/features/page/pageContext";

function FreelancerJobsPage() {
  const [search, setSearch] = useState("");
  const [category, setCategory] = useState("");

  const {
    currentPage,
    setCurrentPage,
  } = useContext(PageContext);

  const {
    data,
    isLoading,
    isError,
  } = useJobs({
    category: category || undefined,
    page: currentPage || 1,
  });

  const jobs = data?.data || [];
  const totalPages = data?.totalPages || 1;

  const filteredJobs = useMemo(() => {
    const term = search.trim().toLowerCase();

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
    <div className="min-w-0 p-4 sm:p-6 lg:p-8">
      <DashboardHeader
        title="Find Work"
        description="Discover projects that match your skills and build your freelance pipeline."
      />

      <div className="grid gap-4 sm:grid-cols-3">
        <StatCard
          title="Jobs on this page"
          value={
            isLoading
              ? "—"
              : filteredJobs.length
          }
          icon={BriefcaseBusiness}
          description="matching opportunities"
        />

        <StatCard
          title="Current page"
          value={currentPage || 1}
          icon={Search}
          description={`of ${totalPages} pages`}
        />

        <StatCard
          title="Search"
          value={search || "All jobs"}
          icon={Filter}
          description="current filter"
        />
      </div>

      <SectionCard
        title="Job marketplace"
        description="Search, filter and open opportunities that fit your skills"
        className="mt-6"
      >
        <div className="mb-5 grid gap-3 md:grid-cols-[1fr_220px]">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-zinc-400" />

            <Input
              value={search}
              onChange={(event) =>
                setSearch(event.target.value)
              }
              placeholder="Search jobs..."
              className="pl-9"
            />
          </div>

          <Input
            value={category}
            onChange={(event) =>
              setCategory(event.target.value)
            }
            placeholder="Filter by category"
          />
        </div>

        {isLoading ? (
          <div className="grid gap-4 lg:grid-cols-2">
            {[1, 2, 3, 4].map((item) => (
              <div
                key={item}
                className="h-52 animate-pulse rounded-xl bg-zinc-100"
              />
            ))}
          </div>
        ) : isError ? (
          <div className="rounded-xl border border-red-200 bg-red-50 p-6 text-sm text-red-700">
            Unable to load jobs. Please try again later.
          </div>
        ) : filteredJobs.length === 0 ? (
          <EmptyState
            icon={Search}
            title="No matching jobs"
            description="Try changing your search or category."
          />
        ) : (
          <div className="grid gap-4 lg:grid-cols-2">
            {filteredJobs.map((job) => (
              <article
                key={job._id}
                className="rounded-2xl border bg-white p-5 shadow-sm transition hover:border-zinc-400 hover:shadow-md"
              >
                <div className="flex items-start justify-between gap-4">
                  <div className="min-w-0">
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

                  <ArrowUpRight className="h-4 w-4 shrink-0 text-zinc-400" />
                </div>

                <p className="mt-4 line-clamp-3 text-sm leading-6 text-zinc-500">
                  {job.description}
                </p>

                <div className="mt-4 flex flex-wrap gap-2">
                  {job.skills
                    .slice(0, 6)
                    .map((skill) => (
                      <span
                        key={skill}
                        className="rounded-full bg-zinc-100 px-2.5 py-1 text-xs text-zinc-600"
                      >
                        {skill}
                      </span>
                    ))}
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
            ))}
          </div>
        )}

        <div className="mt-6 flex items-center justify-center">
          <Pagination>
            <PaginationContent>
              <PaginationItem>
                <PaginationPrevious
                  onClick={() => {
                    setCurrentPage((prev) =>
                      prev > 1
                        ? prev - 1
                        : 1,
                    );
                  }}
                />
              </PaginationItem>

              <PaginationItem>
                <span className="px-3 text-sm text-zinc-500">
                  Page {currentPage || 1} of{" "}
                  {totalPages}
                </span>
              </PaginationItem>

              <PaginationItem>
                <PaginationNext
                  onClick={() => {
                    setCurrentPage((prev) =>
                      prev >= totalPages
                        ? totalPages
                        : prev + 1,
                    );
                  }}
                />
              </PaginationItem>
            </PaginationContent>
          </Pagination>
        </div>
      </SectionCard>
    </div>
  );
}

export default memo(FreelancerJobsPage);