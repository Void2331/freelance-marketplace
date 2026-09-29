import {
  ArrowUpRight,
  Clock3,
  DollarSign,
  MapPin,
} from "lucide-react";
import { Link } from "react-router-dom";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";

import type { Job } from "@/types/job";

interface JobCardProps {
  job: Job;
}

export default function JobCard({
  job,
}: JobCardProps) {
  const clientName =
    typeof job.client === "string"
      ? "Client"
      : job.client.name;

  return (
    <article className="group rounded-2xl border bg-white p-6 transition hover:-translate-y-0.5 hover:border-zinc-300 hover:shadow-lg">
      <div className="flex items-start justify-between gap-4">
        <div>
          <Badge variant="secondary">
            {job.status}
          </Badge>

          <Link
            to={`/jobs/${job._id}`}
            className="mt-4 block"
          >
            <h2 className="text-xl font-semibold tracking-tight group-hover:underline">
              {job.title}
            </h2>
          </Link>
        </div>

        <Button
          variant="ghost"
          size="icon"
          asChild
        >
          <Link to={`/jobs/${job._id}`}>
            <ArrowUpRight className="h-5 w-5" />
          </Link>
        </Button>
      </div>

      <p className="mt-4 line-clamp-3 text-sm leading-6 text-zinc-600">
        {job.description}
      </p>

      <div className="mt-6 grid gap-3 border-t pt-5 sm:grid-cols-3">
        <div className="flex items-center gap-2 text-sm text-zinc-600">
          <DollarSign className="h-4 w-4" />
          <span>₦{job.budget.toLocaleString()}</span>
        </div>

        <div className="flex items-center gap-2 text-sm text-zinc-600">
          <Clock3 className="h-4 w-4" />
          <span>Fixed price</span>
        </div>

        <div className="flex items-center gap-2 text-sm text-zinc-600">
          <MapPin className="h-4 w-4" />
          <span>{clientName}</span>
        </div>
      </div>
    </article>
  );
}