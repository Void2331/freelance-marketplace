import {
  ArrowRight,
  ArrowUpRight,
  CheckCircle2,
  Search,
  ShieldCheck,
  Sparkles,
  Users,
} from "lucide-react";

import { Link, useNavigate } from "react-router-dom";
import { useEffect, useState } from "react";

import { Button } from "@/components/ui/button";
import { useSearchContext } from "@/features/search/searchContext";
import { StatusBadge } from "@/components/dashboard/status-badge";

import type { Job } from "@/types/job";

const categories = [
  "Web Development",
  "UI/UX Design",
  "Mobile Development",
  "Data & Analytics",
  "Writing & Content",
  "Marketing",
  "Video & Animation",
  "Customer Support",
];

const benefits = [
  {
    icon: Users,
    title: "Access skilled talent",
    description:
      "Find freelancers with the skills and experience your project requires.",
  },
  {
    icon: ShieldCheck,
    title: "Work with confidence",
    description:
      "Manage projects, milestones, payments and communication through one platform.",
  },
  {
    icon: CheckCircle2,
    title: "Track project progress",
    description:
      "Keep proposals, contracts, milestones and deliverables organized from start to finish.",
  },
];

const BASE_URL = `${import.meta.env.VITE_API_URL}/jobs?limit=2`;

const options: RequestInit = {
  method: "GET",
  headers: {
    "Content-Type": "application/json",
  },
};

