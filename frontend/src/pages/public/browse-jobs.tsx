import { useMemo, useState } from "react";
import { Filter, Search } from "lucide-react";

import { Button } from "@/components/ui/button";
import JobCard from "@/components/jobs/job-card";

import { useJobs } from "@/hooks/use-jobs";

import type { BudgetType } from "@/types/job";

type SortOption = "recent" | "highest" | "lowest";

export default function BrowseJobs() {
  const [searchInput, setSearchInput] = useState("");
  const [query, setQuery] = useState("");
  const [budgetTypes, setBudgetTypes] = useState<BudgetType[]>([]);
  const [category, setCategory] = useState("");
  const [sort, setSort] = useState<SortOption>("recent");

  // Unfiltered, just to build the category dropdown — it shouldn't
  // shrink to only the currently-selected category.
  const { data: allOpenJobs = [] } = useJobs();

  const categories = useMemo(() => {
    const distinct = new Set(
      allOpenJobs.map((job) => job.category).filter((value): value is string => Boolean(value)),
    );
    return Array.from(distinct).sort();
  }, [allOpenJobs]);

  // The actual result set — category filtering happens server-side.
  const {
    data: jobs = [],
    isLoading,
    isError,
  } = useJobs({ category: category || undefined });

  function toggleBudgetType(type: BudgetType) {
    setBudgetTypes((current) =>
      current.includes(type)
        ? current.filter((item) => item !== type)
        : [...current, type],
    );
  }

  const visibleJobs = useMemo(() => {
    const term = query.trim().toLowerCase();

    const filtered = jobs.filter((job) => {
      if (budgetTypes.length > 0 && !budgetTypes.includes(job.budgetType)) {
        return false;
      }

      if (!term) return true;

      return (
        job.title.toLowerCase().includes(term) ||
        job.description.toLowerCase().includes(term) ||
        job.skills.some((skill) => skill.toLowerCase().includes(term))
      );
    });

    return filtered.sort((a, b) => {
      if (sort === "highest") return b.budget - a.budget;
      if (sort === "lowest") return a.budget - b.budget;
      return (
        new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
      );
    });
  }, [jobs, query, budgetTypes, sort]);

  return (
    <div className="min-h-screen bg-zinc-50">
      <div className="mx-auto max-w-7xl px-4 py-10 sm:px-6 lg:px-8">
        {/* Header */}
        <div>
          <p className="text-sm font-semibold uppercase tracking-wider text-zinc-500">
            Marketplace
          </p>

          <h1 className="mt-2 text-3xl font-bold tracking-tight sm:text-4xl">
            Find your next opportunity
          </h1>

          <p className="mt-3 max-w-2xl text-zinc-600">
            Discover projects that match your skills and experience.
          </p>
        </div>

        {/* Search */}
        <form
          className="mt-8 rounded-2xl border bg-white p-3 shadow-sm"
          onSubmit={(event) => {
            event.preventDefault();
            setQuery(searchInput);
          }}
        >
          <div className="flex flex-col gap-3 md:flex-row">
            <div className="flex flex-1 items-center rounded-xl bg-zinc-50 px-4">
              <Search className="h-5 w-5 text-zinc-400" />

              <input
                className="h-12 w-full bg-transparent px-3 text-sm outline-none"
                placeholder="Search jobs by title, skill or keyword"
                value={searchInput}
                onChange={(event) => setSearchInput(event.target.value)}
              />
            </div>

            <Button type="submit" className="h-12 px-8">
              Search
            </Button>
          </div>
        </form>

        <div className="mt-8 grid gap-8 lg:grid-cols-[240px_1fr]">
          {/* Filters */}
          <aside className="hidden lg:block">
            <div className="rounded-2xl border bg-white p-5">
              <div className="flex items-center gap-2">
                <Filter className="h-4 w-4" />
                <h2 className="font-semibold">Filters</h2>
              </div>

              <div className="mt-6">
                <p className="text-sm font-medium">Category</p>

                <select
                  className="mt-3 h-9 w-full rounded-lg border border-input bg-transparent px-2.5 text-sm"
                  value={category}
                  onChange={(event) => setCategory(event.target.value)}
                >
                  <option value="">All categories</option>
                  {categories.map((item) => (
                    <option key={item} value={item}>
                      {item}
                    </option>
                  ))}
                </select>
              </div>

              <div className="mt-6 border-t pt-6">
                <p className="text-sm font-medium">Job type</p>

                <div className="mt-3 space-y-2 text-sm text-zinc-600">
                  <label className="flex gap-2">
                    <input
                      type="checkbox"
                      checked={budgetTypes.includes("FIXED")}
                      onChange={() => toggleBudgetType("FIXED")}
                    />
                    Fixed price
                  </label>

                  <label className="flex gap-2">
                    <input
                      type="checkbox"
                      checked={budgetTypes.includes("HOURLY")}
                      onChange={() => toggleBudgetType("HOURLY")}
                    />
                    Hourly
                  </label>
                </div>
              </div>
            </div>
          </aside>

          {/* Jobs */}
          <section>
            <div className="mb-4 flex items-center justify-between">
              <p className="text-sm text-zinc-600">
                {isLoading
                  ? "Loading jobs..."
                  : `${visibleJobs.length} job${visibleJobs.length === 1 ? "" : "s"} found`}
              </p>

              <select
                className="rounded-lg border bg-white px-3 py-2 text-sm"
                value={sort}
                onChange={(event) => setSort(event.target.value as SortOption)}
              >
                <option value="recent">Most recent</option>
                <option value="highest">Highest budget</option>
                <option value="lowest">Lowest budget</option>
              </select>
            </div>

            {isLoading ? (
              <div className="space-y-4">
                {[1, 2, 3].map((item) => (
                  <div
                    key={item}
                    className="h-40 animate-pulse rounded-2xl bg-zinc-100"
                  />
                ))}
              </div>
            ) : isError ? (
              <div className="rounded-2xl border bg-white p-10 text-center text-sm text-zinc-500">
                Unable to load jobs right now. Please try again.
              </div>
            ) : visibleJobs.length === 0 ? (
              <div className="rounded-2xl border bg-white p-10 text-center text-sm text-zinc-500">
                No jobs match your search.
              </div>
            ) : (
              <div className="space-y-4">
                {visibleJobs.map((job) => (
                  <JobCard key={job._id} job={job} />
                ))}
              </div>
            )}
          </section>
        </div>
      </div>
    </div>
  );
}
