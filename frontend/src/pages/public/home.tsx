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

import { Button } from "@/components/ui/button";
import { useContext, useEffect, useRef, useState } from "react";
import { SearchContextProvider } from "@/features/search/searchContext";
import { StatusBadge } from "@/components/dashboard/status-badge";

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
      "Manage projects, milestones and payments through one platform.",
  },
  {
    icon: CheckCircle2,
    title: "Track project progress",
    description:
      "Keep proposals, contracts, milestones and deliverables organized.",
  },
];

const BASE_URL = import.meta.env.VITE_API_URL + '/jobs?limit=2';
const options = {
  method: "GET",
  headers: {
    'Content-Type': "application/json"
  }
}

export default function Home() {
  const [jobData,setJobData] = useState([])
  const navigate = useNavigate();
  const inputRef = useRef<HTMLInputElement>(null)
  const {setSearchTerm, searchTerm} = useContext(SearchContextProvider)


  
  useEffect(()=>{
    (async function getData() {
      try {
        const response = await fetch(BASE_URL,options)
        if(!response.ok) throw new Error('Error getting data')
        
        const data = await response.json()

        setJobData(data.data)
      } catch (err) {
        console.log(err.message)
      }

    }())
  },[])

  return (
    <div>
      {/* Hero */}
      <section className="relative overflow-hidden bg-zinc-950 text-white">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_right,rgba(255,255,255,0.12),transparent_35%)]" />

        <div className="relative mx-auto max-w-7xl px-4 py-20 sm:px-6 md:py-28 lg:px-8">
          <div className="max-w-4xl">
            <div className="mb-6 inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/5 px-4 py-2 text-sm text-zinc-300">
              <Sparkles className="h-4 w-4" />
              A better way to freelance
            </div>

            <h1 className="max-w-4xl text-4xl font-bold tracking-tight sm:text-6xl lg:text-7xl">
              Build great work with the right people.
            </h1>

            <p className="mt-6 max-w-2xl text-lg leading-8 text-zinc-300 sm:text-xl">
              Hire talented freelancers, discover meaningful
              projects, and manage everything from proposals to
              milestone completion in one place.
            </p>

            <div className="mt-10 flex flex-col gap-3 sm:flex-row">
              <Button
                asChild
                size="lg"
                className="h-12 px-7"
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
                className="h-12 border-white/20 bg-transparent px-7 text-white hover:bg-white/10 hover:text-white"
              >
                <Link to="/register">Post a project</Link>
              </Button>
            </div>
          </div>

          {/* Search */}
          <div className="mt-14 max-w-3xl rounded-2xl border border-white/10 bg-white p-2 shadow-2xl">
            <div className="flex flex-col gap-2 sm:flex-row">
              <div className="flex flex-1 items-center px-4">
                <Search className="h-5 w-5 text-zinc-400" />

                <input
                  placeholder="Search for jobs, skills or services"
                  className="h-12 w-full bg-transparent px-3 text-sm text-zinc-950 outline-none placeholder:text-zinc-500"
                  ref={inputRef}
                  onChange={(e) => setSearchTerm(e.target.value) }
                />
              </div>

              <Button
                size="lg"
                className="h-12 px-8"
                onClick={() => { 
                  if(searchTerm === '') {
                    // console.log(inputRef.current!.value + ' ' + 'needs not be empty')
                    return
                  }else {
                    // navigate('/jobs')
                    console.log(searchTerm)
                    inputRef.current!.value = ''
                    setSearchTerm('')
                  }
                }}
              >
                 Search
              </Button>
            </div>
          </div>
        </div>
      </section>

      {/* Categories */}
      <section className="border-b">
        <div className="mx-auto max-w-7xl px-4 py-10 sm:px-6 lg:px-8">
          <div className="max-w-2xl mb-4">
            <p className="text-sm font-semibold uppercase tracking-wider text-zinc-500">
              Top Jobs
            </p>

            <h2 className="mt-3 text-3xl font-bold tracking-tight sm:text-4xl">
              Get the Latest Job Posting around the Globe.
            </h2>
          </div>
          <div className="flex flex-wrap gap-3 mb-6">
            {categories.map((category) => (
              <Link
                key={category}
                to="/jobs"
                className="rounded-full border px-4 py-2 text-sm font-medium text-zinc-700 transition hover:border-zinc-950 hover:text-zinc-950"
              >
                {category}
              </Link>
            ))}
          </div>
          <div className="grid gap-4 lg:grid-cols-2">
          {jobData?.map((job) => (
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
          <div className="mt-8">
            <Button asChild size="lg">
              <Link to="/jobs">
                View More
                <ArrowRight className="ml-2 h-4 w-4" />
              </Link>
            </Button>
          </div>
        </div>
      </section>


      {/* Benefits */}
      <section className="py-20 sm:py-28">
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
                  className="rounded-2xl border p-7"
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

      {/* CTA */}
      <section className="border-t bg-zinc-50 py-20">
        <div className="mx-auto max-w-4xl px-4 text-center sm:px-6 lg:px-8">
          <h2 className="text-3xl font-bold tracking-tight sm:text-4xl">
            Ready to start your next project?
          </h2>

          <p className="mx-auto mt-4 max-w-2xl text-zinc-600">
            Create an account and start connecting with clients
            or freelancers today.
          </p>

          <div className="mt-8">
            <Button asChild size="lg">
              <Link to="/register">
                Get started
                <ArrowRight className="ml-2 h-4 w-4" />
              </Link>
            </Button>
          </div>
        </div>
      </section>
    </div>
  );
}