export default function Home() {
  const [jobData, setJobData] = useState<Job[]>([]);
  const [heroMode, setHeroMode] = useState<"hire" | "work">("hire");

  const navigate = useNavigate();

  const { setSearchTerm, searchTerm } = useSearchContext();

  useEffect(() => {
    async function getData() {
      try {
        const response = await fetch(BASE_URL, options);

        if (!response.ok) {
          throw new Error("Error getting jobs");
        }

        const data = await response.json();

        /*
         * The API may return:
         *
         * { success: true, data: [...] }
         *
         * or:
         *
         * { success: true, data: { jobs: [...] } }
         *
         * This handles both formats.
         */
        const jobs = Array.isArray(data?.data)
          ? data.data
          : Array.isArray(data?.data?.jobs)
            ? data.data.jobs
            : [];

        setJobData(jobs);
      } catch (err) {
        console.error(
          err instanceof Error ? err.message : err,
        );

        setJobData([]);
      }
    }

    getData();
  }, []);

  const handleSearch = () => {
    const trimmedSearch = searchTerm.trim();

    if (!trimmedSearch) {
      return;
    }

    navigate("/jobs");
  };

  const handleSearchKeyDown = (
    event: React.KeyboardEvent<HTMLInputElement>,
  ) => {
    if (event.key === "Enter") {
      handleSearch();
    }
  };

  return (
    <div className="bg-white text-zinc-950">
      {/* =====================================================
          HERO
      ====================================================== */}
      <section className="relative min-h-[720px] overflow-hidden text-white">
        {/* Background video */}
        <video
          autoPlay
          muted
          loop
          playsInline
          preload="metadata"
          className="absolute inset-0 h-full w-full object-cover"
        >
          <source
            src="/videos/freelance-hero.mp4"
            type="video/mp4"
          />

          Your browser does not support the video tag.
        </video>

        {/* Dark overlay */}
        <div className="absolute inset-0 bg-black/55" />

        {/* Directional gradient */}
        <div className="absolute inset-0 bg-gradient-to-r from-black/80 via-black/55 to-black/30" />

        {/* Bottom fade */}
        <div className="absolute inset-x-0 bottom-0 h-40 bg-gradient-to-t from-black/30 to-transparent" />

        {/* Hero content */}
        <div className="relative z-10 mx-auto flex min-h-[720px] max-w-7xl items-center px-4 py-24 sm:px-6 lg:px-8">
          <div className="w-full max-w-4xl">
            {/* Eyebrow */}
            <div className="mb-6 inline-flex items-center gap-2 rounded-full border border-white/20 bg-white/10 px-4 py-2 text-sm font-medium text-white shadow-lg backdrop-blur-md">
              <Sparkles className="h-4 w-4" />
              The smarter way to freelance
            </div>

            {/* Heading */}
            <h1 className="max-w-4xl text-5xl font-bold tracking-tight sm:text-6xl lg:text-7xl">
              Find the right talent.
              <br />
              <span className="text-white/80">
                Get great work done.
              </span>
            </h1>

            {/* Description */}
            <p className="mt-6 max-w-2xl text-lg leading-8 text-white/80 sm:text-xl">
              Connect with skilled freelancers, discover
              meaningful projects, and manage everything from
              proposals to milestones in one place.
            </p>

            {/* Hire / Work switch */}
            <div className="mt-8 inline-flex rounded-full border border-white/20 bg-black/30 p-1.5 backdrop-blur-md">
              <button
                type="button"
                onClick={() => setHeroMode("hire")}
                className={`rounded-full px-5 py-2.5 text-sm font-semibold transition ${
                  heroMode === "hire"
                    ? "bg-white text-zinc-950 shadow"
                    : "text-white/80 hover:text-white"
                }`}
              >
                I want to hire
              </button>

              <button
                type="button"
                onClick={() => setHeroMode("work")}
                className={`rounded-full px-5 py-2.5 text-sm font-semibold transition ${
                  heroMode === "work"
                    ? "bg-white text-zinc-950 shadow"
                    : "text-white/80 hover:text-white"
                }`}
              >
                I want to work
              </button>
            </div>

            {/* Action buttons */}
            <div className="mt-6 flex flex-wrap gap-3">
              {heroMode === "hire" ? (
                <>
                  <Button
                    asChild
                    size="lg"
                    className="h-12 rounded-full bg-white px-7 text-zinc-950 shadow-lg hover:bg-zinc-100"
                  >
                    <Link to="/register">
                      Post a project
                      <ArrowRight className="ml-2 h-4 w-4" />
                    </Link>
                  </Button>

                  <Button
                    asChild
                    size="lg"
                    variant="outline"
                    className="h-12 rounded-full border-white/30 bg-white/10 px-7 text-white backdrop-blur-sm hover:bg-white/20 hover:text-white"
                  >
                    <Link to="/jobs">
                      Browse freelancers
                    </Link>
                  </Button>
                </>
              ) : (
                <>
                  <Button
                    asChild
                    size="lg"
                    className="h-12 rounded-full bg-white px-7 text-zinc-950 shadow-lg hover:bg-zinc-100"
                  >
                    <Link to="/jobs">
                      Find work
                      <ArrowRight className="ml-2 h-4 w-4" />
                    </Link>
                  </Button>

                  <Button
                    asChild
                    size="lg"
                    variant="outline"
                    className="h-12 rounded-full border-white/30 bg-white/10 px-7 text-white backdrop-blur-sm hover:bg-white/20 hover:text-white"
                  >
                    <Link to="/register">
                      Create your profile
                    </Link>
                  </Button>
                </>
              )}
            </div>

            {/* Search */}
            <div className="mt-10 max-w-3xl rounded-2xl border border-white/20 bg-white p-2 shadow-2xl">
              <div className="flex flex-col gap-2 sm:flex-row">
                <div className="flex flex-1 items-center px-4">
                  <Search className="h-5 w-5 shrink-0 text-zinc-400" />

                  <input
                    value={searchTerm}
                    placeholder={
                      heroMode === "hire"
                        ? "Search for freelancers, skills or services"
                        : "Search for jobs, skills or projects"
                    }
                    className="h-12 w-full bg-transparent px-3 text-sm text-zinc-950 outline-none placeholder:text-zinc-500"
                    onChange={(event) =>
                      setSearchTerm(event.target.value)
                    }
                    onKeyDown={handleSearchKeyDown}
                  />
                </div>

                <Button
                  type="button"
                  size="lg"
                  className="h-12 rounded-xl px-8"
                  disabled={!searchTerm.trim()}
                  onClick={handleSearch}
                >
                  Search
                </Button>
              </div>
            </div>

            {/* Popular searches */}
            <div className="mt-5 flex flex-wrap items-center gap-2 text-sm">
              <span className="mr-1 text-white/60">
                Popular:
              </span>

              {[
                "Web Development",
                "UI/UX Design",
                "Mobile Development",
                "Marketing",
              ].map((category) => (
                <Link
                  key={category}
                  to="/jobs"
                  className="rounded-full border border-white/20 bg-white/5 px-3 py-1.5 text-white/80 backdrop-blur-sm transition hover:bg-white/15 hover:text-white"
                >
                  {category}
                </Link>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* =====================================================
          JOBS / CATEGORIES
      ====================================================== */}
      <section className="bg-white py-20 sm:py-24">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="max-w-3xl">
            <p className="text-sm font-semibold uppercase tracking-wider text-zinc-500">
              Opportunities
            </p>

            <h2 className="mt-3 text-3xl font-bold tracking-tight sm:text-4xl">
              Find your next opportunity.
            </h2>

            <p className="mt-4 text-lg leading-8 text-zinc-600">
              Explore the latest projects posted by clients
              looking for talented freelancers.
            </p>
          </div>

          {/* Categories */}
          <div className="mt-8 flex flex-wrap gap-3">
            {categories.map((category) => (
              <Link
                key={category}
                to="/jobs"
                className="rounded-full border border-zinc-200 bg-white px-4 py-2 text-sm font-medium text-zinc-700 transition hover:border-zinc-950 hover:bg-zinc-950 hover:text-white"
              >
                {category}
              </Link>
            ))}
          </div>

          {/* Job cards */}
          {jobData.length > 0 ? (
            <div className="mt-10 grid gap-5 lg:grid-cols-2">
              {jobData.map((job) => (
                <article
                  key={job._id}
                  className="group rounded-2xl border border-zinc-200 bg-white p-6 shadow-sm transition duration-300 hover:-translate-y-1 hover:border-zinc-300 hover:shadow-lg"
                >
                  <div className="flex items-start justify-between gap-4">
                    <div className="min-w-0">
                      <Link
                        to={`/freelancer/jobs/${job._id}`}
                        className="text-lg font-semibold tracking-tight transition group-hover:text-zinc-600 hover:underline"
                      >
                        {job.title}
                      </Link>

                      <div className="mt-3">
                        <StatusBadge status={job.status} />
                      </div>
                    </div>

                    <ArrowUpRight className="h-5 w-5 shrink-0 text-zinc-400 transition group-hover:text-zinc-950" />
                  </div>

                  <p className="mt-5 line-clamp-3 text-sm leading-6 text-zinc-500">
                    {job.description}
                  </p>

                  {/* Skills */}
                  <div className="mt-5 flex flex-wrap gap-2">
                    {job.skills?.map((skill) => (
                      <span
                        key={skill}
                        className="rounded-full bg-zinc-100 px-3 py-1.5 text-xs font-medium text-zinc-600"
                      >
                        {skill}
                      </span>
                    ))}
                  </div>

                  {/* Budget */}
                  <div className="mt-6 flex items-center justify-between border-t border-zinc-100 pt-5">
                    <div>
                      <p className="text-lg font-semibold">
                        {job.currency}{" "}
                        {job.budget.toLocaleString()}
                      </p>

                      <p className="mt-1 text-xs text-zinc-500">
                        {job.budgetType}
                      </p>
                    </div>

                    <Button
                      size="sm"
                      asChild
                      className="rounded-full"
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
          ) : (
            <div className="mt-10 rounded-2xl border border-dashed border-zinc-300 p-10 text-center">
              <p className="font-medium text-zinc-700">
                No jobs available right now.
              </p>

              <p className="mt-2 text-sm text-zinc-500">
                Check back soon for new opportunities.
              </p>
            </div>
          )}

          {/* View all */}
          <div className="mt-8">
            <Button
              asChild
              size="lg"
              className="rounded-full"
            >
              <Link to="/jobs">
                View all opportunities
                <ArrowRight className="ml-2 h-4 w-4" />
              </Link>
            </Button>
          </div>
        </div>
      </section>

      {/* =====================================================
          PLATFORM FEATURES
      ====================================================== */}
      <section className="bg-zinc-950 py-20 text-white sm:py-24">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="grid gap-12 lg:grid-cols-2 lg:items-center">
            <div>
              <p className="text-sm font-semibold uppercase tracking-wider text-zinc-400">
                Built for real projects
              </p>

              <h2 className="mt-3 text-3xl font-bold tracking-tight sm:text-4xl">
                From the first proposal to the final payment.
              </h2>

              <p className="mt-5 max-w-xl text-lg leading-8 text-zinc-400">
                Keep every part of your freelance project
                organized. Communicate with your team, manage
                milestones, track progress and handle payments
                from one place.
              </p>

              <div className="mt-8">
                <Button
                  asChild
                  size="lg"
                  className="rounded-full bg-white text-zinc-950 hover:bg-zinc-100"
                >
                  <Link to="/register">
                    Get started
                    <ArrowRight className="ml-2 h-4 w-4" />
                  </Link>
                </Button>
              </div>
            </div>

            <div className="grid gap-4 sm:grid-cols-2">
              {/* Secure payments */}
              <div className="rounded-2xl border border-white/10 bg-white/5 p-6 backdrop-blur-sm">
                <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-white/10">
                  <ShieldCheck className="h-5 w-5" />
                </div>

                <h3 className="mt-5 font-semibold">
                  Secure payments
                </h3>

                <p className="mt-2 text-sm leading-6 text-zinc-400">
                  Keep project payments organized and connected
                  to project milestones.
                </p>
              </div>

              {/* Milestones */}
              <div className="rounded-2xl border border-white/10 bg-white/5 p-6 backdrop-blur-sm">
                <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-white/10">
                  <CheckCircle2 className="h-5 w-5" />
                </div>

                <h3 className="mt-5 font-semibold">
                  Milestone tracking
                </h3>

                <p className="mt-2 text-sm leading-6 text-zinc-400">
                  Track submissions, approvals and project
                  progress from one workroom.
                </p>
              </div>

              {/* Communication */}
              <div className="rounded-2xl border border-white/10 bg-white/5 p-6 backdrop-blur-sm">
                <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-white/10">
                  <Users className="h-5 w-5" />
                </div>

                <h3 className="mt-5 font-semibold">
                  Direct collaboration
                </h3>

                <p className="mt-2 text-sm leading-6 text-zinc-400">
                  Keep conversations and project communication
                  connected to your work.
                </p>
              </div>

              {/* Freelancer experience */}
              <div className="rounded-2xl border border-white/10 bg-white/5 p-6 backdrop-blur-sm">
                <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-white/10">
                  <Sparkles className="h-5 w-5" />
                </div>

                <h3 className="mt-5 font-semibold">
                  Built for freelancers
                </h3>

                <p className="mt-2 text-sm leading-6 text-zinc-400">
                  Find opportunities, submit proposals and
                  manage your freelance work in one place.
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* =====================================================
          BENEFITS
      ====================================================== */}
      <section className="bg-white py-20 sm:py-28">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="max-w-2xl">
            <p className="text-sm font-semibold uppercase tracking-wider text-zinc-500">
              One platform
            </p>

            <h2 className="mt-3 text-3xl font-bold tracking-tight sm:text-4xl">
              Everything you need to move projects forward.
            </h2>

            <p className="mt-4 text-lg leading-8 text-zinc-600">
              From the first proposal to the final milestone,
              keep your freelance projects organized.
            </p>
          </div>

          <div className="mt-12 grid gap-6 md:grid-cols-3">
            {benefits.map((benefit) => {
              const Icon = benefit.icon;

              return (
                <div
                  key={benefit.title}
                  className="rounded-2xl border border-zinc-200 bg-white p-7 shadow-sm transition hover:-translate-y-1 hover:shadow-md"
                >
                  <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-zinc-100">
                    <Icon className="h-5 w-5" />
                  </div>

                  <h3 className="mt-6 text-lg font-semibold">
                    {benefit.title}
                  </h3>

                  <p className="mt-3 text-sm leading-6 text-zinc-600">
                    {benefit.description}
                  </p>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* =====================================================
          FINAL CTA
      ====================================================== */}
      <section className="bg-zinc-50 py-20 sm:py-24">
        <div className="mx-auto max-w-4xl px-4 text-center sm:px-6 lg:px-8">
          <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-zinc-950 text-white">
            <Sparkles className="h-5 w-5" />
          </div>

          <h2 className="mt-6 text-3xl font-bold tracking-tight sm:text-4xl">
            Ready to start your next project?
          </h2>

          <p className="mx-auto mt-4 max-w-2xl text-lg leading-8 text-zinc-600">
            Create an account and start connecting with
            clients or freelancers today.
          </p>

          <div className="mt-8 flex flex-col justify-center gap-3 sm:flex-row">
            <Button
              asChild
              size="lg"
              className="rounded-full px-7"
            >
              <Link to="/register">
                Get started
                <ArrowRight className="ml-2 h-4 w-4" />
              </Link>
            </Button>

            <Button
              asChild
              size="lg"
              variant="outline"
              className="rounded-full px-7"
            >
              <Link to="/jobs">
                Explore jobs
              </Link>
            </Button>
          </div>
        </div>
      </section>
    </div>
  );
}