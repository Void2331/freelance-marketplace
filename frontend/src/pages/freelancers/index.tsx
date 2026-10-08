import { useState } from "react";
import { Link } from "react-router-dom";
import { Search, Star, UserRound } from "lucide-react";

import { TrustBadge } from "@/components/trust/trust-badge";
import { useFreelancers } from "@/hooks/use-users";

export default function FreelancerDirectory() {
  const [searchInput, setSearchInput] = useState("");
  const [search, setSearch] = useState("");

  const { data, isLoading, isError } = useFreelancers({
    search: search || undefined,
    limit: 24,
  });

  const freelancers = data?.freelancers ?? [];

  return (
    <div className="min-h-screen bg-zinc-50">
      <div className="mx-auto max-w-7xl px-4 py-10 sm:px-6 lg:px-8">
        <p className="text-sm font-semibold uppercase tracking-wider text-zinc-500">
          Talent
        </p>

        <h1 className="mt-2 text-3xl font-bold tracking-tight sm:text-4xl">
          Find freelancers
        </h1>

        <p className="mt-3 max-w-2xl text-zinc-600">
          Browse freelancers by name or skill.
        </p>

        <form
          className="mt-8 flex max-w-lg gap-2"
          onSubmit={(event) => {
            event.preventDefault();
            setSearch(searchInput.trim());
          }}
        >
          <div className="flex flex-1 items-center rounded-xl border bg-white px-4">
            <Search className="h-4 w-4 text-zinc-400" />

            <input
              className="h-11 w-full bg-transparent px-3 text-sm outline-none"
              placeholder="Search by name or skill"
              value={searchInput}
              onChange={(event) => setSearchInput(event.target.value)}
            />
          </div>
        </form>

        {isLoading ? (
          <div className="mt-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {[1, 2, 3, 4, 5, 6].map((item) => (
              <div
                key={item}
                className="h-40 animate-pulse rounded-2xl bg-white"
              />
            ))}
          </div>
        ) : isError ? (
          <div className="mt-8 rounded-2xl border bg-white p-10 text-center text-sm text-zinc-500">
            Unable to load freelancers right now.
          </div>
        ) : freelancers.length === 0 ? (
          <div className="mt-8 rounded-2xl border bg-white p-10 text-center text-sm text-zinc-500">
            No freelancers match your search.
          </div>
        ) : (
          <div className="mt-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {freelancers.map((freelancer) => (
              <Link
                key={freelancer._id}
                to={`/freelancers/${freelancer._id}`}
                className="rounded-2xl border bg-white p-5 shadow-sm transition hover:shadow-md"
              >
                <div className="flex items-center gap-3">
                  <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-full bg-zinc-900 text-lg font-semibold text-white">
                    {freelancer.name?.charAt(0).toUpperCase() ?? (
                      <UserRound className="h-5 w-5" />
                    )}
                  </div>

                  <div className="min-w-0">
                    <h3 className="truncate font-semibold">
                      {freelancer.name}
                    </h3>

                    {freelancer.location && (
                      <p className="truncate text-xs text-zinc-500">
                        {freelancer.location}
                      </p>
                    )}
                  </div>
                </div>

                <div className="mt-3">
                  <TrustBadge trust={freelancer.trust} />
                </div>

                {freelancer.bio && (
                  <p className="mt-3 line-clamp-2 text-sm text-zinc-600">
                    {freelancer.bio}
                  </p>
                )}

                {freelancer.skills && freelancer.skills.length > 0 && (
                  <div className="mt-3 flex flex-wrap gap-1.5">
                    {freelancer.skills.slice(0, 3).map((skill) => (
                      <span
                        key={skill}
                        className="rounded-full bg-zinc-100 px-2.5 py-1 text-xs"
                      >
                        {skill}
                      </span>
                    ))}
                  </div>
                )}

                <div className="mt-4 flex items-center justify-between text-sm">
                  <span className="flex items-center gap-1 text-zinc-600">
                    <Star className="h-3.5 w-3.5 fill-yellow-400 text-yellow-400" />
                    {(freelancer.averageRating ?? 0).toFixed(1)}
                    <span className="text-zinc-400">
                      ({freelancer.reviewCount ?? 0})
                    </span>
                  </span>

                  {typeof freelancer.hourlyRate === "number" && (
                    <span className="font-semibold">
                      ₦{freelancer.hourlyRate.toLocaleString()}/hr
                    </span>
                  )}
                </div>
              </Link>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}